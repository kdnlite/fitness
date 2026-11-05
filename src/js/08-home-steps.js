  /* ---------- Dates, step log ---------- */
  function pad(n){return n<10 ? '0'+n : ''+n}
  function dkey(dt){return dt.getFullYear()+'-'+pad(dt.getMonth()+1)+'-'+pad(dt.getDate())}
  function todayKey(){return dkey(new Date())}
  function todayDow(){return (new Date().getDay()+6)%7}
  var viewDow = null;
  function logOf(k){ if(!S.log) S.log = {}; return S.log[k] || (S.log[k] = {}) }
  function pruneLog(){
    if(!S || !S.log) return;
    var cut = new Date(); cut.setDate(cut.getDate()-400);
    var ck = dkey(cut);
    Object.keys(S.log).forEach(function(k){ if(k < ck) delete S.log[k]; });
  }
  function stepGoal(){return S.stepGoal>0 ? S.stepGoal : (S.goal==='lose' ? 10000 : S.goal==='gain' ? 7000 : 8000)}
  function stepStats(n){
    var stride = (S.stride>0 ? S.stride : S.height*(S.gender==='female' ? 0.413 : 0.415))/100;
    var km = n*stride/1000;
    return {km:km, kcal:0.6*S.weight*km, min:n/100};
  }
  function fmtKm(x){return (Math.round(x*100)/100).toFixed(2)}
  var RC = 2*Math.PI*66;
  function ringHtml(pre,st,g){
    var ss = stepStats(st);
    return '<div class="ringcard"><div class="ring"><svg viewBox="0 0 160 160" aria-hidden="true"><circle cx="80" cy="80" r="66" fill="none" stroke="#EFE6D3" stroke-width="14"/><circle id="'+pre+'-ring" cx="80" cy="80" r="66" fill="none" stroke="#C9A44C" stroke-width="14" stroke-linecap="round" stroke-dasharray="'+RC.toFixed(1)+'" stroke-dashoffset="'+(RC*(1-Math.min(1,st/g))).toFixed(1)+'" transform="rotate(-90 80 80)"/></svg><div class="rc"><b id="'+pre+'-num">'+fmt(st)+'</b><span id="'+pre+'-pct">'+Math.round(st/g*100)+'% of '+fmt(g)+'</span></div></div>'+
      '<div class="rstats"><div><b id="'+pre+'-km">'+fmtKm(ss.km)+'</b><small>km</small></div><div><b id="'+pre+'-kcal">'+Math.round(ss.kcal)+'</b><small>kcal</small></div><div><b id="'+pre+'-min">'+Math.round(ss.min)+'</b><small>active min</small></div></div></div>';
  }

  /* Today tab: see js71_track.js */

  /* ---------- Home ---------- */
  var hmProf = false, hmTimer = null;
  function hmIco(p){ return '<span class="hx-ic"><svg viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg></span>'; }
  function hmSubTxt(){
    var l = lic(); if(!l) return {on:false,big:'Not active',small:'Tap to see plans'};
    var ms = l.end-Date.now(); if(ms<=0) return {on:false,big:'Expired',small:'Tap to renew'};
    var p = cdParts(ms);
    return {on:true,big:p.d+'d '+two(p.h)+'h '+two(p.m)+'m '+two(p.s)+'s',small:'Premium active · until '+new Date(l.end).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}),pct:Math.max(0,Math.min(1,ms/(l.end-l.start)))};
  }
  function renderHome(){
    if(!S || !curR) { $('home').innerHTML = ''; return; }
    var r = curR, d = S;
    var hr = new Date().getHours(), greet = hr<12 ? 'Good morning' : hr<17 ? 'Good afternoon' : 'Good evening';
    var sb = hmSubTxt();

    /* hero */
    var h = '<div class="hx-hero"><div class="hx-glow"></div><div class="hx-ht"><div><small>'+greet+'</small><h2>'+esc(d.name)+'</h2><p>'+esc(goalLine(d))+'</p></div><div class="hx-av">'+frame(PL.ohpress[1],gOf())+'</div></div>';
    h += '<div class="hx-badge'+(sb.on?'':' off')+'"><span>✦</span>'+(sb.on?'KDN Premium':'KDN Free')+'</div></div>';

    /* subscription timer */
    h += '<button type="button" class="hx-sub'+(sb.on?'':' off')+'" data-hm="sub"><span class="hx-subl"><small>Subscription time left</small><b id="hx-cd">'+sb.big+'</b><span>'+esc(sb.small)+'</span></span><span class="hx-go" aria-hidden="true">›</span>'+(sb.on?'<i class="hx-subbar"><em style="width:'+Math.round(sb.pct*100)+'%"></em></i>':'')+'</button>';

    if(typeof eHomeCard==='function') h += eHomeCard();
    /* main tiles */
    if(typeof kBadgeHtml==='function') h += kBadgeHtml();
    h += '<div class="hx-grid">';
    h += '<button type="button" class="hx-tile gold" data-hm="plan">'+hmIco('<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h4"/>')+'<b>My plan</b><small>Today’s diet, workout and tracker</small></button>';
    h += '<button type="button" class="hx-tile navy" data-hm="ai">'+hmIco('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>')+'<b>KDN AI</b><small>Ask anything · Hindi & English</small></button>';
    h += '<button type="button" class="hx-tile'+(hmProf?' on':'')+'" data-hm="prof" aria-expanded="'+hmProf+'">'+hmIco('<circle cx="12" cy="8" r="4"/><path d="M4 21c1-4 4-6 8-6s7 2 8 6"/>')+'<b>My profile</b><small>Your body details and goal</small></button>';
    h += '<button type="button" class="hx-tile" data-hm="edit">'+hmIco('<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="M14 6l4 4"/>')+'<b>Edit plan</b><small>Change weight, goal, diet or days</small></button>';
    h += '</div>';
    if(typeof hHomeCard==='function') h += hHomeCard();

    /* profile drop-down */
    if(hmProf){
      var GN = {male:'Male',female:'Female',other:'Other'}, DN = {vegan:'Vegan',veg:'Vegetarian',nonveg:'Non-vegetarian'};
      var rows = [['Name',d.name],['Age',d.age+' years'],['Gender',GN[d.gender]||d.gender],['Height',Math.round(d.height)+' cm ('+ftIn(d.height)+')'],['Weight',r1(d.weight)+' kg'],['BMI',r.bmi.toFixed(1)+' · '+r.cat],['Diet',DN[d.diet]||d.diet],['Goal',goalLine(d)],['Trains at',LOCN[d.loc]],['Level',LVN[d.level]],['Days a week',d.days+' days'],['Daily calories',fmt(r.target)+' kcal'],['Protein',r.protein+' g a day'],['Water',r.water.toFixed(1)+' L a day']];
      h += '<div class="hx-prof"><div class="hx-profh"><div class="hx-pav">'+esc(String(d.name||'?').trim().charAt(0).toUpperCase())+'</div><div><b>'+esc(d.name)+'</b><small>Saved on this device</small></div></div><dl>'+rows.map(function(x){return '<div><dt>'+esc(x[0])+'</dt><dd>'+esc(String(x[1]))+'</dd></div>'}).join('')+'</dl><button type="button" class="hx-goldbtn" data-hm="edit">Edit my details</button></div>';
    }

    /* galleries */
    var fd = DISHES.filter(function(x){return DPH[x.id] && dietOk(x,d.diet)}).slice(0,4);
    if(fd.length<4) fd = DISHES.filter(function(x){return dietOk(x,d.diet)}).slice(0,4);
    var exIds = ['squat','pushup','plank','lunge'].filter(function(id){return EXS[id] && PL[id]});
    h += '<div class="hx-gals">';
    h += '<button type="button" class="hx-gal" data-hm="foods"><span class="hx-coll">'+fd.map(function(x){return '<span>'+dishPic(x)+'</span>'}).join('')+'</span><span class="hx-galt"><small>Gallery</small><b>Food gallery</b><span>'+DISHES.length+'+ dishes with recipes</span></span></button>';
    h += '<button type="button" class="hx-gal hxwk" data-hm="library"><span class="hx-coll">'+(exIds.length?exIds:Object.keys(PL).slice(0,4)).slice(0,4).map(function(id){return '<span>'+frame(PL[id][0],gOf())+'</span>'}).join('')+'</span><span class="hx-galt"><small>Gallery</small><b>Workout gallery</b><span>'+EXCOUNT+' exercises by muscle</span></span></button>';
    h += '</div>';

    $('home').innerHTML = h;
    clearInterval(hmTimer);
    if(sb.on) hmTimer = setInterval(function(){ var el = $('hx-cd'); if(!el || curScreen!=='s-home'){ return; } var t = hmSubTxt(); if(t.on) el.textContent = t.big; else renderHome(); },1000);
  }
  $('home').addEventListener('click',function(ev){
    if(!S || !curR) return;
    var b = ev.target.closest('button[data-hm]'); if(!b) return;
    var a = b.getAttribute('data-hm');
    if(a==='prof'){ hmProf = !hmProf; renderHome(); if(hmProf){ var pe = document.querySelector('.hx-prof'); if(pe && pe.scrollIntoView) pe.scrollIntoView({block:'nearest',behavior:'smooth'}); } return; }
    if(a==='plan'){ viewDow = null; go('plan'); return; }
    go(a);
  });
  function goTab(t){ show('s-result'); setTab(t); window.scrollTo(0,0); }

  /* ---------- Step tracker ---------- */
  var sens = {on:false,base:9.8,last:0,got:false,timer:null,save:null};
  function addSteps(n){
    var lg = logOf(todayKey());
    lg.st = Math.max(0,(lg.st||0)+n);
    clearTimeout(sens.save); lsSet(S);
    if(!$('p-steps').hidden) paintSteps();
    if(!$('p-today').hidden) renderToday(S,curR);
    renderHome();
  }
  function setSteps(n){ var lg = logOf(todayKey()); lg.st = Math.max(0,Math.round(n)); lsSet(S); renderSteps(); renderHome(); }
  /* ---------- Steps tab: big ring, day chips, monthly history (navy and gold) ---------- */
  var STV = {day:null, month:null, week:null, view:(function(){ try{ var v = localStorage.getItem('kdn_stv'); return /^[dwm]$/.test(v||'') ? v : 'd'; }catch(e){ return 'd'; } })()};               /* day being shown in the ring, month shown in history */
  var STC = 2*Math.PI*92;
  var MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  function stDayKey(){ return STV.day || todayKey(); }
  function stOf(k){ return (S.log && S.log[k] && S.log[k].st) || 0; }
  function addDays(k,n){ var d = new Date(k+'T12:00:00'); d.setDate(d.getDate()+n); return dkey(d); }
  function streakDays(){
    var g = stepGoal(), k = todayKey(), n = 0;
    if(stOf(k) < g) k = addDays(k,-1);                 /* today still counts later in the day */
    while(stOf(k) >= g && n < 400){ n++; k = addDays(k,-1); }
    return n;
  }
  function hmTxt(min){ var m = Math.round(min); return Math.floor(m/60)+':'+(m%60<10?'0':'')+(m%60); }
  function strideCm(){ return S.stride>0 ? S.stride : Math.round(S.height*(S.gender==='female' ? 0.413 : 0.415)); }
  function dayLabel(k){
    var t = todayKey();
    if(k===t) return 'Today';
    if(k===addDays(t,-1)) return 'Yesterday';
    return new Date(k+'T12:00:00').toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'});
  }
  function badgeSvg(){
    return '<svg class="stbadge" viewBox="0 0 40 44" aria-hidden="true"><defs><linearGradient id="stbg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3B4"/><stop offset="1" stop-color="#B8934A"/></linearGradient></defs><path d="M20 2l16 9v20l-16 11L4 31V11z" fill="url(#stbg)"/><path d="M20 7l12 7v15l-12 8-12-8V14z" fill="#0F1A2E"/><path d="M20 14l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#E9CF9C"/></svg>';
  }
  function heroHtml(){
    var k = stDayKey(), st = stOf(k), g = stepGoal(), ss = stepStats(st), isT = (k===todayKey());
    var off = (STC*(1-Math.min(1,st/g))).toFixed(1), met = st >= g;
    var h = '<div class="sthero'+(met?' met':'')+'">';
    h += '<div class="stringwrap"><button type="button" class="stnav" data-st="prev" aria-label="Previous day"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button>';
    h += '<div class="string"><svg viewBox="0 0 220 220" aria-hidden="true"><defs><linearGradient id="stgr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F6E3B4"/><stop offset=".55" stop-color="#E9CF9C"/><stop offset="1" stop-color="#B8934A"/></linearGradient></defs>'+
      '<circle cx="110" cy="110" r="92" fill="none" stroke="rgba(233,207,156,.13)" stroke-width="18"/>'+
      '<circle id="st-ring" cx="110" cy="110" r="92" fill="none" stroke="url(#stgr)" stroke-width="18" stroke-linecap="round" stroke-dasharray="'+STC.toFixed(1)+'" stroke-dashoffset="'+off+'" transform="rotate(-90 110 110)"/></svg>';
    if(isT && sens.on && !sens.nodata) h += '<span class="stlive"><i></i>Counting</span>';
    h += '<div class="stcenter"><span class="stday">'+esc(dayLabel(k))+'</span><b id="st-num">'+fmt(st)+'</b><span class="stof" id="st-of">of '+fmt(g)+' steps</span>'+(met?badgeSvg():'<span class="stleft" id="st-left">'+fmt(g-st)+' to go</span>')+'</div></div>';
    h += '<button type="button" class="stnav" data-st="next" aria-label="Next day"'+(isT?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    var sk = streakDays();
    h += '<div class="stchips" role="list">'+
      '<div role="listitem" class="sk"><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3.5 5 5.8 5 11a5 5 0 0 1-10 0c0-2.2 1-3.7 2.2-4.8.2 1.6 1 2.6 2.1 3 .1-3.2-.6-5.6-1.3-9.2z"/></svg>'+sk+'</b><small>Streak</small></div>'+
      '<div role="listitem"><b id="st-kcal">'+fmt(Math.round(ss.kcal))+'</b><small>kcal</small></div>'+
      '<div role="listitem"><b id="st-km">'+fmtKm(ss.km)+'</b><small>km</small></div>'+
      '<div role="listitem"><b id="st-min">'+hmTxt(ss.min)+'</b><small>active</small></div>'+
      '<div role="listitem"><b id="st-pct">'+Math.round(st/g*100)+'%</b><small>of goal</small></div></div>';
    return h+'</div>';
  }
  function controlsHtml(){
    var isT = (stDayKey()===todayKey()), g = stepGoal(), h = '<div class="sect stctl">';
    h += '<details class="stset" style="border-top:0;padding-top:0"><summary>Goal and stride</summary><div class="frow"><span class="fl">Daily goal</span><div class="cbs">'+[5000,7000,8000,10000,12000,15000].map(function(n){return '<button type="button" class="cb'+(n===g?' on':'')+'" data-st="goal" data-n="'+n+'" aria-pressed="'+(n===g)+'">'+fmt(n)+'</button>'}).join('')+'</div></div>';
    h += '<div class="frow"><span class="fl">Your stride length</span><div class="inwrap"><input type="number" id="st-stride" min="40" max="120" step="1" inputmode="numeric" value="'+strideCm()+'" aria-label="Stride length in cm"><span class="unit">cm</span><button type="button" class="btn sm ghost" data-st="stride">Save</button></div><span class="hint">Set from your height ('+(S.stride>0?'you changed it':'about 41% of '+S.height+' cm')+'). For the most accurate km: walk 10 normal steps, measure the distance in cm and divide by 10.</span></div></details>';
    return h+'</div>';
  }
  function monthHtml(){
    var now = new Date(), m = STV.month || new Date(now.getFullYear(), now.getMonth(), 1);
    STV.month = m;
    var y = m.getFullYear(), mo = m.getMonth(), dim = new Date(y,mo+1,0).getDate(), g = stepGoal(), tk = todayKey(), sel = stDayKey();
    var isCur = (y===now.getFullYear() && mo===now.getMonth());
    var days = [], tot = 0, met = 0, act = 0, best = 0, bestK = '';
    for(var d=1; d<=dim; d++){
      var k = y+'-'+pad(mo+1)+'-'+pad(d), st = stOf(k), fut = k > tk;
      days.push({d:d,k:k,st:st,fut:fut});
      tot += st; if(st>=g) met++; if(st>0) act++; if(st>best){ best = st; bestK = k; }
    }
    var sum = stepStats(tot), mx = Math.max(g, best);
    var h = '<div class="sect stmonth"><div class="sh stmh"><button type="button" class="stnav sm" data-st="mprev" aria-label="Previous month"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div><small>Monthly history</small><h3>'+MONTHS[mo]+' '+y+'</h3></div><button type="button" class="stnav sm" data-st="mnext" aria-label="Next month"'+(isCur?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    h += '<div class="stmsum"><div><b>'+fmt(tot)+'</b><small>steps</small></div><div><b>'+fmtKm(sum.km)+'</b><small>km</small></div><div><b>'+fmt(Math.round(sum.kcal))+'</b><small>kcal</small></div><div><b>'+(act?fmt(Math.round(tot/act)):'0')+'</b><small>daily average</small></div><div><b>'+met+'</b><small>goal days</small></div><div><b>'+(best?fmt(best):'–')+'</b><small>best day'+(bestK?' · '+parseInt(bestK.slice(8),10):'')+'</small></div></div>';
    var W = dim*10, gy = 64 - Math.round(g/mx*58);
    h += '<div class="stbars"><svg viewBox="0 0 '+W+' 66" preserveAspectRatio="none" role="img" aria-label="Steps for each day of '+MONTHS[mo]+'"><line x1="0" x2="'+W+'" y1="'+gy+'" y2="'+gy+'" stroke="#E9CF9C" stroke-width=".8" stroke-dasharray="3 3" vector-effect="non-scaling-stroke"/>'+
      days.map(function(x,i){ var bh = Math.round(x.st/mx*58); return '<rect x="'+(i*10+1.5)+'" y="'+(64-bh)+'" width="7" height="'+Math.max(bh,x.st>0?2:0)+'" rx="2" fill="'+(x.k===sel?'#FFFFFF':x.st>=g?'#E9CF9C':'rgba(233,207,156,.35)')+'"><title>'+x.d+' '+MONTHS[mo].slice(0,3)+': '+fmt(x.st)+' steps</title></rect>'; }).join('')+
      '</svg><div class="cx"><span>1</span><span>'+Math.ceil(dim/2)+'</span><span>'+dim+'</span></div></div>';
    var lead = (new Date(y,mo,1).getDay()+6)%7, cells = '';
    ['M','T','W','T','F','S','S'].forEach(function(x){ cells += '<span class="stwd">'+x+'</span>'; });
    for(var i=0;i<lead;i++) cells += '<span></span>';
    var c = 2*Math.PI*15;
    days.forEach(function(x){
      var p = Math.min(1,x.st/g);
      cells += '<button type="button" class="stcal'+(x.k===tk?' today':'')+(x.k===sel?' sel':'')+(x.st>=g?' met':'')+'" data-st="day" data-k="'+x.k+'"'+(x.fut?' disabled':'')+' aria-label="'+x.d+' '+MONTHS[mo]+': '+fmt(x.st)+' steps"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"/>'+(p>0?'<circle cx="18" cy="18" r="15" fill="none" stroke="'+(p>=1?'#E9CF9C':'rgba(233,207,156,.6)')+'" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-p)).toFixed(1)+'" transform="rotate(-90 18 18)"/>':'')+'</svg><i>'+x.d+'</i></button>';
    });
    h += '<div class="stgrid">'+cells+'</div>';
    h += '<p class="foot">Distance = steps × your stride ('+strideCm()+' cm). Calories use about 0.6 kcal per kg of body weight per km walked, and active time uses about 100 steps a minute. Your step history is saved on this device.</p></div>';
    return h;
  }
  function paintSteps(){
    if(!$('st-num')) return;
    if(stDayKey()!==todayKey()) return;
    var st = stOf(todayKey()), g = stepGoal(), ss = stepStats(st);
    if((st>=g) !== $('p-steps').querySelector('.sthero').classList.contains('met')){ renderSteps(); return; }
    $('st-num').textContent = fmt(st);
    $('st-ring').setAttribute('stroke-dashoffset',(STC*(1-Math.min(1,st/g))).toFixed(1));
    if($('st-left')) $('st-left').textContent = fmt(Math.max(0,g-st))+' to go';
    $('st-kcal').textContent = fmt(Math.round(ss.kcal)); $('st-km').textContent = fmtKm(ss.km); $('st-min').textContent = hmTxt(ss.min); $('st-pct').textContent = Math.round(st/g*100)+'%';
  }
  /* ---- Day / Week / Month views ---- */
  var MS3 = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  function wkStart(k){ var d = new Date(k+'T12:00:00'); return addDays(k, -((d.getDay()+6)%7)); }
  function sumKeys(keys){
    var tk = todayKey(), g = stepGoal(), r = {tot:0,met:0,el:0,best:0};
    keys.forEach(function(k){ if(k>tk) return; var v = stOf(k); r.el++; r.tot += v; if(v>=g) r.met++; if(v>r.best) r.best = v; });
    r.avg = r.el ? Math.round(r.tot/r.el) : 0; return r;
  }
  function weekKeys(ws){ var a = []; for(var i=0;i<7;i++) a.push(addDays(ws,i)); return a; }
  function monthKeys(y,mo){ var a = [], dim = new Date(y,mo+1,0).getDate(); for(var d=1; d<=dim; d++) a.push(y+'-'+pad(mo+1)+'-'+pad(d)); return a; }
  function segHtml(){
    var v = STV.view || 'd';
    return '<div class="stseg" role="tablist" aria-label="Steps view">'+[['d','Day'],['w','Week'],['m','Month']].map(function(x){ return '<button type="button" role="tab" data-st="view" data-v="'+x[0]+'" class="'+(v===x[0]?'on':'')+'" aria-selected="'+(v===x[0])+'">'+x[1]+'</button>'; }).join('')+'</div>';
  }
  function avgPill(avg, prev){
    var cls = '', arr = '<path d="M5 12h14"/>';
    if(prev>0 && avg>prev){ cls = ' up'; arr = '<path d="M7 17L17 7M9 7h8v8"/>'; }
    else if(prev>0 && avg<prev){ cls = ' dn'; arr = '<path d="M7 7l10 10M17 9v8H9"/>'; }
    var tip = prev>0 ? (avg>=prev ? 'Up from ' : 'Down from ')+fmt(prev)+' a day before' : 'Daily average';
    return '<span class="stavg'+cls+'" title="'+tip+'"><em>AVG</em>'+fmt(avg)+'<i aria-hidden="true"><svg viewBox="0 0 24 24">'+arr+'</svg></i></span>';
  }
  function stChipsHtml(r, days){
    var ss = stepStats(r.tot), sk = streakDays();
    return '<div class="stchips" role="list">'+
      '<div role="listitem" class="sk"><b><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2c1 3.5 5 5.8 5 11a5 5 0 0 1-10 0c0-2.2 1-3.7 2.2-4.8.2 1.6 1 2.6 2.1 3 .1-3.2-.6-5.6-1.3-9.2z"/></svg>'+sk+'</b><small>Streak</small></div>'+
      '<div role="listitem"><b>'+fmt(Math.round(ss.kcal))+'</b><small>kcal</small></div>'+
      '<div role="listitem"><b>'+(ss.km>=100?fmt(Math.round(ss.km)):(Math.round(ss.km*10)/10).toFixed(1))+'</b><small>km</small></div>'+
      '<div role="listitem"><b>'+hmTxt(ss.min)+'</b><small>active h</small></div>'+
      '<div role="listitem"><b>'+r.met+'/'+days+'</b><small>goals</small></div></div>';
  }
  function phHead(small, line, prevA, nextA, nextOff){
    return '<div class="stphd"><button type="button" class="stnav" data-st="'+prevA+'" aria-label="Previous"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><div><small>'+small+'</small><span>'+line+'</span></div><button type="button" class="stnav" data-st="'+nextA+'" aria-label="Next"'+(nextOff?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
  }
  /* smooth line chart: pts = [{v,lbl,a,k,fut}], sel = index ringed */
  function trendHtml(title, sub, pts, sel, avg, id){
    var N = pts.length, W = 320, H = 118, top = 10, bot = 106;
    var mx = Math.max(avg, stepGoal()*0.25); pts.forEach(function(p){ if(!p.fut && p.v>mx) mx = p.v; }); mx *= 1.12;
    var xy = []; pts.forEach(function(p,i){ if(p.fut) return; xy.push([(i+.5)*W/N, bot - p.v/mx*(bot-top), i]); });
    var line = '', area = '';
    if(xy.length){
      line = 'M'+xy[0][0].toFixed(1)+' '+xy[0][1].toFixed(1);
      for(var i=0;i<xy.length-1;i++){
        var p0 = xy[i-1]||xy[i], p1 = xy[i], p2 = xy[i+1], p3 = xy[i+2]||p2;
        var c1x = p1[0]+(p2[0]-p0[0])/6, c1y = Math.min(bot,Math.max(top-6,p1[1]+(p2[1]-p0[1])/6));
        var c2x = p2[0]-(p3[0]-p1[0])/6, c2y = Math.min(bot,Math.max(top-6,p2[1]-(p3[1]-p1[1])/6));
        line += ' C'+c1x.toFixed(1)+' '+c1y.toFixed(1)+' '+c2x.toFixed(1)+' '+c2y.toFixed(1)+' '+p2[0].toFixed(1)+' '+p2[1].toFixed(1);
      }
      area = line+' L'+xy[xy.length-1][0].toFixed(1)+' '+bot+' L'+xy[0][0].toFixed(1)+' '+bot+' Z';
    }
    var ay = (bot - avg/mx*(bot-top)).toFixed(1);
    var h = '<div class="sttrend"><div class="sh"><small>'+title+'</small><span>'+sub+'</span></div>';
    h += '<div class="sttl" style="grid-template-columns:repeat('+N+',minmax(0,1fr))">'+pts.map(function(p,i){ return '<button type="button" data-st="'+p.a+'" data-k="'+p.k+'" class="'+(i===sel?'on':'')+'"'+(p.fut?' disabled':'')+' aria-label="'+esc(p.t)+'">'+(p.hide && i!==sel ? '&nbsp;' : esc(p.lbl))+'</button>'; }).join('')+'</div>';
    h += '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="'+esc(title)+'"><defs><linearGradient id="'+id+'" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E9CF9C" stop-opacity=".38"/><stop offset="1" stop-color="#E9CF9C" stop-opacity="0"/></linearGradient></defs>';
    for(var j=0;j<N;j++){ var gx = ((j+.5)*W/N).toFixed(1); h += '<line x1="'+gx+'" x2="'+gx+'" y1="'+top+'" y2="'+bot+'" stroke="rgba(255,255,255,.12)" stroke-width="1"/>'; }
    if(area) h += '<path d="'+area+'" fill="url(#'+id+')"/>';
    h += '<line x1="6" x2="'+(W-6)+'" y1="'+ay+'" y2="'+ay+'" stroke="#fff" stroke-opacity=".75" stroke-width="2" stroke-dasharray="0 6" stroke-linecap="round"><title>Average '+fmt(avg)+' steps</title></line>';
    if(line) h += '<path d="'+line+'" fill="none" stroke="#E9CF9C" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>';
    xy.forEach(function(q){ var p = pts[q[2]];
      if(q[2]===sel) h += '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="8" fill="#1B2742" stroke="#fff" stroke-width="3.5"><title>'+esc(p.t)+': '+fmt(p.v)+' steps</title></circle><circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="3" fill="#E9CF9C"/>';
      else h += '<circle cx="'+q[0].toFixed(1)+'" cy="'+q[1].toFixed(1)+'" r="5" fill="#fff"><title>'+esc(p.t)+': '+fmt(p.v)+' steps</title></circle>';
    });
    return h+'</svg></div>';
  }
  function dayTrendHtml(){
    var k = stDayKey(), pts = [], vals = 0;
    for(var i=6;i>=0;i--){ var dk = addDays(k,-i), dt = new Date(dk+'T12:00:00'); var v = stOf(dk); vals += v;
      pts.push({v:v, k:dk, a:'day', lbl:dt.toLocaleDateString('en-IN',{weekday:'short'}).slice(0,3), t:dayLabel(dk)}); }
    return trendHtml('Last 7 days', 'Avg '+fmt(Math.round(vals/7))+' a day', pts, 6, Math.round(vals/7), 'sttgd');
  }
  function weekHtml(){
    var tk = todayKey(), ws = STV.week || wkStart(tk); STV.week = ws;
    var keys = weekKeys(ws), r = sumKeys(keys), pr = sumKeys(weekKeys(addDays(ws,-7))), g = stepGoal();
    var isCur = (ws===wkStart(tk)), we = keys[6];
    var a = new Date(ws+'T12:00:00'), b = new Date(we+'T12:00:00');
    var rng = a.getDate()+(a.getMonth()!==b.getMonth()?' '+MS3[a.getMonth()]:'')+' – '+b.getDate()+' '+MS3[b.getMonth()]+(b.getFullYear()!==new Date().getFullYear()?' '+b.getFullYear():'');
    var lbl = isCur ? 'This week' : (ws===addDays(wkStart(tk),-7) ? 'Last week' : 'Week');
    var h = '<div class="sthero stph">'+phHead(lbl, rng, 'wprev', 'wnext', isCur);
    h += '<div class="sttot"><div><b>'+fmt(r.tot)+'</b><small>steps'+(r.best?' · best day '+fmt(r.best):'')+'</small></div>'+avgPill(r.avg, pr.avg)+'</div>';
    var mx = Math.max(g, r.best, 1), sel = STV.day;
    h += '<div class="stwk" role="list">'+keys.map(function(k){
      var v = stOf(k), fut = k>tk, d = new Date(k+'T12:00:00'), pct = v ? Math.max(Math.round(v/mx*100), 26) : 0;
      return '<button type="button" role="listitem" data-st="day" data-k="'+k+'" class="'+(fut?'fut':'')+(k===tk?' td':'')+(k===sel?' sl':'')+'"'+(fut?' disabled':'')+' aria-label="'+esc(dayLabel(k))+': '+fmt(v)+' steps">'+
        '<span class="v">'+(fut?'':fmt(v))+'</span><span class="tr">'+(pct?'<i class="'+(v<g?'lo':'')+'" style="height:'+pct+'%"></i>':'')+'</span>'+
        '<span class="d">'+'MTWTFSS'.charAt((d.getDay()+6)%7)+'<b>'+d.getDate()+'</b></span></button>';
    }).join('')+'</div>';
    h += stChipsHtml(r, 7)+'</div>';
    var pts = [], all = 0, n = 0;
    for(var i=7;i>=0;i--){ var w = addDays(ws,-7*i), wr = sumKeys(weekKeys(w)), wd = new Date(w+'T12:00:00'), fut = w>tk;
      if(!fut){ all += wr.tot; n++; }
      pts.push({v:wr.tot, k:w, a:'wk', fut:fut, lbl:String(wd.getDate()), t:'Week of '+wd.getDate()+' '+MS3[wd.getMonth()]}); }
    h += trendHtml('Weekly trend', 'Last 8 weeks · tap a week', pts, 7, n?Math.round(all/n):0, 'sttgw');
    return h;
  }
  function stCalCells(y, mo){
    var tk = todayKey(), g = stepGoal(), sel = STV.day, c = 2*Math.PI*15, cells = '';
    ['M','T','W','T','F','S','S'].forEach(function(x){ cells += '<span class="stwd">'+x+'</span>'; });
    var lead = (new Date(y,mo,1).getDay()+6)%7; for(var i=0;i<lead;i++) cells += '<span></span>';
    monthKeys(y,mo).forEach(function(k){
      var st = stOf(k), p = Math.min(1,st/g), d = parseInt(k.slice(8),10), fut = k>tk;
      cells += '<button type="button" class="stcal'+(k===tk?' today':'')+(k===sel?' sel':'')+(st>=g?' met':'')+'" data-st="day" data-k="'+k+'"'+(fut?' disabled':'')+' aria-label="'+d+' '+MONTHS[mo]+': '+fmt(st)+' steps"><svg viewBox="0 0 36 36" aria-hidden="true"><circle cx="18" cy="18" r="15" fill="none" stroke="rgba(255,255,255,.12)" stroke-width="3.5"/>'+(p>0?'<circle cx="18" cy="18" r="15" fill="none" stroke="'+(p>=1?'#E9CF9C':'rgba(233,207,156,.7)')+'" stroke-width="3.5" stroke-linecap="round" stroke-dasharray="'+c.toFixed(1)+'" stroke-dashoffset="'+(c*(1-p)).toFixed(1)+'" transform="rotate(-90 18 18)"/>':'')+'</svg><i>'+d+'</i></button>';
    });
    return '<div class="stgrid">'+cells+'</div>';
  }
  function monthViewHtml(){
    var now = new Date(), m = STV.month || new Date(now.getFullYear(), now.getMonth(), 1); STV.month = m;
    var y = m.getFullYear(), mo = m.getMonth(), isCur = (y===now.getFullYear() && mo===now.getMonth());
    var keys = monthKeys(y,mo), r = sumKeys(keys), pm = new Date(y,mo-1,1), pr = sumKeys(monthKeys(pm.getFullYear(),pm.getMonth()));
    var h = '<div class="sthero stph">'+phHead(isCur?'This month':(y===now.getFullYear()?'Month':String(y)), MONTHS[mo]+' '+y, 'mprev', 'mnext', isCur);
    h += '<div class="sttot"><div><b>'+fmt(r.tot)+'</b><small>steps'+(r.best?' · best day '+fmt(r.best):'')+'</small></div>'+avgPill(r.avg, pr.avg)+'</div>';
    h += stCalCells(y,mo)+stChipsHtml(r, keys.length)+'</div>';
    var pts = [], all = 0, n = 0;
    for(var i=11;i>=0;i--){ var d = new Date(y, mo-i, 1), mr = sumKeys(monthKeys(d.getFullYear(),d.getMonth())), fut = d > now;
      if(!fut && mr.tot>0){ all += mr.tot; n++; }
      pts.push({v:mr.tot, k:d.getFullYear()+'-'+pad(d.getMonth()+1), a:'mo', fut:fut, lbl:MS3[d.getMonth()], hide:(i%2===1), t:MONTHS[d.getMonth()]+' '+d.getFullYear()}); }
    h += trendHtml('Monthly trend', 'Last 12 months · tap a month', pts, 11, n?Math.round(all/n):0, 'sttgm');
    return h;
  }
  function renderSteps(){
    pruneLog();
    if(STV.day && STV.day > todayKey()) STV.day = null;
    var v = STV.view || 'd', body;
    if(v==='w') body = weekHtml();
    else if(v==='m') body = monthViewHtml();
    else body = heroHtml()+dayTrendHtml();
    $('p-steps').innerHTML = '<div class="stx">'+motionCard()+segHtml()+body+'</div>';
  }
  $('p-steps').addEventListener('click',function(ev){
    if(!S) return;
    var b = ev.target.closest('button[data-st]'); if(!b || b.disabled) return;
    var a = b.getAttribute('data-st'), k = stDayKey();
    if(a==='add') addSteps(parseInt(b.getAttribute('data-n'),10));
    else if(a==='set'){
      var v = parseFloat($('st-in').value);
      if(!(v>=0) || v>100000){ toast('Enter a number of steps between 0 and 100,000.'); return; }
      var lg = logOf(k); lg.st = Math.round(v); lsSet(S); renderSteps(); renderHome(); toast('Steps saved for '+dayLabel(k).toLowerCase()+'.');
    }
    else if(a==='goal'){ S.stepGoal = parseInt(b.getAttribute('data-n'),10); lsSet(S); renderSteps(); renderHome(); }
    else if(a==='stride'){
      var sv = parseFloat($('st-stride').value);
      if(!(sv>=40 && sv<=120)){ toast('Enter a stride between 40 and 120 cm.'); return; }
      S.stride = Math.round(sv); lsSet(S); renderSteps(); renderHome(); toast('Stride saved. Distance updated.');
    }
    else if(a==='sensor'){ if(sens.on) sensorStop(); else sensorStart(); }
    else if(a==='motion'){ motionTry(true); }
    else if(a==='prev' || a==='next'){
      var nk = addDays(k, a==='prev' ? -1 : 1); if(nk > todayKey()) return;
      STV.day = (nk===todayKey()) ? null : nk;
      var nd = new Date(nk+'T12:00:00'); STV.month = new Date(nd.getFullYear(), nd.getMonth(), 1); STV.week = wkStart(nk);
      renderSteps();
    }
    else if(a==='view'){ STV.view = b.getAttribute('data-v'); try{ localStorage.setItem('kdn_stv', STV.view); }catch(e){} renderSteps(); }
    else if(a==='wprev' || a==='wnext'){ STV.week = addDays(STV.week || wkStart(todayKey()), a==='wprev' ? -7 : 7); if(STV.week > todayKey()) STV.week = wkStart(todayKey()); renderSteps(); }
    else if(a==='wk'){ STV.week = b.getAttribute('data-k'); renderSteps(); }
    else if(a==='mo'){ var mk = b.getAttribute('data-k').split('-'); STV.month = new Date(+mk[0], +mk[1]-1, 1); renderSteps(); }
    else if(a==='day'){ var dk = b.getAttribute('data-k'); STV.day = (dk===todayKey()) ? null : dk; var dd = new Date(dk+'T12:00:00'); STV.month = new Date(dd.getFullYear(), dd.getMonth(), 1); STV.week = wkStart(dk); STV.view = 'd'; renderSteps(); var hh = $('p-steps').querySelector('.sthero'); if(hh) hh.scrollIntoView({behavior:'smooth',block:'start'}); }
    else if(a==='mprev' || a==='mnext'){ var m = STV.month; STV.month = new Date(m.getFullYear(), m.getMonth()+(a==='mprev'?-1:1), 1); renderSteps(); }
  });


  /* ---------- Motion permission: asked once after setup; Steps page explains how to turn it on ---------- */
  function requestMotion(){
    return new Promise(function(done){
      if(!('DeviceMotionEvent' in window)){ done(false); return; }
      try{
        if(typeof DeviceMotionEvent.requestPermission === 'function'){
          DeviceMotionEvent.requestPermission().then(function(r){ done(r==='granted'); }).catch(function(){ done(false); });
          return;
        }
      }catch(e){ done(false); return; }
      var got = false;
      function t(ev){ var a = ev.accelerationIncludingGravity; if(a && a.x!=null){ got = true; } }
      window.addEventListener('devicemotion',t);
      setTimeout(function(){ window.removeEventListener('devicemotion',t); done(got); },1500);
    });
  }
  function motionSet(v){ if(!S) return; S.motion = v; lsSet(S); }
  function motionAuto(){ if(S && S.motion==='granted' && !sens.on) sensorBegin(true); }
  function motionAsk(){ if(!S || S.motion) return; $('mpm').hidden = false; $('mp-allow').focus(); }
  function motionClose(){ $('mpm').hidden = true; }
  function motionTry(fromPage){
    requestMotion().then(function(ok){
      motionSet(ok ? 'granted' : 'denied'); sens.nodata = false;
      motionClose();
      if(ok){ sensorBegin(true); toast('Step counting is on.'); }
      else { if(!$('p-steps').hidden) renderSteps(); toast(fromPage ? 'Motion access is still off. Follow the steps shown to turn it on.' : 'Step counting is off. You can turn it on from the Steps page.'); }
      if(!$('p-steps').hidden) renderSteps();
    });
  }
  $('mp-allow').addEventListener('click',function(){ motionTry(false); });
  $('mp-later').addEventListener('click',function(){ motionSet('later'); motionClose(); if(!$('p-steps').hidden) renderSteps(); });
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) motionAuto(); });
  function motionCard(){
    if(!('DeviceMotionEvent' in window)) return '<div class="mpcard"><b>Step counting needs a phone</b><span>This device has no motion sensor. Open KDN on your phone to count steps automatically.</span></div>';
    if(S.motion==='granted' && sens.on && !sens.nodata) return '';
    var paused = (S.motion==='granted');
    var h = '<div class="mpcard"><div class="mph"><span class="mpdot"></span><b>'+(paused ? 'Step counting is paused' : 'Step counting is off')+'</b></div>';
    h += '<span>'+(paused ? 'Your phone stopped sharing motion data with KDN. Tap below to turn it back on.' : 'KDN can’t count your steps because motion access was not allowed. Allow it to fill your ring automatically.')+'</span>';
    h += '<button type="button" class="btn" data-st="motion">'+(paused ? 'Turn on again' : 'Allow step counting')+'</button>';
    h += '<details class="mphelp"'+(S.motion==='denied'?' open':'')+'><summary>Why isn’t it working?</summary><ol>'+
      '<li><b>iPhone:</b> open <b>Settings → Safari</b> and turn on <b>Motion &amp; Orientation Access</b>. Then come back to KDN and tap the button above, and choose <b>Allow</b>.</li>'+
      '<li><b>Android (Chrome):</b> tap the icon left of the web address → <b>Permissions</b> (or <b>Site settings</b>) → <b>Motion sensors</b> → <b>Allow</b>. Then tap the button above.</li>'+
      '<li>Keep KDN open on screen while you walk. Battery saver can stop the sensor, so turn it off while counting.</li></ol></details></div>';
    return h;
  }
  /* Pedometer: smoothed acceleration, peak detection with an adaptive threshold,
     a 0.25 to 2 second step rhythm, and 4 steps in a row before counting starts. */
  var PED = {f:9.81, base:9.81, up:false, peak:0, avg:1.4, lastStep:0, pending:0, walking:false, wake:null};
  function onMotion(ev){
    var a = ev.accelerationIncludingGravity; if(!a || a.x==null) return;
    sens.got = true;
    var m = Math.sqrt(a.x*a.x + a.y*a.y + a.z*a.z), now = Date.now();
    PED.f = PED.f*0.7 + m*0.3;                       /* low-pass: removes hand shake */
    PED.base = PED.base*0.985 + PED.f*0.015;         /* slow baseline: gravity and posture */
    var v = PED.f - PED.base, thr = Math.max(0.75, PED.avg*0.5);
    if(!PED.up && v > thr){ PED.up = true; PED.peak = v; }
    else if(PED.up){
      if(v > PED.peak) PED.peak = v;
      if(v < thr*0.25){
        PED.up = false;
        var gap = now - PED.lastStep;
        if(gap < 250) return;                          /* too fast to be a step */
        PED.avg = PED.avg*0.8 + Math.min(PED.peak,6)*0.2;
        if(gap > 2000){ PED.pending = 0; PED.walking = false; }   /* rhythm broken */
        PED.lastStep = now;
        if(PED.walking) addSteps(1);
        else if(++PED.pending >= 4){ PED.walking = true; addSteps(PED.pending); PED.pending = 0; }
      }
    }
  }
  function sensorBegin(quiet){
    sens.nodata = false;
    PED.pending = 0; PED.walking = false; PED.lastStep = 0; PED.up = false;
    window.addEventListener('devicemotion',onMotion);
    sens.on = true; sens.got = false; if(S && !$('p-steps').hidden) renderSteps();
    try{ if(navigator.wakeLock) navigator.wakeLock.request('screen').then(function(l){ PED.wake = l; }).catch(function(){}); }catch(e){}
    sens.timer = setTimeout(function(){ if(sens.on && !sens.got){ sensorStop(); sens.nodata = true; if(S && !$('p-steps').hidden) renderSteps(); if(!quiet) toast('This phone did not share motion data.'); } },4000);
  }
  function sensorStart(){
    try{
      if(typeof DeviceMotionEvent.requestPermission === 'function'){
        DeviceMotionEvent.requestPermission().then(function(res){ if(res==='granted') sensorBegin(); else toast('Motion access was not allowed.'); }).catch(function(){ toast('This browser would not allow the motion sensor.'); });
      } else sensorBegin();
    }catch(e){ toast('The motion sensor is not available here.'); }
  }
  function sensorStop(){
    window.removeEventListener('devicemotion',onMotion);
    sens.on = false; clearTimeout(sens.timer);
    try{ if(PED.wake){ PED.wake.release(); PED.wake = null; } }catch(e){}
    if(S && !$('p-steps').hidden) renderSteps();
  }

