  /* ---------- Gym manager, part 4: reports, classes, personal training, store, lockers, passes, staff attendance, wishes, broadcast, kiosk ----------
     Same storage as the rest of the gym (G, saved in this browser). New data lives under G.z so older backups still load. */
  var ZPM = [['cash','Cash'],['upi','UPI'],['card','Card'],['bank','Bank transfer']];
  var ZSRC = {fee:'Membership fees',pt:'Personal training',store:'Store sales',lock:'Lockers',pass:'Day passes and trials',other:'Other income'};
  var ZDAY = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var ZGOAL = [['','Not set'],['loss','Fat loss'],['gain','Muscle gain'],['fit','General fitness'],['strength','Strength'],['rehab','Injury recovery'],['sport','Sports performance']];
  var ZMSG = {
    holiday:'Hello {name}, {gym} will be closed on [date] for [reason]. We open again on [date]. See you soon!',
    offer:'Hello {name}! {gym} has a special offer: [offer details]. Valid till [date]. Reply to this message to know more.',
    fee:'Hello {name}, a reminder from {gym}: your membership fee is due on {due}. Please pay at the front desk or by UPI. Thank you!',
    miss:'Hello {name}, we have not seen you at {gym} for a while. Your progress matters to us. Come in this week and we will help you get back on track!',
    event:'Hello {name}! Join us at {gym} for [event name] on [date] at [time]. Bring a friend!'
  };
  function zMig(){
    if(!G.z || typeof G.z!=='object') G.z = {};
    var z = G.z;
    ['cls','pt','prod','sales','inc','pass','lks'].forEach(function(k){ if(!Array.isArray(z[k])) z[k] = []; });
    if(!z.bk || typeof z.bk!=='object') z.bk = {};
    if(!z.satt || typeof z.satt!=='object') z.satt = {};
    if(!(z.lkn>=0)) z.lkn = 0;
    if(!z.sent || typeof z.sent!=='object') z.sent = {};
    var cut = gK(new Date(gToday().getTime()-400*86400000));
    Object.keys(z.bk).forEach(function(k){ if(k.slice(0,10)<cut) delete z.bk[k]; });
    Object.keys(z.satt).forEach(function(k){ if(k<cut) delete z.satt[k]; });
  }

  /* --- small helpers --- */
  function zPM(k){ var p = ZPM.filter(function(x){ return x[0]===k; })[0]; return p ? p[1] : 'Not recorded'; }
  function zMSorted(){ return G.members.slice().sort(function(a,b){ return a.no-b.no; }); }
  function zMOpts(cur,emptyLabel){ return (emptyLabel!=null?[['',emptyLabel]]:[]).concat(zMSorted().map(function(m){ return [m.id,'No. '+m.no+' · '+m.name]; })); }
  function zTOpts(cur,emptyLabel){ return (emptyLabel!=null?[['',emptyLabel]]:[]).concat(G.trainers.map(function(t){ return [t.id,t.name+(t.role?' · '+t.role:'')]; })); }
  function zName(id){ var m = gFind('members',id) || gFind('trainers',id) || gFind('employees',id); return m ? m.name : '(deleted)'; }
  function zIncAdd(src,amt,mode,note,mid,ref,d){ var r = {id:gId(),d:d||gK(gToday()),amt:Math.round(amt),src:src,mode:mode||'cash',note:note||'',mid:mid||'',ref:ref||''}; G.z.inc.push(r); return r; }
  function zIncSum(mk){ var t = 0; if(!G || !G.z) return 0; G.z.inc.forEach(function(r){ if(r.d.slice(0,7)===mk) t += r.amt; }); return t; }
  function zIncBy(mk){ var o = {}; G.z.inc.forEach(function(r){ if(r.d.slice(0,7)===mk) o[r.src] = (o[r.src]||0)+r.amt; }); return o; }
  function zFeeSum(mk){ var t = 0; G.members.forEach(function(e){ (e.paid||[]).forEach(function(p){ if(p.d.slice(0,7)===mk) t += p.amt; }); }); G.arch.forEach(function(a){ if(a.k==='m' && a.d.slice(0,7)===mk) t += a.amt; }); return t; }
  function zExpired(m){ return !m.freeze && m.fee>0 && gOk(m.next) && gDiff(gD(m.next),gToday())<0; }
  function zActive(m){ return !m.freeze && !zExpired(m); }
  function zAge(dob){ if(!gOk(dob)) return null; var b = gD(dob), t = gToday(), a = t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth() || (t.getMonth()===b.getMonth() && t.getDate()<b.getDate())) a--; return a; }
  function zDaysTo(md){ /* days until the next yearly date with this month-day (YYYY-MM-DD in) */
    if(!gOk(md)) return null; var t = gToday(), d = new Date(t.getFullYear(),+md.slice(5,7)-1,+md.slice(8,10),12);
    if(d<t) d = new Date(t.getFullYear()+1,+md.slice(5,7)-1,+md.slice(8,10),12); return gDiff(d,t);
  }
  function zFill(t,m,extra){
    return t.replace(/\{name\}/g,(m&&m.name||'').split(' ')[0]).replace(/\{gym\}/g,G.gym.name).replace(/\{due\}/g,m&&gOk(m.next)?gFmt(m.next):'').replace(/\{no\}/g,m?m.no:'')+(extra||'');
  }
  function zBarRow(label,val,max,txt,cls){ var w = max>0 ? Math.max(2,Math.round(val/max*100)) : 0; return '<div class="zbr"><div class="zbr-h"><span>'+label+'</span><b>'+txt+'</b></div><div class="zbr-t"><i class="'+(cls||'')+'" style="width:'+w+'%"></i></div></div>'; }
  function zLast(){ var vm = gVisitMap(); return vm; }
  function zPct(a,b){ return b>0 ? Math.round(a*100/b) : 0; }

  /* --- More menu and Home additions --- */
  function zMoreItems(){
    return [
      ['rep','Reports','Income, retention, busy hours, trainers','M4 20V10M10 20V4M16 20v-7M22 20H2'],
      ['cls','Class schedule','Batches, bookings, waitlist','M4 5h16v15H4zM4 9h16M8 3v4M16 3v4'],
      ['pt','Personal training','PT packages and sessions','M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12'],
      ['store','Store','Supplements, water, merchandise','M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2'],
      ['lock','Lockers','Assign, renew and free lockers','M6 11V8a6 6 0 0 1 12 0v3M5 11h14v10H5zM12 15v2'],
      ['pass','Day passes and trials','Walk-ins, trials and guests','M4 7h16v4a2 2 0 0 0 0 4v4H4v-4a2 2 0 0 0 0-4z'],
      ['satt','Staff attendance','Present, absent and leave','M9 11l2 2 4-4M5 4h14v16H5z'],
      ['eng','Birthdays and wishes','Birthdays and joining anniversaries','M5 21h14v-8H5zM12 13V8M12 8c-2 0-3-1.5-3-3 1.5 0 3 1.5 3 3zm0 0c2 0 3-1.5 3-3-1.5 0-3 1.5-3 3z'],
      ['bc','Broadcast','Message a group on WhatsApp','M3 11l14-6v14L3 13zM17 9h2a2 2 0 0 1 0 4h-2'],
      ['kiosk','Self check-in kiosk','Members check in on a tablet','M7 3h10v18H7zM11 18h2']
    ];
  }
  var ZGRP = [['Front desk',['att','kiosk','pass','cls','pt','store','lock']],['Members and growth',['rep','ren','leads','bc','eng','plans','studio']],['Team and money',['rem','satt']],['Gym setup',['equip','settings','backup']]];
  function zMoreHtml(items){
    var by = {}, used = {}; items.forEach(function(x){ by[x[0]] = x; });
    var btn = function(x){ used[x[0]] = 1; return '<button type="button" class="gmk2" data-g="tab" data-t="'+x[0]+'"><span class="gmk"><svg viewBox="0 0 24 24"><path d="'+x[3]+'"/></svg></span><span><b>'+x[1]+'</b><small>'+x[2]+'</small></span><i>›</i></button>'; };
    var h = '<div class="ghead2"><h3>More</h3><p>Everything else for running your gym.</p></div>';
    ZGRP.forEach(function(g){ var list = g[1].filter(function(id){ return by[id]; }); if(list.length) h += '<div class="zgrp"><h4>'+g[0]+'</h4>'+list.map(function(id){ return btn(by[id]); }).join('')+'</div>'; });
    var rest = items.filter(function(x){ return !used[x[0]]; }); if(rest.length) h += '<div class="zgrp"><h4>Other</h4>'+rest.map(btn).join('')+'</div>';
    return h;
  }
  function zHomeHtml(){
    var today = gK(gToday()), dow = gToday().getDay(), h = '';
    var bd = G.members.filter(function(m){ return gOk(m.dob) && m.dob.slice(5)===today.slice(5); });
    if(bd.length) h += '<button type="button" class="gbanner2 zbday" data-g="tab" data-t="eng"><b><svg class="zic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 21h16v-8H4zM4 16c2 1.5 4 1.5 5.3 0 1.4 1.5 3.6 1.5 5 0 1.4 1.5 3.4 1.5 5.7 0M12 13V9M12 9c-1.4 0-2.2-1-2.2-2.2C9.8 5.6 12 3 12 3s2.2 2.6 2.2 3.8C14.2 8 13.4 9 12 9z"/></svg>'+(bd.length===1?esc(bd[0].name)+'’s birthday today':bd.length+' birthdays today')+'</b><span>Send a wish on WhatsApp</span><i>›</i></button>';
    var risk = zRisk().length;
    if(risk) h += '<button type="button" class="gbanner2" data-g="tab" data-t="rep"><b>'+risk+' member'+(risk===1?'':'s')+' may stop coming</b><span>Active members who have not visited in 10 or more days</span><i>›</i></button>';
    h += '<div class="gquick zq">'+[['cls','Classes','M4 5h16v15H4zM4 9h16M8 3v4M16 3v4'],['pt','PT','M6 8v8M18 8v8M3 10v4M21 10v4M6 12h12'],['store','Store','M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2'],['rep','Reports','M4 20V10M10 20V4M16 20v-7M22 20H2']].map(function(x){ return '<button type="button" data-g="tab" data-t="'+x[0]+'"><svg viewBox="0 0 24 24"><path d="'+x[2]+'"/></svg><span>'+x[1]+'</span></button>'; }).join('')+'</div>';
    var cls = G.z.cls.filter(function(c){ return (c.days||[]).indexOf(dow)>=0; }).sort(function(a,b){ return a.time<b.time?-1:1; });
    if(cls.length){
      h += '<div class="gcard dark"><div class="grh"><h4>Classes today</h4><button type="button" class="glink" data-g="tab" data-t="cls">Schedule</button></div>'+cls.slice(0,5).map(function(c){ var b = zBk(today,c.id); return '<button type="button" class="gdr zrowbtn" data-g="x-zsess" data-id="'+c.id+'" data-v="'+today+'"><span>'+gT12(c.time)+' · '+esc(c.name)+'</span><b>'+b.m.length+'/'+c.cap+'</b></button>'; }).join('')+'</div>';
    }
    var sales = G.z.sales.filter(function(s){ return s.d===today; }), st = 0; sales.forEach(function(s){ st += s.amt; });
    var ptToday = 0; G.z.pt.forEach(function(p){ (p.log||[]).forEach(function(l){ if(l.d===today) ptToday++; }); });
    var passes = G.z.pass.filter(function(p){ return p.d===today; }).length;
    if(sales.length || ptToday || passes) h += '<div class="gcard dark"><h4>Today at the desk</h4><div class="gthree"><div><small>Store sales</small><b>'+gMoney(st)+'</b></div><div><small>PT sessions</small><b>'+ptToday+'</b></div><div><small>Day passes</small><b>'+passes+'</b></div></div></div>';
    return h;
  }

  /* --- reminders added to the Reminders page --- */
  function zRem(){
    var out = [], today = gK(gToday());
    G.z.pt.forEach(function(p){
      if(p.done) return; var left = p.sess-(p.used||0), m = gFind('members',p.mid); if(!m) return;
      var d = gOk(p.till) ? gDue(p.till) : null;
      if(left<=2 || (d && d.dd<=GREM)) out.push({t:'z',d:d && d.dd<=GREM ? d : {cls:'soon',txt:left+' session'+(left===1?'':'s')+' left',dd:1},html:'<div class="grem soon"><div class="grh">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>PT package · '+left+' of '+p.sess+' sessions left'+(gOk(p.till)?' · valid till '+gFmt(p.till):'')+'</small></div></div><div class="gra">'+(m.mobile?'<a class="gbtn ghost sm" href="'+gWa(m.mobile,'Hello '+m.name.split(' ')[0]+', your personal training package at '+G.gym.name+' has '+left+' session'+(left===1?'':'s')+' left. Shall we renew it so your training does not stop?')+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn gold sm" data-g="x-open" data-p="z-pt" data-id="'+p.id+'">Open</button></div></div>'});
    });
    G.z.lks.forEach(function(l){
      if(!l.mid || !gOk(l.till)) return; var d = gDue(l.till); if(d.dd>GREM) return; var m = gFind('members',l.mid);
      out.push({t:'z',d:d,html:'<div class="grem '+d.cls+'"><div class="grh"><span class="gav sm">'+l.no+'</span><div class="gn"><b>Locker '+l.no+(m?' · '+esc(m.name):'')+'</b><small>Locker rent till '+gFmt(l.till)+'</small></div><div class="gr"><i class="gchip '+d.cls+'">'+d.txt+'</i></div></div><div class="gra"><button type="button" class="gbtn gold sm" data-g="x-open" data-p="z-lk" data-id="'+l.no+'">Open</button></div></div>'});
    });
    G.z.prod.forEach(function(p){
      if(!(p.stock<=(p.low||0))) return;
      out.push({t:'z',d:{cls:p.stock<=0?'over':'soon',txt:p.stock<=0?'Out of stock':'Low stock',dd:p.stock<=0?-1:0},html:'<div class="grem '+(p.stock<=0?'over':'soon')+'"><div class="grh"><span class="gav sm">₹</span><div class="gn"><b>'+esc(p.name)+'</b><small>'+p.stock+' left in stock</small></div><div class="gr"><i class="gchip '+(p.stock<=0?'over':'soon')+'">'+(p.stock<=0?'Out of stock':'Low stock')+'</i></div></div><div class="gra"><button type="button" class="gbtn gold sm" data-g="x-open" data-p="z-prod" data-id="'+p.id+'">Restock</button></div></div>'});
    });
    G.members.forEach(function(m){
      if(!gOk(m.dob) || m.dob.slice(5)!==today.slice(5)) return;
      out.push({t:'z',d:{cls:'ok',txt:'Birthday',dd:0},html:'<div class="grem ok"><div class="grh">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>Birthday today'+(zAge(m.dob)!=null?' · turns '+zAge(m.dob):'')+'</small></div></div><div class="gra">'+(m.mobile?'<a class="gbtn gold sm" href="'+gWa(m.mobile,'Happy birthday, '+m.name.split(' ')[0]+'! 🎉 Everyone at '+G.gym.name+' wishes you a strong and healthy year ahead.')+'" target="_blank" rel="noopener">Send wish</a>':'')+'</div></div>'});
    });
    return out;
  }

  /* --- member form: profile extras --- */
  function zFormExtra(d){
    return '<details class="zmore"'+(d.dob||d.gender||d.emg?' open':'')+'><summary>More details: birthday, health, emergency contact</summary>'+
      '<div class="gtwo">'+'<div>'+gSel('Gender','zf-gen',[['','Not set'],['m','Male'],['f','Female'],['o','Other']],d.gender||'')+'</div><div>'+gFld('Date of birth','zf-dob',d.dob||'','date')+'</div></div>'+
      '<div class="gtwo"><div>'+gSel('Blood group','zf-bg',[['','Not set'],['A+','A+'],['A-','A−'],['B+','B+'],['B-','B−'],['AB+','AB+'],['AB-','AB−'],['O+','O+'],['O-','O−']],d.blood||'')+'</div><div>'+gSel('Goal','zf-goal',ZGOAL,d.goal||'')+'</div></div>'+
      '<div class="gtwo"><div>'+gFld('Height (cm)','zf-ht',d.ht||'','number','min="80" max="250" inputmode="numeric"')+'</div><div>'+gFld('Emergency contact','zf-emn',d.emn||'','text','maxlength="40"')+'</div></div>'+
      gFld('Emergency mobile','zf-emg',d.emg||'','tel','inputmode="numeric" maxlength="18"')+
      '<label class="gl" for="zf-med">Health notes (injuries, conditions, medicines)</label><textarea class="gin" id="zf-med" rows="2" maxlength="200">'+esc(d.med||'')+'</textarea>'+
      gSel('Referred by','zf-ref',zMOpts(d.ref,'No one').filter(function(o){ return !d.id || o[0]!==d.id; }),d.ref||'')+
      '<label class="gchk"><input type="checkbox" id="zf-dec"'+(d.dec?' checked':'')+'><span>Health declaration and gym rules signed</span></label>'+
    '</details>';
  }
  function zFormRead(o){
    var v = function(i){ var el = $(i); return el ? el.value.trim() : ''; };
    if(!$('zf-gen')) return;
    o.gender = v('zf-gen'); o.dob = gOk(v('zf-dob')) ? v('zf-dob') : ''; o.blood = v('zf-bg'); o.goal = v('zf-goal');
    var ht = parseFloat(v('zf-ht')); o.ht = ht>=80 && ht<=250 ? Math.round(ht) : '';
    o.emn = v('zf-emn'); o.emg = v('zf-emg').replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,''); o.med = v('zf-med'); o.ref = v('zf-ref'); o.dec = !!($('zf-dec') && $('zf-dec').checked);
  }
  function zRows(e){
    var h = '', g = {m:'Male',f:'Female',o:'Other'}[e.gender||''], age = zAge(e.dob), goal = (ZGOAL.filter(function(x){ return x[0]===e.goal; })[0]||['',''])[1];
    if(g || age!=null) h += gRow('Gender and age',(g||'—')+(age!=null?' · '+age+' yrs':''));
    if(gOk(e.dob)) h += gRow('Birthday',gD(e.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long'}));
    if(e.blood) h += gRow('Blood group',esc(e.blood));
    if(goal && e.goal) h += gRow('Goal',esc(goal));
    if(e.ht) { var pr = gProgData(e), lw = pr.filter(function(p){return p.w>0}).pop(); h += gRow('Height',e.ht+' cm'+(lw?' · BMI '+(lw.w/Math.pow(e.ht/100,2)).toFixed(1):'')); }
    if(e.emg) h += gRow('Emergency contact',esc((e.emn?e.emn+' · ':'')+e.emg));
    if(e.med) h += gRow('Health notes','<span class="zwarn">'+esc(e.med)+'</span>');
    if(e.ref){ var r = gFind('members',e.ref); if(r) h += gRow('Referred by',esc(r.name)); }
    var refs = G.members.filter(function(x){ return x.ref===e.id; }).length; if(refs) h += gRow('Has referred',refs+' member'+(refs===1?'':'s'));
    if(e.bal>0) h += gRow('Balance due','<span class="zwarn">'+gMoney(e.bal)+'</span>');
    if(e.dec===false && e.gender!==undefined) h += gRow('Health declaration','<span class="zwarn">Not signed</span>');
    var lk = G.z.lks.filter(function(l){ return l.mid===e.id; })[0]; if(lk) h += gRow('Locker','No. '+lk.no+(gOk(lk.till)?' · till '+gFmt(lk.till):''));
    return h;
  }
  function zDetailExtra(e){
    var h = '';
    h += '<button type="button" class="gbtn gold wide" data-g="x-open" data-p="z-pay" data-id="'+e.id+'">Collect payment (cash, UPI, card, part payment)</button>';
    var pts = G.z.pt.filter(function(p){ return p.mid===e.id; });
    h += '<div class="gcard dark"><div class="grh"><h4>Personal training</h4><button type="button" class="glink" data-g="x-zptnew" data-id="'+e.id+'">+ Sell package</button></div>'+(pts.length?pts.slice().reverse().map(function(p){ var t = gFind('trainers',p.tid), left = p.sess-(p.used||0); return '<button type="button" class="gdr zrowbtn" data-g="x-open" data-p="z-pt" data-id="'+p.id+'"><span>'+(t?esc(t.name):'No trainer')+' · '+p.sess+' sessions</span><b>'+(p.done||left<=0?'Finished':left+' left')+'</b></button>'; }).join(''):'<p class="ghint">No PT package. Sell one to track sessions and the trainer’s share.</p>')+'</div>';
    var books = [], today = gK(gToday());
    Object.keys(G.z.bk).forEach(function(k){ if(k.slice(0,10)>=today && G.z.bk[k].m.indexOf(e.id)>=0){ var c = G.z.cls.filter(function(x){ return x.id===k.slice(11); })[0]; if(c) books.push([k.slice(0,10),c]); } });
    if(books.length) h += '<div class="gcard dark"><h4>Upcoming classes</h4>'+books.sort().slice(0,6).map(function(b){ return '<div class="gdr zline"><span>'+gFmt(b[0])+' · '+gT12(b[1].time)+'</span><b>'+esc(b[1].name)+'</b></div>'; }).join('')+'</div>';
    var buys = G.z.sales.filter(function(s){ return s.mid===e.id; });
    if(buys.length){ var tot = 0; buys.forEach(function(s){ tot += s.amt; }); h += '<div class="gcard dark"><h4>Store purchases</h4><p class="gsum">'+gMoney(tot)+' in '+buys.length+' purchase'+(buys.length===1?'':'s')+'</p>'+buys.slice(-4).reverse().map(function(s){ return '<div class="gdr zline"><span>'+gFmt(s.d)+'</span><b>'+gMoney(s.amt)+'</b></div>'; }).join('')+'</div>'; }
    return h;
  }

  /* --- payments: mode, discount, part payment, balance --- */
  function zPayHtml(id){
    var e = gFind('members',id); if(!e) return '';
    var bal = e.bal||0, def = (e.fee||0)+bal;
    return gXHead('Collect payment')+'<div class="govb"><div class="gprof">'+gAvatar(e,'xl')+'<h2>'+esc(e.name)+'</h2><p>No. '+e.no+' · '+esc(gPlanName(e.plan))+'</p></div><div class="gcard dark">'+
      gRow('Plan fee',gMoney(e.fee||0))+(bal>0?gRow('Earlier balance','<span class="zwarn">'+gMoney(bal)+'</span>'):'')+gRow('Next fee date',gOk(e.next)?gFmt(e.next):'—')+
      '<label class="gchk"><input type="checkbox" id="zp-adv" checked><span>This pays the next '+esc(gPlanName(e.plan).toLowerCase())+' period (moves the fee date forward)</span></label>'+
      gFld('Amount received (₹)','zp-amt',def,'number','min="1" inputmode="numeric"')+gFld('Discount (₹, optional)','zp-disc','','number','min="0" inputmode="numeric"')+zModeSel('zp-mode','cash')+gFld('Note (optional)','zp-note','','text','maxlength="60" placeholder="For example, UPI ref 4521"')+
      '<label class="gchk"><input type="checkbox" id="zp-bill" checked><span>Make a bill for this payment</span></label>'+
      '<p class="ghint" id="zp-left"></p><p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-pay" data-id="'+id+'">Save payment</button></div></div>';
  }
  function zModeSel(id,cur){ return gSel('Payment mode',id,ZPM,cur||'cash'); }
  function zPaySave(id){
    var e = gFind('members',id); if(!e) return 'Member not found.';
    var amt = parseFloat($('zp-amt').value), disc = parseFloat($('zp-disc').value||'0'), adv = $('zp-adv').checked, mode = $('zp-mode').value, note = $('zp-note').value.trim(), today = gK(gToday());
    if(!(amt>=0) || (!(amt>0) && !(disc>0))) return 'Enter the amount received.';
    if(!(disc>=0)) return 'Enter a valid discount.';
    var owed = (adv?(e.fee||0):0)+(e.bal||0);
    if(amt+disc>owed+0.5 && !adv) return 'That is more than the balance of '+gMoney(owed)+'.';
    if(!e.paid) e.paid = [];
    e.paid.push({d:today,amt:Math.round(amt),f:e.next,mode:mode,disc:Math.round(disc)||0,note:note});
    e.bal = Math.max(0,Math.round(owed-amt-disc));
    if(adv){ var base = gOk(e.next) && gD(e.next)>=gToday() ? e.next : today; e.next = gAddM(base,gDur(e.plan)); }
    gSave();
    if($('zp-bill').checked && amt>0){ var inv = bCreate('members',e,(adv?'Membership fee · '+gPlanName(e.plan)+' plan':'Balance payment')+(disc>0?' (discount '+gMoney(disc)+')':''),Math.round(amt),today,'paid'); gS.ov = {type:'inv',id:inv.id}; gS.del = false; gRender(); toast('Payment saved'+(e.bal>0?'. Balance left: '+gMoney(e.bal):'')+'. Bill '+inv.no+' created.'); return ''; }
    gS.ov = {type:'detail',k:'members',id:e.id}; gS.del = false; gRender(); toast('Payment saved'+(e.bal>0?'. Balance left: '+gMoney(e.bal):'')+'.');
    return '';
  }

  /* --- class schedule and bookings --- */
  function zBk(date,cid){ var k = date+'|'+cid; if(!G.z.bk[k]) return {m:[],w:[],a:[]}; var b = G.z.bk[k]; if(!b.w) b.w = []; if(!b.a) b.a = []; return b; }
  function zBkW(date,cid){ var k = date+'|'+cid; if(!G.z.bk[k]) G.z.bk[k] = {m:[],w:[],a:[]}; return zBk(date,cid); }
  function zClsHtml(){
    var sel = gS.x.zd || gK(gToday()), t = gToday(), days = [], i;
    for(i=0;i<7;i++){ var d = new Date(t.getFullYear(),t.getMonth(),t.getDate()+i,12); days.push(gK(d)); }
    if(days.indexOf(sel)<0) sel = days[0];
    var dow = gD(sel).getDay(), list = G.z.cls.filter(function(c){ return (c.days||[]).indexOf(dow)>=0; }).sort(function(a,b){ return a.time<b.time?-1:1; });
    var h = gSub('Class schedule')+'<div class="ghead2"><p>Group classes and batches like Zumba, yoga, HIIT or morning strength. Book members, keep a waitlist and mark who came.</p></div>';
    h += '<div class="zdays" role="group" aria-label="Pick a day">'+days.map(function(d){ var dt = gD(d); return '<button type="button" class="'+(d===sel?'on':'')+'" aria-pressed="'+(d===sel)+'" data-g="x-zday" data-v="'+d+'"><small>'+ZDAY[dt.getDay()]+'</small><b>'+dt.getDate()+'</b></button>'; }).join('')+'</div>';
    if(!G.z.cls.length) return h+'<div class="gempty"><b>No classes yet</b><span>Add your first class with its days, time and how many people fit.</span></div><button type="button" class="gbtn gold wide" data-g="x-new" data-p="z-cls">+ Add class</button>';
    h += list.length ? '<div class="gsheet">'+list.map(function(c){ var b = zBk(sel,c.id), tr = gFind('trainers',c.tid), full = b.m.length>=c.cap; return '<button type="button" class="grow2" data-g="x-zsess" data-id="'+c.id+'" data-v="'+sel+'"><span class="zclt">'+gT12(c.time)+'<small>'+c.dur+' min</small></span><span class="gn"><b>'+esc(c.name)+'</b><small>'+(tr?esc(tr.name):'No trainer')+(c.room?' · '+esc(c.room):'')+'</small></span><span class="gr"><b>'+b.m.length+'/'+c.cap+'</b><i class="gchip '+(full?'over':b.m.length?'ok':'soon')+'">'+(full?(b.w.length?b.w.length+' waiting':'Full'):(c.cap-b.m.length)+' spots')+'</i></span></button>'; }).join('')+'</div>' : '<div class="gempty"><b>No classes on '+ZDAY[dow]+'</b><span>Pick another day, or add a class that runs on this day.</span></div>';
    h += '<button type="button" class="gbtn gold wide" data-g="x-new" data-p="z-cls">+ Add class</button>';
    h += '<div class="ghead2 gsp"><h3>All classes</h3></div><div class="gsheet">'+G.z.cls.slice().sort(function(a,b){ return a.time<b.time?-1:1; }).map(function(c){ return '<button type="button" class="grow2" data-g="x-open" data-p="z-cls" data-id="'+c.id+'"><span class="gn"><b>'+esc(c.name)+'</b><small>'+(c.days||[]).map(function(x){ return ZDAY[x]; }).join(', ')+' · '+gT12(c.time)+'</small></span><span class="gr"><small>'+c.cap+' places</small></span></button>'; }).join('')+'</div>';
    return h;
  }
  function zClsForm(id){
    var c = id ? G.z.cls.filter(function(x){ return x.id===id; })[0] : null; c = c || {name:'',tid:'',days:[1,3,5],time:'07:00',dur:45,cap:20,room:''};
    return gXHead(id?'Edit class':'Add class')+'<div class="govb"><div class="gcard dark">'+gFld('Class name','zc-name',c.name,'text','maxlength="40" placeholder="For example, Morning Zumba"')+gSel('Trainer','zc-t',zTOpts(c.tid,'No trainer'),c.tid)+
      '<span class="gl">Days</span><div class="zdaypick">'+ZDAY.map(function(d,i){ return '<label><input type="checkbox" id="zc-d'+i+'"'+((c.days||[]).indexOf(i)>=0?' checked':'')+'><span>'+d+'</span></label>'; }).join('')+'</div>'+
      '<div class="gtwo"><div>'+gFld('Start time','zc-time',c.time,'time')+'</div><div>'+gFld('Length (minutes)','zc-dur',c.dur,'number','min="10" max="240" inputmode="numeric"')+'</div></div>'+
      '<div class="gtwo"><div>'+gFld('Places (capacity)','zc-cap',c.cap,'number','min="1" max="300" inputmode="numeric"')+'</div><div>'+gFld('Room or area (optional)','zc-room',c.room,'text','maxlength="30"')+'</div></div>'+
      '<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-cls" data-id="'+(id||'')+'">Save class</button>'+(id?gDelBtn('z-cls',id):'')+'</div></div>';
  }
  function zSessHtml(cid,date){
    var c = G.z.cls.filter(function(x){ return x.id===cid; })[0]; if(!c) return gXHead('Class')+'<div class="govb"><p class="ghint">This class was deleted.</p></div>';
    var b = zBk(date,cid), tr = gFind('trainers',c.tid), past = date<gK(gToday());
    var free = zMSorted().filter(function(m){ return b.m.indexOf(m.id)<0 && b.w.indexOf(m.id)<0; });
    var h = gXHead(esc(c.name))+'<div class="govb"><div class="gcard dark gnext ok"><small>'+gFmt(date)+' · '+ZDAY[gD(date).getDay()]+'</small><h3>'+gT12(c.time)+' · '+c.dur+' min</h3><p>'+(tr?'Trainer: <b>'+esc(tr.name)+'</b> · ':'')+b.m.length+' of '+c.cap+' places booked'+(b.a.length?' · '+b.a.length+' came':'')+'</p></div>';
    h += '<div class="gcard dark"><h4>Book a member</h4>'+(free.length?'<select class="gin" id="zs-m" aria-label="Member">'+free.map(function(m){ return '<option value="'+m.id+'">No. '+m.no+' · '+esc(m.name)+'</option>'; }).join('')+'</select><button type="button" class="gbtn gold wide" data-g="x-zbook" data-id="'+cid+'" data-v="'+date+'">'+(b.m.length>=c.cap?'Add to waitlist':'Book place')+'</button>':'<p class="ghint">Every member is already booked or waiting.</p>')+'</div>';
    h += '<div class="gcard dark"><h4>Booked ('+b.m.length+')</h4>'+(b.m.length?b.m.map(function(id){ var m = gFind('members',id); if(!m) return ''; var came = b.a.indexOf(id)>=0; return '<div class="grh zbk">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>No. '+m.no+'</small></div><div class="zbka"><button type="button" class="gbtn sm '+(came?'gold':'ghost')+'" data-g="x-zcame" data-id="'+cid+'" data-v="'+date+'" data-m="'+id+'" aria-pressed="'+came+'">'+(came?'Came ✓':'Mark came')+'</button>'+(m.mobile&&!past?'<a class="gbtn ghost sm" href="'+gWa(m.mobile,'Hello '+m.name.split(' ')[0]+', your place in '+c.name+' at '+G.gym.name+' is booked for '+gFmt(date)+' at '+gT12(c.time)+'. See you there!')+'" target="_blank" rel="noopener">Remind</a>':'')+'<button type="button" class="gbtn ghost sm" data-g="x-zunbook" data-id="'+cid+'" data-v="'+date+'" data-m="'+id+'" aria-label="Remove '+esc(m.name)+'">✕</button></div></div>'; }).join(''):'<p class="ghint">No one booked yet.</p>')+'</div>';
    if(b.w.length) h += '<div class="gcard dark"><h4>Waitlist ('+b.w.length+')</h4><p class="ghint">When someone is removed, the first person here moves in by themselves.</p>'+b.w.map(function(id,ix){ var m = gFind('members',id); if(!m) return ''; return '<div class="grh zbk"><span class="gav sm">'+(ix+1)+'</span><div class="gn"><b>'+esc(m.name)+'</b><small>No. '+m.no+'</small></div><div class="zbka"><button type="button" class="gbtn ghost sm" data-g="x-zunbook" data-id="'+cid+'" data-v="'+date+'" data-m="'+id+'" aria-label="Remove '+esc(m.name)+'">✕</button></div></div>'; }).join('')+'</div>';
    h += '<button type="button" class="gbtn ghost wide" data-g="x-open" data-p="z-cls" data-id="'+cid+'">Edit class</button></div>';
    return h;
  }

  /* --- personal training --- */
  function zPtHtml(){
    var seg = gS.x.zpt || 'on', on = G.z.pt.filter(function(p){ return !p.done && (p.used||0)<p.sess; }), off = G.z.pt.filter(function(p){ return p.done || (p.used||0)>=p.sess; });
    var list = (seg==='on'?on:off).slice().reverse(), mk = gMk(), earn = zPtEarn(mk);
    var h = gSub('Personal training')+'<div class="gstats three">'+gStat(on.length,'Active packages')+gStat(earn.sess,'Sessions this month')+gStat(gMoney(earn.inc),'PT income this month')+'</div>';
    h += '<button type="button" class="gbtn gold wide" data-g="x-new" data-p="z-pt">+ Sell PT package</button>';
    h += '<div class="gseg two" role="tablist">'+[['on','Active ('+on.length+')'],['off','Finished ('+off.length+')']].map(function(t){ return '<button type="button" role="tab" aria-selected="'+(seg===t[0])+'" class="'+(seg===t[0]?'on':'')+'" data-g="x-zpts" data-v="'+t[0]+'">'+t[1]+'</button>'; }).join('')+'</div>';
    if(!list.length) h += '<div class="gempty"><b>'+(seg==='on'?'No active packages':'Nothing finished yet')+'</b><span>Sell a package, then tap “Log session” after every PT session.</span></div>';
    else h += '<div class="gsheet">'+list.map(function(p){ var m = gFind('members',p.mid), t = gFind('trainers',p.tid), used = p.used||0, left = p.sess-used, d = gOk(p.till) ? gDue(p.till) : null; return '<div class="zptrow"><button type="button" class="grow2" data-g="x-open" data-p="z-pt" data-id="'+p.id+'">'+(m?gAvatar(m,'sm'):'<span class="gav sm">?</span>')+'<span class="gn"><b>'+esc(m?m.name:'(deleted member)')+'</b><small>'+(t?esc(t.name):'No trainer')+' · '+used+' of '+p.sess+' done'+(d&&seg==='on'?' · '+(d.dd<0?'expired':'till '+gFmt(p.till)):'')+'</small><span class="zbr-t sm"><i style="width:'+zPct(used,p.sess)+'%"></i></span></span><span class="gr"><b>'+(seg==='on'?left+' left':'Done')+'</b></span></button>'+(seg==='on'?'<button type="button" class="gbtn gold sm" data-g="x-zptlog" data-id="'+p.id+'">Log session</button>':'')+'</div>'; }).join('')+'</div>';
    if(G.trainers.length) h += '<div class="gcard dark"><h4>Trainer share this month</h4>'+G.trainers.map(function(t){ var x = earn.by[t.id]||{s:0,c:0}; return '<div class="gdr zline"><span>'+esc(t.name)+' · '+x.s+' session'+(x.s===1?'':'s')+'</span><b>'+gMoney(x.c)+'</b></div>'; }).join('')+'<p class="ghint">Share = package price ÷ sessions × the trainer’s percent, for every session done this month.</p></div>';
    return h;
  }
  function zPtEarn(mk){
    var o = {sess:0,inc:0,by:{}};
    G.z.inc.forEach(function(r){ if(r.src==='pt' && r.d.slice(0,7)===mk) o.inc += r.amt; });
    G.z.pt.forEach(function(p){ var per = p.sess>0 ? p.price/p.sess : 0; (p.log||[]).forEach(function(l){ if(l.d.slice(0,7)!==mk) return; o.sess++; var b = o.by[p.tid] || (o.by[p.tid] = {s:0,c:0}); b.s++; b.c += Math.round(per*(p.com||0)/100); }); });
    return o;
  }
  function zPtForm(id,mid){
    var p = id ? G.z.pt.filter(function(x){ return x.id===id; })[0] : null;
    if(p){
      var m = gFind('members',p.mid), t = gFind('trainers',p.tid), used = p.used||0, left = p.sess-used;
      var h = gXHead('PT package')+'<div class="govb"><div class="gcard dark gnext '+(left<=0||p.done?'ok':left<=2?'soon':'ok')+'"><small>'+esc(m?m.name:'(deleted member)')+' · '+(t?esc(t.name):'No trainer')+'</small><h3>'+(p.done||left<=0?'Finished':left+' of '+p.sess+' sessions left')+'</h3><p>'+gMoney(p.price)+' · started '+gFmt(p.start)+(gOk(p.till)?' · valid till '+gFmt(p.till):'')+' · trainer share '+(p.com||0)+'%</p>'+(!p.done&&left>0?'<button type="button" class="gbtn gold wide" data-g="x-zptlog" data-id="'+p.id+'">Log a session today</button>':'')+'</div>';
      h += '<div class="gcard dark"><h4>Sessions done ('+used+')</h4>'+((p.log||[]).length?(p.log||[]).slice().reverse().slice(0,20).map(function(l,ix){ return '<div class="gdr zline"><span>'+gFmt(l.d)+(l.t?' · '+gT12(l.t):'')+'</span><b>No. '+(used-ix)+'</b></div>'; }).join('')+'<button type="button" class="gbtn ghost wide" data-g="x-zptundo" data-id="'+p.id+'">Undo last session</button>':'<p class="ghint">No sessions logged yet.</p>')+'</div>';
      h += '<div class="gbills">'+(m&&m.mobile?'<a class="gbtn ghost wide" href="'+gWa(m.mobile,'Hello '+m.name.split(' ')[0]+', you have '+left+' personal training session'+(left===1?'':'s')+' left with '+(t?t.name:'us')+' at '+G.gym.name+'.')+'" target="_blank" rel="noopener">Send sessions left on WhatsApp</a>':'')+(p.done?'':'<button type="button" class="gbtn ghost wide" data-g="x-zptend" data-id="'+p.id+'">Mark package finished</button>')+gDelBtn('z-pt',p.id)+'</div></div>';
      return h;
    }
    var today = gK(gToday());
    return gXHead('Sell PT package')+'<div class="govb"><div class="gcard dark">'+(G.members.length?gSel('Member','zt-m',zMOpts(),mid||''):'<p class="gerr">Add a member first.</p>')+gSel('Trainer','zt-t',zTOpts('','No trainer'),G.trainers[0]?G.trainers[0].id:'')+
      '<div class="gtwo"><div>'+gFld('Sessions','zt-s',12,'number','min="1" max="200" inputmode="numeric"')+'</div><div>'+gFld('Package price (₹)','zt-p','','number','min="0" inputmode="numeric" placeholder="For example, 6000"')+'</div></div>'+
      '<div class="gtwo"><div>'+gFld('Start date','zt-st',today,'date')+'</div><div>'+gFld('Valid till','zt-till',gAddM(today,2),'date')+'</div></div>'+
      '<div class="gtwo"><div>'+gFld('Trainer share (%)','zt-c',40,'number','min="0" max="100" inputmode="numeric"')+'</div><div>'+zModeSel('zt-mode','upi')+'</div></div>'+
      '<label class="gchk"><input type="checkbox" id="zt-bill" checked><span>Make a bill for this package</span></label><p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-pt" data-id="">Save package</button></div></div>';
  }

  /* --- store and point of sale --- */
  function zStoreHtml(){
    var today = gK(gToday()), mk = gMk(), td = 0, mo = 0, prof = 0;
    G.z.sales.forEach(function(s){ if(s.d===today) td += s.amt; if(s.d.slice(0,7)===mk){ mo += s.amt; prof += s.amt-(s.cost||0); } });
    var low = G.z.prod.filter(function(p){ return p.stock<=(p.low||0); }).length;
    var h = gSub('Store')+'<div class="gstats three">'+gStat(gMoney(td),'Sold today')+gStat(gMoney(mo),'This month')+gStat(gMoney(prof),'Profit this month')+'</div>';
    h += '<div class="gtwo"><button type="button" class="gbtn gold" data-g="x-zsale">+ New sale</button><button type="button" class="gbtn ghost" data-g="x-new" data-p="z-prod">+ Add product</button></div>';
    if(low) h += '<p class="ghint zwarn">'+low+' product'+(low===1?' is':'s are')+' low or out of stock.</p>';
    if(!G.z.prod.length) h += '<div class="gempty"><b>No products yet</b><span>Add protein, water bottles, shakes, T-shirts, gloves or anything you sell at the desk.</span></div>';
    else h += '<div class="gsheet">'+G.z.prod.slice().sort(function(a,b){ return a.name<b.name?-1:1; }).map(function(p){ var cls = p.stock<=0?'over':p.stock<=(p.low||0)?'soon':'ok'; return '<button type="button" class="grow2" data-g="x-open" data-p="z-prod" data-id="'+p.id+'"><span class="gn"><b>'+esc(p.name)+'</b><small>'+gMoney(p.price)+(p.cost?' · cost '+gMoney(p.cost):'')+'</small></span><span class="gr"><i class="gchip '+cls+'">'+(p.stock<=0?'Out of stock':p.stock+' in stock')+'</i></span></button>'; }).join('')+'</div>';
    var rec = G.z.sales.slice(-8).reverse();
    if(rec.length) h += '<div class="gcard dark"><h4>Recent sales</h4>'+rec.map(function(s){ return '<div class="gdr zline"><span>'+gFmt(s.d)+' · '+esc(s.mid?zName(s.mid):'Walk-in')+' · '+s.items.map(function(it){ var p = G.z.prod.filter(function(x){ return x.id===it[0]; })[0]; return (p?p.name:'Item')+' ×'+it[1]; }).join(', ')+'</span><b>'+gMoney(s.amt)+'</b></div>'; }).join('')+'</div>';
    return h;
  }
  function zProdForm(id){
    var p = id ? G.z.prod.filter(function(x){ return x.id===id; })[0] : null; p = p || {name:'',price:'',cost:'',stock:'',low:3};
    return gXHead(id?'Product':'Add product')+'<div class="govb"><div class="gcard dark">'+gFld('Product name','zr-name',p.name,'text','maxlength="40" placeholder="For example, Whey protein 1 kg"')+
      '<div class="gtwo"><div>'+gFld('Selling price (₹)','zr-price',p.price,'number','min="1" inputmode="numeric"')+'</div><div>'+gFld('Cost price (₹, optional)','zr-cost',p.cost,'number','min="0" inputmode="numeric"')+'</div></div>'+
      '<div class="gtwo"><div>'+gFld('In stock','zr-stock',p.stock,'number','min="0" inputmode="numeric"')+'</div><div>'+gFld('Warn when stock is at','zr-low',p.low,'number','min="0" inputmode="numeric"')+'</div></div>'+
      (id?'<div class="gtwo"><div>'+gFld('Add new stock','zr-add','','number','min="1" inputmode="numeric" placeholder="For example, 10"')+'</div><div><span class="gl">&nbsp;</span><button type="button" class="gbtn ghost wide" data-g="x-zrestock" data-id="'+id+'">Add to stock</button></div></div>':'')+
      '<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-prod" data-id="'+(id||'')+'">Save product</button>'+(id?gDelBtn('z-prod',id):'')+'</div></div>';
  }
  function zSaleHtml(){
    var cart = gS.x.zcart || {}, tot = 0, n = 0;
    var rows = G.z.prod.slice().sort(function(a,b){ return a.name<b.name?-1:1; }).map(function(p){ var q = cart[p.id]||0; tot += q*p.price; n += q; return '<div class="zcart"><div class="gn"><b>'+esc(p.name)+'</b><small>'+gMoney(p.price)+' · '+(p.stock>0?p.stock+' in stock':'out of stock')+'</small></div><div class="zqty"><button type="button" class="giconb" data-g="x-zq" data-id="'+p.id+'" data-v="-1" aria-label="One less '+esc(p.name)+'"'+(q?'':' disabled')+'>−</button><b>'+q+'</b><button type="button" class="giconb" data-g="x-zq" data-id="'+p.id+'" data-v="1" aria-label="One more '+esc(p.name)+'"'+(q>=p.stock?' disabled':'')+'>+</button></div></div>'; }).join('');
    return gXHead('New sale')+'<div class="govb"><div class="gcard dark">'+(rows||'<p class="ghint">Add products first.</p>')+'</div><div class="gcard dark">'+gSel('Sold to','zs-buyer',zMOpts('','Walk-in customer'),gS.x.zbuyer||'')+zModeSel('zs-mode',gS.x.zmode||'cash')+'<div class="zsum"><span>'+n+' item'+(n===1?'':'s')+'</span><b>'+gMoney(tot)+'</b></div><p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-sale" data-id=""'+(n?'':' disabled')+'>Complete sale · '+gMoney(tot)+'</button></div></div>';
  }

  /* --- lockers --- */
  function zLk(no){ return G.z.lks.filter(function(l){ return l.no===no; })[0]; }
  function zLockHtml(){
    var n = G.z.lkn, h = gSub('Lockers');
    if(!n) return h+'<div class="gcard dark"><h4>How many lockers do you have?</h4>'+gFld('Number of lockers','zl-n','','number','min="1" max="500" inputmode="numeric" placeholder="For example, 40"')+'<button type="button" class="gbtn gold wide" data-g="x-zlkn">Set up lockers</button></div>';
    var used = 0, exp = 0, cells = '';
    for(var i=1;i<=n;i++){ var l = zLk(i), st = 'free', lbl = 'Free'; if(l && l.mid){ var d = gOk(l.till) ? gDue(l.till) : null; if(d && d.dd<0){ st = 'exp'; lbl = 'Expired'; exp++; } else { st = 'used'; lbl = zName(l.mid); } used++; } cells += '<button type="button" class="zlk '+st+'" data-g="x-open" data-p="z-lk" data-id="'+i+'" aria-label="Locker '+i+', '+esc(lbl)+'"><b>'+i+'</b><small>'+esc(st==='free'?'Free':lbl.split(' ')[0])+'</small></button>'; }
    h += '<div class="gstats three">'+gStat(n-used,'Free')+gStat(used-exp,'In use')+gStat(exp,'Expired',exp?'warn':'')+'</div><div class="zlgrid">'+cells+'</div>';
    h += '<div class="gcard dark"><h4>Change number of lockers</h4>'+gFld('Number of lockers','zl-n',n,'number','min="1" max="500" inputmode="numeric"')+'<button type="button" class="gbtn ghost wide" data-g="x-zlkn">Save</button></div>';
    return h;
  }
  function zLkForm(no){
    no = parseInt(no,10); var l = zLk(no), today = gK(gToday());
    if(l && l.mid){
      var m = gFind('members',l.mid), d = gOk(l.till) ? gDue(l.till) : null;
      return gXHead('Locker '+no)+'<div class="govb"><div class="gcard dark gnext '+(d?d.cls:'ok')+'"><small>Assigned to</small><h3>'+esc(m?m.name:'(deleted member)')+'</h3>'+(d?'<i class="gchip '+d.cls+'">'+(d.dd<0?'Expired '+gFmt(l.till):'Till '+gFmt(l.till))+'</i>':'')+'<p>Rent '+gMoney(l.fee||0)+' a month</p></div><div class="gcard dark"><h4>Renew</h4><div class="gtwo"><div>'+gFld('Months','zk-mo',1,'number','min="1" max="24" inputmode="numeric"')+'</div><div>'+zModeSel('zk-mode','cash')+'</div></div><button type="button" class="gbtn gold wide" data-g="x-zlkrenew" data-id="'+no+'">Renew and record rent</button></div><div class="gbills">'+(m&&m.mobile?'<a class="gbtn ghost wide" href="'+gWa(m.mobile,'Hello '+m.name.split(' ')[0]+', your locker no. '+no+' at '+G.gym.name+' is booked till '+gFmt(l.till)+'.')+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn ghost wide" data-g="x-zlkfree" data-id="'+no+'">Free this locker</button></div></div>';
    }
    return gXHead('Locker '+no)+'<div class="govb"><div class="gcard dark"><h4>Give this locker to a member</h4>'+(G.members.length?gSel('Member','zk-m',zMOpts(),''):'<p class="gerr">Add a member first.</p>')+'<div class="gtwo"><div>'+gFld('Months','zk-mo',1,'number','min="1" max="24" inputmode="numeric"')+'</div><div>'+gFld('Rent a month (₹)','zk-fee',200,'number','min="0" inputmode="numeric"')+'</div></div>'+zModeSel('zk-mode','cash')+'<p class="gerr" id="xf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-save" data-p="z-lk" data-id="'+no+'">Assign locker</button></div></div>';
  }

  /* --- day passes, trials and guests --- */
  function zPassHtml(){
    var today = gK(gToday()), list = G.z.pass.slice().reverse(), mk = gMk(), mt = 0, mn = 0; G.z.pass.forEach(function(p){ if(p.d.slice(0,7)===mk){ mt += p.fee||0; mn++; } });
    var h = gSub('Day passes and trials')+'<div class="gstats three">'+gStat(G.z.pass.filter(function(p){ return p.d===today; }).length,'Today')+gStat(mn,'This month')+gStat(gMoney(mt),'Collected this month')+'</div>';
    h += '<div class="gcard dark"><h4>Add a walk-in</h4>'+gFld('Name','zw-name','','text','maxlength="40"')+gFld('Mobile','zw-mob','','tel','inputmode="numeric" maxlength="18" placeholder="10-digit number"')+'<div class="gtwo"><div>'+gSel('Type','zw-type',[['day','Day pass'],['trial','Free trial'],['guest','Guest of a member'],['week','Week pass']],'day')+'</div><div>'+gFld('Fee (₹, 0 if free)','zw-fee',200,'number','min="0" inputmode="numeric"')+'</div></div>'+zModeSel('zw-mode','cash')+'<label class="gchk"><input type="checkbox" id="zw-lead" checked><span>Add to Enquiries for a follow-up call</span></label><p class="gerr" id="zw-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="x-zpass">Check in walk-in</button></div>';
    var T = {day:'Day pass',trial:'Free trial',guest:'Guest',week:'Week pass'};
    h += '<div class="gcard dark"><h4>Recent walk-ins</h4>'+(list.length?list.slice(0,30).map(function(p){ return '<div class="gdr zline"><span>'+gFmt(p.d)+' · '+esc(p.name)+' · '+T[p.type]+'</span><b>'+(p.fee?gMoney(p.fee):'Free')+'</b></div>'; }).join(''):'<p class="ghint">No walk-ins yet.</p>')+'</div>';
    return h;
  }

  /* --- staff attendance --- */
  function zSattHtml(){
    var d = gS.x.zsd || gK(gToday()), rec = G.z.satt[d] || {}, staff = G.trainers.map(function(x){ return ['trainers',x]; }).concat(G.employees.map(function(x){ return ['employees',x]; }));
    var h = gSub('Staff attendance')+'<div class="gmon"><button type="button" class="giconb" data-g="x-zsd" data-v="-1" aria-label="Previous day"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>'+gFmt(d)+'</b><button type="button" class="giconb" data-g="x-zsd" data-v="1" aria-label="Next day"'+(d>=gK(gToday())?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    if(!staff.length) return h+'<div class="gempty"><b>No staff yet</b><span>Add trainers and employees in the Staff tab.</span></div>';
    h += '<div class="gsheet">'+staff.map(function(s){ var e = s[1], v = rec[e.id]||''; return '<div class="zsrow"><div class="grh">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>'+esc(e.role||GKIND[s[0]].one)+'</small></div></div><div class="zpal" role="group" aria-label="'+esc(e.name)+'">'+[['p','Present'],['h','Half day'],['l','Leave'],['a','Absent']].map(function(o){ return '<button type="button" class="'+(v===o[0]?'on '+o[0]:'')+'" aria-pressed="'+(v===o[0])+'" data-g="x-zsat" data-id="'+e.id+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div></div>'; }).join('')+'</div>';
    var mk = d.slice(0,7), sum = {};
    Object.keys(G.z.satt).forEach(function(k){ if(k.slice(0,7)!==mk) return; var r = G.z.satt[k]; Object.keys(r).forEach(function(id){ var o = sum[id] || (sum[id] = {p:0,h:0,l:0,a:0}); o[r[id]]++; }); });
    h += '<div class="gcard dark"><h4>'+gMonthLbl(mk)+'</h4>'+staff.map(function(s){ var o = sum[s[1].id]||{p:0,h:0,l:0,a:0}; return '<div class="gdr zline"><span>'+esc(s[1].name)+'</span><b>'+(o.p+o.h/2)+' days · '+o.l+' leave · '+o.a+' absent</b></div>'; }).join('')+'</div>';
    return h;
  }

  /* --- birthdays and anniversaries --- */
  function zEngHtml(){
    var h = gSub('Birthdays and wishes'), bd = [], an = [];
    G.members.forEach(function(m){
      var d1 = zDaysTo(m.dob); if(d1!=null && d1<=30) bd.push([d1,m]);
      if(gOk(m.join)){ var j = gD(m.join), d2 = zDaysTo(m.join); if(d2!=null && d2<=30){ var y2 = (new Date(gToday().getTime()+d2*86400000)).getFullYear()-j.getFullYear(); if(y2>=1) an.push([d2,m,y2]); } }
    });
    bd.sort(function(a,b){ return a[0]-b[0]; }); an.sort(function(a,b){ return a[0]-b[0]; });
    var when = function(n){ return n===0?'Today':n===1?'Tomorrow':'In '+n+' days'; };
    h += '<div class="ghead2"><h3>Birthdays in the next 30 days</h3><p>Add a member’s date of birth in Edit details → More details.</p></div>';
    h += bd.length ? bd.map(function(x){ var m = x[1], age = zAge(m.dob); return '<div class="grem '+(x[0]===0?'ok':'')+'"><div class="grh">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>'+gD(m.dob).toLocaleDateString('en-IN',{day:'numeric',month:'long'})+(age!=null?' · turns '+(age+(x[0]===0?0:1)):'')+'</small></div><div class="gr"><i class="gchip '+(x[0]===0?'ok':'soon')+'">'+when(x[0])+'</i></div></div>'+(m.mobile?'<div class="gra"><a class="gbtn gold sm" href="'+gWa(m.mobile,'Happy birthday, '+m.name.split(' ')[0]+'! 🎉 Everyone at '+G.gym.name+' wishes you a strong and healthy year ahead. Come in today for a birthday workout!')+'" target="_blank" rel="noopener">Send wish</a></div>':'')+'</div>'; }).join('') : '<div class="gempty"><b>No birthdays coming up</b><span>Dates of birth you add will show here.</span></div>';
    h += '<div class="ghead2 gsp"><h3>Joining anniversaries</h3><p>Members completing a year or more with you.</p></div>';
    h += an.length ? an.map(function(x){ var m = x[1]; return '<div class="grem"><div class="grh">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>'+x[2]+' year'+(x[2]===1?'':'s')+' with '+esc(G.gym.name)+'</small></div><div class="gr"><i class="gchip ok">'+when(x[0])+'</i></div></div>'+(m.mobile?'<div class="gra"><a class="gbtn ghost sm" href="'+gWa(m.mobile,'Hello '+m.name.split(' ')[0]+'! Today you complete '+x[2]+' year'+(x[2]===1?'':'s')+' with '+G.gym.name+'. Thank you for training with us. Here’s to many more strong years! 💪')+'" target="_blank" rel="noopener">Send wish</a></div>':'')+'</div>'; }).join('') : '<div class="gempty"><b>None in the next 30 days</b><span>Members who joined a year or more ago will show here.</span></div>';
    return h;
  }

  /* --- broadcast on WhatsApp (one chat at a time; a web page cannot send in bulk) --- */
  function zAud(a){
    var vm = gVisitMap(), today = gToday();
    return zMSorted().filter(function(m){
      if(!m.mobile) return false;
      if(a==='all') return true;
      if(a==='active') return zActive(m);
      if(a==='due'){ return !m.freeze && m.fee>0 && gOk(m.next) && gDiff(gD(m.next),today)>=0 && gDiff(gD(m.next),today)<=7; }
      if(a==='exp') return zExpired(m);
      if(a==='frozen') return !!m.freeze;
      if(a==='away'){ var l = vm.last[m.id]; return zActive(m) && (l ? gDiff(today,gD(l))>=10 : gDiff(today,gD(m.join))>=7); }
      if(a==='bal') return m.bal>0;
      if(a==='bday'){ var d = zDaysTo(m.dob); return d!=null && d<=7; }
      return false;
    });
  }
  function zBcHtml(){
    var a = gS.x.zaud || 'active', t = gS.x.zmsg!=null ? gS.x.zmsg : ZMSG.offer, list = zAud(a), key = a+'|'+t.length, sent = G.z.sent[key]||{};
    var AUD = [['active','Active'],['due','Fee due in 7 days'],['exp','Expired'],['away','Not coming 10+ days'],['bal','Balance due'],['bday','Birthdays this week'],['frozen','Frozen'],['all','Everyone']];
    var h = gSub('Broadcast')+'<div class="ghead2"><p>Pick who gets the message, write it once, then tap Send for each member. WhatsApp opens with the message ready. {name}, {gym} and {due} fill in for each person.</p></div>';
    h += '<span class="gl">Send to</span><div class="gchips zwrap" role="group" aria-label="Audience">'+AUD.map(function(x){ return '<button type="button" class="'+(a===x[0]?'on':'')+'" aria-pressed="'+(a===x[0])+'" data-g="x-zaud" data-v="'+x[0]+'">'+x[1]+' ('+zAud(x[0]).length+')</button>'; }).join('')+'</div>';
    h += '<span class="gl">Start from</span><div class="gchips zwrap" role="group" aria-label="Message templates">'+[['offer','Offer'],['holiday','Holiday notice'],['fee','Fee reminder'],['miss','We miss you'],['event','Event']].map(function(x){ return '<button type="button" data-g="x-ztpl" data-v="'+x[0]+'">'+x[1]+'</button>'; }).join('')+'</div>';
    h += '<label class="gl" for="zb-msg">Message</label><textarea class="gin" id="zb-msg" rows="4" maxlength="700">'+esc(t)+'</textarea>';
    var nSent = list.filter(function(m){ return sent[m.id]; }).length;
    h += '<div class="gcard dark"><div class="grh"><h4>'+list.length+' member'+(list.length===1?'':'s')+'</h4><span class="ghint">'+nSent+' sent</span></div>'+(list.length?list.map(function(m){ var s = !!sent[m.id]; return '<div class="grh zbk">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>No. '+m.no+' · '+esc(m.mobile)+'</small></div><div class="zbka"><a class="gbtn sm '+(s?'ghost':'gold')+'" href="'+gWa(m.mobile,zFill(t,m))+'" target="_blank" rel="noopener" data-g="x-zsent" data-id="'+m.id+'">'+(s?'Sent ✓':'Send')+'</a></div></div>'; }).join('')+'<button type="button" class="gbtn ghost wide" data-g="x-zcopy">Copy all numbers</button>':'<p class="ghint">No members with a mobile number in this group.</p>')+'</div>';
    return h;
  }

  /* --- self check-in kiosk (full screen on the gym's tablet) --- */
  function zKioskHtml(){
    var k = gS.x.zk || {v:'',msg:'',ok:null,exit:false,pin:''};
    var keys = ['1','2','3','4','5','6','7','8','9','C','0','⌫'];
    var h = '<div class="zkiosk"><div class="zk-top">'+(G.gym.logo?'<img loading="lazy" decoding="async" src="'+G.gym.logo+'" alt="">':'')+'<div><b>'+esc(G.gym.name)+'</b><small>Self check-in</small></div><button type="button" class="giconb" data-g="x-zkexit" aria-label="Close kiosk"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>';
    if(k.exit){
      h += '<div class="zk-main"><h2>Enter the gym PIN to close the kiosk</h2><div class="zk-disp">'+(k.pin?k.pin.replace(/./g,'•'):'&nbsp;')+'</div>'+(k.msg?'<p class="zk-msg bad">'+esc(k.msg)+'</p>':'')+'<div class="zk-keys">'+keys.map(function(x){ return '<button type="button" data-g="x-zkpin" data-v="'+x+'">'+x+'</button>'; }).join('')+'</div><button type="button" class="gbtn ghost wide" data-g="x-zkback">Back to check-in</button></div></div>';
      return h;
    }
    h += '<div class="zk-main">'+(k.ok?'<div class="zk-ok '+(k.ok.warn?'warn':'')+'">'+gAvatar(k.ok.m,'xl')+'<h2>Welcome, '+esc(k.ok.m.name.split(' ')[0])+'!</h2><p>'+esc(k.ok.txt)+'</p></div>':'<h2>Enter your member number</h2><p class="zk-sub">Or the last 4 digits of your mobile number</p>')+
      '<div class="zk-disp">'+(k.v?esc(k.v):'&nbsp;')+'</div>'+(k.msg?'<p class="zk-msg bad">'+esc(k.msg)+'</p>':'')+'<div class="zk-keys">'+keys.map(function(x){ return '<button type="button" data-g="x-zkkey" data-v="'+x+'">'+x+'</button>'; }).join('')+'</div><button type="button" class="gbtn gold wide zk-go" data-g="x-zkgo"'+(k.v?'':' disabled')+'>Check in</button></div></div>';
    return h;
  }
  function zKioskGo(){
    var k = gS.x.zk, v = k.v, today = gK(gToday()), hit = G.members.filter(function(m){ return String(m.no)===v; });
    if(!hit.length && v.length===4) hit = G.members.filter(function(m){ return m.mobile && m.mobile.slice(-4)===v; });
    if(hit.length!==1){ k.msg = hit.length>1 ? 'More than one member matches. Please use your member number.' : 'No member found with '+v+'. Please ask at the desk.'; k.v = ''; k.ok = null; gRender(); if(typeof snd==='function') snd('err'); return; }
    var m = hit[0]; if(!G.att[today]) G.att[today] = [];
    var ex = G.att[today].filter(function(r){ return r[0]===m.id; })[0], st = gCheckState(m);
    if(!ex){ G.att[today].push([m.id,gNow()]); gSave(); }
    k.ok = {m:m,warn:!!st,txt:ex ? 'You already checked in at '+gT12(ex[1])+'.' : (st ? 'Checked in. Please see the desk: '+st.toLowerCase()+'.' : 'You are checked in. Have a great workout!')};
    k.v = ''; k.msg = ''; gRender(); if(typeof snd==='function') snd(st?'err':'ok');
    clearTimeout(zKioskGo.t); zKioskGo.t = setTimeout(function(){ if(gS.x.zk && gS.x.zk.ok){ gS.x.zk.ok = null; gRender(); } },4000);
  }

  /* --- reports --- */
  function zRisk(){
    var vm = gVisitMap(), today = gToday();
    return G.members.filter(function(m){ if(!zActive(m)) return false; var l = vm.last[m.id]; return l ? gDiff(today,gD(l))>=10 : gDiff(today,gD(m.join))>=7; }).map(function(m){ var l = vm.last[m.id]; return {m:m,days:l?gDiff(today,gD(l)):null}; }).sort(function(a,b){ return (b.days==null?999:b.days)-(a.days==null?999:a.days); });
  }
  function zRepHtml(){
    var mk = gS.x.zmk || gMk(), cur = mk===gMk(), vm = gVisitMap(), today = gToday();
    var h = gSub('Reports')+'<div class="gmon"><button type="button" class="giconb" data-g="x-zmon" data-v="-1" aria-label="Previous month"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><b>'+gMonthLbl(mk)+'</b><button type="button" class="giconb" data-g="x-zmon" data-v="1" aria-label="Next month"'+(cur?' disabled':'')+'><svg viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg></button></div>';
    var act = G.members.filter(zActive).length, exp = G.members.filter(zExpired).length, frz = G.members.filter(function(m){ return !!m.freeze; }).length;
    var joins = G.members.filter(function(m){ return (m.join||'').slice(0,7)===mk; }).length;
    var renewed = 0, renewSet = {}; G.members.forEach(function(m){ (m.paid||[]).forEach(function(p){ if(p.d.slice(0,7)===mk && p.f && p.f.slice(0,7)<=mk && (m.join||'').slice(0,7)!==mk && !renewSet[m.id]){ renewSet[m.id] = 1; renewed++; } }); });
    var lapsed = G.members.filter(function(m){ return zExpired(m) && m.next.slice(0,7)===mk; }).length;
    var visits = 0, days = 0; Object.keys(G.att).forEach(function(d){ if(d.slice(0,7)===mk){ visits += G.att[d].length; days++; } });
    var fees = zFeeSum(mk), by = zIncBy(mk), other = 0; Object.keys(by).forEach(function(k){ other += by[k]; });
    var inc = fees+other, fin = gFin(mk);
    h += '<div class="gstats">'+gStat(act,'Active members')+gStat(joins,'New joins')+gStat(renewed,'Renewed')+gStat(lapsed,'Lapsed this month',lapsed?'warn':'')+'</div>';
    h += '<div class="gstats zst2">'+gStat(gMoney(inc),'Income')+gStat(gMoney(fin.out),'Spent')+gStat((fin.profit<0?'−':'')+gMoney(Math.abs(fin.profit)),'Profit',fin.profit<0?'warn':'')+gStat(act?gMoney(inc/act):'—','Per active member')+'</div>';
    var rr = zPct(renewed,renewed+lapsed);
    h += '<div class="gcard dark"><h4>Retention</h4>'+(renewed+lapsed?zBarRow('Renewal rate',rr,100,rr+'%',rr>=70?'ok':rr>=50?'':'bad'):'<p class="ghint">No plans ran out in this month yet, so there is no renewal rate.</p>')+'<div class="gthree"><div><small>Expired now</small><b>'+exp+'</b></div><div><small>Frozen</small><b>'+frz+'</b></div><div><small>Avg visits a day</small><b>'+(days?Math.round(visits/days):0)+'</b></div></div><p class="ghint">Renewal rate = members who renewed this month ÷ (renewed + members whose plan ran out this month and did not renew).</p></div>';
    var src = [['fee',fees]].concat(Object.keys(ZSRC).filter(function(k){ return k!=='fee'; }).map(function(k){ return [k,by[k]||0]; })).filter(function(x){ return x[1]>0; }), mx = 0; src.forEach(function(x){ mx = Math.max(mx,x[1]); });
    h += '<div class="gcard dark"><h4>Income by source</h4>'+(src.length?src.map(function(x){ return zBarRow(ZSRC[x[0]],x[1],mx,gMoney(x[1])); }).join(''):'<p class="ghint">No income recorded in this month.</p>')+'</div>';
    h += '<div class="gcard dark"><h4>Income, last 12 months</h4>'+zTrend(mk)+'</div>';
    var modes = {}; G.members.forEach(function(m){ (m.paid||[]).forEach(function(p){ if(p.d.slice(0,7)===mk) modes[p.mode||'x'] = (modes[p.mode||'x']||0)+p.amt; }); }); G.z.inc.forEach(function(r){ if(r.d.slice(0,7)===mk) modes[r.mode||'x'] = (modes[r.mode||'x']||0)+r.amt; });
    var mm = Object.keys(modes), mmx = 0; mm.forEach(function(k){ mmx = Math.max(mmx,modes[k]); });
    if(mm.length) h += '<div class="gcard dark"><h4>Payment modes</h4>'+mm.sort(function(a,b){ return modes[b]-modes[a]; }).map(function(k){ return zBarRow(zPM(k),modes[k],mmx,gMoney(modes[k])+' · '+zPct(modes[k],inc)+'%'); }).join('')+'</div>';
    var pc = {}, pmx = 0; G.members.filter(zActive).forEach(function(m){ pc[m.plan] = (pc[m.plan]||0)+1; }); Object.keys(pc).forEach(function(k){ pmx = Math.max(pmx,pc[k]); });
    if(act) h += '<div class="gcard dark"><h4>Active members by plan</h4>'+Object.keys(pc).sort(function(a,b){ return pc[b]-pc[a]; }).map(function(k){ return zBarRow(esc(gPlanName(k)),pc[k],pmx,pc[k]+' · '+zPct(pc[k],act)+'%'); }).join('')+'</div>';
    h += '<div class="gcard dark"><h4>Busy hours, last 30 days</h4>'+zHeat()+'</div>';
    var risk = zRisk();
    h += '<div class="gcard dark"><div class="grh"><h4>May stop coming ('+risk.length+')</h4><button type="button" class="glink" data-g="x-zaudgo" data-v="away">Message all</button></div>'+(risk.length?risk.slice(0,8).map(function(x){ var m = x.m; return '<div class="grh zbk">'+gAvatar(m,'sm')+'<div class="gn"><b>'+esc(m.name)+'</b><small>'+(x.days==null?'No visit since joining':'Last visit '+x.days+' days ago')+'</small></div><div class="zbka">'+(m.mobile?'<a class="gbtn ghost sm" href="'+gWa(m.mobile,zFill(ZMSG.miss,m))+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'</div></div>'; }).join(''):'<p class="ghint">Every active member visited in the last 10 days.</p>')+'</div>';
    var top = G.members.map(function(m){ var n = 0; Object.keys(G.att).forEach(function(d){ if(d.slice(0,7)===mk && G.att[d].some(function(r){ return r[0]===m.id; })) n++; }); return [n,m]; }).filter(function(x){ return x[0]>0; }).sort(function(a,b){ return b[0]-a[0]; }).slice(0,10);
    if(top.length) h += '<div class="gcard dark"><h4>Most regular this month</h4>'+top.map(function(x,i){ return '<div class="gdr zline"><span><i class="zrank'+(i===0?' r1':'')+'">'+(i+1)+'</i>'+esc(x[1].name)+'</span><b>'+x[0]+' visit'+(x[0]===1?'':'s')+'</b></div>'; }).join('')+'</div>';
    if(G.trainers.length){ var pe = zPtEarn(mk); h += '<div class="gcard dark"><h4>Trainers</h4>'+G.trainers.map(function(t){ var ms = G.members.filter(function(m){ return m.trainer===t.id && zActive(m); }).length, x = pe.by[t.id]||{s:0,c:0}; return '<div class="gdr zline"><span>'+esc(t.name)+'</span><b>'+ms+' members · '+x.s+' PT · '+gMoney(x.c)+' share</b></div>'; }).join('')+'</div>'; }
    var lm = G.leads.filter(function(l){ return (l.created||'').slice(0,7)===mk; }), lj = lm.filter(function(l){ return l.status==='joined'; }).length, ll = lm.filter(function(l){ return l.status==='lost'; }).length;
    var pm = G.z.pass.filter(function(p){ return p.d.slice(0,7)===mk; }).length;
    h += '<div class="gcard dark"><h4>Enquiries and walk-ins</h4><div class="gthree"><div><small>Enquiries</small><b>'+lm.length+'</b></div><div><small>Joined</small><b>'+lj+'</b></div><div><small>Conversion</small><b>'+(lm.length?zPct(lj,lm.length)+'%':'—')+'</b></div></div><div class="gthree"><div><small>Lost</small><b>'+ll+'</b></div><div><small>Still open</small><b>'+(lm.length-lj-ll)+'</b></div><div><small>Day passes</small><b>'+pm+'</b></div></div></div>';
    var gen = {m:0,f:0,o:0,x:0}, ag = {'Under 18':0,'18–25':0,'26–35':0,'36–45':0,'46–60':0,'60+':0}, agn = 0;
    G.members.filter(zActive).forEach(function(m){ gen[m.gender||'x']++; var a = zAge(m.dob); if(a!=null){ agn++; ag[a<18?'Under 18':a<=25?'18–25':a<=35?'26–35':a<=45?'36–45':a<=60?'46–60':'60+']++; } });
    if(gen.m+gen.f+gen.o) h += '<div class="gcard dark"><h4>Members</h4><div class="gthree"><div><small>Men</small><b>'+gen.m+'</b></div><div><small>Women</small><b>'+gen.f+'</b></div><div><small>Not set</small><b>'+(gen.x+gen.o)+'</b></div></div>'+(agn?Object.keys(ag).filter(function(k){ return ag[k]; }).map(function(k){ return zBarRow(k,ag[k],agn,ag[k]+''); }).join(''):'')+'</div>';
    var refs = {}; G.members.forEach(function(m){ if(m.ref) refs[m.ref] = (refs[m.ref]||0)+1; }); var rl = Object.keys(refs).map(function(id){ return [refs[id],gFind('members',id)]; }).filter(function(x){ return x[1]; }).sort(function(a,b){ return b[0]-a[0]; }).slice(0,5);
    if(rl.length) h += '<div class="gcard dark"><h4>Top referrers</h4>'+rl.map(function(x){ return '<div class="gdr zline"><span>'+esc(x[1].name)+'</span><b>'+x[0]+' brought in</b></div>'; }).join('')+'</div>';
    var bal = G.members.filter(function(m){ return m.bal>0; }), bt = 0; bal.forEach(function(m){ bt += m.bal; });
    if(bal.length) h += '<div class="gcard dark"><div class="grh"><h4>Balance due · '+gMoney(bt)+'</h4><button type="button" class="glink" data-g="x-zbal">Show members</button></div><p class="ghint">'+bal.length+' member'+(bal.length===1?' has':'s have')+' paid part of their fee.</p></div>';
    h += '<button type="button" class="gbtn ghost wide" data-g="x-zcsv" data-v="'+mk+'">Download income for '+gMonthLbl(mk)+' (Excel CSV)</button>';
    return h;
  }
  function zTrend(mk){
    var ms = [], i, mx = 1; for(i=11;i>=0;i--) ms.push(gMonthAdd(mk,-i));
    var data = ms.map(function(m){ var f = zFeeSum(m), o = zIncSum(m); mx = Math.max(mx,f+o); return {m:m,f:f,o:o}; });
    var lbl = function(m){ return new Date(+m.slice(0,4),+m.slice(5,7)-1,1).toLocaleDateString('en-IN',{month:'short'}).slice(0,3); };
    return '<div class="ztr" role="img" aria-label="Income for the last 12 months">'+data.map(function(d){ return '<div title="'+lbl(d.m)+': fees '+gMoney(d.f)+', other '+gMoney(d.o)+'">'+(d.o?'<i class="o" style="height:'+(d.o/mx*100).toFixed(1)+'%"></i>':'')+'<i style="height:'+(d.f/mx*100).toFixed(1)+'%'+(d.o?';border-radius:0':'')+'"></i></div>'; }).join('')+'</div><div class="ztrx">'+data.map(function(d){ return '<span class="'+(d.m===mk?'on':'')+'">'+lbl(d.m)+'</span>'; }).join('')+'</div><div class="glegend"><span><i style="background:var(--gold)"></i>Membership fees</span><span><i style="background:#7FB3E8"></i>PT, store, lockers, passes</span></div>';
  }
  function zHeat(){
    var grid = [], i, j, mx = 0, cut = gK(new Date(gToday().getTime()-30*86400000)), H0 = 5, H1 = 23;
    for(i=0;i<7;i++){ grid.push([]); for(j=H0;j<=H1;j++) grid[i].push(0); }
    Object.keys(G.att).forEach(function(d){ if(d<cut) return; var w = gD(d).getDay(); G.att[d].forEach(function(r){ var hr = parseInt((r[1]||'0').slice(0,2),10); if(hr>=H0 && hr<=H1){ grid[w][hr-H0]++; mx = Math.max(mx,grid[w][hr-H0]); } }); });
    if(!mx) return '<p class="ghint">Check members in for a few days to see your busy hours.</p>';
    var cols = H1-H0+1, h = '<div class="zheat" style="grid-template-columns:34px repeat('+cols+',minmax(0,1fr))"><span></span>';
    for(j=H0;j<=H1;j++) h += '<span class="zhx">'+(j%3===0?((j+11)%12+1)+(j<12?'a':'p'):'')+'</span>';
    [1,2,3,4,5,6,0].forEach(function(w){ h += '<span class="zhy">'+ZDAY[w]+'</span>'; for(j=0;j<cols;j++){ var v = grid[w][j], a = v ? (0.15+0.85*v/mx).toFixed(2) : 0; h += '<i style="opacity:'+(v?1:0.35)+';background:'+(v?'rgba(233,192,90,'+a+')':'var(--gline)')+'" title="'+ZDAY[w]+' '+((j+H0+11)%12+1)+(j+H0<12?' AM':' PM')+': '+v+'"></i>'; } });
    return h+'</div><p class="ghint">Darker = more check-ins in that hour. Use it to plan trainers and classes.</p>';
  }

  /* --- page router for the new tabs --- */
  function zTab(t){ return {rep:zRepHtml,cls:zClsHtml,pt:zPtHtml,store:zStoreHtml,lock:zLockHtml,pass:zPassHtml,satt:zSattHtml,eng:zEngHtml,bc:zBcHtml,kiosk:zKioskEntry}[t]; }
  function zKioskEntry(){ gS.x.zk = {v:'',msg:'',ok:null,exit:false,pin:''}; gS.tab = 'att'; setTimeout(function(){ gS.ov = {type:'x',page:'z-kiosk',id:''}; gRender(); },0); return gAttHtml(); }

  /* --- overlays, save and delete --- */
  function zOv(o){
    var pg = o.page;
    if(pg==='z-pay') return zPayHtml(o.id);
    if(pg==='z-cls') return zClsForm(o.id);
    if(pg==='z-sess') return zSessHtml(o.id,o.v);
    if(pg==='z-pt') return zPtForm(o.id,o.mid);
    if(pg==='z-prod') return zProdForm(o.id);
    if(pg==='z-sale') return zSaleHtml();
    if(pg==='z-lk') return zLkForm(o.id);
    if(pg==='z-kiosk') return zKioskHtml();
    return null;
  }
  function zSave(pg,id){
    if(pg.indexOf('z-')!==0) return false;
    var err = '', v = function(i){ var el = $(i); return el ? el.value.trim() : ''; }, today = gK(gToday());
    if(pg==='z-pay'){ err = zPaySave(id); if(err){ var e0 = $('xf-err'); e0.textContent = err; e0.hidden = false; } return true; }
    if(pg==='z-cls'){
      var nm = v('zc-name'), days = [], tm = v('zc-time'), du = parseInt(v('zc-dur'),10), cp = parseInt(v('zc-cap'),10);
      for(var i=0;i<7;i++) if($('zc-d'+i).checked) days.push(i);
      if(!nm) err = 'Enter the class name.'; else if(!days.length) err = 'Pick at least one day.'; else if(!/^\d{2}:\d{2}$/.test(tm)) err = 'Choose the start time.'; else if(!(du>=10 && du<=240)) err = 'Length must be 10 to 240 minutes.'; else if(!(cp>=1 && cp<=300)) err = 'Places must be 1 to 300.';
      if(!err){ var c = id ? G.z.cls.filter(function(x){ return x.id===id; })[0] : null, r = {name:nm,tid:v('zc-t'),days:days,time:tm,dur:du,cap:cp,room:v('zc-room')}; if(c) Object.keys(r).forEach(function(k){ c[k] = r[k]; }); else { r.id = gId(); G.z.cls.push(r); } }
    } else if(pg==='z-pt'){
      var mid = v('zt-m'), s = parseInt(v('zt-s'),10), pr = parseFloat(v('zt-p')||'0'), st = v('zt-st'), tl = v('zt-till'), cm = parseFloat(v('zt-c')||'0');
      if(!mid) err = 'Choose the member.'; else if(!(s>=1 && s<=200)) err = 'Sessions must be 1 to 200.'; else if(!(pr>=0)) err = 'Enter the price.'; else if(!gOk(st)) err = 'Choose the start date.'; else if(tl && !gOk(tl)) err = 'Choose a valid end date.'; else if(!(cm>=0 && cm<=100)) err = 'Trainer share must be 0 to 100.';
      if(!err){
        var p = {id:gId(),mid:mid,tid:v('zt-t'),sess:s,used:0,price:Math.round(pr),start:st,till:tl,com:cm,log:[],mode:v('zt-mode')};
        G.z.pt.push(p); if(pr>0) zIncAdd('pt',pr,p.mode,'PT package · '+s+' sessions',mid,p.id);
        var m = gFind('members',mid);
        if(pr>0 && $('zt-bill').checked && m){ var inv = bCreate('members',m,'Personal training · '+s+' sessions',Math.round(pr),today,'paid'); gSave(); gS.ov = {type:'inv',id:inv.id}; gS.del = false; gRender(); toast('PT package saved. Bill '+inv.no+' created.'); return true; }
      }
    } else if(pg==='z-prod'){
      var pn = v('zr-name'), pp = parseFloat(v('zr-price')), pc = parseFloat(v('zr-cost')||'0'), ps = parseInt(v('zr-stock')||'0',10), pl = parseInt(v('zr-low')||'0',10);
      if(!pn) err = 'Enter the product name.'; else if(!(pp>0)) err = 'Enter the selling price.'; else if(!(pc>=0)) err = 'Enter a valid cost.'; else if(!(ps>=0)) err = 'Enter the stock.'; else if(!(pl>=0)) err = 'Enter when to warn.';
      if(!err){ var pd = id ? G.z.prod.filter(function(x){ return x.id===id; })[0] : null, r2 = {name:pn,price:Math.round(pp),cost:Math.round(pc),stock:ps,low:pl}; if(pd) Object.keys(r2).forEach(function(k){ pd[k] = r2[k]; }); else { r2.id = gId(); G.z.prod.push(r2); } }
    } else if(pg==='z-sale'){
      var cart = gS.x.zcart||{}, items = [], amt = 0, cost = 0;
      Object.keys(cart).forEach(function(pid){ var q = cart[pid], pd2 = G.z.prod.filter(function(x){ return x.id===pid; })[0]; if(pd2 && q>0){ if(q>pd2.stock) err = 'Only '+pd2.stock+' of '+pd2.name+' left.'; items.push([pid,q,pd2.price]); amt += q*pd2.price; cost += q*(pd2.cost||0); } });
      if(!err && !items.length) err = 'Add at least one item.';
      if(!err){
        var buyer = v('zs-buyer'), mode = v('zs-mode'), sale = {id:gId(),d:today,t:gNow(),items:items,mid:buyer,mode:mode,amt:amt,cost:cost};
        items.forEach(function(it){ var pd3 = G.z.prod.filter(function(x){ return x.id===it[0]; })[0]; pd3.stock -= it[1]; });
        G.z.sales.push(sale); zIncAdd('store',amt,mode,'Store sale',buyer,sale.id); gS.x.zcart = {}; gS.x.zbuyer = ''; gS.x.zmode = mode;
        gSave(); gS.ov = null; gS.tab = 'store'; gRender(); toast('Sale saved · '+gMoney(amt)+'.'); return true;
      }
    } else if(pg==='z-lk'){
      var no = parseInt(id,10), lm = v('zk-m'), mo = parseInt(v('zk-mo'),10), fee = parseFloat(v('zk-fee')||'0');
      if(!lm) err = 'Choose the member.'; else if(!(mo>=1 && mo<=24)) err = 'Months must be 1 to 24.'; else if(!(fee>=0)) err = 'Enter the rent.';
      if(!err){ var old = G.z.lks.filter(function(l){ return l.mid===lm && l.no!==no; })[0]; if(old){ err = gFind('members',lm).name+' already has locker '+old.no+'.'; } }
      if(!err){ G.z.lks = G.z.lks.filter(function(l){ return l.no!==no; }); G.z.lks.push({no:no,mid:lm,fee:Math.round(fee),till:gAddM(today,mo),since:today}); if(fee>0) zIncAdd('lock',fee*mo,v('zk-mode'),'Locker '+no+' · '+mo+' month'+(mo===1?'':'s'),lm,String(no)); }
    }
    if(err){ var el = $('xf-err'); if(el){ el.textContent = err; el.hidden = false; } return true; }
    gSave(); gS.ov = null; gS.del = false; gRender(); toast('Saved.');
    return true;
  }
  function zDel(pg,id){
    if(pg.indexOf('z-')!==0) return false;
    if(pg==='z-cls'){ G.z.cls = G.z.cls.filter(function(x){ return x.id!==id; }); Object.keys(G.z.bk).forEach(function(k){ if(k.slice(11)===id) delete G.z.bk[k]; }); }
    else if(pg==='z-pt') G.z.pt = G.z.pt.filter(function(x){ return x.id!==id; });
    else if(pg==='z-prod') G.z.prod = G.z.prod.filter(function(x){ return x.id!==id; });
    gSave(); gS.ov = null; gS.del = false; gRender(); toast('Deleted.');
    return true;
  }

  /* --- actions (all start with "x-z") --- */
  function zAct(a,b,id,v){
    if(a.indexOf('x-z')!==0) return false;
    var today = gK(gToday()), k, c, p;
    if(a==='x-zday'){ gS.x.zd = v; gRender(); return true; }
    if(a==='x-zsess'){ gS.x.back = null; gS.del = false; gS.ov = {type:'x',page:'z-sess',id:id,v:v}; gRender(); var ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return true; }
    if(a==='x-zbook'){
      c = G.z.cls.filter(function(x){ return x.id===id; })[0]; var mid = $('zs-m') ? $('zs-m').value : ''; if(!c || !mid) return true;
      var bk = zBkW(v,id);
      if(bk.m.length<c.cap){ bk.m.push(mid); toast(zName(mid)+' booked.'); } else { bk.w.push(mid); toast(zName(mid)+' added to the waitlist.'); }
      gSave(); gKeep(gRender); return true;
    }
    if(a==='x-zunbook'){
      var mm = b.getAttribute('data-m'), bk2 = zBkW(v,id), wasIn = bk2.m.indexOf(mm)>=0;
      bk2.m = bk2.m.filter(function(x){ return x!==mm; }); bk2.w = bk2.w.filter(function(x){ return x!==mm; }); bk2.a = bk2.a.filter(function(x){ return x!==mm; });
      if(wasIn && bk2.w.length){ var nx = bk2.w.shift(); bk2.m.push(nx); toast(zName(nx)+' moved in from the waitlist.'); } else toast('Removed.');
      gSave(); gKeep(gRender); return true;
    }
    if(a==='x-zcame'){
      var m3 = b.getAttribute('data-m'), bk3 = zBkW(v,id);
      if(bk3.a.indexOf(m3)>=0) bk3.a = bk3.a.filter(function(x){ return x!==m3; }); else { bk3.a.push(m3); if(v===today){ if(!G.att[today]) G.att[today] = []; if(!G.att[today].some(function(r){ return r[0]===m3; })) G.att[today].push([m3,gNow()]); } }
      gSave(); gKeep(gRender); return true;
    }
    if(a==='x-zpts'){ gS.x.zpt = v; gRender(); return true; }
    if(a==='x-zptnew'){ gS.x.back = gS.ov; gS.ov = {type:'x',page:'z-pt',id:'',mid:id}; gRender(); return true; }
    if(a==='x-zptlog'){
      p = G.z.pt.filter(function(x){ return x.id===id; })[0]; if(!p) return true;
      if((p.used||0)>=p.sess){ toast('All sessions are used. Sell a new package.'); return true; }
      if(!p.log) p.log = []; p.log.push({d:today,t:gNow()}); p.used = (p.used||0)+1;
      var left = p.sess-p.used; if(left<=0) p.done = true;
      gSave(); gKeep(gRender); toast('Session logged. '+(left>0?left+' left.':'Package finished.')); return true;
    }
    if(a==='x-zptundo'){ p = G.z.pt.filter(function(x){ return x.id===id; })[0]; if(p && p.log && p.log.length){ p.log.pop(); p.used = Math.max(0,(p.used||0)-1); p.done = false; gSave(); gKeep(gRender); toast('Last session removed.'); } return true; }
    if(a==='x-zptend'){ p = G.z.pt.filter(function(x){ return x.id===id; })[0]; if(p){ p.done = true; gSave(); gS.ov = null; gRender(); toast('Package marked finished.'); } return true; }
    if(a==='x-zsale'){ gS.x.zcart = {}; gS.x.back = null; gS.ov = {type:'x',page:'z-sale',id:''}; gRender(); return true; }
    if(a==='x-zq'){
      var cart = gS.x.zcart || (gS.x.zcart = {}), pd = G.z.prod.filter(function(x){ return x.id===id; })[0]; if(!pd) return true;
      var by = $('zs-buyer'), md = $('zs-mode'); if(by) gS.x.zbuyer = by.value; if(md) gS.x.zmode = md.value;
      cart[id] = Math.max(0,Math.min(pd.stock,(cart[id]||0)+parseInt(v,10))); gKeep(gRender); return true;
    }
    if(a==='x-zrestock'){ p = G.z.prod.filter(function(x){ return x.id===id; })[0]; var add = parseInt(($('zr-add')||{}).value,10); if(!p) return true; if(!(add>0)){ toast('Enter how many to add.'); return true; } p.stock += add; gSave(); gKeep(gRender); toast(add+' added. '+p.stock+' in stock.'); return true; }
    if(a==='x-zlkn'){ var n = parseInt(($('zl-n')||{}).value,10); if(!(n>=1 && n<=500)){ toast('Enter 1 to 500 lockers.'); return true; } var busy = G.z.lks.filter(function(l){ return l.mid && l.no>n; }); if(busy.length){ toast('Locker '+busy[0].no+' is in use. Free it first.'); return true; } G.z.lkn = n; gSave(); gRender(); toast(n+' lockers ready.'); return true; }
    if(a==='x-zlkfree'){ G.z.lks = G.z.lks.filter(function(l){ return l.no!==parseInt(id,10); }); gSave(); gS.ov = null; gRender(); toast('Locker '+id+' is free.'); return true; }
    if(a==='x-zlkrenew'){ var l = zLk(parseInt(id,10)), mo = parseInt(($('zk-mo')||{}).value,10); if(!l) return true; if(!(mo>=1 && mo<=24)){ toast('Months must be 1 to 24.'); return true; } var base = gOk(l.till) && l.till>=today ? l.till : today; l.till = gAddM(base,mo); if(l.fee>0) zIncAdd('lock',l.fee*mo,($('zk-mode')||{}).value,'Locker '+l.no+' renewal',l.mid,String(l.no)); gSave(); gKeep(gRender); toast('Locker renewed till '+gFmt(l.till)+'.'); return true; }
    if(a==='x-zpass'){
      var nm = $('zw-name').value.trim(), mb = $('zw-mob').value.replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,''), ty = $('zw-type').value, fee = parseFloat($('zw-fee').value||'0'), er = $('zw-err');
      if(!nm){ er.textContent = 'Enter the name.'; er.hidden = false; return true; }
      if(mb && !/^\d{10}$/.test(mb)){ er.textContent = 'Enter a 10-digit mobile number, or leave it empty.'; er.hidden = false; return true; }
      if(!(fee>=0)){ er.textContent = 'Enter the fee.'; er.hidden = false; return true; }
      var ps = {id:gId(),d:today,t:gNow(),name:nm,mobile:mb,type:ty,fee:Math.round(fee),mode:$('zw-mode').value}; G.z.pass.push(ps);
      if(fee>0) zIncAdd('pass',fee,ps.mode,({day:'Day pass',trial:'Trial',guest:'Guest pass',week:'Week pass'})[ty]+' · '+nm,'',ps.id);
      if($('zw-lead').checked && !G.leads.some(function(x){ return x.mobile && x.mobile===mb && x.status==='open'; })) G.leads.push({id:gId(),name:nm,mobile:mb,note:({day:'Day pass',trial:'Free trial',guest:'Guest visit',week:'Week pass'})[ty]+' on '+gFmt(today),follow:gAddD(today,1),status:'open',created:today});
      gSave(); gRender(); toast(nm+' checked in.'); return true;
    }
    if(a==='x-zsd'){ var nd = gAddD(gS.x.zsd||today,parseInt(v,10)); if(nd>today) return true; gS.x.zsd = nd; gRender(); return true; }
    if(a==='x-zsat'){ var d = gS.x.zsd||today; if(!G.z.satt[d]) G.z.satt[d] = {}; if(G.z.satt[d][id]===v) delete G.z.satt[d][id]; else G.z.satt[d][id] = v; gSave(); gKeep(gRender); return true; }
    if(a==='x-zaud'){ var ta = $('zb-msg'); if(ta) gS.x.zmsg = ta.value; gS.x.zaud = v; gKeep(gRender); return true; }
    if(a==='x-zaudgo'){ gS.x.zaud = v; gS.x.zmsg = ZMSG.miss; gS.tab = 'bc'; gRender(); window.scrollTo(0,0); return true; }
    if(a==='x-ztpl'){ gS.x.zmsg = ZMSG[v]; gKeep(gRender); return true; }
    if(a==='x-zsent'){ var tt = gS.x.zmsg!=null ? gS.x.zmsg : ZMSG.offer, key = (gS.x.zaud||'active')+'|'+tt.length; if(!G.z.sent[key]) G.z.sent[key] = {}; G.z.sent[key][id] = 1; gSave(); setTimeout(function(){ gKeep(gRender); },300); return true; }
    if(a==='x-zcopy'){ var nums = zAud(gS.x.zaud||'active').map(function(m){ return m.mobile; }).join(', '); try{ navigator.clipboard.writeText(nums).then(function(){ toast('Numbers copied.'); },function(){ toast(nums); }); }catch(e){ toast(nums); } return true; }
    if(a==='x-zmon'){ var nm2 = gMonthAdd(gS.x.zmk||gMk(),parseInt(v,10)); if(nm2>gMk()) return true; gS.x.zmk = nm2; gRender(); return true; }
    if(a==='x-zbal'){ gS.mf = 'bal'; gS.tab = 'members'; gRender(); window.scrollTo(0,0); return true; }
    if(a==='x-zcsv'){
      var mk = v, r = [['Date','Source','Name','Amount','Mode','Note']];
      G.members.forEach(function(m){ (m.paid||[]).forEach(function(p){ if(p.d.slice(0,7)===mk) r.push([p.d,ZSRC.fee,m.name,p.amt,zPM(p.mode),p.note||'']); }); });
      G.z.inc.forEach(function(x){ if(x.d.slice(0,7)===mk) r.push([x.d,ZSRC[x.src]||x.src,x.mid?zName(x.mid):'',x.amt,zPM(x.mode),x.note]); });
      r = [r[0]].concat(r.slice(1).sort(function(a2,b2){ return a2[0]<b2[0]?-1:1; }));
      gSaveFile(new Blob([gCsv(r)],{type:'text/csv;charset=utf-8'}),'income-'+mk+'.csv'); return true;
    }
    if(a==='x-zkkey'){ var k1 = gS.x.zk; k1.msg = ''; if(v==='C') k1.v = ''; else if(v==='⌫') k1.v = k1.v.slice(0,-1); else if(k1.v.length<10) k1.v += v; k1.ok = null; gRender(); if(typeof snd==='function') snd('key'); return true; }
    if(a==='x-zkgo'){ if(gS.x.zk.v) zKioskGo(); return true; }
    if(a==='x-zkexit'){ gS.x.zk.exit = true; gS.x.zk.pin = ''; gS.x.zk.msg = ''; gRender(); return true; }
    if(a==='x-zkback'){ gS.x.zk.exit = false; gS.x.zk.pin = ''; gS.x.zk.msg = ''; gRender(); return true; }
    if(a==='x-zkpin'){
      var kk = gS.x.zk; kk.msg = '';
      if(v==='C') kk.pin = ''; else if(v==='⌫') kk.pin = kk.pin.slice(0,-1); else if(kk.pin.length<4) kk.pin += v;
      if(kk.pin.length===4){ var pin = kk.pin; gHash(pin,G.gym.salt,G.gym.hash.length<20,function(hh){ if(hh===G.gym.hash){ gS.x.zk = null; gS.ov = null; gRender(); toast('Kiosk closed.'); } else { kk.pin = ''; kk.msg = 'Wrong PIN.'; gRender(); if(typeof snd==='function') snd('err'); } }); }
      gRender(); return true;
    }
    return false;
  }
  $('gymroot').addEventListener('input',function(ev){ if(ev.target.id==='zb-msg'){ gS.x.zmsg = ev.target.value; } });

