  /* ==== hero: after the walk-in the athletes clap, chat, flex and toss a ball that lights up Get Started (Grok clips) ==== */
  (function(){
    var fig = document.querySelector('.lp-still'); if(!fig) return;
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var land = document.getElementById('s-landing');
    var clips = {}; fig.querySelectorAll('.lp-clip').forEach(function(v){ clips[v.dataset.clip] = v; });
    var idle = fig.querySelectorAll('.lp-hm, .lp-hw');
    var sl = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
    var visible = false, running = false;

    function play(name){
      var v = clips[name]; if(!v) return Promise.resolve();
      return new Promise(function(done){
        var fired = false, finish = function(){
          v.removeEventListener('ended', finish); v.removeEventListener('timeupdate', tick);
          idle.forEach(function(i){ i.classList.remove('off'); });
          v.classList.remove('on'); setTimeout(done, 260);
        };
        var tick = function(){ if(!fired && v.dataset.exitT && v.currentTime >= +v.dataset.exitT){ fired = true; star(v); } };
        v.addEventListener('ended', finish); v.addEventListener('timeupdate', tick);
        try{ v.currentTime = 0; }catch(e){}
        var p = v.play();
        var show = function(){ v.classList.add('on'); setTimeout(function(){ idle.forEach(function(i){ i.classList.add('off'); }); }, 250); };
        if(p && p.then) p.then(show).catch(function(){ done(); }); else show();
      });
    }

    function star(v){
      var btn = document.getElementById('b-start1'); if(!btn) return;
      var fr = fig.getBoundingClientRect(), br = btn.getBoundingClientRect();
      var hx = fr.left + fr.width * (+v.dataset.exitX), hy = fr.top + fr.height * (+v.dataset.exitY);
      var tx = br.left + br.width * .5, ty = br.top + br.height * .5;
      var ball = document.createElement('div'); ball.className = 'lp-ball'; document.body.appendChild(ball);
      var cx = hx + (tx - hx) * .35, cy = Math.min(hy, ty) - 140;
      var kf = []; for(var i = 0; i <= 24; i++){ var t = i / 24, x = (1-t)*(1-t)*hx + 2*(1-t)*t*cx + t*t*tx, y = (1-t)*(1-t)*hy + 2*(1-t)*t*cy + t*t*ty; kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) scale(' + (0.8 + t * .5) + ')' }); }
      var a = ball.animate(kf, { duration: 1200, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' });
      a.onfinish = function(){
        ball.remove();
        var s = document.createElement('div'); s.className = 'lp-star'; s.style.left = tx + 'px'; s.style.top = ty + 'px';
        s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg><i></i><i></i><i></i><i></i><i></i><i></i>';
        document.body.appendChild(s); setTimeout(function(){ s.remove(); }, 1400);
        btn.classList.remove('lp-shine'); void btn.offsetWidth; btn.classList.add('lp-shine');
        setTimeout(function(){ btn.classList.remove('lp-shine'); }, 2400);
      };
    }

    async function loop(){
      if(running) return; running = true;
      Object.keys(clips).forEach(function(k){ clips[k].preload = 'auto'; });
      await sl(3000);
      var seq = ['clap', 'talk', 'flex', 'throw'];
      while(visible && !land.hidden){
        for(var i = 0; i < seq.length && visible && !land.hidden; i++){ await play(seq[i]); await sl(2200); }
      }
      running = false;
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible) loop(); },{threshold:.35}).observe(fig);
    }
  })();
