  /* ---------- Gym manager, part 2: home, attendance, money, renewals, plans, equipment, leads ---------- */
  var GCAT = ['Rent','Electricity','Equipment','Maintenance','Salary (other)','Marketing','Other'];
  function gMig(){
    zMig();
    if(!G.invoices) G.invoices = []; if(!G.billSeq) G.billSeq = G.invoices.length;
    if(!G.att) G.att = {}; if(!G.exp) G.exp = []; if(!G.offers) G.offers = []; if(!G.leads) G.leads = []; if(!G.equip) G.equip = []; if(!G.arch) G.arch = [];
    if(!G.plans || !G.plans.length) G.plans = GPLANS.map(function(p){ return {id:p[0],name:p[1],months:p[2],price:0}; });
    var cut = gK(new Date(gToday().getTime()-400*86400000)); Object.keys(G.att).forEach(function(k){ if(k<cut) delete G.att[k]; });
  }
  function gAddD(s,n){ var d = gD(s); d.setDate(d.getDate()+n); return gK(d); }
  function gNow(){ var d = new Date(); return pad(d.getHours())+':'+pad(d.getMinutes()); }
  function gT12(t){ var a = t.split(':'), h = +a[0]; return ((h+11)%12+1)+':'+a[1]+' '+(h<12?'AM':'PM'); }
  function gArch(k,e){ (e.paid||[]).forEach(function(p){ G.arch.push({d:p.d,amt:p.amt,k:k==='members'?'m':'s'}); }); if(k==='trainers') G.members.forEach(function(m){ if(m.trainer===e.id) m.trainer = ''; }); }
  function gSub(title,back){ return '<div class="gsubh"><button type="button" class="giconb" data-g="tab" data-t="'+(back||'more')+'" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><h3>'+title+'</h3></div>'; }
  function gMonthLbl(mk){ return new Date(+mk.slice(0,4),+mk.slice(5,7)-1,1).toLocaleDateString('en-IN',{month:'long',year:'numeric'}); }
  function gMonthAdd(mk,n){ var d = new Date(+mk.slice(0,4),+mk.slice(5,7)-1+n,1); return d.getFullYear()+'-'+pad(d.getMonth()+1); }
  function gMk(){ return gK(gToday()).slice(0,7); }
  function gTelA(m,label){ return m ? '<a class="gbtn ghost sm" href="tel:'+gTel(m)+'">'+(label||'Call')+'</a>' : ''; }

  /* --- money --- */
  function gSumPaid(list,mk){ var t = 0; list.forEach(function(e){ (e.paid||[]).forEach(function(p){ if(p.d.slice(0,7)===mk) t += p.amt; }); }); return t; }
  function gFin(mk){
    var col = gSumPaid(G.members,mk), sal = gSumPaid(G.trainers,mk)+gSumPaid(G.employees,mk), ex = 0, cats = {};
    G.arch.forEach(function(a){ if(a.d.slice(0,7)===mk){ if(a.k==='m') col += a.amt; else sal += a.amt; } });
    G.exp.forEach(function(x){ if(x.d.slice(0,7)===mk){ ex += x.amt; cats[x.cat] = (cats[x.cat]||0)+x.amt; } });
    col += zIncSum(mk);
    return {col:col,sal:sal,exp:ex,out:sal+ex,profit:col-sal-ex,cats:cats};
  }
  function gToCollect(mk){
    var end = gK(new Date(+mk.slice(0,4),+mk.slice(5,7),0)), t = 0, n = 0;
    G.members.forEach(function(m){ if(!m.freeze && m.fee>0 && gOk(m.next) && m.next<=end){ t += m.fee; n++; } });
    return {amt:t,n:n};
  }
  function gMoneyChart(mk){
    var ms = [], i, mx = 1; for(i=5;i>=0;i--) ms.push(gMonthAdd(mk,-i));
    var data = ms.map(function(m){ var f = gFin(m); mx = Math.max(mx,f.col,f.out); return {m:m,f:f}; });
    var bars = data.map(function(d,ix){
      var x = ix*50+8, h1 = Math.round(d.f.col/mx*84), h2 = Math.round(d.f.out/mx*84);
      var lbl = new Date(+d.m.slice(0,4),+d.m.slice(5,7)-1,1).toLocaleDateString('en-IN',{month:'short'});
      return '<rect x="'+x+'" y="'+(92-h1)+'" width="17" height="'+h1+'" rx="3" fill="#E9C05A"><title>'+lbl+' collected '+gMoney(d.f.col)+'</title></rect><rect x="'+(x+19)+'" y="'+(92-h2)+'" width="17" height="'+h2+'" rx="3" fill="#C9705F"><title>'+lbl+' spent '+gMoney(d.f.out)+'</title></rect><text x="'+(x+18)+'" y="108" text-anchor="middle" font-size="9" fill="#A89868">'+lbl+'</text>';
    }).join('');
    return '<svg viewBox="0 0 300 114" class="gchart" role="img" aria-label="Collected and spent in the last 6 months"><line x1="0" x2="300" y1="92" y2="92" stroke="#3A3118"/>'+bars+'</svg><div class="glegend"><span><i style="background:#E9C05A"></i>Collected</span><span><i style="background:#C9705F"></i>Spent</span></div>';
  }
  function gMoneyHtml(){
    var ms = gS.tab==='bills' ? 'bills' : (gS.x.ms||'sum'), h = '<div class="gseg" role="tablist">'+[['sum','Summary'],['bills','Bills'],['exp','Expenses']].map(function(t){ return '<button type="button" role="tab" aria-selected="'+(ms===t[0])+'" class="'+(ms===t[0]?'on':'')+'" data-g="x-ms" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>';
    if(ms==='bills') return h+gBillsListHtml();
    var mk = gS.x.mk || gMk(), cur = (mk===gMk());
    h += '<div class="gmon"><button type="button" class="giconb" data-g="x-mon" data-v="-1" aria-label="Previous month"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>'+gMonthLbl(mk)+'</b><button type="button" class="giconb" data-g="x-mon" data-v="1" aria-label="Next month"'+(cur?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    if(ms==='exp'){
      var list = G.exp.filter(function(x){ return x.d.slice(0,7)===mk; }).sort(function(a,b){ return a.d<b.d?1:-1; }), tot = 0; list.forEach(function(x){ tot += x.amt; });
      h += '<button type="button" class="gbtn gold wide" data-g="x-new" data-p="exp-form">+ Add expense</button><p class="gsum">'+list.length+' expense'+(list.length===1?'':'s')+' · '+gMoney(tot)+'</p>';
      if(!list.length) return h+'<div class="gempty"><b>No expenses</b><span>Add rent, electricity, equipment and other costs to see your real profit.</span></div>';
      return h+'<div class="gsheet">'+list.map(function(x){ return '<button type="button" class="grow2" data-g="x-open" data-p="exp-form" data-id="'+x.id+'"><span class="gn"><b>'+esc(x.cat)+'</b><small>'+esc(gFmt(x.d)+(x.note?' · '+x.note:''))+'</small></span><span class="gr"><b>'+gMoney(x.amt)+'</b></span></button>'; }).join('')+'</div>';
    }
    var f = gFin(mk);
    h += '<div class="gcard dark gprofit '+(f.profit<0?'neg':'')+'"><small>Profit</small><h3>'+(f.profit<0?'−':'')+gMoney(Math.abs(f.profit))+'</h3><p>All income minus salaries and expenses</p></div>';
    h += '<div class="gstats three">'+gStat(gMoney(f.col),'Income collected')+gStat(gMoney(f.sal),'Salaries paid')+gStat(gMoney(f.exp),'Other expenses')+'</div>';
    if(cur){ var tc = gToCollect(mk); h += '<div class="gcard dark"><div class="gdr"><span>Still to collect this month</span><b>'+gMoney(tc.amt)+'</b></div><p class="ghint">'+tc.n+' member'+(tc.n===1?'':'s')+' with a fee date up to the end of this month, including overdue ones.</p></div>'; }
    h += '<div class="gcard dark"><h4>Last 6 months</h4>'+gMoneyChart(mk)+'</div>';
    var ck = Object.keys(f.cats).sort(function(a,b){ return f.cats[b]-f.cats[a]; });
    if(f.sal || ck.length) h += '<div class="gcard dark"><h4>Where the money went</h4>'+(f.sal?gRow('Staff salaries',gMoney(f.sal)):'')+ck.map(function(c){ return gRow(esc(c),gMoney(f.cats[c])); }).join('')+'</div>';
    return h;
  }

  /* --- attendance --- */
  function gVisitMap(){ var last = {}, month = {}, mk = gMk(); Object.keys(G.att).sort().forEach(function(d){ G.att[d].forEach(function(r){ last[r[0]] = d; if(d.slice(0,7)===mk) month[r[0]] = (month[r[0]]||0)+1; }); }); return {last:last,month:month}; }
  function gCheckState(e){
    if(e.freeze) return 'Membership is frozen';
    if(gOk(e.next) && e.fee>0){ var d = gDue(e.next); if(d.dd<0) return 'Fee '+d.txt.toLowerCase(); }
    return '';
  }
  function gAttRes(){
    var q = (gS.x.aq||'').trim().toLowerCase(), today = gK(gToday()), done = {}; (G.att[today]||[]).forEach(function(r){ done[r[0]] = r[1]; });
    if(!q) return '<p class="ghint">Type the member number, name or mobile.</p>';
    var all = G.members.filter(function(e){ return String(e.no)===q || (e.name+' '+(e.mobile||'')+' '+e.no).toLowerCase().indexOf(q)>=0; });
    all.sort(function(a,b){ return (String(a.no)===q?0:1)-(String(b.no)===q?0:1) || a.no-b.no; });
    if(!all.length) return '<div class="gempty"><b>No member found</b><span>Check the number or name.</span></div>';
    return '<div class="gsheet">'+all.slice(0,6).map(function(e){
      var st = gCheckState(e);
      return '<button type="button" class="grow2" data-g="x-ci" data-id="'+e.id+'"><span class="gno">'+e.no+'</span>'+gAvatar(e,'sm')+'<span class="gn"><b>'+esc(e.name)+'</b><small>'+(st?esc(st):esc(gPlanName(e.plan)))+'</small></span><span class="gr">'+(done[e.id]?'<i class="gchip ok">In at '+gT12(done[e.id])+'</i>':'<i class="gchip soon">Check in</i>')+'</span></button>';
    }).join('')+'</div>';
  }
  function gCheckin(id){
    var e = gFind('members',id); if(!e) return;
    var today = gK(gToday()); if(!G.att[today]) G.att[today] = [];
    var ex = G.att[today].filter(function(r){ return r[0]===id; })[0];
    if(ex){ toast(e.name+' already checked in at '+gT12(ex[1])+'.'); return; }
    G.att[today].push([id,gNow()]); gSave(); gS.x.aq = '';
    var st = gCheckState(e); gRender(); var q = $('xa-q'); if(q) q.focus();
    toast(e.name+' checked in.'+(st?' Note: '+st+'.':''));
  }
  function gAttHtml(){
    var today = gK(gToday()), list = (G.att[today]||[]).slice().reverse(), vm = gVisitMap();
    var h = gSub('Attendance')+'<div class="gcard dark"><label class="gl" for="xa-q">Check in a member</label><label class="gsearch big"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><input id="xa-q" type="search" inputmode="search" placeholder="Number, name or mobile" value="'+esc(gS.x.aq||'')+'" autocomplete="off" aria-label="Find member"></label><div id="xa-res">'+gAttRes()+'</div></div>';
    h += '<div class="gcard dark"><h4>Today · '+list.length+' check-in'+(list.length===1?'':'s')+'</h4>';
    if(!list.length) h += '<p class="ghint">No one has checked in yet today.</p>';
    else h += list.slice(0,60).map(function(r){ var e = gFind('members',r[0]); return '<div class="grh gat">'+(e?gAvatar(e,'sm'):'<span class="gav sm">?</span>')+'<div class="gn"><b>'+esc(e?e.name:'(deleted member)')+'</b><small>'+(e?'No. '+e.no:'')+'</small></div><span class="gr"><b>'+gT12(r[1])+'</b></span><button type="button" class="giconb sm" data-g="x-ciundo" data-id="'+r[0]+'" aria-label="Remove this check-in"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'; }).join('');
    h += '</div>';
    /* peak hours, last 30 days */
    var hrs = {}, mxh = 0, from = gK(new Date(gToday().getTime()-30*86400000)), total = 0, hi;
    Object.keys(G.att).forEach(function(d){ if(d>=from) G.att[d].forEach(function(r){ var hh = +r[1].slice(0,2); hrs[hh] = (hrs[hh]||0)+1; total++; }); });
    for(hi=0;hi<24;hi++) mxh = Math.max(mxh,hrs[hi]||0);
    if(total){
      var bars = '', top = 0; for(hi=5;hi<=22;hi++){ var c = hrs[hi]||0, bh = Math.round(c/mxh*60); if(c===mxh && !top) top = hi; bars += '<rect x="'+((hi-5)*16+4)+'" y="'+(66-bh)+'" width="11" height="'+Math.max(bh,c?2:0)+'" rx="2" fill="'+(c===mxh?'#E9C05A':'#6B5A26')+'"><title>'+gT12(pad(hi)+':00')+': '+c+' check-ins</title></rect>'+((hi-5)%3===0?'<text x="'+((hi-5)*16+9)+'" y="78" text-anchor="middle" font-size="8" fill="#A89868">'+((hi+11)%12+1)+(hi<12?'a':'p')+'</text>':''); }
      h += '<div class="gcard dark"><h4>Busiest time</h4><p class="ghint">Last 30 days. Busiest around <b>'+gT12(pad(top)+':00')+'</b>.</p><svg viewBox="0 0 292 82" class="gchart" role="img" aria-label="Check-ins by hour">'+bars+'</svg></div>';
    }
    var reg = G.members.map(function(e){ return {e:e,n:vm.month[e.id]||0}; }).filter(function(x){ return x.n>0; }).sort(function(a,b){ return b.n-a.n; }).slice(0,5);
    if(reg.length) h += '<div class="gcard dark"><h4>Most regular this month</h4>'+reg.map(function(x,i){ return '<div class="gdr"><span>'+(i+1)+'. '+esc(x.e.name)+'</span><b>'+x.n+' visit'+(x.n===1?'':'s')+'</b></div>'; }).join('')+'</div>';
    return h;
  }

  /* --- renewals and members who stopped coming --- */
  function gAway(){
    var vm = gVisitMap(), t = gToday(), out = [];
    G.members.forEach(function(e){
      if(e.freeze || !gOk(e.join)) return;
      var since = gDiff(t,gD(e.join)); if(since<7) return;
      var last = vm.last[e.id], gap = last ? gDiff(t,gD(last)) : since;
      if(gap>=7) out.push({e:e,gap:gap,never:!last});
    });
    return out.sort(function(a,b){ return b.gap-a.gap; });
  }
  function gRenHtml(){
    var seg = gS.x.rs || 'exp', t = gToday(), exp = [], soon = [];
    G.members.forEach(function(e){ if(e.freeze || !(e.fee>0) || !gOk(e.next)) return; var d = gDue(e.next); if(d.dd<0) exp.push({e:e,d:d}); else if(d.dd<=7) soon.push({e:e,d:d}); });
    exp.sort(function(a,b){ return a.d.dd-b.d.dd; }); soon.sort(function(a,b){ return a.d.dd-b.d.dd; });
    var away = gAway();
    var h = gSub('Renewals and follow-up')+'<div class="gseg" role="tablist">'+[['exp','Expired ('+exp.length+')'],['soon','Next 7 days ('+soon.length+')'],['away','Not coming ('+away.length+')']].map(function(x){ return '<button type="button" role="tab" aria-selected="'+(seg===x[0])+'" class="'+(seg===x[0]?'on':'')+'" data-g="x-rs" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>';
    if(seg==='away'){
      h += '<p class="ghint">Members who have not checked in for 7 days or more. A friendly message often brings them back.</p>';
      if(!away.length) return h+'<div class="gempty"><b>Everyone is coming</b><span>Check-ins are recorded on the Attendance page.</span></div>';
      return h+away.slice(0,100).map(function(x){ var e = x.e, msg = 'Hello '+e.name+', we have not seen you at '+G.gym.name+(x.never?' yet':' for '+x.gap+' days')+'. We hope you are well. Come back soon, we would love to see you!';
        return '<div class="grem soon"><div class="grh">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>Member no. '+e.no+'</small></div><div class="gr"><i class="gchip soon">'+(x.never?'Never came':x.gap+' days')+'</i></div></div><div class="gra">'+gTelA(e.mobile)+(e.mobile?'<a class="gbtn ghost sm" href="'+gWa(e.mobile,msg)+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn ghost sm" data-g="open" data-k="members" data-id="'+e.id+'">Open</button></div></div>'; }).join('');
    }
    var list = seg==='exp' ? exp : soon;
    if(!list.length) return h+'<div class="gempty"><b>'+(seg==='exp'?'No expired memberships':'Nothing in the next 7 days')+'</b><span>Fees appear here from the date they are due.</span></div>';
    return h+list.slice(0,100).map(function(x){ var e = x.e, msg = 'Hello '+e.name+', your '+G.gym.name+' membership fee of '+gMoney(e.fee)+' '+(x.d.dd<0?'was due on ':'is due on ')+gFmt(e.next)+'. Please renew at the earliest. Thank you.';
      return '<div class="grem '+x.d.cls+'"><div class="grh">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>No. '+e.no+' · '+esc(gPlanName(e.plan))+'</small></div><div class="gr"><b>'+gMoney(e.fee)+'</b><i class="gchip '+x.d.cls+'">'+x.d.txt+'</i></div></div><div class="gra">'+gTelA(e.mobile)+(e.mobile?'<a class="gbtn ghost sm" href="'+gWa(e.mobile,msg)+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn gold sm" data-g="x-renew" data-id="'+e.id+'">Renew + bill</button></div></div>'; }).join('');
  }
  function gRenew(id){
    var e = gFind('members',id); if(!e) return;
    var today = gK(gToday()); if(!e.paid) e.paid = [];
    e.paid.push({d:today,amt:e.fee,f:e.next});
    var base = gOk(e.next) && gD(e.next)>=gToday() ? e.next : today; e.next = gAddM(base,gDur(e.plan));
    var inv = bCreate('members',e,'Membership fee · '+gPlanName(e.plan)+' plan',e.fee,today,'paid');
    gSave(); gS.del = false; gS.ov = {type:'inv',id:inv.id}; gRender(); toast('Renewed until '+gFmt(e.next)+'. Bill '+inv.no+' created.');
  }

  /* --- plans and offers --- */
  function gOfferOn(o){ return !!o.on && (!o.till || o.till>=gK(gToday())); }
  function gOfferTxt(o){ return o.type==='pct' ? o.val+'% off' : gMoney(o.val)+' off'; }
  function gOfferFee(price,o){ var d = o ? (o.type==='pct' ? price*o.val/100 : o.val) : 0; return Math.max(1,Math.round(price-d)); }
  function gPlansHtml(){
    var h = gSub('Plans and offers')+'<div class="ghead2"><h3>Membership plans</h3><p>Set the price once. When you add a member and pick a plan, the fee and the next fee date fill in by themselves.</p></div>';
    h += '<div class="gsheet">'+gPlansList().map(function(p){ return '<button type="button" class="grow2" data-g="x-open" data-p="plan-form" data-id="'+p.id+'"><span class="gn"><b>'+esc(p.name)+'</b><small>'+p.months+' month'+(p.months===1?'':'s')+'</small></span><span class="gr"><b>'+(p.price?gMoney(p.price):'Set price')+'</b></span></button>'; }).join('')+'</div><button type="button" class="gbtn ghost wide" data-g="x-new" data-p="plan-form">+ Add a plan (for example, Personal training)</button>';
    h += '<div class="ghead2"><h3>Offers</h3><p>A discount you can pick when adding a member, for example “Festival offer, 10% off”.</p></div>';
    if(!G.offers.length) h += '<div class="gempty"><b>No offers yet</b><span>Create one to give a discount on the plan price.</span></div>';
    else h += '<div class="gsheet">'+G.offers.map(function(o){ var on = gOfferOn(o); return '<button type="button" class="grow2" data-g="x-open" data-p="offer-form" data-id="'+o.id+'"><span class="gn"><b>'+esc(o.name)+'</b><small>'+gOfferTxt(o)+(o.till?' · until '+gFmt(o.till):'')+'</small></span><span class="gr"><i class="gchip '+(on?'ok':'none')+'">'+(on?'Active':(o.on?'Ended':'Off'))+'</i></span></button>'; }).join('')+'</div>';
    return h+'<button type="button" class="gbtn gold wide" data-g="x-new" data-p="offer-form">+ Add an offer</button>';
  }
  function gFormExtra(d){
    var offers = G.offers.filter(function(o){ return gOfferOn(o) || o.id===d.offer; });
    return '<label class="gl" for="gf-offer">Offer</label><select class="gin" id="gf-offer"><option value="">No offer</option>'+offers.map(function(o){ return '<option value="'+o.id+'"'+(d.offer===o.id?' selected':'')+'>'+esc(o.name)+' · '+gOfferTxt(o)+'</option>'; }).join('')+'</select>'+
      '<label class="gl" for="gf-trainer">Assigned trainer</label><select class="gin" id="gf-trainer"><option value="">No trainer</option>'+G.trainers.map(function(t){ return '<option value="'+t.id+'"'+(d.trainer===t.id?' selected':'')+'>'+esc(t.name)+(t.role?' · '+esc(t.role):'')+'</option>'; }).join('')+'</select>';
  }
  $('gymroot').addEventListener('change',function(ev){
    var t = ev.target; if(t.id!=='gf-plan' && t.id!=='gf-offer') return;
    var pl = gPlanById($('gf-plan').value), of = $('gf-offer') ? G.offers.filter(function(o){ return o.id===$('gf-offer').value; })[0] : null, fee = $('gf-fee');
    if(pl && pl.price && fee) fee.value = gOfferFee(pl.price,of);
  });

  /* --- equipment --- */
  function gEqNext(e){ return e.every>0 ? gAddM(e.last||e.bought||gK(gToday()),e.every) : ''; }
  function gEquipHtml(){
    var list = G.equip.slice().sort(function(a,b){ var x = a.broken?'0':(gEqNext(a)||'9'), y = b.broken?'0':(gEqNext(b)||'9'); return x<y?-1:x>y?1:0; });
    var h = gSub('Equipment')+'<div class="ghead2"><h3>Equipment and service</h3><p>Track each machine. You get a reminder '+GREM+' days before a service is due.</p></div><button type="button" class="gbtn gold wide" data-g="x-new" data-p="equip-form">+ Add equipment</button>';
    if(!list.length) return h+'<div class="gempty"><b>No equipment yet</b><span>Add treadmills, cycles, racks and other machines.</span></div>';
    return h+'<div class="gsheet">'+list.map(function(e){ var nx = gEqNext(e), d = nx ? gDue(nx) : null;
      return '<button type="button" class="grow2" data-g="x-open" data-p="equip-form" data-id="'+e.id+'"><span class="gn"><b>'+esc(e.name)+'</b><small>'+(nx?'Next service '+gFmt(nx):'No service schedule')+'</small></span><span class="gr">'+(e.broken?'<i class="gchip over">Needs repair</i>':d?'<i class="gchip '+d.cls+'">'+d.txt+'</i>':'<i class="gchip ok">Working</i>')+'</span></button>'; }).join('')+'</div>';
  }

  /* --- leads --- */
  function gLeadsHtml(){
    var seg = gS.x.ls || 'open', cnt = {open:0,joined:0,lost:0}; G.leads.forEach(function(l){ cnt[l.status] = (cnt[l.status]||0)+1; });
    var h = gSub('Enquiries')+'<div class="ghead2"><h3>Enquiries and follow-ups</h3><p>Write down everyone who visits but does not join yet. You get a reminder on the follow-up date.</p></div><button type="button" class="gbtn gold wide" data-g="x-new" data-p="lead-form">+ Add enquiry</button>';
    h += '<div class="gseg" role="tablist">'+[['open','Open ('+cnt.open+')'],['joined','Joined ('+cnt.joined+')'],['lost','Lost ('+cnt.lost+')']].map(function(x){ return '<button type="button" role="tab" aria-selected="'+(seg===x[0])+'" class="'+(seg===x[0]?'on':'')+'" data-g="x-ls" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>';
    var list = G.leads.filter(function(l){ return l.status===seg; }).sort(function(a,b){ return (a.follow||'9')<(b.follow||'9')?-1:1; });
    if(!list.length) return h+'<div class="gempty"><b>Nothing here</b><span>'+(seg==='open'?'Add a visitor to follow up later.':'')+'</span></div>';
    return h+'<div class="gsheet">'+list.map(function(l){ var d = (seg==='open' && gOk(l.follow)) ? gDue(l.follow) : null;
      return '<button type="button" class="grow2" data-g="x-open" data-p="lead-form" data-id="'+l.id+'"><span class="gn"><b>'+esc(l.name)+'</b><small>'+esc((l.mobile||'')+(l.note?' · '+l.note:''))+'</small></span><span class="gr">'+(d?'<b>'+gFmt(l.follow)+'</b><i class="gchip '+d.cls+'">'+d.txt+'</i>':'')+'</span></button>'; }).join('')+'</div>';
  }

  /* --- reminders: equipment and enquiries --- */
  function gRemExtra(){
    var out = [];
    G.equip.forEach(function(e){ if(e.broken) out.push({t:'equip',e:e,d:{cls:'over',txt:'Needs repair',dd:-999}}); else { var nx = gEqNext(e); if(nx){ var d = gDue(nx); if(d.dd<=GREM) out.push({t:'equip',e:e,d:d,nx:nx}); } } });
    G.leads.forEach(function(l){ if(l.status==='open' && gOk(l.follow)){ var d = gDue(l.follow); if(d.dd<=GREM) out.push({t:'lead',e:l,d:d}); } });
    out = out.concat(zRem());
    return out.sort(function(a,b){ return a.d.dd-b.d.dd; });
  }
  function gRemExtraHtml(ex){
    if(!ex.length) return '';
    return '<div class="ghead2 gsp"><h3>Other reminders</h3></div>'+ex.map(function(x){ if(x.t==='z') return x.html; var e = x.e;
      if(x.t==='equip') return '<div class="grem '+x.d.cls+'"><div class="grh"><span class="gav sm">⚙</span><div class="gn"><b>'+esc(e.name)+'</b><small>'+(e.broken?'Marked as needing repair':'Service due '+gFmt(x.nx))+'</small></div><div class="gr"><i class="gchip '+x.d.cls+'">'+x.d.txt+'</i></div></div><div class="gra"><button type="button" class="gbtn ghost sm" data-g="x-open" data-p="equip-form" data-id="'+e.id+'">Open</button><button type="button" class="gbtn gold sm" data-g="x-serviced" data-id="'+e.id+'">'+(e.broken?'Fixed and serviced':'Serviced today')+'</button></div></div>';
      return '<div class="grem '+x.d.cls+'"><div class="grh">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>Follow-up · '+esc(e.note||'Enquiry')+'</small></div><div class="gr"><i class="gchip '+x.d.cls+'">'+x.d.txt+'</i></div></div><div class="gra">'+gTelA(e.mobile)+(e.mobile?'<a class="gbtn ghost sm" href="'+gWa(e.mobile,'Hello '+e.name+', this is '+G.gym.name+'. Thank you for visiting us. Would you like to join? We would be happy to help.')+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn gold sm" data-g="x-open" data-p="lead-form" data-id="'+e.id+'">Open</button></div></div>'; }).join('');
  }

  /* --- home and more --- */
  function gHomeHtml(){
    var rem = gReminders(), n = gRemCount(), feeDue = rem.filter(function(x){ return x.k==='members'; }).length, today = gK(gToday()), list = (G.att[today]||[]).slice().reverse(), f = gFin(gMk());
    var h = gHeroHtml()+'<div class="gstats">'+gStat(G.members.length+'<small>/'+GMAX+'</small>','Members')+gStat(list.length,'In today')+gStat(feeDue,'Fees due soon',feeDue?'warn':'')+gStat(G.trainers.length+G.employees.length,'Staff')+'</div>';
    if(n) h += '<button type="button" class="gbanner2" data-g="tab" data-t="rem"><b>'+n+' reminder'+(n===1?'':'s')+'</b><span>Fees, salaries, service and follow-ups due within '+GREM+' days</span><i>›</i></button>';
    if(G.members.length>=3 && (!G.lastBackup || gDiff(gToday(),gD(G.lastBackup))>=30)) h += '<button type="button" class="gbanner2 bk" data-g="tab" data-t="backup"><b>Back up your data</b><span>'+(G.lastBackup?'Last backup was '+gDiff(gToday(),gD(G.lastBackup))+' days ago.':'You have not saved a backup yet.')+' Phones can be lost.</span><i>›</i></button>';
    h += '<button type="button" class="gmake" data-g="b-new"><span class="gmk"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/></svg></span><span><b>Make a bill</b><small>Invoice for a member, trainer or employee</small></span><i>›</i></button>';
    h += '<div class="gquick">'+[['tab','att','Check in','M5 12l5 5 9-10'],['add','members','Add member','M12 5v14M5 12h14'],['tab','leads','Add enquiry','M4 6h16v10H8l-4 4zM8 10h8'],['tab','ren','Renewals','M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 5']].map(function(x){ return '<button type="button" data-g="'+x[0]+'" '+(x[0]==='add'?'data-k="'+x[1]+'"':'data-t="'+x[1]+'"')+'><svg viewBox="0 0 24 24"><path d="'+x[3]+'"/></svg><span>'+x[2]+'</span></button>'; }).join('')+'</div>';
    h += '<button type="button" class="gmake" data-g="tab" data-t="studio"><span class="gmk"><svg viewBox="0 0 24 24"><path d="M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zM17 10l4-2v8l-4-2"/></svg></span><span><b>Social studio</b><small>Add your gym’s intro, outro and frame to a video</small></span><i>›</i></button>';
    h += zHomeHtml();
    h += gWeekHtml();
    h += '<div class="gcard dark gsnap"><div class="grh"><h4>'+gMonthLbl(gMk())+'</h4><button type="button" class="glink" data-g="tab" data-t="money">Details</button></div><div class="gthree"><div><small>Collected</small><b>'+gMoney(f.col)+'</b></div><div><small>Spent</small><b>'+gMoney(f.out)+'</b></div><div><small>Profit</small><b class="'+(f.profit<0?'neg':'pos')+'">'+(f.profit<0?'−':'')+gMoney(Math.abs(f.profit))+'</b></div></div></div>';
    h += '<div class="gcard dark"><div class="grh"><h4>Checked in today</h4><button type="button" class="glink" data-g="tab" data-t="att">Open</button></div>'+(list.length?list.slice(0,5).map(function(r){ var e = gFind('members',r[0]); return '<div class="gdr"><span>'+esc(e?e.name:'(deleted)')+'</span><b>'+gT12(r[1])+'</b></div>'; }).join(''):'<p class="ghint">No one yet. Use Check in when members arrive.</p>')+'</div>';
    return h;
  }
  function gMoreHtml(){
    var rem = gRemCount(), items = zMoreItems().concat([
      ['settings','Settings','Theme, sound, reminders, PIN','M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6zM19 12l2 1.5-2 3.4-2.3-.9-2 1.2-.4 2.6h-4l-.4-2.6-2-1.2-2.3.9-2-3.4L5 12 3 10.5l2-3.4 2.3.9 2-1.2L10 4h4l.4 2.8 2 1.2 2.3-.9 2 3.4z'],
      ['studio','Social studio','Intro, outro and frames for videos','M4 6h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H4zM17 10l4-2v8l-4-2'],
      ['rem','Reminders',rem?rem+' due soon':'All clear','M12 4a6 6 0 0 0-6 6v4l-2 3h16l-2-3v-4a6 6 0 0 0-6-6zM10 20a2 2 0 0 0 4 0'],
      ['att','Attendance','Check in, busy times','M5 12l5 5 9-10'],
      ['ren','Renewals and follow-up','Expired and not coming','M4 12a8 8 0 0 1 14-5l2-2v6h-6l2-2a5 5 0 1 0 1 5'],
      ['plans','Plans and offers','Prices and discounts','M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8'],
      ['equip','Equipment','Service reminders','M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12'],
      ['leads','Enquiries','Visitors to follow up','M4 6h16v10H8l-4 4z'],
      ['backup','Backup and export','Save or restore your data','M12 4v11M7 11l5 5 5-5M5 20h14']]);
    return zMoreHtml(items);
  }

  /* --- detail page additions --- */
  function gDetailRows(e){
    var vm = gVisitMap(), tr = e.trainer ? gFind('trainers',e.trainer) : null, last = vm.last[e.id];
    return gRow('Trainer',tr?esc(tr.name):'—')+(e.offer?gRow('Offer',esc((G.offers.filter(function(o){return o.id===e.offer})[0]||{name:'—'}).name)):'')+gRow('Visits this month',String(vm.month[e.id]||0))+gRow('Last visit',last?gFmt(last):'Not yet')+(e.freeze?gRow('Status','<span class="gchip soon">Frozen</span>'):'')+zRows(e);
  }
  function gProgData(e){ return (e.prog||[]).slice().sort(function(a,b){ return a.d<b.d?-1:1; }); }
  function gWtChart(list){
    var pts = list.filter(function(p){ return p.w>0; }); if(pts.length<2) return '';
    var mn = Math.min.apply(null,pts.map(function(p){return p.w})), mx = Math.max.apply(null,pts.map(function(p){return p.w})), rg = Math.max(mx-mn,1);
    var xy = pts.map(function(p,i){ return [10+i*(280/(pts.length-1)),56-Math.round((p.w-mn)/rg*44),p]; });
    return '<svg viewBox="0 0 300 70" class="gchart" role="img" aria-label="Weight over time"><polyline points="'+xy.map(function(a){return a[0]+','+a[1]}).join(' ')+'" fill="none" stroke="#E9C05A" stroke-width="2.5" stroke-linejoin="round"/>'+xy.map(function(a){ return '<circle cx="'+a[0]+'" cy="'+a[1]+'" r="3.5" fill="#E9C05A"><title>'+gFmt(a[2].d)+': '+a[2].w+' kg</title></circle>'; }).join('')+'</svg>';
  }
  function gDetailExtra(k,e){
    var h = '';
    if(k==='trainers'){
      var ms = G.members.filter(function(m){ return m.trainer===e.id; });
      h += '<div class="gcard dark"><h4>Assigned members ('+ms.length+')</h4>'+(ms.length?ms.map(function(m){ return '<button type="button" class="grow2 plain" data-g="open" data-k="members" data-id="'+m.id+'">'+gAvatar(m,'sm')+'<span class="gn"><b>'+esc(m.name)+'</b><small>No. '+m.no+'</small></span></button>'; }).join(''):'<p class="ghint">No members assigned. Pick this trainer when adding or editing a member.</p>')+'</div>';
      h += '<button type="button" class="gbtn gold wide" data-g="k-share-t" data-id="'+e.id+'">Give trainer access (QR)</button>';
      return h;
    }
    if(k!=='members') return h;
    if(e.freeze){ var fd = gDiff(gToday(),gD(e.freeze)); h += '<div class="gcard dark gnext soon"><small>Membership frozen</small><h3>Since '+gFmt(e.freeze)+'</h3><p>'+fd+' day'+(fd===1?'':'s')+' so far. When you unfreeze, the next fee date moves forward by the same days. No reminders are sent while frozen.</p><button type="button" class="gbtn gold wide" data-g="x-unfreeze" data-id="'+e.id+'">Unfreeze membership</button></div>'; }
    else {
      if(e.fee>0) h += '<button type="button" class="gbtn gold wide" data-g="x-renew" data-id="'+e.id+'">Receive fee + make bill</button>';
      h += '<button type="button" class="gbtn ghost wide" data-g="x-freeze" data-id="'+e.id+'">Freeze membership</button>';
    }
    var pr = gProgData(e), last = pr[pr.length-1];
    h += '<div class="gcard dark"><h4>Progress</h4>'+gWtChart(pr)+(pr.length?pr.slice(-4).reverse().map(function(p){ return '<div class="gdr"><span>'+gFmt(p.d)+'</span><b>'+(p.w?p.w+' kg':'')+(p.wa?' · waist '+p.wa:'')+(p.c?' · chest '+p.c:'')+'</b></div>'; }).join(''):'<p class="ghint">No measurements yet. Log the first one below.</p>');
    h += '<div class="gtwo three"><div><label class="gl" for="xp-w">Weight (kg)</label><input class="gin" id="xp-w" type="number" step="0.1" inputmode="decimal" placeholder="'+(last&&last.w?last.w:'kg')+'"></div><div><label class="gl" for="xp-wa">Waist (in)</label><input class="gin" id="xp-wa" type="number" step="0.1" inputmode="decimal" placeholder="in"></div><div><label class="gl" for="xp-c">Chest (in)</label><input class="gin" id="xp-c" type="number" step="0.1" inputmode="decimal" placeholder="in"></div></div><button type="button" class="gbtn ghost wide" data-g="x-prog" data-id="'+e.id+'">Log today’s measurements</button></div>';
    h += zDetailExtra(e);
    h += '<button type="button" class="gbtn ghost wide" data-g="x-diet" data-id="'+e.id+'">Diet and workout plan</button>';
    h += '<button type="button" class="gbtn gold wide" data-g="k-share-m" data-id="'+e.id+'">Share plan with member (QR)</button>';
    return h;
  }

  /* ---------- Gym manager, part 3: forms, member plans, backup and actions ---------- */
  function gXHead(t){ return '<div class="govh"><button type="button" class="giconb" data-g="'+(gS.x.back?'x-back':'close')+'" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>'+t+'</span><span></span></div>'; }
  function gFld(l,id,val,type,extra){ return '<label class="gl" for="'+id+'">'+l+'</label><input class="gin" id="'+id+'" type="'+(type||'text')+'" value="'+esc(val==null?'':val)+'" '+(extra||'')+' autocomplete="off">'; }
  function gSel(l,id,list,cur){ return '<label class="gl" for="'+id+'">'+l+'</label><select class="gin" id="'+id+'">'+list.map(function(x){ return '<option value="'+x[0]+'"'+(String(cur)===String(x[0])?' selected':'')+'>'+esc(x[1])+'</option>'; }).join('')+'</select>'; }
  function gDelBtn(pg,id){ return gS.del ? '<button type="button" class="gbtn danger wide" data-g="x-del-yes" data-p="'+pg+'" data-id="'+id+'">Tap again to delete</button>' : '<button type="button" class="gbtn ghost wide" data-g="x-del" data-p="'+pg+'" data-id="'+id+'">Delete</button>'; }
  function gXOvHtml(o){
    var pg = o.page, id = o.id, h = '', e;
    var zo = zOv(o); if(zo!==null) return zo;
    if(pg==='pin-form') return gPinOvHtml();
    if(pg==='share-m' || pg==='share-t') return kShareHtml(pg,id);
    if(pg==='exp-form'){
      e = id ? G.exp.filter(function(x){return x.id===id})[0] : null; e = e || {d:gK(gToday()),cat:'Rent',amt:'',note:''};
      return gXHead(id?'Edit expense':'Add expense')+'<div class="govb"><div class="gcard dark">'+gFld('Date','xf-d',e.d,'date')+gSel('Category','xf-cat',GCAT.map(function(c){return [c,c]}),e.cat)+gFld('Amount (₹)','xf-amt',e.amt,'number','min="1" inputmode="numeric"')+gFld('Note (optional)','xf-note',e.note,'text','maxlength="60"')+'<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="'+pg+'" data-id="'+(id||'')+'">Save expense</button>'+(id?gDelBtn(pg,id):'')+'</div></div>';
    }
    if(pg==='plan-form'){
      e = id ? gPlanById(id) : null; e = e || {name:'',months:1,price:''};
      return gXHead(id?'Edit plan':'Add plan')+'<div class="govb"><div class="gcard dark">'+gFld('Plan name','xf-name',e.name,'text','maxlength="40" placeholder="For example, Personal training"')+gFld('Length (months)','xf-months',e.months,'number','min="1" max="36" inputmode="numeric"')+gFld('Price (₹)','xf-price',e.price||'','number','min="0" inputmode="numeric" placeholder="For example, 1500"')+'<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="'+pg+'" data-id="'+(id||'')+'">Save plan</button>'+(id?gDelBtn(pg,id):'')+'</div></div>';
    }
    if(pg==='offer-form'){
      e = id ? G.offers.filter(function(x){return x.id===id})[0] : null; e = e || {name:'',type:'pct',val:'',till:'',on:true};
      return gXHead(id?'Edit offer':'Add offer')+'<div class="govb"><div class="gcard dark">'+gFld('Offer name','xf-name',e.name,'text','maxlength="40" placeholder="For example, Festival offer"')+gSel('Discount type','xf-type',[['pct','Percent off'],['flat','Rupees off']],e.type)+gFld('Discount value','xf-val',e.val,'number','min="1" inputmode="numeric"')+gFld('Valid until (optional)','xf-till',e.till,'date')+'<label class="gchk"><input type="checkbox" id="xf-on"'+(e.on?' checked':'')+'><span>Offer is active</span></label><p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="'+pg+'" data-id="'+(id||'')+'">Save offer</button>'+(id?gDelBtn(pg,id):'')+'</div></div>';
    }
    if(pg==='equip-form'){
      e = id ? G.equip.filter(function(x){return x.id===id})[0] : null; e = e || {name:'',bought:'',every:3,last:'',note:'',broken:false};
      return gXHead(id?'Equipment':'Add equipment')+'<div class="govb"><div class="gcard dark">'+gFld('Name','xf-name',e.name,'text','maxlength="40" placeholder="For example, Treadmill 1"')+gFld('Bought on (optional)','xf-bought',e.bought,'date')+gFld('Service every (months, 0 for none)','xf-every',e.every,'number','min="0" max="60" inputmode="numeric"')+gFld('Last serviced on (optional)','xf-last',e.last,'date')+gFld('Note (optional)','xf-note',e.note,'text','maxlength="80"')+'<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="'+pg+'" data-id="'+(id||'')+'">Save equipment</button></div>'+(id?'<div class="gbills"><button type="button" class="gbtn ghost wide" data-g="x-serviced" data-id="'+id+'">Serviced today</button><button type="button" class="gbtn ghost wide" data-g="x-broken" data-id="'+id+'">'+(e.broken?'Mark as working':'Mark as needing repair')+'</button>'+gDelBtn(pg,id)+'</div>':'')+'</div>';
    }
    if(pg==='lead-form'){
      e = id ? G.leads.filter(function(x){return x.id===id})[0] : null; e = e || {name:'',mobile:'',note:'',follow:gAddD(gK(gToday()),2),status:'open'};
      var acts = '';
      if(id){ acts = '<div class="gbills">'+(e.mobile?'<div class="gtwo">'+gTelA(e.mobile)+'<a class="gbtn ghost" href="'+gWa(e.mobile,'Hello '+e.name+', this is '+G.gym.name+'. Thank you for visiting us. Would you like to join? We would be happy to help.')+'" target="_blank" rel="noopener">WhatsApp</a></div>':'')+(e.status==='open'?'<button type="button" class="gbtn gold wide" data-g="x-lead-conv" data-id="'+id+'">Convert to member</button><button type="button" class="gbtn ghost wide" data-g="x-lead-st" data-id="'+id+'" data-v="lost">Mark as lost</button>':'<button type="button" class="gbtn ghost wide" data-g="x-lead-st" data-id="'+id+'" data-v="open">Reopen</button>')+gDelBtn(pg,id)+'</div>'; }
      return gXHead(id?'Enquiry':'Add enquiry')+'<div class="govb"><div class="gcard dark">'+gFld('Name','xf-name',e.name,'text','maxlength="40"')+gFld('Mobile (optional)','xf-mob',e.mobile,'tel','inputmode="numeric" maxlength="18"')+gFld('Note (optional)','xf-note',e.note,'text','maxlength="80" placeholder="For example, wants weight loss, asked about yearly plan"')+gFld('Follow up on','xf-follow',e.follow,'date')+'<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="'+pg+'" data-id="'+(id||'')+'">Save enquiry</button></div>'+acts+'</div>';
    }
    if(pg==='dietform') return gDietForm(id);
    if(pg==='dietview') return gDietView(id);
    return '';
  }
  function gXSave(pg,id){
    if(zSave(pg,id)) return;
    var err = '', v = function(i){ var el = $(i); return el ? el.value.trim() : ''; }, today = gK(gToday());
    if(pg==='exp-form'){
      var d = v('xf-d'), amt = parseFloat(v('xf-amt'));
      if(!gOk(d)) err = 'Choose the date.'; else if(!(amt>0)) err = 'Enter the amount.';
      if(!err){ var ex = id ? G.exp.filter(function(x){return x.id===id})[0] : null, rec = {d:d,cat:v('xf-cat'),amt:Math.round(amt),note:v('xf-note')}; if(ex) Object.keys(rec).forEach(function(k){ ex[k] = rec[k]; }); else { rec.id = gId(); G.exp.push(rec); } }
    } else if(pg==='plan-form'){
      var nm = v('xf-name'), mo = parseInt(v('xf-months'),10), pr = parseFloat(v('xf-price')||'0');
      if(!nm) err = 'Enter the plan name.'; else if(!(mo>=1 && mo<=36)) err = 'Length must be 1 to 36 months.'; else if(!(pr>=0)) err = 'Enter a valid price.';
      if(!err){ var pl = id ? gPlanById(id) : null; if(pl){ pl.name = nm; pl.months = mo; pl.price = Math.round(pr); } else G.plans.push({id:'p'+gId(),name:nm,months:mo,price:Math.round(pr)}); }
    } else if(pg==='offer-form'){
      var on = v('xf-name'), ty = v('xf-type'), vl = parseFloat(v('xf-val')), till = v('xf-till');
      if(!on) err = 'Enter the offer name.'; else if(!(vl>0)) err = 'Enter the discount.'; else if(ty==='pct' && vl>100) err = 'A percent discount cannot be more than 100.'; else if(till && !gOk(till)) err = 'Choose a valid date.';
      if(!err){ var of = id ? G.offers.filter(function(x){return x.id===id})[0] : null, r2 = {name:on,type:ty,val:vl,till:till,on:$('xf-on').checked}; if(of) Object.keys(r2).forEach(function(k){ of[k] = r2[k]; }); else { r2.id = gId(); G.offers.push(r2); } }
    } else if(pg==='equip-form'){
      var en = v('xf-name'), ev = parseInt(v('xf-every')||'0',10), bt = v('xf-bought'), ls = v('xf-last');
      if(!en) err = 'Enter the equipment name.'; else if(!(ev>=0 && ev<=60)) err = 'Service gap must be 0 to 60 months.'; else if((bt && !gOk(bt)) || (ls && !gOk(ls))) err = 'Choose valid dates.';
      if(!err){ var eq = id ? G.equip.filter(function(x){return x.id===id})[0] : null, r3 = {name:en,bought:bt,every:ev,last:ls,note:v('xf-note')}; if(eq) Object.keys(r3).forEach(function(k){ eq[k] = r3[k]; }); else { r3.id = gId(); r3.broken = false; G.equip.push(r3); } }
    } else if(pg==='lead-form'){
      var ln = v('xf-name'), mb = v('xf-mob').replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,''), fl = v('xf-follow');
      if(!ln) err = 'Enter the name.'; else if(mb && !/^\d{10}$/.test(mb)) err = 'Enter a 10-digit mobile number, or leave it empty.'; else if(fl && !gOk(fl)) err = 'Choose a valid date.';
      if(!err){ var ld = id ? G.leads.filter(function(x){return x.id===id})[0] : null, r4 = {name:ln,mobile:mb,note:v('xf-note'),follow:fl}; if(ld) Object.keys(r4).forEach(function(k){ ld[k] = r4[k]; }); else { r4.id = gId(); r4.status = 'open'; r4.created = today; G.leads.push(r4); } }
    }
    if(err){ var el = $('xf-err'); if(el){ el.textContent = err; el.hidden = false; } return; }
    gSave(); gS.ov = null; gS.del = false; gRender(); toast('Saved.');
  }
  function gXDel(pg,id){
    if(zDel(pg,id)) return;
    if(pg==='exp-form') G.exp = G.exp.filter(function(x){return x.id!==id});
    else if(pg==='plan-form'){
      var used = G.members.filter(function(m){return m.plan===id}).length;
      if(G.plans.length<=1){ toast('Keep at least one plan.'); gS.del = false; gRender(); return; }
      if(used){ toast(used+' member'+(used===1?' uses':'s use')+' this plan. Change their plan first.'); gS.del = false; gRender(); return; }
      G.plans = G.plans.filter(function(x){return x.id!==id});
    }
    else if(pg==='offer-form') G.offers = G.offers.filter(function(x){return x.id!==id});
    else if(pg==='equip-form') G.equip = G.equip.filter(function(x){return x.id!==id});
    else if(pg==='lead-form') G.leads = G.leads.filter(function(x){return x.id!==id});
    gSave(); gS.ov = null; gS.del = false; gRender(); toast('Deleted.');
  }

  /* --- file saving (backup, CSV, plan PDF) --- */
  function gSaveFile(blob,fn,done){
    if(NATIVE){ nSaveFile(blob,fn,done); return; }
    function fallback(){
      try{ var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = fn; document.body.appendChild(a); a.click(); setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); },4000); toast('Saved: '+fn); if(done) done(); }
      catch(e){ toast('Could not save the file in this browser.'); }
    }
    try{
      if(window.claude && typeof window.claude.use==='function'){
        window.claude.use('downloads').then(function(d){
          if(!d){ fallback(); return; }
          d.save({filename:fn,data:blob}).then(function(){ toast('File saved.'); if(done) done(); },function(er){ if(er && er.code==='declined') return; fallback(); });
        },function(){ fallback(); });
        return;
      }
    }catch(e){}
    fallback();
  }
  function gCsv(rows){ return '﻿'+rows.map(function(r){ return r.map(function(c){ c = String(c==null?'':c); return /[",\n]/.test(c) ? '"'+c.replace(/"/g,'""')+'"' : c; }).join(','); }).join('\r\n'); }
  function gCsvOf(v){
    var vm = gVisitMap(), r = [];
    if(v==='members'){ r.push(['No','Name','Mobile','Address','Joined','Plan','Fee','Next fee date','Trainer','Status','Visits this month']); G.members.slice().sort(function(a,b){return a.no-b.no}).forEach(function(e){ var t = e.trainer ? gFind('trainers',e.trainer) : null; r.push([e.no,e.name,e.mobile,e.address,e.join,gPlanName(e.plan),e.fee,e.next,t?t.name:'',e.freeze?'Frozen':'Active',vm.month[e.id]||0]); }); }
    else if(v==='att'){ r.push(['Date','Time','Member no','Name','Mobile']); Object.keys(G.att).sort().forEach(function(d){ G.att[d].forEach(function(x){ var e = gFind('members',x[0]); r.push([d,x[1],e?e.no:'',e?e.name:'(deleted)',e?e.mobile:'']); }); }); }
    else if(v==='bills'){ r.push(['Invoice','Date','Type','Name','Description','Amount','Status']); G.invoices.forEach(function(i){ r.push([i.no,i.date,BKIND[i.k],i.c.name,i.desc,i.amt,i.status]); }); }
    else if(v==='exp'){ r.push(['Date','Category','Note','Amount']); G.exp.slice().sort(function(a,b){return a.d<b.d?-1:1}).forEach(function(x){ r.push([x.d,x.cat,x.note,x.amt]); }); }
    else if(v==='leads'){ r.push(['Name','Mobile','Note','Follow up','Status']); G.leads.forEach(function(l){ r.push([l.name,l.mobile,l.note,l.follow,l.status]); }); }
    return gCsv(r);
  }
  function gBackupHtml(){
    var h = gSub('Backup and export')+'<div class="gcard dark"><h4>Backup</h4><p class="ghint">Your data lives only in this browser. Save a backup file now and then, and keep it safe (for example, in your email or Google Drive). The backup includes your PIN, so keep the file private.</p>'+gRow('Last backup',G.lastBackup?gFmt(G.lastBackup):'Never')+gRow('Members / bills / check-ins',G.members.length+' / '+G.invoices.length+' / '+Object.keys(G.att).reduce(function(t,k){return t+G.att[k].length},0))+'<button type="button" class="gbtn gold wide" data-g="x-bk">Download backup file</button></div>';
    h += '<div class="gcard dark"><h4>Restore from a backup</h4><p class="ghint">This replaces everything in this browser with the data from the file.</p>';
    if(gS.x.restore){ var R = gS.x.restore; h += '<div class="gwarn"><b>Replace all current data?</b> The file is for <b>'+esc(R.gym.name)+'</b> with '+R.members.length+' members'+(R.lastBackup?' (saved '+esc(gFmt(R.lastBackup))+')':'')+'. After restoring, you log in with the PIN from that backup.</div><div class="grow"><button type="button" class="gbtn danger" data-g="x-rs-yes">Yes, restore</button><button type="button" class="gbtn ghost" data-g="x-rs-no">Cancel</button></div>'; }
    else h += '<label class="gbtn ghost wide" for="xb-file">Choose a backup file</label><input type="file" id="xb-file" accept=".json,application/json" hidden>';
    h += '</div><div class="gcard dark"><h4>Export for Excel (CSV)</h4><div class="gcsv">'+[['members','Members'],['att','Attendance'],['bills','Bills'],['exp','Expenses'],['leads','Enquiries']].map(function(x){ return '<button type="button" class="gbtn ghost sm" data-g="x-csv" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div></div>';
    return h;
  }
  function gRestoreRead(f){
    if(!f) return; if(f.size>60*1024*1024){ toast('That file is too large.'); return; }
    var fr = new FileReader();
    fr.onload = function(){
      try{
        var o = JSON.parse(fr.result);
        if(!o || !o.gym || typeof o.gym.name!=='string' || !o.gym.hash || !o.gym.salt || !Array.isArray(o.members) || !Array.isArray(o.trainers) || !Array.isArray(o.employees)) throw 0;
        gS.x.restore = o; gRender();
      }catch(e){ toast('That is not a valid KDN gym backup file.'); }
    };
    fr.onerror = function(){ toast('The file could not be read.'); };
    fr.readAsText(f);
  }

  /* --- member diet and workout plan --- */
  function gDietForm(id){
    var m = gFind('members',id); if(!m) return '';
    var d = m.prof || {}, pr = gProgData(m), lw = pr.length ? pr[pr.length-1].w : '', ft = '', inch = '';
    if(d.height>0){ var t = Math.round(d.height/2.54*10)/10, a = Math.floor(t/12); ft = a; inch = r1(t-a*12); }
    var h = gXHead('Diet and workout plan')+'<div class="govb"><div class="gcard dark"><h3>'+esc(m.name)+'</h3><p class="ghint">Enter the member’s details to make a personal calorie, protein, meal and workout plan.</p>';
    h += gSel('Gender','dp-gender',[['female','Female'],['male','Male'],['other','Other']],d.gender||'male');
    h += '<div class="gtwo">'+gFld('Age','dp-age',d.age||'','number','inputmode="numeric" placeholder="Years"')+gFld('Weight (kg)','dp-weight',d.weight||lw||'','number','step="0.1" inputmode="decimal"')+'</div><div class="gtwo">'+gFld('Height (feet)','dp-ft',ft,'number','inputmode="numeric" placeholder="ft"')+gFld('Height (inches)','dp-in',inch,'number','step="0.1" inputmode="decimal" placeholder="in"')+'</div>';
    h += gSel('Diet','dp-diet',[['veg','Vegetarian'],['vegan','Vegan'],['nonveg','Non-vegetarian']],d.diet||'veg')+gSel('Goal','dp-goal',[['lose','Lose weight'],['gain','Gain weight'],['maintain','Stay stable']],d.goal||'lose')+gFld('Kilograms to lose or gain (or the weight to hold)','dp-amt',d.amt||'','number','step="0.1" inputmode="decimal"');
    h += gSel('Where they train','dp-loc',[['h0','Home, no equipment'],['h1','Home with dumbbells'],['gym','Gym']],d.loc||'gym')+gSel('Level','dp-level',[['beginner','Beginner'],['mid','Intermediate'],['adv','Advanced']],d.level||'beginner')+gSel('Training days a week','dp-days',[[3,'3 days'],[4,'4 days'],[5,'5 days'],[6,'6 days']],d.days||4)+gSel('Food budget','dp-budget',[['low','Low'],['mid','Medium'],['high','High']],d.budget||'mid');
    return h+'<p class="gerr" id="dp-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-diet-go" data-id="'+id+'">Make the plan</button></div></div>';
  }
  function gDietVal(m){
    var ft = parseFloat($('dp-ft').value), inch = parseFloat($('dp-in').value);
    var d = {name:m.name,gender:$('dp-gender').value,age:parseInt($('dp-age').value,10),weight:parseFloat($('dp-weight').value),height:(ft>=0?ft:0)*30.48+((inch>=0?inch:0)*2.54),diet:$('dp-diet').value,goal:$('dp-goal').value,amt:parseFloat($('dp-amt').value),loc:$('dp-loc').value,level:$('dp-level').value,days:parseInt($('dp-days').value,10),budget:$('dp-budget').value,tmode:'safe'};
    if(!(ft>0)) d.height = NaN;
    d = normalize(d); var err = '';
    KEYS.forEach(function(k){ if(!err){ var e = FV[k](d); if(e) err = e; } });
    return {d:d,err:err};
  }
  function gDietData(m){
    var p = m.prof, r = calc(p), wp = weekPlan(p), dow = todayDow(), mp = mealPlan(p,r,dow);
    return {p:p,r:r,wp:wp,dow:dow,mp:mp};
  }
  function gDietView(id){
    var m = gFind('members',id); if(!m || !m.prof) return gDietForm(id);
    var D = gDietData(m), r = D.r, h = gXHead('Plan for '+esc(m.name))+'<div class="govb"><div class="gcard dark"><h3>'+esc(m.name)+'</h3><p class="ghint">'+esc(goalLine(D.p))+'</p><div class="gthree"><div><small>Calories</small><b>'+fmt(r.target)+'</b></div><div><small>Protein</small><b>'+r.protein+' g</b></div><div><small>Water</small><b>'+r.water.toFixed(1)+' L</b></div></div></div>';
    h += '<div class="gcard dark"><h4>Weekly workout</h4>'+DAYN.map(function(n,i){ var day = D.wp.days[i]; return '<div class="gdr gwk"><span>'+n.slice(0,3)+'</span><b>'+esc(day.t)+'<small>'+day.items.filter(function(it){return EXS[it.id]}).slice(0,4).map(function(it){ return esc(EXS[it.id].n); }).join(', ')+'</small></b></div>'; }).join('')+'</div>';
    h += '<div class="gcard dark"><h4>A sample day ('+DAYN[D.dow]+')</h4>'+D.mp.slots.map(function(s){ return '<div class="gdr"><span>'+esc(s.sl[0].replace(' snack',''))+'</span><b>'+esc(s.x.n)+'<small>'+Math.round(s.k)+' kcal</small></b></div>'; }).join('')+(D.mp.tops.length?'<p class="ghint">Protein top-ups: '+D.mp.tops.map(function(q){ return q.u+' × '+esc(q.t.n); }).join(', ')+'.</p>':'')+'</div>';
    h += '<div class="gbills"><div class="gtwo"><button type="button" class="gbtn gold" data-g="x-dp-pdf" data-id="'+id+'"><svg viewBox="0 0 24 24" class="gbi"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Download</button><button type="button" class="gbtn wa" data-g="x-dw-open" data-id="'+id+'"><svg viewBox="0 0 24 24" class="gbi"><path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7z"/></svg>Send</button></div><button type="button" class="gbtn ghost wide" data-g="x-diet-edit" data-id="'+id+'">Change details</button></div><p class="ghint cen">Estimates only, not medical advice.</p></div>';
    if(gS.x.dw && gS.x.dw.id===id) h += gDwHtml(m);
    return h;
  }
  function gDwMsg(m){ var D = gDietData(m); return 'Hello '+m.name+', here is your personal diet and workout plan from '+G.gym.name+': '+fmt(D.r.target)+' kcal a day, '+D.r.protein+' g protein, '+D.r.water.toFixed(1)+' L water and '+D.p.days+' workout days a week. Please find the PDF attached. All the best!'; }
  function gDwLink(){ var w = gS.x.dw, n = bWaNum(w.num); return n ? 'https://wa.me/'+n+'?text='+encodeURIComponent(w.msg) : '#'; }
  function gDwHtml(m){
    var w = gS.x.dw;
    return '<div class="gwa" role="dialog" aria-modal="true" aria-label="Send on WhatsApp"><div class="gwa-in"><div class="gwa-h"><b>Send on WhatsApp</b><button type="button" class="giconb" data-g="x-dw-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div><label class="gl" for="gdw-num">WhatsApp number (you can change it)</label><input class="gin" id="gdw-num" type="tel" inputmode="numeric" maxlength="18" value="'+esc(w.num)+'" autocomplete="off"><label class="gl" for="gdw-msg">Message</label><textarea class="gin" id="gdw-msg" rows="4" maxlength="600">'+esc(w.msg)+'</textarea>'+
      '<div class="gsteps"><div class="gstep'+(w.dl?' done':'')+'"><span>1</span><div><b>Save the plan PDF</b><small>You will attach this file in WhatsApp.</small></div><button type="button" class="gbtn ghost sm" data-g="x-dp-pdf" data-id="'+m.id+'">'+(w.dl?'Saved ✓':'Download')+'</button></div><div class="gstep"><span>2</span><div><b>Open the WhatsApp chat</b><small>Tap the paperclip, choose Document, pick the PDF, then press send.</small></div></div></div><p class="gerr" id="gdw-err" role="alert" hidden></p><a class="gbtn wa wide" id="gdw-go" target="_blank" rel="noopener" href="'+esc(gDwLink())+'">Open WhatsApp chat</a></div></div>';
  }
  function gDietDraw(m,cb){
    var D = gDietData(m), W = 794, H = 1123, S = 2, cv = document.createElement('canvas'); cv.width = W*S; cv.height = H*S;
    var ctx = cv.getContext('2d'); ctx.scale(S,S);
    var F = '"DM Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif', DF = '"Bricolage Grotesque","DM Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif', GOLD = '#E9C05A', INK = '#1B1710', MUTE = '#6B6247';
    function txt(t,x,y,f,c,al){ ctx.font = f; ctx.fillStyle = c; ctx.textAlign = al||'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t,x,y); }
    function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
    function go(logo){
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,W,H);
      var hg = ctx.createLinearGradient(0,0,W,150); hg.addColorStop(0,'#1E1810'); hg.addColorStop(1,'#0B0A07'); ctx.fillStyle = hg; ctx.fillRect(0,0,W,140);
      var sg = ctx.createLinearGradient(0,0,W,0); sg.addColorStop(0,'#B98A1E'); sg.addColorStop(.5,'#F3D77F'); sg.addColorStop(1,'#B98A1E'); ctx.fillStyle = sg; ctx.fillRect(0,140,W,5);
      ctx.save(); ctx.beginPath(); ctx.arc(80,70,34,0,Math.PI*2); ctx.fillStyle = '#2A2110'; ctx.fill(); ctx.clip();
      if(logo){ var k = Math.max(68/logo.width,68/logo.height); ctx.drawImage(logo,80-logo.width*k/2,70-logo.height*k/2,logo.width*k,logo.height*k); } else txt((G.gym.name||'G').charAt(0).toUpperCase(),80,84,'800 34px '+DF,GOLD,'center');
      ctx.restore(); ctx.beginPath(); ctx.arc(80,70,34,0,Math.PI*2); ctx.strokeStyle = GOLD; ctx.lineWidth = 2.5; ctx.stroke();
      ctx.font = '800 22px '+DF; var nl = bWrap(ctx,G.gym.name,340,2); nl.forEach(function(l,i){ txt(l,132,(nl.length>1?60:76)+i*26,'800 22px '+DF,'#fff'); });
      if(G.gym.phone) txt('Phone: '+G.gym.phone,132,(nl.length>1?60:76)+nl.length*26-2,'600 12px '+F,GOLD);
      txt('DIET & WORKOUT PLAN',W-40,70,'800 19px '+DF,GOLD,'right'); txt(gFmt(gK(gToday())),W-40,92,'400 12.5px '+F,'#D9CBA0','right');
      txt('Prepared for',40,182,'700 11px '+F,'#9A7A24'); txt(m.name,40,208,'800 24px '+DF,INK);
      ctx.font = '400 12.5px '+F; bWrap(ctx,goalLine(D.p),714,2).forEach(function(l,i){ txt(l,40,228+i*17,'400 12.5px '+F,MUTE); });
      var bx = [['CALORIES',fmt(D.r.target)+' kcal'],['PROTEIN',D.r.protein+' g'],['WATER',D.r.water.toFixed(1)+' L']];
      bx.forEach(function(b,i){ var x = 40+i*242; rr(x,268,230,64,12); ctx.fillStyle = '#FBF7EA'; ctx.fill(); ctx.strokeStyle = '#E8E0C8'; ctx.lineWidth = 1; ctx.stroke(); txt(b[0],x+16,290,'700 10.5px '+F,'#9A7A24'); txt(b[1],x+16,318,'800 22px '+DF,INK); });
      txt('WEEKLY WORKOUT',40,366,'700 12px '+F,'#9A7A24'); ctx.fillStyle = GOLD; ctx.fillRect(40,372,28,2);
      DAYN.forEach(function(n,i){
        var y = 384+i*54, day = D.wp.days[i]; if(i%2===0){ ctx.fillStyle = '#FBF7EA'; rr(40,y,714,50,8); ctx.fill(); }
        txt(n,54,y+30,'800 14px '+DF,INK); txt(day.t,170,y+22,'700 13px '+F,INK);
        var names = day.items.filter(function(it){ return EXS[it.id]; }).slice(0,5).map(function(it){ return EXS[it.id].n; }).join(', ');
        ctx.font = '400 11.5px '+F; var ln = bWrap(ctx,names||'Rest and recover',570,1); txt(ln[0],170,y+39,'400 11.5px '+F,MUTE);
      });
      var my = 384+7*54+34; txt('A SAMPLE DAY OF MEALS ('+DAYN[D.dow].toUpperCase()+')',40,my,'700 12px '+F,'#9A7A24'); ctx.fillStyle = GOLD; ctx.fillRect(40,my+6,28,2);
      D.mp.slots.slice(0,6).forEach(function(s,i){ var y = my+30+i*24; txt(s.sl[0].replace(' snack',''),54,y,'700 12.5px '+F,INK); ctx.font = '400 12.5px '+F; var l1 = bWrap(ctx,s.x.n,430,1)[0]; txt(l1,170,y,'400 12.5px '+F,INK); txt(Math.round(s.k)+' kcal',754,y,'600 12.5px '+F,MUTE,'right'); });
      if(D.mp.tops.length){ var ty = my+30+Math.min(6,D.mp.slots.length)*24+8; ctx.font = '600 12px '+F; bWrap(ctx,'Protein top-ups: '+D.mp.tops.map(function(q){ return q.u+' × '+q.t.n; }).join(', '),714,2).forEach(function(l,i){ txt(l,54,ty+i*17,'600 12px '+F,'#1F7A55'); }); }
      ctx.fillStyle = '#E8E0C8'; ctx.fillRect(40,1040,714,1);
      txt('Estimates only, not medical advice. Check with a doctor before big changes to food or exercise.',W/2,1066,'400 11.5px '+F,MUTE,'center');
      ctx.fillStyle = '#14110A'; ctx.fillRect(0,H-20,W,20); ctx.fillStyle = sg; ctx.fillRect(0,H-20,W,3);
      cb(cv.toDataURL('image/jpeg',0.92));
    }
    function start(){ if(G.gym.logo){ var im = new Image(); im.onload = function(){ go(im); }; im.onerror = function(){ go(null); }; im.src = G.gym.logo; } else go(null); }
    try{ if(document.fonts && document.fonts.ready){ var done = false, fin = function(){ if(!done){ done = true; start(); } }; setTimeout(fin,900); Promise.all([document.fonts.load('800 22px "Bricolage Grotesque"'),document.fonts.load('400 13px "DM Sans"')]).then(fin,fin); } else start(); }catch(e){ start(); }
  }

  /* --- one handler for every "x-" action --- */
  function gKeep(fn){ var ov = document.querySelector('.gov'), st = ov ? ov.scrollTop : 0, y = window.scrollY; fn(); var ov2 = document.querySelector('.gov'); if(ov2) ov2.scrollTop = st; else window.scrollTo(0,y); }
  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b || gS.view!=='dash') return;
    var a = b.getAttribute('data-g'); if(a.indexOf('x-')!==0) return;
    var id = b.getAttribute('data-id'), v = b.getAttribute('data-v'), pg = b.getAttribute('data-p'), today = gK(gToday()), e, ov;
    if(zAct(a,b,id,v)) return;
    if(a==='x-mf'){ gS.mf = v; gS.n = 50; gRender(); return; }
    if(a==='x-ms'){ gS.x.ms = v; gS.tab = 'money'; gRender(); return; }
    if(a==='x-mon'){ var nm = gMonthAdd(gS.x.mk||gMk(),parseInt(v,10)); if(nm>gMk()) return; gS.x.mk = nm; gRender(); return; }
    if(a==='x-rs'){ gS.x.rs = v; gRender(); return; }
    if(a==='x-ls'){ gS.x.ls = v; gRender(); return; }
    if(a==='x-ci'){ gCheckin(id); return; }
    if(a==='x-ciundo'){ if(G.att[today]){ G.att[today] = G.att[today].filter(function(r){ return r[0]!==id; }); gSave(); gRender(); toast('Check-in removed.'); } return; }
    if(a==='x-renew'){ gRenew(id); return; }
    if(a==='x-freeze'){ e = gFind('members',id); if(e){ e.freeze = today; gSave(); gKeep(gRender); toast('Membership frozen. Reminders are paused.'); } return; }
    if(a==='x-unfreeze'){ e = gFind('members',id); if(e && e.freeze){ var n = Math.max(0,gDiff(gToday(),gD(e.freeze))); if(gOk(e.next)) e.next = gAddD(e.next,n); delete e.freeze; gSave(); gKeep(gRender); toast('Membership active again. Next fee date: '+gFmt(e.next)+'.'); } return; }
    if(a==='x-prog'){
      e = gFind('members',id); if(!e) return;
      var w = parseFloat($('xp-w').value), wa = parseFloat($('xp-wa').value), c = parseFloat($('xp-c').value);
      if(!(w>=20 && w<=400) && !(wa>0) && !(c>0)){ toast('Enter a weight, waist or chest measurement.'); return; }
      if(w && !(w>=20 && w<=400)){ toast('Enter a weight between 20 and 400 kg.'); return; }
      if(!e.prog) e.prog = []; var rec = e.prog.filter(function(p){ return p.d===today; })[0]; if(!rec){ rec = {d:today}; e.prog.push(rec); }
      if(w>0) rec.w = Math.round(w*10)/10; if(wa>0) rec.wa = Math.round(wa*10)/10; if(c>0) rec.c = Math.round(c*10)/10;
      gSave(); gKeep(gRender); toast('Measurements saved.'); return;
    }
    if(a==='x-new' || a==='x-open'){ gS.x.back = null; gS.del = false; gS.ov = {type:'x',page:pg,id:a==='x-open'?id:''}; gRender(); ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return; }
    if(a==='x-back'){ gS.ov = gS.x.back || null; gS.x.back = null; gS.x.dw = null; gS.del = false; gRender(); return; }
    if(a==='x-save'){ gXSave(pg,id); return; }
    if(a==='x-del'){ gS.del = true; gKeep(gRender); return; }
    if(a==='x-del-yes'){ gXDel(pg,id); return; }
    if(a==='x-serviced'){ e = G.equip.filter(function(x){return x.id===id})[0]; if(e){ e.last = today; e.broken = false; gSave(); if(gS.ov && gS.ov.type==='x') gS.ov = null; gRender(); toast('Service recorded.'+(e.every>0?' Next: '+gFmt(gEqNext(e))+'.':'')); } return; }
    if(a==='x-broken'){ e = G.equip.filter(function(x){return x.id===id})[0]; if(e){ e.broken = !e.broken; gSave(); gKeep(gRender); toast(e.broken?'Marked as needing repair.':'Marked as working.'); } return; }
    if(a==='x-lead-st'){ e = G.leads.filter(function(x){return x.id===id})[0]; if(e){ e.status = v; gSave(); gS.ov = null; gRender(); toast(v==='lost'?'Marked as lost.':'Enquiry reopened.'); } return; }
    if(a==='x-lead-conv'){
      e = G.leads.filter(function(x){return x.id===id})[0]; if(!e) return;
      if(G.members.length>=GMAX){ toast('The limit of '+GMAX+' members is reached.'); return; }
      gS.leadId = id; gS.prefill = {name:e.name,mobile:e.mobile}; gS.tmp = {photo:''}; gS.nextTouched = false; gS.ov = {type:'form',k:'members',id:''}; gRender(); ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return;
    }
    if(a==='x-diet' || a==='x-diet-edit'){ e = gFind('members',id); if(!e) return; if(a==='x-diet') gS.x.back = {type:'detail',k:'members',id:id}; gS.x.dw = null; gS.ov = {type:'x',page:(a==='x-diet' && e.prof)?'dietview':'dietform',id:id}; gRender(); ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return; }
    if(a==='x-diet-go'){
      e = gFind('members',id); if(!e) return; var r = gDietVal(e), er = $('dp-err');
      if(r.err){ er.textContent = r.err; er.hidden = false; return; }
      e.prof = r.d; gSave(); gS.ov = {type:'x',page:'dietview',id:id}; gRender(); ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return;
    }
    if(a==='x-dp-pdf'){
      e = gFind('members',id); if(!e || !e.prof) return; toast('Preparing the PDF…');
      gDietDraw(e,function(u){ gSaveFile(bPdf(u),'Plan-'+e.name.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)+'.pdf',function(){ if(gS.x.dw){ gS.x.dw.dl = true; var bt = document.querySelector('[data-g=x-dp-pdf]'); var s = document.querySelector('.gwa [data-g=x-dp-pdf]'); if(s){ s.textContent = 'Saved ✓'; s.closest('.gstep').classList.add('done'); } } }); });
      return;
    }
    if(a==='x-dw-open'){ e = gFind('members',id); if(!e) return; gS.x.dw = {id:id,num:e.mobile||'',msg:gDwMsg(e),dl:false}; gRender(); return; }
    if(a==='x-dw-x'){ gS.x.dw = null; gRender(); return; }
    if(a==='x-bk'){ var blob = new Blob([JSON.stringify(G)],{type:'application/json'}); gSaveFile(blob,'KDN-gym-backup-'+today+'.json',function(){ G.lastBackup = today; gSave(); if(gS.tab==='backup') gKeep(gRender); }); return; }
    if(a==='x-csv'){ gSaveFile(new Blob([gCsvOf(v)],{type:'text/csv'}),'KDN-'+v+'-'+today+'.csv'); return; }
    if(a==='x-rs-no'){ gS.x.restore = null; gRender(); return; }
    if(a==='x-rs-yes'){ var R = gS.x.restore; if(!R) return; G = R; gMig(); gSave(); gFlush(); gS.x.restore = null; gLockNow(); toast('Backup restored. Log in with the PIN from that backup.'); return; }
  });
  $('gymroot').addEventListener('click',function(ev){
    var go = ev.target.closest('#gdw-go'); if(!go || !gS.x.dw) return;
    var n = bWaNum($('gdw-num').value), er = $('gdw-err');
    if(!n){ ev.preventDefault(); er.textContent = 'Enter a valid WhatsApp number with 10 digits.'; er.hidden = false; return; }
    go.setAttribute('href',gDwLink());
    setTimeout(function(){ gS.x.dw = null; gS.x.back = null; gS.ov = null; gS.tab = 'home'; gRender(); window.scrollTo(0,0); toast('Attach the PDF in WhatsApp and press send.'); },700);
  });
  $('gymroot').addEventListener('input',function(ev){
    var t = ev.target;
    if(t.id==='xa-q'){ gS.x.aq = t.value; var r = $('xa-res'); if(r) r.innerHTML = gAttRes(); return; }
    if(gS.x.dw && (t.id==='gdw-num' || t.id==='gdw-msg')){ if(t.id==='gdw-num') gS.x.dw.num = t.value; else gS.x.dw.msg = t.value; var g = $('gdw-go'); if(g) g.setAttribute('href',gDwLink()); var er = $('gdw-err'); if(er) er.hidden = true; }
  });
  $('gymroot').addEventListener('keydown',function(ev){
    if(ev.key!=='Enter' || ev.target.id!=='xa-q') return;
    var q = ev.target.value.trim().toLowerCase(); if(!q) return;
    var m = G.members.filter(function(e){ return String(e.no)===q; })[0] || (function(){ var l = G.members.filter(function(e){ return (e.name+' '+(e.mobile||'')).toLowerCase().indexOf(q)>=0; }); return l.length===1 ? l[0] : null; })();
    if(m) gCheckin(m.id); else toast('Pick the member from the list.');
  });
  $('gymroot').addEventListener('change',function(ev){ if(ev.target.id==='xb-file'){ gRestoreRead(ev.target.files && ev.target.files[0]); ev.target.value = ''; } });

