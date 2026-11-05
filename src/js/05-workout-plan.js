  /* ---------- Weekly workout plan: built from where you train, your level, days a week and your goal ---------- */
  var LOCN = {h0:'Home, no equipment',h1:'Home with dumbbells',gym:'Gym'};
  var LVN = {beginner:'Beginner',mid:'Intermediate',adv:'Advanced'};
  var WD = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  var DAYN = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var SLOT_AT = {3:[0,2,4],4:[0,1,3,4],5:[0,1,2,4,5],6:[0,1,2,3,4,5]};
  var TPL = {
    lose:{3:['FB','CA','FB'],4:['UP','LO','CA','FB'],5:['UP','LO','CA','FB','CA'],6:['PUSH','LEGS','CA','PULL','LO','CA']},
    gain:{3:['FB','FB','FB'],4:['UP','LO','UP','LO'],5:['PUSH','PULL','LEGS','UP','LO'],6:['PUSH','PULL','LEGS','PUSH','PULL','LEGS']},
    maintain:{3:['FB','CA','FB'],4:['UP','LO','CA','FB'],5:['UP','LO','CA','FB','MO'],6:['PUSH','PULL','LEGS','CA','UP','MO']}
  };
  var KIND = {
    FB:['Full-body strength',['sq','ps','pl','hg','co','lg']],
    UP:['Upper-body strength',['ps','pl','ps','ar','tr','co']],
    LO:['Lower body and core',['sq','hg','lg','cf','co','sq']],
    PUSH:['Push day: chest, shoulders, triceps',['ps','ps','tr','ps','co','tr']],
    PULL:['Pull day: back and biceps',['pl','pl','ar','hg','co','ar']],
    LEGS:['Legs and core',['sq','hg','lg','cf','co','sq']],
    CA:['Cardio',null], MO:['Yoga and mobility',null]
  };
  var NSLOT = {beginner:4,mid:5,adv:6}, NSETS = {beginner:2,mid:3,adv:4};
  var REPS = {calf:15,bridge:15,crunch:15,kbswing:15,burpee:8,superman:12,birddog:10,stepup:10,lunge:10,hangraise:8,legraise:12,pullup:6,invrow:10,latpull:10,cablerow:10,deadlift:8,bench:8};
  var HOLDS = {plank:[20,30,45],wallsit:[20,30,45],climber:[20,30,40],jacks:[30,40,50],highknees:[20,30,40]};
  function lvIdx(l){return l==='adv'?2:l==='mid'?1:0}
  function tierOf(loc){return loc==='gym'?2:loc==='h1'?1:0}
  function planDir(o){
    if(o.goal==='maintain'){ var d = (o.amt>0 ? o.amt - o.weight : 0); return Math.abs(d)>=1 ? (d<0?'lose':'gain') : 'maintain'; }
    return o.goal;
  }
  var PATORDER = Object.keys(META);
  var HARD = ['pullup','hangraise','deadlift','burpee','kbswing','bench'];
  function choose(pat,tier,used,k,level){
    var c = PATORDER.filter(function(id){return META[id][1]===pat && META[id][0]<=tier && used.indexOf(id)<0 && CAL[id].k!=='time' && (EXS[id].lv||0)<=lvIdx(level) && !(level==='beginner' && HARD.indexOf(id)>=0 && id!=='bench')});
    if(!c.length) return null;
    c.sort(function(a,b){return META[b][0]-META[a][0]});
    var top = c.filter(function(id){return META[id][0]===META[c[0]][0]});
    var pool = top.length>1 ? top : c.slice(0,Math.min(2,c.length));
    return pool[k % pool.length];
  }
  function rxFor(id,o){
    var lv = lvIdx(o.level), dir = planDir(o), c = CAL[id];
    if(c.k==='hold') return [id,NSETS[o.level],(HOLDS[id]||[20,30,40])[lv]];
    var base = dir==='gain' ? [12,10,8][lv] : [12,12,12][lv];
    var r = REPS[id] || base;
    if(!REPS[id] && META[id][0]===0 && (META[id][1]==='sq' || META[id][1]==='hg')) r = base+5;
    if(dir==='gain' && REPS[id] && META[id][0]>=1 && r>10) r = 10;
    return [id,NSETS[o.level],r];
  }
  function caDay(o,c){
    var lv = o.level, gym = o.loc==='gym', L = [];
    if(lv==='beginner'){
      if(gym && c%2===1) L.push(['cycle',30,'easy to moderate pace']);
      else L.push(['walk',c%2 ? 40 : 30,'brisk, you can talk but not sing']);
    } else if(lv==='mid'){
      if(c%2===0) L.push(['run',30,'1 min fast, 2 min easy, repeat']);
      else if(gym) L.push(['cycle',35,'steady, add resistance in short bursts']);
      else { L.push(['skip',15,'1 min on, 30 sec off']); L.push(['jacks',3,40]); }
    } else {
      if(c%2===0){ L.push(['run',35,'1 min fast, 2 min easy, repeat']); L.push(['climber',3,40]); }
      else if(gym){ L.push(['cycle',40,'intervals: 1 min hard, 2 min easy']); L.push(['hangraise',3,8]); }
      else { L.push(['burpee',4,8]); L.push(['highknees',4,30]); L.push(['skip',15,'1 min on, 30 sec off']); }
    }
    return L;
  }
  var PLANC = {};
  function weekPlan(o){
    var dir = planDir(o), key = [o.loc,o.level,o.days,dir,Math.round(o.weight)].join('|');
    if(PLANC[key]) return PLANC[key];
    var tier = tierOf(o.loc), tpl = TPL[dir][o.days], at = SLOT_AT[o.days], days = [], kg = o.weight;
    var caN = 0, occ = {};
    for(var i=0;i<7;i++) days.push({d:WD[i],t:'Rest and gentle movement',kind:'REST',items:[mk('walk',['walk',20,'easy pace']),mk('stretch',['stretch',10])]});
    days[6].t = 'Rest day'; days[6].items = [mk('stretch',['stretch',10,'only if you feel stiff'])];
    tpl.forEach(function(kind,ti){
      var di = at[ti], items = [];
      occ[kind] = (occ[kind]||0)+1;
      if(kind==='CA'){ caDay(o,caN++).forEach(function(a){items.push(mk(a[0],a))}); }
      else if(kind==='MO'){ items = [mk('yoga',['yoga',20,'6 rounds']),mk('stretch',['stretch',15])]; }
      else {
        var pats = KIND[kind][1].slice(0,NSLOT[o.level]), used = [], pc = {};
        pats.forEach(function(p){
          pc[p] = (pc[p]||0)+1;
          var id = choose(p,tier,used,ti+pc[p]-1+(occ[kind]-1),o.level);
          if(!id) return;
          used.push(id);
          items.push(mk(id,rxFor(id,o)));
        });
        var fill = {PUSH:['ps','tr','co','sq'],PULL:['pl','hg','co','ar'],UP:['ps','pl','tr','co'],LO:['sq','lg','hg','co','cf'],LEGS:['sq','lg','hg','co','cf'],FB:['sq','ps','pl','hg','lg','co']}[kind], fi = 0, guard = 0;
        while(items.length < NSLOT[o.level] && guard++ < 24){
          var fid = choose(fill[fi % fill.length],tier,used,ti+fi,o.level); fi++;
          if(!fid) continue;
          used.push(fid); items.push(mk(fid,rxFor(fid,o)));
        }
      }
      days[di] = {d:WD[di],t:KIND[kind][0],kind:kind,items:items};
    });
    var tm=0, tg=0, tn=0, ex=0, sets=0, act=0;
    days.forEach(function(d){
      d.min=0; d.kcal=0; d.net=0;
      d.items.forEach(function(it){var b=burn(it.id,it,kg); d.min+=b.min; d.kcal+=b.kcal; d.net+=b.kcal*(CAL[it.id].met-1)/CAL[it.id].met; if(d.kind!=='REST'){ex++; sets+=(it.s||0)}});
      tm+=d.min; tg+=d.kcal; tn+=d.net; if(d.kind!=='REST') act++;
    });
    return PLANC[key] = {days:days,min:tm,kcal:tg,net:tn,ex:ex,sets:sets,active:act,dir:dir};
  }
  var dayPlanOpen = null, extraTips = [];
  var exSel = null;
  function renderExercisePlan(extra){
    extraTips = extra || [];
    var o = S, wp = weekPlan(o), td = todayDow(), sel = (exSel===null ? td : exSel), d = wp.days[sel];
    var dt = new Date(); dt.setDate(dt.getDate()+(sel-td));
    var cx = (o.custom && o.custom.ex && o.custom.ex[sel]) || [];
    var nEx = d.items.length + exAdds(sel).length, rest = !nEx;
    var h = '<div class="tfy"><small>'+esc(dt.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}))+'</small><h2>'+(sel===td ? 'Today’s workout for you' : esc(DAYN[sel])+'’s workout')+'</h2></div>';
    h += '<div class="wkstrip" role="tablist" aria-label="Days of the week">'+wp.days.map(function(x,i){
      var pi = planExItems(i), off = !pi.length;
      return '<button type="button" role="tab" data-exd="'+i+'" aria-selected="'+(i===sel)+'" class="'+(i===sel?'on':'')+(i===td?' td':'')+(off?' off':'')+'"><b>'+DAYN[i].slice(0,3)+'</b><span>'+(off?'Rest':Math.round(exTotals(pi).min)+'m')+'</span></button>';
    }).join('')+'</div>';
    if(rest){
      h += '<div class="wohero rest"><small>'+esc(DAYN[sel])+'</small><h3>Rest day</h3><p>Recovery is part of training. Take an easy walk, stretch for 10 minutes and sleep well.</p></div>';
    } else {
      h += '<div class="wohero"><small>'+esc(DAYN[sel])+(sel===td?' · Today':'')+'</small><h3>'+esc(d.t)+'</h3><div class="wochips"><span><b>'+Math.round(exTotals(planExItems(sel)).min)+'</b> min</span><span><b>~'+Math.round(exTotals(planExItems(sel)).kcal)+'</b> kcal</span><span><b>'+nEx+'</b> exercise'+(nEx===1?'':'s')+'</span></div></div>';
      var ad = exAdds(sel);
      h += '<div class="wolist">'+d.items.map(function(it){return exItem(it.id,it,false)}).join('');
      if(ad.length) h += '<p class="woadd">Added by you</p>'+ad.map(function(a){return exItem(a.it.id,a.it,false)}).join('');
      h += '</div>';
    }
    h += '<button type="button" class="woaddbtn" data-exadd="1"><span>+</span>Add exercise'+(sel===todayDow()?' to today':' to '+esc(DAYN[sel]))+'</button>';
    h += '<div class="wosum"><small>This week</small><div class="wostats"><div><b>'+wp.active+'</b><span>days</span></div><div><b>'+Math.round(wp.min/60*10)/10+' h</b><span>training</span></div><div><b>'+fmt(Math.round(wp.kcal))+'</b><span>kcal</span></div></div></div>';
    h += '<p class="foot wofoot">'+esc(LOCN[o.loc])+' · '+esc(LVN[o.level])+'. Warm up for 5 minutes first and stop if anything hurts.</p>';
    $('p-ex').innerHTML = h;
  }
  $('p-ex').addEventListener('click',function(ev){
    if(ev.target.closest('button[data-exadd]') && S){ var sd = (exSel===null ? todayDow() : exSel), pv = viewDow; viewDow = sd; openSheet('ex'); if(SH) SH.restore = pv; return; }
    var b = ev.target.closest('button[data-exd]'); if(!b || !S) return;
    var i = parseInt(b.getAttribute('data-exd'),10); exSel = (i===todayDow()) ? null : i;
    renderExercisePlan(extraTips);
  });

