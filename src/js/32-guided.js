  /* ==== KDN GUIDED WORKOUT START ==== one exercise at a time, set timer, rest timer, reps and weight log */
  function gwSt(){ return gwSt.s || null; }
  function gwSet(s){ gwSt.s = s; }
  function gwItems(){
    return planExItems(todayDow()).filter(function(it){ return EXS[it.id] && CAL[it.id]; }).map(function(it){
      var c = CAL[it.id], o = JSON.parse(JSON.stringify(it));
      o.kind = c.k; o.sets = c.k==='time' ? 1 : (it.s||3); o.rest = c.rest || 45;
      return o;
    });
  }
  function gwHist(id){ var H = (S.wkh||{})[id]; return H && H.length ? H[H.length-1] : null; }
  function gwUsesKg(id){ return (EXS[id].eq||0)>0; }
  function gwOpen(){
    var items = gwItems();
    if(!items.length){ toast('No exercises in today’s plan.'); return; }
    gwSet({items:items,i:0,set:1,phase:'ready',left:0,end:0,paused:false,log:{},start:Date.now(),rx:{},pics:0});
    var el = $('gw'); el.hidden = false; document.documentElement.classList.add('hlock'); requestAnimationFrame(function(){ el.classList.add('open'); });
    gwWake(true); buzz('big'); gwRender();
    clearInterval(gwOpen.t); gwOpen.t = setInterval(gwTick,250);
    clearInterval(gwOpen.p); gwOpen.p = setInterval(function(){ var s = gwSt(); if(!s) return; s.pics = 1-s.pics; var f = $('gw-fig'); if(f) f.classList.toggle('alt',!!s.pics); },1400);
  }
  function gwClose(){
    clearInterval(gwOpen.t); clearInterval(gwOpen.p); gwWake(false);
    var el = $('gw'); el.classList.remove('open'); document.documentElement.classList.remove('hlock');
    setTimeout(function(){ if(!el.classList.contains('open')){ el.hidden = true; el.innerHTML = ''; } },300);
    gwSet(null);
  }
  function gwOpenNow(){ var el = $('gw'); return !!(el && !el.hidden); }
  /* keep the screen on while training */
  function gwWake(on){
    try{
      if(on && navigator.wakeLock){ navigator.wakeLock.request('screen').then(function(l){ gwWake.l = l; }).catch(function(){}); }
      else if(!on && gwWake.l){ gwWake.l.release(); gwWake.l = null; }
    }catch(e){}
  }
  document.addEventListener('visibilitychange',function(){ if(!document.hidden && gwOpenNow()) gwWake(true); });
  function gwCur(){ var s = gwSt(); return s.items[s.i]; }
  function gwRx(it){
    var s = gwSt(), k = it.id+'|'+s.set;
    if(!s.rx[k]){
      /* weight: this session's previous set first, then the same set last time */
      var prev = s.rx[it.id+'|'+(s.set-1)], last = gwHist(it.id), ls = last && last.s[Math.min(s.set-1,last.s.length-1)];
      s.rx[k] = {r:it.r||12, kg: prev ? prev.kg : (ls && ls[1] ? ls[1] : 0)};
    }
    return s.rx[k];
  }
  function gwTarget(it){ return it.kind==='reps' ? it.r+' reps'+(CAL[it.id].side?' each side':'') : it.kind==='hold' ? it.t+' sec' : it.m+' min'; }
  function mmss(sec){ sec = Math.max(0,Math.ceil(sec)); return Math.floor(sec/60)+':'+pad(sec%60); }
  function gwFig(id){
    var P = (typeof ephOf==='function') ? ephOf(id) : null;
    /* A demo video of this exercise for the user's own model plays on its own (muted, looping);
       without one the start and end photos take turns as before. */
    var vg = fg();
    if(typeof VIDS!=='undefined' && VIDS[vg] && VIDS[vg][id])
      return '<div class="gw-fig vid" id="gw-fig"><video src="'+VBASE+vg+'/'+id+'.mp4?v='+VIDS[vg][id]+'"'+(P&&P.length?' poster="'+P[0]+'"':'')+' autoplay muted loop playsinline webkit-playsinline preload="auto" disablepictureinpicture></video></div>';
    if(P && P.length) return '<div class="gw-fig" id="gw-fig"><img src="'+P[0]+'" data-hd="'+ephHd(P[0])+'" alt="Start position"><img src="'+(P[1]||P[0])+'" data-hd="'+ephHd(P[1]||P[0])+'" alt="End position" class="b"></div>';
    var f = figs(id,fg()); return '<div class="gw-fig draw" id="gw-fig"><span>'+f[0]+'</span><span class="b">'+(f[1]||f[0])+'</span></div>';
  }
  function gwTotSets(){ var s = gwSt(), n = 0, d = 0; s.items.forEach(function(it,i){ n += it.sets; if(i<s.i) d += it.sets; else if(i===s.i) d += s.set-1; }); return {n:n,d:d}; }
  function gwRender(){
    var s = gwSt(); if(!s) return;
    if(s.phase==='done'){ $('gw').innerHTML = gwDoneHtml(); return; }
    var it = gwCur(), e = EXS[it.id], ts = gwTotSets(), last = gwHist(it.id);
    var h = '<div class="gw-top"><button type="button" class="gw-x" data-gw="quit" aria-label="Leave workout">×</button><div class="gw-pr"><small>Exercise '+(s.i+1)+' of '+s.items.length+'</small><span class="gw-bar"><i style="width:'+Math.round(ts.d/ts.n*100)+'%"></i></span></div><span class="gw-clock" id="gw-clock">'+mmss((Date.now()-s.start)/1000)+'</span></div>';
    if(s.phase==='rest'){
      var nx = s.restNext;
      h += '<div class="gw-rest"><small>Rest</small><b id="gw-t">'+mmss(s.left)+'</b><div class="gw-rb"><button type="button" class="gw-chip" data-gw="r-15">−15 s</button><button type="button" class="gw-chip" data-gw="r+15">+15 s</button></div>';
      h += '<div class="gw-next"><small>Up next</small><b>'+esc(EXS[nx.it.id].n)+'</b><span>Set '+nx.set+' of '+nx.it.sets+' · '+gwTarget(nx.it)+'</span></div>';
      h += '<p class="gw-tip">Breathe slowly. Sip some water.</p></div>';
      h += '<div class="gw-foot"><button type="button" class="gw-go" data-gw="skip">Skip rest</button></div>';
      $('gw').innerHTML = h; return;
    }
    h += gwFig(it.id);
    h += '<div class="gw-mid"><h2>'+esc(e.n)+'</h2><p class="gw-mu">'+esc(e.m||'')+'</p>';
    h += '<div class="gw-set"><span>Set <b>'+s.set+'</b> of '+it.sets+'</span><span class="gw-tg">'+gwTarget(it)+'</span></div>';
    if(last) h += '<p class="gw-last">Last time ('+kNice(last.d)+'): '+last.s.map(function(x){ return x[0]+(x[1]?' × '+x[1]+' kg':''); }).join(', ')+'</p>';
    if(it.kind==='reps'){
      var rx = gwRx(it);
      h += '<div class="gw-in"><div class="gw-st"><small>Reps done</small><div><button type="button" data-gw="r-">−</button><b id="gw-r">'+rx.r+'</b><button type="button" data-gw="r+">+</button></div></div>';
      if(gwUsesKg(it.id)) h += '<div class="gw-st"><small>Weight (kg)</small><div><button type="button" data-gw="k-">−</button><b id="gw-k">'+rx.kg+'</b><button type="button" data-gw="k+">+</button></div></div>';
      h += '</div>';
    } else if(s.phase==='timer'){
      h += '<div class="gw-timer"><b id="gw-t">'+mmss(s.left)+'</b><small>'+(s.paused?'Paused':it.kind==='hold'?'Hold':'Keep going')+'</small></div>';
    }
    h += '<details class="gw-how"><summary>How to do it</summary><ol>'+(e.st||[]).map(function(x){ return '<li>'+esc(x)+'</li>'; }).join('')+'</ol>'+(e.mi?'<p><b>Avoid:</b> '+esc(e.mi)+'</p>':'')+'</details></div>';
    h += '<div class="gw-foot">';
    if(it.kind==='reps') h += '<button type="button" class="gw-go" data-gw="done">Set done ✓</button>';
    else if(s.phase==='timer') h += '<button type="button" class="gw-ghost" data-gw="pause">'+(s.paused?'Resume':'Pause')+'</button><button type="button" class="gw-go" data-gw="done">'+(it.kind==='time'?'Finish':'Done')+'</button>';
    else h += '<button type="button" class="gw-go" data-gw="start">Start '+(it.kind==='hold'?it.t+' sec':it.m+' min')+'</button>';
    h += '<button type="button" class="gw-skipx" data-gw="skipex">Skip this exercise</button></div>';
    var oldV = $('gw-fig') && $('gw-fig').querySelector('video');
    $('gw').innerHTML = h;
    /* keep the same video playing across re-renders (Start, Pause…) instead of restarting it */
    var newV = $('gw-fig') && $('gw-fig').querySelector('video');
    if(oldV && newV && oldV.getAttribute('src')===newV.getAttribute('src')) newV.parentNode.replaceChild(oldV, newV);
    gwFigMode();
  }
  function gwFigMode(){ var f = $('gw-fig'), s = gwSt(); if(f && s) f.classList.toggle('alt',!!s.pics);
    var v = f && f.querySelector('video'); if(v){ v.muted = true; if(v.paused){ var pr = v.play(); if(pr && pr.catch) pr.catch(function(){}); } } }
  function gwTick(){
    var s = gwSt(); if(!s) return;
    var c = $('gw-clock'); if(c) c.textContent = mmss((Date.now()-s.start)/1000);
    if((s.phase==='rest' || s.phase==='timer') && !s.paused){
      var left = (s.end-Date.now())/1000, prev = Math.ceil(s.left); s.left = left;
      var t = $('gw-t'); if(t) t.textContent = mmss(left);
      var nowS = Math.ceil(left);
      if(nowS!==prev && nowS<=3 && nowS>0){ snd('rep'); buzz(); }
      if(left<=0){ if(s.phase==='rest'){ snd('ok'); buzz('big'); s.phase = 'ready'; gwRender(); } else gwSetDone(); }
    }
  }
  function gwSetDone(){
    var s = gwSt(), it = gwCur(), lg = s.log[it.id] || (s.log[it.id] = []);
    if(it.kind==='reps'){ var rx = gwRx(it); lg.push([rx.r,gwUsesKg(it.id)?rx.kg:0]); }
    else if(it.kind==='hold'){ lg.push([Math.round(it.t-Math.max(0,s.left)),0]); }
    else lg.push([Math.round((it.m*60-Math.max(0,s.left))/60),0]);
    snd('ok'); buzz('ok');
    gwAdvance(true);
  }
  function gwAdvance(rest){
    var s = gwSt(), it = gwCur(), restSec = it.rest;
    if(s.set<it.sets){ s.set++; }
    else if(s.i<s.items.length-1){ s.i++; s.set = 1; restSec = 60; }
    else { gwFinish(); return; }
    var nx = {it:gwCur(),set:s.set};
    if(rest && it.kind!=='time'){ s.phase = 'rest'; s.paused = false; s.left = restSec; s.end = Date.now()+restSec*1000; s.restNext = nx; }
    else s.phase = 'ready';
    gwRender();
  }
  function gwFinish(){
    var s = gwSt(), t = todayKey(), sets = 0, vol = 0, kcal = 0, prs = [];
    S.wkh = S.wkh || {};
    Object.keys(s.log).forEach(function(id){
      var L = s.log[id], prev = gwHist(id), maxPrev = 0, maxNow = 0;
      if(prev) prev.s.forEach(function(x){ maxPrev = Math.max(maxPrev,x[1]||0); });
      L.forEach(function(x){ sets++; vol += (x[0]||0)*(x[1]||0); maxNow = Math.max(maxNow,x[1]||0); });
      if(prev && maxNow>maxPrev && maxNow>0) prs.push(EXS[id].n+' '+maxNow+' kg');
      var H = (S.wkh[id] = (S.wkh[id]||[]).filter(function(x){ return x.d!==t; })); H.push({d:t,s:L}); while(H.length>12) H.shift();
      var it = s.items.filter(function(x){ return x.id===id; })[0];
      if(it){ var b = burn(id,{s:L.length,r:it.r,t:it.t,m:it.kind==='time'?(L[0]&&L[0][0])||it.m:it.m},S.weight); kcal += b.kcal||0; }
    });
    var lg = logOf(t); if(sets) lg.wo = 1; lsSet(S);
    s.phase = 'done'; s.sum = {min:Math.round((Date.now()-s.start)/60000), sets:sets, vol:Math.round(vol), kcal:Math.round(kcal), prs:prs};
    snd('win'); buzz('ok'); gwWake(false); clearInterval(gwOpen.p);
    gwRender();
    renderHome(); if(typeof renderToday==='function' && curR) renderToday(S,curR);
  }
  function gwDoneHtml(){
    var m = gwSt().sum;
    var h = '<div class="gw-done"><div class="gw-tro">'+kIco('<path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z"/><path d="M17 5h3v2a3 3 0 0 1-3 3M7 5H4v2a3 3 0 0 0 3 3"/>')+'</div><small>Workout complete</small><h2>Well done, '+esc(String(S.name||'').split(' ')[0])+'!</h2>';
    h += '<div class="gw-sum"><div><b>'+m.min+'</b><span>minutes</span></div><div><b>'+m.sets+'</b><span>sets</span></div><div><b>~'+m.kcal+'</b><span>kcal</span></div>'+(m.vol?'<div><b>'+fmt(m.vol)+'</b><span>kg lifted</span></div>':'')+'</div>';
    if(m.prs.length) h += '<div class="gw-pr2"><b>New best</b><span>'+m.prs.map(esc).join(' · ')+'</span></div>';
    h += '<p class="gw-tip">'+(m.sets?'Saved. Today’s workout is marked as done.':'No sets were done, so nothing was saved.')+'</p>';
    return h+'<button type="button" class="gw-go" data-gw="close">Finish</button></div>';
  }
  function gwAskQuit(){
    var s = gwSt(); if(!s) return;
    if(s.phase==='done'){ gwClose(); return; }
    var any = Object.keys(s.log).length;
    var box = document.createElement('div'); box.className = 'gw-ask';
    box.innerHTML = '<div><b>Leave the workout?</b><span>'+(any?'Save the sets you did and mark today’s workout as done, or leave without saving.':'Nothing has been saved yet.')+'</span><div class="gw-ab">'+(any?'<button type="button" class="gw-go" data-gw="savequit">Save and finish</button>':'')+'<button type="button" class="gw-ghost" data-gw="quitnow">Leave</button><button type="button" class="gw-ghost" data-gw="stay">Keep going</button></div></div>';
    $('gw').appendChild(box);
  }
  function kBack(){ if(gwOpenNow()){ var a = $('gw').querySelector('.gw-ask'); if(a) a.remove(); else gwAskQuit(); return true; } return false; }
  $('gw').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-gw]'); if(!b) return;
    var a = b.getAttribute('data-gw'), s = gwSt(); if(!s) return;
    var it = s.phase!=='done' ? gwCur() : null;
    if(a==='quit'){ gwAskQuit(); return; }
    if(a==='stay'){ var q = $('gw').querySelector('.gw-ask'); if(q) q.remove(); return; }
    if(a==='quitnow' || a==='close'){ gwClose(); return; }
    if(a==='savequit'){ gwFinish(); return; }
    buzz();
    if(a==='r-' || a==='r+'){ var rx = gwRx(it); rx.r = Math.max(0,Math.min(200,rx.r+(a==='r+'?1:-1))); $('gw-r').textContent = rx.r; return; }
    if(a==='k-' || a==='k+'){ var rk = gwRx(it), stp = rk.kg>=20 ? 2.5 : 1; rk.kg = Math.max(0,Math.min(400,Math.round((rk.kg+(a==='k+'?stp:-stp))*10)/10)); $('gw-k').textContent = rk.kg; return; }
    if(a==='done'){ if(s.phase==='timer' || it.kind==='reps') gwSetDone(); return; }
    if(a==='start'){ var sec = it.kind==='hold' ? it.t : it.m*60; s.phase = 'timer'; s.paused = false; s.left = sec; s.end = Date.now()+sec*1000; snd('nav'); gwRender(); return; }
    if(a==='pause'){ if(s.paused){ s.paused = false; s.end = Date.now()+s.left*1000; } else s.paused = true; gwRender(); return; }
    if(a==='skip'){ s.phase = 'ready'; gwRender(); return; }
    if(a==='r-15' || a==='r+15'){ s.end += (a==='r+15'?15:-15)*1000; s.left = (s.end-Date.now())/1000; if(s.left<=0){ s.phase = 'ready'; gwRender(); } else { var tt = $('gw-t'); if(tt) tt.textContent = mmss(s.left); } return; }
    if(a==='skipex'){ s.set = it.sets; gwAdvance(false); return; }
  });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && gwOpenNow()){ kBack(); } });
  document.addEventListener('click',function(ev){ var b = ev.target.closest && ev.target.closest('[data-gwstart]'); if(!b || !S) return; gwOpen(); });
  function gwStartBtn(){ return '<button type="button" class="gw-start" data-gwstart="1"><span class="gw-sp" aria-hidden="true">▶</span><span><b>Start guided workout</b><small>One exercise at a time with set and rest timers</small></span></button>'; }
  /* ==== KDN GUIDED WORKOUT END ==== */
