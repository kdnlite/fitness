  /* ---------- Wizard ---------- */
  var f = $('f');
  var steps = Array.prototype.slice.call(f.querySelectorAll('.step'));
  var N = steps.length, cur = 0, amtGoal = null, tKey = null;
  var STEPNAMES = ['Name','Weight','Height','Age','Gender','Diet','Goal','Target','Where you train','Level','Days a week','Time','Budget'];
  var STEP_TIME = 11, STEP_AMT = 7;
  var AV = [['walk',0],['curl',1],['squat',0],['stretch',0],['yoga',0],['pullup',1],['ohpress',1],['skip',1],['goblet',1],['kbswing',1],['highknees',0],['run',0],['squat',1]];
  $('seg').innerHTML = steps.map(function(){return '<i></i>'}).join('');
  function val(name){return (f.querySelector('input[name='+name+']:checked')||{}).value}
  function tkeyOf(o){return o.goal+'|'+o.amt+'|'+o.weight}
  function formHeight(){
    var ft = parseFloat($('hft').value), inch = parseFloat($('hin').value);
    if(!(ft>=0)) return NaN;
    if(!(inch>=0)) inch = 0;
    return Math.round((ft*12+inch)*2.54*10)/10;
  }
  function readForm(){
    var o = {name:$('name').value.trim(), weight:parseFloat($('weight').value), height:formHeight(), age:parseInt($('age').value,10), gender:val('gender'), diet:val('diet'), goal:val('goal'), amt:parseFloat($('amount').value), tmode:val('tmode'), budget:val('budget'), loc:val('loc'), level:val('level'), days:parseInt(val('days'),10)};
    var p = paceInfo(o);
    if(!p) o.weeks = 0;
    else if(o.tmode==='custom'){
      var n = parseFloat($('tnum').value);
      o.weeks = n>0 ? toWeeks(n,$('tunit').value) : NaN;
    } else o.weeks = p.safeWeeks;
    return o;
  }
  function setMode(m){var r = f.querySelector('input[name=tmode][value='+m+']'); if(r) r.checked = true}
  function fillForm(o){
    $('name').value = o.name||''; $('weight').value = o.weight>0?o.weight:''; $('age').value = o.age>0?o.age:'';
    if(o.height>0){ var t = Math.round(o.height/2.54*10)/10, ft = Math.floor(t/12); $('hft').value = ft; $('hin').value = r1(t-ft*12); }
    else { $('hft').value = ''; $('hin').value = ''; }
    ['gender','diet','goal','budget','tmode','loc','level'].forEach(function(k){
      Array.prototype.forEach.call(f.querySelectorAll('input[name='+k+']'),function(r){r.checked = (r.value===o[k])});
    });
    Array.prototype.forEach.call(f.querySelectorAll('input[name=days]'),function(r){r.checked = (parseInt(r.value,10)===o.days)});
    $('amount').value = o.amt>0 ? o.amt : '';
    amtGoal = o.goal || null;
    $('tnum').value = (o.tmode==='custom' && o.weeks>0) ? o.weeks : ''; $('tunit').value = 'w';
    tKey = tkeyOf(o);
  }
  function previewTxt(o){
    if(!(o.amt>0) || !(o.weight>0)) return '';
    var tw = r1(targetOf(o)), diff = tw - o.weight;
    if(o.goal==='maintain' && Math.abs(diff)<1) return 'You will stay at about '+tw+' kg.';
    var p = paceInfo(o);
    return 'Target weight: '+tw+' kg'+(p ? ' · safe pace about '+timeTxt(p.safeWeeks) : '')+'.';
  }
  function prepAmount(){
    var g = val('goal'), w = parseFloat($('weight').value);
    $('amountq').textContent = {lose:'How much weight do you want to lose?',gain:'How much weight do you want to gain?',maintain:'At what weight do you want to stay stable?'}[g] || 'What is your target?';
    $('amounthint').textContent = {lose:'Enter the number of kilograms. You choose how fast on the next question.',gain:'Enter the number of kilograms. You choose how fast on the next question.',maintain:'Enter the weight in kilograms you want to hold.'}[g] || '';
    if(amtGoal !== g){ $('amount').value = (g==='maintain' && w>0) ? String(w) : ''; amtGoal = g; }
    $('amountprev').textContent = previewTxt(readForm());
  }
  $('amount').addEventListener('input',function(){ $('amountprev').textContent = previewTxt(readForm()) });

  function prepTime(){
    var o = readForm(), p = paceInfo(o), box = $('timebox');
    box.hidden = !p;
    if(!p){
      $('timeq').textContent = 'No time needed';
      $('timehint').textContent = 'You want to stay at about your current weight, so there is no target to reach. Tap Next.';
      return;
    }
    var key = tkeyOf(o);
    if(tKey !== key){ tKey = key; $('tnum').value = ''; $('tunit').value = 'w'; setMode('safe'); }
    if(!val('tmode')) setMode('safe');
    var word = p.dir==='lose' ? 'lose' : 'gain';
    $('timeq').textContent = 'In how much time do you want to '+word+' '+r1(p.ad)+' kg?';
    $('timehint').textContent = 'Take the recommended pace, or pick any time you like. If it is faster than recommended we warn you and still build it, up to 1 kg a week. Beyond that we cannot plan it.';
    var rate = p.ad/p.safeWeeks, gap = Math.round(rate*1100/10)*10;
    $('t-safe').textContent = timeTxt(p.safeWeeks)+' · about '+r1(rate)+' kg a week · '+gap+' kcal a day '+(p.dir==='lose'?'below':'above')+' what you burn';
    updateTime();
  }
  function updateTime(){
    var o = readForm(), p = paceInfo(o), res = $('tres');
    function put(cls,html){ res.className = cls; if(res._h!==html){ res._h = html; res.innerHTML = html; } }
    Array.prototype.forEach.call($('timebox').querySelectorAll('.tcard'),function(c){c.classList.toggle('on', c.querySelector('input[type=radio]').checked)});
    if(!p){ put('tres',''); return; }
    var lose = p.dir==='lose', btnSafe = ' <button type="button" class="btn sm ghost" data-act="usesafe">Use recommended time ('+timeTxt(p.safeWeeks)+')</button>';
    if(o.tmode!=='custom'){
      put('tres ok','<b>Recommended pace selected.</b> A steady pace that is realistic to keep up. You can still pick your own time instead.');
      return;
    }
    var n = o.weeks;
    if(!(n>0)){ put('tres','Enter your time above, in days, weeks or months.'); return; }
    var rate = p.ad/n, gap = Math.round(rate*1100/10)*10, risk = riskOf(p,n);
    if(risk==='blocked'){
      put('tres bad','<b>I can\u2019t plan this one.</b> '+esc(blockedMsg(o,p))+'<div class="tbtns"><button type="button" class="btn sm" data-act="usefast">Use fastest I can plan ('+timeTxt(p.hardWeeks)+')</button>'+btnSafe+'</div>');
    } else if(risk==='risky'){
      put('tres warn','<b>Risky, but I can plan it.</b> That is about '+r1(rate)+' kg a week and needs roughly '+gap+' kcal a day '+(lose?'less':'more')+' than you burn. The comfortable limit is about '+r1(p.fastR)+' kg a week ('+timeTxt(p.fastWeeks)+' or longer) and the recommended pace is '+timeTxt(p.safeWeeks)+'. Expect it to feel hard'+(lose?': hunger, low energy, and some muscle loss.':': most of it will not be muscle.')+(lose && p.roomR && rate>p.roomR+1e-6 ? ' Also, we never plan below '+fmt(p.floor)+' kcal a day, so for you the plan would really take about '+timeTxt(Math.ceil(p.ad/p.roomR))+'.' : '')+' You can continue, or switch.'+btnSafe);
    } else if(risk==='brisk'){
      put('tres ok','<b>A bit quicker than recommended.</b> About '+r1(rate)+' kg a week, '+gap+' kcal a day '+(lose?'below':'above')+' what you burn. Still within the comfortable range.'+btnSafe);
    } else {
      put('tres ok','<b>Within the recommended range.</b> About '+r1(rate)+' kg a week, '+gap+' kcal a day '+(lose?'below':'above')+' what you burn.');
    }
  }
  $('timebox').addEventListener('input',function(ev){
    if(ev.target.id==='tnum' || ev.target.id==='tunit') setMode('custom');
    updateTime();
  });
  $('timebox').addEventListener('change',updateTime);
  $('timebox').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-act]'); if(!b) return;
    var act = b.getAttribute('data-act');
    if(act==='usesafe'){ setMode('safe'); updateTime(); }
    if(act==='usefast'){ var p = paceInfo(readForm()); setMode('custom'); $('tnum').value = p.hardWeeks; $('tunit').value = 'w'; updateTime(); }
  });

  function goStep(i){
    cur = i;
    steps.forEach(function(el,k){el.hidden = (k!==i)});
    $('qcount').textContent = 'Question '+(i+1)+' of '+N;
    $('fsub').textContent = STEPNAMES[i];
    Array.prototype.forEach.call($('seg').children,function(b,k){b.className = k<=i ? 'on' : ''});
    var gv = val('gender'), gg = gv==='female' ? 'f' : 'm';
    $('avatar').innerHTML = frame(PL[AV[i][0]][AV[i][1]],gg);
    $('b-next').textContent = (i===N-1) ? 'Review' : 'Next';
    $('err').textContent = '';
    if(i===STEP_AMT) prepAmount();
    if(i===STEP_TIME) prepTime();
    var first = steps[i].querySelector('input');
    if(first){var chk = steps[i].querySelector('input:checked'); (chk||first).focus({preventScroll:true})}
  }
  f.addEventListener('submit',function(ev){
    ev.preventDefault();
    var o = readForm(), m = VALID[cur](o);
    if(m){ $('err').textContent = m; return; }
    if(cur < N-1){ goStep(cur+1); return; }
    D = o; editing = null; rvErr = {};
    setReviewMode(false);
    renderReview(); show('s-review');
  });
  $('b-back').addEventListener('click',function(){ if(cur===0) show('s-intro'); else goStep(cur-1) });
  $('b-start1').addEventListener('click',function(){ if(S) go('home'); else if(licensed()) show('s-intro'); else show('s-pay'); });
  $('b-start2').addEventListener('click',function(){show('s-form'); goStep(0)});
  $('b-start3').addEventListener('click',function(){ $('b-start1').click(); });
  $('b-plans').addEventListener('click',function(){ show('s-pay'); });
  Array.prototype.forEach.call(document.querySelectorAll('.lp-pick'),function(b){ b.addEventListener('click',function(){ show('s-pay'); setPlan(b.getAttribute('data-pick')); }); });

  /* ---------- Review and edit ---------- */
  var D = null, editing = null, rvErr = {};
  var LABEL = {name:'Name',weight:'Weight',height:'Height',age:'Age',gender:'Gender',diet:'Diet',goal:'Goal',loc:'Where you train',level:'Fitness level',days:'Training days',time:'Time to reach it',budget:'Food budget'};
  var NAMES = {gender:{male:'Male',female:'Female',other:'Other'},diet:{vegan:'Vegan',veg:'Vegetarian',nonveg:'Non-vegetarian'},goal:{lose:'Lose weight',gain:'Gain weight',maintain:'Stay stable'},budget:BUDGET_NAME,loc:LOCN,level:LVN,days:{'3':'3 days a week','4':'4 days a week','5':'5 days a week','6':'6 days a week'}};
  function amtLabel(o){return {lose:'Weight to lose',gain:'Weight to gain',maintain:'Stable weight'}[o.goal] || 'Target'}
  function showVal(o,k){
    if(k==='weight') return o.weight+' kg';
    if(k==='height') return ftIn(o.height)+' ('+Math.round(o.height)+' cm)';
    if(k==='age') return o.age+' years';
    if(k==='amt'){
      if(!(o.amt>0)) return 'Not set yet';
      return o.goal==='maintain' ? o.amt+' kg' : o.amt+' kg (target '+r1(targetOf(o))+' kg)';
    }
    if(k==='time'){
      var p = paceInfo(o);
      if(!p) return 'Not needed';
      var w = weeksOf(o,p);
      return (o.tmode==='custom' ? 'Your time: ' : 'Recommended pace: ')+timeTxt(w)+' (about '+r1(p.ad/w)+' kg a week)';
    }
    if(k==='days') return o.days>0 ? o.days+' days a week' : 'Not set';
    if(NAMES[k]) return NAMES[k][o[k]] || 'Not set';
    return o[k];
  }
  function editorHtml(k){
    if(k==='name') return '<input type="text" id="ed-name" maxlength="40" value="'+esc(D.name)+'">';
    if(k==='height'){
      var t = Math.round(D.height/2.54*10)/10, ft = Math.floor(t/12);
      return '<div class="hrow"><div class="inwrap"><input type="number" id="ed-hft" step="1" inputmode="numeric" aria-label="Feet" value="'+(D.height>0?ft:'')+'"><span class="unit">ft</span></div><div class="inwrap"><input type="number" id="ed-hin" step="0.5" inputmode="decimal" aria-label="Inches" value="'+(D.height>0?r1(t-ft*12):'')+'"><span class="unit">in</span></div></div>';
    }
    if(k==='time'){
      var p = paceInfo(D);
      if(!p) return '<p class="hint">No time is needed for this goal.</p>';
      return '<div class="opts"><label class="opt"><input type="radio" name="ed-tmode" value="safe"'+(D.tmode!=='custom'?' checked':'')+'><span>Recommended pace<em>'+timeTxt(p.safeWeeks)+'</em></span></label>'+
        '<label class="opt"><input type="radio" name="ed-tmode" value="custom"'+(D.tmode==='custom'?' checked':'')+'><span>My own time<em>Enter it below</em></span></label></div>'+
        '<div class="inwrap" style="margin-top:10px"><input type="number" id="ed-tnum" min="1" step="1" inputmode="numeric" aria-label="Time" value="'+(D.tmode==='custom'&&D.weeks>0?D.weeks:'')+'"><select id="ed-tunit" aria-label="Unit"><option value="d">days</option><option value="w">weeks</option><option value="m">months</option></select></div>'+
        '<p class="hint" style="margin-top:8px">Comfortable limit: '+timeTxt(p.fastWeeks)+'. Anything shorter than '+timeTxt(p.hardWeeks)+' (over 1 kg a week) cannot be planned.</p>';
    }
    if(NAMES[k]){
      return '<div class="opts">'+Object.keys(NAMES[k]).map(function(v){
        return '<label class="opt"><input type="radio" name="ed-'+k+'" value="'+v+'"'+(String(D[k])===v?' checked':'')+'><span>'+NAMES[k][v]+'</span></label>';
      }).join('')+'</div>';
    }
    var unit = k==='age' ? 'years' : 'kg';
    var step = k==='age' ? '1' : '0.1';
    return '<div class="inwrap"><input type="number" id="ed-'+k+'" step="'+step+'" inputmode="decimal" value="'+(D[k]>0?D[k]:'')+'"><span class="unit">'+unit+'</span></div>';
  }
  function rowHtml(k){
    var lab = k==='amt' ? amtLabel(D) : LABEL[k];
    var er = rvErr[k] ? '<div class="rverr" role="alert">'+esc(rvErr[k])+'</div>' : '';
    if(editing===k){
      return '<div class="rv editing" data-k="'+k+'"><div class="rk">'+lab+'</div><div class="rvv">'+editorHtml(k)+er+'<div class="rvb"><button type="button" class="btn sm" data-act="save" data-k="'+k+'">Save</button><button type="button" class="btn sm ghost" data-act="cancel" data-k="'+k+'">Cancel</button></div></div></div>';
    }
    return '<div class="rv" data-k="'+k+'"><div class="rk">'+lab+'</div><div class="rvv">'+esc(showVal(D,k))+er+'</div><button type="button" class="rvedit" data-act="edit" data-k="'+k+'" aria-label="Edit '+esc(lab)+'">Edit</button></div>';
  }
  function renderReview(){
    $('rvlist').innerHTML = KEYS.map(rowHtml).join('');
    if(editing){var ed = $('rvlist').querySelector('input'); if(ed) ed.focus({preventScroll:true})}
  }
  function setReviewMode(saved){
    $('rvtitle').textContent = saved ? 'Edit your plan' : 'Check your details';
    $('rvlead').textContent = saved ? 'Change anything below. Your diet, nutrients and workouts are rebuilt to match when you save.' : 'Edit anything that is not right, then submit. Your details are saved on this device and you stay logged in until you log out.';
    $('rv-back').textContent = saved ? 'Cancel' : 'Back';
    $('rv-submit').textContent = saved ? 'Save changes' : 'Submit';
  }
  function readEditor(k){
    if(k==='name') return $('ed-name').value.trim();
    if(k==='height'){
      var ft = parseFloat($('ed-hft').value), inch = parseFloat($('ed-hin').value);
      if(!(ft>=0)) return NaN;
      if(!(inch>=0)) inch = 0;
      return Math.round((ft*12+inch)*2.54*10)/10;
    }
    if(k==='time'){
      if(!$('ed-tnum')) return {tmode:'safe',weeks:0};
      var c = document.querySelector('input[name=ed-tmode]:checked'), mode = c ? c.value : 'safe';
      var n = parseFloat($('ed-tnum').value);
      return {tmode:mode, weeks:(mode==='custom' ? (n>0 ? toWeeks(n,$('ed-tunit').value) : NaN) : 0)};
    }
    if(NAMES[k]){var c2 = document.querySelector('input[name=ed-'+k+']:checked'); return c2 ? (k==='days' ? parseInt(c2.value,10) : c2.value) : undefined}
    var v = parseFloat($('ed-'+k).value);
    return k==='age' ? Math.round(v) : v;
  }
  $('rvlist').addEventListener('input',function(ev){
    if(ev.target.id==='ed-tnum' || ev.target.id==='ed-tunit'){
      var r = document.querySelector('input[name=ed-tmode][value=custom]'); if(r) r.checked = true;
    }
  });
  $('rvlist').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-act]'); if(!b) return;
    var k = b.getAttribute('data-k'), act = b.getAttribute('data-act');
    $('rverr').textContent = '';
    if(act==='edit'){ editing = k; rvErr = {}; renderReview(); return; }
    if(act==='cancel'){ editing = null; rvErr = {}; renderReview(); return; }
    var t = clone(D);
    if(k==='time'){ var tv = readEditor('time'); t.tmode = tv.tmode; t.weeks = tv.weeks; }
    else t[k] = readEditor(k);
    var m = FV[k](t);
    if(m){ rvErr = {}; rvErr[k] = m; renderReview(); return; }
    var goalChanged = (k==='goal' && t.goal !== D.goal);
    if(goalChanged){ t.amt = t.goal==='maintain' ? t.weight : NaN; }
    if(k!=='time' && k!=='name' && k!=='diet' && k!=='budget') refreshTime(t);
    D = t; editing = null; rvErr = {};
    if(goalChanged && t.goal!=='maintain'){ editing = 'amt'; }
    else if(k==='weight' || k==='height'){ var m2 = vAmt(D); if(m2) rvErr.amt = m2; }
    var m3 = (k==='time') ? '' : vTime(D);
    if(m3) rvErr.time = m3;
    renderReview();
  });
  $('rv-back').addEventListener('click',function(){ if(S) openPlan(); else { fillForm(D); show('s-form'); goStep(N-1) } });
  $('rv-submit').addEventListener('click',function(){
    if(editing){ $('rverr').textContent = 'Save or cancel the detail you are editing first.'; return; }
    for(var i=0;i<KEYS.length;i++){
      var m = FV[KEYS[i]](D);
      if(m){ rvErr = {}; rvErr[KEYS[i]] = m; editing = KEYS[i]; renderReview(); $('rverr').textContent = 'Please fix this detail first.'; return; }
    }
    var prev = S, nw = normalize(clone(D)), changed = !prev;
    if(prev){ ['weight','height','age','gender','goal','amt','tmode','weeks','loc','level','days'].forEach(function(k){ if(prev[k]!==nw[k]) changed = true; }); }
    if(prev){ nw.log = prev.log; nw.wlog = prev.wlog; nw.stepGoal = prev.stepGoal; nw.dsel = prev.dsel; nw.prefs = prev.prefs; nw.startDate = prev.startDate; nw.startWeight = prev.startWeight; nw.kcalAdj = prev.kcalAdj; nw.adjFrom = prev.adjFrom; }
    S = nw; S.savedAt = new Date().toISOString();
    if(prev && (prev.diet!==S.diet || prev.goal!==S.goal || prev.budget!==S.budget)){ S.dsel = {}; }
    if(changed){ S.startDate = todayKey(); S.startWeight = S.weight; S.kcalAdj = 0; S.adjFrom = S.startDate; S.wlog = S.wlog || {}; S.wlog[S.startDate] = S.weight; }
    var ok = lsSet(S);
    userKg = S.weight;
    openHome();
    syncAuth();
    renderWelcome();
    toast(ok ? (prev ? 'Plan updated.' : 'Saved on this device. You are logged in.') : 'Your plan is ready, but this browser would not let us save it.');
  });


