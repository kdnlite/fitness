  /* ==== hero: soft background music (original track made for KDN). It starts gently on the first scroll,
     tap or key press. Browsers allow sound only after the visitor interacts, so if a plain scroll is not
     enough the first tap starts it. ==== */
  (function(){
    var a = document.querySelector('.lp-music'); if(!a) return;
    var land = document.getElementById('s-landing');
    var VOL = .16, started = false;
    function fade(to, ms, then){ var from = a.volume, t0 = performance.now(); (function step(){ var u = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * u; if(u < 1) requestAnimationFrame(step); else if(then) then(); })(); }
    function play(){
      if(started || (land && land.hidden)) return;
      a.volume = 0; var p = a.play();
      if(p && p.then) p.then(function(){ started = true; fade(VOL, 3000); off(); }).catch(function(){});
    }
    var EV = ['scroll','wheel','touchstart','touchend','pointerdown','keydown','click'];
    function on(){ EV.forEach(function(e){ window.addEventListener(e, play, { passive: true, capture: true }); }); }
    function off(){ EV.forEach(function(e){ window.removeEventListener(e, play, { capture: true }); }); }
    on();
    document.addEventListener('visibilitychange', function(){ if(!started) return; if(document.hidden) a.pause(); else if(!land || !land.hidden){ var p = a.play(); if(p && p.catch) p.catch(function(){}); } });
    if(land) new MutationObserver(function(){ if(land.hidden){ if(!a.paused) fade(0, 500, function(){ a.pause(); }); } else if(started && a.paused){ a.volume = 0; var p = a.play(); if(p && p.then) p.then(function(){ fade(VOL, 1500); }).catch(function(){}); } }).observe(land, { attributes: true, attributeFilter: ['hidden'] });
  })();
