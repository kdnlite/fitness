  /* ==== hero: after the walk-in the athletes clap, chat, flex and toss a star at Get Started ==== */
  (function(){
    var fig = document.querySelector('.lp-still'); if(!fig) return;
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var land = document.getElementById('s-landing');
    var poses = {}; fig.querySelectorAll('.lp-pose').forEach(function(p){ poses[p.dataset.pose] = p; });
    var idle = fig.querySelectorAll('.lp-hm, .lp-hw');
    var sl = function(ms){ return new Promise(function(r){ setTimeout(r, ms); }); };
    var visible = false, running = false;
    function load(p){ if(p.dataset.src && !p.src){ p.src = p.dataset.src; if(p.dataset.srcset) p.srcset = p.dataset.srcset; } return p.decode ? p.decode().catch(function(){}) : Promise.resolve(); }
    async function showPose(name, ms){
      var p = poses[name]; if(!p) return; await load(p);
      p.classList.add('on'); idle.forEach(function(i){ i.classList.add('off'); });
      await sl(ms);
      p.classList.remove('on'); idle.forEach(function(i){ i.classList.remove('off'); });
    }
    function star(){
      var btn = document.getElementById('b-start1'); var p = poses.throw; if(!btn || !p) return;
      var fr = fig.getBoundingClientRect(), br = btn.getBoundingClientRect();
      var hx = fr.left + fr.width * (+p.dataset.hx || .7), hy = fr.top + fr.height * (+p.dataset.hy || .3);
      var tx = br.left + br.width * .5, ty = br.top + br.height * .5;
      var ball = document.createElement('div'); ball.className = 'lp-ball'; document.body.appendChild(ball);
      var cx = (hx + tx) / 2, cy = Math.min(hy, ty) - Math.max(120, Math.abs(tx - hx) * .35);
      var kf = []; for(var i = 0; i <= 24; i++){ var t = i / 24, x = (1-t)*(1-t)*hx + 2*(1-t)*t*cx + t*t*tx, y = (1-t)*(1-t)*hy + 2*(1-t)*t*cy + t*t*ty; kf.push({ transform: 'translate(' + x + 'px,' + y + 'px) scale(' + (0.6 + t * .6) + ')' }); }
      var a = ball.animate(kf, { duration: 1150, easing: 'cubic-bezier(.35,.1,.25,1)', fill: 'forwards' });
      a.onfinish = function(){
        ball.remove();
        var s = document.createElement('div'); s.className = 'lp-star'; s.style.left = tx + 'px'; s.style.top = ty + 'px';
        s.innerHTML = '<svg viewBox="0 0 24 24"><path d="M12 2l2.9 6.6 7.1.6-5.4 4.7 1.6 7L12 17.3 5.8 20.9l1.6-7L2 9.2l7.1-.6z"/></svg>' + '<i></i><i></i><i></i><i></i><i></i><i></i>';
        document.body.appendChild(s); setTimeout(function(){ s.remove(); }, 1400);
        btn.classList.remove('lp-shine'); void btn.offsetWidth; btn.classList.add('lp-shine');
        setTimeout(function(){ btn.classList.remove('lp-shine'); }, 2400);
      };
    }
    async function loop(){
      if(running) return; running = true;
      await sl(3200);
      var seq = [['clap',1700],['talk',2400],['flex',2000],['throw',1900]];
      while(visible && !land.hidden){
        for(var i = 0; i < seq.length && visible && !land.hidden; i++){
          var n = seq[i][0];
          if(n === 'throw'){ var pr = showPose('throw', seq[i][1]); await sl(260); star(); await pr; }
          else await showPose(n, seq[i][1]);
          await sl(2600);
        }
      }
      running = false;
    }
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ visible = es[0].isIntersecting; if(visible) loop(); },{threshold:.35}).observe(fig);
    }
  })();
