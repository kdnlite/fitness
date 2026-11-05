  /* ---------- Profile, targets and calculation ---------- */
  var KEY = 'kdn.profile.v1';
  var S = null;                 // saved profile (the logged-in user)
  var curR = null;              // latest calculation
  var FLOOR = {male:1500,female:1200,other:1350};   // never plan below these kcal a day
  var KCAL_KG = 7700;
  function minKg(h){return 18.5*Math.pow(h/100,2)}
  function targetOf(o){return o.goal==='lose' ? o.weight-o.amt : o.goal==='gain' ? o.weight+o.amt : o.amt}
  function r1(x){return Math.round(x*10)/10}
  function r10(x){return Math.round(x/10)*10}
  function timeTxt(w){
    if(w<2) return Math.max(1,Math.round(w*7))+' days';
    var x = Math.abs(w-Math.round(w))<0.05 ? Math.round(w) : r1(w);
    return x<=8 ? x+' weeks' : '~'+Math.round(x/4.345)+' months ('+x+' weeks)';
  }
  function toWeeks(n,u){return Math.round((u==='m' ? n*4.345 : u==='d' ? n/7 : n)*100)/100}
  function lsGet(){try{var t=localStorage.getItem(KEY); return t?JSON.parse(t):null}catch(e){return null}}
  function lsSet(o){try{localStorage.setItem(KEY,JSON.stringify(o)); return true}catch(e){return false}}
  function lsDel(){try{localStorage.removeItem(KEY)}catch(e){}}
  function clone(o){return JSON.parse(JSON.stringify(o))}
  function ftIn(cm){
    var t = Math.round(cm/2.54*10)/10, ft = Math.floor(t/12);
    return ft+' ft '+r1(t-ft*12)+' in';
  }
  function bmrOf(o){
    var gc = o.gender==='male' ? 5 : o.gender==='female' ? -161 : -78;
    return 10*o.weight + 6.25*o.height - 5*o.age + gc;
  }
  /* Daily energy use: resting energy x 1.2 (normal life, little walking) plus the net calories of your planned workouts. */
  function tdeeOf(o){
    var wp = (o.loc && o.level && o.days) ? weekPlan(o) : null;
    return bmrOf(o)*1.2 + (wp ? wp.net/7 : 0);
  }
  function floorOf(o){return FLOOR[o.gender] || 1350}
  /* Protein is set from a reference weight: your weight, or an adjusted weight when BMI is 30 or more. */
  function refKg(o){
    var h = o.height/100, ibw = 25*h*h, bmi = o.weight/(h*h);
    return bmi>=30 ? r1(ibw+0.4*(o.weight-ibw)) : o.weight;
  }

  /* How fast is safe? Rates are kg a week. safe = recommended, fast = top of the comfortable range, hard = the most we will plan (1 kg a week). */
  function paceInfo(o){
    if(!(o.weight>0 && o.height>0 && o.age>0) || !o.gender || !o.goal || !(o.amt>0)) return null;
    var tw = targetOf(o), diff = tw - o.weight, ad = Math.abs(diff);
    if(ad < 0.1 || (o.goal==='maintain' && ad < 1)) return null;
    var lose = diff < 0, w = o.weight, tdee = tdeeOf(o), fl = floorOf(o);
    var room = Math.max(0.05, (tdee-fl)/1100), safeR, fastR, hardR;
    if(lose){
      safeR = Math.min(0.75, 0.0075*w, room);
      fastR = Math.max(safeR, Math.min(1, 0.01*w, room));
      hardR = 1;
    } else {
      safeR = Math.min(0.35, Math.max(0.2, 0.0035*w));
      fastR = Math.min(0.5, Math.max(0.3, 0.006*w));
      hardR = 1;
    }
    return {dir:lose?'lose':'gain', ad:ad, tw:tw, tdee:tdee, floor:fl, roomR:(lose?room:null),
      safeR:safeR, fastR:fastR, hardR:hardR,
      safeWeeks:Math.max(2,Math.ceil(ad/safeR)), fastWeeks:Math.max(1,Math.ceil(ad/fastR)), hardWeeks:Math.max(1,Math.ceil(ad/hardR))};
  }
  /* 'safe' | 'brisk' | 'risky' | 'blocked' for a given number of weeks */
  function riskOf(p,weeks){
    var rate = p.ad/weeks, e = 1e-6;
    return rate > p.hardR+e ? 'blocked' : rate > p.fastR+e ? 'risky' : rate > p.safeR+e ? 'brisk' : 'safe';
  }
  function weeksOf(o,p){return (p && o.tmode==='custom' && o.weeks>0) ? o.weeks : (p ? p.safeWeeks : 0)}
  function refreshTime(o){
    var p = paceInfo(o);
    if(!p){ o.weeks = 0; if(o.tmode!=='custom') o.tmode = 'safe'; return; }
    if(o.tmode!=='custom' || !(o.weeks>0)){ o.tmode = 'safe'; o.weeks = p.safeWeeks; }
  }
  function dkeyNow(){var d=new Date(); return d.getFullYear()+'-'+(d.getMonth()<9?'0':'')+(d.getMonth()+1)+'-'+(d.getDate()<10?'0':'')+d.getDate()}
  function normalize(o){
    if(!o.tmode) o.tmode = 'safe';
    if(!o.budget) o.budget = 'mid';
    if(!LOCN[o.loc]) o.loc = 'h1';
    if(!LVN[o.level]) o.level = 'beginner';
    o.days = parseInt(o.days,10); if(!(o.days>=3 && o.days<=6)) o.days = 4;
    var pr = o.prefs || {};
    o.prefs = {avoid:Array.isArray(pr.avoid)?pr.avoid:[], quick:!!pr.quick, protein:!!pr.protein, meals:(pr.meals===3||pr.meals===4)?pr.meals:5};
    if(!o.dsel || typeof o.dsel!=='object') o.dsel = {};
    if(!o.log || typeof o.log!=='object') o.log = {};
    if(!o.custom || typeof o.custom!=='object') o.custom = {};
    if(!o.custom.ex || typeof o.custom.ex!=='object') o.custom.ex = {};
    if(!o.custom.fd || typeof o.custom.fd!=='object') o.custom.fd = {};
    if(!o.wlog || typeof o.wlog!=='object') o.wlog = {};
    if(typeof o.kcalAdj!=='number' || isNaN(o.kcalAdj)) o.kcalAdj = 0;
    o.kcalAdj = Math.max(-400,Math.min(400,o.kcalAdj));
    if(!o.startDate) o.startDate = dkeyNow();
    delete o.picks; delete o.dmenu;
    refreshTime(o);
    return o;
  }

  function calc(d){
    var tw = targetOf(d), diff = tw - d.weight, ad = Math.abs(diff);
    var hm = d.height/100, bmi = d.weight/(hm*hm), tbmi = tw/(hm*hm);
    var tdee = tdeeOf(d), wp = weekPlan(d), fl = floorOf(d);
    var dir = planDir(d), p = paceInfo(d), wk = weeksOf(d,p), notes = [];
    var cat = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Healthy range' : bmi < 30 ? 'Overweight' : 'Obese range';

    if(d.goal==='gain' && tbmi >= 25) notes.push('Your target weight gives a BMI of '+r1(tbmi)+', in the overweight range. Build muscle with strength training and check in with a doctor or trainer as you go.');
    if(d.goal==='maintain' && dir!=='maintain') notes.push('You want to stay stable at '+r1(tw)+' kg, which is '+r1(ad)+' kg '+(diff<0?'below':'above')+' your weight today. The plan first '+(diff<0?'loses':'gains')+' weight, then holds it.');
    if(d.goal==='maintain' && dir==='maintain' && bmi < 18.5) notes.push('Your BMI is below 18.5. Staying at this weight may not be ideal, so "Gain weight" may suit you better.');
    if(d.goal==='maintain' && dir==='maintain' && bmi >= 30) notes.push('Your BMI is in the obese range. "Lose weight" may suit you better if your doctor agrees.');
    if(d.age < 18) notes.push('You are under 18. Please check with a doctor before following a calorie-controlled plan.');

    var delta = 0, kind = '';
    if(p){
      kind = d.tmode==='custom' ? riskOf(p,wk) : 'safe';
      var rate0 = p.ad/wk;
      delta = (p.dir==='lose' ? -1 : 1) * rate0 * 1100;
      if(kind==='brisk') notes.push('You chose '+timeTxt(wk)+', about '+r1(rate0)+' kg a week. That is quicker than the recommended pace of about '+r1(p.safeR)+' kg a week, but still within the comfortable range.');
      if(kind==='risky') notes.push('You chose '+timeTxt(wk)+', about '+r1(rate0)+' kg a week. That is an aggressive pace: expect hunger, tiredness and a harder time sticking to it. We built the plan as you asked. The recommended pace would take '+timeTxt(p.safeWeeks)+'. You can switch any time from Edit plan.');
    }
    var base = tdee + delta, adj = d.kcalAdj || 0;
    var target = r10(base + adj);
    if(target < fl){
      target = fl;
      notes.push('Your calories are held at '+fmt(fl)+' kcal, the lowest we plan for '+({male:'men',female:'women',other:'adults'}[d.gender]||'adults')+'. So the plan may take a little longer than you chose.');
    }
    var net = target - tdee;                       // kcal a day above (+) or below (-) what you burn
    var rate = Math.abs(net)*7/KCAL_KG;            // kg a week this plan really gives
    var weeks = (dir!=='maintain' && rate>0.02) ? Math.max(1,Math.ceil(ad/rate)) : 0;
    var maint = r10(bmrOf({weight:tw,height:d.height,age:d.age,gender:d.gender})*1.2 + wp.net/7);

    var rk = refKg(d), gk = dir==='lose' ? 1.8 : dir==='gain' ? 1.8 : 1.4;
    var protein = Math.round(rk*gk);
    protein = Math.min(protein, Math.floor(target*0.4/4));
    protein = Math.max(protein, Math.round(d.weight*0.8));
    var fat = Math.max(Math.round(target*0.25/9), Math.round(rk*0.6));
    var carbs = Math.max(0, Math.round((target - protein*4 - fat*9)/4));
    var fibre = Math.round(target/1000*14);
    var water = Math.round(d.weight*35/100)/10;
    return {bmi:bmi,cat:cat,bmr:bmrOf(d),tdee:tdee,wkNet:wp.net/7,target:target,protein:protein,fat:fat,carbs:carbs,fibre:fibre,water:water,notes:notes,dir:dir,diff:diff,tw:tw,rate:rate,weeks:weeks,maint:maint,kind:kind,p:p,net:net,adj:adj,refKg:rk,gk:gk,wp:wp,
      gap:Math.round(Math.abs(net)/10)*10};
  }


  /* ---------- Diet tab, nutrients tab, plan header and tabs ---------- */
  function chipBtn(f,v,label,on){
    return '<button type="button" class="cb'+(on?' on':'')+'" data-f="'+f+'" data-v="'+v+'" aria-pressed="'+(on?'true':'false')+'">'+esc(label)+'</button>';
  }
  var refocus = null;
  function countBy(o){
    var out = {};
    ['b','l','d','s'].forEach(function(c){
      var all = DISHES.filter(function(x){return x.cat===c && dietOk(x,o.diet)});
      out[c] = [all.filter(function(x){return eligible(x,o)}).length, all.length];
    });
    return out;
  }
  var dietSel = null, dietSetOpen = false;
  function dietSettingsHtml(d,r){
    var pr = d.prefs, cn = countBy(d);
    var h = '<details class="dset"'+(dietSetOpen?' open':'')+'><summary><span><b>Diet settings</b><small>Budget, meals a day, foods to avoid</small></span><span class="fchev" aria-hidden="true"></span></summary><div class="dsetb">';
    h += '<div class="fcard">';
    h += '<div class="frow"><span class="fl">Budget</span><div class="cbs">'+Object.keys(BUDGET_NAME).map(function(b){return chipBtn('budget',b,BUDGET_NAME[b],d.budget===b)}).join('')+'</div></div>';
    h += '<div class="frow"><span class="fl">Meals a day</span><div class="cbs">'+[3,4,5].map(function(n){return chipBtn('meals',n,n+' meals',pr.meals===n)}).join('')+'</div></div>';
    h += '<div class="frow"><span class="fl">Avoid</span><div class="cbs">'+avoidFor(d.diet).map(function(a){return chipBtn('avoid',a,AVOID_OPTS[a],pr.avoid.indexOf(a)>=0)}).join('')+'</div></div>';
    h += '<div class="frow"><span class="fl">Only show</span><div class="cbs">'+chipBtn('quick','1','Quick: 15 min or less',pr.quick)+chipBtn('protein','1','High protein',pr.protein)+'</div></div>';
    h += '<div class="fmeta"><span>Dishes that match: <b>'+cn.b[0]+'</b> breakfast · <b>'+cn.l[0]+'</b> lunch · <b>'+cn.d[0]+'</b> dinner · <b>'+cn.s[0]+'</b> snacks</span><button type="button" class="linkbtn" data-f="reset" data-v="1">Reset my dish choices</button></div></div>';
    h += '<h3>Portion guide for your goal</h3><div class="meal" style="grid-template-columns:1fr"><ul>'+PORTION[r.dir].map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>';
    h += '</div></details>';
    return h;
  }
  function renderDiet(d,r){
    var td = todayDow(), sel = (dietSel===null ? td : dietSel), isT = sel===td;
    var dt = new Date(); dt.setDate(dt.getDate()+(sel-td));
    var mp = mealPlan(d,r,sel), fa = fdAdds(sel), addK = 0, addP = 0;
    fa.forEach(function(a){ var x = DISHMAP[a.it.id]; addK += x.k*(a.it.m||1); addP += x.p*(a.it.m||1); });
    var totK = mp.K+addK, totP = mp.P+addP, nM = mp.slots.length+fa.length;
    var h = '<div class="tfy"><small>'+esc(dt.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))+'</small><h2>'+(isT ? 'Today’s diet for you' : esc(DAYN[sel])+'’s diet')+'</h2></div>';
    h += '<div class="wkstrip" role="tablist" aria-label="Days of the week">'+DAYN.map(function(n,i){
      var m = mealPlan(d,r,i);
      return '<button type="button" role="tab" data-dd="'+i+'" aria-selected="'+(i===sel)+'" class="'+(i===sel?'on':'')+(i===td?' td':'')+'"><b>'+n.slice(0,3)+'</b><span>'+fmt(Math.round(m.K))+'</span></button>';
    }).join('')+'</div>';
    h += '<div class="wohero"><small>'+esc(DAYN[sel])+(isT?' · Today':'')+'</small><h3>'+nM+' meal'+(nM===1?'':'s')+' · '+fmt(Math.round(totK))+' kcal</h3><div class="wochips"><span><b>'+Math.round(totK/r.target*100)+'%</b> of '+fmt(r.target)+' kcal</span><span><b>'+Math.round(totP)+' g</b> protein</span><span>about <b>₹'+Math.round(mp.cost)+'</b></span></div></div>';
    h += '<div class="wolist">'+mealCards(d,r,mp,sel)+addedFoodCards(sel)+'</div>';
    h += '<button type="button" class="woaddbtn" data-act="addfd"><span>+</span>Add food to '+(isT?'today':esc(DAYN[sel]))+'</button>';
    if(mp.tops.length) h += '<div class="wosum"><small>Protein top-up</small>'+topCards(mp)+'</div>';
    h += '<p class="hint">Open any dish for full nutrition, ingredients, the recipe and other dishes to swap in.</p>';
    h += '<div class="golinks"><button type="button" data-go2="nut"><b>Full nutrients</b><small>Vitamins, minerals, carbs, fat, fibre</small><span aria-hidden="true">›</span></button></div>';
    h += dietSettingsHtml(d,r);
    h += '<p class="foot wofoot">Each day’s menu is built to land within a few percent of your calories and as close to your protein target as real food allows. Prices are rough and change by city and season.</p>';
    $('p-diet').innerHTML = h;
    if(refocus){var el = $('p-diet').querySelector(refocus); if(el) el.focus({preventScroll:true}); refocus = null}
  }
  function refreshDiet(){
    if(!S || !curR) return;
    lsSet(S);
    renderDiet(S,curR);
    renderNutrients(S,curR);
    renderToday(S,curR);
    renderHome();
  }
  $('p-diet').addEventListener('toggle',function(ev){ if(ev.target.classList && ev.target.classList.contains('dset')) dietSetOpen = ev.target.open; },true);
  $('p-diet').addEventListener('click',function(ev){
    if(!S || !curR) return;
    var b = ev.target.closest('button'); if(!b) return;
    var dd = b.getAttribute('data-dd');
    if(dd!==null){ var di = parseInt(dd,10); dietSel = (di===todayDow()) ? null : di; renderDiet(S,curR); return; }
    var f = b.getAttribute('data-f'), act = b.getAttribute('data-act');
    if(f){
      var v = b.getAttribute('data-v');
      if(f==='budget') S.budget = v;
      else if(f==='meals') S.prefs.meals = parseInt(v,10);
      else if(f==='avoid'){ var i = S.prefs.avoid.indexOf(v); if(i>=0) S.prefs.avoid.splice(i,1); else S.prefs.avoid.push(v); }
      else if(f==='quick') S.prefs.quick = !S.prefs.quick;
      else if(f==='protein') S.prefs.protein = !S.prefs.protein;
      else if(f==='reset') S.dsel = {};
      refocus = '[data-f="'+f+'"][data-v="'+v+'"]';
      refreshDiet(); return;
    }
    if(!act) return;
    var sd = (dietSel===null ? todayDow() : dietSel), pv = viewDow;
    if(act==='addfd'){ viewDow = sd; openSheet('fd'); if(SH) SH.restore = pv; return; }
    var slot = b.getAttribute('data-slot');
    if(act==='opts'){
      var box = b.nextElementSibling, open = box.hidden;
      if(open && !box._f){ viewDow = sd; box.innerHTML = optsHtml(slot); viewDow = pv; box._f = 1; }
      box.hidden = !open; b.setAttribute('aria-expanded',open); return;
    }
    var msg = '';
    viewDow = sd;
    if(act==='use'){ if(!S.dsel[sd]) S.dsel[sd] = {}; S.dsel[sd][slot] = b.getAttribute('data-id'); msg = 'Dish changed. Portion re-sized for your day.'; }
    else if(act==='auto'){ if(S.dsel[sd]) delete S.dsel[sd][slot]; msg = 'Back to the automatic choice.'; }
    else if(act==='fdrm'){ var arr = listOf(b.getAttribute('data-src'),'fd',sd), k = parseInt(b.getAttribute('data-i'),10); if(k>=0 && k<arr.length){ arr.splice(k,1); msg = 'Removed.'; } }
    else if(act==='fdq'){ var arr2 = listOf(b.getAttribute('data-src'),'fd',sd), j = parseInt(b.getAttribute('data-i'),10); if(arr2[j]) arr2[j].m = Math.max(0.5,Math.min(6,(arr2[j].m||1)+parseFloat(b.getAttribute('data-d')))); }
    viewDow = pv;
    lsSet(S); renderDiet(S,curR); renderToday(S,curR); renderNutrients(S,curR); renderHome();
    if(msg) toast(msg);
  });

  function barRow(label,val,tgt,unit,note){
    var pct = Math.round(val/tgt*100);
    return '<div class="nbar"><div class="nb-h"><b>'+label+'</b><span>'+fmt(Math.round(val))+' / '+fmt(tgt)+' '+unit+' · '+pct+'%</span></div><div class="bar"><i style="width:'+Math.min(100,pct)+'%"></i></div>'+(note?'<small>'+esc(note)+'</small>':'')+'</div>';
  }
  function renderNutrients(d,r){
    if(viewDow===null) viewDow = todayDow();
    var dietWord = {vegan:'vegan',veg:'vegetarian',nonveg:'non-vegetarian'}[d.diet];
    var mp = mealPlan(d,r,viewDow);
    var watchCount = MICROS.filter(function(m){return m.watch[d.diet]}).length;
    var h = '<h3>'+DAYN[viewDow]+'’s nutrients</h3><p class="hint">Added up from every dish and ingredient in the day’s menu (change the day on the Today tab).</p>';
    h += '<div class="nsum"><span class="chip">Calories, protein, carbs, fat, fibre</span><span class="chip">10 vitamins and minerals</span>'+(watchCount ? '<span class="chip warn">'+watchCount+' need attention on a '+dietWord+' diet</span>' : '<span class="chip ok">All covered on your diet</span>')+'</div>';
    var pNote = mp.P >= r.protein*0.95 ? '' : 'Real food falls a little short here. Add a top-up such as '+TOPL[d.diet][0].n.toLowerCase()+' ('+TOPL[d.diet][0].s+', about '+Math.round(TOPL[d.diet][0].p)+' g protein).';
    h += '<div class="nbars">'+barRow('Calories',mp.K,r.target,'kcal')+barRow('Protein',mp.P,r.protein,'g',pNote)+barRow('Carbohydrates',mp.C,r.carbs,'g')+barRow('Fat',mp.F,r.fat,'g')+barRow('Fibre',mp.FI,r.fibre,'g')+barRow('Water (drink)',r.water,r.water,'litres','About 35 ml for every kg of body weight.')+'</div>';
    var rich = [], seen = {};
    mp.slots.forEach(function(s){ if(s.x.rich) s.x.rich.split('; ').forEach(function(t){ if(!seen[t]){seen[t]=1; rich.push(t)} }); });
    if(rich.length) h += '<p class="hint"><b>Rich in today:</b> '+esc(rich.join('; '))+'.</p>';
    h += '<h3>Vitamins and minerals</h3><p class="hint">Typical adult daily need for your gender, with the best sources on a '+dietWord+' diet.</p><div>';
    MICROS.forEach(function(m){
      var src = m.src[d.diet] || m.src.all, w = m.watch[d.diet];
      h += '<div class="mrow"><div><b>'+m.n+'</b><span class="need">'+needText(m,d.gender)+' a day</span></div><div>'+esc(src)+'<br><span class="chip '+(w?'warn':'ok')+'">'+(w?'Plan this one':'Covered')+'</span></div></div>';
    });
    h += '</div><p class="foot">Calories and macros come from ingredient tables (per 100 g, raw or dry) and are approximate: oil, brand and cooking change them. Vitamin and mineral needs are typical adult values (US RDA), not a prescription.</p>';
    $('p-nut').innerHTML = '<button type="button" class="backlink" data-go2="diet"><span aria-hidden="true">‹</span> Back</button>'+h;
  }

  var VERDICT = {safe:'Recommended pace',brisk:'Quicker than recommended',risky:'Aggressive pace'};
  function journeyHtml(d,r){
    var tw = r1(r.tw);
    var mid = r.dir==='maintain' ? 'Hold steady' : 'About '+timeTxt(r.weeks);
    var note;
    if(r.dir==='maintain') note = 'Eat around '+fmt(r.target)+' kcal a day to hold '+tw+' kg.';
    else note = 'About '+(Math.round(r.rate*100)/100)+' kg a week, eating around '+fmt(r.target)+' kcal a day. After you reach '+tw+' kg, eat around '+fmt(r.maint)+' kcal a day to stay there.';
    var kindTxt = VERDICT[r.kind] || '';
    var miles = '';
    if(r.weeks>0){
      miles = '<div class="miles">'+[0.25,0.5,0.75,1].map(function(fr){
        var wk = Math.max(1,Math.round(r.weeks*fr)), wt = d.weight + (r.tw-d.weight)*fr;
        return '<div><small>Week '+wk+'</small><b>'+r1(wt)+' kg</b></div>';
      }).join('')+'</div>';
    }
    return '<div class="journey"><div class="jrow"><div><small>Now</small><b>'+r1(d.weight)+' kg</b></div><div class="jm">'+esc(mid)+'</div><div class="je"><small>Target</small><b>'+tw+' kg</b></div></div><div class="jtrack" aria-hidden="true"><i class="s"></i><i class="e"></i></div>'+
      (kindTxt ? '<span class="pk '+r.kind+'">'+kindTxt+'</span>' : '')+miles+'<p class="jnote">'+esc(note)+'</p></div>';
  }
  function goalLine(d){
    if(d.goal==='lose') return 'Lose '+d.amt+' kg ('+r1(d.weight)+' to '+r1(targetOf(d))+' kg)';
    if(d.goal==='gain') return 'Gain '+d.amt+' kg ('+r1(d.weight)+' to '+r1(targetOf(d))+' kg)';
    return 'Stay stable at '+d.amt+' kg';
  }

  function render(d,r){
    curR = r;
    var dietWord = {vegan:'vegan',veg:'vegetarian',nonveg:'non-vegetarian'}[d.diet];
    $('hello').innerHTML = '<div class="planhero"><div class="ph-t"><small>Your plan</small><h2>Here is your plan, '+esc(d.name)+'.</h2><p>'+esc(goalLine(d))+' on a '+dietWord+' diet.</p></div><div class="ph-art">'+frame(PL.ohpress[1],gOf())+'</div>'+journeyHtml(d,r)+'</div>';
    var stats = [
      ['Daily target', fmt(r.target), 'kcal per day', true],
      ['Protein', r.protein+' g', 'per day'],
      ['Carbs', r.carbs+' g', 'per day'],
      ['Fat', r.fat+' g', 'per day'],
      ['Fibre', r.fibre+' g', 'per day'],
      ['BMI', r.bmi.toFixed(1), r.cat],
      ['Water', r.water.toFixed(1)+' L', 'per day']
    ];
    $('stats').innerHTML = stats.map(function(x){
      return '<div class="stat'+(x[3]?' big':'')+'"><small>'+x[0]+'</small><b>'+x[1]+'</b><span>'+x[2]+'</span></div>';
    }).join('');
    var how = '<p class="note ok">How this is worked out: resting energy '+fmt(Math.round(r.bmr))+' kcal × 1.2 for normal life + about '+Math.round(r.wkNet)+' kcal a day of net workout energy = '+fmt(Math.round(r.tdee))+' kcal you burn. '+(r.dir==='maintain' ? 'You eat about that much.' : 'You eat '+fmt(r.gap)+' kcal a day '+(r.dir==='lose'?'less':'more')+', which is about '+(Math.round(r.rate*100)/100)+' kg a week (7,700 kcal is about 1 kg). Protein is about '+r1(r.protein/r.refKg)+' g per kg of '+(r.refKg!==d.weight?'adjusted ':'')+'body weight'+(r.protein<Math.round(r.refKg*r.gk)?' (held at 40% of your calories)':'')+'.')+'</p>';
    $('notes').innerHTML = r.notes.map(function(n){return '<p class="note">'+esc(n)+'</p>'}).join('')+how;
    $('notes').style.cssText = 'display:flex;flex-direction:column;gap:10px';
    viewDow = null;
    userKg = d.weight;
    renderDiet(d,r);
    var extra = [];
    if(r.p){
      extra.push(['Your timeline','Aim for '+r1(r.rate)+' kg a week. Weigh in once a week, same time, and log it in the Progress tab. The plan checks your real trend and tells you if calories need a small change.']);
      if(r.kind==='risky') extra.push([r.dir==='lose'?'Aggressive pace: protect muscle':'Aggressive pace: expect fat too','Keep every strength session and protein at '+r.protein+' g. '+(r.dir==='lose'?'Add a 15 minute walk after dinner.':'Most weight gained this fast is not muscle.')]);
    }
    renderExercisePlan(extra);
    renderLibrary();
    renderToday(d,r);
    renderNutrients(d,r);
    renderSteps();
    renderProgress();
    renderHome();
  }

  var TABS = ['today','diet','nut','ex','steps','prog'];
  var curTab = 'today';
  function setTab(which){
    curTab = which;
    TABS.forEach(function(k){
      $('tab-'+k).setAttribute('aria-selected', k===which);
      $('p-'+k).hidden = (k!==which);
    });
    $('s-result').classList.toggle('stepsonly', which==='steps');
    $('s-result').classList.toggle('notrack', which!=='today');
    $('s-result').classList.toggle('exonly', which==='ex');
    if(which==='steps' && S) renderSteps();
    if(which==='prog' && S) renderProgress();
    syncNav();
  }
  TABS.forEach(function(k){ $('tab-'+k).addEventListener('click',function(){setTab(k)}) });
  $('s-result').addEventListener('click',function(ev){ var b = ev.target.closest('[data-go2]'); if(!b) return; ev.stopPropagation(); setTab(b.getAttribute('data-go2')); window.scrollTo(0,0); },true);

  /* ---------- Food guide: every dish by diet and meal ---------- */
  var foodDiet = 'veg', foodCat = 'b';
  function renderFoods(){
    Array.prototype.forEach.call($('foodtabs').querySelectorAll('.tab'),function(b){b.setAttribute('aria-selected', b.getAttribute('data-diet')===foodDiet)});
    Array.prototype.forEach.call($('foodcats').querySelectorAll('.cb'),function(b){var on = b.getAttribute('data-cat')===foodCat; b.classList.toggle('on',on); b.setAttribute('aria-pressed',on)});
    var list = DISHES.filter(function(x){return x.cat===foodCat && dietOk(x,foodDiet)});
    list = list.filter(function(x){return DPH[x.id]}).concat(list.filter(function(x){return !DPH[x.id]}));
    $('foodcount').textContent = list.length+' '+CATN[foodCat].toLowerCase()+' dishes for '+({vegan:'vegan',veg:'vegetarian',nonveg:'non-vegetarian'}[foodDiet])+' eaters'+(foodDiet==='nonveg' ? ' (every dish, including egg, chicken and fish)' : foodDiet==='veg' ? ' (including vegan dishes)' : '');
    var kp = !licensed(), shownN = kp ? 6 : foodN; $('foodgrid').innerHTML = list.slice(0,shownN).map(dishCard).join('') + (kp && list.length>shownN ? kPrevCard('You are seeing '+shownN+' of '+DISHES.length+' dishes.','Get a plan to open every dish with its recipe, nutrition and a daily meal plan set for your body.') : list.length>shownN ? '<button type="button" class="btn ghost more" id="food-more">Show '+Math.min(60,list.length-shownN)+' more ('+(list.length-shownN)+' left)</button>' : '');
  }
  var foodN = 60;
  $('foodgrid').addEventListener('click',function(ev){ if(ev.target.closest('#food-more')){ foodN += 60; renderFoods(); } });
  function setFoodDiet(k){ foodDiet = k; foodN = 60; renderFoods(); }
  $('foodtabs').addEventListener('click',function(ev){
    var b = ev.target.closest('.tab'); if(b) setFoodDiet(b.getAttribute('data-diet'));
  });
  $('foodcats').addEventListener('click',function(ev){
    var b = ev.target.closest('.cb'); if(b){ foodCat = b.getAttribute('data-cat'); foodN = 60; renderFoods(); }
  });

  /* ---------- Progress: weekly weigh-ins, expected vs actual, and an honest calorie adjustment ---------- */
  function dayNum(k){return Math.round(new Date(k+'T12:00:00').getTime()/86400000)}
  function wEntries(){
    return Object.keys(S.wlog||{}).sort().map(function(k){return {k:k,kg:S.wlog[k]}});
  }
  function wTrend(list){ /* least squares slope in kg per week */
    if(list.length<2) return null;
    var x0 = dayNum(list[0].k), n = list.length, sx=0, sy=0, sxx=0, sxy=0;
    list.forEach(function(e){var x=dayNum(e.k)-x0; sx+=x; sy+=e.kg; sxx+=x*x; sxy+=x*e.kg});
    var den = n*sxx - sx*sx; if(!den) return null;
    return {slope:(n*sxy - sx*sy)/den*7, span:dayNum(list[n-1].k)-x0};
  }
  function expectedAt(k,r){
    var sw = S.startWeight>0 ? S.startWeight : S.weight;
    if(!(r.weeks>0)) return r.dir==='maintain' ? sw : sw;
    var totalDays = r.weeks*7, el = Math.max(0,dayNum(k)-dayNum(S.startDate));
    return sw + (r.tw - sw)*Math.min(1,el/totalDays);
  }
  function addWeight(k,kg){
    if(!(kg>=20 && kg<=300)) return 'Enter a weight between 20 and 300 kg.';
    if(!/^\d{4}-\d{2}-\d{2}$/.test(k) || k>todayKey()) return 'Choose today or an earlier date.';
    S.wlog[k] = Math.round(kg*10)/10;
    S.wtime = S.wtime || {}; if(k===todayKey()) S.wtime[k] = Date.now(); else delete S.wtime[k];
    var ks = Object.keys(S.wlog).sort();
    while(ks.length>400) delete S.wlog[ks.shift()];
    lsSet(S);
    return '';
  }
  function adjustAdvice(r){
    var adjFrom = S.adjFrom || S.startDate;
    var list = wEntries().filter(function(e){return e.k>=adjFrom});
    var t = wTrend(list);
    if(!t || t.span<10) return {ready:false,have:list.length,span:t?t.span:0};
    var latest = list[list.length-1].kg, sign = r.dir==='lose'?-1:r.dir==='gain'?1:0;
    var remW = r.weeks>0 ? Math.max(1,(dayNum(S.startDate)+r.weeks*7-dayNum(todayKey()))/7) : 4;
    var need = r.dir==='maintain' ? ((Math.abs(latest-r.tw)<1) ? 0 : (r.tw-latest)/4) : (r.tw-latest)/remW;
    need = Math.max(-1,Math.min(1,need));
    var finished = (r.dir==='lose' && latest<=r.tw) || (r.dir==='gain' && latest>=r.tw);
    if(finished) return {ready:true,done:true,latest:latest,slope:t.slope};
    var change = (need - t.slope)*1100;
    var newAdj = Math.max(-400,Math.min(400,Math.round(((S.kcalAdj||0)+change)/10)*10));
    var newTarget = r.target - (S.kcalAdj||0) + newAdj;
    if(newTarget < floorOf(S)){ newAdj = (S.kcalAdj||0) + (floorOf(S) - r.target); newTarget = floorOf(S); }
    var diff = newAdj - (S.kcalAdj||0);
    return {ready:true,latest:latest,slope:t.slope,need:need,span:t.span,diff:diff,newAdj:newAdj,newTarget:newTarget,onTrack:Math.abs(diff)<100};
  }
  function renderProgress(){
    if(!S || !curR) return;
    var r = curR, list = wEntries(), tk = todayKey();
    var h = '<div class="sect"><div class="sh"><div><small>Progress</small><h3>Weigh-ins</h3></div><span class="dsum2">Week '+Math.max(1,Math.floor((dayNum(tk)-dayNum(S.startDate))/7)+1)+(r.weeks>0 ? ' of '+r.weeks : '')+'</span></div>';
    h += '<p class="hint">Weigh yourself once a week, same day and time, before eating. Daily weight moves 1 to 2 kg from water, so judge by the trend over two weeks or more.</p>';
    h += '<div class="frow"><span class="fl">Log your weight</span><div class="inwrap"><input type="number" id="w-kg" min="20" max="300" step="0.1" inputmode="decimal" placeholder="'+r1(list.length?list[list.length-1].kg:S.weight)+'" aria-label="Weight in kg"><span class="unit">kg</span></div><div class="inwrap"><input type="date" id="w-date" value="'+tk+'" max="'+tk+'" aria-label="Date"></div><button type="button" class="btn sm" data-pg="add">Save weigh-in</button><div class="err" id="w-err" role="alert"></div></div>';
    // chart
    var sw = S.startWeight>0 ? S.startWeight : S.weight, D = Math.max(7, r.weeks>0 ? r.weeks*7 : 28, list.length ? dayNum(list[list.length-1].k)-dayNum(S.startDate) : 0);
    var vals = [sw, r.tw].concat(list.map(function(e){return e.kg})), lo = Math.min.apply(null,vals)-1, hi = Math.max.apply(null,vals)+1;
    function X(d){return 8+Math.max(0,Math.min(D,d))/D*284}
    function Y(v){return 8+(hi-v)/(hi-lo)*104}
    var exp = r.weeks>0 ? '<line x1="'+X(0)+'" y1="'+Y(sw)+'" x2="'+X(r.weeks*7)+'" y2="'+Y(r.tw)+'" stroke="#9DB5EE" stroke-width="2" stroke-dasharray="5 4"/>' : '<line x1="'+X(0)+'" y1="'+Y(sw)+'" x2="'+X(D)+'" y2="'+Y(sw)+'" stroke="#9DB5EE" stroke-width="2" stroke-dasharray="5 4"/>';
    var pts = list.map(function(e){return X(dayNum(e.k)-dayNum(S.startDate)).toFixed(1)+','+Y(e.kg).toFixed(1)}).join(' ');
    var dots = list.map(function(e){return '<circle cx="'+X(dayNum(e.k)-dayNum(S.startDate)).toFixed(1)+'" cy="'+Y(e.kg).toFixed(1)+'" r="3.6" fill="#1D4ED8"><title>'+e.k+': '+e.kg+' kg</title></circle>'}).join('');
    h += '<div class="chart"><svg viewBox="0 0 300 124" role="img" aria-label="Expected weight and your logged weight">'+exp+(list.length>1?'<polyline points="'+pts+'" fill="none" stroke="#1D4ED8" stroke-width="2"/>':'')+dots+'<text x="8" y="121" font-size="9" fill="#586774">Start '+r1(sw)+' kg</text><text x="292" y="121" font-size="9" fill="#586774" text-anchor="end">Target '+r1(r.tw)+' kg</text></svg><div class="cx"><span>Dashed line: plan</span><span></span><span>Dots: your weigh-ins</span></div></div>';
    if(list.length){
      var last = list[list.length-1], ex = expectedAt(last.k,r), df = last.kg-ex;
      h += '<p class="hint">Latest: <b>'+last.kg+' kg</b> on '+last.k+'. The plan expects about <b>'+r1(ex)+' kg</b> by then ('+(Math.abs(df)<0.3?'right on track':(df>0?'+':'')+r1(df)+' kg difference')+').</p>';
    }
    var adv = adjustAdvice(r);
    h += '<div class="adv">';
    if(!adv.ready){
      h += '<b>Calorie check</b><span>Log your weight at least twice, 10 or more days apart ('+adv.have+' logged since your last plan change'+(adv.span?', '+adv.span+' days apart':'')+'). Then we compare your real trend with the plan and suggest a small change if needed.</span>';
    } else if(adv.done){
      h += '<b>Goal reached</b><span>You are at '+adv.latest+' kg. Use Edit plan to set a new goal or to hold this weight.</span>';
    } else if(adv.onTrack){
      h += '<b>On track</b><span>Your trend is '+(adv.slope>0?'+':'')+(Math.round(adv.slope*100)/100)+' kg a week and about '+(Math.round(adv.need*100)/100)+' kg a week is needed to arrive on time. Keep going, no change needed.</span>';
    } else {
      h += '<b>Suggested change: '+(adv.diff>0?'+':'')+adv.diff+' kcal a day</b><span>Your trend is '+(adv.slope>0?'+':'')+(Math.round(adv.slope*100)/100)+' kg a week; about '+(Math.round(adv.need*100)/100)+' kg a week is needed to reach '+r1(r.tw)+' kg on time. New daily target: '+fmt(adv.newTarget)+' kcal. This is capped at 400 kcal from your base plan and never goes below '+fmt(floorOf(S))+' kcal.</span><button type="button" class="btn sm" data-pg="apply" data-adj="'+adv.newAdj+'">Apply new target</button>';
    }
    if(S.kcalAdj) h += '<span class="hint">Current manual adjustment: '+(S.kcalAdj>0?'+':'')+S.kcalAdj+' kcal a day. <button type="button" class="linkbtn" data-pg="reset">Remove it</button></span>';
    h += '</div>';
    if(list.length){
      h += '<div class="rlist">'+list.slice(-8).reverse().map(function(e){return '<div class="rrow"><span>'+e.k+(S.wtime&&S.wtime[e.k]?' · '+new Date(S.wtime[e.k]).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}):'')+'</span><b>'+e.kg+' kg</b><span><button type="button" class="linkbtn" data-pg="del" data-k="'+e.k+'" aria-label="Delete weigh-in of '+e.k+'">Delete</button></span></div>'}).join('')+'</div>';
    }
    h += '<p class="foot">No plan can promise an exact result, because bodies differ in water, hormones, sleep and how closely a plan is followed. This plan uses standard formulas to set a realistic start, then your own weigh-ins correct it every week or two.</p></div>';
    $('p-prog').innerHTML = '<button type="button" class="backlink" data-go2="today"><span aria-hidden="true">‹</span> Back</button>'+h;
  }
  $('p-prog').addEventListener('click',function(ev){
    if(!S) return;
    var b = ev.target.closest('button[data-pg]'); if(!b) return;
    var a = b.getAttribute('data-pg');
    if(a==='add'){
      var err = addWeight($('w-date').value||todayKey(), parseFloat($('w-kg').value));
      if(err){ $('w-err').textContent = err; return; }
      toast('Weigh-in saved.'); renderProgress(); renderHome();
    } else if(a==='del'){ delete S.wlog[b.getAttribute('data-k')]; lsSet(S); renderProgress(); renderHome(); }
    else if(a==='apply'){ S.kcalAdj = parseInt(b.getAttribute('data-adj'),10); S.adjFrom = todayKey(); lsSet(S); applyProfile(true); toast('New target applied.'); setTab('prog'); }
    else if(a==='reset'){ S.kcalAdj = 0; S.adjFrom = todayKey(); lsSet(S); applyProfile(true); toast('Adjustment removed.'); setTab('prog'); }
  });

  /* ---------- Validation ---------- */
  function vName(o){return o.name && o.name.length ? '' : 'Please enter your name.'}
  function vWeight(o){return o.weight>=20 && o.weight<=300 ? '' : 'Enter your weight in kg, between 20 and 300.'}
  function vHeight(o){return o.height>=100 && o.height<=250 ? '' : 'Enter your height between 3 ft 4 in and 8 ft 2 in.'}
  function vAge(o){return o.age>=12 && o.age<=90 ? '' : 'Enter your age in years, between 12 and 90.'}
  function vGender(o){return o.gender ? '' : 'Please choose your gender.'}
  function vDiet(o){return o.diet ? '' : 'Choose vegan, vegetarian or non-vegetarian.'}
  function vGoal(o){return o.goal ? '' : 'Choose whether you want to lose, gain or stay at your weight.'}
  function vBudget(o){return BUDGET[o.budget] ? '' : 'Choose a food budget.'}
  function vLoc(o){return LOCN[o.loc] ? '' : 'Choose where you will work out.'}
  function vLevel(o){return LVN[o.level] ? '' : 'Choose your fitness level.'}
  function vDays(o){return (o.days>=3 && o.days<=6) ? '' : 'Choose 3, 4, 5 or 6 training days a week.'}
  function vAmt(o){
    if(!(o.amt>0)) return o.goal==='maintain' ? 'Enter the weight in kg where you want to stay.' : 'Enter how many kg, for example 5.';
    if(!(o.weight>=20 && o.height>=100)) return '';
    var mn = Math.ceil(minKg(o.height)*10)/10;
    if(o.goal==='lose'){
      var maxLose = r1(o.weight - mn);
      if(maxLose < 0.5) return 'You are already at the lower end of a healthy weight for your height, so a weight-loss goal is not advised. Choose "Stay stable" instead.';
      if(o.amt < 0.5) return 'Enter at least 0.5 kg.';
      if(o.amt > maxLose) return 'That would take you below a healthy weight. For your height you can lose up to '+maxLose+' kg (down to '+mn+' kg).';
      return '';
    }
    if(o.goal==='gain'){
      if(o.amt < 0.5) return 'Enter at least 0.5 kg.';
      if(o.amt > 40) return 'Enter 40 kg or less. You can set a new goal after you reach this one.';
      return '';
    }
    if(o.amt < 20 || o.amt > 300) return 'Enter a weight between 20 and 300 kg.';
    if(o.amt < mn) return 'That is below a healthy weight for your height. The lowest suggested weight is '+mn+' kg.';
    return '';
  }
  function blockedMsg(o,p){
    var n = o.weeks, rate = p.ad/n, lose = p.dir==='lose';
    return 'I can\u2019t plan '+(lose?'losing ':'gaining ')+r1(p.ad)+' kg in '+timeTxt(n)+'. That is about '+r1(rate)+' kg a week, which is too risky to be practical or safe. The most I can plan is 1 kg a week, which takes '+timeTxt(p.hardWeeks)+'.';
  }
  function vTime(o){
    var p = paceInfo(o); if(!p) return '';
    if(o.tmode!=='safe' && o.tmode!=='custom') return 'Choose the recommended pace or enter your own time.';
    if(o.tmode==='safe') return '';
    if(!(o.weeks>0)) return 'Enter how long you want to take, for example 12 weeks or 90 days.';
    if(o.weeks > 520) return 'Please choose 10 years (520 weeks) or less.';
    if(riskOf(p,o.weeks)==='blocked') return blockedMsg(o,p);
    return '';
  }
  var FV = {name:vName,weight:vWeight,height:vHeight,age:vAge,gender:vGender,diet:vDiet,goal:vGoal,amt:vAmt,loc:vLoc,level:vLevel,days:vDays,time:vTime,budget:vBudget};
  var KEYS = ['name','weight','height','age','gender','diet','goal','amt','loc','level','days','time','budget'];
  var VALID = KEYS.map(function(k){return FV[k]});

