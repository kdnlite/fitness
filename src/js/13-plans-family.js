  /* ---------- Plans: Individual, Family and Gym (3 months each, 20% off) ---------- */
  var PLANS = {
    ind:{was:'₹999',now:'₹799',save:'₹200',sub:'3-month plan<br>for 1 person',ticks:['Calorie and protein targets set for your body','Daily meals from 185 Indian dishes','1,100+ exercises with male and female demos','Medicine reminders, medical records and period tracker','Step tracker, weekly check-ins and KDN AI']},
    fam:{was:'₹2,499',now:'₹1,999',save:'₹500',sub:'3-month plan<br>for up to 4 people',ticks:['A separate plan for each family member','Different diets in one home: veg, vegan or non-veg','Medicines, reports and period tracker for each person','Everything in the Individual plan, for every member']},
    gym:{was:'₹7,999',now:'₹6,399',save:'₹1,600',sub:'3-month plan<br>for up to 600 members',ticks:['KDN Gym Manager: members, fees and attendance','Trainers, staff and salaries in one place','A KDN plan for each member by QR code','Bills, reports and WhatsApp reminders']}
  };
  var curPlan = 'ind';
  function setPlan(k){
    if(!PLANS[k]) k = 'ind'; curPlan = k; payPlan = k; var p = PLANS[k];
    $('pc-was').textContent = p.was; $('pc-now').textContent = p.now; $('pc-sub').innerHTML = p.sub;
    $('pc-save').textContent = 'You save '+p.save+' · 20% off';
    $('pc-ticks').innerHTML = p.ticks.map(function(t){return '<li>'+esc(t)+'</li>'}).join('');
    if(!payBusy) $('pay-lbl').textContent = 'Pay '+p.now;
    Array.prototype.forEach.call(document.querySelectorAll('.plansel button'),function(b){ var on = b.getAttribute('data-plan')===k; b.classList.toggle('on',on); b.setAttribute('aria-checked',on); });
  }
  Array.prototype.forEach.call(document.querySelectorAll('.plansel button'),function(b){ b.addEventListener('click',function(){ setPlan(b.getAttribute('data-plan')); }); });
  setPlan('ind');
  /* Coupon: letters can be any case. */
  $('coupon-form').addEventListener('submit',function(ev){
    ev.preventDefault();
    var v = $('cp-in').value.trim().toLowerCase(), m = $('cp-msg');
    m.hidden = false; m.className = 'cpmsg';
    if(!v){ m.textContent = 'Enter a coupon code first.'; m.classList.add('bad'); return; }
    if(v!==COUPON){ m.textContent = 'That coupon is not valid. Check the spelling and try again.'; m.classList.add('bad'); return; }
    if(licensed()){
      if(licPlan()!==curPlan){ licSwitch(curPlan); m.textContent = 'Your coupon now unlocks the '+PLANNAME[curPlan]+' plan.'; m.classList.add('ok'); return; }
      m.textContent = 'Your coupon is already active. Time left is shown in the menu.'; m.classList.add('ok'); return;
    }
    var now = Date.now(), l = {start:now,end:now+LIC_DAYS*86400000,code:COUPON,plan:curPlan};
    licSet(l); licMem = l;
    m.hidden = true; $('cp-in').value = '';
    $('done-until').textContent = 'Valid until '+untilTxt(l)+'. You can see the time left in the menu.';
    paySetMode('done'); tickLic();
    window.scrollTo(0,0);
    var h = $('pay-done').querySelector('h2'); if(h){ h.setAttribute('tabindex','-1'); h.focus({preventScroll:true}); }
    toast('Coupon accepted.');
    clearTimeout(doneTimer);
    doneTimer = setTimeout(function(){ if(curScreen==='s-pay' && !$('pay-done').hidden) afterPay(); },3500);
  });
  function afterPay(){
    clearTimeout(doneTimer);
    if(payPlan==='gym') show('s-gym');
    else if(payPlan==='fam' && S) show('s-family');
    else if(S) openHome(); else { show('s-form'); goStep(0); }
  }
  $('done-go').addEventListener('click',afterPay);
  $('act-sw').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-sw]'); if(!b || !licensed()) return;
    var p = b.getAttribute('data-sw'); if(p===licPlan()) return;
    licSwitch(p); setPlan(p); payShow(); toast('Switched to the '+PLANNAME[p]+' plan.');
  });
  $('act-go').addEventListener('click',function(){ if(payPlan==='gym') show('s-gym'); else if(payPlan==='fam' && S) show('s-family'); else if(S) openHome(); else show('s-intro'); });

  /* ---------- Family pack: you and 2 family members ---------- */
  var FKEY = 'kdn.family.v1', FAM = null, famForm = null, famDel = null;
  function famLoad(){
    if(FAM) return FAM;
    var o = null;
    try{ var t = localStorage.getItem(FKEY); o = t ? JSON.parse(t) : null; }catch(e){}
    FAM = (o && Array.isArray(o.members)) ? o : {members:[]};
    FAM.members = FAM.members.filter(function(m){ return m && m.p && m.id; }).slice(0,3);
    FAM.members.forEach(function(m){ try{ m.p = normalize(m.p); }catch(e){} if(!m.log) m.log = {}; if(!m.wl) m.wl = {}; });
    return FAM;
  }
  function famSave(){ try{ localStorage.setItem(FKEY,JSON.stringify(FAM)); }catch(e){} }
  function fmGoal(p){ return p.stepGoal>0 ? p.stepGoal : (p.goal==='lose' ? 10000 : p.goal==='gain' ? 7000 : 8000); }
  function fmSteps(p,n){
    var stride = p.height*(p.gender==='female' ? 0.413 : 0.415)/100, km = n*stride/1000;
    return {km:km,kcal:0.6*p.weight*km};
  }
  function fmStepsOn(m,k){ return (m.log[k] && m.log[k].st) || 0; }
  function fmWeights(m){
    return Object.keys(m.wl).sort().map(function(k){return {k:k,kg:m.wl[k]}});
  }
  function fmBars(m,goal){
    var days = [], i, mx = goal;
    for(i=6;i>=0;i--){ var dt = new Date(); dt.setDate(dt.getDate()-i); var k = dkey(dt); days.push({k:k,dt:dt,st:fmStepsOn(m,k)}); }
    days.forEach(function(x){ if(x.st>mx) mx = x.st; });
    var gy = 60-Math.round(goal/mx*54);
    var bars = days.map(function(x,ix){
      var bh = Math.round(x.st/mx*54);
      return '<rect x="'+(ix*26+4)+'" y="'+(60-bh)+'" width="18" height="'+Math.max(bh,x.st>0?2:0)+'" rx="4" fill="'+(ix===6?'#1D4ED8':x.st>=goal?'#2E9E6E':'#9DB5EE')+'"><title>'+x.dt.toLocaleDateString('en-IN',{weekday:'short',day:'numeric',month:'short'})+': '+fmt(x.st)+' steps</title></rect>';
    }).join('');
    var tot = 0, met = 0; days.forEach(function(x){ tot += x.st; if(x.st>=goal) met++; });
    return {svg:'<svg viewBox="0 0 182 66" preserveAspectRatio="none" role="img" aria-label="Steps for the last 7 days"><line x1="0" x2="182" y1="'+gy+'" y2="'+gy+'" stroke="#2E9E6E" stroke-width="1" stroke-dasharray="4 3"/>'+bars+'</svg><div class="fmx">'+days.map(function(x){return '<span>'+x.dt.toLocaleDateString('en-IN',{weekday:'narrow'})+'</span>'}).join('')+'</div>',tot:tot,met:met};
  }
  function fmCard(m){
    var p = m.p, r = calc(p), dow = todayDow(), wp = weekPlan(p), day = wp.days[dow], mp = mealPlan(p,r,dow), tk = todayKey();
    var st = fmStepsOn(m,tk), goal = fmGoal(p), ss = fmSteps(p,st), bars = fmBars(m,goal), wl = fmWeights(m), last = wl.length ? wl[wl.length-1].kg : p.weight;
    var tw = targetOf(p), pct = Math.min(100,Math.round(st/goal*100));
    var h = '<div class="fmc" data-id="'+m.id+'"><div class="fmh"><span class="fav">'+esc(p.name.charAt(0).toUpperCase())+'</span><div><b>'+esc(p.name)+'</b><small>'+p.age+' yrs · '+esc(goalLine(p))+'</small></div></div>';
    h += '<div class="hchips"><div><b>'+fmt(r.target)+'</b><span>kcal a day</span></div><div><b>'+r.protein+' g</b><span>protein</span></div><div><b>'+r.water.toFixed(1)+' L</b><span>water</span></div></div>';
    h += '<div class="fmsec"><div class="fmt"><b>Steps today</b><span>'+fmt(st)+' of '+fmt(goal)+'</span></div><div class="bar"><i style="width:'+pct+'%"></i></div><p class="hint">'+fmtKm(ss.km)+' km · about '+Math.round(ss.kcal)+' kcal walked</p>';
    h += '<div class="cbs">'+[['500','+500'],['1000','+1,000'],['2000','+2,000'],['-500','−500']].map(function(x){return '<button type="button" class="cb" data-fa="add" data-id="'+m.id+'" data-n="'+x[0]+'">'+x[1]+'</button>'}).join('')+'</div>';
    h += '<div class="crow"><input class="sel" type="number" min="0" max="100000" inputmode="numeric" placeholder="Enter total steps today" id="fs-'+m.id+'" aria-label="Total steps today for '+esc(p.name)+'"><button type="button" class="btn sm" data-fa="setst" data-id="'+m.id+'">Save</button></div>';
    h += '<div class="fmchart">'+bars.svg+'</div><p class="hint">Last 7 days: '+fmt(bars.tot)+' steps · goal met on '+bars.met+' of 7 days</p></div>';
    h += '<div class="fmsec"><div class="fmt"><b>Weight</b><span>'+r1(last)+' kg now · target '+r1(tw)+' kg</span></div><div class="crow"><input class="sel" type="number" min="20" max="400" step="0.1" inputmode="decimal" placeholder="Today’s weight in kg" id="fw-'+m.id+'" aria-label="Weight for '+esc(p.name)+'"><button type="button" class="btn sm" data-fa="wsave" data-id="'+m.id+'">Log</button></div>';
    h += '<p class="hint">Started at '+r1(p.weight)+' kg'+(wl.length ? ' · '+wl.length+' weigh-in'+(wl.length===1?'':'s')+' logged' : '')+'.</p></div>';
    h += '<div class="fmsec"><div class="fmt"><b>Today’s plan</b><span>'+esc(day.t)+'</span></div><ul class="hl">'+day.items.map(function(it){return '<li><b>'+esc(EXS[it.id].n)+'</b><span>'+esc(rxTxt(it.id,it))+'</span></li>'}).join('')+'</ul>';
    h += '<ul class="hl">'+mp.slots.map(function(s){return '<li><span class="mpic sm">'+dishPic(s.x)+'</span><b>'+esc(s.x.n)+'</b><span>'+s.sl[0].replace(' snack','')+' · '+Math.round(s.k)+' kcal</span></li>'}).join('')+mp.tops.map(function(q){return '<li><b>'+q.u+' × '+esc(q.t.n)+'</b><span>Protein top-up</span></li>'}).join('')+'</ul></div>';
    h += '<div class="hb two"><button type="button" class="btn sm ghost" data-fa="edit" data-id="'+m.id+'">Edit profile</button>'+(famDel===m.id ? '<button type="button" class="btn sm danger" data-fa="rmyes" data-id="'+m.id+'">Tap again to remove</button>' : '<button type="button" class="btn sm ghost" data-fa="rm" data-id="'+m.id+'">Remove member</button>')+'</div></div>';
    return h;
  }
  function famFormHtml(f){
    var d = f.p || {}, ft = '', inch = '';
    if(d.height>0){ var t = Math.round(d.height/2.54*10)/10, a = Math.floor(t/12); ft = a; inch = r1(t-a*12); }
    function sel(id,label,list,cur){ return '<label class="fl" for="'+id+'">'+label+'</label><select class="sel" id="'+id+'">'+list.map(function(x){return '<option value="'+x[0]+'"'+(String(cur)===String(x[0])?' selected':'')+'>'+esc(x[1])+'</option>'}).join('')+'</select>'; }
    var h = '<div class="sect famform"><div class="sh"><div><small>'+(f.id?'Edit member':'New family member')+'</small><h3>'+(f.id?esc(d.name):'Add a family member')+'</h3></div></div>';
    h += '<label class="fl" for="ff-name">Name</label><input class="sinp" id="ff-name" maxlength="30" value="'+esc(d.name||'')+'" placeholder="Name">';
    h += sel('ff-gender','Gender',[['female','Female'],['male','Male'],['other','Other']],d.gender||'female');
    h += '<div class="two"><div><label class="fl" for="ff-age">Age</label><input class="sinp" id="ff-age" type="number" inputmode="numeric" value="'+(d.age||'')+'" placeholder="Years"></div><div><label class="fl" for="ff-weight">Weight (kg)</label><input class="sinp" id="ff-weight" type="number" step="0.1" inputmode="decimal" value="'+(d.weight||'')+'" placeholder="kg"></div></div>';
    h += '<div class="two"><div><label class="fl" for="ff-ft">Height (feet)</label><input class="sinp" id="ff-ft" type="number" inputmode="numeric" value="'+ft+'" placeholder="ft"></div><div><label class="fl" for="ff-in">Height (inches)</label><input class="sinp" id="ff-in" type="number" step="0.1" inputmode="decimal" value="'+inch+'" placeholder="in"></div></div>';
    h += sel('ff-diet','Diet',[['veg','Vegetarian'],['vegan','Vegan'],['nonveg','Non-vegetarian']],d.diet||'veg');
    h += sel('ff-goal','Goal',[['lose','Lose weight'],['gain','Gain weight'],['maintain','Stay stable']],d.goal||'lose');
    h += '<label class="fl" for="ff-amt">Kilograms to lose or gain (or the weight to hold)</label><input class="sinp" id="ff-amt" type="number" step="0.1" inputmode="decimal" value="'+(d.amt||'')+'" placeholder="kg">';
    h += sel('ff-loc','Where they train',[['h0','Home, no equipment'],['h1','Home with dumbbells'],['gym','Gym']],d.loc||'h0');
    h += sel('ff-level','Level',[['beginner','Beginner'],['mid','Intermediate'],['adv','Advanced']],d.level||'beginner');
    h += sel('ff-days','Training days a week',[[3,'3 days'],[4,'4 days'],[5,'5 days'],[6,'6 days']],d.days||4);
    h += sel('ff-budget','Food budget',[['low','Low'],['mid','Medium'],['high','High']],d.budget||'mid');
    h += '<p class="payerr" id="ff-err" role="alert" hidden></p><div class="hb two"><button type="button" class="btn" data-fa="save">Save member</button><button type="button" class="btn ghost" data-fa="cancel">Cancel</button></div></div>';
    return h;
  }
  function renderFamily(){
    var F = famLoad(), h = '';
    h += '<div class="famhero"><small>Family pack</small><h2>Family tracker</h2><p>You and up to 3 family members. Everyone gets a personal plan, and you can follow each person’s steps, weight and daily plan here.</p>';
    var left = planOn('fam') ? (function(){var q = cdParts(licOf('fam').end-Date.now()); return q.d+' days left'})() : '';
    h += '<div class="famslots">'+[0,1,2,3].map(function(i){ var nm = i===0 ? (S?S.name:'You') : (F.members[i-1] ? F.members[i-1].p.name : ''); return '<span class="slot'+(nm?' on':'')+'">'+(nm?esc(nm):'Open slot')+'</span>'; }).join('')+'</div>'+(left?'<small class="fmleft">'+left+'</small>':'')+'</div>';
    if(famForm){ h += famFormHtml(famForm); $('family').innerHTML = h; return; }
    /* you */
    if(S){
      var st = ((S.log||{})[todayKey()]||{}).st||0, g = stepGoal(), r0 = curR || calc(S);
      h += '<div class="fmc me"><div class="fmh"><span class="fav me">You</span><div><b>'+esc(S.name)+'</b><small>'+esc(goalLine(S))+'</small></div></div><div class="hchips"><div><b>'+fmt(r0.target)+'</b><span>kcal a day</span></div><div><b>'+fmt(st)+'</b><span>steps today</span></div><div><b>'+Math.round(st/g*100)+'%</b><span>of step goal</span></div></div><div class="hb"><button type="button" class="btn sm" data-fa="me">Open my plan</button></div></div>';
    } else {
      h += '<div class="fmc me"><p class="hint">Make your own plan first so your card shows here too.</p><div class="hb"><button type="button" class="btn sm" data-fa="mk">Make my plan</button></div></div>';
    }
    F.members.forEach(function(m){ h += fmCard(m); });
    if(F.members.length<3) h += '<button type="button" class="btn addbtn" data-fa="new">+ Add family member ('+(3-F.members.length)+' left)</button>';
    else h += '<p class="hint">All 4 places in your family pack are used.</p>';
    h += '<p class="foot">Family details are saved on this device only. Steps are entered by hand here, using each person’s phone or watch.</p>';
    $('family').innerHTML = h;
  }
  function famVal(){
    var ft = parseFloat($('ff-ft').value), inch = parseFloat($('ff-in').value);
    var d = {name:$('ff-name').value.trim(),gender:$('ff-gender').value,age:parseInt($('ff-age').value,10),weight:parseFloat($('ff-weight').value),
      height:(ft>=0 ? ft : 0)*30.48+((inch>=0 ? inch : 0)*2.54),diet:$('ff-diet').value,goal:$('ff-goal').value,amt:parseFloat($('ff-amt').value),
      loc:$('ff-loc').value,level:$('ff-level').value,days:parseInt($('ff-days').value,10),budget:$('ff-budget').value,tmode:'safe'};
    if(!(ft>0)) d.height = NaN;
    d = normalize(d);
    var err = '';
    KEYS.forEach(function(k){ if(!err){ var e = FV[k](d); if(e) err = e; } });
    return {d:d,err:err};
  }
  $('family').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-fa]'); if(!b) return;
    var a = b.getAttribute('data-fa'), F = famLoad(), id = b.getAttribute('data-id');
    var m = F.members.filter(function(x){return x.id===id})[0];
    if(a==='new'){ famForm = {p:null,id:null}; renderFamily(); window.scrollTo(0,0); return; }
    if(a==='cancel'){ famForm = null; renderFamily(); return; }
    if(a==='me'){ openHome(); return; }
    if(a==='mk'){ show('s-form'); goStep(0); return; }
    if(a==='edit' && m){ famForm = {p:m.p,id:m.id}; renderFamily(); window.scrollTo(0,0); return; }
    if(a==='save'){
      var v = famVal(), e = $('ff-err');
      if(v.err){ e.textContent = v.err; e.hidden = false; return; }
      if(famForm.id){ var mm = F.members.filter(function(x){return x.id===famForm.id})[0]; if(mm){ var keep = mm.p; v.d.stepGoal = keep.stepGoal; mm.p = v.d; } }
      else F.members.push({id:'m'+Date.now().toString(36),p:v.d,log:{},wl:{}});
      famForm = null; famSave(); renderFamily(); toast('Saved.'); return;
    }
    if(!m) return;
    if(a==='add'){ var tk = todayKey(); if(!m.log[tk]) m.log[tk] = {}; m.log[tk].st = Math.max(0,(m.log[tk].st||0)+parseInt(b.getAttribute('data-n'),10)); famSave(); var y = window.scrollY; renderFamily(); window.scrollTo(0,y); return; }
    if(a==='setst'){
      var n = parseFloat($('fs-'+id).value);
      if(!(n>=0) || n>100000){ toast('Enter steps between 0 and 100,000.'); return; }
      var tk2 = todayKey(); if(!m.log[tk2]) m.log[tk2] = {}; m.log[tk2].st = Math.round(n); famSave(); var y2 = window.scrollY; renderFamily(); window.scrollTo(0,y2); toast('Steps saved.'); return;
    }
    if(a==='wsave'){
      var w = parseFloat($('fw-'+id).value);
      if(!(w>=20 && w<=400)){ toast('Enter a weight between 20 and 400 kg.'); return; }
      m.wl[todayKey()] = Math.round(w*10)/10; famSave(); var y3 = window.scrollY; renderFamily(); window.scrollTo(0,y3); toast('Weight logged.'); return;
    }
    if(a==='rm'){ famDel = id; renderFamily(); return; }
    if(a==='rmyes'){ F.members = F.members.filter(function(x){return x.id!==id}); famDel = null; famSave(); renderFamily(); toast('Member removed.'); return; }
  });

