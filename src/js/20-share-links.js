  /* ---------- Share by QR / link: member plan access and trainer mode ---------- */
  var KSH = 'kdn.gym.v1', KTR = 'kdn.trainer.v1', kPend = null, TR = null;
  function kB64(b){ var s = ''; for(var i=0;i<b.length;i++) s += String.fromCharCode(b[i]); return btoa(s).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
  function kUnB64(t){ t = t.replace(/-/g,'+').replace(/_/g,'/'); while(t.length%4) t += '='; var s = atob(t), b = new Uint8Array(s.length); for(var i=0;i<s.length;i++) b[i] = s.charCodeAt(i); return b; }
  function kStream(bytes,CS){ return new Response(new Blob([bytes]).stream().pipeThrough(new CS('deflate-raw'))).arrayBuffer().then(function(ab){ return new Uint8Array(ab); }); }
  function kPack(o){
    var raw = new TextEncoder().encode(JSON.stringify(o)), plain = 'j.'+kB64(raw);
    if(typeof CompressionStream==='undefined') return Promise.resolve(plain);
    return kStream(raw,CompressionStream).then(function(z){ var c = 'z.'+kB64(z); return c.length<plain.length ? c : plain; },function(){ return plain; });
  }
  function kUnpack(t){
    var tag = t.slice(0,2), b; try{ b = kUnB64(t.slice(2)); }catch(e){ return Promise.reject(new Error('bad')); }
    var parse = function(u){ return JSON.parse(new TextDecoder().decode(u)); };
    if(tag==='j.') return new Promise(function(ok,no){ try{ ok(parse(b)); }catch(e){ no(e); } });
    if(tag==='z.' && typeof DecompressionStream!=='undefined') return kStream(b,DecompressionStream).then(parse);
    return Promise.reject(new Error('unsupported'));
  }
  function kUrlOk(u){ return /^https?:\/\/[^\s#]+$/i.test(u); }
  function kBase(){ var u = (G && gSet().url) || ''; if(!u && /^https?:$/.test(location.protocol)) u = location.href.split('#')[0]; return u; }
  function kExpTs(x){ return /^\d{4}-\d{2}-\d{2}$/.test(x||'') ? new Date(x+'T23:59:59').getTime() : 0; }
  function kProfArr(p){ return [p.gender,p.age,p.weight,Math.round(p.height*10)/10,p.diet,p.goal,p.amt,p.loc,p.level,p.days,p.budget||'mid',p.weeks||0]; }
  function kProfObj(a,name){
    if(!Array.isArray(a) || a.length<11) return null;
    var d = {name:String(name||'').slice(0,60),gender:a[0],age:+a[1],weight:+a[2],height:+a[3],diet:a[4],goal:a[5],amt:+a[6],loc:a[7],level:a[8],days:+a[9],budget:a[10],tmode:'safe'};
    if(a[11]>0) d.weeks = +a[11];
    try{ d = normalize(d); if(FV.time(d)){ d.tmode = 'safe'; refreshTime(d); } if(!KEYS.every(function(k){ return FV[k](d)===''; })) return null; }catch(e){ return null; }
    return d;
  }
  function kPhone(v){ return bWaNum(v); }
  function kWa(num,text){ var n = kPhone(num); return (n ? 'https://wa.me/'+n : 'https://wa.me/')+'?text='+encodeURIComponent(text); }
  function kCopy(text){
    var done = function(){ toast('Link copied.'); };
    if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,function(){ kCopyOld(text,done); }); } else kCopyOld(text,done);
  }
  function kCopyOld(text,done){ var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); done(); }catch(e){ toast('Could not copy. Select the link and copy it.'); } document.body.removeChild(t); }
  function kQrPng(text,done){
    var q = qrMake(text,'M') || qrMake(text,'L'); if(!q){ done(null); return; }
    var s = 10, n = q.size+8, c = document.createElement('canvas'); c.width = c.height = n*s;
    var x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0,0,c.width,c.height); x.fillStyle = '#000';
    for(var y=0;y<q.size;y++) for(var i=0;i<q.size;i++) if(q.mod[y][i]) x.fillRect((i+4)*s,(y+4)*s,s,s);
    c.toBlob(done,'image/png');
  }

  /* ===== gym owner side: share sheets ===== */
  var kSh = {key:'',link:'',svg:'',fit:true};
  function kMemberObj(m,note){
    var g = G.gym, tr = m.trainer ? gFind('trainers',m.trainer) : null;
    var o = {t:'m',v:1,g:g.name,gp:g.phone||'',n:m.name,p:kProfArr(m.prof),u:Date.now(),ac:gSet().accent};
    if(g.address) o.ga = g.address; if(m.mobile) o.mb = m.mobile; if(gOk(m.next)) o.x = m.next;
    if(tr){ o.tn = tr.name; if(tr.mobile) o.tp = tr.mobile; }
    if(note) o.nt = note.slice(0,240);
    return o;
  }
  function kTrainerObj(t){
    var g = G.gym, ms = G.members.filter(function(m){ return m.trainer===t.id; }).map(function(m){ var q = {i:m.id,n:m.name,no:m.no}; if(m.mobile) q.mb = m.mobile; if(gOk(m.next)) q.x = m.next; if(m.prof) q.p = kProfArr(m.prof); return q; });
    var o = {t:'t',v:1,g:g.name,gp:g.phone||'',tn:t.name,ms:ms,u:Date.now(),b:kBase(),ac:gSet().accent};
    if(t.mobile) o.tp = t.mobile; if(g.address) o.ga = g.address;
    return o;
  }
  function kShareHtml(pg,id){
    var isM = pg==='share-m', e = gFind(isM?'members':'trainers',id); if(!e) return '';
    var h = gXHead(isM?'Share plan':'Trainer access')+'<div class="govb">', base = kBase();
    if(isM && !e.prof) return h+'<div class="gcard dark"><h3>'+esc(e.name)+'</h3><p class="ghint">This member has no plan yet. Make the diet and workout plan first, then share it.</p><button type="button" class="gbtn gold wide" data-g="x-diet" data-id="'+id+'">Make the plan</button></div></div>';
    if(!isM && !G.members.some(function(m){ return m.trainer===id; })) return h+'<div class="gcard dark"><h3>'+esc(e.name)+'</h3><p class="ghint">No members are assigned to this trainer yet. Assign members first (edit a member and choose the trainer), then give access.</p></div></div>';
    if(!base){
      return h+'<div class="gcard dark"><h3>Where is your app hosted?</h3><p class="ghint">The QR opens the KDN app on the other phone, so it needs the web address of your app (for example your GitHub Pages link). You only enter it once.</p><label class="gl" for="sh-url">App web address</label><input class="gin" id="sh-url" type="url" inputmode="url" placeholder="https://yourname.github.io/kdn/" autocomplete="off"><p class="gerr" id="sh-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="k-url-save" data-in="sh-url">Save address</button></div></div>';
    }
    var note = isM ? (gS.x.knote||'') : '', key = pg+'|'+id+'|'+base+'|'+note+'|'+(isM ? (e.prof?JSON.stringify(e.prof).length:0)+(e.next||'') : G.members.length+(G.members.map(function(m){ return m.trainer===id ? m.id+(m.prof?1:0)+(m.next||'') : ''; }).join('')));
    if(kSh.key!==key){
      kSh = {key:key,link:'',svg:'',fit:true};
      var obj = isM ? kMemberObj(e,note) : kTrainerObj(e), mine = key;
      kPack(obj).then(function(tok){
        if(kSh.key!==mine) return;
        var link = base.replace(/#.*$/,'')+'#k='+tok, q = qrMake(link,'L');
        kSh.link = link; kSh.fit = !!q; kSh.svg = q ? qrSvg(link,{label:'QR code for '+e.name}) : '';
        if(gS.ov && gS.ov.page===pg && gS.ov.id===id) gRender();
      },function(){ kSh.link = ''; });
    }
    if(!kSh.link) return h+'<div class="gcenter"><div class="gspin"></div><p>Preparing…</p></div></div>';
    var msg = isM ? 'Hello '+e.name+', here is your personal diet and workout plan from '+G.gym.name+'. Open this link on your phone to see it in the KDN app: '+kSh.link : 'Hello '+e.name+', you now have trainer access at '+G.gym.name+'. Open this link on your phone to see the members assigned to you and send them plans: '+kSh.link;
    h += '<div class="gcard dark kqr"><h3>'+(isM?esc(e.name):'Access for '+esc(e.name))+'</h3>';
    h += kSh.fit ? '<div class="kqrbox">'+kSh.svg+'</div><p class="ghint cen">'+(isM?'Ask the member to scan this with the phone camera.':'Ask the trainer to scan this with the phone camera.')+'</p>' : '<div class="gwarn">This list is too long for one QR code. Send the link on WhatsApp instead.</div>';
    h += '<label class="gl" for="k-link">Link</label><input class="gin" id="k-link" readonly value="'+esc(kSh.link)+'">';
    h += '<div class="gtwo"><button type="button" class="gbtn ghost" data-g="k-copy">Copy link</button><a class="gbtn wa" href="'+esc(kWa(e.mobile,msg))+'" target="_blank" rel="noopener">WhatsApp</a></div>';
    if(kSh.fit) h += '<button type="button" class="gbtn ghost wide" data-g="k-png" data-id="'+id+'">Save QR image</button>';
    if(navigator.share) h += '<button type="button" class="gbtn ghost wide" data-g="k-native" data-id="'+id+'">Share…</button>';
    if(isM){
      h += '<label class="gl" for="k-note">Message for the member (optional)</label><input class="gin" id="k-note" maxlength="240" value="'+esc(note)+'" placeholder="Welcome! See you at 6 AM.">';
      h += '<div class="gdr"><span>Plan access until</span><b>'+(gOk(e.next)?gFmt(e.next):'30 days')+'</b></div>';
    } else {
      h += '<div class="gdr"><span>Members shared</span><b>'+G.members.filter(function(m){ return m.trainer===id; }).length+'</b></div>';
    }
    h += '</div><div class="gwarn">Anyone who opens this link can see '+(isM?'this member’s plan':'these members’ names, phone numbers and plans')+'. Share it only with '+(isM?'the member':'your trainer')+'. '+(isM?'After you renew the fee or change the plan, share a new QR.':'After you assign new members, share a new QR.')+'</div></div>';
    return h;
  }
  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b) return;
    var a = b.getAttribute('data-g'); if(a.indexOf('k-')!==0) return;
    var id = b.getAttribute('data-id');
    if(a==='k-share-m' || a==='k-share-t'){ gS.x.back = gS.ov; gS.x.knote = ''; kSh = {key:'',link:'',svg:'',fit:true}; gS.ov = {type:'x',page:a==='k-share-m'?'share-m':'share-t',id:id}; gRender(); return; }
    if(a==='k-url-save'){
      var inp = $(b.getAttribute('data-in')), v = inp ? inp.value.trim() : '', er = $('sh-err');
      if(!kUrlOk(v)){ if(er){ er.textContent = 'Enter the full web address, starting with https://'; er.hidden = false; } else toast('Enter the full web address, starting with https://'); snd('err'); return; }
      gSet().url = v; gSave(); kSh = {key:'',link:'',svg:'',fit:true}; gRender(); toast('Address saved.'); return;
    }
    if(a==='k-copy'){ var l = $('k-link'); if(l) kCopy(l.value); return; }
    if(a==='k-native'){ var l2 = $('k-link'); if(l2 && navigator.share) navigator.share({title:'KDN',text:'Open in the KDN app',url:l2.value}).catch(function(){}); return; }
    if(a==='k-png'){ if(!kSh.link) return; var e = gFind(gS.ov.page==='share-m'?'members':'trainers',id); kQrPng(kSh.link,function(bl){ if(!bl){ toast('Could not make the image.'); return; } gSaveFile(bl,'QR-'+(e?e.name:'kdn').replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)+'.png',function(){ toast('QR image saved.'); }); }); return; }
  });
  $('gymroot').addEventListener('change',function(ev){
    if(ev.target.id==='k-note' && gS.ov && gS.ov.page==='share-m'){ gS.x.knote = ev.target.value.trim(); gRender(); }
  });

  /* ===== member side: open a plan link, keep it as an app ===== */
  function kClearHash(){ try{ history.replaceState(null,'',location.pathname+location.search); }catch(e){} }
  function kLi(a,b){ return '<li><b>'+esc(a)+'</b><span>'+esc(b)+'</span></li>'; }
  function kBadLink(){
    $('shareroot').innerHTML = '<div class="hhero"><div><small>KDN Fitness Tracker</small><h2>This link did not open</h2><p>It may be cut short or damaged. Ask your gym or trainer to send it again.</p></div></div><div class="hb"><button type="button" class="btn" data-k="k-home">Go to KDN</button></div>';
    show('s-share');
  }
  function kA2hs(){ return '<details class="kA2hs"><summary>Keep this as an app on your phone</summary><p><b>iPhone (Safari):</b> tap Share, then “Add to Home Screen”.</p><p><b>Android (Chrome):</b> tap the ⋮ menu, then “Add to Home screen” or “Install app”.</p><p>Your plan stays saved on this phone.</p></details>'; }
  function kShowImport(o){
    kPend = o; var h = '';
    if(!o || (o.t!=='m' && o.t!=='t') || typeof o.g!=='string'){ kBadLink(); return; }
    if(o.t==='m'){
      var d = kProfObj(o.p,o.n); if(!d){ kBadLink(); return; }
      var exp = kExpTs(o.x), expired = exp && exp<Date.now(), r = calc(d);
      h += '<div class="hhero"><div><small>Plan from your gym</small><h2>'+esc(o.g)+'</h2><p>For '+esc(o.n)+'</p></div></div>';
      h += '<div class="sect"><div class="sh"><div><small>Your plan</small><h3>'+esc(goalLine(d))+'</h3></div></div><ul class="hl">'+kLi('Daily target',fmt(r.target)+' kcal · '+r.protein+' g protein')+kLi('Workout',d.days+' days a week')+(o.tn?kLi('Trainer',o.tn):'')+(o.x?kLi('Access until',gFmt(o.x)):'')+'</ul>'+(o.nt?'<p class="knote">“'+esc(o.nt)+'”</p>':'')+'</div>';
      if(expired) h += '<p class="hint err">This plan link ended on '+esc(gFmt(o.x))+'. Ask '+esc(o.g)+' to renew your membership and send a new link.</p><div class="hb"><button type="button" class="btn ghost" data-k="k-home">Close</button></div>';
      else {
        if(S && S.name!==d.name) h += '<p class="hint err">This phone already has a plan for <b>'+esc(S.name)+'</b>. Opening this plan will replace it.</p>';
        h += '<div class="hb"><button type="button" class="btn" data-k="k-acc">Open my plan</button><button type="button" class="btn ghost" data-k="k-home">Not now</button></div>'+kA2hs();
      }
    } else {
      var ms = Array.isArray(o.ms) ? o.ms : [];
      h += '<div class="hhero"><div><small>Trainer access</small><h2>'+esc(o.g)+'</h2><p>For '+esc(o.tn||'trainer')+'</p></div></div>';
      h += '<div class="sect"><div class="sh"><div><small>What you will see</small><h3>'+ms.length+' member'+(ms.length===1?'':'s')+' assigned to you</h3></div></div><p class="hint">You can see each member’s plan, change it, and send it to them on WhatsApp.</p></div>';
      h += '<div class="hb"><button type="button" class="btn" data-k="k-acc">Open trainer dashboard</button><button type="button" class="btn ghost" data-k="k-home">Not now</button></div>'+kA2hs();
    }
    $('shareroot').innerHTML = h; show('s-share');
  }
  function kAcceptMember(o){
    var d = kProfObj(o.p,o.n); if(!d){ kBadLink(); return; }
    var prev = (S && S.name===d.name) ? S : null, changed = !prev;
    if(prev){ ['weight','height','age','gender','goal','amt','tmode','weeks','loc','level','days'].forEach(function(k){ if(prev[k]!==d[k]) changed = true; }); ['log','wlog','stepGoal','dsel','prefs','startDate','startWeight','kcalAdj','adjFrom'].forEach(function(k){ if(prev[k]!==undefined) d[k] = prev[k]; }); }
    S = normalize(d); S.savedAt = new Date().toISOString();
    if(changed || !S.startDate){ S.startDate = todayKey(); S.startWeight = S.weight; S.kcalAdj = 0; S.adjFrom = S.startDate; S.wlog = S.wlog || {}; S.wlog[S.startDate] = S.weight; }
    lsSet(S); userKg = S.weight;
    var end = kExpTs(o.x) || (Date.now()+30*864e5), cur = licOf('ind');
    if(!cur || cur.end<end) licSetPlan('ind',{start:Date.now(),end:end,code:'GYM',plan:'ind'});
    try{ localStorage.setItem(KSH,JSON.stringify({g:o.g,gp:o.gp||'',ga:o.ga||'',tn:o.tn||'',tp:o.tp||'',nt:o.nt||'',x:o.x||'',at:Date.now()})); }catch(e){}
    if(typeof tickLic==='function') tickLic();
    kClearHash(); openHome(); syncAuth(); renderWelcome(); toast('Your plan from '+o.g+' is ready.');
  }
  function kBadge(){ try{ var t = localStorage.getItem(KSH); return t ? JSON.parse(t) : null; }catch(e){ return null; } }
  function kBadgeHtml(){
    var b = kBadge(); if(!b || !b.g) return '';
    var wa = bWaNum(b.gp);
    return '<div class="sect kbadge"><div class="sh"><div><small>Your gym</small><h3>'+esc(b.g)+'</h3></div>'+(b.x?'<span class="dsum2">Until '+esc(gFmt(b.x))+'</span>':'')+'</div><ul class="hl">'+(b.tn?kLi('Trainer',b.tn):'')+(b.ga?kLi('Address',b.ga):'')+'</ul>'+(b.nt?'<p class="knote">“'+esc(b.nt)+'”</p>':'')+'<div class="hb">'+(b.gp?'<a class="btn sm" href="tel:'+esc(String(b.gp).replace(/[^\d+]/g,''))+'">Call gym</a>':'')+(wa?'<a class="btn sm ghost" href="https://wa.me/'+wa+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'</div>'+kA2hs()+'</div>';
  }
  function kPayNote(){
    var el = $('pay-gym'); if(!el) return; var b = kBadge();
    if(b && b.g && !licensed('app')){ el.hidden = false; el.innerHTML = 'Your access from <b>'+esc(b.g)+'</b> has ended'+(b.x?' (on '+esc(gFmt(b.x))+')':'')+'. Ask the gym to renew your membership and send you a new link, or choose a plan below.'; }
    else { el.hidden = true; el.textContent = ''; }
  }

  /* ===== trainer mode ===== */
  var trS = {v:'list',q:'',id:null,day:null,qr:false,note:'',link:'',lk:''};
  function trLoad(){ try{ var t = localStorage.getItem(KTR); TR = t ? JSON.parse(t) : null; }catch(e){ TR = null; } if(TR && (!Array.isArray(TR.ms) || typeof TR.g!=='string')) TR = null; return TR; }
  function trSave(){ try{ localStorage.setItem(KTR,JSON.stringify(TR)); }catch(e){ toast('This browser would not save the trainer data.'); } }
  function kSyncMenu(){ var b = $('m-trn'); if(b) b.hidden = !trLoad(); }
  function trAccept(o){
    var old = trLoad(), prevMs = {}; if(old && old.g===o.g && old.tn===o.tn) old.ms.forEach(function(q){ prevMs[q.i] = q; });
    var ms = o.ms.slice(0,400).map(function(q){
      var n = {i:String(q.i||''),n:String(q.n||'').slice(0,60),no:q.no,mb:q.mb||'',x:q.x||'',p:Array.isArray(q.p)?q.p:0,nt:''}, L = prevMs[n.i];
      n.p0 = JSON.stringify(n.p);
      if(L){ n.nt = L.nt||''; if(L.ed && L.p0===n.p0){ n.p = L.p; n.ed = L.ed; } }
      return n;
    });
    TR = {g:o.g,gp:o.gp||'',ga:o.ga||'',tn:o.tn||'Trainer',tp:o.tp||'',b:o.b||'',ac:o.ac||'gold',u:o.u||Date.now(),at:Date.now(),ms:ms};
    trSave(); trS = {v:'list',q:'',id:null,day:null,qr:false,note:'',link:'',lk:''}; kClearHash(); kSyncMenu(); show('s-trainer'); toast('Trainer access added.');
  }
  function trOpen(){
    if(!trLoad()){ $('trainerroot').innerHTML = '<div class="gcenter"><p>No trainer access on this device.</p><button type="button" class="gbtn gold" data-k="tr-exit">Go to KDN</button></div>'; return; }
    document.body.setAttribute('data-gt','dark'); document.body.setAttribute('data-ga',GACC.some(function(a){ return a[0]===TR.ac; }) ? TR.ac : 'gold');
    trS.v = 'list'; trRender();
  }
  function trMember(){ return TR && TR.ms.filter(function(q){ return q.i===trS.id; })[0]; }
  function trChip(x){ if(!gOk(x)) return '<i class="gchip ok">Active</i>'; var d = gDue(x); return d.dd<0 ? '<i class="gchip over">Ended</i>' : d.dd<=7 ? '<i class="gchip soon">Ends in '+d.dd+' d</i>' : '<i class="gchip ok">Until '+esc(gFmt(x))+'</i>'; }
  function trHead(sub){
    return '<div class="gtop"><div class="gshade"></div><div class="gtin"><div class="gbrand"><span class="gl-logo sm ph">'+esc(TR.g.charAt(0).toUpperCase())+'</span><div><h1>'+esc(TR.g)+'</h1><p>Trainer · '+esc(TR.tn)+'</p></div></div><div class="gtb"><button type="button" class="giconb" data-k="tr-exit" aria-label="Exit to KDN home"><svg viewBox="0 0 24 24"><path d="M3 11l9-8 9 8M5 10v10h14V10"/></svg></button></div></div></div>';
  }
  function trSub(title,back){ return '<div class="gsubh"><button type="button" class="giconb" data-k="'+back+'" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h3>'+esc(title)+'</h3></div>'; }
  function trListHtml(){
    var q = trS.q.trim().toLowerCase(), all = TR.ms, withPlan = all.filter(function(m){ return m.p; }).length, soon = all.filter(function(m){ return gOk(m.x) && gDue(m.x).dd<=7; }).length;
    var rows = all.filter(function(m){ return !q || (m.n+' '+(m.mb||'')+' '+(m.no||'')).toLowerCase().indexOf(q)>=0; });
    var h = trHead()+'<div class="gbody"><div class="gstats three">'+gStat(all.length,'Members')+gStat(withPlan,'With plan')+gStat(soon,'Ending soon',soon?'warn':'')+'</div>';
    h += '<div class="gbar"><label class="gsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><input id="tr-q" type="search" placeholder="Search members…" value="'+esc(trS.q)+'" autocomplete="off" aria-label="Search members"></label></div>';
    if(!all.length) h += '<div class="gempty"><b>No members yet</b><span>Ask the gym owner to assign members to you and share a new QR.</span></div>';
    else if(!rows.length) h += '<div class="gempty"><b>No match</b><span>Try another name or number.</span></div>';
    else h += '<div class="gsheet">'+rows.map(function(m){
      var sm = m.p ? (kProfObj(m.p,m.n)) : null;
      return '<button type="button" class="grow2" data-k="tr-open" data-id="'+esc(m.i)+'"><span class="gav">'+esc((m.n||'?').charAt(0).toUpperCase())+'</span><span class="gn"><b>'+esc(m.n)+'</b><small>'+(sm?esc(goalLine(sm)):'No plan yet')+'</small></span><span class="gr">'+trChip(m.x)+'</span></button>';
    }).join('')+'</div>';
    h += '<p class="ghint cen">Shared by the gym on '+esc(gFmt(gK(new Date(TR.at))))+'. New members appear after the gym shares a new QR.</p>';
    h += '<button type="button" class="gbtn ghost wide" data-k="tr-remove">Remove trainer access from this phone</button></div>';
    return h;
  }
  function trPlanHtml(p,m){
    var d = kProfObj(p,m.n); if(!d) return '<div class="gcard dark"><p class="ghint">This plan could not be read. Edit it to fix.</p></div>';
    var r = calc(d), wp = weekPlan(d), dow = trS.day==null ? todayDow() : trS.day, mp = mealPlan(d,r,dow), day = wp.days[dow];
    var h = '<div class="gcard dark"><h4>Plan</h4><p class="ghint">'+esc(goalLine(d))+'</p><div class="gthree"><div><small>Calories</small><b>'+fmt(r.target)+'</b></div><div><small>Protein</small><b>'+r.protein+' g</b></div><div><small>Water</small><b>'+r.water.toFixed(1)+' L</b></div></div></div>';
    h += '<div class="gchips" role="group" aria-label="Day">'+DAYN.map(function(n,i){ return '<button type="button" class="'+(i===dow?'on':'')+'" aria-pressed="'+(i===dow)+'" data-k="tr-day" data-v="'+i+'">'+n.slice(0,3)+'</button>'; }).join('')+'</div>';
    h += '<div class="gcard dark"><h4>Workout · '+esc(day.t)+'</h4>'+day.items.filter(function(it){ return EXS[it.id]; }).map(function(it){ return '<div class="gdr"><span>'+esc(EXS[it.id].n)+'</span><b>'+esc(rxTxt(it.id,it))+'</b></div>'; }).join('')+'</div>';
    h += '<div class="gcard dark"><h4>Meals · '+DAYN[dow]+'</h4>'+mp.slots.map(function(s){ return '<div class="gdr"><span>'+esc(s.sl[0].replace(' snack',''))+'</span><b>'+esc(s.x.n)+'<small>'+Math.round(s.k)+' kcal</small></b></div>'; }).join('')+(mp.tops.length?'<p class="ghint">Protein top-ups: '+mp.tops.map(function(q){ return q.u+' × '+esc(q.t.n); }).join(', ')+'.</p>':'')+'</div>';
    return h;
  }
  function trMemberObj(m){ var o = {t:'m',v:1,g:TR.g,gp:TR.gp||'',n:m.n,p:m.p,u:Date.now(),ac:TR.ac||'gold',tn:TR.tn}; if(TR.ga) o.ga = TR.ga; if(m.mb) o.mb = m.mb; if(m.x) o.x = m.x; if(TR.tp) o.tp = TR.tp; if(m.nt) o.nt = m.nt.slice(0,240); return o; }
  function trSendHtml(m){
    if(!m.p) return '';
    var base = (TR.b||'').replace(/#.*$/,''), h = '<div class="gcard dark"><h4>Send to '+esc(m.n)+'</h4>';
    if(!base){ return h+'<p class="ghint">The gym did not include its app address, so a link cannot be made. Ask the gym to set the app address in Settings and share again.</p></div>'; }
    var key = trS.id+'|'+JSON.stringify(m.p)+'|'+(m.nt||'');
    if(trS.lk!==key){ trS.lk = key; trS.link = ''; kPack(trMemberObj(m)).then(function(tok){ if(trS.lk!==key) return; trS.link = base+'#k='+tok; if(trS.v==='member' && trS.id===m.i) trRender(); }); }
    h += '<label class="gl" for="tr-note">Message for the member (optional)</label><input class="gin" id="tr-note" maxlength="240" value="'+esc(m.nt||'')+'" placeholder="Eat well, sleep early. See you Monday.">';
    if(!trS.link) return h+'<div class="gcenter"><div class="gspin"></div></div></div>';
    var msg = 'Hello '+m.n+', '+TR.tn+' from '+TR.g+' has made your personal diet and workout plan. Open this link on your phone to see it in the KDN app: '+trS.link;
    h += '<div class="gtwo"><a class="gbtn wa" href="'+esc(kWa(m.mb,msg))+'" target="_blank" rel="noopener">Send on WhatsApp</a><button type="button" class="gbtn ghost" data-k="tr-qr">'+(trS.qr?'Hide QR':'Show QR')+'</button></div><button type="button" class="gbtn ghost wide" data-k="tr-copy">Copy link</button>';
    if(trS.qr){ var q = qrMake(trS.link,'L'); h += q ? '<div class="kqrbox">'+qrSvg(trS.link,{label:'QR code for '+m.n})+'</div><p class="ghint cen">Ask '+esc(m.n)+' to scan this with the phone camera.</p>' : '<div class="gwarn">Too long for a QR code. Send the link instead.</div>'; }
    return h+'</div>';
  }
  function trMemberHtml(){
    var m = trMember(); if(!m){ trS.v = 'list'; return trListHtml(); }
    var h = trHead()+'<div class="gbody">'+trSub(m.n,'tr-back');
    h += '<div class="gcard dark">'+gRow('Mobile',m.mb?'<a href="tel:'+esc(String(m.mb).replace(/[^\d+]/g,''))+'">'+esc(m.mb)+'</a>':'—')+gRow('Member no.',m.no||'—')+gRow('Membership',gOk(m.x)?'until '+esc(gFmt(m.x)):'Active')+(m.ed?gRow('Plan','Edited by you'):'')+'</div>';
    h += m.p ? trPlanHtml(m.p,m) : '<div class="gcard dark"><p class="ghint">No plan has been made for this member yet.</p></div>';
    h += '<button type="button" class="gbtn gold wide" data-k="tr-edit">'+(m.p?'Change plan details':'Make the plan')+'</button>'+trSendHtml(m)+'</div>';
    return h;
  }
  function trFormHtml(){
    var m = trMember(); if(!m) return trListHtml();
    var d = (m.p && kProfObj(m.p,m.n)) || {}, ft = '', inch = '';
    if(d.height>0){ var t = Math.round(d.height/2.54*10)/10, a = Math.floor(t/12); ft = a; inch = r1(t-a*12); }
    var h = trHead()+'<div class="gbody">'+trSub('Plan for '+m.n,'tr-cancel')+'<div class="gcard dark"><p class="ghint">Enter the member’s details to make the calorie, protein, meal and workout plan.</p>';
    h += gSel('Gender','dp-gender',[['female','Female'],['male','Male'],['other','Other']],d.gender||'male');
    h += '<div class="gtwo">'+gFld('Age','dp-age',d.age||'','number','inputmode="numeric" placeholder="Years"')+gFld('Weight (kg)','dp-weight',d.weight||'','number','step="0.1" inputmode="decimal"')+'</div><div class="gtwo">'+gFld('Height (feet)','dp-ft',ft,'number','inputmode="numeric" placeholder="ft"')+gFld('Height (inches)','dp-in',inch,'number','step="0.1" inputmode="decimal" placeholder="in"')+'</div>';
    h += gSel('Diet','dp-diet',[['veg','Vegetarian'],['vegan','Vegan'],['nonveg','Non-vegetarian']],d.diet||'veg')+gSel('Goal','dp-goal',[['lose','Lose weight'],['gain','Gain weight'],['maintain','Stay stable']],d.goal||'lose')+gFld('Kilograms to lose or gain (or the weight to hold)','dp-amt',d.amt||'','number','step="0.1" inputmode="decimal"');
    h += gSel('Where they train','dp-loc',[['h0','Home, no equipment'],['h1','Home with dumbbells'],['gym','Gym']],d.loc||'gym')+gSel('Level','dp-level',[['beginner','Beginner'],['mid','Intermediate'],['adv','Advanced']],d.level||'beginner')+gSel('Training days a week','dp-days',[[3,'3 days'],[4,'4 days'],[5,'5 days'],[6,'6 days']],d.days||4)+gSel('Food budget','dp-budget',[['low','Low'],['mid','Medium'],['high','High']],d.budget||'mid');
    return h+'<p class="gerr" id="dp-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-k="tr-save">Save plan</button></div></div>';
  }
  function trRender(){
    var root = $('trainerroot'); if(!TR){ trOpen(); return; }
    var y = window.scrollY;
    root.innerHTML = '<div class="ktr">'+(trS.v==='member' ? trMemberHtml() : trS.v==='form' ? trFormHtml() : trListHtml())+'</div>';
  }
  $('trainerroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-k]'); if(!b) return;
    var a = b.getAttribute('data-k'), id = b.getAttribute('data-id'), v = b.getAttribute('data-v'), m;
    if(a==='tr-exit'){ go('home'); return; }
    if(a==='tr-open'){ trS.v = 'member'; trS.id = id; trS.day = null; trS.qr = false; trS.lk = ''; trRender(); window.scrollTo(0,0); return; }
    if(a==='tr-back'){ trS.v = 'list'; trRender(); window.scrollTo(0,0); return; }
    if(a==='tr-day'){ trS.day = parseInt(v,10); trRender(); return; }
    if(a==='tr-edit'){ trS.v = 'form'; trRender(); window.scrollTo(0,0); return; }
    if(a==='tr-cancel'){ trS.v = 'member'; trRender(); return; }
    if(a==='tr-qr'){ trS.qr = !trS.qr; trRender(); return; }
    if(a==='tr-copy'){ if(trS.link) kCopy(trS.link); return; }
    if(a==='tr-remove'){ if(confirm('Remove trainer access from this phone? You can get it back by scanning the gym’s QR again.')){ TR = null; try{ localStorage.removeItem(KTR); }catch(e){} kSyncMenu(); go('home'); toast('Trainer access removed.'); } return; }
    if(a==='tr-save'){
      m = trMember(); if(!m) return;
      var r = gDietVal({name:m.n}), er = $('dp-err');
      if(r.err){ er.textContent = r.err; er.hidden = false; snd('err'); return; }
      m.p = kProfArr(r.d); m.ed = Date.now(); trSave(); trS.v = 'member'; trS.lk = ''; trRender(); window.scrollTo(0,0); toast('Plan saved.'); return;
    }
  });
  $('trainerroot').addEventListener('input',function(ev){
    if(ev.target.id==='tr-q'){ trS.q = ev.target.value; var pos = ev.target.selectionStart; trRender(); var q = $('tr-q'); if(q){ q.focus(); try{ q.setSelectionRange(pos,pos); }catch(e){} } }
  });
  $('trainerroot').addEventListener('change',function(ev){
    if(ev.target.id==='tr-note'){ var m = trMember(); if(m){ m.nt = ev.target.value.trim(); trSave(); trS.lk = ''; trRender(); } }
  });

  /* ===== link router ===== */
  $('shareroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-k]'); if(!b) return;
    var a = b.getAttribute('data-k');
    if(a==='k-home'){ kClearHash(); kPend = null; go('home'); return; }
    if(a==='k-acc' && kPend){ var o = kPend; kPend = null; if(o.t==='m') kAcceptMember(o); else trAccept(o); }
  });
  function kRoute(){
    var h = location.hash || ''; if(h.indexOf('#k=')!==0) return false;
    var tok = h.slice(3);
    if(!tok || tok.length>90000){ kBadLink(); return true; }
    kUnpack(tok).then(kShowImport,function(){ kBadLink(); });
    return true;
  }
  window.addEventListener('hashchange',kRoute);
  kSyncMenu();
  kRoute();

