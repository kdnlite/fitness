  /* ---------- Sound: tiny synthesized tones (Web Audio, no audio files) ---------- */
  var SND = {ctx:null,on:true,last:{}};
  try{ SND.on = localStorage.getItem('kdn.snd')!=='0'; }catch(e){}
  function sndCtx(){
    if(SND.ctx) return SND.ctx;
    try{ var AC = window.AudioContext || window.webkitAudioContext; if(AC) SND.ctx = new AC(); }catch(e){}
    return SND.ctx;
  }
  function sTone(c,f,t0,d,type,vol){
    var o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001,t0);
    g.gain.exponentialRampToValueAtTime(vol,t0+0.01);
    g.gain.exponentialRampToValueAtTime(0.0001,t0+d);
    o.connect(g); g.connect(c.destination);
    o.start(t0); o.stop(t0+d+0.03);
  }
  function snd(n){
    if(!SND || !SND.on) return;
    var now = Date.now(); if(SND.last[n] && now-SND.last[n]<45) return; SND.last[n] = now;
    var c = sndCtx(); if(!c) return;
    try{
      if(c.state==='suspended') c.resume();
      var t = c.currentTime + 0.005;
      if(n==='tap') sTone(c,700,t,0.05,'sine',0.05);
      else if(n==='key') sTone(c,520,t,0.06,'triangle',0.07);
      else if(n==='nav'){ sTone(c,620,t,0.06,'sine',0.05); sTone(c,830,t+0.05,0.08,'sine',0.05); }
      else if(n==='rep') sTone(c,440,t,0.06,'triangle',0.045);
      else if(n==='ok'){ sTone(c,660,t,0.1,'sine',0.07); sTone(c,880,t+0.09,0.16,'sine',0.07); }
      else if(n==='err'){ sTone(c,230,t,0.13,'sawtooth',0.04); sTone(c,180,t+0.14,0.18,'sawtooth',0.04); }
      else if(n==='win'){ [523,659,784,1047].forEach(function(f,i){ sTone(c,f,t+i*0.09,0.2,'sine',0.07); }); }
    }catch(e){}
  }
  function sndLabel(){
    var b = $('m-snd'); if(!b) return;
    var s = b.querySelector('span'); if(s) s.textContent = 'Sound: ' + (SND.on ? 'On' : 'Off');
    b.setAttribute('aria-pressed', SND.on);
  }
  function sndToggle(){
    SND.on = !SND.on;
    try{ localStorage.setItem('kdn.snd', SND.on ? '1' : '0'); }catch(e){}
    sndLabel(); if(SND.on) snd('ok');
  }
  sndLabel();
  document.addEventListener('click',function(ev){
    var t = ev.target; if(!t || !t.closest) return;
    if(t.closest('#m-snd')) return;
    if(t.closest('.gkey')){ snd('key'); clearTimeout(SND.pt); SND.pt = setTimeout(function(){ if(document.querySelector('#gymroot .gdots.shake')) snd('err'); },450); return; }
    var w = t.closest('[data-hm=wo],[data-act=wo]');
    if(w){ snd(w.getAttribute('aria-pressed')==='true' ? 'tap' : 'win'); return; }
    if(t.closest('.bnav button,.gnav button')){ snd('nav'); return; }
    if(t.closest('button,summary,[role=tab],input[type=radio],input[type=checkbox]')) snd('tap');
  },true);

  /* ---------- Gym settings, themes, home extras ---------- */
  var GACC = [['gold','Gold','#E9C05A'],['emerald','Emerald','#58E4A3'],['royal','Royal','#588BE4'],['rose','Rose','#E45887'],['violet','Violet','#9958E4'],['ember','Ember','#E48758']];
  function gSet(){
    if(!G) return {theme:'dark',accent:'gold',rem:3,lock:0,dens:'cozy'};
    var s = G.set; if(!s || typeof s!=='object') s = G.set = {};
    if(['dark','light','auto'].indexOf(s.theme)<0) s.theme = 'dark';
    if(!GACC.some(function(a){ return a[0]===s.accent; })) s.accent = 'gold';
    if([1,3,5,7].indexOf(s.rem)<0) s.rem = 3;
    if([0,1,5,15].indexOf(s.lock)<0) s.lock = 0;
    if(s.dens!=='compact') s.dens = 'cozy';
    return s;
  }
  function gApplySet(){
    var s = gSet(), b = document.body, t = s.theme;
    if(t==='auto') t = (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    b.setAttribute('data-gt',t); b.setAttribute('data-ga',s.accent); b.classList.toggle('gcompact',s.dens==='compact');
    GREM = s.rem;
  }
  function gClearSet(){ var b = document.body; b.removeAttribute('data-gt'); b.removeAttribute('data-ga'); b.classList.remove('gcompact'); clearTimeout(gIdle.t); }

  /* auto-lock */
  var gIdle = {t:null,at:0};
  function gIdleReset(){
    clearTimeout(gIdle.t); gIdle.at = Date.now();
    if(!G || gS.view!=='dash') return;
    var m = gSet().lock; if(!m) return;
    gIdle.t = setTimeout(function(){ if(gS.view==='dash' && curScreen==='s-gym'){ gLockNow(); toast('Locked after '+m+(m===1?' minute':' minutes')+' of no activity.'); } },m*60000);
  }
  ['click','keydown','touchstart','scroll'].forEach(function(n){
    document.addEventListener(n,function(){ if(gS.view==='dash' && G && gSet().lock && Date.now()-gIdle.at>1500) gIdleReset(); },true);
  });

  /* settings screen */
  function gSw(act,on,label,sub){
    return '<div class="gset-row"><div><b>'+label+'</b>'+(sub?'<small>'+sub+'</small>':'')+'</div><button type="button" class="gsw'+(on?' on':'')+'" role="switch" aria-checked="'+on+'" aria-label="'+label+'" data-g="'+act+'"><i></i></button></div>';
  }
  function gSegS(act,cur,opts){
    return '<div class="gseg n'+opts.length+'" role="group">'+opts.map(function(o){ var on = String(cur)===String(o[0]); return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-g="'+act+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div>';
  }
  function gSetHtml(){
    var s = gSet(), acc = GACC.filter(function(a){ return a[0]===s.accent; })[0], h = gSub('Settings','more');
    h += '<div class="gcard dark gsetc"><h4>Appearance</h4><label class="gl">Theme</label>'+gSegS('s-theme',s.theme,[['dark','Dark'],['light','Light'],['auto','Auto']])+'<p class="ghint">Auto follows your phone or computer setting.</p>';
    h += '<label class="gl">Accent colour <span class="gaccn">'+acc[1]+'</span></label><div class="gswatches">'+GACC.map(function(a){ var on = a[0]===s.accent; return '<button type="button" class="gswatch'+(on?' on':'')+'" style="--sw:'+a[2]+'" aria-label="'+a[1]+'" aria-pressed="'+on+'" data-g="s-acc" data-v="'+a[0]+'"><svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg></button>'; }).join('')+'</div>';
    h += '<label class="gl">List size</label>'+gSegS('s-dens',s.dens,[['cozy','Comfortable'],['compact','Compact']])+'</div>';
    h += '<div class="gcard dark gsetc"><h4>Sound</h4>'+gSw('s-snd',SND.on,'Sound effects','Taps, PIN keys and success tones on this device')+'</div>';
    h += '<div class="gcard dark gsetc"><h4>Reminders</h4><label class="gl">Remind me before a fee, salary or service is due</label>'+gSegS('s-rem',s.rem,[[1,'1 day'],[3,'3 days'],[5,'5 days'],[7,'7 days']])+'</div>';
    h += '<div class="gcard dark gsetc"><h4>Security</h4><label class="gl">Auto-lock after no activity</label>'+gSegS('s-lock',s.lock,[[0,'Off'],[1,'1 min'],[5,'5 min'],[15,'15 min']])+'<div class="grow gsetb"><button type="button" class="gbtn ghost" data-g="s-pin">Change PIN</button><button type="button" class="gbtn ghost" data-g="lock">Lock now</button></div><p class="ghint">The PIN keeps casual users out. It is not a bank-grade lock, so use a phone lock as well.</p></div>';
    h += '<div class="gcard dark gsetc"><h4>App link</h4><label class="gl" for="s-url-in">Web address of your KDN app</label><input class="gin" id="s-url-in" type="url" inputmode="url" placeholder="https://yourname.github.io/kdn/" value="'+esc(s.url||'')+'" autocomplete="off"><p class="ghint">Used in the QR codes you share with members and trainers.</p><button type="button" class="gbtn ghost wide" data-g="k-url-save" data-in="s-url-in">Save link</button></div>';
    h += '<div class="gmore gsetm"><button type="button" class="gmk2" data-g="edit-gym"><span class="gmk"><svg viewBox="0 0 24 24"><path d="M4 20h4L19 9l-4-4L4 16z"/></svg></span><span><b>Gym profile</b><small>Name, logo, cover photo, address, phone</small></span><i>›</i></button><button type="button" class="gmk2" data-g="tab" data-t="backup"><span class="gmk"><svg viewBox="0 0 24 24"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg></span><span><b>Backup and export</b><small>Save or restore your data</small></span><i>›</i></button></div>';
    h += '<button type="button" class="gbtn ghost wide gexit" data-g="s-exit">Exit gym manager</button>';
    h += '<p class="gabout">KDN Gym Manager · all data stays in this browser. Save a backup now and then.</p>';
    return h;
  }
  function gPinOvHtml(){
    var f = function(id,l){ return '<label class="gl" for="'+id+'">'+l+'</label><input class="gin pin" id="'+id+'" type="password" inputmode="numeric" pattern="[0-9]*" maxlength="4" placeholder="••••" autocomplete="off">'; };
    return gXHead('Change PIN')+'<div class="govb"><div class="gcard dark">'+f('sp-old','Current PIN')+f('sp-new','New 4-digit PIN')+f('sp-new2','Enter the new PIN again')+'<div class="gwarn"><b>Write the new PIN down.</b> A forgotten PIN cannot be recovered.</div><p class="gerr" id="sp-err" role="alert" hidden></p><button type="button" class="gbtn gold wide" data-g="s-pin-save">Change PIN</button></div></div>';
  }
  function gPinErr(m){ var e = $('sp-err'); if(e){ e.textContent = m; e.hidden = false; } snd('err'); }
  function gPinSave(){
    var o = $('sp-old').value.trim(), n1 = $('sp-new').value.trim(), n2 = $('sp-new2').value.trim(), g = G.gym;
    if(!/^\d{4}$/.test(o)){ gPinErr('Enter your current 4-digit PIN.'); return; }
    if(!/^\d{4}$/.test(n1)){ gPinErr('The new PIN must be exactly 4 digits.'); return; }
    if(n1!==n2){ gPinErr('The two new PINs do not match.'); return; }
    if(n1===o){ gPinErr('The new PIN is the same as the current one.'); return; }
    gHash(o,g.salt,g.hash.length<20,function(h){
      if(h!==g.hash){ gPinErr('The current PIN is wrong.'); return; }
      gHash(n1,g.salt,false,function(h2){ g.hash = h2; gSave(); gS.ov = null; gRender(); toast('Your PIN was changed.'); });
    });
  }
  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b) return;
    var a = b.getAttribute('data-g'); if(a.indexOf('s-')!==0) return;
    if(a==='s-exit'){ if(G && gS.view==='dash') gFlush(); go('home'); return; }
    if(gS.view!=='dash') return;
    var v = b.getAttribute('data-v'), s = gSet(), y = window.scrollY;
    if(a==='s-theme') s.theme = v; else if(a==='s-acc') s.accent = v; else if(a==='s-dens') s.dens = v;
    else if(a==='s-rem') s.rem = parseInt(v,10); else if(a==='s-lock') s.lock = parseInt(v,10);
    else if(a==='s-snd'){ sndToggle(); gRender(); window.scrollTo(0,y); return; }
    else if(a==='s-pin'){ gS.ov = {type:'x',page:'pin-form'}; gRender(); return; }
    else if(a==='s-pin-save'){ gPinSave(); return; }
    else return;
    gSave(); gRender(); window.scrollTo(0,y); gIdleReset();
  });

  /* home extras: greeting + collection ring, week chart */
  function gGreet(){ var h = new Date().getHours(); return h<12 ? 'Good morning' : h<17 ? 'Good afternoon' : 'Good evening'; }
  function gHeroHtml(){
    var mk = gMk(), f = gFin(mk), tc = gToCollect(mk), tot = f.col+tc.amt, pct = tot>0 ? Math.round(f.col*100/tot) : 0, today = gK(gToday()), inn = (G.att[today]||[]).length;
    var R = 34, C = 2*Math.PI*R, off = C*(1-pct/100);
    var sub = tot>0 ? gMoney(f.col)+' collected of '+gMoney(tot)+' expected this month' : 'No fees are due this month yet';
    return '<div class="ghero"><div class="ghero-t"><small>'+gGreet()+'</small><h2>'+(inn ? inn+' checked in today' : 'Quiet so far today')+'</h2><p>'+esc(sub)+'</p><span class="ghero-d">'+gFmt(today)+'</span></div><div class="gring" role="img" aria-label="'+pct+' percent of this month’s fees collected"><svg viewBox="0 0 80 80"><circle cx="40" cy="40" r="'+R+'" class="trk"></circle><circle cx="40" cy="40" r="'+R+'" class="val" stroke-dasharray="'+C.toFixed(1)+'" stroke-dashoffset="'+off.toFixed(1)+'"></circle></svg><b>'+pct+'<small>%</small></b></div></div>';
  }
  function gWeekHtml(){
    var days = [], mx = 1, tot = 0, i, d = gToday();
    for(i=6;i>=0;i--){ var dt = new Date(d.getFullYear(),d.getMonth(),d.getDate()-i), n = (G.att[gK(dt)]||[]).length; days.push({n:n,l:['S','M','T','W','T','F','S'][dt.getDay()],t:i===0}); mx = Math.max(mx,n); tot += n; }
    return '<div class="gcard dark gweek"><div class="grh"><h4>Visits this week</h4><button type="button" class="glink" data-g="tab" data-t="att">Open</button></div><div class="gwbars" role="img" aria-label="Visits in the last 7 days, '+tot+' in total">'+days.map(function(x){ return '<div class="gwbar'+(x.t?' now':'')+'"><b>'+x.n+'</b><i style="--h:'+(x.n?Math.max(10,Math.round(x.n*100/mx)):4)+'"></i><span>'+x.l+'</span></div>'; }).join('')+'</div><p class="ghint">'+tot+' visit'+(tot===1?'':'s')+' in the last 7 days.</p></div>';
  }

  /* after every render: entrance animation and number count-up, once per tab */
  function gAfterRender(){
    if(gS.view!=='dash'){ gS.fxKey = null; return; }
    gIdleReset();
    if(gS.fxKey===gS.tab) return;
    gS.fxKey = gS.tab;
    var gb = $('gbody'); if(gb) gb.classList.add('gfx');
    if(typeof REDUCED!=='undefined' && REDUCED) return;
    Array.prototype.forEach.call(document.querySelectorAll('#gymroot .gst b,#gymroot .gthree b'),function(el){
      var tn = el.firstChild; if(!tn || tn.nodeType!==3) return;
      var m = /^([₹−-]?)([\d,]+)$/.exec(tn.nodeValue.trim()); if(!m) return;
      var to = parseInt(m[2].replace(/,/g,''),10); if(!(to>0) || to>100000000) return;
      var t0 = performance.now(), dur = 650;
      (function step(ts){ var k = Math.min(1,(ts-t0)/dur), e = 1-Math.pow(1-k,3); tn.nodeValue = m[1]+Math.round(to*e).toLocaleString('en-IN'); if(k<1) requestAnimationFrame(step); else tn.nodeValue = m[1]+to.toLocaleString('en-IN'); })(t0);
    });
  }

  /* ---------- QR code generator (byte mode, versions 1-40, levels L/M) ---------- */
  var QR_ECC = {L:[1,[-1,7,10,15,20,26,18,20,24,30,18,20,24,26,30,22,24,28,30,28,28,28,28,30,30,26,28,30,30,30,30,30,30,30,30,30,30,30,30,30,30],[-1,1,1,1,1,1,2,2,2,2,4,4,4,4,4,6,6,6,6,7,8,8,9,9,10,12,12,12,13,14,15,16,17,18,19,19,20,21,22,24,25]],
                M:[0,[-1,10,16,26,18,24,16,18,22,22,26,30,22,22,24,24,28,28,26,26,26,26,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28,28],[-1,1,1,1,2,2,4,4,4,5,5,5,8,9,9,10,10,11,13,14,16,17,17,18,20,21,23,25,26,28,29,31,33,35,37,38,40,43,45,47,49]]};
  function qrRawModules(v){ var r = (16*v+128)*v+64; if(v>=2){ var a = Math.floor(v/7)+2; r -= (25*a-10)*a-55; if(v>=7) r -= 36; } return r; }
  function qrDataWords(v,L){ var E = QR_ECC[L]; return Math.floor(qrRawModules(v)/8) - E[1][v]*E[2][v]; }
  function qrMul(x,y){ var z = 0; for(var i=7;i>=0;i--){ z = (z<<1)^((z>>>7)*0x11D); z ^= ((y>>>i)&1)*x; } return z; }
  function qrDivisor(deg){ var r = [], i, j; for(i=0;i<deg-1;i++) r.push(0); r.push(1); var root = 1; for(i=0;i<deg;i++){ for(j=0;j<r.length;j++){ r[j] = qrMul(r[j],root); if(j+1<r.length) r[j] ^= r[j+1]; } root = qrMul(root,2); } return r; }
  function qrRem(data,div){ var r = div.map(function(){return 0}); data.forEach(function(b){ var f = b^r.shift(); r.push(0); div.forEach(function(c,i){ r[i] ^= qrMul(c,f); }); }); return r; }
  function qrMake(text,L){
    var bytes = [], i, j, k;
    var u = unescape(encodeURIComponent(text)); for(i=0;i<u.length;i++) bytes.push(u.charCodeAt(i));
    var v, cap; for(v=1;v<=40;v++){ cap = qrDataWords(v,L)*8; var cb = v<=9 ? 8 : 16; if(4+cb+bytes.length*8<=cap) break; }
    if(v>40) return null;
    var bits = []; function put(val,n){ for(var b=n-1;b>=0;b--) bits.push((val>>>b)&1); }
    put(4,4); put(bytes.length,v<=9?8:16); bytes.forEach(function(b){ put(b,8); });
    var capb = qrDataWords(v,L)*8; put(0,Math.min(4,capb-bits.length)); while(bits.length%8) bits.push(0);
    for(var pad=0xEC; bits.length<capb; pad ^= 0xEC^0x11) put(pad,8);
    var data = []; for(i=0;i<bits.length;i+=8){ var w = 0; for(j=0;j<8;j++) w = (w<<1)|bits[i+j]; data.push(w); }
    var E = QR_ECC[L], nb = E[2][v], eccLen = E[1][v], raw = Math.floor(qrRawModules(v)/8), nShort = nb-raw%nb, shortLen = Math.floor(raw/nb), blocks = [], div = qrDivisor(eccLen);
    for(i=0,k=0;i<nb;i++){ var dat = data.slice(k,k+shortLen-eccLen+(i<nShort?0:1)); k += dat.length; var ecc = qrRem(dat,div); if(i<nShort) dat.push(0); blocks.push(dat.concat(ecc)); }
    var all = []; for(i=0;i<blocks[0].length;i++) blocks.forEach(function(bl,jj){ if(i!==shortLen-eccLen || jj>=nShort) all.push(bl[i]); });
    var size = v*4+17, M = [], F = []; for(i=0;i<size;i++){ M.push(new Array(size).fill(false)); F.push(new Array(size).fill(false)); }
    function setF(x,y,d){ M[y][x] = d; F[y][x] = true; }
    for(i=0;i<size;i++){ setF(6,i,i%2===0); setF(i,6,i%2===0); }
    function finder(cx,cy){ for(var dy=-4;dy<=4;dy++) for(var dx=-4;dx<=4;dx++){ var d = Math.max(Math.abs(dx),Math.abs(dy)), xx = cx+dx, yy = cy+dy; if(xx>=0&&xx<size&&yy>=0&&yy<size) setF(xx,yy,d!==2&&d!==4); } }
    finder(3,3); finder(size-4,3); finder(3,size-4);
    var pos = []; if(v>1){ var na = Math.floor(v/7)+2, step = v===32 ? 26 : Math.ceil((v*4+4)/(na*2-2))*2; pos = [6]; for(var p=size-7;pos.length<na;p-=step) pos.splice(1,0,p); }
    pos.forEach(function(a,ia){ pos.forEach(function(b,ib){ if((ia===0&&ib===0)||(ia===0&&ib===pos.length-1)||(ia===pos.length-1&&ib===0)) return; for(var dy=-2;dy<=2;dy++) for(var dx=-2;dx<=2;dx++) setF(a+dx,b+dy,Math.max(Math.abs(dx),Math.abs(dy))!==1); }); });
    function fmt(mask){
      var d = (E[0]<<3)|mask, r = d; for(var q=0;q<10;q++) r = (r<<1)^((r>>>9)*0x537);
      var bt = ((d<<10)|r)^0x5412, bit = function(n){ return ((bt>>>n)&1)!==0; }, q2;
      for(q2=0;q2<=5;q2++) setF(8,q2,bit(q2)); setF(8,7,bit(6)); setF(8,8,bit(7)); setF(7,8,bit(8)); for(q2=9;q2<15;q2++) setF(14-q2,8,bit(q2));
      for(q2=0;q2<8;q2++) setF(size-1-q2,8,bit(q2)); for(q2=8;q2<15;q2++) setF(8,size-15+q2,bit(q2)); setF(8,size-8,true);
    }
    fmt(0);
    if(v>=7){ var rr = v; for(i=0;i<12;i++) rr = (rr<<1)^((rr>>>11)*0x1F25); var vb = (v<<12)|rr; for(i=0;i<18;i++){ var col = ((vb>>>i)&1)!==0, a2 = size-11+i%3, b2 = Math.floor(i/3); setF(a2,b2,col); setF(b2,a2,col); } }
    var bi = 0; for(var right=size-1;right>=1;right-=2){ if(right===6) right = 5; for(var vert=0;vert<size;vert++) for(j=0;j<2;j++){ var x = right-j, up = ((right+1)&2)===0, y = up ? size-1-vert : vert; if(!F[y][x] && bi<all.length*8){ M[y][x] = ((all[bi>>>3]>>>(7-(bi&7)))&1)!==0; bi++; } } }
    function mask(m){ for(var y=0;y<size;y++) for(var x=0;x<size;x++){ var inv; switch(m){ case 0: inv=(x+y)%2===0; break; case 1: inv=y%2===0; break; case 2: inv=x%3===0; break; case 3: inv=(x+y)%3===0; break; case 4: inv=(Math.floor(x/3)+Math.floor(y/2))%2===0; break; case 5: inv=x*y%2+x*y%3===0; break; case 6: inv=(x*y%2+x*y%3)%2===0; break; default: inv=((x+y)%2+x*y%3)%2===0; } if(!F[y][x] && inv) M[y][x] = !M[y][x]; } }
    function penalty(){
      var s = 0, x, y, run, c, dark = 0;
      for(y=0;y<size;y++){ run = 1; for(x=1;x<=size;x++){ if(x<size && M[y][x]===M[y][x-1]) run++; else { if(run>=5) s += run-2; run = 1; } } }
      for(x=0;x<size;x++){ run = 1; for(y=1;y<=size;y++){ if(y<size && M[y][x]===M[y-1][x]) run++; else { if(run>=5) s += run-2; run = 1; } } }
      for(y=0;y<size-1;y++) for(x=0;x<size-1;x++){ c = M[y][x]; if(c===M[y][x+1] && c===M[y+1][x] && c===M[y+1][x+1]) s += 3; }
      var pa = [1,0,1,1,1,0,1,0,0,0,0], pb = [0,0,0,0,1,0,1,1,1,0,1];
      function match(get){ var n = 0; for(var o=0;o+11<=size;o++){ var a = true, b = true; for(var t=0;t<11;t++){ var g = get(o+t)?1:0; if(g!==pa[t]) a = false; if(g!==pb[t]) b = false; } if(a) n++; if(b) n++; } return n; }
      for(y=0;y<size;y++) s += 40*match(function(t){ return M[y][t]; });
      for(x=0;x<size;x++) s += 40*match(function(t){ return M[t][x]; });
      for(y=0;y<size;y++) for(x=0;x<size;x++) if(M[y][x]) dark++;
      s += 10*Math.floor(Math.abs(dark*20-size*size*10)/(size*size));
      return s;
    }
    var best = 0, bestP = 1e9; for(i=0;i<8;i++){ mask(i); fmt(i); var pn = penalty(); if(pn<bestP){ bestP = pn; best = i; } mask(i); }
    mask(best); fmt(best);
    return {size:size,mod:M,ver:v};
  }
  function qrSvg(text,opt){
    opt = opt||{}; var q = qrMake(text,'M') || qrMake(text,'L'); if(!q) return '';
    var n = q.size, b = 4, d = '', x, y;
    for(y=0;y<n;y++) for(x=0;x<n;x++) if(q.mod[y][x]) d += 'M'+(x+b)+' '+(y+b)+'h1v1h-1z';
    var t = n+b*2;
    return '<svg class="qrsvg" viewBox="0 0 '+t+' '+t+'" shape-rendering="crispEdges" role="img" aria-label="'+(opt.label||'QR code')+'"><rect width="'+t+'" height="'+t+'" fill="#fff"/><path d="'+d+'" fill="#000"/></svg>';
  }
  function qrFits(text){ return !!(qrMake(text,'L')); }

