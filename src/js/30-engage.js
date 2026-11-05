  /* ==== KDN ENGAGE START ==== daily score, streaks, badges, water and reminders */
  /* ---- shared helpers for the newer modules: bottom sheet, vibration, day keys ---- */
  function kSheet(title,body,foot,cls){
    var el = $('ksheet');
    el.className = 'hsheet ksheet'+(cls?' '+cls:'');
    el.innerHTML = '<div class="hs-scrim" data-k="close"></div><div class="hs-panel" role="dialog" aria-modal="true" aria-labelledby="ks-t"><div class="hs-grab"></div><div class="hs-head"><h3 id="ks-t">'+title+'</h3><button type="button" class="hs-x" data-k="close" aria-label="Close">×</button></div><div class="hs-body">'+body+'</div>'+(foot?'<div class="hs-foot">'+foot+'</div>':'')+'</div>';
    el.hidden = false; document.documentElement.classList.add('hlock');
    requestAnimationFrame(function(){ el.classList.add('open'); });
  }
  function kSheetBody(body){ var b = $('ksheet').querySelector('.hs-body'); if(b){ var y = b.scrollTop; b.innerHTML = body; b.scrollTop = y; } }
  function kClose(){
    var el = $('ksheet'); if(!el || el.hidden) return;
    el.classList.remove('open'); document.documentElement.classList.remove('hlock');
    if(typeof kSheetGone==='function') kSheetGone();
    setTimeout(function(){ if(!el.classList.contains('open')){ el.hidden = true; el.innerHTML = ''; } },300);
  }
  function kSheetOpen(){ var el = $('ksheet'); return !!(el && !el.hidden); }
  /* light vibration on a tap: the phone's haptic motor in the app, navigator.vibrate on Android Chrome */
  function buzz(kind){
    try{
      var H = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Haptics;
      if(H){ if(kind==='ok') H.notification({type:'SUCCESS'}); else H.impact({style:kind==='big'?'MEDIUM':'LIGHT'}); return; }
      if(navigator.vibrate) navigator.vibrate(kind==='ok'?[12,60,18]:kind==='big'?22:9);
    }catch(e){}
  }
  function kAddDays(k,n){ var p = k.split('-'), d = new Date(+p[0],+p[1]-1,+p[2]); d.setDate(d.getDate()+n); return dkey(d); }
  function kDow(k){ var p = k.split('-'); return (new Date(+p[0],+p[1]-1,+p[2]).getDay()+6)%7; }
  function kNice(k,o){ var p = k.split('-'); return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString(typeof kLang==='function' && kLang()==='hi'?'hi-IN':'en-IN',o||{day:'numeric',month:'short'}); }
  function kIco(p){ return '<svg class="kic" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'; }

  /* ---- water ---- */
  function waterGoal(){ return Math.min(16,Math.max(6,Math.round((S && S.weight || 60)*35/250))); }
  function waterOf(k){ return ((S.log||{})[k]||{}).wa || 0; }
  function waterAdd(n){
    var lg = logOf(todayKey()), g = waterGoal(), was = lg.wa||0;
    lg.wa = Math.max(0,Math.min(30,was+n)); lsSet(S);
    buzz(n>0?'tap':'tap');
    if(n>0 && was<g && lg.wa>=g){ snd('win'); buzz('ok'); toast('Water goal done for today. Well done!'); }
    renderHome(); if(typeof wkRenderIfOpen==='function') wkRenderIfOpen();
  }

  /* ---- daily score: steps 40, workout 30 (rest days count), water 20, food 10 ---- */
  function dayScore(k){
    var lg = (S.log||{})[k] || {}, g = stepGoal(), wg = waterGoal();
    var rest = false; try{ rest = weekPlan(S).days[kDow(k)].kind==='REST'; }catch(e){}
    var xt = 0; (lg.xt||[]).forEach(function(x){ xt += x.k||0; });
    /* a rest day counts as done once you walk half your step goal, as the plan asks for light movement */
    var p = {st:Math.round(Math.min((lg.st||0)/g,1)*40), wo:(lg.wo || (rest && (lg.st||0)>=g/2))?30:0, wa:Math.round(Math.min((lg.wa||0)/wg,1)*20), fd:xt<=300?10:0};
    p.total = p.st+p.wo+p.wa+p.fd; p.rest = rest; p.lg = lg;
    return p;
  }
  function isActive(k){ return dayScore(k).total>=60; }
  function streakInfo(){
    var t = todayKey(), first = (S.startDate && S.startDate<t) ? S.startDate : t, todayOn = isActive(t), k = todayOn ? t : kAddDays(t,-1), n = 0;
    while(k>=first && n<500 && isActive(k)){ n++; k = kAddDays(k,-1); }
    var best = Math.max(n, (S.eng && S.eng.best) || 0);
    return {n:n, today:todayOn, best:best};
  }

  /* ---- badges ---- */
  /* functions, not vars: the app's start code runs before this file's top-level lines */
  function kBadges(){ return [
    ['wo1','First workout','Marked your first workout as done','M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],
    ['st3','3-day streak','3 active days in a row','M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z'],
    ['st7','7-day streak','A full week of active days','M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z'],
    ['st14','14-day streak','Two weeks without a break','M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z'],
    ['st30','30-day streak','A month of active days','M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z'],
    ['st100','100-day streak','100 active days in a row','M12 3c1 4 5 5 5 10a5 5 0 0 1-10 0c0-2 1-4 2-5 0 2 1 3 2 3 0-3-1-5 1-8z'],
    ['k10','10,000 steps','Walked 10,000 steps in one day','M7 20c-2 0-3-2-2-5l2-6c1-2 3-2 4 0l-1 6c-.3 3-1 5-3 5zM16 14c-2 0-3-2-2-4l1-4c.6-1.6 2.5-1.6 3 0l.5 4c.3 2.4-.6 4-2.5 4z'],
    ['wa7','Hydrated week','Water goal 7 days in a row','M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z'],
    ['wo10','10 workouts','10 workouts marked as done','M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],
    ['wo50','50 workouts','50 workouts marked as done','M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12'],
    ['w4','Steady check-ins','Logged your weight 4 times','M4 20h16M6 16l4-5 3 3 5-7'],
    ['p100','Perfect day','Scored 100 out of 100 in a day','M12 3l2.6 5.6 6 .7-4.5 4.1 1.2 6L12 16.6 6.7 19.4l1.2-6L3.4 9.3l6-.7z']
  ]; }
  function engOf(){ if(!S.eng || typeof S.eng!=='object') S.eng = {b:{},best:0}; if(!S.eng.b) S.eng.b = {}; return S.eng; }
  function badgeCheck(){
    if(!S) return;
    var E = engOf(), t = todayKey(), got = [], si = streakInfo(), log = S.log||{}, keys = Object.keys(log);
    var wo = keys.filter(function(k){ return log[k].wo; }).length;
    function give(id){ if(!E.b[id]){ E.b[id] = t; got.push(id); } }
    if(wo>=1) give('wo1'); if(wo>=10) give('wo10'); if(wo>=50) give('wo50');
    [[3,'st3'],[7,'st7'],[14,'st14'],[30,'st30'],[100,'st100']].forEach(function(x){ if(si.n>=x[0]) give(x[1]); });
    if(keys.some(function(k){ return (log[k].st||0)>=10000; })) give('k10');
    var wr = 0, wk = t; for(var i=0;i<7;i++){ if(waterOf(wk)>=waterGoal()) wr++; else break; wk = kAddDays(wk,-1); } if(wr>=7) give('wa7');
    if(Object.keys(S.wlog||{}).length>=4) give('w4');
    if(dayScore(t).total>=100) give('p100');
    if(si.best>(E.best||0)) E.best = si.best;
    if(got.length){
      lsSet(S);
      var b = kBadges().filter(function(x){ return x[0]===got[got.length-1]; })[0];
      setTimeout(function(){ snd('win'); buzz('ok'); toast('New badge: '+b[1]+'!'); },350);
    }
  }

  /* ---- home card ---- */
  function eRing(v,size){
    var r = 26, c = 2*Math.PI*r, off = c*(1-Math.max(0,Math.min(100,v))/100);
    return '<svg class="ek-ring" viewBox="0 0 64 64" width="'+(size||64)+'" height="'+(size||64)+'" aria-hidden="true"><circle cx="32" cy="32" r="'+r+'" class="bg"/><circle cx="32" cy="32" r="'+r+'" class="fg" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"/></svg>';
  }
  function eHomeCard(){
    if(!S || !curR) return '';
    badgeCheck();
    var t = todayKey(), sc = dayScore(t), si = streakInfo(), wa = waterOf(t), wg = waterGoal(), nb = Object.keys(engOf().b).length;
    var tip = (!sc.lg.st || sc.st<40) ? 'Walk to fill your steps' : !sc.lg.wo && !sc.rest ? 'Finish today’s workout' : wa<wg ? 'Drink '+(wg-wa)+' more glass'+(wg-wa>1?'es':'') : sc.total>=100 ? 'Perfect day!' : 'Great day so far';
    var h = '<div class="ek" id="ek">';
    h += '<button type="button" class="ek-top" data-e="score"><span class="ek-rw">'+eRing(sc.total)+'<b>'+sc.total+'</b></span><span class="ek-tx"><small>Today’s score</small><b>'+(si.n ? si.n+'-day streak' : 'Start your streak')+(si.today?' <span class="ek-fl" aria-hidden="true">🔥</span>':'')+'</b><span>'+esc(tip)+(si.best>si.n?' · best '+si.best:'')+'</span></span><span class="hx-go" aria-hidden="true">›</span></button>';
    var cups = ''; for(var i=0;i<wg;i++) cups += '<i class="'+(i<wa?'on':'')+'"></i>';
    h += '<div class="ek-wa"><div class="ek-wl"><small>Water</small><b>'+wa+' / '+wg+' glasses</b><span class="ek-cups" aria-hidden="true">'+cups+'</span></div><div class="ek-wb"><button type="button" class="ek-q" data-e="wa-" aria-label="Remove a glass"'+(wa?'':' disabled')+'>−</button><button type="button" class="ek-q add" data-e="wa+" aria-label="Add a glass of water">+</button></div></div>';
    h += '<div class="ek-links"><button type="button" data-e="badges">'+kIco('<circle cx="12" cy="9" r="6"/><path d="M8.5 14l-1.5 7 5-3 5 3-1.5-7"/>')+'Badges <em>'+nb+'/'+kBadges().length+'</em></button><button type="button" data-e="rem">'+kIco('<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/>')+'Reminders'+(remAnyOn()?' <em>On</em>':'')+'</button>'+(typeof wrCardBtn==='function'?wrCardBtn():'')+'</div>';
    if(typeof kWidgetPush==='function') kWidgetPush();
    return h+'</div>';
  }
  function eScoreSheet(){
    var t = todayKey(), sc = dayScore(t), si = streakInfo(), g = stepGoal(), wg = waterGoal();
    var rows = [
      ['Steps',sc.st,40,fmt(sc.lg.st||0)+' of '+fmt(g)],
      ['Workout',sc.wo,30,sc.lg.wo?'Done':sc.rest?(sc.wo?'Rest day: light walk done':'Rest day: walk '+fmt(Math.round(g/2))+' steps to count it'):'Not done yet'],
      ['Water',sc.wa,20,waterOf(t)+' of '+wg+' glasses'],
      ['Food',sc.fd,10,sc.fd?'Extra food under 300 kcal':'More than 300 kcal of extras']
    ];
    var h = '<div class="ek-big"><span class="ek-rw big">'+eRing(sc.total,96)+'<b>'+sc.total+'</b></span><p>A day with <b>'+60+' or more</b> keeps your streak going.</p></div>';
    h += '<div class="ek-rows">'+rows.map(function(r){ return '<div class="ek-row"><span><b>'+r[0]+'</b><small>'+esc(r[3])+'</small></span><span class="ek-bar"><i style="width:'+Math.round(r[1]/r[2]*100)+'%"></i></span><em>'+r[1]+'/'+r[2]+'</em></div>'; }).join('')+'</div>';
    /* last 14 days */
    var cells = ''; for(var i=13;i>=0;i--){ var k = kAddDays(t,-i), s = dayScore(k).total; cells += '<span class="ek-d'+(s>=60?' on':'')+(i===0?' now':'')+'" title="'+kNice(k)+': '+s+'"><i style="height:'+Math.max(6,s)+'%"></i><small>'+kNice(k,{weekday:'narrow'})+'</small></span>'; }
    h += '<div class="hs-l">Last 14 days</div><div class="ek-days">'+cells+'</div>';
    h += '<div class="ek-st"><div><b>'+si.n+'</b><small>Current streak</small></div><div><b>'+si.best+'</b><small>Best streak</small></div></div>';
    kSheet('Today’s score',h,'<button type="button" class="hh-gold wide" data-k="close">Got it</button>');
  }
  function eBadgeSheet(){
    var E = engOf();
    var h = '<div class="ek-bg">'+kBadges().map(function(b){ var on = E.b[b[0]]; return '<div class="ek-b'+(on?' on':'')+'"><span>'+kIco('<path d="'+b[3]+'"/>')+'</span><b>'+esc(b[1])+'</b><small>'+(on?'Earned '+kNice(on):esc(b[2]))+'</small></div>'; }).join('')+'</div>';
    kSheet('Badges',h,'<button type="button" class="hh-gold wide" data-k="close">Close</button>');
  }

  /* ---- reminders: water, meals, workout and steps ---- */
  function remOf(){
    var REMDEF = {water:{on:false,from:'09:00',to:'21:00',every:2},meal:{on:false,b:'08:30',l:'13:30',d:'20:30'},wo:{on:false,t:'18:00'},step:{on:false,t:'19:30'}};
    if(!S.rem || typeof S.rem!=='object') S.rem = {};
    Object.keys(REMDEF).forEach(function(k){ if(!S.rem[k] || typeof S.rem[k]!=='object') S.rem[k] = JSON.parse(JSON.stringify(REMDEF[k])); });
    return S.rem;
  }
  function remAnyOn(){ if(!S || !S.rem) return false; var R = S.rem; return !!((R.water&&R.water.on)||(R.meal&&R.meal.on)||(R.wo&&R.wo.on)||(R.step&&R.step.on)); }
  function hmMin(t){ var p = String(t||'0:0').split(':'); return (+p[0])*60+(+p[1]||0); }
  function minHm(m){ m = ((m%1440)+1440)%1440; return pad(Math.floor(m/60))+':'+pad(m%60); }
  function t12(t){ var m = hmMin(t), h = Math.floor(m/60), mi = m%60; return (h%12||12)+':'+pad(mi)+' '+(h<12?'am':'pm'); }
  /* every reminder as {key, time, title, body, days (dow list or null), skip()} */
  function remList(){
    if(!S) return [];
    var R = remOf(), out = [];
    if(R.water.on){
      var a = hmMin(R.water.from), b = hmMin(R.water.to), st = Math.max(1,+R.water.every||2)*60;
      for(var m=a;m<=b;m+=st) out.push({key:'wa'+m,time:minHm(m),title:'Time for a glass of water',body:'Small sips through the day keep your energy up.',skip:function(){ return waterOf(todayKey())>=waterGoal(); }});
    }
    if(R.meal.on){
      [['b','Breakfast'],['l','Lunch'],['d','Dinner']].forEach(function(x){ out.push({key:'m'+x[0],time:R.meal[x[0]],title:x[1]+' time',body:'Open My plan to see what to eat now.'}); });
    }
    if(R.wo.on){
      var days = []; try{ weekPlan(S).days.forEach(function(d,i){ if(d.kind!=='REST') days.push(i); }); }catch(e){}
      if(days.length) out.push({key:'wo',time:R.wo.t,days:days,title:'Workout time',body:'Your workout for today is ready in KDN.',skip:function(){ return !!logOf(todayKey()).wo; }});
    }
    if(R.step.on) out.push({key:'st',time:R.step.t,title:'How are your steps?',body:'Your goal is '+fmt(stepGoal())+' steps. A short walk now will do it.',skip:function(){ return ((S.log||{})[todayKey()]||{}).st>=stepGoal(); }});
    return out;
  }
  /* the Android app schedules them with the phone (see 90-native nSyncNow) */
  function eNotifList(){
    return remList().map(function(r){
      var hm = r.time.split(':'), on = {hour:+hm[0],minute:+hm[1]};
      var base = {title:r.title,body:r.body,smallIcon:'ic_stat_kdn',iconColor:'#E9C05A',extra:{kdn:'eng',k:r.key}};
      if(!r.days) return [Object.assign({id:nHash('eng|'+r.key),schedule:{on:on,allowWhileIdle:true}},base)];
      return r.days.map(function(d){ var o = Object.assign({},on,{weekday:d===6?1:d+2}); return Object.assign({id:nHash('eng|'+r.key+'|'+d),schedule:{on:o,allowWhileIdle:true}},base); });
    }).reduce(function(a,b){ return a.concat(b); },[]);
  }
  /* the website checks while KDN is open */
  function eFired(){ try{ var v = (localStorage.getItem('kdn.efired')||'').split('|'); return v[0]===todayKey() ? v.slice(1) : []; }catch(e){ return []; } }
  function eTick(){
    if(NATIVE || !S || !remAnyOn()) return;
    var now = new Date(), mins = now.getHours()*60+now.getMinutes(), dow = todayDow(), fired = eFired(), add = [];
    remList().forEach(function(r){
      var tm = hmMin(r.time);
      if(mins<tm || mins>tm+20 || fired.indexOf(r.key)>=0) return;
      if(r.days && r.days.indexOf(dow)<0) return;
      add.push(r.key);
      if(r.skip && r.skip()) return;
      toast(r.title+'. '+r.body); hChime(); buzz('big');
      if(typeof hNotify==='function') hNotify(r.title,r.body,'kdn-e-'+r.key);
    });
    if(add.length){ try{ localStorage.setItem('kdn.efired',[todayKey()].concat(fired,add).join('|').slice(0,1500)); }catch(e){} }
  }
  setInterval(eTick,30000);
  function remSheet(){
    var R = remOf(), st = typeof hNotifState==='function' ? hNotifState() : 'none';
    function tog(k,lbl,sub){ var on = R[k].on; return '<div class="ek-rh"><span><b>'+lbl+'</b><small>'+sub+'</small></span><button type="button" class="ek-sw'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" data-k="rt" data-v="'+k+'" aria-label="'+lbl+'"><i></i></button></div>'; }
    function tm(k,f,lbl){ return '<label class="ek-tm"><span>'+lbl+'</span><input type="time" value="'+esc(R[k][f])+'" data-rk="'+k+'" data-rf="'+f+'"></label>'; }
    var h = '';
    if(st==='blocked') h += '<p class="ek-warn">Notifications are blocked. Turn them on in your '+(NATIVE?'phone settings (Apps › KDN Fitness › Notifications)':'browser settings for kdnfitness.com')+'.</p>';
    else if(st==='ask' || st==='off') h += '<button type="button" class="ek-allow" data-k="rallow">Allow notifications</button>';
    if(!NATIVE) h += '<p class="ek-note">On the website, reminders work while KDN is open in a tab. The Android app reminds you even when it is closed.</p>';
    h += '<div class="ek-rc">'+tog('water','Water','Every few hours, skipped once you reach '+waterGoal()+' glasses')+(R.water.on?'<div class="ek-tms">'+tm('water','from','From')+tm('water','to','Until')+'<label class="ek-tm"><span>Every</span><select data-rk="water" data-rf="every">'+[1,2,3].map(function(n){ return '<option value="'+n+'"'+(+R.water.every===n?' selected':'')+'>'+n+' hour'+(n>1?'s':'')+'</option>'; }).join('')+'</select></label></div>':'')+'</div>';
    h += '<div class="ek-rc">'+tog('meal','Meals','Breakfast, lunch and dinner')+(R.meal.on?'<div class="ek-tms">'+tm('meal','b','Breakfast')+tm('meal','l','Lunch')+tm('meal','d','Dinner')+'</div>':'')+'</div>';
    h += '<div class="ek-rc">'+tog('wo','Workout','On your training days, skipped once it is done')+(R.wo.on?'<div class="ek-tms">'+tm('wo','t','Time')+'</div>':'')+'</div>';
    h += '<div class="ek-rc">'+tog('step','Steps check','Evening nudge if you are short of '+fmt(stepGoal())+' steps')+(R.step.on?'<div class="ek-tms">'+tm('step','t','Time')+'</div>':'')+'</div>';
    return h;
  }
  function remSaved(){ lsSet(S); if(NATIVE && typeof nSync==='function') nSync(); }

  /* ---- events ---- */
  document.addEventListener('click',function(ev){
    var b = ev.target.closest && ev.target.closest('[data-e]'); if(!b || !S) return;
    var a = b.getAttribute('data-e');
    if(a==='wa+') waterAdd(1);
    else if(a==='wa-') waterAdd(-1);
    else if(a==='score'){ buzz(); eScoreSheet(); }
    else if(a==='badges'){ buzz(); eBadgeSheet(); }
    else if(a==='rem'){ buzz(); kSheet('Reminders',remSheet(),'<button type="button" class="hh-gold wide" data-k="close">Done</button>'); }
  });
  $('ksheet').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-k]'); if(!b) return;
    var a = b.getAttribute('data-k');
    if(a==='close'){ kClose(); return; }
    if(a==='rt'){ var R = remOf(), k = b.getAttribute('data-v'); R[k].on = !R[k].on; buzz(); remSaved(); kSheetBody(remSheet()); renderHome();
      if(R[k].on && typeof hNotifState==='function' && hNotifState()==='ask') hNotifAsk(); return; }
    if(a==='rallow'){ if(typeof hNotifAsk==='function') hNotifAsk(); setTimeout(function(){ if(kSheetOpen() && $('ks-t').textContent==='Reminders') kSheetBody(remSheet()); },1500); return; }
    if(typeof kSheetClick==='function') kSheetClick(a,b,ev);
  });
  $('ksheet').addEventListener('change',function(ev){
    var t = ev.target, k = t.getAttribute && t.getAttribute('data-rk');
    if(k){ var R = remOf(), f = t.getAttribute('data-rf'); R[k][f] = f==='every' ? +t.value : (t.value || R[k][f]); remSaved(); return; }
    if(typeof kSheetChange==='function') kSheetChange(ev);
  });
  $('ksheet').addEventListener('input',function(ev){ if(typeof kSheetInput==='function') kSheetInput(ev); });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && kSheetOpen()) kClose(); });
  /* ==== KDN ENGAGE END ==== */
