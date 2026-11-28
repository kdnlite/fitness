  /* ---------- Landing motion: counting stats, gold dust over the gym reel, 3D card reveal ---------- */
  (function(){
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var IO = 'IntersectionObserver' in window;
    function seen(el, cb, th){ if(!el) return; if(!IO){ cb(); return; } var o = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ o.disconnect(); cb(); } }); },{threshold:th||.3}); o.observe(el); }

    /* Stats count up from zero; each ring fills in step with its number. */
    var tr = document.querySelector('.lp-trust');
    if(tr){
      var bs = tr.querySelectorAll('b[data-n]'), fills = [.92,.74,.55];
      tr.querySelectorAll('li').forEach(function(li,i){ li.style.setProperty('--ring-to', Math.round(100-100*(fills[i]||.6))); });
      seen(tr, function(){
        tr.classList.add('on'); if(still) return;
        var t0 = performance.now(), dur = 1500;
        bs.forEach(function(b){ b.textContent = '0'; });
        (function step(t){ var k = Math.min(1,(t-t0)/dur), e = 1-Math.pow(1-k,3);
          bs.forEach(function(b){ b.textContent = Math.round(+b.dataset.n*e).toLocaleString('en-IN'); });
          if(k<1) requestAnimationFrame(step); })(t0);
      }, .5);
    }

    /* "What you get" cards rise in 3D one after another. */
    var cards = document.querySelectorAll('.lp-feat');
    if(cards.length && IO && !still){
      document.documentElement.classList.add('js3d');
      var o = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ var c = e.target, i = [].indexOf.call(cards,c); c.style.transitionDelay = (i%4)*110+'ms'; c.classList.add('in'); o.unobserve(c); } }); },{threshold:.15,rootMargin:'0px 0px -40px 0px'});
      cards.forEach(function(c){ o.observe(c); });
    }

    /* Gold dust drifting over the gym reel, only while it is on screen. */
    var cv = document.querySelector('.lp-dust');
    if(cv && !still && cv.getContext){
      var cx = cv.getContext('2d'), P = [], run = false, raf = 0, W = 0, H = 0, dpr = Math.min(2, window.devicePixelRatio||1);
      function size(){ W = cv.clientWidth; H = cv.clientHeight; cv.width = W*dpr; cv.height = H*dpr; cx.setTransform(dpr,0,0,dpr,0,0); }
      function mk(y){ return {x:Math.random()*W, y:y==null?Math.random()*H:y, r:.6+Math.random()*1.9, v:.15+Math.random()*.45, w:Math.random()*6.28, a:.25+Math.random()*.6}; }
      function frame(){ cx.clearRect(0,0,W,H);
        for(var i=0;i<P.length;i++){ var p = P[i]; p.y -= p.v; p.w += .015; p.x += Math.sin(p.w)*.3; if(p.y < -6) P[i] = mk(H+6);
          var g = cx.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3); g.addColorStop(0,'rgba(255,224,150,'+p.a+')'); g.addColorStop(1,'rgba(233,180,80,0)');
          cx.fillStyle = g; cx.beginPath(); cx.arc(p.x,p.y,p.r*3,0,6.283); cx.fill(); }
        if(run) raf = requestAnimationFrame(frame); }
      function start(){ if(run) return; size(); if(!P.length) for(var i=0;i<Math.round(W/14);i++) P.push(mk()); run = true; raf = requestAnimationFrame(frame); }
      function stop(){ run = false; cancelAnimationFrame(raf); }
      window.addEventListener('resize', function(){ if(run) size(); });
      if(IO) new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? start() : stop(); }); },{threshold:.05}).observe(cv); else start();
    }
  })();
  /* ---------- Dumbbell and dishes: play only while on screen; the dumbbell drifts with the scroll ---------- */
  (function(){
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(still || !('IntersectionObserver' in window)) return;
    var vids = document.querySelectorAll('#lpdb, .lp-dish video, .lp-gs video');
    var o = new IntersectionObserver(function(es){ es.forEach(function(e){ var v = e.target; if(e.isIntersecting){ var p = v.play(); if(p && p.catch) p.catch(function(){}); } else v.pause(); }); },{threshold:.25});
    vids.forEach(function(v){ o.observe(v); });
    var box = document.querySelector('.lp-db-v'), band = document.querySelector('.lp-db'), on = false, tick = false;
    if(!box || !band) return;
    new IntersectionObserver(function(es){ on = es[0].isIntersecting; }).observe(band);
    window.addEventListener('scroll', function(){ if(!on || tick) return; tick = true; requestAnimationFrame(function(){ tick = false;
      var r = band.getBoundingClientRect(), k = (r.top + r.height/2 - innerHeight/2) / innerHeight;
      box.style.transform = 'translateY('+(k*-40).toFixed(1)+'px) rotate('+(k*-14).toFixed(1)+'deg) scale('+(1.04-Math.abs(k)*.12).toFixed(3)+')'; }); }, {passive:true});
  })();
  /* ---------- Hero stage tilt and glass plan cards ---------- */
  (function(){
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(still) return;
    var fine = window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    /* The hero figure leans toward the pointer; on phones it follows the tilt of the device. */
    var st = document.querySelector('.lp-walk'), hero = document.querySelector('.lp-hero');
    if(st && hero){
      st.classList.add('tilt');
      var set = function(rx,ry){ st.style.transform = 'rotateX('+rx.toFixed(2)+'deg) rotateY('+ry.toFixed(2)+'deg)'; };
      if(fine){
        hero.addEventListener('pointermove', function(e){ var r = hero.getBoundingClientRect(); var x = (e.clientX-r.left)/r.width-.5, y = (e.clientY-r.top)/r.height-.5; st.classList.add('live'); set(-y*8, x*12); });
        hero.addEventListener('pointerleave', function(){ st.classList.remove('live'); set(0,0); });
      } else if('DeviceOrientationEvent' in window && typeof DeviceOrientationEvent.requestPermission !== 'function'){
        var raf = 0, gx = 0, gy = 0;
        window.addEventListener('deviceorientation', function(e){ if(e.beta==null) return; gx = Math.max(-1,Math.min(1,(e.beta-45)/30)); gy = Math.max(-1,Math.min(1,(e.gamma||0)/30));
          if(raf || document.getElementById('s-landing').hidden) return; raf = requestAnimationFrame(function(){ raf = 0; st.classList.add('live'); set(-gx*6, gy*9); }); }, {passive:true});
      }
    }

    /* Plan cards tilt under the pointer and catch a gold light where the pointer is. */
    if(!fine) return;
    document.querySelectorAll('.lp-plan').forEach(function(c){
      c.classList.add('glass');
      c.addEventListener('pointermove', function(e){ var r = c.getBoundingClientRect(), x = (e.clientX-r.left)/r.width, y = (e.clientY-r.top)/r.height;
        c.classList.add('hot','live'); c.style.setProperty('--mx',(x*100).toFixed(1)+'%'); c.style.setProperty('--my',(y*100).toFixed(1)+'%');
        c.style.transform = 'rotateX('+((.5-y)*10).toFixed(2)+'deg) rotateY('+((x-.5)*12).toFixed(2)+'deg) translateZ(8px)'; });
      c.addEventListener('pointerleave', function(){ c.classList.remove('hot','live'); c.style.transform = ''; });
    });
  })();
  /* ---------- 3D muscle map: tap a muscle to see its exercises, drag or tap Front/Back to turn ---------- */
  (function(){
    var stage = document.getElementById('lpbody'); if(!stage || typeof EXS==='undefined') return;
    var turn = stage.querySelector('.lp-body-turn'), still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* [muscle, cx, cy, rx, ry] in a 600x800 frame; each pair is mirrored left/right */
    var SPOTS = {
      front:[['Shoulders',212,175,26,32,1],['Chest',300,192,72,30],['Biceps',200,240,17,33,1],['Forearms',168,315,17,42,1],['Abs & core',300,282,45,72],['Quads',262,452,33,66,1],['Calves',249,605,20,50,1]],
      back:[['Back',300,215,72,72],['Shoulders',212,172,24,28,1],['Triceps',198,245,17,35,1],['Forearms',165,315,17,42,1],['Glutes',300,340,62,38],['Hamstrings',262,447,30,56,1],['Calves',255,566,24,46,1]]
    };
    var NS = 'http://www.w3.org/2000/svg';
    ['front','back'].forEach(function(side){
      var svg = stage.querySelector('.lp-body-face.'+side+' svg');
      SPOTS[side].forEach(function(s){
        [s[1]].concat(s[5] ? [600-s[1]] : []).forEach(function(cx){
          var e = document.createElementNS(NS,'ellipse'); e.setAttribute('class','lp-mu'); e.setAttribute('cx',cx); e.setAttribute('cy',s[2]); e.setAttribute('rx',s[3]); e.setAttribute('ry',s[4]);
          e.setAttribute('tabindex','0'); e.setAttribute('role','button'); e.setAttribute('aria-label',s[0]); e.dataset.mu = s[0]; svg.appendChild(e);
        });
      });
    });
    var byMu = {}; Object.keys(EXS).forEach(function(id){ var m = EXS[id].mu; if(m) (byMu[m] = byMu[m] || []).push(id); });
    var hasPic = function(id){ return (typeof EXPH!=='undefined' && EXPH[id]) ? 1 : 0; };
    var cur = null;
    function pick(mu){
      cur = mu; stage.querySelectorAll('.lp-mu').forEach(function(e){ e.classList.toggle('on', e.dataset.mu===mu); });
      var ids = (byMu[mu]||[]).slice().sort(function(a,b){ return hasPic(b)-hasPic(a) || EXS[a].eq-EXS[b].eq || (EXS[a].n<EXS[b].n?-1:1); });
      document.getElementById('lpmu-n').textContent = ids.length.toLocaleString('en-IN')+' exercises';
      document.getElementById('lpmu-h').textContent = mu;
      document.getElementById('lpmu-l').innerHTML = ids.slice(0,5).map(function(id){ return '<li>'+EXS[id].n.replace(/[<&]/g,'')+'</li>'; }).join('');
      var go = document.getElementById('lpmu-go'); go.hidden = false; go.textContent = 'See all '+mu.toLowerCase()+' exercises';
    }
    stage.addEventListener('click', function(e){ var m = e.target.closest && e.target.closest('.lp-mu'); if(m && !moved) pick(m.dataset.mu); });
    stage.addEventListener('keydown', function(e){ var m = e.target.closest && e.target.closest('.lp-mu'); if(m && (e.key==='Enter'||e.key===' ')){ e.preventDefault(); pick(m.dataset.mu); } });
    document.getElementById('lpmu-go').addEventListener('click', function(){ if(cur && typeof openLibrary==='function') openLibrary(cur); });

    /* Turning: buttons snap to front/back; dragging turns the body freely and settles on the nearest side. */
    var ang = 0, flips = document.querySelectorAll('.lp-body-flip button');
    function setAng(a, live){ ang = a; turn.classList.toggle('live', !!live); turn.style.transform = 'rotateY('+a+'deg)';
      var back = Math.round(((a%360)+360)%360/180)%2===1; flips.forEach(function(b){ b.classList.toggle('on', (b.dataset.side==='back')===back); }); }
    flips.forEach(function(b){ b.addEventListener('click', function(){ var want = b.dataset.side==='back' ? 180 : 0; var base = Math.round(ang/360)*360; setAng(base+want); }); });
    var x0 = null, a0 = 0, moved = false;
    stage.addEventListener('pointerdown', function(e){ x0 = e.clientX; a0 = ang; moved = false; });
    window.addEventListener('pointermove', function(e){ if(x0===null) return; var dx = e.clientX-x0; if(Math.abs(dx)>6){ moved = true; stage.classList.add('drag'); setAng(a0+dx*.6, true); } });
    window.addEventListener('pointerup', function(){ if(x0===null) return; x0 = null; stage.classList.remove('drag'); if(moved){ setAng(Math.round(ang/180)*180); setTimeout(function(){ moved = false; }, 0); } });
    /* A gentle sway invites people to turn it, until they touch it. */
    if(!still && 'IntersectionObserver' in window){
      var sway = true, t0 = 0, raf = 0;
      stage.addEventListener('pointerdown', function(){ sway = false; }, {once:true});
      flips.forEach(function(b){ b.addEventListener('click', function(){ sway = false; }); });
      new IntersectionObserver(function(es){ if(es[0].isIntersecting && sway && !raf){ t0 = performance.now(); (function f(t){ if(!sway){ raf = 0; return; } turn.classList.add('live'); turn.style.transform = 'rotateY('+(Math.sin((t-t0)/900)*14).toFixed(2)+'deg)'; raf = requestAnimationFrame(f); })(t0); } else if(!es[0].isIntersecting && raf){ cancelAnimationFrame(raf); raf = 0; } },{threshold:.3}).observe(stage);
    }
  })();
