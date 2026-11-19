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
    var vids = document.querySelectorAll('#lpdb, .lp-dish video');
    var o = new IntersectionObserver(function(es){ es.forEach(function(e){ var v = e.target; if(e.isIntersecting){ var p = v.play(); if(p && p.catch) p.catch(function(){}); } else v.pause(); }); },{threshold:.25});
    vids.forEach(function(v){ o.observe(v); });
    var box = document.querySelector('.lp-db-v'), band = document.querySelector('.lp-db'), on = false, tick = false;
    if(!box || !band) return;
    new IntersectionObserver(function(es){ on = es[0].isIntersecting; }).observe(band);
    window.addEventListener('scroll', function(){ if(!on || tick) return; tick = true; requestAnimationFrame(function(){ tick = false;
      var r = band.getBoundingClientRect(), k = (r.top + r.height/2 - innerHeight/2) / innerHeight;
      box.style.transform = 'translateY('+(k*-40).toFixed(1)+'px) rotate('+(k*-14).toFixed(1)+'deg) scale('+(1.04-Math.abs(k)*.12).toFixed(3)+')'; }); }, {passive:true});
  })();
