  /* ---------- Plan, welcome, login and logout ---------- */
  function applyProfile(keepTab){ var t = curTab; curR = calc(S); render(S,curR); if(keepTab) setTab(t); }
  function openPlan(tab){ applyProfile(false); show('s-result'); setTab(tab||'today'); window.scrollTo(0,0); }
  function openHome(){ applyProfile(false); show('s-home'); setTimeout(function(){ motionAuto(); motionAsk(); },700); }
  function editSaved(){ D = clone(S); editing = null; rvErr = {}; setReviewMode(true); renderReview(); $('rverr').textContent=''; show('s-review'); }
  function renderWelcome(){
    var w = $('welcome');
    if(!S){ w.hidden = true; w.innerHTML = ''; return; }
    w.hidden = false;
    w.innerHTML = '<div><b>Welcome back, '+esc(S.name)+'</b><span>'+esc(goalLine(S))+'</span></div><div class="wb"><button type="button" class="btn sm" data-w="open">Open my home</button><button type="button" class="btn sm ghost" data-w="edit">Edit plan</button></div>';
  }
  function syncAuth(){
    var on = !!S;
    if(typeof kMenuSync==='function') try{ kMenuSync(); }catch(e){}
    $('m-edit').hidden = !on; $('m-out').hidden = !on; $('mwho').hidden = !on;
    if(on){ $('mwho').innerHTML = '<b>'+esc(S.name)+'</b><small>Logged in on this device</small>'; $('mwho').setAttribute('data-i', String(S.name||'?').trim().charAt(0).toUpperCase()); }
    $('b-start1').textContent = on ? 'Open my home' : 'Get Started';
    syncNav();
  }
  $('welcome').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-w]'); if(!b) return;
    if(b.getAttribute('data-w')==='open') openHome(); else editSaved();
  });
  $('b-edit').addEventListener('click',editSaved);
  function askLogout(){ $('lgm').hidden = false; $('lg-no').focus(); }
  function closeLogout(){ $('lgm').hidden = true; }
  $('lg-no').addEventListener('click',closeLogout);
  $('lgm').addEventListener('click',function(ev){ if(ev.target===$('lgm')) closeLogout() });
  $('lg-yes').addEventListener('click',function(){
    closeLogout();
    sensorStop(); lsDel(); try{ localStorage.removeItem('kdn.gym.v1'); }catch(e){} if(typeof hClearAll==='function') hClearAll(); S = null; curR = null; viewDow = null; userKg = null; figG = null; D = null; f.reset(); amtGoal = null; tKey = null;
    $('home').innerHTML = '';
    syncAuth(); renderWelcome(); renderLibrary(); setFoodDiet('veg');
    go('home');
    toast('Logged out. Your saved details were removed from this device.');
  });
  var toastT = null;
  function toast(msg){
    var t = $('toast'); t.textContent = msg; t.hidden = false;
    clearTimeout(toastT); toastT = setTimeout(function(){t.hidden = true},3200);
  }
  /* ---------- Bottom navigation (phone app style) ---------- */
  var NAVSCREENS = ['s-home','s-result','s-library','s-foods','s-about','s-health'];
  function syncNav(){
    var on = !!S && NAVSCREENS.indexOf(curScreen)>=0;
    $('bnav').hidden = !on;
    document.body.classList.toggle('hasnav',on);
    if(!on) return;
    var key = curScreen==='s-home' ? 'home' : curScreen==='s-result' ? curTab : '';
    Array.prototype.forEach.call($('bnav').querySelectorAll('button'),function(b){
      var a = b.getAttribute('data-nav')===key;
      b.classList.toggle('on',a); if(a) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
  }
  $('bnav').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-nav]'); if(!b || !S) return;
    var k = b.getAttribute('data-nav');
    if(k==='home'){ applyProfile(true); show('s-home'); return; }
    show('s-result'); setTab(k); window.scrollTo(0,0);
  });

  /* ---------- Exercise demo videos (animated drawings) ---------- */
  var REDUCED = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var DUR = {squat:3.6,pushup:3,row:3.4,plank:4,walk:1.1,run:0.7,lunge:3.6,bridge:3.2,legraise:3.2,climber:0.9,ohpress:3.4,curl:3.4,dips:3,bench:3.6,pushdown:2.8,pullup:3.8,rdl:3.8,calf:2.4,yoga:6,stretch:6,skip:0.8,outdoor:0.7,
    jacks:0.9,highknees:0.7,burpee:4.5,wallsit:6,superman:3.2,crunch:2.8,stepup:3.2,birddog:4,latpull:3.4,frontraise:3,cablerow:3.2,cycle:1.6,deadlift:4,hangraise:3.4,kbswing:2,goblet:3.6,invrow:3.4};
  /* Real exercise videos are streamed from our server; photos stay inside the app.
     VBASE = folder on the server, VIDS = which exercises already have a video. */
  var VBASE = 'https://videos.kdnfitness.app/';
  var VIDS = {m:{}, f:{}};
  function vidOf(id){ var g = fg(), o = g==='f' ? 'm' : 'f'; return VIDS[g][id] ? g : (VIDS[o][id] ? o : null); }
  function realPlayerHtml(id,vg){
    var P = ephOf(id), src = VBASE+vg+'/'+id+'.mp4';
    return '<div class="rplayer"><div class="vframe"><span class="vtag">Video · '+(vg==='f'?'female':'male')+'</span>'+
      '<video class="rvid" src="'+src+'" '+(P?'poster="'+P[0]+'" ':'')+'muted loop playsinline preload="none"></video>'+
      '<button type="button" class="rvplay" aria-label="Play video"><span class="ic"></span></button></div>'+
      '<div class="vctl"><div class="vsp" role="group" aria-label="Playback speed"><button type="button" data-rsp="0.5">0.5×</button><button type="button" data-rsp="1" class="on">1×</button></div></div></div>';
  }
  function playerHtml(id){
    var vg = vidOf(id); if(vg) return realPlayerHtml(id,vg);
    var e = EXS[id], c = CAL[id], g = fg();
    var unit = c.k==='reps' ? 'Rep' : (PL[e.fig].length===1 ? 'Hold' : 'Cycle');
    var yt = 'https://www.youtube.com/results?search_query='+encodeURIComponent(e.n+' exercise proper form');
    return '<div class="player" data-id="'+id+'" data-unit="'+unit+'" data-g="'+g+'"><div class="vframe"><span class="vtag">Animated demo · '+(g==='f'?'female':'male')+'</span><div class="vstage">'+figs(id,g)[0]+'</div><span class="vcount">'+unit+' 0</span></div>'+
      '<div class="vbar" aria-hidden="true"><i></i></div>'+
      '<div class="vctl"><button type="button" class="vplay" aria-label="Play demo"><span class="ic"></span></button>'+
      '<div class="vsp" role="group" aria-label="Playback speed"><button type="button" data-sp="0.5" aria-pressed="false">0.5×</button><button type="button" data-sp="1" aria-pressed="true" class="on">1×</button><button type="button" data-sp="1.5" aria-pressed="false">1.5×</button></div>'+
      '<a class="yt" href="'+yt+'" target="_blank" rel="noopener">Real videos on YouTube</a></div></div>';
  }

  document.addEventListener('click',function(ev){
    var t = ev.target, rp = t.closest && t.closest('.rplayer'); if(!rp) return;
    var v = rp.querySelector('video');
    var sp = t.closest('[data-rsp]');
    if(sp){ v.playbackRate = +sp.getAttribute('data-rsp'); rp.querySelectorAll('[data-rsp]').forEach(function(b){b.classList.toggle('on',b===sp)}); return; }
    if(t.closest('.vframe')){ if(v.paused){ var pr=v.play(); if(pr&&pr.catch) pr.catch(function(){}); rp.classList.add('on'); } else { v.pause(); rp.classList.remove('on'); } }
  });
  document.addEventListener('error',function(ev){ var v=ev.target; if(v&&v.classList&&v.classList.contains('rvid')){ var rp=v.closest('.rplayer'); if(rp) rp.style.display='none'; } },true);
  function complete(j){
    var c = {h:j.h.slice(),n:j.n.slice(),p:j.p.slice(),pre:j.pre||'',eq:j.eq||'',a:[],l:[]};
    for(var i=0;i<2;i++){
      var a = j.a[i]||j.a[0], l = j.l[i]||j.l[0];
      c.a.push([a[0].slice(),a[1].slice()]);
      var toe = l[2] || [l[1][0]+8,l[1][1]+1];
      c.l.push([l[0].slice(),l[1].slice(),toe.slice()]);
    }
    return c;
  }
  function mixP(p,q,t){return [p[0]+(q[0]-p[0])*t, p[1]+(q[1]-p[1])*t]}
  function mixPose(A,B,t){
    var o = {h:mixP(A.h,B.h,t),n:mixP(A.n,B.n,t),p:mixP(A.p,B.p,t),pre:A.pre,a:[],l:[]};
    for(var i=0;i<2;i++){
      o.a.push([mixP(A.a[i][0],B.a[i][0],t),mixP(A.a[i][1],B.a[i][1],t)]);
      o.l.push([mixP(A.l[i][0],B.l[i][0],t),mixP(A.l[i][1],B.l[i][1],t),mixP(A.l[i][2],B.l[i][2],t)]);
    }
    o.eq = (A.eq===B.eq) ? A.eq : '<g opacity="'+(1-t).toFixed(2)+'">'+A.eq+'</g><g opacity="'+t.toFixed(2)+'">'+B.eq+'</g>';
    return o;
  }
  var players = [], raf = null, lastT = 0;
  function mkPlayer(root){
    if(root._p) return root._p;
    var id = root.getAttribute('data-id'), e = EXS[id], poses = PL[e.fig];
    var P = poses.map(complete);
    if(P.length===1){ var B = complete(poses[0]); B.h[1] -= 1.6; B.n[1] -= 1.2; P.push(B); }
    var p = {root:root,stage:root.querySelector('.vstage'),bar:root.querySelector('.vbar i'),badge:root.querySelector('.vcount'),btn:root.querySelector('.vplay'),
      P:P,g:root.getAttribute('data-g')||'m',dur:DUR[id]||DUR[e.fig]||3,speed:1,playing:false,phase:0,unit:root.getAttribute('data-unit'),hold:poses.length===1};
    root._p = p;
    return p;
  }
  function cyc(P,phase,hold){
    var fr = phase - Math.floor(phase), N = P.length;
    if(hold) return mixPose(P[0],P[1],(1 - Math.cos(fr*Math.PI*2))/2);
    var x = fr*N, i = Math.floor(x), u = (1 - Math.cos((x-i)*Math.PI))/2;
    return mixPose(P[i],P[(i+1)%N],u);
  }
  function draw(p){
    var fr = p.phase - Math.floor(p.phase);
    p.stage.innerHTML = frame(cyc(p.P,p.phase,p.hold),p.g);
    p.bar.style.width = (fr*100).toFixed(1)+'%';
    p.badge.textContent = p.hold ? 'Hold '+Math.floor(p.phase*p.dur)+' s' : p.unit+' '+Math.floor(p.phase);
  }
  function setPlaying(p,on){
    p.playing = on;
    p.btn.classList.toggle('on',on);
    p.btn.setAttribute('aria-label', on ? 'Pause demo' : 'Play demo');
    if(on){ if(players.indexOf(p)<0) players.push(p); kick(); }
  }
  function kick(){ if(!raf){ lastT = performance.now(); raf = requestAnimationFrame(tick); } }
  function tick(ts){
    raf = null;
    var dt = Math.min(0.1,(ts-lastT)/1000); lastT = ts;
    var any = false;
    players.forEach(function(p){
      if(!p.playing) return;
      var d = p.root.closest('details');
      if(!p.root.isConnected || (d && !d.open)){ setPlaying(p,false); return; }
      any = true;
      p.phase += dt*p.speed/p.dur;
      draw(p);
    });
    if(any) raf = requestAnimationFrame(tick);
  }
  document.addEventListener('toggle',function(ev){
    var d = ev.target;
    if(d.classList && d.classList.contains('fd')){
      if(d.open && !d._f){ d._f = 1; fillDish(d); }
      return;
    }
    if(!d.classList || !d.classList.contains('ex')) return;
    if(d.classList.contains('lz') && !d._f){ d._f = 1; var lid = d.getAttribute('data-id'); d.querySelector('.lzb').innerHTML = exBody(lid,libItem(lid),true); }
    var root = d.querySelector('.player'); if(!root) return;
    var p = mkPlayer(root);
    if(d.open){ draw(p); if(!REDUCED) setPlaying(p,true); }
    else setPlaying(p,false);
  },true);
  document.addEventListener('click',function(ev){
    var pb = ev.target.closest('.vplay');
    if(pb){ var p = mkPlayer(pb.closest('.player')); setPlaying(p,!p.playing); return; }
    var sb = ev.target.closest('.vsp button');
    if(sb){
      var p2 = mkPlayer(sb.closest('.player'));
      p2.speed = parseFloat(sb.getAttribute('data-sp'));
      Array.prototype.forEach.call(sb.parentNode.children,function(x){var on = (x===sb); x.classList.toggle('on',on); x.setAttribute('aria-pressed',on)});
    }
  });


