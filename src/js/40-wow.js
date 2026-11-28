  /* ==== KDN WOW START ==== activity rings, confetti and the perfect-day screen, today's muscles, medal spin, swipe to swap a meal */
  var KREDUCE = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- three rings like a watch: steps (outer), workout (middle), water (inner) ---- */
  function kRings(sc){
    var R = [[29,sc.st/40,'st','Steps'],[22,sc.wo/30,'wo','Workout'],[15,sc.wa/20,'wa','Water']];
    return '<svg class="ek-ring k3" viewBox="0 0 72 72" width="72" height="72" role="img" aria-label="Steps '+Math.round(sc.st/40*100)+'%, workout '+(sc.wo?'done':'not done')+', water '+Math.round(sc.wa/20*100)+'%">'+R.map(function(r){
      var c = 2*Math.PI*r[0], v = Math.max(0,Math.min(1,r[1]));
      return '<circle cx="36" cy="36" r="'+r[0]+'" class="bg '+r[2]+'"/><circle cx="36" cy="36" r="'+r[0]+'" class="fg '+r[2]+'" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-v)).toFixed(1)+'" style="--c:'+c.toFixed(1)+'"/>';
    }).join('')+'</svg>';
  }

  /* ---- confetti burst over any element (or the whole screen) ---- */
  function kConfetti(host){
    if(KREDUCE) return;
    var cv = document.createElement('canvas'); cv.className = 'kconf'; (host||document.body).appendChild(cv);
    var W = cv.width = cv.clientWidth || innerWidth, H = cv.height = cv.clientHeight || innerHeight, cx = cv.getContext('2d'), P = [], C = ['#F5C542','#E9CF9C','#FFFFFF','#FF8A5B','#5FD3A8'];
    for(var i=0;i<140;i++) P.push({x:W/2+(Math.random()-.5)*W*.3, y:H*.35, vx:(Math.random()-.5)*11, vy:-Math.random()*12-4, s:4+Math.random()*6, r:Math.random()*6, vr:(Math.random()-.5)*.3, c:C[i%C.length]});
    var t0 = performance.now();
    (function f(t){ cx.clearRect(0,0,W,H); var k = (t-t0)/2200;
      P.forEach(function(p){ p.vy += .32; p.vx *= .99; p.x += p.vx; p.y += p.vy; p.r += p.vr; cx.save(); cx.globalAlpha = Math.max(0,1-k); cx.translate(p.x,p.y); cx.rotate(p.r); cx.fillStyle = p.c; cx.fillRect(-p.s/2,-p.s/4,p.s,p.s/2); cx.restore(); });
      if(k<1) requestAnimationFrame(f); else cv.remove(); })(t0);
  }

  /* ---- the perfect-day screen: shown once on the day the score first reaches 100 ---- */
  function kCelebrate(){
    if(document.querySelector('.kcel')) return;
    var el = document.createElement('div'); el.className = 'kcel'; el.setAttribute('role','dialog'); el.setAttribute('aria-modal','true'); el.setAttribute('aria-label','Perfect day');
    el.innerHTML = '<div class="kcel-box"><img src="assets/kdn-hero2-end.webp" alt="The KDN athletes cheering" width="928" height="696"><small>Perfect day</small><h2>100 out of 100!</h2><p>Steps, workout, water and food all done. Keep the streak going tomorrow.</p><button type="button" class="btn">Thanks!</button></div>';
    document.body.appendChild(el);
    requestAnimationFrame(function(){ el.classList.add('on'); });
    try{ snd('win'); buzz('ok'); }catch(e){}
    setTimeout(function(){ kConfetti(el); },250);
    var close = function(){ el.classList.remove('on'); setTimeout(function(){ el.remove(); },300); };
    el.addEventListener('click',function(e){ if(e.target===el || e.target.closest('button')) close(); });
  }

  /* ---- today's muscles on a small body, front and back ---- */
  var KSPOTS = {
    front:[['Shoulders',212,175,26,32,1],['Chest',300,192,72,30],['Biceps',200,240,17,33,1],['Forearms',168,315,17,42,1],['Abs & core',300,282,45,72],['Quads',262,452,33,66,1],['Calves',249,605,20,50,1]],
    back:[['Back',300,215,72,72],['Shoulders',212,172,24,28,1],['Triceps',198,245,17,35,1],['Forearms',165,315,17,42,1],['Glutes',300,340,62,38],['Hamstrings',262,447,30,56,1],['Calves',255,566,24,46,1]]
  };
  function kBodyMini(mus){
    var on = {}, all = false;
    mus.forEach(function(m){ if(!m) return; if(m==='Full body') all = true; else on[m] = 1; });
    var names = Object.keys(on).filter(function(m){ return m!=='Cardio' && m!=='Mobility'; });
    if(!names.length && !all) return '';
    var face = function(side){ return '<div class="kbm-f"><img src="assets/kdn-body-'+side+'.webp" alt="" width="900" height="1200" loading="lazy" decoding="async"><svg viewBox="0 0 600 800" aria-hidden="true">'+
      KSPOTS[side].filter(function(s){ return all || on[s[0]]; }).map(function(s){ return [s[1]].concat(s[5]?[600-s[1]]:[]).map(function(x){ return '<ellipse cx="'+x+'" cy="'+s[2]+'" rx="'+s[3]+'" ry="'+s[4]+'"/>'; }).join(''); }).join('')+'</svg></div>'; };
    var list = all ? 'Your whole body' : names.join(', ');
    return '<div class="kbm"><div class="kbm-figs">'+face('front')+face('back')+'</div><div class="kbm-tx"><small>Today you train</small><b>'+esc(list)+'</b></div></div>';
  }

  /* ---- badges spin like a coin when tapped ---- */
  document.addEventListener('click',function(e){
    var b = e.target.closest && e.target.closest('.ek-b'); if(!b || KREDUCE) return;
    b.classList.remove('spin'); void b.offsetWidth; b.classList.add('spin'); try{ buzz(); }catch(x){}
  });

  /* ---- swipe a meal to the left to swap it for the next dish that fits ---- */
  (function(){
    var root = $('p-today'); if(!root) return;
    var st = null;
    root.addEventListener('touchstart',function(e){
      var d = e.target.closest('details.fd[data-slot]'); if(!d || !d.getAttribute('data-slot') || d.open || e.touches.length>1) { st = null; return; }
      st = {d:d, x:e.touches[0].clientX, y:e.touches[0].clientY, dx:0, go:null};
    },{passive:true});
    root.addEventListener('touchmove',function(e){
      if(!st) return; var dx = e.touches[0].clientX-st.x, dy = e.touches[0].clientY-st.y;
      if(st.go===null){ if(Math.abs(dx)<8 && Math.abs(dy)<8) return; st.go = Math.abs(dx)>Math.abs(dy)*1.3 && dx<0; }
      if(!st.go) return; st.dx = Math.min(0,dx); st.d.classList.add('kswipe'); st.d.style.transform = 'translateX('+st.dx+'px) rotate('+(st.dx/40).toFixed(2)+'deg)'; st.d.style.opacity = String(Math.max(.4,1+st.dx/300));
    },{passive:true});
    root.addEventListener('touchend',function(){
      if(!st) return; var s = st; st = null; if(!s.go) return;
      if(s.dx>-80){ s.d.style.transform = ''; s.d.style.opacity = ''; setTimeout(function(){ s.d.classList.remove('kswipe'); },250); return; }
      var slot = s.d.getAttribute('data-slot'), cur = s.d.getAttribute('data-id');
      var sl = SLOTSETS[S.prefs.meals].filter(function(q){ return q[1]===slot; })[0]; if(!sl) return;
      var list = dishOptions(S,curR,sl).map(function(o){ return o.x.id; }); if(list.length<2) return;
      var nx = list[(list.indexOf(cur)+1)%list.length];
      s.d.style.transform = 'translateX(-110%)'; s.d.style.opacity = '0';
      try{ buzz(); }catch(x){}
      setTimeout(function(){ if(!S.dsel[viewDow]) S.dsel[viewDow] = {}; S.dsel[viewDow][slot] = nx; afterDishChange(); toast('Swapped to '+DISHMAP[nx].n+'. Swipe again for another.'); },220);
    });
  })();
  /* ==== KDN WOW END ==== */
