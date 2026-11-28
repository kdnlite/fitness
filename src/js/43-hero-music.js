  /* ==== hero: light background music (original track made for KDN). Browsers only allow sound after a tap,
     so it starts on the first tap anywhere unless the visitor turned it off; the button toggles it. ==== */
  (function(){
    var btn = document.querySelector('.lp-snd'), a = document.querySelector('.lp-music'); if(!btn || !a) return;
    var land = document.getElementById('s-landing');
    var KEY = 'kdn.music'; var pref = null; try{ pref = localStorage.getItem(KEY); }catch(e){}
    a.volume = .35; var want = pref !== 'off';
    function ui(on){ btn.classList.toggle('on', on); btn.setAttribute('aria-pressed', on ? 'true' : 'false'); btn.setAttribute('aria-label', on ? 'Turn music off' : 'Turn music on'); }
    function fade(to, ms){ var from = a.volume, t0 = performance.now(); (function step(){ var u = Math.min(1, (performance.now() - t0) / ms); a.volume = from + (to - from) * u; if(u < 1) requestAnimationFrame(step); else if(to === 0) a.pause(); })(); }
    function play(){ if(land && land.hidden) return; a.volume = 0; var p = a.play(); if(p && p.then) p.then(function(){ fade(.35, 900); ui(true); }).catch(function(){ ui(false); }); }
    function stop(){ fade(0, 400); ui(false); }
    btn.addEventListener('click', function(e){ e.stopPropagation(); want = a.paused; try{ localStorage.setItem(KEY, want ? 'on' : 'off'); }catch(_){} if(want) play(); else stop(); });
    function first(e){ if(btn.contains(e.target)) return; document.removeEventListener('pointerdown', first, true); document.removeEventListener('keydown', first, true); if(want && a.paused) play(); }
    document.addEventListener('pointerdown', first, true); document.addEventListener('keydown', first, true);
    document.addEventListener('visibilitychange', function(){ if(document.hidden){ if(!a.paused){ a.pause(); a._resume = true; } } else if(a._resume){ a._resume = false; play(); } });
    if(land) new MutationObserver(function(){ if(land.hidden && !a.paused) stop(); }).observe(land, { attributes: true, attributeFilter: ['hidden'] });
    ui(false);
  })();
