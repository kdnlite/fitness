  /* ---------- Home-page scene: a male and a female athlete in KDN tees walk into a gym and train (animated drawing) ---------- */
  var HERO_BG = (function(){
    var s = '<defs><linearGradient id="hwall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F3F7FF"/><stop offset="1" stop-color="#DCE7FB"/></linearGradient></defs>';
    s += '<rect width="360" height="210" fill="url(#hwall)"/>';
    s += '<rect x="0" y="168" width="360" height="42" fill="#C9D5EC"/><path d="M0 168H360" stroke="#B3C2DE" stroke-width="2"/>';
    for(var i=0;i<9;i++) s += '<path d="M'+(i*45)+' 168L'+(i*45-30+ (i-4)*10)+' 210" stroke="#BCCAE4" stroke-width="1"/>';
    /* window */
    s += '<rect x="18" y="20" width="84" height="62" rx="4" fill="#CFE6FF" stroke="#9DB2CE" stroke-width="3"/><path d="M60 20V82M18 51H102" stroke="#9DB2CE" stroke-width="2"/><circle cx="82" cy="36" r="7" fill="#FFE9A8"/>';
    /* banner */
    s += '<rect x="122" y="14" width="116" height="30" rx="6" fill="#1D4ED8"/><text x="180" y="34" text-anchor="middle" font-family="Bricolage Grotesque,Arial Black,sans-serif" font-weight="800" font-size="15" letter-spacing="1.2" fill="#fff">KDN FITNESS</text>';
    /* wall barbell + plates */
    s += '<rect x="258" y="30" width="86" height="5" rx="2.5" fill="#586774"/><rect x="262" y="22" width="7" height="21" rx="2" fill="#14202B"/><rect x="333" y="22" width="7" height="21" rx="2" fill="#14202B"/>';
    /* dumbbell rack */
    s += '<rect x="262" y="104" width="86" height="6" rx="2" fill="#586774"/><rect x="262" y="132" width="86" height="6" rx="2" fill="#586774"/><path d="M268 110V168M342 110V168" stroke="#586774" stroke-width="4"/>';
    for(var j=0;j<5;j++){ s += '<rect x="'+(270+j*15)+'" y="95" width="11" height="9" rx="2.5" fill="#1D4ED8"/><rect x="'+(270+j*15)+'" y="123" width="11" height="9" rx="2.5" fill="#14202B"/>'; }
    /* treadmill silhouette */
    s += '<path d="M126 168L150 118H196" stroke="#8795AA" stroke-width="4" fill="none" stroke-linecap="round"/><rect x="120" y="160" width="86" height="8" rx="3" fill="#8795AA"/><rect x="176" y="106" width="30" height="14" rx="3" fill="#586774"/>';
    /* plant and mat */
    s += '<rect x="342" y="150" width="10" height="18" fill="#9DB5EE"/><path d="M347 150Q338 134 330 140Q338 142 347 150ZM347 150Q356 132 360 142Q352 142 347 150Z" fill="#43A047"/>';
    return s;
  })();
  var HS = {t0:0, raf:null, last:0, el:null};
  function ease(x){x=Math.max(0,Math.min(1,x)); return 1-Math.pow(1-x,3)}
  function heroFig(g,pose,x,alpha){
    return '<g transform="translate('+x.toFixed(1)+' 49) scale(1.56)" opacity="'+alpha.toFixed(2)+'"><ellipse cx="50" cy="80.5" rx="34" ry="3" fill="#14202B" opacity=".16"/>'+body(pose,g)+'</g>';
  }
  var WALKP = null, HSEQ = [['ohpress','goblet','Shoulder press','Goblet squat'],['curl','lunge','Bicep curl','Lunge']];
  function heroPose(id,phase){
    var P = PL[EXS[id].fig].map(complete), hold = P.length===1;
    if(hold){ var B = complete(PL[EXS[id].fig][0]); B.h[1]-=1.6; B.n[1]-=1.2; P.push(B); }
    return cyc(P,phase,hold);
  }
  function heroDraw(t){
    var LOOP = 16, tt = t % LOOP, alpha = tt<0.4 ? tt/0.4 : tt>LOOP-0.5 ? (LOOP-tt)/0.5 : 1;
    var walkT = 3.4, mX, fX, mp, fp, cap = '';
    if(tt < walkT){
      mX = -175 + (188+175)*ease(tt/walkT); fX = -300 + (18+300)*ease(tt/walkT);
      var wph = tt/1.05;
      mp = heroPose('walk',wph); fp = heroPose('walk',wph+0.2);
      cap = 'Walking into the gym';
    } else {
      mX = 188; fX = 18;
      var seg = Math.floor((tt-walkT)/6) % 2, lt = tt-walkT;
      var sq = HSEQ[seg];
      mp = heroPose(sq[0], lt/DUR[sq[0]]); fp = heroPose(sq[1], lt/DUR[sq[1]]+0.1);
      cap = sq[2]+' · '+sq[3];
    }
    var s = HERO_BG + heroFig('f',fp,fX,alpha) + heroFig('m',mp,mX,alpha);
    if(HS.cap && HS.cap.textContent!==cap) HS.cap.textContent = cap;
    return s;
  }
  function heroTick(ts){
    HS.raf = null;
    if($('s-landing').hidden || document.hidden) return;
    if(ts - HS.last > 38){ HS.last = ts; HS.el.innerHTML = heroDraw((ts-HS.t0)/1000); }
    HS.raf = requestAnimationFrame(heroTick);
  }
  function heroKick(){
    if(!HS.el || $('heroscene').closest('[hidden]')) return;
    if(REDUCED){ HS.el.innerHTML = heroDraw(8); return; }
    if(!HS.raf){ if(!HS.t0) HS.t0 = performance.now(); HS.raf = requestAnimationFrame(heroTick); }
  }
  function teeSvg(fill,txt,stroke){
    return '<svg viewBox="0 0 64 60" aria-hidden="true"><path d="M20 6L6 14L11 27L18 24V54H46V24L53 27L58 14L44 6Q32 14 20 6Z" fill="'+fill+'" stroke="'+stroke+'" stroke-width="2.4" stroke-linejoin="round"/><text x="32" y="38" text-anchor="middle" font-family="Bricolage Grotesque,Arial Black,sans-serif" font-weight="800" font-size="11" fill="'+txt+'">KDN</text></svg>';
  }
  (function(){
    $('heroscene').innerHTML = '<svg viewBox="0 0 360 210" role="img" aria-label="Animated illustration of a male and a female athlete in KDN tees working out in a gym"><g id="hs-g"></g></svg>';
    HS.el = $('hs-g'); HS.cap = $('herocap');
    $('tees').innerHTML = '<div>'+teeSvg('#1D4ED8','#FFFFFF','#14202B')+'<span>KDN tee, men</span></div><div>'+teeSvg('#FFFFFF','#1D4ED8','#14202B')+'<span>KDN tee, women</span></div>';
    document.addEventListener('visibilitychange',function(){ if(!document.hidden) heroKick(); });
  })();

  /* ---------- Header menu ---------- */
  var burger = $('burger'), mlist = $('mlist');
  var menuT = null;
  function menuOpen(){ return mlist.classList.contains('open'); }
  function fitMenu(){
    try{
      var vv = window.visualViewport, vh = vv ? vv.height : window.innerHeight;
      var hd = burger.getBoundingClientRect();
      var h = Math.max(200, Math.floor(vh - hd.bottom - 24));
      mlist.style.setProperty('--mmax', h+'px');
    }catch(e){}
  }
  window.addEventListener('resize',function(){ if(menuOpen()) fitMenu(); });
  if(window.visualViewport) window.visualViewport.addEventListener('resize',function(){ if(menuOpen()) fitMenu(); });
  function openMenu(o){
    clearTimeout(menuT);
    burger.setAttribute('aria-expanded', o);
    burger.setAttribute('aria-label', o ? 'Close menu' : 'Open menu');
    document.body.classList.toggle('menuon', o);
    document.documentElement.classList.toggle('menuon', o);
    if(o){
      mlist.hidden = false;
      fitMenu();
      void mlist.offsetWidth;            /* start the opening transition from the closed state */
      mlist.classList.add('open');
    } else {
      mlist.classList.remove('open');
      menuT = setTimeout(function(){ if(!menuOpen()) mlist.hidden = true; }, 340);
    }
  }
  $('mscrim').addEventListener('click',function(){ openMenu(false); });
  $('mscrim').addEventListener('touchmove',function(e){ e.preventDefault(); },{passive:false});
  function go(where){
    if(where==='sound'){ sndToggle(); return; }
    openMenu(false);
    if(where==='home'){ if(S) openHome(); else show('s-landing'); }
    else if(where==='plan'){ if(S) openPlan('today'); else show('s-intro'); }
    else if(where==='library') show('s-library');
    else if(where==='foods') show('s-foods');
    else if(where==='about') show('s-about');
    else if(where==='ai') openAI();
    else if(where==='sub') show('s-pay');
    else if(where==='plans') openPlans();
    else if(where==='family') show('s-family');
    else if(where==='gym') show('s-gym');
    else if(where==='health') show('s-health');
    else if(where==='trainer') show('s-trainer');
    else if(where==='edit'){ if(S) editSaved(); else { show('s-form'); goStep(cur) } }
    else if(where==='logout'){ askLogout(); return; }
    else if(where==='steps'){ if(S) openPlan('steps'); else show('s-intro'); }
    Array.prototype.forEach.call(mlist.querySelectorAll('button'),function(b){
      if(b.getAttribute('data-go')===where) b.setAttribute('aria-current','page'); else b.removeAttribute('aria-current');
    });
  }
  burger.addEventListener('click',function(ev){ev.stopPropagation(); openMenu(!menuOpen())});
  mlist.addEventListener('click',function(ev){var b = ev.target.closest('button'); if(b) go(b.getAttribute('data-go'))});
  document.addEventListener('click',function(ev){ if(menuOpen() && !$('menu').contains(ev.target)) openMenu(false) });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape'){ if(!$('lgm').hidden) closeLogout(); else if(menuOpen()){openMenu(false); burger.focus()} } });
  $('logo').addEventListener('click',function(){go('home')});
  $('b-about-go').addEventListener('click',function(){go('plan')});

  /* ---------- App feel: no pinch or double-tap zoom ---------- */
  ['gesturestart','gesturechange','gestureend'].forEach(function(n){ document.addEventListener(n,function(e){e.preventDefault()},{passive:false}); });
  document.addEventListener('touchmove',function(e){ if(e.touches && e.touches.length>1) e.preventDefault(); },{passive:false});


  /* ---------- Preview mode (no active plan): menu, library, dishes and gym manager ---------- */
  var KLOCK = ['plan','ai','steps','sub','sound','about','edit','family','trainer'];
  function kMenuSync(){
    var on = licensed(), lp = licPlan();
    $('m-fam').hidden = !(on && lp==='fam');
    $('m-gym').hidden = on && lp!=='gym';
    $('m-hlt').hidden = !(on && lp!=='gym' && healthOn());
    Array.prototype.forEach.call(document.querySelectorAll('#mlist button[data-go]'),function(b){
      var g = b.getAttribute('data-go');
      if(KLOCK.indexOf(g)>=0) b.classList.toggle('lockhide',!on);
      if(g==='library'||g==='foods'||g==='gym'){
        var t = b.querySelector('.mprev'); if(!t){ t = document.createElement('i'); t.className = 'mprev'; t.textContent = 'Preview'; var bb = b.querySelector('b'); if(bb) bb.appendChild(t); }
        t.hidden = on;
      }
    });
  }
  function kPrevCard(t1,t2){ return '<div class="kprev"><span class="kprev-l"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Preview</span><b>'+t1+'</b><p>'+t2+'</p><button type="button" class="btn" data-unlock>See plans</button></div>'; }
  function kGymPreview(){
    $('gymroot').innerHTML = '<div class="kgp"><span class="kprev-l"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg>Preview</span><h2>KDN Gym Manager</h2><p class="lead">Run your whole gym from one app: members and fees, attendance, trainers and salaries, bills, classes, personal training, a store, lockers and reports.</p>'+
      '<div class="kgp-shots">'+[['home','Home'],['members','Members and fees'],['reports','Reports']].map(function(x){ return '<figure><img src="assets/gym-preview-'+x[0]+'.webp" width="400" height="860" alt="Gym Manager '+x[1]+' screen with sample data" loading="lazy"><figcaption>'+x[1]+'</figcaption></figure>'; }).join('')+'</div>'+
      '<ul class="kgp-list"><li>Members, fee reminders and part payments</li><li>Check-in and a self check-in kiosk</li><li>Trainers, staff attendance and salaries</li><li>Bills as PDF and WhatsApp messages</li><li>Class schedule, PT packages, store and lockers</li><li>Reports: income, renewals and busy hours</li></ul>'+
      '<button type="button" class="btn" data-unlock>'+(licensed() ? 'Switch to the Gym plan' : 'See plans')+'</button><p class="foot">Sample data shown. '+(licensed() ? 'Your plan now is '+PLANNAME[licPlan()]+'. The Gym Manager comes only with the Gym plan.' : 'The Gym plan unlocks the manager for your own gym.')+'</p></div>';
  }
  document.addEventListener('click',function(ev){ var b = ev.target.closest('[data-unlock]'); if(b){ ev.preventDefault(); if(typeof setPlan==='function' && curScreen==='s-gym') setPlan('gym'); show('s-pay'); } });
  /* ---------- Landing hero: the athletes walk in once, then hold their pose ---------- */
  (function(){
    var v = $('lpwalk'); if(!v) return; var end = v.parentNode.querySelector('.lp-walk-end');
    var still = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    function showEnd(){ end.hidden = false; v.hidden = true; }
    function play(){ if(still){ showEnd(); return; } end.hidden = true; v.hidden = false; try{ v.currentTime = 0; }catch(e){} var p = v.play(); if(p && p.catch) p.catch(showEnd); }
    v.addEventListener('error',showEnd,true);
    /* The video (0.6 MB) loads only when the landing page is on screen, after the rest of the page. */
    var started = false;
    function start(){ if(started || $('s-landing').hidden) return; started = true; if(still) showEnd(); else play(); }
    if(document.readyState==='complete') setTimeout(start,0); else window.addEventListener('load',function(){ setTimeout(start,0); });
    window.kdnWalkReplay = function(){ if($('s-landing').hidden) return; if(!started){ if(document.readyState==='complete') start(); } else if(v.ended) play(); };
  })();
  /* ---------- Start ---------- */
  (function(){
    var saved = lsGet();
    if(saved){ try{ saved = normalize(saved); if(FV.time(saved)){ saved.tmode = 'safe'; refreshTime(saved); } if(KEYS.every(function(k){return FV[k](saved)===''})){ S = saved; userKg = S.weight; if(!S.startWeight) S.startWeight = S.weight; if(!S.wlog[S.startDate]) S.wlog[S.startDate] = S.startWeight; lsSet(S); } }catch(e){ S = null; } }
    syncAuth();
    renderWelcome();
    renderLibrary();
    renderFoods();
    heroKick();
    if(S) openHome();
    document.body.classList.toggle('onland', !$('s-landing').hidden);
  })();

