  /* ==== KDN HEALTH START ====
     My health (Individual and Family plans): medicine reminders, medical ID and reports, and a period tracker for women.
     Everything stays on this device: details in localStorage, report files in IndexedDB. */
  var HKEY = 'kdn.health.v1', HD = null, HDBP = null;
  var hS = {who:'me', tab:'meds', type:'all', q:'', calM:null, sheet:null, form:null, busy:false, delAsk:null};
  var hURLs = [];
  var HTYPES = [
    ['lab','Lab report','#1D6FB8','<path d="M9 3h6M10 3v6L5 19a1.5 1.5 0 0 0 1.3 2h11.4A1.5 1.5 0 0 0 19 19l-5-10V3"/><path d="M7.5 15h9"/>'],
    ['rx','Prescription','#7C4DBA','<path d="M6 3h7a4 4 0 0 1 0 8H6zM6 11v10M11 11l7 10M18 14l-6 7"/>'],
    ['scan','Scan / X-ray','#0E7C86','<rect x="3" y="4" width="18" height="16" rx="3"/><path d="M12 7v10M8 9c2 1 6 1 8 0M8 12c2 1 6 1 8 0M8 15c2 1 6 1 8 0"/>'],
    ['visit','Doctor visit','#B8934A','<path d="M6 3v5a5 5 0 0 0 10 0V3"/><path d="M11 13v3a4 4 0 0 0 8 0v-2"/><circle cx="19" cy="12" r="2"/>'],
    ['vac','Vaccination','#1F7A55','<path d="M17 3l4 4M19 5l-9.5 9.5M14 6l4 4M8 12l4 4M5 19l3-3M9.5 14.5 6 18"/>'],
    ['dis','Discharge summary','#B3261E','<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M12.5 11v6M9.5 14h6"/>'],
    ['bill','Insurance / bill','#586774','<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'],
    ['oth','Other','#8A6A2B','<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>']
  ];
  var HTYPE = {}; HTYPES.forEach(function(t){ HTYPE[t[0]] = {name:t[1],c:t[2],ic:t[3]}; });
  var HFORMS = ['Tablet','Capsule','Syrup','Injection','Drops','Inhaler','Cream','Other'];
  var HFOOD = {before:'Before food',after:'After food',with:'With food',any:'Any time'};
  var HWD = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var HSYM = [['cramps','Cramps'],['head','Headache'],['bloat','Bloating'],['back','Back pain'],['tired','Tiredness'],['acne','Acne'],['crave','Cravings'],['tender','Breast tenderness'],['nausea','Nausea']];
  var HMOOD = [['happy','Happy'],['calm','Calm'],['low','Low'],['irritable','Irritable'],['anxious','Anxious']];
  var HFLOW = {l:'Light',m:'Medium',h:'Heavy',s:'Spotting'};
  var HBLOOD = ['A+','A−','B+','B−','AB+','AB−','O+','O−'];

  function hI(p,cls){ return '<svg class="'+(cls||'hic')+'" viewBox="0 0 24 24" aria-hidden="true">'+p+'</svg>'; }
  function hId(){ return Date.now().toString(36)+Math.random().toString(36).slice(2,7); }
  function hDiff(a,b){ return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/864e5); }
  function hAdd(k,n){ var d = new Date(k+'T12:00:00'); d.setDate(d.getDate()+n); return dkey(d); }
  function hDate(k,o){ return new Date(k+'T12:00:00').toLocaleDateString('en-IN',o||{day:'numeric',month:'short',year:'numeric'}); }
  function hT12(t){ var p = String(t||'').split(':'), h = +p[0], m = p[1]||'00'; return (h%12||12)+':'+m+' '+(h<12?'AM':'PM'); }
  function hMin(t){ var p = String(t||'0:0').split(':'); return (+p[0])*60+(+p[1]||0); }
  function hSize(n){ return n>=1048576 ? (n/1048576).toFixed(1)+' MB' : Math.max(1,Math.round(n/1024))+' KB'; }

  /* ---- storage ---- */
  function hLoad(){
    if(HD) return HD;
    try{ var t = localStorage.getItem(HKEY); HD = t ? JSON.parse(t) : null; }catch(e){ HD = null; }
    if(!HD || typeof HD!=='object' || !HD.ppl || typeof HD.ppl!=='object') HD = {v:1,ppl:{}};
    return HD;
  }
  function hSave(){
    try{ localStorage.setItem(HKEY,JSON.stringify(HD)); if(NATIVE) nSync(); return true; }
    catch(e){ toast('Phone storage is full. Delete some old records and try again.'); return false; }
  }
  function hP(id){
    var D = hLoad(); id = id || hS.who;
    var p = D.ppl[id] || (D.ppl[id] = {});
    if(!Array.isArray(p.meds)) p.meds = [];
    if(!p.taken || typeof p.taken!=='object') p.taken = {};
    if(!p.mid || typeof p.mid!=='object') p.mid = {};
    if(!Array.isArray(p.recs)) p.recs = [];
    if(!p.cyc || typeof p.cyc!=='object') p.cyc = {};
    var c = p.cyc; if(!(c.len>=21 && c.len<=45)) c.len = 28; if(!(c.per>=2 && c.per<=10)) c.per = 5;
    if(!Array.isArray(c.periods)) c.periods = []; if(!c.days || typeof c.days!=='object') c.days = {};
    return p;
  }
  function hPeople(){
    var a = [{id:'me',name:S ? S.name : 'You',gender:S ? S.gender : '',me:true}];
    if(typeof planOn==='function' && planOn('fam')) famLoad().members.forEach(function(m){ a.push({id:'f-'+m.id,name:m.p.name,gender:m.p.gender}); });
    if(!HMED) a = a.filter(function(x){ return x.gender==='female'; });
    return a;
  }
  function hPerson(id){ var a = hPeople(); id = id || hS.who; for(var i=0;i<a.length;i++) if(a[i].id===id) return a[i]; return a[0]; }

  function hDb(){
    if(HDBP) return HDBP;
    HDBP = new Promise(function(res,rej){
      try{
        var rq = indexedDB.open('kdn-health',1);
        rq.onupgradeneeded = function(){ rq.result.createObjectStore('files'); };
        rq.onsuccess = function(){ res(rq.result); };
        rq.onerror = function(){ rej(rq.error); };
      }catch(e){ rej(e); }
    });
    HDBP.catch(function(){ HDBP = null; });
    return HDBP;
  }
  function hTx(mode,fn){
    return hDb().then(function(db){ return new Promise(function(res,rej){
      var tx = db.transaction('files',mode), st = tx.objectStore('files'), out = fn(st);
      tx.oncomplete = function(){ res(out && 'result' in out ? out.result : undefined); };
      tx.onerror = tx.onabort = function(){ rej(tx.error); };
    }); });
  }
  function hPut(id,blob){ return hTx('readwrite',function(st){ st.put(blob,id); }); }
  function hGet(id){ return hTx('readonly',function(st){ return st.get(id); }); }
  function hDelFiles(ids){ if(!ids.length) return Promise.resolve(); return hTx('readwrite',function(st){ ids.forEach(function(id){ st.delete(id); }); }); }
  function hClearAll(){
    try{ localStorage.removeItem(HKEY); localStorage.removeItem('kdn.hpn'); }catch(e){}
    HD = null; HDBP = null; hS.who = 'me';
    try{ indexedDB.deleteDatabase('kdn-health'); }catch(e){}
  }
  function hFreeURLs(){ hURLs.forEach(function(u){ try{ URL.revokeObjectURL(u); }catch(e){} }); hURLs = []; }
  function hURL(blob){ var u = URL.createObjectURL(blob); hURLs.push(u); return u; }

  /* photos are made smaller (max 2000 px, JPEG) so reports do not fill the phone */
  function hShrink(file){
    return new Promise(function(res){
      if(!/^image\/(jpeg|png|webp)$/.test(file.type)){ res(file); return; }
      var url = URL.createObjectURL(file), im = new Image();
      im.onload = function(){
        var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1,2000/Math.max(w,h));
        if(k===1 && file.size<900000){ URL.revokeObjectURL(url); res(file); return; }
        var c = document.createElement('canvas'); c.width = Math.round(w*k); c.height = Math.round(h*k);
        var g = c.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0,0,c.width,c.height); g.drawImage(im,0,0,c.width,c.height);
        URL.revokeObjectURL(url);
        c.toBlob(function(b){ res(b && b.size<file.size ? b : file); },'image/jpeg',0.85);
      };
      im.onerror = function(){ URL.revokeObjectURL(url); res(file); };
      im.src = url;
    });
  }

  /* ---- medicines ---- */
  function hMedOn(m,day){
    if(m.paused) return false;
    if(m.start && day<m.start) return false;
    if(m.end && day>m.end) return false;
    if(Array.isArray(m.days) && m.days.length && m.days.indexOf(new Date(day+'T12:00:00').getDay())<0) return false;
    return true;
  }
  function hDoses(p,day){
    var out = [], tk = p.taken[day] || {};
    p.meds.forEach(function(m){
      if(!hMedOn(m,day)) return;
      (m.times||[]).forEach(function(t){ var k = m.id+'@'+t; out.push({m:m,t:t,k:k,st:tk[k]||null}); });
    });
    out.sort(function(a,b){ return hMin(a.t)-hMin(b.t) || a.m.name.localeCompare(b.m.name); });
    return out;
  }
  function hDoseState(d,day){
    if(d.st) return d.st.s==='t' ? 'taken' : 'skipped';
    var today = todayKey();
    if(day<today) return 'missed';
    if(day>today) return 'up';
    var now = new Date(), mins = now.getHours()*60+now.getMinutes(), tm = hMin(d.t);
    if(mins<tm) return 'up';
    if(mins<tm+60) return 'due';
    return 'missed';
  }
  function hMark(pid,day,key,s){
    var p = hP(pid), tk = p.taken[day] || (p.taken[day] = {}), m = null, id = key.split('@')[0];
    p.meds.forEach(function(x){ if(x.id===id) m = x; });
    var was = tk[key] && tk[key].s;
    if(s){ tk[key] = {s:s,at:Date.now()}; } else delete tk[key];
    if(m && m.stock!=null){
      var per = m.per>0 ? m.per : 1;
      if(s==='t' && was!=='t') m.stock = Math.max(0,r1(m.stock-per));
      if(was==='t' && s!=='t') m.stock = r1(m.stock+per);
    }
    var cut = hAdd(todayKey(),-400); Object.keys(p.taken).forEach(function(k){ if(k<cut) delete p.taken[k]; });
    hSave();
  }
  function hMedLine(m){
    var t = (m.times||[]).map(hT12).join(', ');
    var d = Array.isArray(m.days) && m.days.length && m.days.length<7 ? m.days.map(function(i){return HWD[i]}).join(' ') : 'Every day';
    return d+' · '+t;
  }
  function hTZ(){ try{ return Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Kolkata'; }catch(e){ return 'Asia/Kolkata'; } }
  function hRrule(m){
    var r = 'RRULE:FREQ=' + (Array.isArray(m.days) && m.days.length && m.days.length<7 ? 'WEEKLY;BYDAY='+m.days.map(function(i){return ['SU','MO','TU','WE','TH','FR','SA'][i]}).join(',') : 'DAILY');
    if(m.end) r += ';UNTIL='+m.end.replace(/-/g,'')+'T235959Z';
    return r;
  }
  function hGcal(m,t){
    var st = (m.start && m.start>todayKey() ? m.start : todayKey()).replace(/-/g,''), a = t.replace(':',''), mm = hMin(t)+5;
    var b = (mm>=1440 ? '2359' : (mm/60<10?'0':'')+Math.floor(mm/60)+(mm%60<10?'0':'')+(mm%60));
    var txt = 'Medicine: '+m.name+(m.dose?' '+m.dose:'');
    var det = [HFOOD[m.food]||'', m.notes||'', 'From KDN Fitness'].filter(Boolean).join('\n');
    return 'https://calendar.google.com/calendar/render?action=TEMPLATE&text='+encodeURIComponent(txt)+'&details='+encodeURIComponent(det)+
      '&dates='+st+'T'+a+'00/'+st+'T'+b+'00&ctz='+encodeURIComponent(hTZ())+'&recur='+encodeURIComponent(hRrule(m));
  }
  function hIcs(meds,who){
    var L = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//KDN Fitness//Medicines//EN','CALSCALE:GREGORIAN'];
    var stamp = new Date().toISOString().replace(/[-:]/g,'').replace(/\.\d+/,'');
    var ics = function(s){ return String(s||'').replace(/\\/g,'\\\\').replace(/;/g,'\\;').replace(/,/g,'\\,').replace(/\n/g,'\\n'); };
    meds.forEach(function(m){
      (m.times||[]).forEach(function(t){
        var st = (m.start && m.start>todayKey() ? m.start : todayKey()).replace(/-/g,'')+'T'+t.replace(':','')+'00';
        L.push('BEGIN:VEVENT','UID:'+m.id+'-'+t.replace(':','')+'@kdnfitness.com','DTSTAMP:'+stamp,'DTSTART:'+st,'DURATION:PT5M',
          hRrule(m),'SUMMARY:'+ics('Medicine: '+m.name+(m.dose?' '+m.dose:'')+(who?' ('+who+')':'')),'DESCRIPTION:'+ics([HFOOD[m.food]||'',m.notes||''].filter(Boolean).join('\n')),
          'BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+ics('Time for '+m.name),'TRIGGER:PT0M','END:VALARM','END:VEVENT');
      });
    });
    L.push('END:VCALENDAR');
    return L.join('\r\n');
  }

  /* ---- periods ---- */
  function hCyc(c){
    var today = todayKey(), per = c.periods.slice().sort(function(a,b){ return a.s<b.s?-1:1; });
    var lens = [], durs = [], i;
    for(i=1;i<per.length;i++){ var d = hDiff(per[i-1].s,per[i].s); if(d>=15 && d<=60) lens.push(d); }
    per.forEach(function(p){ if(p.e && p.e>=p.s) durs.push(hDiff(p.s,p.e)+1); });
    var avg = function(a){ a = a.slice(-6); return a.reduce(function(x,y){return x+y},0)/a.length; };
    var L = lens.length ? Math.round(avg(lens)) : c.len, PL = durs.length ? Math.min(10,Math.max(2,Math.round(avg(durs)))) : c.per;
    var r = {L:L,PL:PL,lens:lens,per:per,today:today};
    var irr = lens.slice(-6);
    r.irregular = irr.length>=3 && (Math.max.apply(null,irr)-Math.min.apply(null,irr)>7 || irr.some(function(x){return x<21||x>35}));
    r.longPeriod = durs.slice(-3).some(function(x){ return x>7; });
    if(!per.length){ r.none = true; return r; }
    var last = per[per.length-1];
    r.last = last;
    r.lastEnd = last.e || hAdd(last.s,PL-1);
    r.ongoing = !last.e && today>=last.s && today<=r.lastEnd;
    r.onPeriod = today>=last.s && today<=r.lastEnd;
    r.cday = hDiff(last.s,today)+1;
    r.next = hAdd(last.s,L);
    r.late = Math.max(0,hDiff(r.next,today));
    r.until = hDiff(today,r.next);
    var base = r.late>0 ? hAdd(today,1) : r.next;
    r.ov = hAdd(r.next,-14); r.fs = hAdd(r.ov,-5); r.fe = hAdd(r.ov,1);
    if(r.ov<today && r.late===0){ /* this cycle's window has passed: show the next one */ }
    r.phase = r.onPeriod ? 'men' : r.late>0 ? 'late' : today<r.fs ? 'fol' : today<=r.fe ? (today===r.ov ? 'ovu' : 'fer') : 'lut';
    r.base = base;
    return r;
  }
  function hDayMarks(c,r,k){
    var m = {};
    c.periods.forEach(function(p){
      var e = p.e || hAdd(p.s,r.PL-1);
      if(k>=p.s && k<=e){ if(!p.e && k>r.today) m.pp = 1; else m.per = 1; }
    });
    if(!r.none && !m.per && !m.pp){
      for(var j=0;j<4;j++){
        var ns = j===0 ? r.base : hAdd(r.base,r.L*j), ne = hAdd(ns,r.PL-1);
        if(k>=ns && k<=ne && k>r.lastEnd){ m.pp = 1; break; }
        if(r.late>0) continue;
        var ov = hAdd(hAdd(r.next,r.L*j),-14);
        if(k===ov && k>r.lastEnd) m.ov = 1;
        else if(k>=hAdd(ov,-5) && k<=hAdd(ov,1) && k>r.lastEnd) m.fer = 1;
      }
    }
    var d = c.days[k]; if(d && ((d.sy&&d.sy.length) || d.mood || d.note || d.f)) m.log = 1;
    return m;
  }
  function hSetPeriodDay(c,k,on){
    var today = todayKey(), PL = hCyc(c).PL, hit = null;
    c.periods.forEach(function(p){ var e = p.e || hAdd(p.s,PL-1); if(k>=p.s && k<=e) hit = p; });
    if(on){
      if(hit) return;
      var adj = null;
      c.periods.forEach(function(p){ var e = p.e || hAdd(p.s,PL-1); if(k>e && hDiff(e,k)<=2) adj = {p:p,end:1}; else if(k<p.s && hDiff(k,p.s)<=2) adj = {p:p,end:0}; });
      if(adj){ if(adj.end) adj.p.e = k; else adj.p.s = k; }
      else c.periods.push({s:k,e:hDiff(k,today)<PL ? null : hAdd(k,PL-1)});
    } else if(hit){
      var he = hit.e || hAdd(hit.s,PL-1);
      if(k===hit.s){ if(he>k){ hit.s = hAdd(k,1); if(!hit.e) hit.e = he; } else c.periods.splice(c.periods.indexOf(hit),1); }
      else hit.e = hAdd(k,-1);
    }
    c.periods.sort(function(a,b){ return a.s<b.s?-1:1; });
  }
  var HPHASE = {
    men:['Period','Light movement helps: walking, yoga and stretching. Add iron-rich food like spinach, rajma, chana and jaggery, and drink plenty of water.'],
    fol:['Energy rising','A good time for strength training and trying something new. Your energy usually climbs from here.'],
    fer:['Fertile window','Energy is often at its best. Great days for your harder workouts.'],
    ovu:['Ovulation day (estimate)','Peak energy for most people. Go for your strongest session of the week.'],
    lut:['Before your period','Energy may dip. Moderate cardio and more sleep help. Craving sweets? Try fruit, dates or curd.'],
    late:['Period is late','Stress, travel, illness or a change in routine can delay a period. If it is very late or you could be pregnant, take a test or see a doctor.']
  };

  /* ---- screen ---- */
  function hOpen(){
    var hp = hPeople(); if(!hp.some(function(x){ return x.id===hS.who; })) hS.who = hp.length ? hp[0].id : 'me';
    hRender(); hTick();
  }
  function hTabs(P){
    var t = HMED ? [['meds','Medicines'],['recs','Records']] : []; if(P.gender==='female') t.push(['cyc','Periods']);
    if(t.length<2) return '';
    return '<div class="hh-seg" role="tablist">'+t.map(function(x){ return '<button type="button" role="tab" data-h="tab" data-v="'+x[0]+'" aria-selected="'+(hS.tab===x[0])+'"'+(hS.tab===x[0]?' class="on"':'')+'>'+x[1]+'</button>'; }).join('')+'</div>';
  }
  function hRender(){
    var root = $('health'); if(!root) return;
    hFreeURLs();
    var P = hPerson(), ppl = hPeople();
    if(hS.tab==='cyc' && P.gender!=='female') hS.tab = 'meds';
    if(!HMED) hS.tab = 'cyc';
    var h = '<div class="hh-hero"><div class="hx-glow"></div><small>'+(HMED?'My health':'Period tracker')+'</small><h2>'+(HMED ? (P.me ? 'Your health' : esc(P.name)+'’s health') : (P.me ? 'Your cycle' : esc(P.name)+'’s cycle'))+'</h2>';
    h += '<p>'+(!HMED ? 'Next period, fertile days and symptoms' : P.gender==='female'?'Medicines, medical records and periods':'Medicines and medical records')+(HMED?' in one place':'')+'. Saved only on this phone.</p>';
    if(ppl.length>1) h += '<div class="hh-ppl" role="radiogroup" aria-label="Whose health">'+ppl.map(function(x){ return '<button type="button" role="radio" data-h="who" data-v="'+esc(x.id)+'" aria-checked="'+(x.id===P.id)+'"'+(x.id===P.id?' class="on"':'')+'><i>'+esc(String(x.name||'?').trim().charAt(0).toUpperCase())+'</i>'+esc(x.me?'Me':x.name)+'</button>'; }).join('')+'</div>';
    if(P.me && !S && HMED) h += '<p class="hh-note">Make your plan first so KDN knows your profile. Medicines and records work now.</p>';
    h += '</div>'+hTabs(P);
    if(hS.tab==='meds') h += hMedsHtml(P);
    else if(hS.tab==='recs') h += hRecsHtml(P);
    else h += hCycHtml(P);
    root.innerHTML = h;
    if(hS.tab==='recs') hThumbs();
  }

  /* medicines tab */
  function hMedsHtml(P){
    var p = hP(P.id), today = todayKey(), ds = hDoses(p,today), h = '';
    var done = ds.filter(function(d){ return d.st && d.st.s==='t'; }).length;
    if(p.meds.length && hNotifState()!=='on') h += '<div class="hh-card hh-alert"><div>'+hI('<path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8"/><path d="M10 20a2 2 0 0 0 4 0"/>')+'</div><div><b>Turn on medicine reminders</b><p>'+(hNotifState()==='blocked' ? 'Notifications are blocked for this site. Allow them in your browser’s site settings. In-app reminders still pop up while KDN is open.' : 'Get a pop-up and a sound at each dose time.')+'</p>'+(hNotifState()==='blocked'?'':'<button type="button" class="hh-btn sm" data-h="notif">Turn on</button>')+'</div></div>';
    var low = p.meds.filter(function(m){ return !m.paused && m.stock!=null && m.stock<=(m.refill>=0?m.refill:5); });
    low.forEach(function(m){ h += '<div class="hh-card hh-warn">'+hI('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>')+'<div><b>Refill '+esc(m.name)+' soon</b><p>'+fmt(m.stock)+' left. Buy more before it runs out.</p></div></div>'; });
    h += '<div class="hh-card hh-today"><div class="hh-th"><div><small>'+hDate(today,{weekday:'long',day:'numeric',month:'long'})+'</small><h3>Today’s medicines</h3></div>'+(ds.length?hRing(done/ds.length,done+'/'+ds.length,'taken'):'')+'</div>';
    if(!ds.length) h += '<p class="hh-empty">'+(p.meds.length ? 'No doses today.' : 'Add a medicine and KDN will remind you at each dose time.')+'</p>';
    else h += '<ul class="hh-doses">'+ds.map(function(d){ return hDoseRow(P.id,today,d); }).join('')+'</ul>';
    h += '<button type="button" class="hh-gold" data-h="addmed">'+hI('<path d="M12 5v14M5 12h14"/>')+'Add medicine</button></div>';
    if(p.meds.length){
      h += '<div class="hh-card"><div class="hh-th"><h3>Last 7 days</h3><small>Doses taken on time or later</small></div>'+hWeek(p)+'</div>';
      h += '<div class="hh-sh"><h3>My medicines</h3><button type="button" class="hh-link" data-h="icsall">Add all to calendar</button></div>';
      h += '<ul class="hh-meds">'+p.meds.map(function(m){
        var left = m.end ? Math.max(0,hDiff(today,m.end)+1) : null;
        return '<li class="hh-med'+(m.paused?' off':'')+'"><button type="button" class="hh-medb" data-h="editmed" data-v="'+m.id+'"><span class="hh-pill">'+hI('<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/>')+'</span><span class="hh-mt"><b>'+esc(m.name)+(m.dose?' <em>'+esc(m.dose)+'</em>':'')+'</b><small>'+esc(hMedLine(m))+'</small><small>'+esc(HFOOD[m.food]||'')+(m.paused?' · Paused':left!=null?' · '+(left?left+' day'+(left===1?'':'s')+' left':'Course finished'):' · Ongoing')+(m.stock!=null?' · '+fmt(m.stock)+' left':'')+'</small></span><span class="hh-chev">›</span></button></li>';
      }).join('')+'</ul>';
      h += '<p class="hh-foot">'+(NATIVE ? 'KDN reminds you with a phone notification at each dose time, even when the app is closed.' : 'Reminders pop up while KDN is open on this phone. For a reminder even when KDN is closed, add your medicines to your phone calendar.')+'</p>';
    }
    return h;
  }
  function hDoseRow(pid,day,d){
    var st = hDoseState(d,day), m = d.m, lab = {taken:'Taken',skipped:'Skipped',missed:'Missed',due:'Due now',up:'Upcoming'}[st];
    var at = d.st ? new Date(d.st.at).toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}) : '';
    var acts = d.st ? '<button type="button" class="hh-undo" data-h="dose" data-p="'+esc(pid)+'" data-d="'+day+'" data-k="'+esc(d.k)+'" data-s="">Undo</button>'
      : '<button type="button" class="hh-skip" data-h="dose" data-p="'+esc(pid)+'" data-d="'+day+'" data-k="'+esc(d.k)+'" data-s="s">Skip</button><button type="button" class="hh-take" data-h="dose" data-p="'+esc(pid)+'" data-d="'+day+'" data-k="'+esc(d.k)+'" data-s="t">'+hI('<path d="M5 12.5l4.5 4.5L19 7.5"/>')+'Taken</button>';
    return '<li class="hh-dose '+st+'"><span class="hh-time">'+hT12(d.t)+'</span><span class="hh-dm"><b>'+esc(m.name)+(m.dose?' · '+esc(m.dose):'')+'</b><small><span class="hh-st">'+lab+(at?' '+at:'')+'</span> · '+esc(HFOOD[m.food]||'')+'</small></span><span class="hh-acts">'+acts+'</span></li>';
  }
  function hRing(f,big,small){
    var C = 2*Math.PI*26;
    return '<div class="hh-ring"><svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" class="bg"/><circle cx="32" cy="32" r="26" class="fg" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-Math.min(1,f))).toFixed(1)+'" transform="rotate(-90 32 32)"/></svg><span><b>'+big+'</b><small>'+small+'</small></span></div>';
  }
  function hWeek(p){
    var h = '<div class="hh-week">';
    for(var i=6;i>=0;i--){
      var k = hAdd(todayKey(),-i), ds = hDoses(p,k), pastDs = ds.filter(function(d){ return hDoseState(d,k)!=='up'; });
      var t = ds.filter(function(d){ return d.st && d.st.s==='t'; }).length, f = pastDs.length ? t/pastDs.length : null;
      h += '<div class="hh-wd'+(i===0?' now':'')+'"><span class="hh-wb"><i style="height:'+(f==null?0:Math.max(6,Math.round(f*100)))+'%"'+(f!=null&&f<0.5?' class="lo"':'')+'></i></span><b>'+(f==null?'–':Math.round(f*100)+'%')+'</b><small>'+HWD[new Date(k+'T12:00:00').getDay()]+'</small></div>';
    }
    return h+'</div>';
  }

  /* records tab */
  function hRecsHtml(P){
    var p = hP(P.id), mi = p.mid, h = '';
    var hasId = mi.blood || mi.allergy || mi.cond || (mi.ec && mi.ec.phone);
    h += '<button type="button" class="hh-id" data-h="editid"><span class="hh-idh"><small>Medical ID</small><b>'+esc(P.me?(S?S.name:'You'):P.name)+'</b></span><span class="hh-blood"><small>Blood</small><b>'+esc(mi.blood||'–')+'</b></span>';
    if(hasId){
      h += '<dl><div><dt>Allergies</dt><dd>'+esc(mi.allergy||'None noted')+'</dd></div><div><dt>Conditions</dt><dd>'+esc(mi.cond||'None noted')+'</dd></div>'+
        (mi.ec && mi.ec.phone ? '<div><dt>Emergency contact</dt><dd>'+esc((mi.ec.name||'')+(mi.ec.rel?' ('+mi.ec.rel+')':''))+' · '+esc(mi.ec.phone)+'</dd></div>' : '')+
        (mi.doc && (mi.doc.name||mi.doc.phone) ? '<div><dt>Doctor</dt><dd>'+esc([mi.doc.name,mi.doc.phone].filter(Boolean).join(' · '))+'</dd></div>' : '')+'</dl>';
    } else h += '<p class="hh-idp">Add blood group, allergies, conditions and an emergency contact, so they are ready when someone needs them.</p>';
    h += '<span class="hh-ide">'+(hasId?'Edit':'Add details')+' ›</span></button>';
    if(mi.ec && mi.ec.phone) h += '<a class="hh-call" href="tel:'+esc(String(mi.ec.phone).replace(/[^\d+]/g,''))+'">'+hI('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>')+'Call '+esc(mi.ec.name||'emergency contact')+'</a>';
    h += '<button type="button" class="hh-gold" data-h="addrec">'+hI('<path d="M12 5v14M5 12h14"/>')+'Add report or record</button>';
    var recs = p.recs.slice().sort(function(a,b){ return a.date<b.date?1:a.date>b.date?-1:(b.at||0)-(a.at||0); });
    if(recs.length){
      var used = {}; recs.forEach(function(r){ used[r.type] = 1; });
      h += '<div class="hh-filt"><input type="search" class="sinp" id="hh-q" placeholder="Search doctor, test, hospital…" value="'+esc(hS.q)+'" autocomplete="off"><div class="cbs scrollx">'+[['all','All ('+recs.length+')']].concat(HTYPES.filter(function(t){ return used[t[0]]; }).map(function(t){ return [t[0],t[1]]; })).map(function(x){ return '<button type="button" class="cb'+(hS.type===x[0]?' on':'')+'" data-h="type" data-v="'+x[0]+'" aria-pressed="'+(hS.type===x[0])+'">'+esc(x[1])+'</button>'; }).join('')+'</div></div>';
      h += '<div id="hh-list">'+hRecList(recs)+'</div>';
    } else h += '<div class="hh-card hh-emptyc">'+hI('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5M9 13h7M9 17h5"/>','hic big')+'<b>All your reports in one place</b><p>Take a photo of a report or prescription, or add a PDF. Sort them by type and find any one in seconds at the doctor.</p></div>';
    h += '<div class="hh-card hh-bk"><div><b>Backup</b><p>Records are saved only on this phone. Download a backup now and then, and keep it safe.</p></div><div class="hh-bkb"><button type="button" class="hh-btn sm ghost" data-h="backup">Download backup</button><button type="button" class="hh-btn sm ghost" data-h="restore">Restore</button></div><p class="hh-foot" id="hh-space"></p></div>';
    setTimeout(hSpace,0);
    return h;
  }
  function hRecList(recs){
    var q = hS.q.trim().toLowerCase();
    var list = recs.filter(function(r){
      if(hS.type!=='all' && r.type!==hS.type) return false;
      if(q && [r.title,r.doc,r.place,r.notes,(HTYPE[r.type]||{}).name].join(' ').toLowerCase().indexOf(q)<0) return false;
      return true;
    });
    if(!list.length) return '<p class="hh-empty">No record matches. Try another word or type.</p>';
    var h = '', yr = '';
    list.forEach(function(r){
      var y = (r.date||'').slice(0,4); if(y!==yr){ h += '<h4 class="hh-yr">'+esc(y||'No date')+'</h4>'; yr = y; }
      var T = HTYPE[r.type] || HTYPE.oth, img = (r.files||[]).filter(function(f){ return /^image\//.test(f.type); })[0];
      h += '<button type="button" class="hh-rec" data-h="openrec" data-v="'+r.id+'"><span class="hh-ric" style="--c:'+T.c+'">'+(img?'<img loading="lazy" decoding="async" alt="" data-hf="'+img.id+'">':hI(T.ic))+'</span><span class="hh-rt"><small style="color:'+T.c+'">'+esc(T.name)+'</small><b>'+esc(r.title||T.name)+'</b><span>'+esc([r.date?hDate(r.date):'',r.doc,r.place].filter(Boolean).join(' · '))+'</span></span><span class="hh-rn">'+((r.files||[]).length?(r.files.length)+' file'+(r.files.length>1?'s':''):'')+'</span></button>';
    });
    return h;
  }
  function hThumbs(){
    Array.prototype.forEach.call(document.querySelectorAll('#health img[data-hf], #hsheet img[data-hf]'),function(im){
      var id = im.getAttribute('data-hf'); im.removeAttribute('data-hf');
      hGet(id).then(function(b){ if(b){ im.src = hURL(b); im.decoding = 'async'; } }).catch(function(){});
    });
  }
  function hSpace(){
    var el = $('hh-space'); if(!el) return;
    try{ if(navigator.storage && navigator.storage.estimate) navigator.storage.estimate().then(function(e){ var x = $('hh-space'); if(x && e && e.usage!=null) x.textContent = 'KDN uses '+hSize(e.usage)+' on this phone.'; }); }catch(e){}
  }

  /* periods tab */
  function hCycHtml(P){
    var p = hP(P.id), c = p.cyc, r = hCyc(c), h = '';
    var ph = HPHASE[r.phase] || null, today = todayKey();
    h += '<div class="hh-cyc">';
    if(r.none){
      h += '<div class="hh-cs"><span class="hh-cico">'+hI('<path d="M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z"/>')+'</span><h3>Start your period tracker</h3><p>Log the first day of your last period. KDN predicts your next period and fertile days, and learns your cycle over time.</p><button type="button" class="hh-rose" data-h="cycstart">Log my last period</button></div>';
    } else {
      var big, sub;
      if(r.onPeriod){ big = 'Day '+r.cday; sub = 'of your period'; }
      else if(r.late>0){ big = r.late+' day'+(r.late>1?'s':''); sub = 'late'; }
      else if(r.until===0){ big = 'Today'; sub = 'period expected'; }
      else { big = r.until+' day'+(r.until>1?'s':''); sub = 'to next period'; }
      var C = 2*Math.PI*86, f = Math.min(1,Math.max(0,(r.cday-1)/r.L));
      h += '<div class="hh-ch"><div class="hh-cring"><svg viewBox="0 0 200 200" aria-hidden="true"><defs><linearGradient id="hhg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7B6C8"/><stop offset="1" stop-color="#C2416B"/></linearGradient></defs><circle cx="100" cy="100" r="86" class="bg"/><circle cx="100" cy="100" r="86" class="fg" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+(C*(1-f)).toFixed(1)+'" transform="rotate(-90 100 100)"/></svg>';
      h += '<div class="hh-cc"><small>Cycle day '+Math.max(1,r.cday)+'</small><b>'+big+'</b><span>'+sub+'</span></div></div>';
      h += '<div class="hh-cst"><div><small>Next period</small><b>'+(r.late>0?'Late':hDate(r.next,{day:'numeric',month:'short'}))+'</b></div><div><small>Fertile window</small><b>'+(r.late>0||r.fe<today?'–':hDate(r.fs,{day:'numeric',month:'short'})+' – '+hDate(r.fe,{day:'numeric',month:'short'}))+'</b></div><div><small>Cycle</small><b>'+r.L+' days</b></div><div><small>Period</small><b>'+r.PL+' days</b></div></div>';
      h += '<div class="hh-cbtn">'+(r.ongoing ? '<button type="button" class="hh-rose" data-h="cycend">My period ended today</button>' : '<button type="button" class="hh-rose" data-h="cycnow">My period started today</button>')+'<button type="button" class="hh-btn ghost" data-h="day" data-v="'+today+'">Log today</button></div></div>';
      if(ph) h += '<div class="hh-card hh-tip ph-'+r.phase+'"><small>'+esc(ph[0])+'</small><p>'+esc(ph[1])+'</p></div>';
      if(r.irregular || r.longPeriod) h += '<div class="hh-card hh-warn">'+hI('<path d="M12 3l9 16H3z"/><path d="M12 10v4M12 17v.5"/>')+'<div><b>Worth a check with your doctor</b><p>'+(r.irregular?'Your recent cycles vary a lot or fall outside 21 to 35 days. ':'')+(r.longPeriod?'A recent period lasted more than 7 days. ':'')+'A gynaecologist can tell you if anything needs care.</p></div></div>';
    }
    h += hCal(c,r);
    var past = r.per.slice(-6).reverse();
    if(past.length){
      h += '<div class="hh-sh"><h3>History</h3></div><ul class="hh-hist">'+past.map(function(x,i){
        var idx = r.per.indexOf(x), nx = r.per[idx+1], len = nx ? hDiff(x.s,nx.s) : null, du = x.e ? hDiff(x.s,x.e)+1 : null;
        return '<li><b>'+hDate(x.s,{day:'numeric',month:'short',year:'numeric'})+'</b><span>'+(du?du+'-day period':'Period')+(len?' · '+len+'-day cycle':(i===0?' · current cycle':''))+'</span></li>';
      }).join('')+'</ul>';
    }
    h += '<div class="hh-sh"><button type="button" class="hh-link" data-h="cycset">Cycle settings</button></div>';
    h += '<p class="hh-foot">Predictions are estimates from your logged dates and are not a method of birth control. They get better as you log more cycles.</p>';
    return h+'</div>';
  }
  function hCal(c,r){
    var t = todayKey(), m = hS.calM || t.slice(0,7), y = +m.slice(0,4), mo = +m.slice(5,7)-1;
    var first = new Date(y,mo,1), n = new Date(y,mo+1,0).getDate(), lead = (first.getDay()+6)%7;
    var h = '<div class="hh-card hh-cal"><div class="hh-calh"><button type="button" data-h="calm" data-v="-1" aria-label="Previous month">‹</button><b>'+MONTHS[mo]+' '+y+'</b><button type="button" data-h="calm" data-v="1" aria-label="Next month">›</button></div>';
    h += '<div class="hh-calg">'+['M','T','W','T','F','S','S'].map(function(d){ return '<span class="hh-cw">'+d+'</span>'; }).join('');
    for(var i=0;i<lead;i++) h += '<span></span>';
    for(var d=1;d<=n;d++){
      var k = y+'-'+pad(mo+1)+'-'+pad(d), mk = hDayMarks(c,r,k), cls = [];
      if(mk.per) cls.push('per'); if(mk.pp) cls.push('pp'); if(mk.fer) cls.push('fer'); if(mk.ov) cls.push('ov'); if(k===t) cls.push('now'); if(k>t) cls.push('fut');
      h += '<button type="button" class="hh-cd '+cls.join(' ')+'" data-h="day" data-v="'+k+'" aria-label="'+hDate(k,{day:'numeric',month:'long'})+'">'+d+(mk.log?'<i></i>':'')+'</button>';
    }
    h += '</div><div class="hh-leg"><span><i class="per"></i>Period</span><span><i class="pp"></i>Expected</span><span><i class="fer"></i>Fertile</span><span><i class="ov"></i>Ovulation</span></div></div>';
    return h;
  }

  /* ---- bottom sheet ---- */
  function hSheet(title,body,foot){
    var el = $('hsheet');
    el.innerHTML = '<div class="hs-scrim" data-hs="close"></div><div class="hs-panel" role="dialog" aria-modal="true" aria-labelledby="hs-t"><div class="hs-grab"></div><div class="hs-head"><h3 id="hs-t">'+title+'</h3><button type="button" class="hs-x" data-hs="close" aria-label="Close">×</button></div><div class="hs-body">'+body+'</div>'+(foot?'<div class="hs-foot">'+foot+'</div>':'')+'</div>';
    el.hidden = false; document.documentElement.classList.add('hlock');
    requestAnimationFrame(function(){ el.classList.add('open'); });
    hThumbs();
  }
  function hClose(){
    var el = $('hsheet'); if(!el || el.hidden) return;
    el.classList.remove('open'); document.documentElement.classList.remove('hlock');
    hS.sheet = null; hS.form = null; hS.delAsk = null;
    setTimeout(function(){ if(!el.classList.contains('open')){ el.hidden = true; el.innerHTML = ''; } },300);
  }
  function hErr(msg){ var e = $('hs-err'); if(e){ e.textContent = msg; e.hidden = false; e.scrollIntoView({block:'nearest',behavior:'smooth'}); } snd('err'); }
  function hChips(name,list,cur,multi){
    return '<div class="cbs">'+list.map(function(x){ var on = multi ? cur.indexOf(x[0])>=0 : cur===x[0]; return '<button type="button" class="cb'+(on?' on':'')+'" data-hc="'+name+'" data-v="'+esc(x[0])+'" aria-pressed="'+on+'">'+esc(x[1])+'</button>'; }).join('')+'</div>';
  }

  /* medicine form */
  function hMedForm(m){
    var f = hS.form = m ? JSON.parse(JSON.stringify(m)) : {id:'',name:'',dose:'',form:'Tablet',times:['08:00'],days:[],food:'after',start:todayKey(),end:'',stock:null,per:1,refill:5,notes:''};
    f.dur = f.end ? 'days' : 'on'; f.ndays = f.end ? hDiff(f.start||todayKey(),f.end)+1 : 5;
    hS.sheet = 'med';
    hSheet(m ? 'Edit medicine' : 'Add medicine', hMedBody(), (m?'<button type="button" class="hh-btn ghost danger" data-hs="delmed">Delete</button>':'')+'<button type="button" class="hh-gold wide" data-hs="savemed">'+(m?'Save':'Add medicine')+'</button>');
  }
  function hMedBody(){
    var f = hS.form;
    var times = f.times.map(function(t,i){ return '<div class="hs-time"><input type="time" value="'+esc(t)+'" data-ti="'+i+'" aria-label="Dose time '+(i+1)+'">'+(f.times.length>1?'<button type="button" data-hs="rmtime" data-v="'+i+'" aria-label="Remove this time">×</button>':'')+'</div>'; }).join('');
    return '<label class="hs-l" for="hs-name">Medicine name</label><input id="hs-name" class="sinp" maxlength="60" placeholder="e.g. Metformin" value="'+esc(f.name)+'" autocomplete="off">'+
      '<label class="hs-l" for="hs-dose">Strength or amount</label><input id="hs-dose" class="sinp" maxlength="40" placeholder="e.g. 500 mg, 1 tablet, 5 ml" value="'+esc(f.dose)+'" autocomplete="off">'+
      '<span class="hs-l">Type</span>'+hChips('form',HFORMS.map(function(x){return [x,x]}),f.form)+
      '<span class="hs-l">How many times a day</span>'+hChips('freq',[['1','Once'],['2','Twice'],['3','3 times'],['4','4 times']],String(f.times.length))+
      '<span class="hs-l">Dose times</span><div class="hs-times">'+times+'<button type="button" class="hs-add" data-hs="addtime">+ Add time</button></div>'+
      '<span class="hs-l">When to take it</span>'+hChips('food',Object.keys(HFOOD).map(function(k){return [k,HFOOD[k]]}),f.food)+
      '<span class="hs-l">Days</span>'+hChips('dmode',[['all','Every day'],['some','Selected days']],f.days.length?'some':'all')+
      (f.days.length || f.dmode==='some' ? hChips('wd',HWD.map(function(d,i){return [String(i),d]}),f.days.map(String),true) : '')+
      '<div class="hs-two"><div><label class="hs-l" for="hs-start">Start date</label><input type="date" id="hs-start" value="'+esc(f.start||todayKey())+'"></div><div><span class="hs-l">How long</span>'+hChips('dur',[['on','Ongoing'],['days','Set days']],f.dur)+'</div></div>'+
      (f.dur==='days' ? '<label class="hs-l" for="hs-nd">Number of days</label><input type="number" id="hs-nd" class="sinp" min="1" max="365" inputmode="numeric" value="'+esc(f.ndays)+'">' : '')+
      '<details class="hs-more"'+(f.stock!=null?' open':'')+'><summary>Refill reminder (optional)</summary><div class="hs-two"><div><label class="hs-l" for="hs-stock">Tablets or doses left</label><input type="number" id="hs-stock" class="sinp" min="0" max="9999" inputmode="decimal" value="'+(f.stock!=null?esc(f.stock):'')+'" placeholder="e.g. 30"></div><div><label class="hs-l" for="hs-per">Used per dose</label><input type="number" id="hs-per" class="sinp" min="0.25" max="50" step="0.25" inputmode="decimal" value="'+esc(f.per||1)+'"></div></div><p class="hs-hint">KDN counts down each time you tap Taken and warns you when 5 or fewer are left.</p></details>'+
      (f.id ? '<span class="hs-l">Reminders</span>'+hChips('pz',[['0','Active'],['1','Paused']],f.paused?'1':'0') : '')+
      '<label class="hs-l" for="hs-notes">Notes</label><textarea id="hs-notes" class="sinp" rows="2" maxlength="300" placeholder="e.g. Prescribed by Dr Mehta for BP">'+esc(f.notes||'')+'</textarea>'+
      '<p class="hs-err" id="hs-err" role="alert" hidden></p>'+
      (f.id ? '<div class="hs-cal"><b>Reminder when KDN is closed</b><p>Add each dose time to your calendar. Your phone then reminds you even if KDN is not open.</p>'+f.times.map(function(t){ return '<a class="hh-btn sm ghost" target="_blank" rel="noopener" href="'+esc(hGcal(f,t))+'">Google Calendar · '+hT12(t)+'</a>'; }).join('')+'<button type="button" class="hh-btn sm ghost" data-hs="icsone">Calendar file (iPhone and others)</button></div>' : '');
  }
  function hMedRead(){
    var f = hS.form; if(!f) return;
    var g = function(id){ var e = $(id); return e ? e.value : ''; };
    f.name = g('hs-name').trim(); f.dose = g('hs-dose').trim(); f.notes = g('hs-notes').trim(); f.start = g('hs-start') || todayKey();
    Array.prototype.forEach.call(document.querySelectorAll('#hsheet [data-ti]'),function(i){ f.times[+i.getAttribute('data-ti')] = i.value; });
    if($('hs-nd')) f.ndays = parseInt(g('hs-nd'),10);
    var st = g('hs-stock'); f.stockIn = st; f.perIn = g('hs-per');
  }
  function hMedRedraw(){ hMedRead(); var b = document.querySelector('#hsheet .hs-body'), y = b.scrollTop; b.innerHTML = hMedBody(); b.scrollTop = y; }
  function hMedSave(){
    hMedRead(); var f = hS.form;
    if(!f.name) return hErr('Enter the medicine name.');
    var times = f.times.filter(function(t){ return /^\d{2}:\d{2}$/.test(t); });
    times = times.filter(function(t,i){ return times.indexOf(t)===i; }).sort();
    if(!times.length) return hErr('Add at least one dose time.');
    if(f.dmode==='some' && !f.days.length) return hErr('Pick at least one day, or choose Every day.');
    if(f.dur==='days' && !(f.ndays>=1 && f.ndays<=365)) return hErr('Enter the number of days, from 1 to 365.');
    var stock = f.stockIn==='' || f.stockIn==null ? null : parseFloat(f.stockIn);
    if(stock!=null && !(stock>=0 && stock<=9999)) return hErr('Enter how many are left, or leave it empty.');
    var per = parseFloat(f.perIn); if(!(per>0 && per<=50)) per = 1;
    var p = hP(), m = {id:f.id||hId(),name:f.name.slice(0,60),dose:f.dose.slice(0,40),form:f.form,times:times,days:f.dmode==='some'||f.days.length?f.days.slice().sort():[],food:f.food,
      start:f.start,end:f.dur==='days' ? hAdd(f.start,f.ndays-1) : '',stock:stock,per:per,refill:5,notes:f.notes.slice(0,300),paused:!!f.paused,at:f.at||Date.now()};
    if(m.days.length===7) m.days = [];
    var ix = -1; p.meds.forEach(function(x,i){ if(x.id===m.id) ix = i; });
    if(ix>=0) p.meds[ix] = m; else p.meds.push(m);
    if(!hSave()) return;
    hClose(); hRender(); snd('ok'); toast(ix>=0 ? 'Medicine saved.' : m.name+' added. KDN will remind you at '+times.map(hT12).join(', ')+'.');
    if(ix<0 && hNotifState()==='ask') setTimeout(hNotifAsk,600);
  }

  /* medical ID form */
  function hIdForm(){
    var p = hP(), mi = p.mid; hS.sheet = 'id'; hS.form = {blood:mi.blood||''};
    var ec = mi.ec||{}, doc = mi.doc||{};
    hSheet('Medical ID',
      '<span class="hs-l">Blood group</span>'+hChips('blood',HBLOOD.map(function(b){return [b,b]}).concat([['?','Don’t know']]),mi.blood||'')+
      '<label class="hs-l" for="hi-al">Allergies</label><input id="hi-al" class="sinp" maxlength="200" placeholder="e.g. Penicillin, peanuts" value="'+esc(mi.allergy||'')+'">'+
      '<label class="hs-l" for="hi-co">Long-term conditions</label><input id="hi-co" class="sinp" maxlength="200" placeholder="e.g. Diabetes, thyroid, asthma" value="'+esc(mi.cond||'')+'">'+
      '<label class="hs-l" for="hi-su">Past surgeries or major illness</label><input id="hi-su" class="sinp" maxlength="200" placeholder="e.g. Appendix removed (2019)" value="'+esc(mi.surg||'')+'">'+
      '<div class="hs-grp"><b>Emergency contact</b><div class="hs-two"><div><label class="hs-l" for="hi-en">Name</label><input id="hi-en" class="sinp" maxlength="40" value="'+esc(ec.name||'')+'"></div><div><label class="hs-l" for="hi-er">Relation</label><input id="hi-er" class="sinp" maxlength="30" placeholder="e.g. Wife" value="'+esc(ec.rel||'')+'"></div></div><label class="hs-l" for="hi-ep">Phone</label><input id="hi-ep" class="sinp" type="tel" inputmode="tel" maxlength="20" value="'+esc(ec.phone||'')+'"></div>'+
      '<div class="hs-grp"><b>Regular doctor</b><div class="hs-two"><div><label class="hs-l" for="hi-dn">Name</label><input id="hi-dn" class="sinp" maxlength="40" value="'+esc(doc.name||'')+'"></div><div><label class="hs-l" for="hi-dp">Phone</label><input id="hi-dp" class="sinp" type="tel" inputmode="tel" maxlength="20" value="'+esc(doc.phone||'')+'"></div></div></div>'+
      '<label class="hs-l" for="hi-no">Other notes</label><textarea id="hi-no" class="sinp" rows="2" maxlength="400">'+esc(mi.notes||'')+'</textarea>',
      '<button type="button" class="hh-gold wide" data-hs="saveid">Save</button>');
  }
  function hIdSave(){
    var g = function(id){ return ($(id)||{}).value ? $(id).value.trim() : ''; }, p = hP();
    p.mid = {blood:hS.form.blood==='?'?'':hS.form.blood,allergy:g('hi-al'),cond:g('hi-co'),surg:g('hi-su'),ec:{name:g('hi-en'),rel:g('hi-er'),phone:g('hi-ep')},doc:{name:g('hi-dn'),phone:g('hi-dp')},notes:g('hi-no')};
    if(!hSave()) return; hClose(); hRender(); snd('ok'); toast('Medical ID saved.');
  }

  /* record form */
  function hRecForm(r){
    hS.sheet = 'rec';
    hS.form = r ? JSON.parse(JSON.stringify(r)) : {id:'',type:'lab',title:'',date:todayKey(),doc:'',place:'',notes:'',files:[]};
    hS.form.add = []; hS.form.rm = [];
    hSheet(r ? 'Edit record' : 'Add record', hRecBody(), '<button type="button" class="hh-gold wide" data-hs="saverec">'+(r?'Save':'Save record')+'</button>');
  }
  function hRecBody(){
    var f = hS.form, ph = {lab:'e.g. Blood test – CBC',rx:'e.g. Fever medicines',scan:'e.g. Chest X-ray',visit:'e.g. Check-up with Dr Mehta',vac:'e.g. Flu vaccine',dis:'e.g. Hospital stay – fracture',bill:'e.g. Health insurance card',oth:'e.g. Eye test'}[f.type];
    var files = f.files.map(function(x){ return '<li><span>'+esc(x.name)+'</span><small>'+hSize(x.size||0)+'</small><button type="button" data-hs="rmold" data-v="'+x.id+'" aria-label="Remove '+esc(x.name)+'">×</button></li>'; }).join('') +
      f.add.map(function(x,i){ return '<li class="new"><span>'+esc(x.name||'Photo')+'</span><small>'+hSize(x.size||0)+'</small><button type="button" data-hs="rmnew" data-v="'+i+'" aria-label="Remove '+esc(x.name||'photo')+'">×</button></li>'; }).join('');
    return '<span class="hs-l">Type</span>'+hChips('rtype',HTYPES.map(function(t){return [t[0],t[1]]}),f.type)+
      '<label class="hs-l" for="hr-ti">Title</label><input id="hr-ti" class="sinp" maxlength="80" placeholder="'+esc(ph)+'" value="'+esc(f.title)+'">'+
      '<div class="hs-two"><div><label class="hs-l" for="hr-da">Date</label><input type="date" id="hr-da" value="'+esc(f.date)+'" max="'+hAdd(todayKey(),1)+'"></div><div><label class="hs-l" for="hr-do">Doctor</label><input id="hr-do" class="sinp" maxlength="60" placeholder="e.g. Dr Mehta" value="'+esc(f.doc)+'"></div></div>'+
      '<label class="hs-l" for="hr-pl">Hospital, clinic or lab</label><input id="hr-pl" class="sinp" maxlength="80" value="'+esc(f.place)+'">'+
      '<label class="hs-l" for="hr-no">Notes</label><textarea id="hr-no" class="sinp" rows="3" maxlength="1000" placeholder="Results, doctor’s advice, next visit…">'+esc(f.notes)+'</textarea>'+
      '<span class="hs-l">Photos and PDFs</span><div class="hs-pick"><label class="hh-btn sm ghost">'+hI('<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>')+'Take photo<input type="file" accept="image/*" capture="environment" data-hs="files" hidden></label><label class="hh-btn sm ghost">'+hI('<path d="M12 16V4M7 9l5-5 5 5M5 20h14"/>')+'Choose files<input type="file" accept="image/*,application/pdf" multiple data-hs="files" hidden></label></div>'+
      (files ? '<ul class="hs-files">'+files+'</ul>' : '<p class="hs-hint">Photos are made smaller to save space. PDFs up to 15 MB.</p>')+
      '<p class="hs-err" id="hs-err" role="alert" hidden></p>';
  }
  function hRecRead(){ var f = hS.form, g = function(id){ return $(id) ? $(id).value : ''; }; f.title = g('hr-ti').trim(); f.date = g('hr-da'); f.doc = g('hr-do').trim(); f.place = g('hr-pl').trim(); f.notes = g('hr-no').trim(); }
  function hRecRedraw(){ hRecRead(); var b = document.querySelector('#hsheet .hs-body'), y = b.scrollTop; b.innerHTML = hRecBody(); b.scrollTop = y; }
  function hRecSave(){
    if(hS.busy) return;
    hRecRead(); var f = hS.form;
    if(!f.date) return hErr('Pick the date of this record.');
    if(!f.title && !f.add.length && !f.files.length) return hErr('Add a title or at least one photo or PDF.');
    var btn = document.querySelector('[data-hs="saverec"]'); hS.busy = true; if(btn){ btn.disabled = true; btn.textContent = 'Saving…'; }
    var adds = f.add.map(function(file){ return hShrink(file).then(function(b){ var id = 'f'+hId(); return hPut(id,b).then(function(){ return {id:id,name:file.name||'photo.jpg',type:b.type||file.type,size:b.size}; }); }); });
    Promise.all(adds).then(function(nf){
      return hDelFiles(f.rm).then(function(){ return nf; });
    }).then(function(nf){
      var p = hP(), r = {id:f.id||hId(),type:f.type,title:f.title.slice(0,80),date:f.date,doc:f.doc.slice(0,60),place:f.place.slice(0,80),notes:f.notes.slice(0,1000),files:f.files.concat(nf),at:f.at||Date.now()};
      var ix = -1; p.recs.forEach(function(x,i){ if(x.id===r.id) ix = i; });
      if(ix>=0) p.recs[ix] = r; else p.recs.push(r);
      hS.busy = false;
      if(!hSave()) return;
      hClose(); hRender(); snd('ok'); toast(ix>=0 ? 'Record saved.' : 'Record added.');
    }).catch(function(){
      hS.busy = false; if(btn){ btn.disabled = false; btn.textContent = 'Save record'; }
      hErr('Could not save the files on this phone. Free some space, or try a smaller file.');
    });
  }
  function hRecView(r){
    hS.sheet = 'view'; hS.form = {id:r.id};
    var T = HTYPE[r.type] || HTYPE.oth;
    var files = (r.files||[]).map(function(x){
      return /^image\//.test(x.type) ? '<button type="button" class="hv-img" data-hs="viewf" data-v="'+x.id+'"><img loading="lazy" decoding="async" alt="'+esc(x.name)+'" data-hf="'+x.id+'"></button>'
        : '<button type="button" class="hv-pdf" data-hs="viewf" data-v="'+x.id+'">'+hI('<path d="M6 3h9l4 4v14H6z"/><path d="M14 3v5h5"/>')+'<span><b>'+esc(x.name)+'</b><small>PDF · '+hSize(x.size||0)+'</small></span></button>';
    }).join('');
    hSheet(esc(r.title||T.name),
      '<div class="hv-meta"><span class="hh-ric" style="--c:'+T.c+'">'+hI(T.ic)+'</span><div><small style="color:'+T.c+'">'+esc(T.name)+'</small><b>'+esc(r.date?hDate(r.date,{weekday:'short',day:'numeric',month:'long',year:'numeric'}):'')+'</b><span>'+esc([r.doc,r.place].filter(Boolean).join(' · '))+'</span></div></div>'+
      (r.notes ? '<p class="hv-notes">'+esc(r.notes).replace(/\n/g,'<br>')+'</p>' : '')+
      (files ? '<div class="hv-files">'+files+'</div>' : '<p class="hs-hint">No files in this record.</p>'),
      '<button type="button" class="hh-btn ghost danger" data-hs="delrec">Delete</button>'+((navigator.share||NATIVE) && (r.files||[]).length?'<button type="button" class="hh-btn ghost" data-hs="share">Share</button>':'')+'<button type="button" class="hh-gold" data-hs="editrec">Edit</button>');
  }
  function hViewFile(id){
    var p = hP(), meta = null;
    p.recs.forEach(function(r){ (r.files||[]).forEach(function(f){ if(f.id===id) meta = f; }); });
    hGet(id).then(function(b){
      if(!b){ toast('This file is missing on this phone.'); return; }
      var u = hURL(b);
      if(!/^image\//.test(b.type || (meta&&meta.type) || '')){ if(NATIVE){ gSaveFile(b,(meta&&meta.name)||'report.pdf'); return; } var w = window.open(u,'_blank'); if(!w) gSaveFile(b,(meta&&meta.name)||'report.pdf'); return; }
      var v = $('hview'); v.innerHTML = '<div class="hv-top"><span>'+esc(meta?meta.name:'')+'</span><button type="button" data-hv="zoom">Zoom</button><button type="button" data-hv="close" aria-label="Close">×</button></div><div class="hv-sc"><img loading="lazy" decoding="async" src="'+u+'" alt="'+esc(meta?meta.name:'Report')+'"></div>';
      v.hidden = false;
    }).catch(function(){ toast('Could not open this file.'); });
  }
  function hShare(r){
    if(NATIVE){ Promise.all((r.files||[]).map(function(f){ return hGet(f.id).then(function(b){ return b ? {blob:b,name:f.name||'report'} : null; }); })).then(function(l){ nShareFiles(l.filter(Boolean),r.title||'Medical record'); }); return; }
    Promise.all((r.files||[]).map(function(f){ return hGet(f.id).then(function(b){ return b ? new File([b],f.name||'report',{type:b.type||f.type}) : null; }); })).then(function(fs){
      fs = fs.filter(Boolean);
      var data = {title:r.title||'Medical record',text:(r.title||'')+(r.date?' · '+hDate(r.date):''),files:fs};
      if(navigator.canShare && !navigator.canShare(data)) delete data.files;
      return navigator.share(data);
    }).catch(function(e){ if(e && e.name==='AbortError') return; toast('Sharing is not available here.'); });
  }

  /* period sheets */
  function hDayForm(k){
    var p = hP(), c = p.cyc, d = c.days[k] || {}, r = hCyc(c), mk = hDayMarks(c,r,k);
    hS.sheet = 'day'; hS.form = {k:k,per:!!mk.per||(!!mk.pp && k<=todayKey()&&!!r.ongoing),f:d.f||'',sy:(d.sy||[]).slice(),mood:d.mood||''};
    hSheet(hDate(k,{weekday:'long',day:'numeric',month:'long'}), hDayBody(), '<button type="button" class="hh-rose wide" data-hs="saveday">Save</button>');
  }
  function hDayBody(){
    var f = hS.form, d = hP().cyc.days[f.k] || {};
    return (f.k>todayKey() ? '<p class="hs-hint">This day is in the future. You can still plan or add a note.</p>' : '')+
      '<button type="button" class="hs-tog'+(f.per?' on':'')+'" data-hs="pertog" aria-pressed="'+f.per+'"><span>Period on this day</span><i></i></button>'+
      '<span class="hs-l">Flow</span>'+hChips('flow',[['','None']].concat(Object.keys(HFLOW).map(function(x){return [x,HFLOW[x]]})),f.f)+
      '<span class="hs-l">Symptoms</span>'+hChips('sy',HSYM,f.sy,true)+
      '<span class="hs-l">Mood</span>'+hChips('mood',[['','–']].concat(HMOOD),f.mood)+
      '<label class="hs-l" for="hd-no">Note</label><textarea id="hd-no" class="sinp" rows="2" maxlength="300">'+esc(d.note||'')+'</textarea>';
  }
  function hDaySave(){
    var f = hS.form, p = hP(), c = p.cyc, note = ($('hd-no')||{}).value || '';
    var r = hCyc(c), mk = hDayMarks(c,r,f.k), was = !!mk.per || (!!mk.pp && f.k<=todayKey() && !!r.ongoing);
    if(f.per!==was) hSetPeriodDay(c,f.k,f.per);
    var d = {f:f.f,sy:f.sy,mood:f.mood,note:note.trim().slice(0,300)};
    if(d.f || d.sy.length || d.mood || d.note) c.days[f.k] = d; else delete c.days[f.k];
    if(!hSave()) return; hClose(); hRender(); snd('ok'); toast('Saved.');
  }
  function hCycStartForm(){
    hS.sheet = 'cs'; var c = hP().cyc;
    hSheet('Your last period',
      '<label class="hs-l" for="hc-s">First day of your last period</label><input type="date" id="hc-s" max="'+todayKey()+'" value="'+todayKey()+'">'+
      '<div class="hs-two"><div><label class="hs-l" for="hc-l">Usual cycle (days)</label><input type="number" id="hc-l" class="sinp" min="21" max="45" inputmode="numeric" value="'+c.len+'"></div><div><label class="hs-l" for="hc-p">Usual period (days)</label><input type="number" id="hc-p" class="sinp" min="2" max="10" inputmode="numeric" value="'+c.per+'"></div></div>'+
      '<p class="hs-hint">Not sure? Leave 28 and 5. KDN learns your real cycle as you log more periods.</p><p class="hs-err" id="hs-err" role="alert" hidden></p>',
      '<button type="button" class="hh-rose wide" data-hs="savecs">Start tracking</button>');
  }
  function hCycStartSave(set){
    var c = hP().cyc, s = ($('hc-s')||{}).value, L = parseInt(($('hc-l')||{}).value,10), Pn = parseInt(($('hc-p')||{}).value,10);
    if(!set && (!s || s>todayKey())) return hErr('Pick a date that is today or earlier.');
    if(!(L>=21 && L<=45)) return hErr('Cycle length should be 21 to 45 days.');
    if(!(Pn>=2 && Pn<=10)) return hErr('Period length should be 2 to 10 days.');
    c.len = L; c.per = Pn;
    if(!set && !c.periods.some(function(x){ return x.s===s; })){ c.periods.push({s:s,e:hDiff(s,todayKey())<Pn ? null : hAdd(s,Pn-1)}); c.periods.sort(function(a,b){ return a.s<b.s?-1:1; }); }
    if(!hSave()) return; hClose(); hRender(); snd('ok'); toast(set ? 'Cycle settings saved.' : 'Tracking started.');
  }
  function hCycSetForm(){
    hS.sheet = 'cset'; var c = hP().cyc;
    hSheet('Cycle settings',
      '<div class="hs-two"><div><label class="hs-l" for="hc-l">Usual cycle (days)</label><input type="number" id="hc-l" class="sinp" min="21" max="45" inputmode="numeric" value="'+c.len+'"></div><div><label class="hs-l" for="hc-p">Usual period (days)</label><input type="number" id="hc-p" class="sinp" min="2" max="10" inputmode="numeric" value="'+c.per+'"></div></div>'+
      '<p class="hs-hint">Used until you have logged 2 periods. After that KDN uses the average of your last 6 cycles.</p><p class="hs-err" id="hs-err" role="alert" hidden></p>'+
      '<button type="button" class="hh-btn sm ghost danger" data-hs="cycwipe">'+(hS.delAsk==='cyc'?'Tap again to delete all period data':'Delete all period data')+'</button>',
      '<button type="button" class="hh-rose wide" data-hs="savecset">Save</button>');
  }

  /* ---- backup ---- */
  function hBackup(){
    var D = hLoad(), ids = [];
    Object.keys(D.ppl).forEach(function(k){ (D.ppl[k].recs||[]).forEach(function(r){ (r.files||[]).forEach(function(f){ ids.push(f.id); }); }); });
    toast('Preparing backup…');
    Promise.all(ids.map(function(id){ return hGet(id).then(function(b){ return b ? new Promise(function(res){ var fr = new FileReader(); fr.onload = function(){ res([id,fr.result]); }; fr.onerror = function(){ res(null); }; fr.readAsDataURL(b); }) : null; }).catch(function(){ return null; }); })).then(function(list){
      var files = {}; list.forEach(function(x){ if(x) files[x[0]] = x[1]; });
      var blob = new Blob([JSON.stringify({kdnHealth:1,saved:new Date().toISOString(),data:D,files:files})],{type:'application/json'});
      gSaveFile(blob,'kdn-health-backup-'+todayKey()+'.json');
    });
  }
  function hRestore(file){
    var fr = new FileReader();
    fr.onload = function(){
      var o; try{ o = JSON.parse(fr.result); }catch(e){ o = null; }
      if(!o || o.kdnHealth!==1 || !o.data || !o.data.ppl){ toast('That is not a KDN health backup file.'); return; }
      var ids = Object.keys(o.files||{});
      Promise.all(ids.map(function(id){ return fetch(o.files[id]).then(function(r){ return r.blob(); }).then(function(b){ return hPut(id,b); }); })).then(function(){
        var D = hLoad();
        Object.keys(o.data.ppl).forEach(function(k){
          var src = o.data.ppl[k], dst = hP(k);
          ['meds','recs'].forEach(function(f){ (src[f]||[]).forEach(function(x){ if(!dst[f].some(function(y){ return y.id===x.id; })) dst[f].push(x); }); });
          Object.keys(src.taken||{}).forEach(function(d){ if(!dst.taken[d]) dst.taken[d] = src.taken[d]; });
          if(src.mid && !dst.mid.blood && !dst.mid.allergy && !dst.mid.cond) dst.mid = src.mid;
          if(src.cyc){ (src.cyc.periods||[]).forEach(function(x){ if(!dst.cyc.periods.some(function(y){ return y.s===x.s; })) dst.cyc.periods.push(x); }); Object.keys(src.cyc.days||{}).forEach(function(d){ if(!dst.cyc.days[d]) dst.cyc.days[d] = src.cyc.days[d]; }); }
        });
        hSave(); hRender(); snd('ok'); toast('Backup restored.');
      }).catch(function(){ toast('Could not restore. The phone may be out of space.'); });
    };
    fr.readAsText(file);
  }

  /* ---- reminders ---- */
  var hFired = {}, hSnooze = {}, hQueue = [], hRemCur = null, hSW = null;
  function hNotifState(){
    if(NATIVE) return nNotif;
    if(!('Notification' in window)) return 'none';
    if(Notification.permission==='granted') return 'on';
    if(Notification.permission==='denied') return 'blocked';
    return 'ask';
  }
  function hRegSW(){
    if(NATIVE || hSW || !('serviceWorker' in navigator) || location.protocol!=='https:') return Promise.resolve(null);
    hSW = navigator.serviceWorker.register('/sw.js').then(function(){ return navigator.serviceWorker.ready; }).catch(function(){ return null; });
    return hSW;
  }
  function hNotifAsk(){
    if(NATIVE){ nAskNotif(); return; }
    if(hNotifState()!=='ask') return;
    try{
      var pr = Notification.requestPermission(function(){});
      var after = function(){ hRegSW(); if(curScreen==='s-health') hRender(); if(hNotifState()==='on'){ toast('Reminders are on.'); snd('ok'); } };
      if(pr && pr.then) pr.then(after); else setTimeout(after,800);
    }catch(e){}
  }
  function hNotify(title,body,tag){
    if(NATIVE || hNotifState()!=='on') return;
    var opt = {body:body,tag:tag,renotify:true,requireInteraction:true,vibrate:[200,100,200]};
    hRegSW().then(function(reg){
      if(reg && reg.showNotification) return reg.showNotification(title,opt);
      try{ new Notification(title,opt); }catch(e){}
    }).catch(function(){});
  }
  function hChime(){
    if(!SND || !SND.on) return;
    var c = sndCtx(); if(!c) return;
    try{ if(c.state==='suspended') c.resume(); var t = c.currentTime+0.01; [[784,0],[988,0.16],[1175,0.32],[784,0.9],[988,1.06],[1175,1.22]].forEach(function(x){ sTone(c,x[0],t+x[1],0.32,'sine',0.09); }); }catch(e){}
  }
  function hTick(){
    if(typeof healthOn!=='function' || !healthOn()) return;
    var D = hLoad(), day = todayKey(), now = new Date(), mins = now.getHours()*60+now.getMinutes(), ts = Date.now();
    hPeople().forEach(function(P){
      var p = D.ppl[P.id]; if(!HMED || !p || !Array.isArray(p.meds) || !p.meds.length) return;
      hDoses(hP(P.id),day).forEach(function(d){
        if(d.st) return;
        var key = P.id+'|'+day+'|'+d.k, tm = hMin(d.t), sn = hSnooze[key];
        if(sn){ if(ts>=sn && !hFired[key+'s'+sn]){ hFired[key+'s'+sn] = 1; hQueue.push({P:P,d:d,day:day,key:key}); } return; }
        if(mins>=tm && mins<tm+60 && !hFired[key]){ hFired[key] = 1; hQueue.push({P:P,d:d,day:day,key:key}); }
      });
    });
    /* period heads-up, once a day */
    hPeople().forEach(function(P){
      if(P.gender!=='female') return; var p = D.ppl[P.id]; if(!p || !p.cyc || !p.cyc.periods || !p.cyc.periods.length) return;
      var r = hCyc(hP(P.id).cyc); if(r.none || r.onPeriod || r.late>0 || r.until>2) return;
      var k = 'kdn.hpn', key = day+P.id, seen = ''; try{ seen = localStorage.getItem(k)||''; }catch(e){}
      if(seen.indexOf(key)>=0) return;
      try{ localStorage.setItem(k,(seen+','+key).slice(-200)); }catch(e){}
      var msg = (P.me?'Your':P.name+'’s')+' period is expected '+(r.until===0?'today':r.until===1?'tomorrow':'in 2 days')+' ('+hDate(r.next,{day:'numeric',month:'short'})+').';
      toast(msg); hNotify('KDN period reminder',msg,'kdn-per-'+P.id);
    });
    hRemNext();
    if(curScreen==='s-health' && hS.tab==='meds' && !hS.sheet && Math.floor(ts/60000)!==hTick.m){ hTick.m = Math.floor(ts/60000); var y = window.scrollY; hRender(); window.scrollTo(0,y); }
  }
  function hRemNext(){
    if(hRemCur || !hQueue.length) return;
    var it = hRemCur = hQueue.shift(), m = it.d.m, el = $('hrem');
    el.innerHTML = '<div class="hr-box" role="alertdialog" aria-labelledby="hr-t" aria-describedby="hr-d"><div class="hr-ic">'+hI('<rect x="3" y="8" width="18" height="8" rx="4" transform="rotate(-35 12 12)"/><path d="M9.5 8.5l5 7"/>')+'</div><small>Medicine time · '+hT12(it.d.t)+(it.P.me?'':' · for '+esc(it.P.name))+'</small><h3 id="hr-t">'+esc(m.name)+(m.dose?' <em>'+esc(m.dose)+'</em>':'')+'</h3><p id="hr-d">'+esc([m.form,HFOOD[m.food]].filter(Boolean).join(' · '))+(m.notes?'<br>'+esc(m.notes):'')+'</p><div class="hr-b"><button type="button" class="hh-gold wide" data-hr="t">'+hI('<path d="M5 12.5l4.5 4.5L19 7.5"/>')+'I took it</button><div><button type="button" class="hh-btn ghost" data-hr="z">Remind in 10 min</button><button type="button" class="hh-btn ghost" data-hr="s">Skip</button></div></div></div>';
    el.hidden = false;
    hChime(); try{ if(navigator.vibrate) navigator.vibrate([250,120,250]); }catch(e){}
    if(document.hidden) hNotify('Time for '+m.name,(m.dose?m.dose+' · ':'')+(HFOOD[m.food]||'')+(it.P.me?'':' · for '+it.P.name),'kdn-'+it.key);
    var b = el.querySelector('[data-hr="t"]'); if(b) b.focus();
  }
  $('hrem').addEventListener('click',function(ev){
    var b = ev.target.closest('button[data-hr]'); if(!b || !hRemCur) return;
    var a = b.getAttribute('data-hr'), it = hRemCur;
    if(a==='z'){ hSnooze[it.key] = Date.now()+10*60000; toast('KDN will remind you again in 10 minutes.'); }
    else { hMark(it.P.id,it.day,it.d.k,a); delete hSnooze[it.key]; if(a==='t'){ snd('win'); toast('Great. Dose marked as taken.'); } }
    $('hrem').hidden = true; hRemCur = null;
    if(curScreen==='s-health') hRender();
    if(curScreen==='s-home') renderHome();
    setTimeout(hRemNext,400);
  });
  setInterval(hTick,15000);
  document.addEventListener('visibilitychange',function(){ if(!document.hidden) hTick(); });
  setTimeout(function(){ if(hNotifState()==='on') hRegSW(); hTick(); },2500);

  /* home card */
  function hHomeCard(){
    if(typeof healthOn!=='function' || !healthOn()) return '';
    if(!HMED) return hHomeCardCycle();
    var D = hLoad(), day = todayKey(), line1 = '', line2 = '', next = null, cnt = 0, done = 0;
    hPeople().forEach(function(P){
      var p = D.ppl[P.id]; if(!p || !Array.isArray(p.meds)) return;
      hDoses(hP(P.id),day).forEach(function(d){ cnt++; if(d.st) { done++; return; } var st = hDoseState(d,day); if(st==='missed') return; if(!next || hMin(d.t)<hMin(next.d.t)) next = {d:d,P:P,st:st}; });
    });
    if(next) line1 = (next.st==='due'?'Due now: ':'Next: ')+next.d.m.name+' at '+hT12(next.d.t)+(next.P.me?'':' ('+next.P.name+')');
    else if(cnt) line1 = done+' of '+cnt+' doses taken today';
    else line1 = 'Medicine reminders and reports in one place';
    if(S && S.gender==='female'){
      var c = D.ppl.me && D.ppl.me.cyc && D.ppl.me.cyc.periods && D.ppl.me.cyc.periods.length ? hCyc(hP('me').cyc) : null;
      line2 = !c ? 'Track your period' : c.onPeriod ? 'Period day '+c.cday : c.late>0 ? 'Period '+c.late+' day'+(c.late>1?'s':'')+' late' : c.until===0 ? 'Period expected today' : 'Next period in '+c.until+' day'+(c.until>1?'s':'');
    }
    return '<button type="button" class="hx-health" data-hm="health"><span class="hx-hic">'+hI('<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M8.5 11.5h2l1-2 1.5 4 1-2h1.5"/>')+'</span><span class="hx-ht2"><small>My health</small><b>'+esc(line1)+'</b>'+(line2?'<span class="hx-per">'+hI('<path d="M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z"/>')+esc(line2)+'</span>':'')+'</span><span class="hx-go" aria-hidden="true">›</span></button>';
  }

  function hHomeCardCycle(){
    var P = hPeople()[0]; if(!P) return '';
    var D = hLoad(), p = D.ppl[P.id], c = p && p.cyc && p.cyc.periods && p.cyc.periods.length ? hCyc(hP(P.id).cyc) : null;
    var line = !c ? 'Track your period' : c.onPeriod ? 'Period day '+c.cday : c.late>0 ? 'Period '+c.late+' day'+(c.late>1?'s':'')+' late' : c.until===0 ? 'Period expected today' : 'Next period in '+c.until+' day'+(c.until>1?'s':'');
    return '<button type="button" class="hx-health" data-hm="health"><span class="hx-hic">'+hI('<path d="M12 3c3 4.5 6 8 6 11.5A6 6 0 0 1 6 14.5C6 11 9 7.5 12 3z"/>')+'</span><span class="hx-ht2"><small>Period tracker</small><b>'+esc(line)+'</b></span><span class="hx-go" aria-hidden="true">›</span></button>';
  }
  /* ---- events ---- */
  $('health').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-h]'); if(!b) return;
    var a = b.getAttribute('data-h'), v = b.getAttribute('data-v');
    if(a==='tab'){ hS.tab = v; snd('tap'); hRender(); return; }
    if(a==='who'){ hS.who = v; hS.q = ''; hS.type = 'all'; snd('tap'); hRender(); return; }
    if(a==='notif'){ hNotifAsk(); return; }
    if(a==='addmed'){ hMedForm(null); return; }
    if(a==='editmed'){ var m = hP().meds.filter(function(x){ return x.id===v; })[0]; if(m) hMedForm(m); return; }
    if(a==='dose'){ var s = b.getAttribute('data-s'); hMark(b.getAttribute('data-p'),b.getAttribute('data-d'),b.getAttribute('data-k'),s||null); snd(s==='t'?'ok':'tap'); hRender(); return; }
    if(a==='icsall'){ var P = hPerson(); gSaveFile(new Blob([hIcs(hP().meds.filter(function(m){ return !m.paused; }),P.me?'':P.name)],{type:'text/calendar'}),'kdn-medicines.ics'); return; }
    if(a==='editid'){ hIdForm(); return; }
    if(a==='addrec'){ hRecForm(null); return; }
    if(a==='openrec'){ var r = hP().recs.filter(function(x){ return x.id===v; })[0]; if(r) hRecView(r); return; }
    if(a==='type'){ hS.type = v; Array.prototype.forEach.call(document.querySelectorAll('#health [data-h="type"]'),function(x){ var on = x.getAttribute('data-v')===v; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on); }); hListRedraw(); return; }
    if(a==='backup'){ hBackup(); return; }
    if(a==='restore'){ var i = document.createElement('input'); i.type = 'file'; i.accept = 'application/json,.json'; i.onchange = function(){ if(i.files[0]) hRestore(i.files[0]); }; i.click(); return; }
    if(a==='cycstart'){ hCycStartForm(); return; }
    if(a==='cycnow'){ hSetPeriodDay(hP().cyc,todayKey(),true); hSave(); snd('ok'); hRender(); toast('Period started today. Tap “My period ended today” when it ends.'); return; }
    if(a==='cycend'){ var c = hP().cyc, r2 = hCyc(c); if(r2.last){ r2.last.e = todayKey(); hSave(); } snd('ok'); hRender(); toast('Saved. KDN will use this for your next prediction.'); return; }
    if(a==='day'){ hDayForm(v); return; }
    if(a==='calm'){ var t = (hS.calM || todayKey().slice(0,7))+'-15'; hS.calM = hAdd(t,(+v)*30).slice(0,7); var cal = document.querySelector('#health .hh-cal'), p2 = hP(); if(cal){ cal.outerHTML = hCal(p2.cyc,hCyc(p2.cyc)); } return; }
    if(a==='cycset'){ hCycSetForm(); return; }
  });
  function hListRedraw(){
    var p = hP(), recs = p.recs.slice().sort(function(a,b){ return a.date<b.date?1:a.date>b.date?-1:(b.at||0)-(a.at||0); }), el = $('hh-list');
    if(el){ hFreeURLs(); el.innerHTML = hRecList(recs); hThumbs(); }
  }
  $('health').addEventListener('input',function(ev){ if(ev.target.id==='hh-q'){ hS.q = ev.target.value; hListRedraw(); } });
  $('hsheet').addEventListener('click',function(ev){
    var c = ev.target.closest('[data-hc]');
    if(c){
      var n = c.getAttribute('data-hc'), v = c.getAttribute('data-v'), f = hS.form; snd('tap');
      if(hS.sheet==='med'){
        hMedRead();
        if(n==='form') f.form = v; else if(n==='food') f.food = v; else if(n==='pz') f.paused = v==='1'; else if(n==='dur') f.dur = v;
        else if(n==='freq'){ var P = {1:['08:00'],2:['08:00','20:00'],3:['08:00','14:00','20:00'],4:['07:00','12:00','17:00','22:00']}; f.times = P[v].slice(); }
        else if(n==='dmode'){ f.dmode = v; if(v==='all') f.days = []; else if(!f.days.length) f.days = [1,2,3,4,5]; }
        else if(n==='wd'){ var i = +v, ix = f.days.indexOf(i); if(ix>=0) f.days.splice(ix,1); else f.days.push(i); f.dmode = 'some'; }
        hMedRedraw(); return;
      }
      if(hS.sheet==='id' && n==='blood'){ f.blood = v; }
      if(hS.sheet==='rec' && n==='rtype'){ hRecRead(); f.type = v; hRecRedraw(); return; }
      if(hS.sheet==='day'){
        if(n==='flow'){ f.f = v; if(v && v!=='s') f.per = true; }
        else if(n==='mood') f.mood = v;
        else if(n==='sy'){ var j = f.sy.indexOf(v); if(j>=0) f.sy.splice(j,1); else f.sy.push(v); }
        var keepNote = ($('hd-no')||{}).value, b0 = document.querySelector('#hsheet .hs-body'), y0 = b0.scrollTop; b0.innerHTML = hDayBody(); if($('hd-no')) $('hd-no').value = keepNote; b0.scrollTop = y0; return;
      }
      var grp = c.parentNode; Array.prototype.forEach.call(grp.querySelectorAll('.cb'),function(x){ var on = x===c; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on); });
      return;
    }
    var b = ev.target.closest('[data-hs]'); if(!b) return;
    var a = b.getAttribute('data-hs'), v2 = b.getAttribute('data-v');
    if(a==='close'){ hClose(); return; }
    if(a==='files') return;
    if(a==='addtime'){ hMedRead(); var last = hS.form.times[hS.form.times.length-1] || '08:00', nm = Math.min(23*60+30,hMin(last)+240); hS.form.times.push(pad(Math.floor(nm/60))+':'+pad(nm%60)); hMedRedraw(); return; }
    if(a==='rmtime'){ hMedRead(); hS.form.times.splice(+v2,1); hMedRedraw(); return; }
    if(a==='savemed'){ hMedSave(); return; }
    if(a==='delmed'){
      if(hS.delAsk!=='med'){ hS.delAsk = 'med'; b.textContent = 'Tap again to delete'; return; }
      var p = hP(); p.meds = p.meds.filter(function(x){ return x.id!==hS.form.id; }); hSave(); hClose(); hRender(); toast('Medicine deleted.'); return;
    }
    if(a==='icsone'){ hMedRead(); gSaveFile(new Blob([hIcs([hS.form],hPerson().me?'':hPerson().name)],{type:'text/calendar'}),'kdn-'+hS.form.name.replace(/[^a-z0-9]+/gi,'-').toLowerCase()+'.ics'); return; }
    if(a==='saveid'){ hIdSave(); return; }
    if(a==='rmold'){ hRecRead(); hS.form.rm.push(v2); hS.form.files = hS.form.files.filter(function(x){ return x.id!==v2; }); hRecRedraw(); return; }
    if(a==='rmnew'){ hRecRead(); hS.form.add.splice(+v2,1); hRecRedraw(); return; }
    if(a==='saverec'){ hRecSave(); return; }
    if(a==='viewf'){ hViewFile(v2); return; }
    if(a==='editrec'){ var r = hP().recs.filter(function(x){ return x.id===hS.form.id; })[0]; if(r){ hClose(); setTimeout(function(){ hRecForm(r); },320); } return; }
    if(a==='share'){ var r2 = hP().recs.filter(function(x){ return x.id===hS.form.id; })[0]; if(r2) hShare(r2); return; }
    if(a==='delrec'){
      if(hS.delAsk!=='rec'){ hS.delAsk = 'rec'; b.textContent = 'Tap again to delete'; return; }
      var p3 = hP(), r3 = p3.recs.filter(function(x){ return x.id===hS.form.id; })[0];
      p3.recs = p3.recs.filter(function(x){ return x.id!==hS.form.id; }); hSave();
      if(r3) hDelFiles((r3.files||[]).map(function(f){ return f.id; })).catch(function(){});
      hClose(); hRender(); toast('Record deleted.'); return;
    }
    if(a==='pertog'){ hS.form.per = !hS.form.per; b.classList.toggle('on',hS.form.per); b.setAttribute('aria-pressed',hS.form.per); snd('tap'); return; }
    if(a==='saveday'){ hDaySave(); return; }
    if(a==='savecs'){ hCycStartSave(false); return; }
    if(a==='savecset'){ hCycStartSave(true); return; }
    if(a==='cycwipe'){
      if(hS.delAsk!=='cyc'){ hS.delAsk = 'cyc'; b.textContent = 'Tap again to delete all period data'; return; }
      hP().cyc = {}; hP(); hSave(); hClose(); hRender(); toast('Period data deleted.'); return;
    }
  });
  $('hsheet').addEventListener('change',function(ev){
    var i = ev.target; if(i.getAttribute('data-hs')!=='files' || !i.files) return;
    hRecRead();
    var bad = 0;
    Array.prototype.forEach.call(i.files,function(f){
      if(!/^image\//.test(f.type) && f.type!=='application/pdf'){ bad++; return; }
      if(f.size>15*1048576){ bad++; return; }
      hS.form.add.push(f);
    });
    hRecRedraw();
    if(bad) hErr(bad+' file'+(bad>1?'s were':' was')+' skipped. Use photos or PDFs up to 15 MB.');
  });
  $('hview').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-hv]'); if(!b) return;
    if(b.getAttribute('data-hv')==='close'){ $('hview').hidden = true; $('hview').innerHTML = ''; }
    else { var v = $('hview'); v.classList.toggle('zoom'); b.textContent = v.classList.contains('zoom') ? 'Fit' : 'Zoom'; }
  });
  document.addEventListener('keydown',function(ev){
    if(ev.key!=='Escape') return;
    if(!$('hview').hidden){ $('hview').hidden = true; $('hview').innerHTML = ''; }
    else if(!$('hsheet').hidden) hClose();
  });
  /* ==== KDN HEALTH END ==== */

