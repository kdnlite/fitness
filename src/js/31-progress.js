  /* ==== KDN PROGRESS START ==== weight chart, body measurements, progress photos, weekly report */
  /* ---- weight chart ---- */
  function wRange(v){ if(v) wRange.v = v; return wRange.v || 'all'; }
  function wChart(list,sw,r){
    var rg = wRange(), tk = todayKey(), from = rg==='1m' ? kAddDays(tk,-31) : rg==='3m' ? kAddDays(tk,-92) : (S.startDate||tk);
    var pts = list.filter(function(e){ return e.k>=from; });
    if(rg==='all' && S.startDate && !(S.wlog||{})[S.startDate]) pts.unshift({k:S.startDate,kg:sw});
    var W = 320, H = 180, L = 34, R = 10, T = 14, B = 26;
    var d0 = dayNum(pts.length ? (pts[0].k<from?pts[0].k:from) : from), d1 = Math.max(dayNum(tk), pts.length ? dayNum(pts[pts.length-1].k) : 0), span = Math.max(7,d1-d0);
    var vals = pts.map(function(e){ return e.kg; }).concat([r.tw]); if(rg==='all') vals.push(sw);
    var lo = Math.floor(Math.min.apply(null,vals)-1), hi = Math.ceil(Math.max.apply(null,vals)+1); if(hi-lo<4){ hi += 2; lo -= 2; }
    function X(k){ return L+(dayNum(k)-d0)/span*(W-L-R); }
    function Y(v){ return T+(hi-v)/(hi-lo)*(H-T-B); }
    var g = '', step = Math.max(1,Math.round((hi-lo)/4));
    for(var v=lo; v<=hi; v+=step) g += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(v).toFixed(1)+'" y2="'+Y(v).toFixed(1)+'" class="wg"/><text x="'+(L-6)+'" y="'+(Y(v)+3).toFixed(1)+'" class="wt" text-anchor="end">'+v+'</text>';
    /* target line */
    g += '<line x1="'+L+'" x2="'+(W-R)+'" y1="'+Y(r.tw).toFixed(1)+'" y2="'+Y(r.tw).toFixed(1)+'" class="wtg"/><text x="'+(W-R)+'" y="'+(Y(r.tw)-4).toFixed(1)+'" class="wt gold" text-anchor="end">Target '+r1(r.tw)+'</text>';
    /* plan line */
    if(r.weeks>0 && S.startDate){ var ek = kAddDays(S.startDate,r.weeks*7), a = S.startDate<from?from:S.startDate, b2 = ek>kAddDays(d0Key(d0),span)?kAddDays(d0Key(d0),span):ek;
      if(b2>a) g += '<line x1="'+X(a).toFixed(1)+'" y1="'+Y(expectedAt(a,r)).toFixed(1)+'" x2="'+X(b2).toFixed(1)+'" y2="'+Y(expectedAt(b2,r)).toFixed(1)+'" class="wexp"/>'; }
    if(pts.length){
      var line = pts.map(function(e){ return X(e.k).toFixed(1)+','+Y(e.kg).toFixed(1); }).join(' ');
      if(pts.length>1) g += '<polygon points="'+X(pts[0].k).toFixed(1)+','+(H-B)+' '+line+' '+X(pts[pts.length-1].k).toFixed(1)+','+(H-B)+'" fill="url(#wgr)"/><polyline points="'+line+'" class="wln"/>';
      g += pts.map(function(e,i){ return '<circle cx="'+X(e.k).toFixed(1)+'" cy="'+Y(e.kg).toFixed(1)+'" r="'+(i===pts.length-1?5:3.2)+'" class="wdot'+(i===pts.length-1?' last':'')+'"><title>'+kNice(e.k)+': '+e.kg+' kg</title></circle>'; }).join('');
      var lp = pts[pts.length-1]; g += '<text x="'+Math.min(W-R-4,X(lp.k)).toFixed(1)+'" y="'+(Y(lp.kg)-10).toFixed(1)+'" class="wt dark" text-anchor="'+(X(lp.k)>W-60?'end':'middle')+'">'+lp.kg+' kg</text>';
    }
    g += '<text x="'+L+'" y="'+(H-8)+'" class="wt">'+kNice(d0Key(d0))+'</text><text x="'+(W-R)+'" y="'+(H-8)+'" class="wt" text-anchor="end">'+kNice(d0Key(d0+span))+'</text>';
    var chips = [['1m','1 month'],['3m','3 months'],['all','All']].map(function(c){ return '<button type="button" class="cb'+(rg===c[0]?' on':'')+'" data-pg2="rng" data-v="'+c[0]+'" aria-pressed="'+(rg===c[0])+'">'+c[1]+'</button>'; }).join('');
    var first = list.length ? list[0].kg : sw, last = list.length ? list[list.length-1].kg : sw, ch = r1(last-(S.startWeight>0?S.startWeight:first));
    var h = '<div class="wch"><div class="wch-h"><div><small>Weight</small><b>'+r1(last)+' kg</b><span class="'+(ch===0?'':(ch<0)===(r.tw<sw)?'good':'bad')+'">'+(ch>0?'+':'')+ch+' kg since you started</span></div><div class="cbs">'+chips+'</div></div>';
    h += '<svg viewBox="0 0 '+W+' '+H+'" role="img" aria-label="Your weight over time"><defs><linearGradient id="wgr" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#E9C05A" stop-opacity=".35"/><stop offset="1" stop-color="#E9C05A" stop-opacity="0"/></linearGradient></defs>'+g+'</svg>';
    h += '<div class="wch-l"><span><i class="ln"></i>You</span>'+(r.weeks>0?'<span><i class="dash"></i>Plan</span>':'')+'<span><i class="tg"></i>Target</span></div></div>';
    return h;
  }
  function d0Key(n){ var d = new Date(n*86400000); return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate()); }

  /* ---- body measurements ---- */
  function measParts(){ return [['waist','Waist'],['chest','Chest'],['hips','Hips'],['arm','Upper arm'],['thigh','Thigh'],['neck','Neck']]; }
  function measList(){ return Object.keys(S.meas||{}).sort().map(function(k){ return {k:k,v:S.meas[k]}; }); }
  function measCard(){
    var L = measList(), h = '<div class="pg-card"><div class="pg-h"><div><small>Body</small><h3>Measurements</h3></div><button type="button" class="hh-btn" data-pg2="meas">+ Add</button></div>';
    if(!L.length) return h+'<p class="hint">The scale does not show fat lost and muscle gained. Measure your waist and more once every 2 weeks, in the morning, with a soft tape.</p></div>';
    var first = L[0], last = L[L.length-1];
    h += '<div class="pg-ms">'+measParts().map(function(p){
      var a = null, b = null; L.forEach(function(e){ if(e.v[p[0]]>0){ if(a===null) a = e.v[p[0]]; b = e.v[p[0]]; } });
      if(b===null) return '';
      var d = r1(b-a), spark = '';
      var vs = L.filter(function(e){ return e.v[p[0]]>0; }).map(function(e){ return e.v[p[0]]; });
      if(vs.length>1){ var lo = Math.min.apply(null,vs), hi = Math.max.apply(null,vs), rg = Math.max(.5,hi-lo); spark = '<svg viewBox="0 0 60 20" aria-hidden="true"><polyline points="'+vs.map(function(v,i){ return (i/(vs.length-1)*58+1).toFixed(1)+','+(18-(v-lo)/rg*16).toFixed(1); }).join(' ')+'"/></svg>'; }
      return '<div class="pg-m"><small>'+p[1]+'</small><b>'+r1(b)+' cm</b><span class="'+(d<0?'dn':d>0?'up':'')+'">'+(L.length>1&&d!==0?(d>0?'+':'')+d+' cm':'—')+'</span>'+spark+'</div>';
    }).join('')+'</div>';
    h += '<p class="hint">Last measured '+kNice(last.k,{day:'numeric',month:'long'})+(L.length>1?' · compared with '+kNice(first.k,{day:'numeric',month:'short'}):'')+'. <button type="button" class="linkbtn" data-pg2="mhist">History</button></p>';
    return h+'</div>';
  }
  function measSheet(k){
    var v = (S.meas||{})[k] || {}, prev = measList().filter(function(e){ return e.k<k; }).pop();
    var h = '<label class="hs-l" for="ms-d">Date</label><input type="date" id="ms-d" class="sinp" value="'+k+'" max="'+todayKey()+'">';
    h += '<div class="pg-mf">'+measParts().map(function(p){ var ph = prev && prev.v[p[0]] ? 'Last '+prev.v[p[0]] : 'cm'; return '<label><span>'+p[1]+'</span><input type="number" inputmode="decimal" min="10" max="250" step="0.1" data-ms="'+p[0]+'" value="'+(v[p[0]]||'')+'" placeholder="'+ph+'"></label>'; }).join('')+'</div>';
    h += '<p class="hint">In cm. Waist: at the belly button, relaxed. Chest: at the nipples. Hips: widest point. Arm and thigh: widest point, same side every time.</p><p class="hs-err" id="ms-err" hidden></p>';
    kSheet('Measurements',h,((S.meas||{})[k]?'<button type="button" class="hh-btn ghost danger" data-k="msdel" data-v="'+k+'">Delete</button>':'')+'<button type="button" class="hh-gold wide" data-k="mssave">Save</button>');
  }
  function measHist(){
    var L = measList().reverse(), P = measParts();
    var h = '<div class="pg-ht"><table><thead><tr><th>Date</th>'+P.map(function(p){ return '<th>'+p[1].replace('Upper ','')+'</th>'; }).join('')+'</tr></thead><tbody>'+L.map(function(e){ return '<tr data-k="msedit" data-v="'+e.k+'"><td>'+kNice(e.k)+'</td>'+P.map(function(p){ return '<td>'+(e.v[p[0]]||'–')+'</td>'; }).join('')+'</tr>'; }).join('')+'</tbody></table></div><p class="hint">Tap a row to change it.</p>';
    kSheet('Measurement history',h,'<button type="button" class="hh-gold wide" data-k="close">Close</button>');
  }

  /* ---- progress photos: saved only on this device (IndexedDB) ---- */
  var pFormO = {v:null}, pCmpO = {v:null};
  var PDB = null;
  function pDB(){
    if(PDB) return PDB;
    PDB = new Promise(function(res,rej){ try{ var q = indexedDB.open('kdn-photos',1); q.onupgradeneeded = function(){ q.result.createObjectStore('p'); }; q.onsuccess = function(){ res(q.result); }; q.onerror = function(){ rej(q.error); }; }catch(e){ rej(e); } });
    return PDB;
  }
  function pPut(id,blob){ return pDB().then(function(db){ return new Promise(function(res,rej){ var t = db.transaction('p','readwrite'); t.objectStore('p').put(blob,id); t.oncomplete = res; t.onerror = function(){ rej(t.error); }; }); }); }
  function pGet(id){ return pDB().then(function(db){ return new Promise(function(res){ var q = db.transaction('p').objectStore('p').get(id); q.onsuccess = function(){ res(q.result||null); }; q.onerror = function(){ res(null); }; }); }); }
  function pDel(id){ return pDB().then(function(db){ return new Promise(function(res){ var t = db.transaction('p','readwrite'); t.objectStore('p').delete(id); t.oncomplete = res; t.onerror = res; }); }); }
  function pClearAll(){ PDB = null; try{ indexedDB.deleteDatabase('kdn-photos'); }catch(e){} }
  function pPoses(){ return [['front','Front'],['side','Side'],['back','Back']]; }
  function pList(){ return Object.keys(S.photos||{}).sort().filter(function(k){ return Object.keys(S.photos[k]).length; }); }
  function pU(){ return pU.m || (pU.m = {}); }
  function pFill(root){
    Array.prototype.forEach.call((root||document).querySelectorAll('img[data-ph]'),function(im){
      var id = im.getAttribute('data-ph');
      if(pU()[id]){ im.src = pU()[id]; return; }
      pGet(id).then(function(b){ if(!b) return; pU()[id] = URL.createObjectURL(b); im.src = pU()[id]; });
    });
  }
  function pShrink(file){
    return new Promise(function(res,rej){
      var u = URL.createObjectURL(file), im = new Image();
      im.onload = function(){
        var M = 1280, k = Math.min(1,M/Math.max(im.width,im.height)), c = document.createElement('canvas');
        c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
        c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u);
        c.toBlob(function(b){ b ? res(b) : rej(new Error('encode')); },'image/jpeg',.82);
      };
      im.onerror = function(){ URL.revokeObjectURL(u); rej(new Error('read')); };
      im.src = u;
    });
  }
  function photoCard(){
    var L = pList(), h = '<div class="pg-card"><div class="pg-h"><div><small>Body</small><h3>Progress photos</h3></div><button type="button" class="hh-btn" data-pg2="padd">+ Add</button></div>';
    if(!L.length) return h+'<p class="hint">Take a front and side photo every 2–4 weeks, same place, light and clothes. Photos stay only on this phone.</p></div>';
    var last = L[L.length-1];
    h += '<div class="pg-ph">'+L.slice(-6).reverse().map(function(k){ var P = S.photos[k], pose = P.front?'front':Object.keys(P)[0]; return '<button type="button" class="pg-pt" data-pg2="pview" data-v="'+k+'"><img data-ph="'+k+'|'+pose+'" alt="Progress photo, '+kNice(k)+'"><small>'+kNice(k)+'</small></button>'; }).join('')+'</div>';
    if(L.length>1) h += '<button type="button" class="hh-gold wide pg-cmp" data-pg2="pcmp">Compare first and latest</button>';
    return h+'<p class="hint">'+L.length+' date'+(L.length>1?'s':'')+' · last '+kNice(last,{day:'numeric',month:'long'})+'. Saved only on this phone.</p></div>';
  }
  function photoAddSheet(k){
    pFormO.v = {k:k||todayKey()};
    var have = (S.photos||{})[pFormO.v.k] || {};
    var h = '<label class="hs-l" for="ph-d">Date</label><input type="date" id="ph-d" class="sinp" value="'+pFormO.v.k+'" max="'+todayKey()+'">';
    h += '<div class="pg-pp">'+pPoses().map(function(p){ return '<div class="pg-pc"><b>'+p[1]+'</b>'+(have[p[0]]?'<img data-ph="'+pFormO.v.k+'|'+p[0]+'" alt="">':'<span class="pg-ph0">'+kIco('<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l2-3h4l2 3"/>')+'</span>')+'<label class="hh-btn">'+(have[p[0]]?'Replace':'Take or choose')+'<input type="file" accept="image/*" data-phf="'+p[0]+'" hidden></label>'+(have[p[0]]?'<button type="button" class="linkbtn" data-k="phdel" data-v="'+p[0]+'">Remove</button>':'')+'</div>'; }).join('')+'</div>';
    h += '<p class="hint">Stand straight, arms a little away from the body, full body in the frame. Photos stay only on this phone and are removed when you log out.</p>';
    kSheet('Progress photos',h,'<button type="button" class="hh-gold wide" data-k="close">Done</button>');
    pFill($('ksheet'));
  }
  function photoView(k){
    var P = (S.photos||{})[k] || {};
    var h = '<div class="pg-pv">'+pPoses().filter(function(p){ return P[p[0]]; }).map(function(p){ return '<figure><img data-ph="'+k+'|'+p[0]+'" alt="'+p[1]+'"><figcaption>'+p[1]+'</figcaption></figure>'; }).join('')+'</div>';
    var w = (S.wlog||{})[k]; if(w) h += '<p class="hint">Weight that day: <b>'+w+' kg</b></p>';
    kSheet(kNice(k,{day:'numeric',month:'long',year:'numeric'}),h,'<button type="button" class="hh-btn ghost" data-k="phedit" data-v="'+k+'">Change</button><button type="button" class="hh-gold wide" data-k="close">Close</button>');
    pFill($('ksheet'));
  }
  function photoCmp(){
    var L = pList(); if(L.length<2) return;
    if(!pCmpO.v) pCmpO.v = {a:L[0],b:L[L.length-1],pose:'front'};
    var poses = pPoses().filter(function(p){ return (S.photos[pCmpO.v.a]||{})[p[0]] && (S.photos[pCmpO.v.b]||{})[p[0]]; });
    if(!poses.some(function(p){ return p[0]===pCmpO.v.pose; }) && poses.length) pCmpO.v.pose = poses[0][0];
    var opt = function(sel){ return L.map(function(k){ return '<option value="'+k+'"'+(k===sel?' selected':'')+'>'+kNice(k,{day:'numeric',month:'short',year:'numeric'})+'</option>'; }).join(''); };
    var h = '<div class="hs-two"><div><label class="hs-l" for="pc-a">Before</label><select id="pc-a" class="sel" data-pc="a">'+opt(pCmpO.v.a)+'</select></div><div><label class="hs-l" for="pc-b">After</label><select id="pc-b" class="sel" data-pc="b">'+opt(pCmpO.v.b)+'</select></div></div>';
    if(poses.length>1) h += '<div class="cbs">'+poses.map(function(p){ return '<button type="button" class="cb'+(pCmpO.v.pose===p[0]?' on':'')+'" data-k="pcpose" data-v="'+p[0]+'">'+p[1]+'</button>'; }).join('')+'</div>';
    if(!poses.length) h += '<p class="hint">These two dates have no photo of the same pose.</p>';
    else {
      h += '<div class="pg-sl" id="pg-sl"><img data-ph="'+pCmpO.v.b+'|'+pCmpO.v.pose+'" alt="After"><div class="pg-slb" style="width:50%"><img data-ph="'+pCmpO.v.a+'|'+pCmpO.v.pose+'" alt="Before"></div><span class="pg-sll" style="left:50%"></span><small class="a">'+kNice(pCmpO.v.a)+'</small><small class="b">'+kNice(pCmpO.v.b)+'</small></div>';
      h += '<input type="range" min="0" max="100" value="50" id="pg-slr" aria-label="Slide between before and after">';
      var wa = (S.wlog||{})[pCmpO.v.a], wb = (S.wlog||{})[pCmpO.v.b], days = dayNum(pCmpO.v.b)-dayNum(pCmpO.v.a);
      h += '<p class="hint">'+days+' days apart'+(wa&&wb?' · '+wa+' kg → '+wb+' kg ('+(wb-wa>0?'+':'')+r1(wb-wa)+' kg)':'')+'.</p>';
    }
    if($('ksheet').hidden || $('ks-t').textContent!=='Before and after') kSheet('Before and after',h,'<button type="button" class="hh-gold wide" data-k="close">Close</button>'); else kSheetBody(h);
    pFill($('ksheet')); pSlFit();
  }
  function pSlFit(){ var el = $('pg-sl'); if(!el) return; var w = el.clientWidth; Array.prototype.forEach.call(el.querySelectorAll('.pg-slb img'),function(im){ im.style.width = w+'px'; }); }
  function pgExtra(){ return measCard()+photoCard(); }
  function pgAfter(){ pFill($('p-prog')); }

  /* ---- weekly report ---- */
  function wrRange(){ var t = todayKey(), end = kAddDays(t,-1); return {a:kAddDays(end,-6), b:end, pa:kAddDays(end,-13), pb:kAddDays(end,-7)}; }
  function wrStats(a,b){
    var o = {st:0,days:0,wo:0,plan:0,wa:0,act:0,sc:0,best:null}, k = a;
    while(k<=b){
      var lg = (S.log||{})[k]||{}, sc = dayScore(k);
      o.st += lg.st||0; o.days++; if(lg.wo) o.wo++; if(!sc.rest) o.plan++; o.wa += lg.wa||0; if(sc.total>=60) o.act++; o.sc += sc.total;
      if((lg.st||0)>0 && (!o.best || lg.st>o.best.st)) o.best = {k:k,st:lg.st};
      k = kAddDays(k,1);
    }
    var ws = Object.keys(S.wlog||{}).sort().filter(function(x){ return x<=b; }), inW = ws.filter(function(x){ return x>=a; });
    o.w1 = inW.length ? S.wlog[inW[inW.length-1]] : null;
    var before = ws.filter(function(x){ return x<a; }); o.w0 = before.length ? S.wlog[before[before.length-1]] : (inW.length>1 ? S.wlog[inW[0]] : null);
    o.avgSt = Math.round(o.st/o.days); o.avgWa = r1(o.wa/o.days); o.avgSc = Math.round(o.sc/o.days);
    return o;
  }
  function wrNew(){ var d = new Date().getDay(); return (d===0||d===1) && engOf().wrSeen!==wrRange().b; }
  function wrCardBtn(){ return '<button type="button" data-w="open">'+kIco('<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 15v-3M12 15V9M16 15v-5"/>')+'Weekly report'+(wrNew()?' <em>New</em>':'')+'</button>'; }
  function wrSheet(){
    var R = wrRange(), c = wrStats(R.a,R.b), p = wrStats(R.pa,R.pb), g = stepGoal(), wg = waterGoal();
    var E = engOf(); E.wrSeen = R.b; lsSet(S);
    function cmp(x,y,unit,lowerBetter){ if(!y && y!==0) return ''; var d = x-y; if(!d) return '<em class="eq">same as last week</em>'; var good = lowerBetter ? d<0 : d>0; return '<em class="'+(good?'up':'dn')+'">'+(d>0?'+':'')+fmt(Math.round(d*10)/10)+(unit||'')+' vs last week</em>'; }
    var h = '<div class="wr-hero"><small>'+kNice(R.a,{day:'numeric',month:'short'})+' – '+kNice(R.b,{day:'numeric',month:'short'})+'</small><b>'+c.avgSc+'</b><span>average daily score</span>'+cmp(c.avgSc,p.days?p.avgSc:null)+'</div>';
    h += '<div class="wr-g">';
    h += '<div><small>Steps a day</small><b>'+fmt(c.avgSt)+'</b>'+cmp(c.avgSt,p.avgSt)+'<span>goal '+fmt(g)+'</span></div>';
    h += '<div><small>Workouts</small><b>'+c.wo+(c.plan?' / '+c.plan:'')+'</b>'+cmp(c.wo,p.wo)+'<span>'+(c.plan?'planned this week':'no workouts planned')+'</span></div>';
    h += '<div><small>Water a day</small><b>'+c.avgWa+'</b>'+cmp(c.avgWa,p.avgWa,' glasses')+'<span>goal '+wg+' glasses</span></div>';
    h += '<div><small>Active days</small><b>'+c.act+' / 7</b>'+cmp(c.act,p.act)+'<span>score 60 or more</span></div>';
    h += '</div>';
    if(c.w1!==null && c.w0!==null){ var dw = r1(c.w1-c.w0), want = curR && curR.tw<S.weight ? -1 : curR && curR.tw>S.weight ? 1 : 0; h += '<div class="wr-w"><small>Weight</small><b>'+c.w1+' kg</b><span class="'+(dw===0?'':(dw*want>0?'good':'bad'))+'">'+(dw>0?'+':'')+dw+' kg this week</span></div>'; }
    else h += '<p class="hint">Log your weight once a week to see it in this report.</p>';
    if(c.best) h += '<p class="wr-best">Best day: <b>'+kNice(c.best.k,{weekday:'long'})+'</b> with '+fmt(c.best.st)+' steps.</p>';
    var tip = c.act>=6 ? 'Excellent week. Keep the same rhythm and add a little more weight or reps in your workouts.' : c.avgSt<g*0.6 ? 'Steps were low. Try a 15-minute walk after lunch and after dinner every day.' : c.plan && c.wo<c.plan ? 'You missed '+(c.plan-c.wo)+' workout'+(c.plan-c.wo>1?'s':'')+'. Set a workout reminder for a time you are always free.' : c.avgWa<wg*0.7 ? 'Drink more water: keep a bottle with you and turn on water reminders.' : 'Good week. Aim for one more active day next week.';
    h += '<div class="wr-tip"><b>Next week</b><span>'+esc(tip)+'</span></div>';
    kSheet('Weekly report',h,'<button type="button" class="hh-btn ghost" data-k="wrshare">Share</button><button type="button" class="hh-gold wide" data-k="close">Close</button>');
    renderHome();
    wrSheet.c = c; wrSheet.R = R;
  }
  function wrImage(){
    var c = wrSheet.c, R = wrSheet.R, W = 1080, H = 1350, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    var x = cv.getContext('2d'), g = x.createLinearGradient(0,0,W,H); g.addColorStop(0,'#1A2440'); g.addColorStop(1,'#07101E'); x.fillStyle = g; x.fillRect(0,0,W,H);
    var D = 'bold 64px Georgia, serif', F = '36px system-ui, sans-serif';
    x.fillStyle = '#E9C05A'; x.font = '600 30px ui-monospace, monospace'; x.fillText('KDN FITNESS · WEEKLY REPORT',80,130);
    x.fillStyle = '#AEB8CC'; x.font = F; x.fillText(kNice(R.a,{day:'numeric',month:'short'})+' – '+kNice(R.b,{day:'numeric',month:'short',year:'numeric'}),80,190);
    x.fillStyle = '#fff'; x.font = 'bold 72px Georgia, serif'; x.fillText(String(S.name||'').slice(0,22),80,300);
    x.fillStyle = '#F2D58A'; x.font = 'bold 220px Georgia, serif'; x.fillText(String(c.avgSc),80,560); x.fillStyle = '#AEB8CC'; x.font = F; x.fillText('average daily score',86,620);
    var items = [['Steps a day',fmt(c.avgSt)],['Workouts',c.wo+(c.plan?' / '+c.plan:'')],['Water a day',c.avgWa+' glasses'],['Active days',c.act+' / 7']];
    items.forEach(function(it,i){ var cx = 80+(i%2)*470, cy = 720+Math.floor(i/2)*230; x.fillStyle = 'rgba(255,255,255,.07)'; x.fillRect(cx,cy,440,200); x.fillStyle = '#E9CF9C'; x.font = '30px system-ui, sans-serif'; x.fillText(it[0],cx+30,cy+60); x.fillStyle = '#fff'; x.font = D; x.fillText(it[1],cx+30,cy+150); });
    x.fillStyle = '#E9C05A'; x.fillRect(80,1200,920,4); x.fillStyle = '#AEB8CC'; x.font = '30px system-ui, sans-serif'; x.fillText('kdnfitness.com',80,1270);
    return new Promise(function(res){ cv.toBlob(res,'image/png'); });
  }
  function wrShare(){
    wrImage().then(function(blob){
      if(!blob){ toast('Could not make the image.'); return; }
      var fn = 'kdn-weekly-report-'+wrSheet.R.b+'.png';
      if(NATIVE){ nShareFiles([{blob:blob,name:fn}],'My KDN weekly report'); return; }
      try{ var f = new File([blob],fn,{type:'image/png'}); if(navigator.canShare && navigator.canShare({files:[f]})){ navigator.share({files:[f],title:'My KDN weekly report'}).catch(function(){}); return; } }catch(e){}
      gSaveFile(blob,fn);
    });
  }

  /* ---- events ---- */
  $('p-prog').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-pg2]'); if(!b || !S) return;
    var a = b.getAttribute('data-pg2'); buzz();
    if(a==='rng'){ wRange(b.getAttribute('data-v')); renderProgress(); }
    else if(a==='meas') measSheet(todayKey());
    else if(a==='mhist') measHist();
    else if(a==='padd') photoAddSheet(todayKey());
    else if(a==='pview') photoView(b.getAttribute('data-v'));
    else if(a==='pcmp'){ pCmpO.v = null; photoCmp(); }
  });
  document.addEventListener('click',function(ev){ var b = ev.target.closest && ev.target.closest('[data-w]'); if(!b || !S) return; buzz(); wrSheet(); });
  function kSheetClick(a,b,ev){
    if(a==='mssave'){
      var k = $('ms-d').value || todayKey(), o = {}, n = 0, bad = false;
      Array.prototype.forEach.call(document.querySelectorAll('#ksheet [data-ms]'),function(i){ var v = parseFloat(i.value); if(i.value!==''){ if(!(v>=10 && v<=250)) bad = true; else { o[i.getAttribute('data-ms')] = Math.round(v*10)/10; n++; } } });
      var e = $('ms-err');
      if(k>todayKey()){ e.textContent = 'Choose today or an earlier date.'; e.hidden = false; return; }
      if(bad){ e.textContent = 'Each measurement should be between 10 and 250 cm.'; e.hidden = false; return; }
      if(!n){ e.textContent = 'Enter at least one measurement.'; e.hidden = false; return; }
      S.meas = S.meas || {}; S.meas[k] = o; lsSet(S); kClose(); snd('ok'); buzz('ok'); toast('Measurements saved.'); renderProgress(); return;
    }
    if(a==='msdel'){ delete S.meas[b.getAttribute('data-v')]; lsSet(S); kClose(); toast('Deleted.'); renderProgress(); return; }
    if(a==='msedit'){ measSheet(b.getAttribute('data-v')); return; }
    if(a==='phdel'){ var p = b.getAttribute('data-v'), k2 = pFormO.v.k; pDel(k2+'|'+p).then(function(){ delete pU()[k2+'|'+p]; if(S.photos && S.photos[k2]){ delete S.photos[k2][p]; if(!Object.keys(S.photos[k2]).length) delete S.photos[k2]; } lsSet(S); photoAddSheet(k2); renderProgress(); }); return; }
    if(a==='phedit'){ photoAddSheet(b.getAttribute('data-v')); return; }
    if(a==='pcpose'){ pCmpO.v.pose = b.getAttribute('data-v'); photoCmp(); return; }
    if(a==='wrshare'){ wrShare(); return; }
    if(typeof kSheetClick2==='function') kSheetClick2(a,b,ev);
  }
  function kSheetChange(ev){
    var t = ev.target;
    if(t.id==='ph-d' && pFormO.v){ var k = t.value; if(k && k<=todayKey()) photoAddSheet(k); return; }
    var f = t.getAttribute && t.getAttribute('data-phf');
    if(f && t.files && t.files[0] && pFormO.v){
      var k3 = pFormO.v.k, id = k3+'|'+f; toast('Saving photo…');
      pShrink(t.files[0]).then(function(blob){ return pPut(id,blob).then(function(){ if(pU()[id]){ URL.revokeObjectURL(pU()[id]); delete pU()[id]; } S.photos = S.photos || {}; (S.photos[k3] = S.photos[k3]||{})[f] = 1; lsSet(S); snd('ok'); buzz('ok'); toast('Photo saved on this phone.'); photoAddSheet(k3); renderProgress(); }); })
        .catch(function(){ toast('Could not read this photo. Try another one.'); });
      return;
    }
    var pc = t.getAttribute && t.getAttribute('data-pc'); if(pc){ pCmpO.v[pc] = t.value; photoCmp(); return; }
    if(typeof kSheetChange2==='function') kSheetChange2(ev);
  }
  function kSheetInput(ev){
    if(ev.target.id==='pg-slr'){ var v = ev.target.value, el = $('pg-sl'); if(!el) return; el.querySelector('.pg-slb').style.width = v+'%'; el.querySelector('.pg-sll').style.left = v+'%'; return; }
    if(typeof kSheetInput2==='function') kSheetInput2(ev);
  }
  window.addEventListener('resize',pSlFit);
  /* ==== KDN PROGRESS END ==== */
