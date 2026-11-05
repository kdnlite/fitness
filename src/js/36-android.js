  /* ==== KDN ANDROID EXTRAS START ==== Health Connect steps and the home screen widget (app only) */
  function hcP(){ return NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Health; }
  function hcOf(){ if(!S) return {}; if(!S.hc || typeof S.hc!=='object') S.hc = {}; return S.hc; }
  /* read daily step totals for the last 30 days; keep the higher of Health Connect and KDN's own count */
  function hcSync(ask){
    var H = hcP(); if(!H || !S) return Promise.resolve(false);
    var st = hcOf(); if(!ask && !st.on) return Promise.resolve(false);
    if(hcSync.busy) return hcSync.busy;
    hcSync.busy = H.isAvailable().then(function(a){
      if(!a || !a.available){ st.err = 'na'; throw new Error('na'); }
      return ask ? H.requestAuthorization({read:['steps']}) : H.checkAuthorization({read:['steps']});
    }).then(function(r){
      if(!r || (r.readAuthorized||[]).indexOf('steps')<0){ st.on = false; st.err = 'denied'; lsSet(S); throw new Error('denied'); }
      st.on = true; st.err = '';
      var end = new Date(), start = new Date(); start.setDate(start.getDate()-29); start.setHours(0,0,0,0);
      return H.queryAggregated({dataType:'steps',startDate:start.toISOString(),endDate:end.toISOString(),bucket:'day',aggregation:'sum'});
    }).then(function(res){
      var n = 0;
      ((res && res.samples)||[]).forEach(function(x){
        var k = dkey(new Date(x.startDate)), v = Math.round((x.values && x.values.sum) || x.value || 0);
        if(v>0){ var lg = logOf(k); if(!(lg.st>=v)){ lg.st = v; n++; } lg.hc = v; }
      });
      st.at = Date.now(); lsSet(S);
      if(curScreen==='s-result' && curTab==='steps') renderSteps();
      renderHome();
      return true;
    }).catch(function(e){
      var m = String(e && (e.message||e));
      if(ask){ if(/na/.test(m)) toast('Health Connect is not on this phone. Install “Health Connect by Android” from the Play Store, then try again.'); else if(/denied/.test(m)) toast('Steps permission was not given. You can turn it on in Health Connect settings.'); else toast('Could not read steps from Health Connect.'); }
      if(curScreen==='s-result' && curTab==='steps') renderSteps();
      return false;
    }).then(function(x){ hcSync.busy = null; return x; });
    return hcSync.busy;
  }
  function hcAgo(t){ var m = Math.round((Date.now()-t)/60000); return m<1 ? 'just now' : m<60 ? m+' min ago' : Math.round(m/60)+' h ago'; }
  function hcCard(){
    if(!hcP() || !S) return '';
    var st = hcOf();
    if(st.on) return '<div class="hc on"><span class="hc-ic">'+kIco('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>')+'</span><span class="hc-tx"><b>All-day steps from Health Connect</b><small>Updated '+(st.at?hcAgo(st.at):'—')+'</small></span><button type="button" class="hh-btn" data-hc="sync">Sync</button></div>';
    return '<div class="hc"><span class="hc-ic">'+kIco('<path d="M12 21s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 11c0 5.6-7 10-7 10z"/>')+'</span><span class="hc-tx"><b>Count steps all day</b><small>Use your phone’s own step counter (and watch) through Health Connect. KDN only reads your step count.</small></span><button type="button" class="hh-gold" data-hc="on">Connect</button></div>'+(st.err==='na'?'<p class="hint">Health Connect is not installed. Get “Health Connect by Android” from the Play Store.</p>':'');
  }
  document.addEventListener('click',function(ev){
    var b = ev.target.closest && ev.target.closest('[data-hc]'); if(!b || !S) return;
    buzz(); var a = b.getAttribute('data-hc');
    b.disabled = true;
    hcSync(true).then(function(ok){ if(ok) toast(a==='on'?'Connected. Your steps for the last 30 days are in.':'Steps updated.'); });
  });
  /* ---- home screen widget ---- */
  function kWidgetPush(now){
    var W = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.KdnWidget; if(!W || !S || !curR) return;
    clearTimeout(kWidgetPush.t);
    kWidgetPush.t = setTimeout(function(){
      try{
        var t = todayKey(), lg = (S.log||{})[t]||{}, sc = dayScore(t), si = streakInfo(), g = stepGoal(), wg = waterGoal();
        var next = (lg.st||0)<g ? fmt(g-(lg.st||0))+' steps to go' : (lg.wa||0)<wg ? (wg-(lg.wa||0))+' more glasses of water' : !lg.wo && !sc.rest ? 'Workout left for today' : 'All done for today. Great work!';
        W.update({day:t,steps:lg.st||0,goal:g,water:lg.wa||0,wgoal:wg,score:sc.total,streak:si.n,next:next}).catch(function(){});
      }catch(e){}
    },now?0:800);
  }
  /* refresh steps a few seconds after the app opens */
  if(hcP()) setTimeout(function(){ hcSync(false); },2500);
  /* ==== KDN ANDROID EXTRAS END ==== */
