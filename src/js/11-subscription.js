  /* ---------- Subscription screen: 3-month price, coupon, 30-day access with a running timer ----------
     This is a front-end demo. No payment is ever taken: the Pay button only shows a loading state and then an error.
     The coupon and its expiry are checked in this browser only. */
  var LICKEY = 'kdn.lic.v1', COUPON = 'maingaribhu', LIC_DAYS = 30;
  function licGet(){ try{ var t = localStorage.getItem(LICKEY); var o = t ? JSON.parse(t) : null; return (o && o.end>0 && o.start>0) ? o : null; }catch(e){ return null; } }
  function licSet(o){ try{ localStorage.setItem(LICKEY,JSON.stringify(o)); }catch(e){} }
  var licMem = null; /* fallback when storage is blocked */
  function lic(){ return licGet() || licMem; }
  function licensed(){ var l = lic(); return !!l && Date.now() < l.end; }
  /* Each licence is for one plan: ind, fam or gym. Older licences without a plan count as Individual. */
  var payPlan = 'ind';
  var PLANNAME = {ind:'Individual',fam:'Family',gym:'Gym'};
  function licPlan(){ var l = lic(); return l && PLANNAME[l.plan] ? l.plan : 'ind'; }
  function planOn(p){ return licensed() && licPlan()===p; }
  function healthOn(){ return licensed() && licPlan()!=='gym' && (HMED || hPeople().length>0); }
  function licOf(p){ return lic(); }
  function licSetPlan(p,l){ var c = lic(); if(!l.plan) l.plan = p; if(!c || c.end<l.end){ licSet(l); licMem = l; } }
  function licSwitch(p){ var l = lic(); if(!l || !PLANNAME[p]) return; l.plan = p; licSet(l); licMem = l; kWasOn = null; tickLic(); }
  function openPlans(){ show('s-pay'); }
  function two(n){ return n<10 ? '0'+n : ''+n; }
  function cdParts(ms){
    var s = Math.max(0,Math.floor(ms/1000));
    return {d:Math.floor(s/86400),h:Math.floor(s%86400/3600),m:Math.floor(s%3600/60),s:s%60};
  }
  function cdHtml(ms){
    var p = cdParts(ms);
    return [[p.d,'days'],[two(p.h),'hours'],[two(p.m),'min'],[two(p.s),'sec']].map(function(x){return '<div><b>'+x[0]+'</b><span>'+x[1]+'</span></div>'}).join('');
  }
  function untilTxt(l){
    var d = new Date(l.end);
    return d.toLocaleDateString('en-IN',{day:'numeric',month:'long',year:'numeric'})+' at '+d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'});
  }
  var payTimer = null, payBusy = false, doneTimer = null, payNoteTxt = '';
  function payGateNote(){
    var l = lic();
    payNoteTxt = l ? 'Your 30-day coupon access ended on '+untilTxt(l)+'. Apply a coupon again or buy the 3-month plan to continue.' : 'Please unlock KDN Fitness Tracker to continue.';
  }
  function paySetMode(m){ /* 'buy' | 'active' | 'done' */
    $('pay-buy').hidden = (m!=='buy'); $('pay-active').hidden = (m!=='active'); $('pay-done').hidden = (m!=='done');
  }
  function payShow(){
    var l = lic(), on = licensed();
    var note = $('pay-note');
    if(payNoteTxt){ note.textContent = payNoteTxt; note.hidden = false; payNoteTxt = ''; } else note.hidden = true;
    if(on){
      paySetMode('active');
      payPlan = licPlan();
      $('act-title').textContent = 'Coupon active · '+PLANNAME[payPlan]+' plan';
      $('act-sub').textContent = 'Full access to the '+PLANNAME[payPlan]+' plan until '+untilTxt(l)+'.';
      Array.prototype.forEach.call(document.querySelectorAll('#act-sw button'),function(b){ var on = b.getAttribute('data-sw')===payPlan; b.classList.toggle('on',on); b.setAttribute('aria-checked',on); });
      $('act-go').textContent = payPlan==='gym' ? 'Open Gym Manager' : payPlan==='fam' ? 'Open my family plan' : 'Open my plan';
    } else paySetMode('buy');
    $('payart').innerHTML = '<div class="pa m">'+frame(PL.ohpress[1],'m')+'</div><div class="pa f">'+frame(PL.ohpress[1],'f')+'</div>';
    tickLic();
  }
  var kWasOn = null;
  function tickLic(){
    var l = lic(), on = licensed();
    if(on!==kWasOn){ var first = kWasOn===null; kWasOn = on; kMenuSync(); if(!first){ renderLibrary(); renderFoods(); if(curScreen==='s-gym') show('s-gym'); } }
    var el = $('m-lic');
    if(el) el.textContent = on ? 'Active · '+(function(){var p = cdParts(l.end-Date.now()); return p.d+'d '+two(p.h)+':'+two(p.m)+':'+two(p.s)+' left'})() : (l ? 'Expired' : 'Not active');
    if(curScreen==='s-pay'){
      if(on){
        if(!$('pay-active').hidden) $('act-cd').innerHTML = cdHtml(l.end-Date.now());
        if(!$('pay-done').hidden) $('done-cd').innerHTML = cdHtml(l.end-Date.now());
      } else if(!$('pay-active').hidden || !$('pay-done').hidden){ payShow(); }
    } else if(!on && OPENSCR.indexOf(curScreen)<0 && KPREV.indexOf(curScreen)<0){
      payGateNote(); show('s-pay');
    }
  }
  setInterval(tickLic,1000);

  /* Pay button: loading for 5 seconds, then an error. Nothing is charged. */
  $('pay-btn').addEventListener('click',function(){
    if(payBusy) return;
    payBusy = true;
    var btn = $('pay-btn'); btn.disabled = true; btn.classList.add('busy');
    $('pay-spin').hidden = false; $('pay-lbl').textContent = 'Processing…';
    $('pay-err').hidden = true;
    setTimeout(function(){
      payBusy = false; btn.disabled = false; btn.classList.remove('busy');
      $('pay-spin').hidden = true; $('pay-lbl').textContent = 'Pay '+PLANS[curPlan].now;
      var e = $('pay-err'); e.textContent = 'Payment could not be completed. Online payments are not available in this version. Please use a coupon code to continue.'; e.hidden = false;
    },5000);
  });


  /* Trainer's Offer: HAPPY + 6 digits. Shows the 90% offer and trainer card; the offer itself is not live yet. */
  var TRCODES = ["happy015194", "happy017084", "happy025355", "happy025485", "happy067423", "happy081554", "happy089272", "happy149584", "happy208155", "happy247503", "happy267664", "happy309139", "happy337716", "happy346523", "happy361225", "happy374353", "happy377466", "happy378367", "happy399808", "happy435417", "happy487530", "happy487822", "happy492852", "happy500014", "happy513618", "happy528202", "happy554839", "happy557157", "happy559342", "happy561616", "happy596275", "happy630181", "happy641059", "happy679740", "happy696778", "happy696879", "happy698214", "happy721971", "happy730347", "happy736547", "happy775668", "happy782490", "happy832963", "happy902842", "happy904718", "happy925135", "happy925625", "happy962952", "happy967053", "happy979392", "happy986602"];
  $('tr-form').addEventListener('submit',function(ev){
    ev.preventDefault();
    var v = $('tr-in').value.trim().toLowerCase().replace(/\s+/g,''), m = $('tr-msg'), r = $('tr-rev');
    if(/^\d{6}$/.test(v)) v = 'happy'+v;
    if(!v){ r.hidden = true; m.textContent = 'Enter your trainer code first.'; m.hidden = false; return; }
    if(TRCODES.indexOf(v)<0){ r.hidden = true; m.textContent = 'That trainer code is not valid. Check it and try again.'; m.hidden = false; return; }
    m.hidden = true; r.hidden = false;
    r.scrollIntoView({behavior:'smooth',block:'nearest'});
    toast("Winter Trainer's Offer unlocked.");
  });

