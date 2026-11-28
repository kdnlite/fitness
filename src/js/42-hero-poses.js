  /* ==== hero: one long Grok video (about 2 min) that keeps playing while the page scrolls and loops at the end.
     At each cue an object (ball, football, shuttle) flies from the video to Get Started, bursts into a gold
     star and the sparks fall down. Cues: data-cues='[{"t":12.2,"x":.56,"y":.21,"k":"ball"}, ...]' ==== */
  (function(){
    var fig = document.querySelector('.lp-still'); if(!fig) return;
    var v = fig.querySelector('.lp-loop'); if(!v) return;
    var land = document.getElementById('s-landing');
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches){ v.removeAttribute('autoplay'); v.pause(); return; }
    var cues = []; try{ cues = JSON.parse(v.dataset.cues || '[]'); }catch(e){}
    var done = {}, last = 0;
    /* browsers pause muted videos that are off screen; keep a clock so it resumes where it would have been */
    var t0 = null;
    function sync(){ if(!v.duration || t0 === null) return; var t = ((performance.now() - t0) / 1000) % v.duration; if(Math.abs(t - v.currentTime) > .6){ try{ v.currentTime = t; }catch(e){} } }
    v.addEventListener('playing', function(){ if(t0 === null) t0 = performance.now() - v.currentTime * 1000; });
    if('IntersectionObserver' in window) new IntersectionObserver(function(es){ if(es[0].isIntersecting){ sync(); var p = v.play(); if(p && p.catch) p.catch(function(){}); } },{threshold:.05}).observe(fig);
    document.addEventListener('visibilitychange', function(){ if(!document.hidden){ sync(); var p = v.play(); if(p && p.catch) p.catch(function(){}); } });
    v.addEventListener('timeupdate', function(){
      var t = v.currentTime;
      if(t < last - 1) done = {};            /* the video looped */
      last = t;
      cues.forEach(function(c, i){ if(!done[i] && t >= c.t && t < c.t + 1.5){ done[i] = 1; fly(c); } });
    });
    var ICON = {
      ball: '',
      football: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" fill="#fff" stroke="#111" stroke-width="1"/><path d="M12 7.2l3.4 2.5-1.3 4h-4.2l-1.3-4z" fill="#111"/><path d="M12 7.2V3M15.4 9.7l3.9-1.3M14.1 13.7l2.4 3.3M9.9 13.7l-2.4 3.3M8.6 9.7L4.7 8.4" stroke="#111" stroke-width="1"/></svg>',
      shuttle: '<svg viewBox="0 0 24 24"><path d="M12 22a3 3 0 0 1-3-3h6a3 3 0 0 1-3 3z" fill="#E9CF9C"/><path d="M9 19L5 4h14l-4 15z" fill="#fff" stroke="#bbb" stroke-width=".6"/><path d="M8 6.5h8M8.6 9h6.8M9.3 11.5h5.4M10 14h4M12 4v15M8 4l3 15M16 4l-3 15" stroke="#ccc" stroke-width=".5"/></svg>'
    };
    function visible(el){ var r = el.getBoundingClientRect(); return r.bottom > 0 && r.top < innerHeight && r.width > 0; }
    function fly(c){
      var btn = document.getElementById('b-start1'); if(!btn || land.hidden) return;
      if(!visible(fig) || !visible(btn)) return;           /* only when both are on screen */
      var fr = fig.getBoundingClientRect(), br = btn.getBoundingClientRect();
      var hx = fr.left + fr.width * c.x, hy = fr.top + fr.height * c.y;
      var tx = br.left + br.width * .5, ty = br.top + br.height * .5;
      var o = document.createElement('div'); o.className = 'lp-ball lp-ball-' + (c.k || 'ball'); o.innerHTML = ICON[c.k] || ''; document.body.appendChild(o);
      var cx = hx + (tx - hx) * .35, cy = Math.min(hy, ty) - 120;
      var kf = []; for(var i = 0; i <= 24; i++){ var u = i / 24, x = (1-u)*(1-u)*hx + 2*(1-u)*u*cx + u*u*tx, y = (1-u)*(1-u)*hy + 2*(1-u)*u*cy + u*u*ty; kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) scale(' + (0.6 + u * .7) + ') rotate(' + (u * 540) + 'deg)' }); }
      var a = o.animate(kf, { duration: 1300, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' });
      a.onfinish = function(){ o.remove(); burst(tx, ty, btn); };
    }
    function burst(x, y, btn){
      var s = document.createElement('div'); s.className = 'lp-star'; s.style.left = x + 'px'; s.style.top = y + 'px';
      var h = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>';
      for(var i = 0; i < 14; i++){
        var ang = -Math.PI * (0.1 + 0.8 * Math.random()), sp = 50 + Math.random() * 70;
        var dx = Math.cos(ang) * sp * (Math.random() < .5 ? -1 : 1), up = Math.sin(ang) * sp, fall = 140 + Math.random() * 120;
        h += '<b style="--dx:' + dx.toFixed(0) + 'px;--up:' + up.toFixed(0) + 'px;--fall:' + fall.toFixed(0) + 'px;--d:' + (1.2 + Math.random() * .6).toFixed(2) + 's;--sz:' + (5 + Math.random() * 7).toFixed(0) + 'px"></b>';
      }
      s.innerHTML = h; document.body.appendChild(s); setTimeout(function(){ s.remove(); }, 2200);
      btn.classList.remove('lp-shine'); void btn.offsetWidth; btn.classList.add('lp-shine');
      setTimeout(function(){ btn.classList.remove('lp-shine'); }, 4100);
    }
  })();
