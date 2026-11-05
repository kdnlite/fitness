  /* ==== KDN NATIVE APP START ====
     Runs only inside the Android app (Capacitor). On the website NATIVE is false and nothing here runs. */
  var NP = NATIVE ? (window.Capacitor.Plugins || {}) : {};
  var nNotif = 'ask', nSyncT = null;
  function nHash(s){ var h = 2166136261; s = String(s); for(var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619); } return (h>>>0) % 2000000000 + 1000; }
  function nPermRead(r){ var d = r && (r.display||r.receive); nNotif = d==='granted' ? 'on' : d==='denied' ? 'blocked' : 'ask'; return nNotif; }

  /* Medicine and period reminders as phone notifications: they ring even when KDN is closed. */
  function nSync(){ clearTimeout(nSyncT); nSyncT = setTimeout(nSyncNow,700); }
  function nSyncNow(){
    var LN = NP.LocalNotifications; if(!LN) return;
    LN.getPending().then(function(p){
      /* snoozed doses stay; everything else is rebuilt from the current medicines */
      var old = ((p && p.notifications)||[]).filter(function(n){ return n.extra && n.extra.kdn && n.extra.kdn!=='snz'; }).map(function(n){ return {id:n.id}; });
      return old.length ? LN.cancel({notifications:old}) : null;
    }).then(function(){
      if(nNotif!=='on') return null;
      var list = (typeof eNotifList==='function' && S) ? eNotifList() : [];
      if(typeof healthOn!=='function' || !healthOn()) return list.length ? LN.schedule({notifications:list.slice(0,400)}) : null;
      var D = hLoad(), today = todayKey();
      hPeople().forEach(function(P){
        var p = D.ppl[P.id]; if(!p) return;
        (HMED ? (p.meds||[]) : []).forEach(function(m){
          if(m.paused || (m.end && m.end<today) || (m.start && m.start>today)) return;
          (m.times||[]).forEach(function(t){
            var hm = t.split(':'), hr = +hm[0], mi = +hm[1];
            var days = Array.isArray(m.days) && m.days.length && m.days.length<7 ? m.days : [null];
            days.forEach(function(wd){
              var on = {hour:hr,minute:mi}; if(wd!==null) on.weekday = wd+1;
              list.push({id:nHash(P.id+'|'+m.id+'|'+t+'|'+wd),title:'Time for '+m.name+(m.dose?' '+m.dose:''),
                body:[HFOOD[m.food]||'',m.form||'',P.me?'':'for '+P.name].filter(Boolean).join(' · '),
                schedule:{on:on,allowWhileIdle:true},smallIcon:'ic_stat_kdn',iconColor:'#E9C05A',actionTypeId:'KDN_MED',
                extra:{kdn:'med',p:P.id,k:m.id+'@'+t}});
            });
          });
        });
        if(P.gender==='female' && p.cyc && p.cyc.periods && p.cyc.periods.length){
          var r = hCyc(hP(P.id).cyc);
          if(!r.none && !r.onPeriod && r.late===0){
            var at = new Date(hAdd(r.next,-2)+'T09:00:00');
            if(at.getTime() > Date.now()+60000) list.push({id:nHash('per|'+P.id),title:'KDN period reminder',
              body:(P.me?'Your':P.name+'’s')+' period is expected on '+hDate(r.next,{day:'numeric',month:'short'})+'.',
              schedule:{at:at,allowWhileIdle:true},smallIcon:'ic_stat_kdn',iconColor:'#E9C05A',extra:{kdn:'per',p:P.id}});
          }
        }
      });
      return list.length ? LN.schedule({notifications:list.slice(0,400)}) : null;
    }).catch(function(e){ try{ console.warn('KDN reminders',e); }catch(x){} });
  }
  function nAskNotif(){
    var LN = NP.LocalNotifications; if(!LN) return;
    LN.requestPermissions().then(function(r){
      nPermRead(r); nSync();
      if(curScreen==='s-health') hRender();
      if(nNotif==='on'){ toast('Reminders are on. KDN will remind you even when the app is closed.'); snd('ok'); }
      else toast('Notifications are off. Turn them on in Settings › Apps › KDN Fitness › Notifications.');
    });
  }

  /* Files (backups, bills, reports): save to the phone through the Android share sheet. */
  function nBlobB64(blob){ return new Promise(function(res,rej){ var fr = new FileReader(); fr.onload = function(){ res(String(fr.result).split(',')[1]||''); }; fr.onerror = rej; fr.readAsDataURL(blob); }); }
  function nShareFiles(items,title){
    var FS = NP.Filesystem, SH = NP.Share; if(!FS || !SH){ toast('Saving files is not available here.'); return Promise.resolve(); }
    return Promise.all(items.map(function(it){
      return nBlobB64(it.blob).then(function(b64){ return FS.writeFile({path:String(it.name||'kdn-file').replace(/[^\w.\-]+/g,'-'),data:b64,directory:'CACHE'}); }).then(function(r){ return r.uri; });
    })).then(function(uris){ return SH.share({title:title||'KDN Fitness',files:uris,dialogTitle:'Save or share'}); })
      .catch(function(e){ var m = String(e && (e.message||e)); if(/cancel/i.test(m)) return; toast('Could not save the file on this phone.'); });
  }
  function nSaveFile(blob,fn,done){ nShareFiles([{blob:blob,name:fn}],fn).then(function(){ if(done) done(); }); }

  if(NATIVE){
    document.documentElement.classList.add('kdn-native');
    (function(){
      var mh = $('m-hlt'); if(mh){ var b = mh.querySelector('b'), sm = mh.querySelector('small'); if(b) b.textContent = 'Period tracker'; if(sm) sm.textContent = 'Next period, fertile days, symptoms'; }
      Array.prototype.forEach.call(document.querySelectorAll('.lp-pl li'),function(li){
        var t = li.textContent;
        if(/^Medicine reminders/.test(t)) li.remove();
        else if(/^Medicines, reports and period tracker/.test(t)) li.textContent = 'Period tracker for each woman in the family';
      });
      Object.keys(PLANS).forEach(function(k){ PLANS[k].ticks = PLANS[k].ticks.map(function(t){ return /^Medicine reminders, medical records and period tracker/.test(t) ? 'Period tracker for women' : /^Medicines, reports and period tracker/.test(t) ? 'Period tracker for each woman in the family' : t; }); });
      try{ setPlan(curPlan); }catch(e){}
    })();
    var LN0 = NP.LocalNotifications;
    if(LN0){
      LN0.checkPermissions().then(function(r){ nPermRead(r); nSync(); });
      try{ LN0.registerActionTypes({types:[{id:'KDN_MED',actions:[{id:'taken',title:'I took it'},{id:'snooze',title:'Remind in 10 min'}]}]}); }catch(e){}
      LN0.addListener('localNotificationActionPerformed',function(a){
        var n = a && a.notification || {}, x = n.extra || {};
        if(x.kdn==='med' || x.kdn==='snz'){
          if(a.actionId==='taken'){ hMark(x.p,todayKey(),x.k,'t'); toast('Dose marked as taken.'); if(curScreen==='s-health') hRender(); return; }
          if(a.actionId==='snooze'){ LN0.schedule({notifications:[{id:nHash('snz|'+x.p+'|'+x.k+'|'+Date.now()),title:n.title,body:n.body,schedule:{at:new Date(Date.now()+600000),allowWhileIdle:true},smallIcon:'ic_stat_kdn',iconColor:'#E9C05A',actionTypeId:'KDN_MED',extra:{kdn:'snz',p:x.p,k:x.k}}]}); toast('KDN will remind you again in 10 minutes.'); return; }
        }
        if(x.kdn==='eng'){ var ek = String(x.k||''); if(/^m|^wo/.test(ek)) go('plan'); else if(ek==='st') go('steps'); else openHome(); return; }
        if(x.kdn && healthOn()){ hS.who = x.p || 'me'; hS.tab = x.kdn==='per' ? 'cyc' : 'meds'; show('s-health'); }
      });
    }
    if(NP.App){
      NP.App.addListener('appStateChange',function(s){ if(s && s.isActive){ nSync(); hTick(); if(typeof tickLic==='function') tickLic(); } });
      /* Android back button: close what is open, then go home, then leave the app */
      NP.App.addListener('backButton',function(){
        if(!$('hview').hidden){ $('hview').hidden = true; $('hview').innerHTML = ''; return; }
        if(!$('hsheet').hidden){ hClose(); return; }
        if(typeof kBack==='function' && kBack()) return;
        if(kSheetOpen()){ kClose(); return; }
        if(!$('hrem').hidden) return;
        if(menuOpen()){ openMenu(false); return; }
        var mod = Array.prototype.filter.call(document.querySelectorAll('.modal'),function(m){ return !m.hidden; })[0];
        if(mod){ if(mod.id==='lgm') closeLogout(); else mod.hidden = true; return; }
        if(curScreen==='s-gym' && typeof gS==='object' && gS && gS.ov){ gS.ov = null; gRender(); return; }
        if(curScreen==='s-result' && S){ openHome(); return; }
        if(curScreen!=='s-home' && curScreen!=='s-landing'){ go('home'); return; }
        if(NP.App.minimizeApp) NP.App.minimizeApp(); else NP.App.exitApp();
      });
    }
    /* Links to WhatsApp, phone, Instagram, Google Calendar etc. open in their own apps */
    document.addEventListener('click',function(ev){
      var a = ev.target.closest && ev.target.closest('a[href]'); if(!a) return;
      var h = a.getAttribute('href') || '';
      var ext = /^(tel|mailto|sms|whatsapp|upi|intent):/i.test(h) || (/^https?:\/\//i.test(h) && a.host!==location.host);
      if(!ext || a.hasAttribute('download')) return;
      ev.preventDefault();
      if(NP.AppLauncher) NP.AppLauncher.openUrl({url:a.href}).catch(function(){ toast('Could not open this link.'); });
    },true);
    var nOpen = window.open;
    window.open = function(u){ u = String(u||''); if(/^(https?:|tel:|mailto:|whatsapp:)/i.test(u) && NP.AppLauncher){ NP.AppLauncher.openUrl({url:u}); return null; } return nOpen.apply(window,arguments); };
    /* status bar icons: light on the dark landing page, dark on the light app pages */
    var nBar = function(){ var SB = NP.SystemBars; if(!SB || !SB.setStyle) return; try{ SB.setStyle({style:document.body.classList.contains('onland') || document.body.classList.contains('gymmode') || document.documentElement.classList.contains('dk') ? 'LIGHT' : 'DARK'}); }catch(e){} };
    if(window.MutationObserver) new MutationObserver(nBar).observe(document.body,{attributes:true,attributeFilter:['class']});
    nBar();
  }
  /* ==== KDN NATIVE APP END ==== */

