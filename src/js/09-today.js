  /* ---------- Today tab: day, meals, workouts, top-ups, extras, progress ---------- */
  var KMU = {FB:['Chest','Back','Shoulders','Quads','Glutes','Hamstrings','Abs & core'],UP:['Chest','Back','Shoulders','Biceps','Triceps'],LO:['Quads','Glutes','Hamstrings','Calves','Abs & core'],LEGS:['Quads','Glutes','Hamstrings','Calves','Abs & core'],PUSH:['Chest','Shoulders','Triceps'],PULL:['Back','Biceps','Forearms'],CA:['Cardio'],MO:['Mobility'],REST:['Mobility','Cardio']};
  function ensureCustom(){
    if(!S.custom || typeof S.custom!=='object') S.custom = {};
    if(!S.custom.ex || typeof S.custom.ex!=='object') S.custom.ex = {};
    if(!S.custom.fd || typeof S.custom.fd!=='object') S.custom.fd = {};
    return S.custom;
  }
  function peek(k){ return (S.log && S.log[k]) || {}; }
  function dateOf(dow){ var add = (dow-todayDow()+7)%7, d = new Date(); d.setDate(d.getDate()+add); return d; }
  function dateFor(dow){ return dkey(dateOf(dow)); }
  function exAdds(dow){
    var c = ensureCustom(), o = peek(dateFor(dow)), out = [];
    (c.ex[dow]||[]).forEach(function(it,i){ if(EXS[it.id]) out.push({it:it,src:'perm',i:i}); });
    (o.xex||[]).forEach(function(it,i){ if(EXS[it.id]) out.push({it:it,src:'once',i:i}); });
    return out;
  }
  function fdAdds(dow){
    var c = ensureCustom(), o = peek(dateFor(dow)), out = [];
    (c.fd[dow]||[]).forEach(function(it,i){ if(DISHMAP[it.id]) out.push({it:it,src:'perm',i:i}); });
    (o.xfd||[]).forEach(function(it,i){ if(DISHMAP[it.id]) out.push({it:it,src:'once',i:i}); });
    return out;
  }
  function defRx(id){
    var c = CAL[id], lv = lvIdx(S.level);
    if(c.k==='time') return {id:id,m:(c.met>=6?15:20)};
    if(c.k==='hold') return {id:id,s:NSETS[S.level],t:(HOLDS[id]||[20,30,40])[lv]};
    return {id:id,s:NSETS[S.level],r:REPS[id]||12};
  }
  function exTotals(items){
    var kg = S.weight, m = 0, k = 0;
    items.forEach(function(it){ var b = burn(it.id,it,kg); m += b.min; k += b.kcal; });
    return {min:m,kcal:k};
  }
  function clock(){
    var n = new Date(), h = n.getHours(), m = n.getMinutes();
    return (h%12||12)+':'+pad(m)+' '+(h<12?'am':'pm');
  }
  function partOfDay(){ var h = new Date().getHours(); return h<5 ? 'Night' : h<12 ? 'Morning' : h<17 ? 'Afternoon' : h<21 ? 'Evening' : 'Night'; }

  function planKeySet(dow,mp){
    var o = {ex:{},fd:{}};
    weekPlan(S).days[dow].items.forEach(function(it){ o.ex[it.id] = 'In today’s plan'; });
    exAdds(dow).forEach(function(a){ o.ex[a.it.id] = 'Added'; });
    mp.slots.forEach(function(s){ o.fd[s.x.id] = 'In today’s plan'; });
    fdAdds(dow).forEach(function(a){ o.fd[a.it.id] = 'Added'; });
    return o;
  }
  function mealCards(d,r,mp,dow){
    var h = '';
    mp.slots.forEach(function(s){
      var id = s.sl[1], tk = Math.round(r.target*s.sl[2]/10)*10;
      h += '<div class="mcard"><div class="mh"><div><b>'+s.sl[0]+'</b><small>Target ~'+fmt(tk)+' kcal'+(s.forced?' · your choice':'')+'</small></div><div class="mt"><b>'+fmt(Math.round(s.k))+'</b><small>kcal · '+Math.round(s.p)+' g protein</small></div></div>';
      h += '<details class="fd" data-slot="'+id+'" data-id="'+s.x.id+'" data-m="'+s.m+'"><summary><span class="mpic">'+dishPic(s.x)+'</span><span class="mtx"><b>'+esc(s.x.n)+'</b><small>'+mTxt(s.m)+'× '+esc(s.x.s)+' · '+Math.round(s.k)+' kcal · '+r1(s.p)+' g protein</small></span><span class="fchev" aria-hidden="true"></span></summary><div class="fdbody"></div></details></div>';
    });
    return h;
  }
  function addedFoodCards(dow){
    var wd = DAYN[dow], isT = dow===todayDow();
    return fdAdds(dow).map(function(a){
      var x = DISHMAP[a.it.id], m = a.it.m||1;
      return '<div class="mcard added"><div class="mh"><div><b>Added by you</b><small>'+(a.src==='perm' ? 'Every '+wd+' from now on' : (isT ? 'Today only' : 'Only this coming '+wd))+'</small></div><div class="mt"><b>'+Math.round(x.k*m)+'</b><small>kcal · '+Math.round(x.p*m)+' g protein</small></div></div>'+
        '<details class="fd" data-slot="" data-id="'+x.id+'" data-m="'+m+'"><summary><span class="mpic">'+dishPic(x)+'</span><span class="mtx"><b>'+esc(x.n)+'</b><small>'+mTxt(m)+'× '+esc(x.s)+' · '+Math.round(x.k*m)+' kcal · '+r1(x.p*m)+' g protein</small></span><span class="fchev" aria-hidden="true"></span></summary><div class="fdbody"></div></details>'+
        '<div class="qrow"><span>Amount</span><button type="button" class="qb" data-act="fdq" data-src="'+a.src+'" data-i="'+a.i+'" data-d="-0.5" aria-label="Less">−</button><b>'+mTxt(m)+'×</b><button type="button" class="qb" data-act="fdq" data-src="'+a.src+'" data-i="'+a.i+'" data-d="0.5" aria-label="More">+</button><button type="button" class="linkbtn rm" data-act="fdrm" data-src="'+a.src+'" data-i="'+a.i+'">Remove</button></div></div>';
    }).join('');
  }
  function topCards(mp){
    if(!mp.tops.length) return '<p class="hint">Your meals already cover your protein target today, so no top-up is needed.</p>';
    return mp.tops.map(function(q){
      var t = q.t;
      return '<div class="mcard"><div class="mh"><div><b>Protein top-up</b><small>to reach your protein target</small></div><div class="mt"><b>'+Math.round(q.u*t.k)+'</b><small>kcal · '+Math.round(q.u*t.p)+' g protein</small></div></div><p class="topup"><b>'+q.u+' × '+esc(t.n)+'</b> ('+esc(t.s)+' each). '+esc(t.note)+' Have it with any meal or as a snack.</p></div>';
    }).join('');
  }
  var tdOpen = {m:false,w:false};
  function renderToday(d,r){
    if(viewDow===null) viewDow = todayDow();
    var td = todayDow(), dow = viewDow, isToday = (dow===td);
    pruneLog(); ensureCustom();
    var wp = weekPlan(d), day = wp.days[dow], mp = mealPlan(d,r,dow);
    var dt = dateOf(dow), dateTxt = dt.toLocaleDateString('en-IN',{day:'numeric',month:'long'});
    var h = '<div class="tdhero"><div class="tdl"><small>'+(isToday ? partOfDay()+' · Today' : 'Coming '+DAYN[dow])+'</small><h3>'+DAYN[dow]+'</h3><p>'+dateTxt+(isToday ? ' · <b id="td-clock">'+clock()+'</b>' : '')+'</p></div><div class="tdr"><span>'+esc(day.t)+'</span><span>Eat about '+fmt(r.target)+' kcal</span></div></div>';
    h += '<div class="dchips" role="group" aria-label="Choose a day">'+DAYN.map(function(n,i){
      return '<button type="button" class="dchip'+(i===dow?' on':'')+(i===td?' now':'')+'" data-act="day" data-dow="'+i+'" aria-pressed="'+(i===dow)+'"><b>'+n.slice(0,3)+'</b>'+(i===td?'<i>today</i>':'')+'</button>';
    }).join('')+'</div>';
    if(isToday) h += trackHtml(r,mp,day);

    /* 1. meals */
    var fa = fdAdds(dow), addK = 0, addP = 0;
    fa.forEach(function(a){ var x = DISHMAP[a.it.id]; addK += x.k*(a.it.m||1); addP += x.p*(a.it.m||1); });
    var totK = mp.K+addK, totP = mp.P+addP, pct = Math.round(totK/r.target*100), pp = Math.round(totP/r.protein*100);
    var dWho = isToday ? 'today’s' : DAYN[dow]+'’s', nMeal = mp.slots.length+fa.length;
    var mPics = mp.slots.slice(0,3).map(function(s){return '<span>'+dishPic(s.x)+'</span>'}).join('');
    h += '<div class="tdd'+(tdOpen.m?' open':'')+'"><button type="button" class="tddbtn" data-act="tdd" data-v="m" aria-expanded="'+tdOpen.m+'"><span class="tddpics">'+mPics+'</span><span class="tddtx"><b>Check '+dWho+' diet</b><small>'+nMeal+' meals · '+fmt(Math.round(totK))+' kcal · '+Math.round(totP)+' g protein</small></span><span class="tddchev" aria-hidden="true"></span></button>';
    if(tdOpen.m){
    h += '<div class="tddbody" id="td-meals">';
    h += '<div class="dsum"><div><small>This day adds up to</small><b>'+fmt(Math.round(totK))+' kcal</b><span>'+pct+'% of your '+fmt(r.target)+' kcal'+(addK?' · includes +'+Math.round(addK)+' you added':'')+'</span></div><div><small>Protein</small><b>'+Math.round(totP)+' g</b><span>'+pp+'% of '+r.protein+' g target</span></div></div>';
    h += mealCards(d,r,mp,dow)+addedFoodCards(dow);
    h += '<button type="button" class="btn ghost addbtn" data-act="addfd">+ Add food to '+(isToday?'today':DAYN[dow])+'</button>';
    if(mp.tops.length) h += '<p class="tddsub">Protein top-up</p>'+topCards(mp);
    h += '<p class="hint">Open any dish for full nutrition, ingredients, the recipe and 15+ other dishes to swap in.</p></div>';
    }
    h += '</div>';

    /* 2. workouts */
    var rest = day.kind==='REST', ea = exAdds(dow), items = day.items.map(function(it){return {it:it,add:null}}).concat(ea.map(function(a){return {it:a.it,add:a}}));
    var tt = exTotals(items.map(function(x){return x.it}));
    var wPics = items.slice(0,3).map(function(x){return '<span class="ep">'+exPics(x.it.id)[0]+'</span>'}).join('');
    var woDone = isToday && !!logOf(todayKey()).wo;
    h += '<div class="tdd tddwk'+(tdOpen.w?' open':'')+'"><button type="button" class="tddbtn" data-act="tdd" data-v="w" aria-expanded="'+tdOpen.w+'"><span class="tddpics">'+wPics+'</span><span class="tddtx"><b>Check '+(isToday?'today’s':DAYN[dow]+'’s')+' workouts</b><small>'+(rest&&!items.length?'Rest day':esc(day.t)+' · '+items.length+' exercises · '+Math.round(tt.min)+' min')+(woDone?' · ✓ done':'')+'</small></span><span class="tddchev" aria-hidden="true"></span></button>';
    if(tdOpen.w){
    h += '<div class="tddbody" id="td-work">';
    if(rest) h += '<p class="hint">Lighter day. Do the gentle movement below, drink water and sleep well. Recovery is when muscles grow.</p>';
    else h += '<p class="hint">'+items.length+' exercises. Open any one for the pictures, calories burned and alternatives.</p>';
    h += items.map(function(x){
      if(!x.add) return exItem(x.it.id,x.it,false);
      return '<div class="lrow addedrow">'+exItem(x.it.id,x.it,false).replace('<span class="kc">','<span class="inplan g">Added · '+(x.add.src==='perm'?'every '+DAYN[dow]:'once')+'</span><span class="kc">')+'<button type="button" class="xrm" data-act="exrm" data-src="'+x.add.src+'" data-i="'+x.add.i+'" aria-label="Remove '+esc(EXS[x.it.id].n)+'">×</button></div>';
    }).join('');
    h += '<div class="hb two"><button type="button" class="btn" data-act="addex">+ Add exercise</button><button type="button" class="btn ghost" data-act="lib">All '+EXCOUNT+' exercises</button></div>';
    if(isToday){
      var done = !!logOf(todayKey()).wo;
      h += '<button type="button" class="btn '+(done?'':'ghost')+' wobtn" data-act="wo" aria-pressed="'+done+'">'+(done ? '✓ Workout done today' : 'Mark workout as done')+'</button>';
    }
    h += '</div>';
    }
    h += '</div>';

    /* 4. more */
    if(isToday){
      h += '<div class="golinks"><button type="button" data-go2="prog"><b>Weight progress</b><small>Log your weight and see your chart</small><span aria-hidden="true">›</span></button></div>';
    } else {
      h += '<div class="sect"><p class="hint">“Add what you ate” and “Check today’s progress” are on today’s page. Tap <b>'+DAYN[td].slice(0,3)+'</b> above to go back to today.</p></div>';
    }
    $('p-today').innerHTML = h;
    xPreview();
  }
  function tickClock(){
    var el = $('td-clock'); if(!el || $('p-today').hidden || curScreen!=='s-result') return;
    var c = clock(); if(el.textContent!==c) el.textContent = c;
  }
  setInterval(tickClock,15000);

  function fillDish(det){
    var x = DISHMAP[det.getAttribute('data-id')], m = parseFloat(det.getAttribute('data-m')), slot = det.getAttribute('data-slot');
    var h = dishBody(x,m,true);
    if(slot){
      var sl = SLOTSETS[S.prefs.meals].filter(function(q){return q[1]===slot})[0];
      var n = sl ? dishOptions(S,curR,sl).length : 0;
      h += '<button type="button" class="btn sm ghost optbtn" data-act="opts" data-slot="'+slot+'" aria-expanded="false">Change dish ('+n+' options)</button><div class="optbox" hidden></div>';
    }
    det.querySelector('.fdbody').innerHTML = h;
  }
  function optsHtml(slot){
    var sl = SLOTSETS[S.prefs.meals].filter(function(q){return q[1]===slot})[0], tk = slotTarget(curR,sl);
    var cur = (S.dsel[viewDow]||{})[slot];
    var list = dishOptions(S,curR,sl), h = '<p class="hint">'+list.length+' '+CATN[sl[3]].toLowerCase().replace('snacks','snack')+' dishes for your diet. Tap Use to put one in this meal. Portions are re-sized automatically.</p><div class="alts2">';
    h += list.map(function(o){
      var x = o.x, m = clampM(tk/x.k);
      return '<div class="arow"><span class="mpic">'+dishPic(x)+'</span><span class="mtx"><b>'+esc(x.n)+'</b><small>'+esc(x.s)+' · '+x.k+' kcal · '+x.p+' g protein'+(x.q?' · '+x.q+' min · '+priceTxt(x).split(' ')[0]:'')+'<br>Fits as about '+mTxt(m)+'× = '+Math.round(x.k*m)+' kcal'+(o.ok?'':' · outside your filters')+'</small></span><button type="button" class="btn sm ghost" data-act="use" data-slot="'+slot+'" data-id="'+x.id+'" aria-label="Use '+esc(x.n)+'">Use</button></div>';
    }).join('')+'</div>';
    if(cur) h += '<button type="button" class="linkbtn" data-act="auto" data-slot="'+slot+'">Go back to the automatic choice</button>';
    return h;
  }
  function afterDishChange(){
    lsSet(S); renderToday(S,curR); renderNutrients(S,curR); renderDiet(S,curR); renderHome();
  }
  function afterAdd(){
    lsSet(S); renderToday(S,curR); renderExercisePlan(extraTips); renderDiet(S,curR); renderHome();
  }

  /* ---------- Add sheet (exercises and food) ---------- */
  var SH = null; /* {mode:'ex'|'fd', dow, q, cat, scope:'cat'|'all', fit:true, n} */
  function openSheet(mode){
    var dow = viewDow, day = weekPlan(S).days[dow];
    SH = {mode:mode,dow:dow,q:'',n:30,scope:'cat',fit:true,cat:'b',kind:day.kind,label:day.t};
    if(mode==='fd'){ var hr = new Date().getHours(); SH.cat = hr<10 ? 'b' : hr<15 ? 'l' : hr<18 ? 's' : 'd'; }
    if(mode==='ex') SH.n = 90;
    $('sheet').hidden = false; document.body.classList.add('noscroll');
    paintSheet(true);
    $('sheetb').scrollTop = 0;
  }
  function closeSheet(){ if(SH && SH.restore!==undefined){ viewDow = SH.restore; if(S && curR){ renderToday(S,curR); renderNutrients(S,curR); } } SH = null; $('sheet').hidden = true; document.body.classList.remove('noscroll'); }
  function paintSheet(full){
    if(!SH) return;
    var mp = mealPlan(S,curR,SH.dow), ps = planKeySet(SH.dow,mp), h = '';
    if(full){
      if(SH.mode==='ex'){
        $('sheett').textContent = 'Add an exercise to '+(SH.dow===todayDow()?'today':DAYN[SH.dow]);
        var mus = KMU[SH.kind]||[];
        h += '<p class="hint">First this day’s exercises, then more for the same muscles ('+esc(mus.join(', '))+'), then the full library.</p>';
        h += '<input type="search" id="sh-q" class="sinp" placeholder="Search all '+EXCOUNT+' exercises…" autocomplete="off" value="'+esc(SH.q)+'" aria-label="Search exercises">';
        h += '<div class="cbs scrollx"><button type="button" class="cb'+(SH.fit?' on':'')+'" data-sh="fit" aria-pressed="'+SH.fit+'">Only what fits my '+esc(LOCN[S.loc].toLowerCase())+'</button></div>';
      } else {
        $('sheett').textContent = 'Add food to '+(SH.dow===todayDow()?'today':DAYN[SH.dow]);
        h += '<p class="hint">Dishes for your diet. Dishes already in this day’s plan are marked in green. Each is added as 1 serving, and you can change the amount afterwards.</p>';
        h += '<input type="search" id="sh-q" class="sinp" placeholder="Search dishes…" autocomplete="off" value="'+esc(SH.q)+'" aria-label="Search dishes">';
        h += '<div class="cbs scrollx">'+['b','l','d','s'].map(function(c){return '<button type="button" class="cb'+(SH.cat===c?' on':'')+'" data-sh="cat" data-v="'+c+'" aria-pressed="'+(SH.cat===c)+'">'+CATN[c]+'</button>'}).join('')+'<button type="button" class="cb'+(SH.cat==='*'?' on':'')+'" data-sh="cat" data-v="*" aria-pressed="'+(SH.cat==='*')+'">All</button></div>';
      }
      h += '<div id="sh-res"></div>';
      $('sheetb').innerHTML = h;
    }
    var out = '', ids, shown;
    if(SH.mode==='ex'){
      var eqv = SH.fit ? String(tierOf(S.loc)) : 'all', mus2 = KMU[SH.kind]||[];
      var inPlan = Object.keys(ps.ex).filter(function(id){ return EXS[id] && (!SH.q || (EXS[id].n+' '+EXS[id].mu).toLowerCase().indexOf(SH.q.trim().toLowerCase())>=0); });
      var seen = {}; inPlan.forEach(function(id){ seen[id] = 1; });
      var rel = mus2.length ? libIds({q:SH.q,mu:mus2,eq:eqv,lv:'all'}).filter(function(id){ if(seen[id]) return false; seen[id] = 1; return true; }) : [];
      var rest = libIds({q:SH.q,mu:'all',eq:eqv,lv:'all'}).filter(function(id){ return !seen[id]; });
      ids = inPlan.concat(rel,rest);
      var budget = SH.n, secs = [[inPlan,'In this day’s plan'],[rel,'More for '+mus2.join(', ')],[rest,'Full exercise library']];
      shown = [];
      secs.forEach(function(sc){
        if(!sc[0].length || budget<=0) return;
        var part = sc[0].slice(0,budget); budget -= part.length; shown = shown.concat(part);
        out += '<h4 class="shsec">'+esc(sc[1])+' <span>'+sc[0].length+'</span></h4>';
        part.forEach(function(id){
          var inp = ps.ex[id];
          out += libRow(id, inp ? {cls:'isin',label:'✓ '+inp} : {btn:'<button type="button" class="btn sm addb" data-act="pick" data-id="'+id+'" aria-label="Add '+esc(EXS[id].n)+'">Add</button>'});
        });
      });
    } else {
      var q = SH.q.trim().toLowerCase();
      ids = DISHES.filter(function(x){ return dietOk(x,S.diet) && (SH.cat==='*' || x.cat===SH.cat) && (!q || (x.n+' '+x.s).toLowerCase().indexOf(q)>=0); });
      ids.sort(function(a,b){ return (ps.fd[b.id]?1:0)-(ps.fd[a.id]?1:0) || (a.n<b.n?-1:1); });
      shown = ids.slice(0,SH.n);
      shown.forEach(function(x){
        var inp = ps.fd[x.id];
        out += '<div class="lrow'+(inp?' isin':'')+'"><div class="arow"><span class="mpic">'+dishPic(x)+'</span><span class="mtx"><b>'+esc(x.n)+'</b><small>'+esc(x.s)+' · '+x.k+' kcal · '+x.p+' g protein · '+CATN[x.cat]+'</small>'+(inp?'<span class="inplan">✓ '+inp+'</span>':'')+'</span>'+(inp?'':'<button type="button" class="btn sm addb" data-act="pick" data-id="'+x.id+'" aria-label="Add '+esc(x.n)+'">Add</button>')+'</div></div>';
      });
    }
    if(!ids.length) out = '<p class="hint">Nothing matches. Try “All” or a shorter search.</p>';
    if(ids.length>shown.length) out += '<button type="button" class="btn ghost more" data-sh="more">Show more ('+(ids.length-shown.length)+' left)</button>';
    $('sh-res').innerHTML = out;
  }
  $('sheet').addEventListener('input',function(ev){ if(ev.target.id==='sh-q' && SH){ SH.q = ev.target.value; SH.n = 30; paintSheet(false); } });
  $('sheet').addEventListener('click',function(ev){
    if(ev.target===$('sheet')){ closeSheet(); return; }
    var x = ev.target.closest('#sheet-x'); if(x){ closeSheet(); return; }
    var b = ev.target.closest('button[data-sh]');
    if(b && SH){
      var a = b.getAttribute('data-sh'), v = b.getAttribute('data-v');
      if(a==='more') SH.n += (SH.mode==='ex' ? 60 : 30);
      else { SH.n = (SH.mode==='ex' ? 90 : 30); if(a==='scope') SH.scope = v; else if(a==='fit') SH.fit = !SH.fit; else if(a==='cat') SH.cat = v; }
      paintSheet(a!=='more'); return;
    }
    var p = ev.target.closest('button[data-act="pick"]');
    if(p && SH) askScope(SH.mode,p.getAttribute('data-id'));
  });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && SH && $('scopem').hidden) closeSheet(); });

  /* ---------- Only today, or every week? ---------- */
  var PEND = null;
  function askScope(mode,id){
    var dow = viewDow, wd = DAYN[dow], isT = (dow===todayDow()), name = mode==='ex' ? EXS[id].n : DISHMAP[id].n;
    PEND = {mode:mode,id:id,dow:dow};
    $('scopet').textContent = 'Add '+name+'?';
    $('scopep').innerHTML = 'Do you want this '+(isT?'just for today':'only for the coming '+wd)+', or should it stay in your plan for every '+wd+' in the weeks ahead? Your profile on this device is updated to match your choice.';
    $('sc-once').innerHTML = '<b>'+(isT?'Only today':'Only this '+wd)+'</b><small>One time. Your normal '+wd+' plan stays as it is.</small>';
    $('sc-perm').innerHTML = '<b>Every '+wd+'</b><small>Added to your plan now and every '+wd+' after this.</small>';
    $('scopem').hidden = false; $('sc-once').focus();
  }
  function closeScope(){ $('scopem').hidden = true; PEND = null; }
  function commitAdd(perm){
    if(!PEND) return;
    var P = PEND, c = ensureCustom(), dow = P.dow, name;
    if(P.mode==='ex'){
      name = EXS[P.id].n;
      var dup = weekPlan(S).days[dow].items.concat(exAdds(dow).map(function(a){return a.it})).some(function(it){return it.id===P.id});
      if(dup){ toast(name+' is already in this day’s plan.'); closeScope(); return; }
      var rx = defRx(P.id);
      if(perm){ (c.ex[dow] = c.ex[dow]||[]).push(rx); }
      else { var o = logOf(dateFor(dow)); (o.xex = o.xex||[]).push(rx); }
    } else {
      name = DISHMAP[P.id].n;
      var dup2 = fdAdds(dow).some(function(a){return a.it.id===P.id});
      if(dup2){ toast(name+' is already added to this day.'); closeScope(); return; }
      var fi = {id:P.id,m:1};
      if(perm){ (c.fd[dow] = c.fd[dow]||[]).push(fi); }
      else { var o2 = logOf(dateFor(dow)); (o2.xfd = o2.xfd||[]).push(fi); }
    }
    closeScope(); closeSheet();
    afterAdd();
    toast(name+' added '+(perm ? 'to every '+DAYN[dow]+' in your plan.' : (dow===todayDow() ? 'for today.' : 'for this coming '+DAYN[dow]+'.')));
  }
  $('sc-once').addEventListener('click',function(){ commitAdd(false) });
  $('sc-perm').addEventListener('click',function(){ commitAdd(true) });
  $('sc-no').addEventListener('click',closeScope);
  $('scopem').addEventListener('click',function(ev){ if(ev.target===$('scopem')) closeScope(); });

  /* ---------- Today click handling ---------- */
  function listOf(src,kind,dow){
    var c = ensureCustom();
    return src==='perm' ? (kind==='ex' ? (c.ex[dow]=c.ex[dow]||[]) : (c.fd[dow]=c.fd[dow]||[])) : (function(){ var o = logOf(dateFor(dow)); var k = kind==='ex'?'xex':'xfd'; return (o[k] = o[k]||[]); })();
  }
  $('p-today').addEventListener('click',function(ev){
    if(!S || !curR) return;
    var b = ev.target.closest('button[data-act]'); if(!b) return;
    var act = b.getAttribute('data-act');
    if(act==='day'){ viewDow = parseInt(b.getAttribute('data-dow'),10); renderToday(S,curR); renderNutrients(S,curR); return; }
    if(act==='tdd'){ var tv = b.getAttribute('data-v'); tdOpen[tv] = !tdOpen[tv]; var y = window.scrollY; renderToday(S,curR); window.scrollTo(0,y); return; }
    if(act==='gosteps'){ setTab('steps'); return; }
    if(act==='stadd'){ addSteps(parseInt(b.getAttribute('data-n'),10)); return; }
    if(act==='wo'){ var lg = logOf(todayKey()); lg.wo = lg.wo ? 0 : 1; lsSet(S); renderToday(S,curR); renderHome(); return; }
    if(act==='lib'){ openLibrary(); return; }
    if(act==='addex'){ openSheet('ex'); return; }
    if(act==='addfd'){ openSheet('fd'); return; }
    if(act==='exrm' || act==='fdrm'){
      var kind = act==='exrm' ? 'ex' : 'fd', arr = listOf(b.getAttribute('data-src'),kind,viewDow), i = parseInt(b.getAttribute('data-i'),10);
      if(i>=0 && i<arr.length){ arr.splice(i,1); afterAdd(); toast('Removed.'); }
      return;
    }
    if(act==='fdq'){
      var arr2 = listOf(b.getAttribute('data-src'),'fd',viewDow), j = parseInt(b.getAttribute('data-i'),10);
      if(arr2[j]){ arr2[j].m = Math.max(0.5,Math.min(6,(arr2[j].m||1)+parseFloat(b.getAttribute('data-d')))); afterAdd(); }
      return;
    }
    if(trackClick(act,b)) return;
    var slot = b.getAttribute('data-slot');
    if(act==='opts'){
      var box = b.nextElementSibling, open = box.hidden;
      if(open && !box._f){ box.innerHTML = optsHtml(slot); box._f = 1; }
      box.hidden = !open; b.setAttribute('aria-expanded',open); return;
    }
    if(act==='use'){
      if(!S.dsel[viewDow]) S.dsel[viewDow] = {};
      S.dsel[viewDow][slot] = b.getAttribute('data-id');
      afterDishChange(); toast('Dish changed. Portion re-sized for your day.'); return;
    }
    if(act==='auto'){ if(S.dsel[viewDow]) delete S.dsel[viewDow][slot]; afterDishChange(); toast('Back to the automatic choice.'); }
  });

  /* ---------- Ate extra? and Check today's progress ---------- */
  /* [group, name, one unit, kcal per unit, protein g per unit] */
  var EXTRAF = [
    ['Snacks and street food','Samosa','1 piece',250,5],['Snacks and street food','Kachori','1 piece',200,4],['Snacks and street food','Vada pav','1',290,7],
    ['Snacks and street food','Pav bhaji','1 plate',450,10],['Snacks and street food','Pakora / bhajiya','5 pieces',280,6],['Snacks and street food','Bread pakora','1 piece',220,5],
    ['Snacks and street food','French fries','1 medium serving',310,4],['Snacks and street food','Potato chips','1 small pack (30 g)',160,2],['Snacks and street food','Namkeen / bhujia','1 handful (30 g)',165,5],
    ['Snacks and street food','Pizza','1 slice',280,12],['Snacks and street food','Veg burger','1',350,9],['Snacks and street food','Chicken burger','1',450,24],
    ['Snacks and street food','Momos (steamed)','5 pieces',220,8],['Snacks and street food','Instant noodles','1 pack',310,7],['Snacks and street food','Grilled sandwich','1',300,10],
    ['Snacks and street food','Chole bhature','1 plate',600,17],['Snacks and street food','Paratha with butter','1',300,6],['Snacks and street food','Biryani','1 plate',480,16],
    ['Sweets and desserts','Gulab jamun','1 piece',150,2],['Sweets and desserts','Jalebi','1 piece',130,1],['Sweets and desserts','Rasgulla','1 piece',125,3],
    ['Sweets and desserts','Laddu','1 piece',180,3],['Sweets and desserts','Barfi','1 piece',130,3],['Sweets and desserts','Halwa','1 small bowl',260,3],
    ['Sweets and desserts','Kheer','1 katori',220,6],['Sweets and desserts','Cake','1 slice',300,4],['Sweets and desserts','Pastry','1',330,4],
    ['Sweets and desserts','Chocolate','1 bar (40 g)',215,3],['Sweets and desserts','Ice cream','1 scoop',135,2],['Sweets and desserts','Cream biscuit','1 piece',70,1],['Sweets and desserts','Plain biscuit','1 piece',45,1],
    ['Drinks','Cold drink / soda','1 can (300 ml)',125,0],['Drinks','Packaged fruit juice','1 glass (200 ml)',100,0],['Drinks','Chai with sugar','1 cup',70,2],['Drinks','Coffee with milk and sugar','1 cup',70,2],
    ['Drinks','Sweet lassi','1 glass',220,6],['Drinks','Milkshake','1 glass',300,8],['Drinks','Sugarcane juice','1 glass',180,0],['Drinks','Beer','1 bottle (330 ml)',140,1],['Drinks','Coconut water','1 glass',45,0],
    ['Everyday foods','Roti / chapati','1',100,3],['Everyday foods','Cooked rice','1 katori',195,4],['Everyday foods','Dal','1 katori',130,7],['Everyday foods','Paneer sabzi','1 katori',250,12],
    ['Everyday foods','Chicken curry','1 katori',240,22],['Everyday foods','Curd','1 katori',100,5],['Everyday foods','Milk (full fat)','1 glass',150,8],['Everyday foods','Boiled egg','1',78,6],
    ['Everyday foods','Omelette (2 eggs)','1',190,13],['Everyday foods','Banana','1',105,1],['Everyday foods','Apple','1',95,0],['Everyday foods','Mango','1 cup of slices',100,1],
    ['Everyday foods','Nuts and dry fruits','1 handful (30 g)',180,5],['Everyday foods','Peanuts','1 handful (30 g)',170,8],
    ['Not sure what it was','A small bite or snack','1',100,2],['Not sure what it was','A medium portion','1',250,6],['Not sure what it was','A full plate','1',500,14],['Not sure what it was','A big restaurant meal','1',800,22]
  ];
  var QTYS = ['0.25','0.5','0.75','1','1.5','2','3','4','5'];
  function tkLog(){ return logOf(todayKey()); }
  function xtOf(){ var l = tkLog(); if(!Array.isArray(l.xt)) l.xt = []; return l.xt; }
  function extraOptions(){
    var h = '', g = '';
    EXTRAF.forEach(function(x,i){
      if(x[0]!==g){ if(g) h += '</optgroup>'; h += '<optgroup label="'+esc(x[0])+'">'; g = x[0]; }
      h += '<option value="x:'+i+'">'+esc(x[1])+' ('+esc(x[2])+', '+x[3]+' kcal)</option>';
    });
    return h+'</optgroup>';
  }
  function dishOptionsAll(planIds){
    var h = '', cats = ['b','l','d','s'];
    cats.forEach(function(c){
      var list = DISHES.filter(function(x){return x.cat===c && dietOk(x,S.diet)}).sort(function(a,b){return a.n<b.n?-1:1});
      h += '<optgroup label="Dishes: '+CATN[c]+'">'+list.map(function(x){return '<option value="'+x.id+'">'+esc(x.n)+' ('+esc(x.s)+', '+x.k+' kcal)</option>'}).join('')+'</optgroup>';
    });
    return h;
  }
  var XOPTS = null;
  var tkOpen = '';
  var ICO_PLATE = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="13" r="7"/><circle cx="12" cy="13" r="3.5"/><path d="M3 4v5M5 4v5M4 9v11M20 4c-1.5 1-2 3-2 5h2v11"/></svg>';
  var ICO_CHECK = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19V5"/><path d="M4 19h16"/><path d="M7 14l3-3 3 3 5-6"/></svg>';
  function trackHtml(r,mp,day){
    var E = 0; xtOf().forEach(function(x){ E += x.k; });
    var h = '<div class="tk"><div class="tktiles">';
    h += '<button type="button" class="tktile'+(tkOpen==='x'?' on':'')+'" data-act="tkopen" data-v="x" aria-expanded="'+(tkOpen==='x')+'"><span class="tki">'+ICO_PLATE+'</span><b>Add what you ate</b><small>'+(E ? '+'+fmt(Math.round(E))+' kcal added today' : 'Extra snack, sweet or meal')+'</small></button>';
    h += '<button type="button" class="tktile'+(tkOpen==='p'?' on':'')+'" data-act="tkopen" data-v="p" aria-expanded="'+(tkOpen==='p')+'"><span class="tki">'+ICO_CHECK+'</span><b>Check today’s progress</b><small>Are you on track today?</small></button>';
    h += '</div>';
    if(tkOpen==='x') h += '<div class="tkpanel" id="td-extra">'+extraHtml(r)+'</div>';
    if(tkOpen==='p') h += '<div class="tkpanel" id="td-prog">'+progHtml(r,mp,day)+'</div>';
    return h+'</div>';
  }
  var QUICKX = ['Samosa','Chai with sugar','Pizza','Biryani','Gulab jamun','French fries','Cold drink / soda','Momos (steamed)','Veg burger','Ice cream','Chocolate','Vada pav'];
  function extraHtml(r){
    var xt = xtOf(), E = 0, P = 0;
    xt.forEach(function(x){ E += x.k; P += x.p||0; });
    if(!XOPTS) XOPTS = extraOptions()+dishOptionsAll();
    var h = '<div class="tkhead"><div><small>Ate something extra?</small><h3>Add what you ate</h3></div><span class="tkpill" id="xt-tot">'+(E?'+'+fmt(Math.round(E))+' kcal':'0 kcal')+'</span></div>';
    var chips = QUICKX.map(function(n){
      for(var i=0;i<EXTRAF.length;i++) if(EXTRAF[i][1]===n) return '<button type="button" class="qchip'+(i===0?' on':'')+'" data-act="xpick" data-v="x:'+i+'"><b>'+esc(n.replace(' / soda','').replace(' (steamed)','').replace(' with sugar',''))+'</b><small>'+EXTRAF[i][3]+' kcal</small></button>';
      return '';
    }).join('');
    h += '<div class="tkstep"><span class="tklbl">1 · Tap what you ate</span><div class="qchips">'+chips+'</div>';
    h += '<label class="tksub" for="xf-item">Not in the list? Choose any food</label><select id="xf-item" class="sel">'+XOPTS+'</select></div>';
    h += '<div class="tkstep"><span class="tklbl">2 · How much? <span id="xf-unit"></span></span><div class="qwrap tkq"><button type="button" class="qb" data-act="xq" data-d="-0.5" aria-label="Less">−</button><input id="xf-q" type="number" min="0.25" max="20" step="0.25" value="1" inputmode="decimal" aria-label="Quantity"><button type="button" class="qb" data-act="xq" data-d="0.5" aria-label="More">+</button></div></div>';
    h += '<div class="tkprev" id="xf-prev" aria-live="polite"></div>';
    h += '<button type="button" class="tkgo" data-act="xadd">Add to today</button>';
    if(xt.length){
      h += '<div class="tklist"><span class="tklbl">Added today</span>'+xt.map(function(x,i){return '<div class="xrow"><span><b>'+esc(x.n)+'</b><small>'+mTxt(x.q)+' × '+esc(x.u)+'</small></span><span class="xk">+'+Math.round(x.k)+' kcal</span><button type="button" class="xrm" data-act="xrm" data-i="'+i+'" aria-label="Remove '+esc(x.n)+'">×</button></div>'}).join('')+'</div>';
      h += burnHtml(E,P,r);
    }
    return h;
  }
  function netPerMin(met){ return (met-1)*S.weight/60; }
  function burnHtml(E,P,r){
    var kg = S.weight, perStep = stepStats(1000).kcal/1000;
    var steps = Math.round(E/perStep/50)*50, ss = stepStats(steps);
    var opts = [['Brisk walk','walk','min'],['Jogging','run','min'],['Skipping rope','skip','min'],['Jumping jacks','jacks','min'],['Cycling','cycle','min']].map(function(o){
      var mins = E/netPerMin(CAL[o[1]].met);
      return '<div><b>'+Math.max(1,Math.round(mins))+' min</b><span>'+o[0]+'</span></div>';
    });
    var bb = CAL.burpee, perRep = bb.met*kg*bb.sr/3600*(bb.met-1)/bb.met, reps = Math.round(E/perRep);
    var h = '<div class="burn"><h4>To burn off about '+Math.round(E)+' kcal</h4><div class="bgrid"><div class="bw"><b>'+fmt(steps)+' steps</b><span>about '+fmtKm(ss.km)+' km · '+Math.round(ss.min)+' min of walking</span></div>'+opts.join('')+'<div><b>'+reps+' reps</b><span>Burpees</span></div></div>';
    h += '<p class="foot">Worked out for your '+kg+' kg using calories above resting. '+(E>700?'That is a lot for one session. Spread it over today and tomorrow instead, and do not skip meals to make up for it. ':'')+'You can also simply eat a little lighter at your next meal.</p></div>';
    return h;
  }
  function xPreview(){
    var sel = $('xf-item'), pv = $('xf-prev'); if(!sel||!pv||!$('xf-q')) return;
    var q = parseFloat($('xf-q').value);
    var it = xItem(sel.value);
    $('xf-unit').textContent = '(1 = '+it.u+')';
    if(!(q>0)){ pv.textContent = 'Enter an amount above 0.'; return; }
    pv.innerHTML = '<span>'+esc(it.n)+'</span><b>'+Math.round(it.k*q)+' kcal</b><small>'+r1(it.p*q)+' g protein</small>';
  }
  function xItem(v){
    if(v.indexOf('x:')===0){ var x = EXTRAF[parseInt(v.slice(2),10)]; return {n:x[1],u:x[2],k:x[3],p:x[4]}; }
    var d = DISHMAP[v]; return {n:d.n,u:d.s,k:d.k,p:d.p};
  }

  /* ----- progress check model ----- */
  function chkOf(){
    var l = tkLog();
    if(!l.chk || typeof l.chk!=='object') l.chk = {};
    var c = l.chk;
    if(!Array.isArray(c.f) || !c.f.length) c.f = [{id:'',q:'1'}];
    if(!Array.isArray(c.e) || !c.e.length) c.e = [{id:'',s:'3',a:'10'}];
    if(c.st===undefined) c.st = '';
    return c;
  }
  var HOLDSEC = ['10','15','20','30','40','45','60','90','120'], MINS = ['5','10','15','20','25','30','40','45','60','90'], REPOPT = ['5','6','8','10','12','15','20','25','30','40','50'];
  function amountOpts(id,cur){
    var c = id ? CAL[id] : null, list = !c ? REPOPT : c.k==='time' ? MINS : c.k==='hold' ? HOLDSEC : REPOPT, unit = !c ? ' reps' : c.k==='time' ? ' min' : c.k==='hold' ? ' sec' : (c.side ? ' reps each leg' : ' reps');
    return list.map(function(v){return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+v+unit+'</option>'}).join('')+'<option value="?"'+(cur==='?'?' selected':'')+'>I don’t know</option>';
  }
  function setsOpts(cur){
    var h = ''; for(var i=1;i<=8;i++) h += '<option value="'+i+'"'+(String(i)===cur?' selected':'')+'>'+i+(i===1?' set':' sets')+'</option>';
    return h+'<option value="?"'+(cur==='?'?' selected':'')+'>I don’t know</option>';
  }
  function qtyOpts(id,cur,planned){
    var h = planned ? '<option value="plan"'+(cur==='plan'?' selected':'')+'>As in my plan</option>' : '';
    h += QTYS.map(function(v){return '<option value="'+v+'"'+(v===cur?' selected':'')+'>'+(v==='1'?'1 serving / piece':v+' serving / piece')+'</option>'}).join('');
    return h+'<option value="?"'+(cur==='?'?' selected':'')+'>I don’t know</option>';
  }
  function foodSelect(i,cur,planIds,mp){
    var inPlan = planIds.map(function(id){var x = DISHMAP[id]; return '<option value="'+id+'"'+(cur===id?' selected':'')+'>'+esc(x.n)+'</option>'}).join('');
    var all = XOPTS;
    if(cur && cur!=='?' && planIds.indexOf(cur)<0) all = all.replace('value="'+cur+'"','value="'+cur+'" selected');
    var h = '<option value=""'+(cur===''?' selected':'')+'>Choose food…</option>';
    if(inPlan) h += '<optgroup label="In my plan today">'+inPlan+'</optgroup>';
    h += '<optgroup label="Not sure"><option value="?"'+(cur==='?'?' selected':'')+'>I don’t know what it was</option></optgroup>';
    h += all;
    return h;
  }
  function planFoodIds(mp,dow){
    var ids = [];
    mp.slots.forEach(function(s){ if(ids.indexOf(s.x.id)<0) ids.push(s.x.id); });
    fdAdds(dow).forEach(function(a){ if(ids.indexOf(a.it.id)<0) ids.push(a.it.id); });
    return ids;
  }
  function planExItems(dow){
    return weekPlan(S).days[dow].items.concat(exAdds(dow).map(function(a){return a.it}));
  }
  function exSelect(cur,items){
    var inPlan = items.map(function(it){return '<option value="'+it.id+'"'+(cur===it.id?' selected':'')+'>'+esc(EXS[it.id].n)+'</option>'}).join('');
    var h = '<option value=""'+(cur===''?' selected':'')+'>Choose exercise…</option>';
    if(inPlan) h += '<optgroup label="In my workout today">'+inPlan+'</optgroup>';
    MUS.forEach(function(m){
      var ids = Object.keys(EXS).filter(function(k){return EXS[k].mu===m}).sort(function(a,b){return EXS[a].n<EXS[b].n?-1:1});
      h += '<optgroup label="'+esc(m)+'">'+ids.map(function(k){return '<option value="'+k+'"'+(cur===k?' selected':'')+'>'+esc(EXS[k].n)+'</option>'}).join('')+'</optgroup>';
    });
    return h;
  }
  var EXSEL_CACHE = {};
  function progHtml(r,mp,day){
    var c = chkOf(), dow = todayDow(), pf = planFoodIds(mp,dow), items = planExItems(dow);
    var tl = tkLog(), st = tl.st||0;
    var fAny = c.f.some(function(f){return f.id}), eAny = c.e.some(function(e){return e.id});
    var fPlan = fAny && c.f.every(function(f){return !f.id || f.q==='plan'}), ePlan = eAny && items.length && c.e.length===items.length;
    var h = '<div class="tkhead"><div><small>End of day</small><h3>Check today’s progress</h3></div></div>';
    h += '<p class="hint">Three quick steps. Not sure about something? Choose <b>I don’t know</b>.</p>';

    h += '<div class="tkstep"><span class="tklbl"><i>1</i>What did you eat?</span>';
    h += '<button type="button" class="tkbig'+(fPlan?' on':'')+'" data-act="cffill"><span class="tkok">✓</span><span><b>'+(fPlan?'I ate my plan':'I ate my plan')+'</b><small>'+(fPlan?'Your planned meals are filled in. Change anything below.':'Fills in all of today’s planned meals')+'</small></span></button>';
    if(fAny || c.fShow){
      h += '<div id="chk-f">';
      c.f.forEach(function(f,i){
        var inplan = pf.indexOf(f.id)>=0;
        h += '<div class="crow tkrow" data-i="'+i+'"><select class="sel" data-chk="fid" aria-label="Food '+(i+1)+'">'+foodSelect(i,f.id,pf,mp)+'</select><div class="tkrow2"><select class="sel" data-chk="fq" aria-label="Amount of food '+(i+1)+'">'+qtyOpts(f.id,f.q,inplan)+'</select><button type="button" class="xrm" data-act="cfrm" data-i="'+i+'" aria-label="Remove this food">×</button></div></div>';
      });
      h += '</div>';
    }
    h += '<button type="button" class="tkadd" data-act="cfadd">+ Add a food</button></div>';

    h += '<div class="tkstep"><span class="tklbl"><i>2</i>Which exercises did you do?</span>';
    if(items.length) h += '<button type="button" class="tkbig'+(ePlan?' on':'')+'" data-act="cefill"><span class="tkok">✓</span><span><b>I did my workout</b><small>'+(ePlan?'Your planned workout is filled in. Change anything below.':'Fills in today’s '+items.length+' planned exercises')+'</small></span></button>';
    else h += '<p class="hint">Today is a rest day in your plan. Add anything you did anyway.</p>';
    if(eAny || c.eShow){
      h += '<div id="chk-e">';
      c.e.forEach(function(e,i){
        var k = e.id ? CAL[e.id].k : 'reps';
        h += '<div class="crow tkrow" data-i="'+i+'"><select class="sel" data-chk="eid" aria-label="Exercise '+(i+1)+'">'+exSelect(e.id,items)+'</select><div class="tkrow2"><select class="sel" data-chk="es" aria-label="Sets"'+(k==='time'?' hidden':'')+'>'+setsOpts(e.s)+'</select><select class="sel" data-chk="ea" aria-label="Reps, seconds or minutes">'+amountOpts(e.id,e.a)+'</select><button type="button" class="xrm" data-act="cerm" data-i="'+i+'" aria-label="Remove this exercise">×</button></div></div>';
      });
      h += '</div>';
    }
    h += '<button type="button" class="tkadd" data-act="ceadd">+ Add an exercise</button></div>';

    h += '<div class="tkstep"><span class="tklbl"><i>3</i>How many steps today?</span>';
    h += '<div class="tkst"><input id="chk-st" type="number" min="0" max="100000" step="1" inputmode="numeric" data-chk="st" placeholder="'+(st ? fmt(st) : '0')+'" value="'+(c.st!=='' && c.st!=='?' ? esc(c.st) : '')+'"'+(c.st==='?'?' disabled':'')+' aria-label="Steps today"><span>steps</span></div>';
    h += '<div class="tkopts"><button type="button" class="cb'+(c.st==='?'?' on':'')+'" data-act="cstidk" aria-pressed="'+(c.st==='?')+'">I don’t know</button></div>';
    h += '<p class="foot">Leave it empty to use your step tracker ('+fmt(st)+' so far).</p></div>';

    h += '<button type="button" class="tkgo" data-act="chk">Check my progress</button><div id="chk-res" aria-live="polite"></div>';
    return h;
  }
  function chkRepaint(){ var s = window.scrollY; renderToday(S,curR); window.scrollTo(0,s); }

  /* ----- evaluation ----- */
  function avgSteps(){
    var tot = 0, n = 0, tk = todayKey();
    Object.keys(S.log||{}).forEach(function(k){ if(k!==tk && S.log[k].st>0){ tot += S.log[k].st; n++; } });
    return n ? Math.round(tot/n) : 0;
  }
  function evalProgress(r){
    var dow = todayDow(), mp = mealPlan(S,r,dow), day = weekPlan(S).days[dow], c = chkOf(), kg = S.weight, tl = tkLog();
    var pf = planFoodIds(mp,dow), items = planExItems(dow), guesses = 0, lowK = 0, highK = 0;
    var eatK = 0, eatP = 0, rows = [];
    var avgMeal = mp.slots.length ? mp.K/mp.slots.length : 300;
    c.f.forEach(function(f){
      if(!f.id) return;
      var k, p, nm, g = false;
      if(f.id==='?'){ k = avgMeal; p = avgMeal*0.04; nm = 'Something you did not know'; g = true; }
      else {
        var it = xItem(f.id), q;
        nm = it.n;
        if(f.q==='plan'){ var ps = mp.slots.filter(function(s){return s.x.id===f.id})[0], pa = fdAdds(dow).filter(function(a){return a.it.id===f.id})[0]; q = ps ? ps.m : pa ? (pa.it.m||1) : 1; }
        else if(f.q==='?'){ q = 1; g = true; }
        else q = parseFloat(f.q);
        k = it.k*q; p = it.p*q;
      }
      if(g){ guesses++; lowK += k*0.6; highK += k*1.4; } else { lowK += k; highK += k; }
      eatK += k; eatP += p; rows.push({n:nm,k:k,g:g});
    });
    xtOf().forEach(function(x){ eatK += x.k; eatP += x.p||0; lowK += x.k; highK += x.k; rows.push({n:x.n+' (added above)',k:x.k,g:false}); });
    var burnK = 0, netK = 0, doneRows = [], plannedMap = {};
    items.forEach(function(it){ plannedMap[it.id] = it; });
    c.e.forEach(function(e){
      if(!e.id) return;
      var base = plannedMap[e.id] || defRx(e.id), cl = CAL[e.id], g = false, it = {id:e.id};
      if(cl.k==='time'){ if(e.a==='?'){ it.m = base.m||20; g = true; } else it.m = parseFloat(e.a); }
      else {
        if(e.s==='?'){ it.s = base.s||3; g = true; } else it.s = parseInt(e.s,10);
        if(e.a==='?'){ if(cl.k==='hold') it.t = base.t||30; else it.r = base.r||12; g = true; } else { if(cl.k==='hold') it.t = parseFloat(e.a); else it.r = parseFloat(e.a); }
      }
      if(g) guesses++;
      var b = burn(e.id,it,kg);
      burnK += b.kcal; netK += b.kcal*(cl.met-1)/cl.met;
      doneRows.push({id:e.id,it:it,k:b.kcal,g:g,plan:plannedMap[e.id]||null});
    });
    var stN, stGuess = false;
    if(c.st==='?'){ stN = avgSteps(); stGuess = true; guesses++; }
    else if(c.st==='' ) stN = tl.st||0;
    else stN = Math.max(0,parseFloat(c.st)||0);
    var stK = stepStats(stN).kcal, goal = stepGoal();
    var plannedK = exTotals(items).kcal;
    var expectBurn = r.bmr*1.2;
    var actualBal = eatK-(expectBurn+netK), planBal = r.target-r.tdee, off = actualBal-planBal;
    return {eatK:eatK,eatP:eatP,lowK:lowK,highK:highK,rows:rows,burnK:burnK,netK:netK,doneRows:doneRows,stN:stN,stK:stK,stGuess:stGuess,goal:goal,plannedK:plannedK,items:items,guesses:guesses,off:off,actualBal:actualBal,planBal:planBal,day:day};
  }
  function resHtml(r){
    var v = evalProgress(r), h = '';
    var any = v.rows.length || v.doneRows.length || v.stN>0;
    if(!any) return '<p class="note">Nothing selected yet. Pick at least one food, exercise or your steps, then check again.</p>';
    var tgt = r.target, diff = v.eatK-tgt, ad = Math.abs(diff), okF = ad<=tgt*0.08;
    var fcls = okF ? 'ok' : (diff>0 ? 'bad' : 'mid');
    var pdiff = r.protein-v.eatP;
    h += '<div class="rcard '+fcls+'"><div class="rh"><b>Food</b><span class="pill">'+(okF?'On target':diff>0?'Over by '+Math.round(ad)+' kcal':'Under by '+Math.round(ad)+' kcal')+'</span></div>'+
      '<div class="rnum"><b>'+fmt(Math.round(v.eatK))+'</b><span>of '+fmt(tgt)+' kcal</span></div><div class="bar"><i style="width:'+Math.min(100,Math.round(v.eatK/tgt*100))+'%"></i></div>'+
      '<p>Protein: <b>'+Math.round(v.eatP)+' g</b> of '+r.protein+' g'+(pdiff>5 ? ' · about '+Math.round(pdiff)+' g short. Use the protein top-up above.' : ' · covered.')+'</p>'+
      '<ul class="rl">'+v.rows.map(function(x){return '<li>'+esc(x.n)+(x.g?' <i>(typical value)</i>':'')+' <b>'+Math.round(x.k)+' kcal</b></li>'}).join('')+'</ul>';
    if(diff>tgt*0.08){ h += '<p>To work off the extra ~'+Math.round(diff)+' kcal: about <b>'+fmt(Math.round(diff/(stepStats(1000).kcal/1000)/50)*50)+' steps</b>, or <b>'+Math.max(1,Math.round(diff/netPerMin(CAL.walk.met)))+' min</b> of brisk walking, or <b>'+Math.max(1,Math.round(diff/netPerMin(CAL.run.met)))+' min</b> of jogging.</p>'; }
    else if(diff<-tgt*0.15){ h += '<p>You are well under your target. Eating too little makes the plan harder to follow. Have a planned snack or top-up.</p>'; }
    h += '</div>';
    /* workout */
    var comp = v.items.map(function(it){
      var d = v.doneRows.filter(function(x){return x.id===it.id})[0];
      if(!d) return {n:EXS[it.id].n,s:'Not logged',cl:'no'};
      var cl = CAL[it.id], pv, dv;
      if(cl.k==='time'){ pv = it.m; dv = d.it.m; } else if(cl.k==='hold'){ pv = it.s*it.t; dv = d.it.s*d.it.t; } else { pv = it.s*it.r; dv = d.it.s*d.it.r; }
      var ratio = dv/pv;
      return {n:EXS[it.id].n,s:(ratio>=0.95?'Done':ratio>=0.5?'Partly done':'Started')+(d.g?' (typical values used)':''),cl:ratio>=0.95?'yes':ratio>=0.5?'part':'no'};
    });
    var extraDone = v.doneRows.filter(function(x){return !x.plan});
    var doneN = comp.filter(function(x){return x.cl==='yes'}).length;
    var wcls = v.day.kind==='REST' ? 'ok' : (v.burnK>=v.plannedK*0.85 ? 'ok' : v.burnK>=v.plannedK*0.4 ? 'mid' : 'bad');
    h += '<div class="rcard '+wcls+'"><div class="rh"><b>Workout</b><span class="pill">'+doneN+' of '+comp.length+' planned done</span></div><div class="rnum"><b>'+Math.round(v.burnK)+'</b><span>kcal burned of ~'+Math.round(v.plannedK)+' planned</span></div><div class="bar"><i style="width:'+Math.min(100,Math.round(v.burnK/Math.max(1,v.plannedK)*100))+'%"></i></div>'+
      '<ul class="rl">'+comp.map(function(x){return '<li class="'+x.cl+'">'+esc(x.n)+' <b>'+x.s+'</b></li>'}).join('')+extraDone.map(function(x){return '<li class="yes">'+esc(EXS[x.id].n)+' <b>Extra · '+Math.round(x.k)+' kcal</b></li>'}).join('')+'</ul></div>';
    /* steps */
    var sp = Math.round(v.stN/v.goal*100);
    h += '<div class="rcard '+(sp>=100?'ok':sp>=60?'mid':'bad')+'"><div class="rh"><b>Steps</b><span class="pill">'+sp+'% of goal</span></div><div class="rnum"><b>'+fmt(Math.round(v.stN))+'</b><span>of '+fmt(v.goal)+' steps · ~'+Math.round(v.stK)+' kcal'+(v.stGuess?' · typical value from your past days':'')+'</span></div><div class="bar"><i style="width:'+Math.min(100,sp)+'%"></i></div></div>';
    /* balance */
    var wk = v.off/7700;
    h += '<div class="rcard sum"><div class="rh"><b>Overall for today</b></div><p>You ate about <b>'+fmt(Math.round(v.eatK))+' kcal</b>. A normal day for you burns about '+fmt(Math.round(r.bmr*1.2))+' kcal plus '+Math.round(v.netK)+' kcal from the exercise you did. That puts today at <b>'+(v.actualBal>=0?'+':'−')+fmt(Math.round(Math.abs(v.actualBal)))+' kcal</b>; your plan aims for '+(v.planBal>=0?'+':'−')+fmt(Math.round(Math.abs(v.planBal)))+' kcal.</p>'+
      '<p>'+(Math.abs(v.off)<=150 ? 'You are right on plan today.' : v.off>0 ? 'You are about '+Math.round(v.off)+' kcal above plan today, roughly '+Math.round(v.off/7.7)+' g of body weight on its own. One day does not change the plan; your weekly average is what counts.' : 'You are about '+Math.round(-v.off)+' kcal below plan today.')+'</p>';
    if(v.guesses) h += '<p class="foot">'+v.guesses+' answer'+(v.guesses===1?' was':'s were')+' “I don’t know”, so typical values were used. The calorie total could be off by roughly ±'+Math.round(Math.max(v.eatK-v.lowK,v.highK-v.eatK))+' kcal. Treat this as a good estimate, not an exact count.</p>';
    else h += '<p class="foot">Based on the amounts you chose. Calories are estimates from standard values and your weight.</p>';
    h += '</div>';
    return h;
  }

  /* ----- handlers: clicks (called from the Today click handler) ----- */
  function trackClick(act,b){
    if(act==='tkopen'){
      var v = b.getAttribute('data-v'); tkOpen = (tkOpen===v) ? '' : v;
      renderToday(S,curR);
      var pn = document.querySelector('#p-today .tkpanel'); if(pn && pn.scrollIntoView) setTimeout(function(){ pn.scrollIntoView({block:'start',behavior:'smooth'}); },30);
      return true;
    }
    if(act==='xpick'){
      var sel = $('xf-item'); sel.value = b.getAttribute('data-v'); $('xf-q').value = 1; xPreview();
      Array.prototype.forEach.call(document.querySelectorAll('#p-today .qchip'),function(x){ x.classList.toggle('on',x===b); });
      return true;
    }
    if(act==='xq'){
      var inp = $('xf-q'); var v = (parseFloat(inp.value)||1)+parseFloat(b.getAttribute('data-d')); inp.value = Math.max(0.25,Math.min(20,v)); xPreview(); return true;
    }
    if(act==='xadd'){
      var q = parseFloat($('xf-q').value);
      if(!(q>0) || q>20){ toast('Enter an amount between 0.25 and 20.'); return true; }
      var it = xItem($('xf-item').value);
      xtOf().push({n:it.n,u:it.u,q:q,k:it.k*q,p:it.p*q});
      lsSet(S); var y = window.scrollY; renderToday(S,curR); renderHome(); window.scrollTo(0,y);
      toast('Added '+Math.round(it.k*q)+' kcal from '+it.n+'.'); return true;
    }
    if(act==='xrm'){ xtOf().splice(parseInt(b.getAttribute('data-i'),10),1); lsSet(S); chkRepaint(); renderHome(); return true; }
    var c = chkOf(), i = parseInt(b.getAttribute('data-i'),10);
    if(act==='cfadd'){ if(!c.fShow && c.f.length===1 && !c.f[0].id){ c.fShow = 1; } else c.f.push({id:'',q:'1'}); c.fShow = 1; lsSet(S); chkRepaint(); return true; }
    if(act==='cfrm'){ c.f.splice(i,1); lsSet(S); chkRepaint(); return true; }
    if(act==='ceadd'){ if(!c.eShow && c.e.length===1 && !c.e[0].id){ c.eShow = 1; } else c.e.push({id:'',s:'3',a:'10'}); c.eShow = 1; lsSet(S); chkRepaint(); return true; }
    if(act==='cerm'){ c.e.splice(i,1); lsSet(S); chkRepaint(); return true; }
    if(act==='cffill'){
      var mp = mealPlan(S,curR,todayDow()); c.f = [];
      mp.slots.forEach(function(s){ c.f.push({id:s.x.id,q:'plan'}); });
      fdAdds(todayDow()).forEach(function(a){ c.f.push({id:a.it.id,q:'plan'}); });
      lsSet(S); chkRepaint(); toast('Filled with your planned meals. Change any row that was different.'); return true;
    }
    if(act==='cefill'){
      c.e = planExItems(todayDow()).map(function(it){
        var cl = CAL[it.id];
        return cl.k==='time' ? {id:it.id,s:'1',a:String(it.m)} : cl.k==='hold' ? {id:it.id,s:String(it.s),a:String(it.t)} : {id:it.id,s:String(it.s),a:String(it.r)};
      });
      lsSet(S); chkRepaint(); toast('Filled with your planned workout. Change anything you did differently.'); return true;
    }
    if(act==='cstidk'){ c.st = c.st==='?' ? '' : '?'; lsSet(S); chkRepaint(); return true; }
    if(act==='chk'){
      $('chk-res').innerHTML = resHtml(curR);
      var el = $('chk-res'); if(el.scrollIntoView) el.scrollIntoView({block:'start',behavior:'smooth'});
      return true;
    }
    return false;
  }
  /* ----- handlers: selects and inputs inside Today ----- */
  $('p-today').addEventListener('change',function(ev){
    if(!S) return;
    var t = ev.target;
    if(t.id==='xf-item' || t.id==='xf-q'){ if(t.id==='xf-item') Array.prototype.forEach.call(document.querySelectorAll('#p-today .qchip'),function(x){ x.classList.toggle('on',x.getAttribute('data-v')===t.value); }); xPreview(); return; }
    var kind = t.getAttribute && t.getAttribute('data-chk'); if(!kind) return;
    var c = chkOf(), row = t.closest('.crow'), i = row ? parseInt(row.getAttribute('data-i'),10) : 0;
    if(kind==='fid'){
      var f = c.f[i]; f.id = t.value;
      var pf = planFoodIds(mealPlan(S,curR,todayDow()),todayDow()), inplan = pf.indexOf(f.id)>=0;
      if(f.q==='plan' && !inplan) f.q = '1';
      row.querySelector('[data-chk=fq]').innerHTML = qtyOpts(f.id,f.q,inplan);
    } else if(kind==='fq'){ c.f[i].q = t.value; }
    else if(kind==='eid'){
      var e = c.e[i]; e.id = t.value;
      if(e.id){
        var base = planExItems(todayDow()).filter(function(x){return x.id===e.id})[0] || defRx(e.id), cl = CAL[e.id];
        e.s = cl.k==='time' ? '1' : String(base.s||3);
        e.a = String(cl.k==='time' ? base.m : cl.k==='hold' ? base.t : base.r);
        row.querySelector('[data-chk=es]').hidden = (cl.k==='time');
      }
      row.querySelector('[data-chk=es]').innerHTML = setsOpts(e.s);
      row.querySelector('[data-chk=ea]').innerHTML = amountOpts(e.id,e.a);
    } else if(kind==='es'){ c.e[i].s = t.value; }
    else if(kind==='ea'){ c.e[i].a = t.value; }
    else if(kind==='st'){ var n = t.value.trim(); c.st = (n==='' ? '' : String(Math.max(0,Math.min(100000,Math.round(parseFloat(n)||0))))); }
    lsSet(S);
  });
  $('p-today').addEventListener('input',function(ev){
    if(ev.target.id==='xf-q') xPreview();
    else if(ev.target.id==='chk-st' && S){ var n = ev.target.value.trim(); chkOf().st = n==='' ? '' : String(Math.max(0,Math.min(100000,Math.round(parseFloat(n)||0)))); lsSet(S); }
  });

