  /* ---------- Gym manager ----------
     Everything is stored in this browser (IndexedDB). The PIN is stored as a salted hash, but this is a convenience lock,
     not bank-grade security: anyone with access to the browser profile and developer tools can read the stored data. */
  var GMAX = 500, GREM = 3;
  var GDB = {db:null,tried:false,mem:null}, G = null, gT = null, gTO = null, gLock = {n:0,until:0};
  var gS = {mf:'all',x:{},prefill:null,leadId:'',wa:null,bill:null,view:'loading',tab:'members',q:'',n:50,ov:null,tmp:{},pin:'',err:'',nextTouched:false,del:false,reset:false};
  var GPLANS = [['m1','Monthly',1],['m3','Quarterly (3 months)',3],['m6','Half-yearly (6 months)',6],['m12','Yearly',12]];
  var GKIND = {
    members:{one:'member',many:'Members',list:'members'},
    trainers:{one:'trainer',many:'Trainers',list:'trainers'},
    employees:{one:'employee',many:'Employees',list:'employees'}
  };

  /* --- storage --- */
  function gOpen(cb){
    if(GDB.tried){ cb(); return; }
    GDB.tried = true;
    try{
      var rq = indexedDB.open('kdn-gym',1);
      rq.onupgradeneeded = function(){ rq.result.createObjectStore('kv'); };
      rq.onsuccess = function(){ GDB.db = rq.result; cb(); };
      rq.onerror = function(){ cb(); }; rq.onblocked = function(){ cb(); };
    }catch(e){ cb(); }
  }
  function gLoad(cb){
    gOpen(function(){
      if(!GDB.db){ cb(GDB.mem||null); return; }
      try{ var r = GDB.db.transaction('kv').objectStore('kv').get('data'); r.onsuccess = function(){ cb(r.result||GDB.mem||null); }; r.onerror = function(){ cb(GDB.mem||null); }; }
      catch(e){ cb(GDB.mem||null); }
    });
  }
  function gSave(){ GDB.mem = G; clearTimeout(gT); gT = setTimeout(gFlush,200); }
  function gFlush(){
    clearTimeout(gT);
    if(!G) return;
    GDB.mem = G;
    if(!GDB.db) return;
    try{ GDB.db.transaction('kv','readwrite').objectStore('kv').put(G,'data'); }catch(e){}
  }
  function gWipe(){ G = null; GDB.mem = null; if(GDB.db){ try{ GDB.db.transaction('kv','readwrite').objectStore('kv').delete('data'); }catch(e){} } }
  function gFH(s){ var h = 2166136261; for(var i=0;i<s.length;i++){ h ^= s.charCodeAt(i); h = Math.imul(h,16777619)>>>0; } return 'f'+h.toString(16); }
  function gHash(pin,salt,useFallback,cb){
    var s = salt+':'+pin;
    if(!useFallback){
      try{
        if(window.crypto && crypto.subtle && window.TextEncoder){
          crypto.subtle.digest('SHA-256',new TextEncoder().encode(s)).then(function(b){ cb(Array.prototype.map.call(new Uint8Array(b),function(x){return ('0'+x.toString(16)).slice(-2)}).join('')); }).catch(function(){ cb(gFH(s)); });
          return;
        }
      }catch(e){}
    }
    cb(gFH(s));
  }
  function gImg(file,max,q,cb){
    var fr = new FileReader();
    fr.onload = function(){
      var im = new Image();
      im.onload = function(){
        var k = Math.min(1,max/Math.max(im.width,im.height)), c = document.createElement('canvas');
        c.width = Math.max(1,Math.round(im.width*k)); c.height = Math.max(1,Math.round(im.height*k));
        c.getContext('2d').drawImage(im,0,0,c.width,c.height);
        cb(c.toDataURL('image/jpeg',q));
      };
      im.onerror = function(){ cb(null); };
      im.src = fr.result;
    };
    fr.onerror = function(){ cb(null); };
    fr.readAsDataURL(file);
  }

  /* --- dates and money --- */
  function gD(s){ var a = s.split('-'); return new Date(+a[0],+a[1]-1,+a[2],12,0,0); }
  function gK(d){ return d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate()); }
  function gToday(){ var d = new Date(); return new Date(d.getFullYear(),d.getMonth(),d.getDate(),12,0,0); }
  function gDiff(a,b){ return Math.round((a-b)/86400000); }
  function gAddM(s,n){
    var d = gD(s), day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth()+n);
    d.setDate(Math.min(day,new Date(d.getFullYear(),d.getMonth()+1,0).getDate())); return gK(d);
  }
  function gFmt(s){ return gD(s).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}); }
  function gOk(s){ return /^\d{4}-\d{2}-\d{2}$/.test(s||'') && !isNaN(gD(s).getTime()); }
  function gMoney(n){ return '₹'+fmt(Math.round(n)); }
  function gSince(s){
    var a = gD(s), b = gToday(), days = gDiff(b,a);
    if(days<0) return 'Starts in '+(-days)+' day'+(days===-1?'':'s');
    if(days===0) return 'Joined today';
    var y = b.getFullYear()-a.getFullYear(), m = b.getMonth()-a.getMonth(), d = b.getDate()-a.getDate();
    if(d<0){ m--; d += new Date(b.getFullYear(),b.getMonth(),0).getDate(); }
    if(m<0){ y--; m += 12; }
    var parts = []; if(y) parts.push(y+' yr'+(y>1?'s':'')); if(m) parts.push(m+' mo'); if(d) parts.push(d+' day'+(d>1?'s':''));
    return fmt(days)+' day'+(days===1?'':'s')+(parts.length>1||y||m ? ' · '+parts.join(' ') : '');
  }
  function gDue(s){
    var dd = gDiff(gD(s),gToday());
    if(dd<0) return {cls:'over',txt:'Overdue by '+(-dd)+' day'+(dd===-1?'':'s'),dd:dd};
    if(dd===0) return {cls:'soon',txt:'Due today',dd:dd};
    if(dd<=GREM) return {cls:'soon',txt:'Due in '+dd+' day'+(dd===1?'':'s'),dd:dd};
    return {cls:'ok',txt:'In '+dd+' days',dd:dd};
  }
  function gPlansList(){ return (G && G.plans && G.plans.length) ? G.plans : GPLANS.map(function(p){ return {id:p[0],name:p[1],months:p[2],price:0}; }); }
  function gPlanById(id){ return gPlansList().filter(function(x){return x.id===id})[0]; }
  function gDur(id){ var p = gPlanById(id); return p ? p.months : 1; }
  function gPlanName(id){ var p = gPlanById(id); return p ? p.name : 'Monthly'; }
  function gId(){ return 'g'+Date.now().toString(36)+Math.random().toString(36).slice(2,6); }
  function gAvatar(e,cls){
    return e.photo ? '<img loading="lazy" decoding="async" class="gav '+(cls||'')+'" src="'+e.photo+'" alt="">' : '<span class="gav '+(cls||'')+'">'+esc((e.name||'?').charAt(0).toUpperCase())+'</span>';
  }
  function gBg(u){ return u ? ' style="--bg:url(\''+u+'\')"' : ''; }
  function gList(k){ return G[GKIND[k].list]; }
  function gFind(k,id){ return gList(k).filter(function(x){return x.id===id})[0]; }
  function gPayable(k,e){ return k==='members' ? (e.fee>0 && !e.freeze) : (e.pay==='sal' && e.salary>0); }
  function gReminders(){
    var out = [];
    ['members','trainers','employees'].forEach(function(k){
      gList(k).forEach(function(e){
        if(!gPayable(k,e) || !gOk(e.next)) return;
        var d = gDue(e.next); if(d.dd<=GREM) out.push({k:k,e:e,d:d,amt:k==='members'?e.fee:e.salary});
      });
    });
    out.sort(function(a,b){ return a.d.dd-b.d.dd; });
    return out;
  }

  /* --- entry and exit --- */
  function gymEnter(){
    gS.ov = null; gS.pin = ''; gS.err = ''; gS.tab = 'home'; gS.q = ''; gS.n = 50; gS.del = false; gS.reset = false;
    gS.view = 'loading'; gRender();
    gLoad(function(d){
      G = d;
      if(!G || !G.gym){ G = null; gS.view = 'setup'; gS.tmp = {logo:'',bg:'',mode:'new'}; }
      else { if(!G.members) G.members = []; if(!G.trainers) G.trainers = []; if(!G.employees) G.employees = []; gMig(); gS.view = 'login'; }
      if(curScreen==='s-gym') gRender();
    });
  }
  function gymLeave(){ gClearSet(); gFlush(); gS.view = 'loading'; document.body.classList.remove('noscroll'); clearTimeout(gTO); }
  function gLockNow(){ gFlush(); gS.view = 'login'; gS.pin = ''; gS.err = ''; gS.ov = null; document.body.classList.remove('noscroll'); gRender(); window.scrollTo(0,0); }

  /* --- rendering --- */
  function gRender(){
    var root = $('gymroot'), v = gS.view;
    gApplySet();
    if(v==='loading') root.innerHTML = '<div class="gcenter"><div class="gspin"></div></div>';
    else if(v==='setup') root.innerHTML = gSetupHtml();
    else if(v==='login'){ root.innerHTML = gLoginHtml(); gClockTick(); var pi = $('gl-pin'); if(pi && !gS.noFocus){ try{ pi.focus({preventScroll:true}); }catch(e){} } }
    else if(v==='opening') root.innerHTML = '<div class="glogin"'+gBg(G.gym.bg)+'><div class="gshade"></div><div class="gl-in"><div class="gcenter in"><div class="gspin big"></div><h2>Opening your dashboard…</h2><p>'+esc(G.gym.name)+'</p></div></div></div>';
    else if(v==='dash') root.innerHTML = gDashHtml();
    if(v==='dash' && typeof gBillAfter==='function') gBillAfter();
    document.body.classList.toggle('noscroll',v==='dash' && !!gS.ov);
    gAfterRender();
    if(typeof stAfter==='function') stAfter();
  }
  function gPhotoPick(id,label,val,round){
    return '<div class="gph"><div class="gphv'+(round?' round':'')+'" id="gp-'+id+'">'+(val?'<img loading="lazy" decoding="async" src="'+val+'" alt="">':'<span>'+(id==='logo'?'Logo':'Photo')+'</span>')+'</div><label class="gbtn ghost sm" for="gf-'+id+'">'+label+'</label><input type="file" id="gf-'+id+'" data-gph="'+id+'" accept="image/*" hidden></div>';
  }
  function gSetupHtml(){
    var edit = gS.tmp.mode==='edit', g = edit ? G.gym : {};
    var h = '<div class="gsetup"><div class="gbanner"'+gBg(gS.tmp.bg)+' id="gp-bgbox"><div class="gshade"></div><div class="gbn"><small>KDN Gym manager</small><h2>'+(edit?'Gym profile':'Set up your gym')+'</h2><p>'+(edit?'Update your gym’s details.':'Add your gym’s details once. Your members, trainers and employees will be saved under this gym.')+'</p></div></div>';
    h += '<div class="gcard"><div class="gphrow">'+gPhotoPick('logo','Profile photo',gS.tmp.logo,true)+gPhotoPick('bg','Background photo',gS.tmp.bg,false)+'</div>';
    h += '<label class="gl" for="gs-name">Gym name</label><input class="gin" id="gs-name" maxlength="50" placeholder="For example, Iron House Fitness" value="'+esc(g.name||'')+'" autocomplete="off">';
    h += '<label class="gl" for="gs-addr">Address</label><textarea class="gin" id="gs-addr" rows="3" maxlength="200" placeholder="Street, area, city">'+esc(g.address||'')+'</textarea>';
    h += '<label class="gl" for="gs-phone">Gym phone number</label><input class="gin" id="gs-phone" type="tel" inputmode="numeric" maxlength="18" placeholder="10-digit number" value="'+esc(g.phone||'')+'" autocomplete="off">';
    h += '<label class="gl" for="gs-pin">'+(edit?'New 4-digit PIN (leave empty to keep your current PIN)':'Choose a 4-digit PIN')+'</label><input class="gin pin" id="gs-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" autocomplete="new-password">';
    h += '<label class="gl" for="gs-pin2">Enter the PIN again</label><input class="gin pin" id="gs-pin2" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" autocomplete="new-password">';
    h += '<div class="gwarn"><b>Save your PIN somewhere safe.</b> Without the PIN you cannot open your gym’s data, and it cannot be recovered. Choose it carefully and write it down.</div>';
    h += '<label class="gchk"><input type="checkbox" id="gs-ok"><span>I have noted my PIN</span></label>';
    h += '<p class="gerr" id="gs-err" role="alert" hidden></p><div class="grow"><button type="button" class="gbtn gold wide" data-g="setup-save">'+(edit?'Save changes':'Save and continue')+'</button>'+(edit?'<button type="button" class="gbtn ghost" data-g="setup-cancel">Cancel</button>':'')+'</div></div></div>';
    return h;
  }
  function gLoginHtml(){
    var g = G.gym, d = new Date();
    var h = '<div class="glogin lock"'+gBg(g.bg)+'><div class="gshade lk"></div><div class="glk">';
    h += '<div class="glk-clock"><b id="glk-time">'+gClockTxt(d)+'</b><span id="glk-date">'+d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'})+'</span></div>';
    h += '<div class="glk-brand">'+(g.logo?'<img loading="lazy" decoding="async" class="gl-logo xl" src="'+g.logo+'" alt="">':'<span class="gl-logo xl ph">'+esc(g.name.charAt(0).toUpperCase())+'</span>')+'<h1>'+esc(g.name)+'</h1>';
    if(g.phone) h += '<p class="glk-ph"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/></svg>'+esc(g.phone)+'</p>';
    if(g.address) h += '<p class="glk-ad"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s7-6.2 7-11a7 7 0 0 0-14 0c0 4.8 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>'+esc(g.address)+'</p>';
    h += '</div>';
    if(gS.reset){
      h += '<div class="gcard dark glk-card"><h3>Forgot your PIN?</h3><p>A forgotten PIN cannot be recovered. You can erase this gym’s saved data on this device and set up again. This cannot be undone.</p><label class="gl" for="gr-in">Type DELETE to confirm</label><input class="gin" id="gr-in" autocomplete="off" autocapitalize="characters"><div class="grow"><button type="button" class="gbtn danger" data-g="reset-yes">Erase everything</button><button type="button" class="gbtn ghost" data-g="reset-no">Back</button></div></div>';
    } else {
      h += '<form class="glk-pin" id="gl-form" autocomplete="off" novalidate><label for="gl-pin" class="glk-l">Enter PIN to unlock</label><div class="glk-f'+(gS.err==='bad'?' shake':'')+'"><input id="gl-pin" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" autocomplete="off" placeholder="PIN" aria-label="4-digit PIN" value="'+esc(gS.pin)+'"><button type="submit" class="glk-go" aria-label="Unlock"><svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></button></div><p class="gerr" id="gl-err" role="alert"'+(gS.err?'':' hidden')+'>'+(gS.err==='bad' ? 'Wrong PIN. Please try again.' : esc(gS.err))+'</p></form>';
      h += '<div class="glk-links"><button type="button" class="glink" data-g="forgot">Forgot PIN?</button><button type="button" class="glink gexit2" data-g="s-exit">Exit to KDN home</button></div>';
    }
    return h+'</div></div>';
  }
  function gClockTxt(d){ return d.toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit',hour12:true}).replace(/\s?(am|pm)/i,function(m){ return ' '+m.trim().toUpperCase(); }); }
  var gClkT = 0;
  function gClockTick(){
    clearInterval(gClkT); if(!$('glk-time')) return;
    gClkT = setInterval(function(){ var e = $('glk-time'); if(!e){ clearInterval(gClkT); return; } var d = new Date(); e.textContent = gClockTxt(d); var f = $('glk-date'); if(f) f.textContent = d.toLocaleDateString('en-IN',{weekday:'long',day:'numeric',month:'long'}); },15000);
  }
  function gStat(n,l,cls){ return '<div class="gst '+(cls||'')+'"><b>'+n+'</b><span>'+l+'</span></div>'; }
  function gRemCount(){ return gReminders().length + gRemExtra().length; }
  var GNAV = [['home','Home','M4 11l8-7 8 7v9H4zM10 20v-5h4v5'],['members','Members','M5 20c0-3 3-5 7-5s7 2 7 5M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8'],['trainers','Staff','M3 9v6M6 6v12M18 6v12M21 9v6M6 12h12'],['money','Money','M4 6h16v12H4zM4 10h16M8 15h3'],['more','More','M5 12h.01M12 12h.01M19 12h.01']];
  function gNavOn(t){ var k = gS.tab; if(t==='trainers') return k==='trainers'||k==='employees'; if(t==='money') return k==='money'||k==='bills'; if(t==='more') return ['home','members','trainers','employees','money','bills'].indexOf(k)<0; return k===t; }
  function gDashHtml(){
    var g = G.gym, n = gRemCount();
    var h = '<div class="gdash"><div class="gtop'+(g.bg?' hasbg':'')+'"'+gBg(g.bg)+'>'+(g.bg?'<div class="gpic"></div>':'')+'<div class="gshade"></div><div class="gtin"><div class="gbrand">'+(g.logo?'<img loading="lazy" decoding="async" class="gl-logo sm" src="'+g.logo+'" alt="">':'<span class="gl-logo sm ph">'+esc(g.name.charAt(0).toUpperCase())+'</span>')+'<div><h1>'+esc(g.name)+'</h1>'+(g.address?'<p>'+esc(g.address)+'</p>':'')+'</div></div><div class="gtb"><button type="button" class="giconb" data-g="tab" data-t="settings" aria-label="Settings"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.3.9a7 7 0 0 0-2-1.2L14.2 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.3-.9-2 3.4 2 1.5a7 7 0 0 0 0 2.4l-2 1.5 2 3.4 2.3-.9a7 7 0 0 0 2 1.2l.4 2.6h4l.4-2.6a7 7 0 0 0 2-1.2l2.3.9 2-3.4-2-1.5c.1-.4.1-.8.1-1.2z"/></svg></button><button type="button" class="giconb" data-g="edit-gym" aria-label="Gym profile"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></button><button type="button" class="giconb" data-g="lock" aria-label="Lock"><svg viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/></svg></button></div></div></div>';
    if(!GDB.db) h += '<p class="gwarn">Saving is not available in this browser, so data will be lost when you close the page.</p>';
    h += '<div class="gbody" id="gbody">'+gTabHtml()+'</div></div>';
    h += '<nav class="gnav" aria-label="Gym sections">'+GNAV.map(function(t){ return '<button type="button" class="'+(gNavOn(t[0])?'on':'')+'" data-g="tab" data-t="'+t[0]+'"><svg viewBox="0 0 24 24"><path d="'+t[2]+'"/></svg><span>'+t[1]+'</span>'+(t[0]==='more' && n ? '<em>'+n+'</em>' : '')+'</button>'; }).join('')+'</nav>';
    if(gS.ov) h += gOvHtml();
    return h;
  }
  function gTabHtml(){
    var t = gS.tab;
    if(t==='members'||t==='trainers'||t==='employees') return gPeopleHtml(t);
    var fn = {home:gHomeHtml,money:gMoneyHtml,bills:gMoneyHtml,more:gMoreHtml,rem:gRemHtml,settings:gSetHtml,att:gAttHtml,ren:gRenHtml,plans:gPlansHtml,equip:gEquipHtml,leads:gLeadsHtml,backup:gBackupHtml,studio:stStudioHtml}[t];
    return (fn||zTab(t)||gHomeHtml)();
  }
  function gPeopleHtml(k){
    var K = GKIND[k], h = '';
    if(k!=='members') h += '<div class="gseg two" role="tablist">'+['trainers','employees'].map(function(x){ return '<button type="button" role="tab" aria-selected="'+(k===x)+'" class="'+(k===x?'on':'')+'" data-g="tab" data-t="'+x+'">'+GKIND[x].many+'</button>'; }).join('')+'</div>';
    h += '<div class="gbar"><label class="gsearch"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><input id="g-q" type="search" placeholder="Search '+K.many.toLowerCase()+'…" value="'+esc(gS.q)+'" autocomplete="off" aria-label="Search '+K.many.toLowerCase()+'"></label><button type="button" class="gbtn gold" data-g="add" data-k="'+k+'">+ Add '+K.one+'</button></div>';
    if(k==='members'){
      h += '<div class="gchips" role="group" aria-label="Filter members">'+[['all','All'],['due','Fee due'],['exp','Expired'],['bal','Balance due'],['frozen','Frozen']].map(function(f){ return '<button type="button" class="'+(gS.mf===f[0]?'on':'')+'" aria-pressed="'+(gS.mf===f[0])+'" data-g="x-mf" data-v="'+f[0]+'">'+f[1]+'</button>'; }).join('')+'</div>';
    }
    h += '<div id="g-list">'+gListHtml(k)+'</div>';
    return h;
  }
  function gListHtml(k){
    var q = gS.q.trim().toLowerCase(), all = gList(k).slice();
    if(k==='members') all.sort(function(a,b){return a.no-b.no});
    if(k==='members' && gS.mf==='bal') all = all.filter(function(e){ return e.bal>0; }); else if(k==='members' && gS.mf!=='all') all = all.filter(function(e){ var d = gOk(e.next) ? gDue(e.next).dd : 99; return gS.mf==='frozen' ? !!e.freeze : (!e.freeze && (gS.mf==='exp' ? d<0 : d<=GREM)); });
    var list = all.filter(function(e){ return !q || (e.name+' '+e.mobile+' '+(e.no||'')+' '+(e.role||'')).toLowerCase().indexOf(q)>=0; });
    var shown = list.slice(0,gS.n), h = '';
    if(!all.length) return '<div class="gempty"><b>No '+GKIND[k].many.toLowerCase()+' yet</b><span>Tap “Add '+GKIND[k].one+'” to create the first one.</span></div>';
    if(!list.length) return '<div class="gempty"><b>No match</b><span>Try another name or number.</span></div>';
    h += '<div class="gsheet"><div class="gsh">'+(k==='members'?'<span>No.</span>':'')+'<span class="gn">'+GKIND[k].one.charAt(0).toUpperCase()+GKIND[k].one.slice(1)+'</span><span class="gr">'+(k==='members'?'Next fee':'Salary due')+'</span></div>';
    h += shown.map(function(e){
      var due = gPayable(k,e) && gOk(e.next) ? gDue(e.next) : null;
      var sub = k==='members' ? gPlanName(e.plan)+' · '+gMoney(e.fee) : (e.role||GKIND[k].one)+(e.mobile?' · '+e.mobile:'');
      return '<button type="button" class="grow2" data-g="open" data-k="'+k+'" data-id="'+e.id+'">'+(k==='members'?'<span class="gno">'+e.no+'</span>':'')+gAvatar(e,'sm')+'<span class="gn"><b>'+esc(e.name)+'</b><small>'+esc(sub)+'</small></span><span class="gr">'+(due ? '<b>'+gFmt(e.next)+'</b><i class="gchip '+due.cls+'">'+due.txt+'</i>' : (k==='members' ? (e.freeze ? '<i class="gchip soon">Frozen</i>' : '<i class="gchip none">No fee date</i>') : '<i class="gchip none">No salary</i>'))+'</span></button>';
    }).join('')+'</div>';
    if(list.length>shown.length) h += '<button type="button" class="gbtn ghost wide" data-g="more">Show more ('+(list.length-shown.length)+' left)</button>';
    return h;
  }
  function gTel(m){ return String(m||'').replace(/\D/g,''); }
  function gWa(m,txt){ var n = gTel(m); if(n.length===10) n = '91'+n; return 'https://wa.me/'+n+'?text='+encodeURIComponent(txt); }
  function gRemHtml(){
    var rem = gReminders(), h = gSub('Reminders')+'<div class="ghead2"><p>Fees, salaries, service and follow-ups due in the next '+GREM+' days, or already overdue.</p></div>';
    var ex = gRemExtra();
    if(!rem.length && !ex.length) return h+'<div class="gempty"><b>Nothing due</b><span>You will see a member’s fee here '+GREM+' days before the date it is due.</span></div>';
    h += rem.map(function(x){
      var e = x.e, isM = x.k==='members', what = isM ? 'Fee' : 'Salary';
      var msg = 'Hello '+e.name+', your '+G.gym.name+' membership fee of '+gMoney(x.amt)+' is due on '+gFmt(e.next)+'. Please pay at the earliest. Thank you.';
      return '<div class="grem '+x.d.cls+'"><div class="grh">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>'+(isM?'Member no. '+e.no+' · '+gPlanName(e.plan):esc(e.role||GKIND[x.k].one)+' · '+GKIND[x.k].one)+'</small></div><div class="gr"><b>'+gMoney(x.amt)+'</b><i class="gchip '+x.d.cls+'">'+x.d.txt+'</i></div></div><p class="gdt">'+what+' date: <b>'+gFmt(e.next)+'</b></p><div class="gra">'+(e.mobile?'<a class="gbtn ghost sm" href="tel:'+gTel(e.mobile)+'">Call</a>':'')+(isM && e.mobile?'<a class="gbtn ghost sm" href="'+gWa(e.mobile,msg)+'" target="_blank" rel="noopener">WhatsApp</a>':'')+'<button type="button" class="gbtn gold sm" data-g="paid" data-k="'+x.k+'" data-id="'+e.id+'">Mark '+(isM?'fee received':'salary paid')+'</button></div></div>';
    }).join('');
    return h+gRemExtraHtml(ex);
  }

  /* --- detail and form overlays --- */
  function gOvHtml(){
    var o = gS.ov;
    return '<div class="gov" role="dialog" aria-modal="true">'+(o.type==='form' ? gFormHtml(o.k,o.id) : o.type==='bill' ? gBillHtml() : o.type==='inv' ? gInvHtml(o.id) : o.type==='x' ? gXOvHtml(o) : gDetailHtml(o.k,o.id))+'</div>';
  }
  function gRow(l,v){ return '<div class="gdr"><span>'+l+'</span><b>'+v+'</b></div>'; }
  function gDetailHtml(k,id){
    var e = gFind(k,id), K = GKIND[k]; if(!e) return '';
    var due = gPayable(k,e) && gOk(e.next) ? gDue(e.next) : null, isM = k==='members';
    var h = '<div class="govh"><button type="button" class="giconb" data-g="close" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>'+(isM?'Member no. '+e.no:K.one.charAt(0).toUpperCase()+K.one.slice(1))+'</span><span></span></div>';
    h += '<div class="govb"><div class="gprof">'+gAvatar(e,'xl')+'<h2>'+esc(e.name)+'</h2>'+(e.role?'<p>'+esc(e.role)+'</p>':'')+'</div>';
    h += '<div class="gcard dark">'+gRow('Mobile',e.mobile?'<a href="tel:'+gTel(e.mobile)+'">'+esc(e.mobile)+'</a>':'—')+gRow('Address',esc(e.address||'—'))+gRow('Joining date',gFmt(e.join))+gRow('Time with the gym','<span class="gdays">'+gSince(e.join)+'</span>');
    if(isM) h += gRow('Membership plan',esc(gPlanName(e.plan)))+gRow('Fee',gMoney(e.fee))+gDetailRows(e);
    if(!isM) h += gRow('Pay type',e.pay==='sal'?'Monthly salary':'Not on salary')+(e.pay==='sal'?gRow('Salary',gMoney(e.salary)):'');
    h += '</div>';
    if(due){
      var paid = e.paid||[], tot = 0; paid.forEach(function(p){tot += p.amt});
      h += '<div class="gcard dark gnext '+due.cls+'"><small>'+(isM?'Next fee':'Next salary')+'</small><h3>'+gFmt(e.next)+'</h3><i class="gchip '+due.cls+'">'+due.txt+'</i><p>'+(isM?'Fee':'Salary')+' amount: <b>'+gMoney(isM?e.fee:e.salary)+'</b></p><button type="button" class="gbtn gold wide" data-g="paid" data-k="'+k+'" data-id="'+e.id+'">'+(isM?'Mark fee received':'Mark salary paid')+'</button></div>';
      h += '<div class="gcard dark"><h4>'+(isM?'Fees received':'Salary paid')+'</h4><p class="gsum">'+gMoney(tot)+' in '+paid.length+' payment'+(paid.length===1?'':'s')+'</p>'+(paid.length?paid.slice().reverse().slice(0,12).map(function(p){return '<div class="gdr"><span>'+gFmt(p.d)+'</span><b>'+gMoney(p.amt)+'</b></div>'}).join(''):'<p class="ghint">No payments recorded yet.</p>')+'</div>';
    }
    h += gDetailExtra(k,e);
    h += '<div class="grow"><button type="button" class="gbtn ghost wide" data-g="edit" data-k="'+k+'" data-id="'+e.id+'">Edit details</button>'+(gS.del ? '<button type="button" class="gbtn danger wide" data-g="del-yes" data-k="'+k+'" data-id="'+e.id+'">Tap again to delete</button>' : '<button type="button" class="gbtn ghost wide" data-g="del" data-k="'+k+'" data-id="'+e.id+'">Delete '+K.one+'</button>')+'</div></div>';
    return h;
  }
  function gFormHtml(k,id){
    var K = GKIND[k], e = id ? gFind(k,id) : null, isM = k==='members', tmp = gS.tmp;
    var d = e || {name:'',mobile:'',address:'',join:gK(gToday()),plan:'m1',fee:'',next:'',role:'',pay:'sal',salary:'',photo:''};
    if(!id){ d.next = gAddM(d.join,1); if(gS.prefill){ d.name = gS.prefill.name||''; d.mobile = gS.prefill.mobile||''; } if(isM){ var pl0 = gPlanById(d.plan); if(pl0 && pl0.price) d.fee = pl0.price; } }
    var h = '<div class="govh"><button type="button" class="giconb" data-g="close" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>'+(id?'Edit ':'Add ')+K.one+'</span><span></span></div><div class="govb"><div class="gcard dark">';
    h += '<div class="gphrow">'+gPhotoPick('p','Photo',tmp.photo,true)+'</div>';
    h += '<label class="gl" for="gf-name">Full name</label><input class="gin" id="gf-name" maxlength="40" value="'+esc(d.name)+'" autocomplete="off">';
    h += '<label class="gl" for="gf-mob">Mobile number</label><input class="gin" id="gf-mob" type="tel" inputmode="numeric" maxlength="18" value="'+esc(d.mobile)+'" placeholder="10-digit number" autocomplete="off">';
    h += '<label class="gl" for="gf-addr">Address</label><textarea class="gin" id="gf-addr" rows="2" maxlength="200">'+esc(d.address)+'</textarea>';
    h += '<label class="gl" for="gf-join">Joining date</label><input class="gin" id="gf-join" type="date" value="'+esc(d.join)+'">';
    if(isM){
      h += '<label class="gl" for="gf-plan">Membership plan</label><select class="gin" id="gf-plan">'+gPlansList().map(function(p){return '<option value="'+p.id+'"'+(d.plan===p.id?' selected':'')+'>'+esc(p.name)+(p.price?' · '+gMoney(p.price):'')+'</option>'}).join('')+'</select>';
      h += gFormExtra(d);
      h += '<label class="gl" for="gf-fee">Fee for this plan (₹)</label><input class="gin" id="gf-fee" type="number" inputmode="numeric" min="1" value="'+(d.fee||'')+'" placeholder="For example, 1500">';
      h += '<label class="gl" for="gf-next">Next fee date</label><input class="gin" id="gf-next" type="date" value="'+esc(d.next)+'">';
      h += zFormExtra(d);
    } else {
      h += '<label class="gl" for="gf-role">'+(k==='trainers'?'Specialty (for example, Strength, Yoga)':'Job role (for example, Receptionist)')+'</label><input class="gin" id="gf-role" maxlength="40" value="'+esc(d.role||'')+'">';
      h += '<label class="gl" for="gf-pay">Pay type</label><select class="gin" id="gf-pay"><option value="sal"'+(d.pay==='sal'?' selected':'')+'>Monthly salary</option><option value="none"'+(d.pay==='none'?' selected':'')+'>Not on salary</option></select>';
      h += '<div id="gf-salbox"'+(d.pay==='none'?' hidden':'')+'><label class="gl" for="gf-sal">Monthly salary (₹)</label><input class="gin" id="gf-sal" type="number" inputmode="numeric" min="1" value="'+(d.salary||'')+'"><label class="gl" for="gf-next">Next salary date</label><input class="gin" id="gf-next" type="date" value="'+esc(d.next)+'"></div>';
    }
    h += '<p class="gerr" id="gf-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="save" data-k="'+k+'" data-id="'+(id||'')+'">Save '+K.one+'</button></div></div>';
    return h;
  }

  /* --- actions --- */
  function gNextNo(){
    var used = {}; G.members.forEach(function(m){ used[m.no] = 1; });
    for(var i=1;i<=GMAX;i++) if(!used[i]) return i;
    return 0;
  }
  function gSaveForm(k,id){
    var isM = k==='members', err = '', e = id ? gFind(k,id) : null;
    var name = $('gf-name').value.trim(), mob = $('gf-mob').value.replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,''), addr = $('gf-addr').value.trim(), join = $('gf-join').value;
    if(!name) err = 'Enter the name.';
    else if(!/^\d{10}$/.test(mob)) err = 'Enter a 10-digit mobile number.';
    else if(!gOk(join)) err = 'Choose the joining date.';
    var o = {name:name,mobile:mob,address:addr,join:join,photo:gS.tmp.photo||''};
    if(!err){
      if(isM){
        var fee = parseFloat($('gf-fee').value), next = $('gf-next').value;
        if(!(fee>0)) err = 'Enter the fee amount.'; else if(!gOk(next)) err = 'Choose the next fee date.';
        o.plan = $('gf-plan').value; o.fee = Math.round(fee); o.next = next; o.trainer = $('gf-trainer') ? $('gf-trainer').value : ''; o.offer = $('gf-offer') ? $('gf-offer').value : ''; zFormRead(o);
      } else {
        o.role = $('gf-role').value.trim(); o.pay = $('gf-pay').value;
        if(o.pay==='sal'){
          var sal = parseFloat($('gf-sal').value), nx = $('gf-next').value;
          if(!(sal>0)) err = 'Enter the monthly salary.'; else if(!gOk(nx)) err = 'Choose the next salary date.';
          o.salary = Math.round(sal); o.next = nx;
        } else { o.salary = 0; o.next = ''; }
      }
    }
    if(err){ var el = $('gf-err'); el.textContent = err; el.hidden = false; return; }
    if(e){ Object.keys(o).forEach(function(key){ e[key] = o[key]; }); }
    else {
      if(isM){ var no = gNextNo(); if(!no){ var el2 = $('gf-err'); el2.textContent = 'The limit of '+GMAX+' members is reached.'; el2.hidden = false; return; } o.no = no; }
      o.id = gId(); o.paid = []; gList(k).push(o);
      if(isM && gS.leadId){ var ld = (G.leads||[]).filter(function(x){return x.id===gS.leadId})[0]; if(ld){ ld.status = 'joined'; ld.mid = o.id; } }
      gS.leadId = ''; gS.prefill = null;
    }
    gSave(); gS.tmp = {}; gS.ov = {type:'detail',k:k,id:e?e.id:o.id}; gS.del = false; gRender();
    toast(e ? 'Saved.' : name+' added.');
  }
  function gMarkPaid(k,id){
    var e = gFind(k,id); if(!e) return;
    var amt = k==='members' ? e.fee : e.salary, dur = k==='members' ? gDur(e.plan) : 1;
    if(!e.paid) e.paid = [];
    e.paid.push({d:gK(gToday()),amt:amt,f:e.next});
    e.next = gAddM(e.next,dur);
    gSave(); gRender();
    toast((k==='members'?'Fee':'Salary')+' recorded. Next date: '+gFmt(e.next)+'.');
  }
  function gTryPin(){
    if(Date.now()<gLock.until){ gS.err = 'Too many tries. Wait '+Math.ceil((gLock.until-Date.now())/1000)+' seconds.'; gS.pin = ''; gRender(); return; }
    var pin = gS.pin, g = G.gym;
    gHash(pin,g.salt,g.hash.length<20,function(h){
      if(gS.view!=='login') return;
      if(h===g.hash){
        gLock.n = 0; gS.err = ''; gS.view = 'opening'; gRender();
        clearTimeout(gTO); gTO = setTimeout(function(){ if(gS.view==='opening' && curScreen==='s-gym'){ gS.view = 'dash'; gS.tab = 'home'; gRender(); window.scrollTo(0,0); } },2000);
      } else {
        gLock.n++; gS.pin = ''; gS.err = 'bad'; if(typeof snd==='function') snd('err');
        if(gLock.n>=5){ gLock.until = Date.now()+30000; gLock.n = 0; gS.err = 'Too many wrong tries. Wait 30 seconds.'; }
        gRender();
      }
    });
  }
  function gPinInput(v){
    if(gS.view!=='login' || gS.reset) return;
    if(Date.now()<gLock.until){ gS.err = 'Too many tries. Wait '+Math.ceil((gLock.until-Date.now())/1000)+' seconds.'; gS.pin = ''; gRender(); return; }
    v = String(v||'').replace(/\D/g,'').slice(0,4);
    var grew = v.length>gS.pin.length; gS.pin = v;
    if(gS.err){ gS.err = ''; var er = $('gl-err'); if(er){ er.hidden = true; } var ff = document.querySelector('.glk-f'); if(ff) ff.classList.remove('shake'); }
    if(grew && typeof snd==='function') snd('key');
    if(v.length===4){ var pi = $('gl-pin'); if(pi) pi.blur(); setTimeout(gTryPin,120); }
  }
  document.addEventListener('keydown',function(ev){
    if(curScreen!=='s-gym' || gS.view!=='login' || gS.reset) return;
    var pi = $('gl-pin'); if(pi && document.activeElement!==pi && /^\d$/.test(ev.key) && !/^(INPUT|TEXTAREA)$/.test((document.activeElement||{}).tagName||'')){ pi.focus(); }
  });
  $('gymroot').addEventListener('input',function(ev){ if(ev.target.id==='gl-pin'){ var v = ev.target.value.replace(/\D/g,'').slice(0,4); if(v!==ev.target.value) ev.target.value = v; gPinInput(v); } });
  $('gymroot').addEventListener('submit',function(ev){
    if(ev.target.id!=='gl-form') return; ev.preventDefault();
    if(gS.pin.length===4) gTryPin(); else { gS.err = 'Enter all 4 digits.'; gS.noFocus = false; gRender(); }
  });

  function gSetupSave(){
    var edit = gS.tmp.mode==='edit', name = $('gs-name').value.trim(), addr = $('gs-addr').value.trim(), phone = $('gs-phone').value.replace(/[\s-]/g,'').replace(/^\+?91(?=\d{10}$)/,''), p1 = $('gs-pin').value, p2 = $('gs-pin2').value, err = '';
    if(!name) err = 'Enter your gym’s name.';
    else if(!addr) err = 'Enter your gym’s address.';
    else if(!/^\d{10}$/.test(phone)) err = 'Enter your gym’s 10-digit phone number.';
    else if((!edit || p1 || p2) && !/^\d{4}$/.test(p1)) err = 'The PIN must be exactly 4 digits.';
    else if((!edit || p1 || p2) && p1!==p2) err = 'The two PINs do not match.';
    else if((!edit || p1) && !$('gs-ok').checked) err = 'Please tick the box to confirm that you have noted your PIN.';
    if(err){ var el = $('gs-err'); el.textContent = err; el.hidden = false; return; }
    if(edit){
      G.gym.name = name; G.gym.address = addr; G.gym.phone = phone; G.gym.logo = gS.tmp.logo||''; G.gym.bg = gS.tmp.bg||'';
      if(p1){ gHash(p1,G.gym.salt,false,function(h){ G.gym.hash = h; gSave(); gS.view = 'dash'; gRender(); toast('Saved. Your PIN was changed.'); }); return; }
      gSave(); gS.view = 'dash'; gRender(); toast('Saved.'); return;
    }
    var salt = Math.random().toString(36).slice(2)+Date.now().toString(36);
    gHash(p1,salt,false,function(h){
      G = {invoices:[],billSeq:0,gym:{name:name,phone:phone,address:addr,logo:gS.tmp.logo||'',bg:gS.tmp.bg||'',salt:salt,hash:h,created:Date.now()},members:[],trainers:[],employees:[]};
      gMig(); gSave(); gFlush(); gS.view = 'login'; gS.pin = ''; gS.err = ''; gS.tmp = {}; gRender(); window.scrollTo(0,0); toast('Gym saved. Enter your PIN to log in.');
    });
  }

  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b || b.tagName==='A') return;
    var a = b.getAttribute('data-g'), k = b.getAttribute('data-k'), id = b.getAttribute('data-id');
    if(a==='setup-save'){ gSetupSave(); return; }
    if(a==='setup-cancel'){ gS.view = 'dash'; gS.tmp = {}; gRender(); return; }
    if(a==='forgot'){ gS.reset = true; gRender(); return; }
    if(a==='reset-no'){ gS.reset = false; gRender(); return; }
    if(a==='reset-yes'){
      if($('gr-in').value.trim().toUpperCase()!=='DELETE'){ toast('Type DELETE to confirm.'); return; }
      gWipe(); gS.view = 'setup'; gS.tmp = {logo:'',bg:'',mode:'new'}; gS.reset = false; gRender(); toast('Gym data erased.'); return;
    }
    if(gS.view!=='dash') return;
    if(a.indexOf('b-')===0 && gBillAct(a,b)) return;
    if(a==='lock'){ gLockNow(); return; }
    if(a==='edit-gym'){ gS.view = 'setup'; gS.tmp = {logo:G.gym.logo||'',bg:G.gym.bg||'',mode:'edit'}; gRender(); window.scrollTo(0,0); return; }
    if(a==='tab'){ gS.tab = b.getAttribute('data-t'); gS.q = ''; gS.n = 50; gS.ov = null; gRender(); window.scrollTo(0,0); return; }
    if(a==='more'){ gS.n += 50; var l = $('g-list'); if(l) l.innerHTML = gListHtml(gS.tab); return; }
    if(a==='add'){
      if(k==='members' && G.members.length>=GMAX){ toast('The limit of '+GMAX+' members is reached.'); return; }
      gS.tmp = {photo:''}; gS.ov = {type:'form',k:k,id:''}; gRender(); var ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return;
    }
    if(a==='open'){ gS.ov = {type:'detail',k:k,id:id}; gS.del = false; gRender(); return; }
    if(a==='close'){ gS.wa = null; gS.leadId = ''; gS.prefill = null; gS.ov = null; gS.tmp = {}; gS.del = false; gRender(); return; }
    if(a==='edit'){ var e = gFind(k,id); gS.tmp = {photo:e.photo||''}; gS.ov = {type:'form',k:k,id:id}; gRender(); return; }
    if(a==='save'){ gSaveForm(k,id); return; }
    if(a==='paid'){ gMarkPaid(k,id); return; }
    if(a==='del'){ gS.del = true; gRender(); return; }
    if(a==='del-yes'){
      var arr = gList(k), i = arr.map(function(x){return x.id}).indexOf(id);
      if(i>=0){ gArch(k,arr[i]); arr.splice(i,1); }
      gSave(); gS.ov = null; gS.del = false; gRender(); toast('Deleted.'); return;
    }
  });
  $('gymroot').addEventListener('input',function(ev){
    if(ev.target.id==='g-q'){ gS.q = ev.target.value; gS.n = 50; var l = $('g-list'); if(l) l.innerHTML = gListHtml(gS.tab); }
  });
  $('gymroot').addEventListener('change',function(ev){
    var t = ev.target;
    if(t.getAttribute && t.getAttribute('data-gph')){
      var which = t.getAttribute('data-gph'), f = t.files && t.files[0]; if(!f) return;
      if(f.size>25*1024*1024){ toast('That photo is too large. Choose one under 25 MB.'); return; }
      gImg(f,which==='bg'?1000:which==='logo'?320:260,which==='bg'?0.7:0.75,function(u){
        if(!u){ toast('That file could not be read as a photo.'); return; }
        var box = $('gp-'+which);
        if(which==='bg'){ gS.tmp.bg = u; var bb = $('gp-bgbox'); if(bb) bb.style.setProperty('--bg',"url('"+u+"')"); }
        else if(which==='logo') gS.tmp.logo = u; else gS.tmp.photo = u;
        if(box) box.innerHTML = '<img loading="lazy" decoding="async" src="'+u+'" alt="">';
      });
      return;
    }
    if(t.id==='gf-pay'){ $('gf-salbox').hidden = (t.value==='none'); return; }
    if(t.id==='gf-plan' || t.id==='gf-join'){
      var nx = $('gf-next');
      if(nx && !gS.nextTouched && gOk($('gf-join').value) && !(gS.ov && gS.ov.id)) nx.value = gAddM($('gf-join').value,gDur($('gf-plan')?$('gf-plan').value:'m1'));
      return;
    }
    if(t.id==='gf-next') gS.nextTouched = true;
  });

  /* ---------- Gym bills: invoice maker + real PDF download ----------
     The invoice is drawn once on a canvas. The same picture is shown on screen and placed inside an A4 PDF,
     so what you see is exactly what you download. */
  var BONES = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  var BTENS = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  function bW99(n){ return n<20 ? BONES[n] : BTENS[Math.floor(n/10)]+(n%10?' '+BONES[n%10]:''); }
  function bW999(n){ var h = Math.floor(n/100), r = n%100; return (h?BONES[h]+' Hundred'+(r?' ':''):'')+(r?bW99(r):''); }
  function bWords(n){
    n = Math.round(n); if(n<=0) return 'Zero';
    var parts = [], cr = Math.floor(n/10000000); n %= 10000000;
    var lk = Math.floor(n/100000); n %= 100000;
    var th = Math.floor(n/1000); n %= 1000;
    if(cr) parts.push(bW999(cr)+' Crore'); if(lk) parts.push(bW99(lk)+' Lakh'); if(th) parts.push(bW99(th)+' Thousand'); if(n) parts.push(bW999(n));
    return parts.join(' ');
  }
  var BKIND = {members:'Member',trainers:'Trainer',employees:'Employee'};
  var bImgs = {}, bBusy = {};
  function bNo(n){ return 'INV-'+('0000'+n).slice(-4); }
  function bSnap(k,e){ return {name:e.name,mobile:e.mobile||'',address:e.address||'',tag:k==='members'?'Member no. '+e.no:(e.role?e.role+' · ':'')+BKIND[k]}; }

  /* --- canvas drawing --- */
  function bWrap(ctx,text,maxW,maxLines){
    var words = String(text).split(/\s+/), lines = [], cur = '';
    words.forEach(function(w){
      var t = cur ? cur+' '+w : w;
      if(ctx.measureText(t).width<=maxW){ cur = t; return; }
      if(cur) lines.push(cur);
      while(ctx.measureText(w).width>maxW && w.length>1){ var i = w.length-1; while(i>1 && ctx.measureText(w.slice(0,i)).width>maxW) i--; lines.push(w.slice(0,i)); w = w.slice(i); }
      cur = w;
    });
    if(cur) lines.push(cur);
    if(maxLines && lines.length>maxLines){ lines = lines.slice(0,maxLines); var l = lines[maxLines-1]; while(l.length>1 && ctx.measureText(l+'…').width>maxW) l = l.slice(0,-1); lines[maxLines-1] = l+'…'; }
    return lines;
  }
  function bDraw(inv,cb){
    var W = 794, H = 1123, S = 2, cv = document.createElement('canvas'); cv.width = W*S; cv.height = H*S;
    var ctx = cv.getContext('2d'); ctx.scale(S,S);
    var F = '"DM Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif', D = '"Bricolage Grotesque","DM Sans","Segoe UI",Roboto,Helvetica,Arial,sans-serif';
    var GOLD = '#E9C05A', DARK = '#14110A', INK = '#1B1710', MUTE = '#6B6247', LINE = '#E8E0C8';
    function txt(t,x,y,font,color,align){ ctx.font = font; ctx.fillStyle = color; ctx.textAlign = align||'left'; ctx.textBaseline = 'alphabetic'; ctx.fillText(t,x,y); }
    function rr(x,y,w,h,r){ ctx.beginPath(); ctx.moveTo(x+r,y); ctx.arcTo(x+w,y,x+w,y+h,r); ctx.arcTo(x+w,y+h,x,y+h,r); ctx.arcTo(x,y+h,x,y,r); ctx.arcTo(x,y,x+w,y,r); ctx.closePath(); }
    var logo = null;
    function go(){
      ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0,0,W,H);
      /* header */
      var hg = ctx.createLinearGradient(0,0,W,190); hg.addColorStop(0,'#1E1810'); hg.addColorStop(1,'#0B0A07');
      ctx.fillStyle = hg; ctx.fillRect(0,0,W,184);
      var sg = ctx.createLinearGradient(0,0,W,0); sg.addColorStop(0,'#B98A1E'); sg.addColorStop(.5,'#F3D77F'); sg.addColorStop(1,'#B98A1E');
      ctx.fillStyle = sg; ctx.fillRect(0,184,W,6);
      ctx.save(); ctx.beginPath(); ctx.arc(88,92,44,0,Math.PI*2); ctx.closePath(); ctx.fillStyle = '#2A2110'; ctx.fill(); ctx.clip();
      if(logo){ var k = Math.max(88/logo.width,88/logo.height); ctx.drawImage(logo,88-logo.width*k/2,92-logo.height*k/2,logo.width*k,logo.height*k); }
      else txt((inv.g.name||'G').charAt(0).toUpperCase(),88,108,'800 44px '+D,GOLD,'center');
      ctx.restore(); ctx.beginPath(); ctx.arc(88,92,44,0,Math.PI*2); ctx.strokeStyle = GOLD; ctx.lineWidth = 3; ctx.stroke();
      ctx.font = '800 26px '+D; var nl = bWrap(ctx,inv.g.name,360,2), y = nl.length>1 ? 62 : 78;
      nl.forEach(function(l,i){ txt(l,150,y+i*30,'800 26px '+D,'#FFFFFF'); }); y += nl.length*30-6;
      ctx.font = '400 12.5px '+F; bWrap(ctx,inv.g.address||'',360,2).forEach(function(l,i){ txt(l,150,y+i*17,'400 12.5px '+F,'#D9CBA0'); y += 0; });
      var al = bWrap(ctx,inv.g.address||'',360,2).length; y += al*17;
      if(inv.g.phone) txt('Phone: '+inv.g.phone,150,y+2,'600 12.5px '+F,GOLD);
      txt('INVOICE',W-48,86,'800 38px '+D,GOLD,'right');
      txt(inv.no,W-48,114,'600 15px '+F,'#FFFFFF','right');
      txt(gFmt(inv.date),W-48,136,'400 13px '+F,'#D9CBA0','right');
      /* billed to */
      txt('BILLED TO',48,236,'700 11px '+F,'#9A7A24');
      ctx.fillStyle = GOLD; ctx.fillRect(48,244,28,2);
      txt(inv.c.name,48,274,'800 22px '+D,INK);
      var by = 296; txt(inv.c.tag,48,by,'600 13px '+F,MUTE); by += 20;
      if(inv.c.mobile){ txt('Mobile: '+inv.c.mobile,48,by,'400 13px '+F,INK); by += 19; }
      ctx.font = '400 13px '+F; bWrap(ctx,inv.c.address||'',330,3).forEach(function(l){ if(inv.c.address){ txt(l,48,by,'400 13px '+F,INK); by += 18; } });
      /* details box */
      rr(446,222,300,128,14); ctx.fillStyle = '#FBF7EA'; ctx.fill(); ctx.strokeStyle = LINE; ctx.lineWidth = 1; ctx.stroke();
      var rows = [['Invoice no.',inv.no],['Invoice date',gFmt(inv.date)],['Bill type',BKIND[inv.k]],['Status',inv.status==='paid'?'Paid':'Unpaid']];
      rows.forEach(function(r,i){ var yy = 252+i*26; txt(r[0],466,yy,'400 13px '+F,MUTE); txt(r[1],726,yy,'700 13.5px '+F,r[0]==='Status'?(inv.status==='paid'?'#1F7A55':'#B3261E'):INK,'right'); });
      /* table */
      var ty = 400; ctx.fillStyle = DARK; rr(48,ty,698,38,8); ctx.fill();
      txt('DESCRIPTION',66,ty+24,'700 11.5px '+F,GOLD); txt('AMOUNT',728,ty+24,'700 11.5px '+F,GOLD,'right');
      ctx.font = '600 15px '+F; var dl = bWrap(ctx,inv.desc,520,3), rh = Math.max(58,dl.length*22+28);
      dl.forEach(function(l,i){ txt(l,66,ty+38+30+i*22-8,'600 15px '+F,INK); });
      txt(gMoney(inv.amt),728,ty+38+30-8,'800 16px '+F,INK,'right');
      ctx.fillStyle = LINE; ctx.fillRect(48,ty+38+rh,698,1);
      var yy = ty+38+rh+34;
      txt('Subtotal',500,yy,'400 14px '+F,MUTE); txt(gMoney(inv.amt),728,yy,'600 14px '+F,INK,'right'); yy += 16;
      var tg = ctx.createLinearGradient(470,0,746,0); tg.addColorStop(0,'#F3D77F'); tg.addColorStop(1,'#C99A2B');
      rr(470,yy,276,56,12); ctx.fillStyle = tg; ctx.fill();
      txt('TOTAL',490,yy+34,'800 13px '+F,'#3A2D10'); txt(gMoney(inv.amt),728,yy+37,'800 26px '+D,'#14110A','right');
      /* amount in words */
      txt('AMOUNT IN WORDS',48,yy+8,'700 11px '+F,'#9A7A24');
      ctx.font = 'italic 600 14px '+F; bWrap(ctx,'Rupees '+bWords(inv.amt)+' only',380,3).forEach(function(l,i){ txt(l,48,yy+30+i*20,'italic 600 14px '+F,INK); });
      /* stamp */
      var sy = yy+130; ctx.save(); ctx.translate(150,sy+30); ctx.rotate(-0.2);
      var sc = inv.status==='paid' ? '#1F7A55' : '#B3261E'; ctx.strokeStyle = sc; ctx.lineWidth = 4; rr(-70,-28,140,56,10); ctx.stroke();
      ctx.lineWidth = 1.5; rr(-65,-23,130,46,7); ctx.stroke();
      txt(inv.status==='paid'?'PAID':'UNPAID',0,11,'800 30px '+D,sc,'center'); ctx.restore();
      /* signature + footer */
      ctx.fillStyle = INK; ctx.fillRect(540,960,206,1);
      txt('Authorised signatory',643,980,'400 12px '+F,MUTE,'center');
      txt('For '+inv.g.name,643,950,'700 13px '+F,INK,'center');
      ctx.fillStyle = LINE; ctx.fillRect(48,1016,698,1);
      txt('Thank you for being a part of '+inv.g.name+'.',W/2,1044,'600 13.5px '+F,INK,'center');
      txt('This is a computer-generated invoice.',W/2,1064,'400 11.5px '+F,MUTE,'center');
      ctx.fillStyle = DARK; ctx.fillRect(0,H-20,W,20); ctx.fillStyle = sg; ctx.fillRect(0,H-20,W,3);
      cb(cv.toDataURL('image/jpeg',0.92));
    }
    function start(){
      if(G && G.gym && G.gym.logo){ var im = new Image(); im.onload = function(){ logo = im; go(); }; im.onerror = function(){ go(); }; im.src = G.gym.logo; }
      else go();
    }
    try{ if(document.fonts && document.fonts.ready){ var done = false, fin = function(){ if(!done){ done = true; start(); } }; setTimeout(fin,900); Promise.all([document.fonts.load('800 26px "Bricolage Grotesque"'),document.fonts.load('400 13px "DM Sans"'),document.fonts.load('700 13px "DM Sans"')]).then(fin,fin); } else start(); }catch(e){ start(); }
  }
  function bPaint(inv,cb){
    if(bImgs[inv.id]){ cb(bImgs[inv.id]); return; }
    if(bBusy[inv.id]){ bBusy[inv.id].push(cb); return; }
    bBusy[inv.id] = [cb];
    bDraw(inv,function(u){ bImgs[inv.id] = u; var q = bBusy[inv.id]; delete bBusy[inv.id]; q.forEach(function(f){ f(u); }); });
  }

  /* --- PDF (one A4 page holding the invoice picture) --- */
  function bPdf(dataUrl){
    var b64 = dataUrl.split(',')[1], bin = atob(b64), jpg = new Uint8Array(bin.length), i;
    for(i=0;i<bin.length;i++) jpg[i] = bin.charCodeAt(i);
    var W = 1588, H = 2246, chunks = [], offs = [], len = 0;
    function put(x){ if(typeof x==='string'){ var u = new Uint8Array(x.length); for(var j=0;j<x.length;j++) u[j] = x.charCodeAt(j)&255; x = u; } chunks.push(x); len += x.length; }
    function obj(n,body){ offs[n] = len; put(n+' 0 obj\n'+body+'\nendobj\n'); }
    put('%PDF-1.4\n');
    obj(1,'<< /Type /Catalog /Pages 2 0 R >>');
    obj(2,'<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
    obj(3,'<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595.28 841.89] /Resources << /XObject << /Im0 5 0 R >> >> /Contents 4 0 R >>');
    var cs = 'q 595.28 0 0 841.89 0 0 cm /Im0 Do Q';
    obj(4,'<< /Length '+cs.length+' >>\nstream\n'+cs+'\nendstream');
    offs[5] = len; put('5 0 obj\n<< /Type /XObject /Subtype /Image /Width '+W+' /Height '+H+' /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length '+jpg.length+' >>\nstream\n'); put(jpg); put('\nendstream\nendobj\n');
    obj(6,'<< /Title (Invoice) /Producer (KDN Fitness Tracker) >>');
    var xr = len; put('xref\n0 7\n0000000000 65535 f \n');
    for(i=1;i<=6;i++) put(('0000000000'+offs[i]).slice(-10)+' 00000 n \n');
    put('trailer\n<< /Size 7 /Root 1 0 R /Info 6 0 R >>\nstartxref\n'+xr+'\n%%EOF');
    return new Blob(chunks,{type:'application/pdf'});
  }
  function bDownload(inv,done){
    toast('Preparing the PDF…');
    bPaint(inv,function(u){
      var blob = bPdf(u), fn = 'Invoice-'+inv.no+'-'+inv.c.name.replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)+'.pdf';
      function fallback(){
        try{
          var url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = fn; document.body.appendChild(a); a.click();
          setTimeout(function(){ a.remove(); URL.revokeObjectURL(url); },4000);
          toast('PDF downloaded: '+fn); if(done) done();
        }catch(e){ toast('Could not create the PDF in this browser.'); }
      }
      try{
        if(window.claude && typeof window.claude.use==='function'){
          window.claude.use('downloads').then(function(d){
            if(!d){ fallback(); return; }
            d.save({filename:fn,data:blob}).then(function(){ toast('PDF saved.'); if(done) done(); },function(er){ if(er && er.code==='declined') return; fallback(); });
          },function(){ fallback(); });
          return;
        }
      }catch(e){}
      fallback();
    });
  }

  /* --- screens --- */
  function bFields(){ if(!G.invoices) G.invoices = []; if(!G.billSeq) G.billSeq = G.invoices.length; }
  function bResults(){
    var B = gS.bill, q = B.q.trim().toLowerCase(), all = gList(B.k).slice();
    if(B.k==='members') all.sort(function(a,b){ return a.no-b.no; });
    var list = all.filter(function(e){ return !q || (e.name+' '+(e.mobile||'')+' '+(e.no||'')+' '+(e.role||'')).toLowerCase().indexOf(q)>=0; });
    if(!all.length) return '<div class="gempty"><b>No '+GKIND[B.k].many.toLowerCase()+' yet</b><span>Add a '+GKIND[B.k].one+' first, then come back to make a bill.</span></div>';
    if(!list.length) return '<div class="gempty"><b>No match</b><span>Try another name or number.</span></div>';
    return '<div class="gsheet">'+list.slice(0,8).map(function(e){
      return '<button type="button" class="grow2" data-g="b-pick" data-id="'+e.id+'">'+(B.k==='members'?'<span class="gno">'+e.no+'</span>':'')+gAvatar(e,'sm')+'<span class="gn"><b>'+esc(e.name)+'</b><small>'+esc((e.role||BKIND[B.k])+(e.mobile?' · '+e.mobile:''))+'</small></span><span class="gr"><i class="gchip ok">Select</i></span></button>';
    }).join('')+'</div>'+(list.length>8?'<p class="ghint">Showing 8 of '+list.length+'. Type more of the name to narrow it down.</p>':'');
  }
  function bDefaults(k,e){
    var d = gK(gToday());
    if(k==='members') return {amt:e.fee||'',desc:'Membership fee · '+gPlanName(e.plan)+' plan',date:d};
    var m = gD(d).toLocaleDateString('en-IN',{month:'long',year:'numeric'});
    return {amt:e.salary||'',desc:'Salary for '+m,date:d};
  }
  function gBillHtml(){
    var B = gS.bill, g = G.gym, e = B.pid ? gFind(B.k,B.pid) : null;
    var h = '<div class="govh"><button type="button" class="giconb" data-g="close" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>Make a bill</span><span></span></div><div class="govb"><div class="gcard dark">';
    h += '<h3>Who is this bill for?</h3><div class="gseg" role="tablist">'+['members','trainers','employees'].map(function(k){ return '<button type="button" role="tab" aria-selected="'+(B.k===k)+'" class="'+(B.k===k?'on':'')+'" data-g="b-kind" data-k="'+k+'">'+BKIND[k]+'</button>'; }).join('')+'</div>';
    if(!e){
      h += '<label class="gsearch big"><svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="6"/><path d="M20 20l-4-4"/></svg><input id="gb-q" type="search" placeholder="Search by name, number or mobile" value="'+esc(B.q)+'" autocomplete="off" aria-label="Search"></label><div id="gb-res">'+bResults()+'</div></div></div>';
      return h;
    }
    h += '<div class="gpick">'+gAvatar(e,'sm')+'<div class="gn"><b>'+esc(e.name)+'</b><small>'+esc(B.k==='members'?'Member no. '+e.no:(e.role||BKIND[B.k]))+'</small></div><button type="button" class="gbtn ghost sm" data-g="b-clear">Change</button></div>';
    h += '<div class="gauto"><small>Filled in automatically</small>'+gRow('Name',esc(e.name))+gRow('Mobile',esc(e.mobile||'—'))+gRow('Address',esc(e.address||'—'))+gRow('Gym',esc(g.name))+gRow('Gym address',esc(g.address||'—'))+gRow('Gym phone',esc(g.phone||'—'))+'</div>';
    if(!g.phone) h += '<p class="gwarn">Your gym phone number is not saved yet, so it will not appear on the bill. <button type="button" class="glink" data-g="edit-gym">Add it in Gym profile</button></p>';
    h += '<label class="gl" for="gb-desc">Bill for</label><input class="gin" id="gb-desc" maxlength="80" value="'+esc(B.desc)+'">';
    h += '<div class="gtwo"><div><label class="gl" for="gb-amt">Amount (₹)</label><input class="gin" id="gb-amt" type="number" inputmode="numeric" min="1" value="'+esc(B.amt)+'" placeholder="For example, 1500"></div><div><label class="gl" for="gb-date">Date</label><input class="gin" id="gb-date" type="date" value="'+esc(B.date)+'"></div></div>';
    h += '<label class="gl" for="gb-status">Payment status</label><select class="gin" id="gb-status"><option value="paid"'+(B.status==='paid'?' selected':'')+'>Paid</option><option value="unpaid"'+(B.status==='unpaid'?' selected':'')+'>Unpaid</option></select>';
    h += '<p class="gerr" id="gb-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="b-gen">Generate invoice</button></div></div>';
    return h;
  }
  function gInvHtml(id){
    var inv = (G.invoices||[]).filter(function(x){ return x.id===id; })[0]; if(!inv) return '';
    var h = '<div class="govh"><button type="button" class="giconb" data-g="close" aria-label="Back"><svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7"/></svg></button><span>'+esc(inv.no)+'</span><span></span></div><div class="govb"><div class="ginv"><div class="ginv-sp" id="gv-sp"><div class="gspin"></div></div><img loading="lazy" decoding="async" id="gv-img" alt="Invoice '+esc(inv.no)+' for '+esc(inv.c.name)+'" '+(bImgs[inv.id]?'src="'+bImgs[inv.id]+'"':'hidden')+'></div>';
    h += '<div class="gbills"><div class="gtwo"><button type="button" class="gbtn gold" data-g="b-pdf" data-id="'+inv.id+'"><svg viewBox="0 0 24 24" class="gbi"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>Download</button><button type="button" class="gbtn wa" data-g="b-wa" data-id="'+inv.id+'"><svg viewBox="0 0 24 24" class="gbi"><path d="M4 20l1.4-4.2A8 8 0 1 1 8.4 18.7z"/></svg>Send</button></div><button type="button" class="gbtn ghost wide" data-g="b-new">Make another bill</button>'+(gS.del ? '<button type="button" class="gbtn danger wide" data-g="b-del-yes" data-id="'+inv.id+'">Tap again to delete this bill</button>' : '<button type="button" class="gbtn ghost wide" data-g="b-del" data-id="'+inv.id+'">Delete this bill</button>')+'</div></div>'+(gS.wa && gS.wa.id===inv.id ? bWaHtml(inv) : '');
    return h;
  }
  /* --- WhatsApp: opens the chat with the message ready. A web page cannot attach a file or press send inside WhatsApp. --- */
  function bWaNum(v){
    var d = String(v||'').replace(/\D/g,''); if(d.length===11 && d.charAt(0)==='0') d = d.slice(1);
    if(d.length===10) d = '91'+d;
    return (d.length>=11 && d.length<=15) ? d : '';
  }
  function bWaMsg(inv){ return 'Hello '+inv.c.name+', your invoice '+inv.no+' from '+inv.g.name+' for '+gMoney(inv.amt)+' ('+inv.desc+') dated '+gFmt(inv.date)+' is ready. Please find the PDF attached. Thank you!'; }
  function bWaLink(){ var w = gS.wa, n = bWaNum(w.num); return n ? 'https://wa.me/'+n+'?text='+encodeURIComponent(w.msg) : '#'; }
  function bWaHtml(inv){
    var w = gS.wa, canShare = false;
    try{ canShare = !!(navigator.canShare && window.File && navigator.canShare({files:[new File(['x'],'a.pdf',{type:'application/pdf'})]})); }catch(e){}
    return '<div class="gwa" role="dialog" aria-modal="true" aria-label="Send on WhatsApp"><div class="gwa-in"><div class="gwa-h"><b>Send on WhatsApp</b><button type="button" class="giconb" data-g="b-wa-x" aria-label="Close"><svg viewBox="0 0 24 24"><path d="M6 6l12 12M18 6L6 18"/></svg></button></div>'+
      '<label class="gl" for="gwa-num">WhatsApp number (you can change it)</label><input class="gin" id="gwa-num" type="tel" inputmode="numeric" maxlength="18" value="'+esc(w.num)+'" placeholder="10-digit number" autocomplete="off">'+
      '<label class="gl" for="gwa-msg">Message</label><textarea class="gin" id="gwa-msg" rows="4" maxlength="600">'+esc(w.msg)+'</textarea>'+
      '<div class="gsteps"><div class="gstep'+(w.dl?' done':'')+'"><span>1</span><div><b>Save the invoice PDF</b><small>You will attach this file in WhatsApp.</small></div><button type="button" class="gbtn ghost sm" data-g="b-wa-dl" data-id="'+inv.id+'">'+(w.dl?'Saved ✓':'Download')+'</button></div>'+
      (canShare?'<div class="gstep"><span>·</span><div><b>Or share the PDF directly</b><small>Pick WhatsApp and the contact from your phone’s share sheet.</small></div><button type="button" class="gbtn ghost sm" data-g="b-wa-share" data-id="'+inv.id+'">Share</button></div>':'')+
      '<div class="gstep"><span>2</span><div><b>Open the WhatsApp chat</b><small>The chat opens with the message ready. Tap the paperclip, choose Document, pick the PDF, then press send.</small></div></div></div>'+
      '<p class="gerr" id="gwa-err" role="alert" hidden></p><a class="gbtn wa wide" id="gwa-go" data-g="b-wa-go" target="_blank" rel="noopener" href="'+esc(bWaLink())+'">Open WhatsApp chat</a></div></div>';
  }
  function gBillsListHtml(){
    var all = (G.invoices||[]).slice().reverse(), tot = 0; all.forEach(function(x){ if(x.status==='paid') tot += x.amt; });
    var h = '<div class="ghead2"><h3>Bills</h3><p>Every invoice you have made. Tap one to open it or download the PDF.</p></div><button type="button" class="gmake" data-g="b-new"><span class="gmk"><svg viewBox="0 0 24 24"><path d="M6 3h12v18l-3-2-3 2-3-2-3 2zM9 8h6M9 12h6"/></svg></span><span><b>Make a bill</b><small>For a member, trainer or employee</small></span><i>›</i></button>';
    if(!all.length) return h+'<div class="gempty"><b>No bills yet</b><span>Your invoices will be listed here.</span></div>';
    h += '<p class="gsum">'+all.length+' bill'+(all.length===1?'':'s')+' · '+gMoney(tot)+' marked paid</p><div class="gsheet">'+all.slice(0,gS.n).map(function(x){
      return '<button type="button" class="grow2" data-g="b-view" data-id="'+x.id+'"><span class="gn"><b>'+esc(x.c.name)+'</b><small>'+esc(x.no+' · '+BKIND[x.k]+' · '+gFmt(x.date))+'</small></span><span class="gr"><b>'+gMoney(x.amt)+'</b><i class="gchip '+(x.status==='paid'?'ok':'soon')+'">'+(x.status==='paid'?'Paid':'Unpaid')+'</i></span></button>';
    }).join('')+'</div>'+(all.length>gS.n?'<button type="button" class="gbtn ghost wide" data-g="more">Show more</button>':'');
    return h;
  }
  function gBillAfter(){
    var o = gS.ov; if(!o || o.type!=='inv') return;
    var inv = (G.invoices||[]).filter(function(x){ return x.id===o.id; })[0]; if(!inv) return;
    bPaint(inv,function(u){ var im = $('gv-img'), sp = $('gv-sp'); if(im && gS.ov && gS.ov.id===inv.id){ im.src = u; im.hidden = false; if(sp) sp.hidden = true; } });
  }
  function bCreate(k,e,desc,amt,date,st){
    bFields(); G.billSeq++;
    var inv = {id:gId(),no:bNo(G.billSeq),k:k,pid:e.id,c:bSnap(k,e),g:{name:G.gym.name,address:G.gym.address||'',phone:G.gym.phone||''},desc:desc,amt:Math.round(amt),date:date,status:st,created:Date.now()};
    G.invoices.push(inv); return inv;
  }
  function bGen(){
    var B = gS.bill, e = gFind(B.k,B.pid), err = '';
    var desc = $('gb-desc').value.trim(), amt = parseFloat($('gb-amt').value), date = $('gb-date').value, st = $('gb-status').value;
    if(!e) err = 'Choose who the bill is for.'; else if(!desc) err = 'Write what the bill is for.'; else if(!(amt>0)) err = 'Enter the amount.'; else if(amt>99999999) err = 'That amount is too large.'; else if(!gOk(date)) err = 'Choose the date.';
    if(err){ var el = $('gb-err'); el.textContent = err; el.hidden = false; return; }
    var inv = bCreate(B.k,e,desc,amt,date,st); gSave(); gS.del = false; gS.ov = {type:'inv',id:inv.id}; gRender(); var ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0;
    toast('Invoice '+inv.no+' created.');
  }
  /* returns true when the action belongs to bills */
  function gBillAct(a,b){
    var k = b.getAttribute('data-k'), id = b.getAttribute('data-id');
    if(a==='b-new'){ bFields(); gS.bill = {k:'members',q:'',pid:'',amt:'',desc:'',date:gK(gToday()),status:'paid'}; gS.ov = {type:'bill'}; gRender(); var ov = document.querySelector('.gov'); if(ov) ov.scrollTop = 0; return true; }
    if(a==='b-kind'){ gS.bill.k = k; gS.bill.q = ''; gS.bill.pid = ''; gRender(); return true; }
    if(a==='b-clear'){ gS.bill.pid = ''; gRender(); return true; }
    if(a==='b-pick'){ var e = gFind(gS.bill.k,id); if(!e) return true; var d = bDefaults(gS.bill.k,e); gS.bill.pid = id; gS.bill.amt = d.amt; gS.bill.desc = d.desc; gS.bill.date = d.date; gRender(); return true; }
    if(a==='b-gen'){ bGen(); return true; }
    if(a==='b-view'){ gS.del = false; gS.ov = {type:'inv',id:id}; gRender(); return true; }
    if(a==='b-pdf'){ var inv = (G.invoices||[]).filter(function(x){ return x.id===id; })[0]; if(inv) bDownload(inv); return true; }
    if(a==='b-wa'){ var iv = (G.invoices||[]).filter(function(x){ return x.id===id; })[0]; if(!iv) return true; gS.wa = {id:id,num:iv.c.mobile||'',msg:bWaMsg(iv),dl:false}; gRender(); return true; }
    if(a==='b-wa-x'){ gS.wa = null; gRender(); return true; }
    if(a==='b-wa-dl'){ var i2 = (G.invoices||[]).filter(function(x){ return x.id===id; })[0]; if(i2) bDownload(i2,function(){ if(gS.wa){ gS.wa.dl = true; var bt = document.querySelector('[data-g=b-wa-dl]'); if(bt){ bt.textContent = 'Saved ✓'; bt.closest('.gstep').classList.add('done'); } } }); return true; }
    if(a==='b-wa-share'){
      var i3 = (G.invoices||[]).filter(function(x){ return x.id===id; })[0]; if(!i3) return true;
      bPaint(i3,function(u){
        try{
          var fn = 'Invoice-'+i3.no+'.pdf', f = new File([bPdf(u)],fn,{type:'application/pdf'});
          navigator.share({files:[f],text:gS.wa?gS.wa.msg:''}).then(function(){ gS.wa = null; gS.ov = null; gRender(); toast('Shared.'); },function(){});
        }catch(e){ toast('Sharing is not available here. Use Download instead.'); }
      });
      return true;
    }
    if(a==='b-del'){ gS.del = true; gRender(); return true; }
    if(a==='b-del-yes'){ G.invoices = (G.invoices||[]).filter(function(x){ return x.id!==id; }); delete bImgs[id]; gSave(); gS.ov = null; gS.del = false; gRender(); toast('Bill deleted.'); return true; }
    return false;
  }
  $('gymroot').addEventListener('click',function(ev){
    var go = ev.target.closest('#gwa-go'); if(!go || !gS.wa) return;
    var n = bWaNum($('gwa-num').value), er = $('gwa-err');
    if(!n){ ev.preventDefault(); er.textContent = 'Enter a valid WhatsApp number with 10 digits.'; er.hidden = false; return; }
    go.setAttribute('href',bWaLink());
    setTimeout(function(){ gS.wa = null; gS.ov = null; gS.tab = 'members'; gRender(); window.scrollTo(0,0); toast('Attach the PDF in WhatsApp and press send.'); },700);
  });
  $('gymroot').addEventListener('input',function(ev){
    if(gS.wa && (ev.target.id==='gwa-num' || ev.target.id==='gwa-msg')){
      if(ev.target.id==='gwa-num') gS.wa.num = ev.target.value; else gS.wa.msg = ev.target.value;
      var g2 = $('gwa-go'); if(g2) g2.setAttribute('href',bWaLink()); var e2 = $('gwa-err'); if(e2) e2.hidden = true; return;
    }
    if(ev.target.id==='gb-q' && gS.bill){ gS.bill.q = ev.target.value; var r = $('gb-res'); if(r) r.innerHTML = bResults(); }
  });

