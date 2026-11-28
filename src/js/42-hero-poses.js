  /* ==== hero: one continuous looping Grok video; when her ball peaks, a gold star flies to Get Started ==== */
  (function(){
    var fig = document.querySelector('.lp-still'); if(!fig) return;
    var v = fig.querySelector('.lp-loop'); if(!v) return;
    var land = document.getElementById('s-landing');
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    if(reduce){ v.removeAttribute('autoplay'); v.pause(); return; }
    var fired = false, last = 0;
    v.addEventListener('timeupdate', function(){
      var t = v.currentTime;
      if(t < last) fired = false;            /* the loop restarted */
      last = t;
      if(!fired && t >= +v.dataset.starT){ fired = true; star(); }
    });
    function star(){
      var btn = document.getElementById('b-start1'); if(!btn || land.hidden) return;
      var fr = fig.getBoundingClientRect(), br = btn.getBoundingClientRect();
      if(fr.bottom < 0 || fr.top > innerHeight) return;
      var hx = fr.left + fr.width * (+v.dataset.starX), hy = fr.top + fr.height * (+v.dataset.starY);
      var tx = br.left + br.width * .5, ty = br.top + br.height * .5;
      var ball = document.createElement('div'); ball.className = 'lp-ball'; document.body.appendChild(ball);
      var cx = hx + (tx - hx) * .35, cy = Math.min(hy, ty) - 120;
      var kf = []; for(var i = 0; i <= 24; i++){ var u = i / 24, x = (1-u)*(1-u)*hx + 2*(1-u)*u*cx + u*u*tx, y = (1-u)*(1-u)*hy + 2*(1-u)*u*cy + u*u*ty; kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) scale(' + (0.6 + u * .7) + ')' }); }
      var a = ball.animate(kf, { duration: 1200, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' });
      a.onfinish = function(){
        ball.remove();
        var s = document.createElement('div'); s.className = 'lp-star'; s.style.left = tx + 'px'; s.style.top = ty + 'px';
        s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg><i></i><i></i><i></i><i></i><i></i><i></i>';
        document.body.appendChild(s); setTimeout(function(){ s.remove(); }, 1400);
        btn.classList.remove('lp-shine'); void btn.offsetWidth; btn.classList.add('lp-shine');
        setTimeout(function(){ btn.classList.remove('lp-shine'); }, 4100);
      };
    }
    /* pause when off screen to save battery */
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ if(es[0].isIntersecting){ var p = v.play(); if(p && p.catch) p.catch(function(){}); } else v.pause(); },{threshold:.1}).observe(fig);
    }
  })();
