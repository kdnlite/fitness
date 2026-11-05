  /* ---------- Social studio: add the gym's intro, outro and frame to any video ---------- */
  var ST = {file:null,url:'',vw:0,vh:0,dur:0,intro:true,outro:true,iDur:3,oDur:4,iTpl:'glow',oTpl:'bars',frame:'lower',ratio:'orig',res:'orig',fit:'blur',title:null,sub:'',trimS:0,trimE:0,busy:false,prog:0,cancel:false,out:null,outUrl:'',outExt:'',outInfo:'',err:'',pm:'in',pv:null,mus:'none',musVol:40,vidVol:100,musFile:null,musName:'',mp:null,cov:{t:1,txt:null,out:null,url:'',busy:false,err:''},cap:{purpose:'offer',lang:'hi',emo:true,v:0,detail:'',text:''}};
  var ST_IN = [['glow','Glow'],['bars','Bars'],['spot','Spotlight'],['split','Split'],['pulse','Pulse'],['clean','Clean']];
  var ST_FR = [['none','None'],['lower','Name bar'],['bracket','Corners'],['border','Border'],['neon','Neon'],['top','Top banner'],['film','Film strip'],['ribbon','Ribbon'],['mark','Watermark']];
  var ST_RT = [['orig','Same as video'],['9:16','Reel 9:16'],['1:1','Square'],['4:5','Portrait 4:5'],['16:9','Wide 16:9']];
  var stLogoImg = null, stLogoSrc = '', stRaf = 0;
  function stAcc(){ var a = GACC.filter(function(x){ return x[0]===gSet().accent; })[0] || GACC[0]; return a[2]; }
  function stRgb(hex){ var n = parseInt(hex.slice(1),16); return [n>>16&255,n>>8&255,n&255]; }
  function stA(hex,a){ var c = stRgb(hex); return 'rgba('+c[0]+','+c[1]+','+c[2]+','+a+')'; }
  function stTitle(){ return (ST.title===null ? G.gym.name : ST.title).trim() || G.gym.name; }
  function stSoc(){ var g = G.gym; if(!g.soc || typeof g.soc!=='object') g.soc = {ig:'',fb:'',yt:''}; return g.soc; }
  function stHandle(v){ v = String(v||'').trim(); return v ? (v.charAt(0)==='@' ? v : '@'+v) : ''; }
  function stLogo(){
    var src = G.gym.logo || ''; if(src===stLogoSrc) return stLogoImg;
    stLogoSrc = src; stLogoImg = null; if(!src) return null;
    var im = new Image(); im.onload = function(){ stLogoImg = im; }; im.src = src; return null;
  }
  function stEase(t){ t = Math.max(0,Math.min(1,t)); return 1-Math.pow(1-t,3); }
  function stSeg(f,cur,opts){ return '<div class="gseg n'+opts.length+'" role="group">'+opts.map(function(o){ var on = String(cur)===String(o[0]); return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-g="st-set" data-f="'+f+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div>'; }
  function stChips(f,cur,opts){ return '<div class="gchips stc" role="group">'+opts.map(function(o){ var on = cur===o[0]; return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-g="st-set" data-f="'+f+'" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div>'; }
  function stFit(c,txt,maxW,start,minPx){ var px = start; c.font = '800 '+px+'px "Bricolage Grotesque",system-ui,sans-serif'; while(c.measureText(txt).width>maxW && px>(minPx||10)){ px -= 2; c.font = '800 '+px+'px "Bricolage Grotesque",system-ui,sans-serif'; } return px; }
  function stWrap(c,txt,maxW){ var words = String(txt).split(/\s+/), lines = [], cur = ''; words.forEach(function(w){ var t = cur ? cur+' '+w : w; if(c.measureText(t).width>maxW && cur){ lines.push(cur); cur = w; } else cur = t; }); if(cur) lines.push(cur); return lines; }
  function stLogoDraw(c,cx,cy,r,col,alpha){
    c.save(); c.globalAlpha = alpha; var im = stLogo();
    c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.closePath();
    if(im){ c.save(); c.clip(); var s = Math.max(2*r/im.width,2*r/im.height); c.drawImage(im,cx-im.width*s/2,cy-im.height*s/2,im.width*s,im.height*s); c.restore(); }
    else { c.fillStyle = '#14110a'; c.fill(); c.fillStyle = col; c.font = '800 '+Math.round(r*1.15)+'px "Bricolage Grotesque",system-ui,sans-serif'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(stTitle().charAt(0).toUpperCase(),cx,cy+r*.04); }
    c.lineWidth = Math.max(2,r*.07); c.strokeStyle = col; c.beginPath(); c.arc(cx,cy,r,0,Math.PI*2); c.stroke(); c.restore();
  }
  /* full-screen scene used for the intro and the outro; t runs 0..1 */
  function stScene(c,W,H,t,kind,tpl,dur){
    var col = stAcc(), u = Math.min(W,H)/100, cx = W/2, cy = H/2, light = tpl==='clean';
    var inP = stEase(t/0.38), subP = stEase((t-.22)/.3), fade = t>.86 ? Math.max(0,1-(t-.86)/.14) : 1;
    var bg = light ? '#F7F4EC' : '#0B0A08', fg = light ? '#14110a' : '#ffffff';
    c.save(); c.fillStyle = bg; c.fillRect(0,0,W,H);
    if(tpl==='glow'){ var g = c.createRadialGradient(cx,cy,0,cx,cy,Math.max(W,H)*.62); g.addColorStop(0,stA(col,.5*(.6+.4*inP))); g.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = g; c.fillRect(0,0,W,H);
      c.globalAlpha = .18; for(var i=0;i<9;i++){ var a = i/9*Math.PI*2 + t*.6; c.fillStyle = col; c.beginPath(); c.moveTo(cx,cy); c.arc(cx,cy,Math.max(W,H),a,a+.09); c.closePath(); c.fill(); } c.globalAlpha = 1; }
    else if(tpl==='bars'){ c.fillStyle = col; var bw = stEase(t/.3)*W, y1 = kind==='in' ? H*.34 : H*.1, y2 = kind==='in' ? H*.66 : H*.92; c.fillRect(0,y1,bw,u*1.1); c.fillRect(W-bw,y2,bw,u*1.1); var g2 = c.createLinearGradient(0,0,0,H); g2.addColorStop(0,stA(col,.14)); g2.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = g2; c.fillRect(0,0,W,H); }
    else if(tpl==='spot'){ var sx = cx + Math.sin(t*3.2)*W*.18, g3 = c.createRadialGradient(sx,cy,0,sx,cy,Math.max(W,H)*.5); g3.addColorStop(0,'rgba(255,255,255,.34)'); g3.addColorStop(.35,stA(col,.18)); g3.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = g3; c.fillRect(0,0,W,H); }
    else if(tpl==='split'){ var sp = stEase(t/.35); c.fillStyle = col; c.fillRect(0,H/2-u*.6,W,u*1.2*sp); var g4 = c.createLinearGradient(0,0,W,H); g4.addColorStop(0,stA(col,.22)); g4.addColorStop(.5,'rgba(0,0,0,0)'); g4.addColorStop(1,stA(col,.22)); c.fillStyle = g4; c.fillRect(0,0,W,H); }
    else if(tpl==='pulse'){ for(var k=0;k<4;k++){ var pp = ((t*1.6 + k/4)%1); c.strokeStyle = stA(col,(1-pp)*.55); c.lineWidth = u*.7; c.beginPath(); c.arc(cx,cy-H*.06,pp*Math.max(W,H)*.6,0,Math.PI*2); c.stroke(); } }
    else { c.fillStyle = col; c.fillRect(0,0,W,u*2.2); c.fillRect(0,H-u*2.2,W,u*2.2); }
    c.globalAlpha = fade;
    var rLogo = Math.min(W,H)*(kind==='in'?.17:.12), ly = kind==='in' ? cy-H*.07 : cy-H*.2;
    c.save(); var sc = .6+.4*inP; c.translate(cx,ly); c.scale(sc,sc); c.translate(-cx,-ly); stLogoDraw(c,cx,ly,rLogo,col,inP); c.restore();
    c.textAlign = 'center'; c.textBaseline = 'alphabetic';
    var title = stTitle(), maxW = W*.86, px = stFit(c,title.toUpperCase(),maxW,Math.round(u*(kind==='in'?11:8.5)),Math.round(u*4));
    c.globalAlpha = fade*inP; c.fillStyle = fg; var ty = ly + rLogo + px*1.25 + (1-inP)*u*5; c.font = '800 '+px+'px "Bricolage Grotesque",system-ui,sans-serif'; c.fillText(title.toUpperCase(),cx,ty);
    var y = ty + px*.2; c.globalAlpha = fade*subP;
    var lines = [];
    if(kind==='in'){ if(ST.sub.trim()) lines.push([ST.sub.trim(),1]); }
    else { var g = G.gym, so = stSoc(); lines.push(['Visit us',0]); if(g.phone) lines.push([g.phone,1]); if(g.address) lines.push([g.address,2]);
      var hs = [stHandle(so.ig)&&'Instagram '+stHandle(so.ig), stHandle(so.fb)&&'Facebook '+stHandle(so.fb), stHandle(so.yt)&&'YouTube '+stHandle(so.yt)].filter(Boolean); hs.forEach(function(x){ lines.push([x,3]); }); }
    lines.forEach(function(ln){
      var sz = ln[1]===0 ? u*3.4 : ln[1]===1 ? u*5.4 : u*3.6; c.font = (ln[1]===1?'800 ':'600 ')+Math.round(sz)+'px "DM Sans",system-ui,sans-serif';
      c.fillStyle = ln[1]===0||ln[1]===1 ? col : fg; var ws = stWrap(c,ln[0],W*.84);
      ws.forEach(function(w){ y += sz*1.35; c.fillText(w,cx,y + (1-subP)*u*3); });
      y += sz*.15;
    });
    c.restore();
  }
  /* frame drawn on top of the video; tv = seconds into the video part */
  function stFrame(c,W,H,tv,fr){
    if(fr==='none') return;
    var col = stAcc(), u = Math.min(W,H)/100, title = stTitle(), g = G.gym; c.save(); c.textBaseline = 'alphabetic';
    if(fr==='border'){ c.strokeStyle = col; c.lineWidth = u*1.3; c.strokeRect(u*1.4,u*1.4,W-u*2.8,H-u*2.8); c.strokeStyle = 'rgba(255,255,255,.7)'; c.lineWidth = u*.25; c.strokeRect(u*3.2,u*3.2,W-u*6.4,H-u*6.4); }
    else if(fr==='bracket'){ var L = u*11, o = u*3; c.strokeStyle = col; c.lineWidth = u*1.1; c.lineCap = 'round'; c.lineJoin = 'round';
      [[o,o,1,1],[W-o,o,-1,1],[o,H-o,1,-1],[W-o,H-o,-1,-1]].forEach(function(p){ c.beginPath(); c.moveTo(p[0]+p[2]*L,p[1]); c.lineTo(p[0],p[1]); c.lineTo(p[0],p[1]+p[3]*L); c.stroke(); }); }
    else if(fr==='neon'){ c.shadowColor = col; c.shadowBlur = u*3.4; c.strokeStyle = '#fff'; c.lineWidth = u*.55; c.strokeRect(u*2.2,u*2.2,W-u*4.4,H-u*4.4); c.strokeStyle = col; c.lineWidth = u*.9; c.strokeRect(u*2.2,u*2.2,W-u*4.4,H-u*4.4); }
    else if(fr==='top'){ var bh = u*11, gr = c.createLinearGradient(0,0,0,bh*1.5); gr.addColorStop(0,'rgba(0,0,0,.78)'); gr.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = gr; c.fillRect(0,0,W,bh*1.5); c.textAlign = 'center'; var px = stFit(c,title.toUpperCase(),W*.78,Math.round(u*5),Math.round(u*2.6)); c.fillStyle = '#fff'; c.fillText(title.toUpperCase(),W/2,bh*.62); c.fillStyle = col; c.fillRect(W/2-u*8,bh*.78,u*16,u*.7); }
    else if(fr==='film'){ var sw = u*7; c.fillStyle = 'rgba(8,8,8,.82)'; c.fillRect(0,0,sw,H); c.fillRect(W-sw,0,sw,H); c.fillStyle = 'rgba(255,255,255,.85)'; var step = u*8, off = (tv*u*6)%step; for(var y = -step+off; y<H; y += step){ c.fillRect(sw*.28,y,sw*.44,u*4.2); c.fillRect(W-sw*.72,y,sw*.44,u*4.2); } c.fillStyle = col; c.fillRect(sw,0,u*.5,H); c.fillRect(W-sw-u*.5,0,u*.5,H); }
    else if(fr==='ribbon'){ c.translate(0,0); c.fillStyle = col; var rw = Math.min(W,H)*.5; c.beginPath(); c.moveTo(0,rw*.42); c.lineTo(rw*.42,0); c.lineTo(rw*.64,0); c.lineTo(0,rw*.64); c.closePath(); c.fill(); c.save(); c.translate(rw*.2,rw*.2); c.rotate(-Math.PI/4); c.fillStyle = '#111'; c.textAlign = 'center'; var rp = stFit(c,title.toUpperCase(),rw*.5,Math.round(u*3.4),Math.round(u*1.8)); c.fillText(title.toUpperCase(),0,rp*.3); c.restore(); }
    else if(fr==='mark'){ var r = u*4.6, mx = W-u*4-r, my = H-u*4-r; c.globalAlpha = .9; stLogoDraw(c,mx,my,r,col,1); c.textAlign = 'right'; c.font = '800 '+Math.round(u*3.2)+'px "Bricolage Grotesque",system-ui,sans-serif'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = u*1.4; c.fillText(title,mx-r-u*1.6,my+u*1.1); }
    else if(fr==='lower'){ var p = stEase(tv/.7), bh2 = u*13.5, bw2 = W*.9, bx = W*.05 - (1-p)*W, by = H - bh2 - u*(H>W?10:5), fo = tv>0 ? 1 : 1; c.globalAlpha = fo;
      c.fillStyle = 'rgba(8,8,8,.78)'; c.beginPath(); if(c.roundRect) c.roundRect(bx,by,bw2,bh2,bh2/2); else c.rect(bx,by,bw2,bh2); c.fill(); c.fillStyle = col; c.beginPath(); if(c.roundRect) c.roundRect(bx,by,u*1.2,bh2,u*.6); else c.rect(bx,by,u*1.2,bh2); c.fill();
      stLogoDraw(c,bx+bh2*.52+u*.8,by+bh2/2,bh2*.38,col,1); c.textAlign = 'left'; var tx = bx+bh2*1.08+u, maxT = bw2-(tx-bx)-u*3; var px2 = stFit(c,title,maxT,Math.round(u*4.8),Math.round(u*2.4)); c.fillStyle = '#fff'; c.fillText(title,tx,by+bh2*(g.phone?.47:.6));
      if(g.phone){ c.font = '600 '+Math.round(u*3.1)+'px "DM Sans",system-ui,sans-serif'; c.fillStyle = col; c.fillText(g.phone,tx,by+bh2*.8); } }
    c.restore();
  }
  /* draws a video frame into the canvas with the chosen fit */
  var stBg = null;
  function stVideoDraw(c,W,H,v,fit){
    var vw = v.videoWidth, vh = v.videoHeight; if(!vw || !vh) return;
    var sCover = Math.max(W/vw,H/vh), sFit = Math.min(W/vw,H/vh);
    if(fit==='crop' || Math.abs(sCover-sFit)<.002){ c.drawImage(v,(W-vw*sCover)/2,(H-vh*sCover)/2,vw*sCover,vh*sCover); return; }
    if(!stBg){ stBg = document.createElement('canvas'); }
    var bw = 48, bh = Math.max(8,Math.round(48*H/W)); if(stBg.width!==bw || stBg.height!==bh){ stBg.width = bw; stBg.height = bh; }
    var b = stBg.getContext('2d'), sc = Math.max(bw/vw,bh/vh); b.drawImage(v,(bw-vw*sc)/2,(bh-vh*sc)/2,vw*sc,vh*sc);
    c.save(); c.imageSmoothingEnabled = true; c.imageSmoothingQuality = 'high'; c.drawImage(stBg,0,0,W,H); c.fillStyle = 'rgba(0,0,0,.45)'; c.fillRect(0,0,W,H); c.restore();
    c.drawImage(v,(W-vw*sFit)/2,(H-vh*sFit)/2,vw*sFit,vh*sFit);
  }
  function stDims(){
    var vw = ST.vw || 1280, vh = ST.vh || 720, rw, rh;
    if(ST.ratio==='orig'){ rw = vw; rh = vh; } else { var p = ST.ratio.split(':'); rw = +p[0]; rh = +p[1]; }
    var L = ST.res==='hd' ? 1920 : ST.res==='sd' ? 1280 : Math.min(2560,Math.max(vw,vh));
    var k = L/Math.max(rw,rh), W = Math.round(rw*k/2)*2, H = Math.round(rh*k/2)*2;
    return {W:W,H:H};
  }
  function stMime(){
    var c = ['video/mp4;codecs=avc1.640028,mp4a.40.2','video/mp4;codecs=avc1,mp4a.40.2','video/webm;codecs=vp9,opus','video/webm;codecs=vp8,opus','video/webm'];
    if(typeof MediaRecorder==='undefined') return '';
    for(var i=0;i<c.length;i++){ try{ if(MediaRecorder.isTypeSupported(c[i])) return c[i]; }catch(e){} }
    return '';
  }
  function stFmtT(s){ s = Math.max(0,Math.round(s)); return Math.floor(s/60)+':'+(s%60<10?'0':'')+(s%60); }
  function stLoad(file){
    if(ST.url){ try{ URL.revokeObjectURL(ST.url); }catch(e){} }
    stClearOut(); ST.err = ''; ST.file = file; ST.url = URL.createObjectURL(file); ST.vw = ST.vh = ST.dur = 0; ST.trimS = 0; ST.trimE = 0; ST.pv = null;
    var v = document.createElement('video'); v.preload = 'metadata'; v.muted = true; v.playsInline = true;
    v.onloadedmetadata = function(){ ST.vw = v.videoWidth; ST.vh = v.videoHeight; ST.dur = isFinite(v.duration) ? v.duration : 0; if(gS.view==='dash' && gS.tab==='studio') gRender(); };
    v.onerror = function(){ ST.err = 'This browser cannot read that video. Try an MP4 (H.264) file.'; ST.file = null; if(gS.view==='dash' && gS.tab==='studio') gRender(); };
    v.src = ST.url; gRender();
  }
  function stClearOut(){ if(ST.outUrl){ try{ URL.revokeObjectURL(ST.outUrl); }catch(e){} } ST.out = null; ST.outUrl = ''; ST.outInfo = ''; }
  function stPvVideo(cb){
    if(!ST.url){ cb(null); return; }
    if(ST.pv && ST.pv.readyState>=2){ cb(ST.pv); return; }
    if(!ST.pv){ var v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = ST.url; ST.pv = v; v.addEventListener('loadeddata',function(){ try{ v.currentTime = Math.min(ST.dur||1,Math.max(.1,(ST.trimS||0)+.5)); }catch(e){} }); }
    cb(null);
  }
  /* live preview canvas in the studio */
  function stPreview(){
    cancelAnimationFrame(stRaf);
    var cv = $('st-prev'); if(!cv || ST.busy) return;
    var d = stDims(), maxW = 640, k = Math.min(1,maxW/Math.max(d.W,d.H)); cv.width = Math.round(d.W*k/2)*2; cv.height = Math.round(d.H*k/2)*2;
    var c = cv.getContext('2d'), t0 = performance.now();
    (function loop(now){
      if(!$('st-prev')) return;
      var W = cv.width, H = cv.height, el = (now-t0)/1000;
      if(ST.pm==='in'){ var dd = Math.max(1,ST.iDur); stScene(c,W,H,(el%(dd+.8))/dd > 1 ? 1 : (el%(dd+.8))/dd,'in',ST.iTpl,dd); }
      else if(ST.pm==='out'){ var d2 = Math.max(1,ST.oDur); stScene(c,W,H,(el%(d2+.8))/d2 > 1 ? 1 : (el%(d2+.8))/d2,'out',ST.oTpl,d2); }
      else { c.fillStyle = '#16140f'; c.fillRect(0,0,W,H); stPvVideo(function(v){ if(v){ stVideoDraw(c,W,H,v,ST.fit); } else { var gr = c.createLinearGradient(0,0,W,H); gr.addColorStop(0,'#2a2418'); gr.addColorStop(1,'#0f0d09'); c.fillStyle = gr; c.fillRect(0,0,W,H); c.fillStyle = 'rgba(255,255,255,.35)'; c.font = '600 '+Math.round(H*.05)+'px "DM Sans",system-ui,sans-serif'; c.textAlign = 'center'; c.fillText(ST.url?'Loading video…':'Your video appears here',W/2,H/2); } }); stFrame(c,W,H,el%6,ST.frame); }
      stRaf = requestAnimationFrame(loop);
    })(performance.now());
  }
  function stAfter(){ if(gS.view==='dash' && gS.tab==='studio') stPreview(); else cancelAnimationFrame(stRaf); }
  function stStudioHtml(){
    var g = G.gym, so = stSoc(), h = gSub('Social studio','more'), d = stDims(), mime = stMime();
    h += '<div class="gcard dark stc0"><h4>1. Your video</h4>';
    h += '<canvas id="st-prev" class="stprev" style="aspect-ratio:'+d.W+'/'+d.H+'" aria-label="Preview"></canvas>';
    h += '<div class="gchips stc" role="group" aria-label="Preview">'+[['in','Intro'],['vid','Video + frame'],['out','Outro']].map(function(o){ var on = ST.pm===o[0]; return '<button type="button" class="'+(on?'on':'')+'" aria-pressed="'+on+'" data-g="st-set" data-f="pm" data-v="'+o[0]+'">'+o[1]+'</button>'; }).join('')+'</div>';
    h += '<label class="gbtn gold wide stpick" for="st-file">'+(ST.file?'Choose another video':'Choose a video')+'</label><input type="file" id="st-file" accept="video/*" hidden>';
    if(ST.err) h += '<p class="gerr">'+esc(ST.err)+'</p>';
    if(ST.file) h += '<div class="gdr"><span>'+esc(ST.file.name.slice(0,28))+'</span><b>'+(ST.vw?ST.vw+'×'+ST.vh:'…')+(ST.dur?' · '+stFmtT(ST.dur):'')+'</b></div>';
    if(!mime && typeof MediaRecorder!=='undefined') h += '<div class="gwarn">This browser cannot record video. Use Chrome, Edge or Safari 14.1 or newer.</div>';
    if(typeof MediaRecorder==='undefined') h += '<div class="gwarn">This browser cannot record video. Use Chrome, Edge or Safari 14.1 or newer.</div>';
    h += '</div>';
    h += '<div class="gcard dark"><h4>2. Intro and outro</h4>'+gSw('st-tog-intro',ST.intro,'Intro','Logo and gym name before the video')+(ST.intro?stChips('iTpl',ST.iTpl,ST_IN)+'<label class="gl">Intro length</label>'+stSeg('iDur',ST.iDur,[[1,'1 s'],[2,'2 s'],[3,'3 s'],[4,'4 s'],[5,'5 s']]):'')+gSw('st-tog-outro',ST.outro,'Outro','Phone, address and social handles after the video')+(ST.outro?stChips('oTpl',ST.oTpl,ST_IN)+'<label class="gl">Outro length</label>'+stSeg('oDur',ST.oDur,[[2,'2 s'],[3,'3 s'],[4,'4 s'],[5,'5 s'],[6,'6 s']]):'');
    h += '<label class="gl" for="st-title">Title</label><input class="gin" id="st-title" maxlength="40" value="'+esc(ST.title===null?g.name:ST.title)+'" autocomplete="off"><label class="gl" for="st-sub">Tagline (optional)</label><input class="gin" id="st-sub" maxlength="60" value="'+esc(ST.sub)+'" placeholder="For example, Train hard. Stay strong." autocomplete="off"></div>';
    h += '<div class="gcard dark"><h4>3. Frame on the video</h4>'+stChips('frame',ST.frame,ST_FR)+'<p class="ghint">Uses your gym’s logo, name and the accent colour from Settings.</p></div>';
    h += '<div class="gcard dark"><h4>4. Size and timing</h4><label class="gl">Shape</label>'+stChips('ratio',ST.ratio,ST_RT)+(ST.ratio!=='orig'?'<label class="gl">If the video does not fill the shape</label>'+stSeg('fit',ST.fit,[['blur','Fit with blur'],['crop','Fill (crop)']]):'')+'<label class="gl">Quality</label>'+stSeg('res',ST.res,[['orig','Original'],['hd','1080p'],['sd','720p']]);
    h += '<div class="gtwo"><div><label class="gl" for="st-ts">Start at (seconds)</label><input class="gin" id="st-ts" type="number" min="0" step="0.1" inputmode="decimal" value="'+(ST.trimS||0)+'"></div><div><label class="gl" for="st-te">End at (0 = till the end)</label><input class="gin" id="st-te" type="number" min="0" step="0.1" inputmode="decimal" value="'+(ST.trimE||0)+'"></div></div></div>';
    h += '<div class="gcard dark"><h4>5. Background music</h4>'+stChips('mus',ST.mus,[['none','No music'],['energy','Energy'],['calm','Calm'],['hype','Hype'],['file','My own file']]);
    if(ST.mus==='file') h += '<label class="gbtn ghost wide stpick" for="st-mfile">'+(ST.musFile?'Change music file':'Choose a music file')+'</label><input type="file" id="st-mfile" accept="audio/*" hidden>'+(ST.musFile?'<div class="gdr"><span>'+esc(ST.musName.slice(0,28))+'</span><b>ready</b></div>':'');
    if(ST.mus!=='none'){ h += '<label class="gl" for="st-mv">Music volume: <b id="st-mvl">'+ST.musVol+'%</b></label><input type="range" id="st-mv" min="5" max="100" step="5" value="'+ST.musVol+'"><label class="gl" for="st-vv">Original video sound: <b id="st-vvl">'+ST.vidVol+'%</b></label><input type="range" id="st-vv" min="0" max="100" step="5" value="'+ST.vidVol+'"><button type="button" class="gbtn ghost wide" data-g="st-mprev">'+(ST.mp?'Stop sample':'Play 8-second sample')+'</button><p class="ghint">Energy, Calm and Hype are made inside the app, so there are no copyright claims on them. If you use your own file, make sure you have the right to use it, or Instagram may mute the video.</p>'; }
    h += '</div>';
    h += '<div class="gcard dark"><h4>6. Social handles</h4><p class="ghint">Shown in the outro.</p><label class="gl" for="st-ig">Instagram</label><input class="gin" id="st-ig" maxlength="40" value="'+esc(so.ig||'')+'" placeholder="@yourgym" autocomplete="off"><label class="gl" for="st-fb">Facebook</label><input class="gin" id="st-fb" maxlength="40" value="'+esc(so.fb||'')+'" placeholder="@yourgym" autocomplete="off"><label class="gl" for="st-yt">YouTube</label><input class="gin" id="st-yt" maxlength="40" value="'+esc(so.yt||'')+'" placeholder="@yourgym" autocomplete="off"></div>';
    if(ST.busy){
      h += '<div class="gcard dark"><h4>Making your video…</h4><div class="stbar"><i id="st-bar" style="width:'+Math.round(ST.prog*100)+'%"></i></div><p class="ghint" id="st-pct">'+Math.round(ST.prog*100)+'%. This takes about as long as the video itself. Keep this tab open and the screen on.</p><button type="button" class="gbtn ghost wide" data-g="st-cancel">Cancel</button></div>';
    } else {
      h += '<button type="button" class="gbtn gold wide" data-g="st-make"'+(ST.file&&ST.vw?'':' disabled')+'>Make my video</button><p class="gerr" id="st-err" role="alert"'+(ST.err?'':' hidden')+'>'+esc(ST.err)+'</p>';
    }
    if(ST.out && !ST.busy){
      h += '<div class="gcard dark stout"><h4>Your video is ready</h4><video class="stvid" src="'+ST.outUrl+'" controls playsinline></video><p class="ghint">'+esc(ST.outInfo)+'</p><button type="button" class="gbtn gold wide" data-g="st-dl">Download video</button><div class="gtwo">'+(typeof navigator.canShare==='function'?'<button type="button" class="gbtn ghost" data-g="st-share">Share to Instagram</button>':'')+'<a class="gbtn ghost" href="https://www.instagram.com/" target="_blank" rel="noopener">Open Instagram</a></div>'+(ST.outExt==='webm'?'<div class="gwarn">This browser saved a WebM file. Instagram may not accept WebM. If it refuses, open this page in Chrome 126+ or Safari to get an MP4, or convert the file first.</div>':'')+'<p class="ghint">A web page cannot post to Instagram by itself. On a phone, “Share to Instagram” opens the share sheet, where you pick Instagram (Reels or Story). On a computer, download the video and upload it on instagram.com.</p></div>';
    }
    h += stCoverHtml()+stCapHtml();
    return h;
  }
  function stSet(){ var s = stSoc(); ['ig','fb','yt'].forEach(function(k){ var e = $('st-'+k); if(e) s[k] = e.value.trim().slice(0,40); }); }
  function stUi(p,msg){ ST.prog = p; var b = $('st-bar'); if(b) b.style.width = Math.round(p*100)+'%'; var t = $('st-pct'); if(t) t.textContent = Math.round(p*100)+'%. '+(msg||'This takes about as long as the video itself. Keep this tab open and the screen on.'); }
  function stMake(){
    if(ST.busy || !ST.file || !ST.vw){ return; }
    if(typeof MediaRecorder==='undefined' || !stMime()){ ST.err = 'This browser cannot record video. Use Chrome, Edge or Safari 14.1 or newer.'; gRender(); return; }
    stSet(); gSave();
    var ts = Math.max(0,+ST.trimS||0), te = +ST.trimE>0 ? +ST.trimE : ST.dur;
    if(ST.dur && te>ST.dur) te = ST.dur;
    if(!(te-ts>=0.5)){ ST.err = 'The end time must be at least half a second after the start time.'; gRender(); return; }
    var dims = stDims(), W = dims.W, H = dims.H, fps = 30, mime = stMime(), iD = ST.intro ? ST.iDur : 0, oD = ST.outro ? ST.oDur : 0, vD = te-ts, total = iD+vD+oD;
    ST.busy = true; ST.cancel = false; ST.err = ''; stClearOut(); ST.prog = 0; cancelAnimationFrame(stRaf); gRender();
    var cv = document.createElement('canvas'); cv.width = W; cv.height = H; var c = cv.getContext('2d', {alpha:false});
    var v = document.createElement('video'); v.src = ST.url; v.playsInline = true; v.preload = 'auto'; v.style.cssText = 'position:fixed;left:-9999px;top:0;width:2px;height:2px;opacity:.01'; document.body.appendChild(v);
    var AC = window.AudioContext || window.webkitAudioContext, ac = null, dest = null, rec = null, chunks = [], done = false, raf = 0;
    function cleanup(){ cancelAnimationFrame(raf); try{ v.pause(); }catch(e){} v.remove(); try{ if(ac) ac.close(); }catch(e){} }
    function fail(m){ if(done) return; done = true; cleanup(); try{ if(rec && rec.state!=='inactive') rec.stop(); }catch(e){} ST.busy = false; ST.err = m; if(gS.view==='dash' && gS.tab==='studio') gRender(); }
    v.onerror = function(){ fail('The video could not be read while making the new one.'); };
    v.addEventListener('loadedmetadata',function(){
      var stream = cv.captureStream(fps);
      try{ if(AC){ ac = new AC(); if(ac.state==='suspended') ac.resume(); var src = ac.createMediaElementSource(v); dest = ac.createMediaStreamDestination(); var vg = ac.createGain(); vg.gain.value = ST.vidVol/100; src.connect(vg); vg.connect(dest); dest.stream.getAudioTracks().forEach(function(t){ stream.addTrack(t); }); } }catch(e){ dest = null; }
      var vbr = Math.max(4e6,Math.min(30e6,Math.round(W*H*fps*0.17)));
      try{ rec = new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:vbr,audioBitsPerSecond:192000}); }catch(e){ try{ rec = new MediaRecorder(stream,{mimeType:mime}); }catch(e2){ fail('Could not start recording in this browser.'); return; } }
      rec.ondataavailable = function(e){ if(e.data && e.data.size) chunks.push(e.data); };
      rec.onstop = function(){
        if(ST.cancel){ ST.busy = false; if(gS.view==='dash' && gS.tab==='studio') gRender(); return; }
        if(done && !chunks.length) return;
        done = true; var ext = /mp4/.test(mime) ? 'mp4' : 'webm', blob = new Blob(chunks,{type:mime.split(';')[0]});
        ST.out = blob; ST.outUrl = URL.createObjectURL(blob); ST.outExt = ext; ST.busy = false; ST.prog = 1;
        ST.outInfo = W+'×'+H+' · '+stFmtT(total)+' · '+(blob.size/1048576).toFixed(1)+' MB · '+ext.toUpperCase()+'. The video is re-encoded in your browser, so it is very close to the original but not a bit-for-bit copy.';
        if(gS.view==='dash' && gS.tab==='studio'){ gRender(); try{ var o = document.querySelector('.stout'); if(o) o.scrollIntoView({block:'center'}); }catch(e){} }
      };
      var mErr = ''; if(ST.mus!=='none' && !dest) mErr = 'This browser cannot mix audio, so background music is not possible here.';
      if(mErr){ fail(mErr); return; }
      stMusicStart(ac,dest,total,function(err){ if(err){ fail(err); return; } begin(); });
      function begin(){
      rec.start(500);
      var t0 = performance.now(), phase = iD>0 ? 'in' : 'vid', ph0 = t0, started = false, ending = false;
      function seekThen(tm,cb){ var on = function(){ v.removeEventListener('seeked',on); cb(); }; v.addEventListener('seeked',on); try{ v.currentTime = tm; }catch(e){ cb(); } }
      function startVideo(){ seekThen(ts,function(){ var p = v.play(); if(p && p.catch) p.catch(function(){ v.muted = true; v.play().catch(function(){ fail('The browser blocked playback. Tap “Make my video” again.'); }); }); started = true; ph0 = performance.now(); }); }
      function finish(){ if(ending) return; ending = true; setTimeout(function(){ try{ if(rec.state!=='inactive') rec.stop(); }catch(e){} cleanup(); },350); }
      if(phase==='vid') startVideo();
      (function frame(now){
        if(done) return;
        if(ST.cancel || gS.view!=='dash' || gS.tab!=='studio'){ ST.cancel = true; done = true; cleanup(); try{ rec.stop(); }catch(e){} ST.busy = false; return; }
        var el = (now-ph0)/1000;
        if(phase==='in'){ stScene(c,W,H,Math.min(1,el/iD),'in',ST.iTpl,iD); if(el>=iD){ phase = 'vid'; startVideo(); } stUi(Math.min(.99,el/total)); }
        else if(phase==='vid'){
          c.fillStyle = '#000'; c.fillRect(0,0,W,H);
          if(started){ stVideoDraw(c,W,H,v,ST.fit); var tv = Math.max(0,v.currentTime-ts); stFrame(c,W,H,tv,ST.frame);
            stUi(Math.min(.99,(iD+tv)/total));
            if(v.ended || v.currentTime>=te-0.03){ v.pause(); if(oD>0){ phase = 'out'; ph0 = performance.now(); } else { finish(); return; } } }
        } else if(phase==='out'){ stScene(c,W,H,Math.min(1,el/oD),'out',ST.oTpl,oD); stUi(Math.min(.99,(iD+vD+el)/total)); if(el>=oD){ finish(); return; } }
        raf = requestAnimationFrame(frame);
      })(performance.now());
      }
    },{once:true});
  }
  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b) return; var a = b.getAttribute('data-g'); if(a.indexOf('st-')!==0) return;
    if(a==='st-set'){ var f = b.getAttribute('data-f'), v = b.getAttribute('data-v'); if(['iDur','oDur'].indexOf(f)>=0) v = parseInt(v,10); if(f.indexOf('cap.')===0){ ST.cap[f.slice(4)] = v; ST.cap.v = 0; stCapGen(false); } else { ST[f] = v; if(f==='mus') stMStop(); } gRender(); return; }
    if(a==='st-tog-intro'){ ST.intro = !ST.intro; gRender(); return; }
    if(a==='st-tog-outro'){ ST.outro = !ST.outro; gRender(); return; }
    if(a==='st-make'){ stMake(); return; }
    if(a==='st-cancel'){ ST.cancel = true; return; }
    if(a==='st-dl'){ if(!ST.out) return; var nm = stTitle().replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)||'gym'; gSaveFile(ST.out,nm+'-reel.'+ST.outExt,function(){}); return; }
    if(a==='st-share'){ if(!ST.out) return; var file = new File([ST.out],stTitle().replace(/[^A-Za-z0-9]+/g,'-').slice(0,30)+'-reel.'+ST.outExt,{type:ST.out.type}); try{ if(navigator.canShare && navigator.canShare({files:[file]})) navigator.share({files:[file],title:stTitle()}).catch(function(){}); else toast('Sharing files is not supported here. Download the video and upload it.'); }catch(e){ toast('Sharing is not supported here. Download the video and upload it.'); } return; }
  });
  $('gymroot').addEventListener('input',function(ev){
    var id = ev.target.id;
    if(id==='st-title'){ ST.title = ev.target.value; }
    else if(id==='st-sub'){ ST.sub = ev.target.value; }
    else if(id==='st-ts'){ ST.trimS = Math.max(0,parseFloat(ev.target.value)||0); }
    else if(id==='st-te'){ ST.trimE = Math.max(0,parseFloat(ev.target.value)||0); }
    else if(/^st-(ig|fb|yt)$/.test(id)){ stSet(); }
  });
  $('gymroot').addEventListener('change',function(ev){
    if(ev.target.id==='st-file'){ var f = ev.target.files && ev.target.files[0]; if(f){ if(!/^video\//.test(f.type) && !/\.(mp4|mov|m4v|webm|mkv)$/i.test(f.name)){ ST.err = 'Please choose a video file.'; gRender(); return; } stLoad(f); } }
    else if(/^st-(ig|fb|yt)$/.test(ev.target.id)){ stSet(); gSave(); }
  });

  /* ---------- background music ---------- */
  var stNoise = null;
  function stNoiseBuf(ac){ if(stNoise && stNoise.sampleRate===ac.sampleRate) return stNoise; var n = ac.sampleRate, b = ac.createBuffer(1,n,ac.sampleRate), d = b.getChannelData(0); for(var i=0;i<n;i++) d[i] = Math.random()*2-1; stNoise = b; return b; }
  function stSynth(ac,out,style,t0,dur,vol){
    var cfg = {energy:{bpm:124,root:55,prog:[0,0,3,-2],hat:2,clap:1,lead:0},calm:{bpm:78,root:65.41,prog:[0,-4,-2,-5],hat:0,clap:0,lead:0,pad:1},hype:{bpm:142,root:49,prog:[0,0,5,3],hat:4,clap:1,lead:1}}[style] || null;
    if(!cfg) return; var beat = 60/cfg.bpm, mg = ac.createGain(); mg.connect(out);
    mg.gain.setValueAtTime(0,t0); mg.gain.linearRampToValueAtTime(vol,t0+.4); mg.gain.setValueAtTime(vol,Math.max(t0+.5,t0+dur-1.6)); mg.gain.linearRampToValueAtTime(0,t0+dur);
    var nb = Math.floor(dur/beat), i, t, env, o, g, f;
    function tone(type,fr,st,len,gv,fc){ var os = ac.createOscillator(), gg = ac.createGain(); os.type = type; os.frequency.setValueAtTime(fr,st); gg.gain.setValueAtTime(0,st); gg.gain.linearRampToValueAtTime(gv,st+.012); gg.gain.exponentialRampToValueAtTime(.0008,st+len); var nd = os; if(fc){ var lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = fc; os.connect(lp); nd = lp; } nd.connect(gg); gg.connect(mg); os.start(st); os.stop(st+len+.05); }
    function noise(st,len,gv,type,fq){ var sr = ac.createBufferSource(); sr.buffer = stNoiseBuf(ac); var fl = ac.createBiquadFilter(); fl.type = type; fl.frequency.value = fq; var gg = ac.createGain(); gg.gain.setValueAtTime(gv,st); gg.gain.exponentialRampToValueAtTime(.0008,st+len); sr.connect(fl); fl.connect(gg); gg.connect(mg); sr.start(st,Math.random()*.5); sr.stop(st+len+.02); }
    for(i=0;i<nb;i++){
      t = t0+i*beat; var bar = Math.floor(i/4), semi = cfg.prog[bar%cfg.prog.length], bf = cfg.root*Math.pow(2,semi/12);
      if(!cfg.pad){
        var kk = ac.createOscillator(), kg = ac.createGain(); kk.frequency.setValueAtTime(160,t); kk.frequency.exponentialRampToValueAtTime(42,t+.14); kg.gain.setValueAtTime(.9,t); kg.gain.exponentialRampToValueAtTime(.001,t+.22); kk.connect(kg); kg.connect(mg); kk.start(t); kk.stop(t+.25);
        if(cfg.clap && i%2===1) noise(t,.16,.38,'bandpass',1700);
        for(var h=0;h<cfg.hat;h++) noise(t+beat*h/cfg.hat+(cfg.hat===2?beat*.25:0),.05,.09,'highpass',7500);
        tone('sawtooth',bf,t+beat*.5,beat*.42,.2,420);
        if(cfg.lead && i%2===0){ var ar = [12,15,19,15][(i/2|0)%4]; tone('square',bf*Math.pow(2,(ar+12)/12),t,beat*.4,.05,2600); }
      } else {
        if(i%4===0){ [0,3,7].forEach(function(sm){ var os = ac.createOscillator(), gg = ac.createGain(); os.type = 'triangle'; os.frequency.value = bf*2*Math.pow(2,sm/12); gg.gain.setValueAtTime(0,t); gg.gain.linearRampToValueAtTime(.14,t+beat*1.6); gg.gain.linearRampToValueAtTime(0,t+beat*4.2); os.connect(gg); gg.connect(mg); os.start(t); os.stop(t+beat*4.3); }); }
        if(i%2===0) tone('sine',bf*4*Math.pow(2,[0,7,12,7][(i/2|0)%4]/12),t,beat*1.4,.07);
        noise(t+beat*.5,.05,.04,'highpass',9000);
        tone('sine',bf,t,beat*.9,.3);
      }
    }
  }
  function stMusicStart(ac,dest,total,cb){
    if(ST.mus==='none'){ cb(''); return; }
    var t0 = ac.currentTime+.1, vol = ST.musVol/100*.7;
    if(ST.mus==='file'){
      if(!ST.musFile){ cb('Choose a music file first, or pick another music option.'); return; }
      ST.musFile.arrayBuffer().then(function(ab){ return new Promise(function(ok,no){ ac.decodeAudioData(ab,ok,no); }); }).then(function(buf){
        var sr = ac.createBufferSource(); sr.buffer = buf; sr.loop = true; var g = ac.createGain(); sr.connect(g); g.connect(dest);
        g.gain.setValueAtTime(0,t0); g.gain.linearRampToValueAtTime(vol,t0+.4); g.gain.setValueAtTime(vol,Math.max(t0+.5,t0+total-1.6)); g.gain.linearRampToValueAtTime(0,t0+total);
        sr.start(t0); sr.stop(t0+total+.2); cb('');
      },function(){ cb('That music file could not be read. Try an MP3 or M4A file.'); });
      return;
    }
    stSynth(ac,dest,ST.mus,t0,total+.3,vol); cb('');
  }
  function stMStop(){ var m = ST.mp; ST.mp = null; if(!m) return; try{ if(m.a){ m.a.pause(); URL.revokeObjectURL(m.u); } if(m.c) m.c.close(); }catch(e){} clearTimeout(m.tm); }
  function stMPrev(){
    if(ST.mp){ stMStop(); gRender(); return; }
    if(ST.mus==='file'){ if(!ST.musFile){ toast('Choose a music file first.'); return; } var u = URL.createObjectURL(ST.musFile), a = new Audio(u); a.volume = ST.musVol/100; a.play().catch(function(){ toast('Could not play the file.'); }); ST.mp = {a:a,u:u,tm:setTimeout(function(){ stMStop(); if(gS.tab==='studio') gRender(); },8000)}; }
    else { var AC = window.AudioContext || window.webkitAudioContext; if(!AC){ toast('Sound is not supported in this browser.'); return; } var ac = new AC(); stSynth(ac,ac.destination,ST.mus,ac.currentTime+.05,8,ST.musVol/100*.7); ST.mp = {c:ac,tm:setTimeout(function(){ stMStop(); if(gS.tab==='studio') gRender(); },8200)}; }
    gRender();
  }

  /* ---------- cover image ---------- */
  function stCoverHtml(){
    var cv = ST.cov, h = '<div class="gcard dark"><h4>Cover image (thumbnail)</h4><p class="ghint">Pick a moment from your video and add a title. Uses the same shape, frame and logo as above.</p>';
    h += '<div class="gtwo"><div><label class="gl" for="st-cts">Moment (seconds)</label><input class="gin" id="st-cts" type="number" min="0" step="0.1" inputmode="decimal" value="'+cv.t+'"></div><div><label class="gl" for="st-ct">Cover title</label><input class="gin" id="st-ct" maxlength="50" value="'+esc(cv.txt===null?stTitle():cv.txt)+'" autocomplete="off"></div></div>';
    h += '<button type="button" class="gbtn gold wide" data-g="st-cov-make"'+(ST.file&&ST.vw&&!cv.busy?'':' disabled')+'>'+(cv.busy?'Making…':'Make cover image')+'</button>';
    if(!ST.file) h += '<p class="ghint">Choose a video first (step 1).</p>';
    if(cv.err) h += '<p class="gerr">'+esc(cv.err)+'</p>';
    if(cv.out) h += '<img loading="lazy" decoding="async" class="stcov" src="'+cv.url+'" alt="Cover image preview"><div class="gtwo"><button type="button" class="gbtn gold" data-g="st-cov-dl">Download image</button>'+(typeof navigator.canShare==='function'?'<button type="button" class="gbtn ghost" data-g="st-cov-share">Share</button>':'<span></span>')+'</div>';
    return h+'</div>';
  }
  function stCoverMake(){
    var cv = ST.cov; if(!ST.file || !ST.vw || cv.busy) return; cv.busy = true; cv.err = ''; gRender();
    var d = stDims(), k = Math.min(1,1920/Math.max(d.W,d.H)), W = Math.round(d.W*k/2)*2, H = Math.round(d.H*k/2)*2;
    var v = document.createElement('video'); v.muted = true; v.playsInline = true; v.preload = 'auto'; v.src = ST.url; v.style.cssText = 'position:fixed;left:-9999px;width:2px;height:2px;opacity:.01'; document.body.appendChild(v);
    function fail(m){ v.remove(); cv.busy = false; cv.err = m; gRender(); }
    v.onerror = function(){ fail('The video could not be read.'); };
    v.addEventListener('loadedmetadata',function(){
      var tt = Math.max(0,Math.min((+cv.t||0),Math.max(0,(v.duration||1)-.1)));
      v.addEventListener('seeked',function(){
        try{
          var cvs = document.createElement('canvas'); cvs.width = W; cvs.height = H; var c = cvs.getContext('2d'); c.fillStyle = '#000'; c.fillRect(0,0,W,H); stVideoDraw(c,W,H,v,ST.fit);
          var u = Math.min(W,H)/100, col = stAcc(), g = c.createLinearGradient(0,H*.45,0,H); g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,.88)'); c.fillStyle = g; c.fillRect(0,H*.45,W,H*.55);
          var g2 = c.createLinearGradient(0,0,0,H*.2); g2.addColorStop(0,'rgba(0,0,0,.6)'); g2.addColorStop(1,'rgba(0,0,0,0)'); c.fillStyle = g2; c.fillRect(0,0,W,H*.2);
          stLogoDraw(c,u*9,u*9,u*5.2,col,1); c.textAlign = 'left'; c.textBaseline = 'alphabetic'; c.font = '800 '+Math.round(u*3.4)+'px "Bricolage Grotesque",system-ui,sans-serif'; c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.7)'; c.shadowBlur = u; c.fillText(stTitle(),u*16,u*10.1); c.shadowBlur = 0;
          var txt = (cv.txt===null ? stTitle() : cv.txt).trim() || stTitle(); c.textAlign = 'center'; var fs = u*(H>W?10:8.5); c.font = '800 '+Math.round(fs)+'px "Bricolage Grotesque",system-ui,sans-serif'; var lines = stWrap(c,txt.toUpperCase(),W*.86).slice(0,4);
          while(lines.length*fs*1.1>H*.3 && fs>u*4){ fs -= u*.6; c.font = '800 '+Math.round(fs)+'px "Bricolage Grotesque",system-ui,sans-serif'; lines = stWrap(c,txt.toUpperCase(),W*.86).slice(0,4); }
          var y = H - u*(H>W?14:9) - (lines.length-1)*fs*1.1; c.fillStyle = col; c.fillRect(W/2-u*9,y-fs-u*1.8,u*18,u*.8); c.fillStyle = '#fff'; c.shadowColor = 'rgba(0,0,0,.6)'; c.shadowBlur = u*1.2; lines.forEach(function(l,i){ c.fillText(l,W/2,y+i*fs*1.1); }); c.shadowBlur = 0;
          stFrame(c,W,H,2,ST.frame==='lower'?'none':ST.frame);
          cvs.toBlob(function(bl){ v.remove(); cv.busy = false; if(!bl){ cv.err = 'Could not make the image.'; } else { if(cv.url) URL.revokeObjectURL(cv.url); cv.out = bl; cv.url = URL.createObjectURL(bl); } gRender(); },'image/png');
        }catch(e){ fail('Could not make the image.'); }
      },{once:true});
      try{ v.currentTime = tt; }catch(e){ fail('Could not read that moment of the video.'); }
    },{once:true});
  }

  /* ---------- caption and hashtags ---------- */
  var ST_PUR = [['offer','Offer'],['join','Join now'],['transform','Transformation'],['tip','Workout tip'],['motivation','Motivation'],['festival','Festival wish']];
  function stCity(){ var a = String(G.gym.address||'').split(/[,\n]/).map(function(x){ return x.replace(/\d{4,}/g,'').trim(); }).filter(function(x){ return x && !/^\d+$/.test(x); }); var c = a.length ? a[a.length-1] : ''; return /^(india|maharashtra|gujarat|delhi ncr)$/i.test(c) && a.length>1 ? a[a.length-2] : c; }
  function stCapCtx(){ var g = G.gym, so = stSoc(), e = ST.cap.emo; return {n:g.name,ph:g.phone||'',city:stCity(),d:(ST.cap.detail||'').trim(),ig:stHandle(so.ig),E:function(x){ return e ? x : ''; }}; }
  function stFoot(c){ var l = []; if(c.ph) l.push(c.E('📞 ')+'Call or WhatsApp: '+c.ph); if(c.city) l.push(c.E('📍 ')+c.n+', '+c.city); if(c.ig) l.push(c.E('📸 ')+'Follow '+c.ig); return l.join('\n'); }
  var CAPS = {
    offer:{en:[
      function(c){ return c.E('🔥 ')+'Special offer at '+c.n+'!\n'+(c.d||'A limited-time membership offer is on.')+'\nJoin today and start your fitness journey '+c.E('💪')+'\n\n'+stFoot(c); },
      function(c){ return c.E('⚡ ')+'Offer alert!\n'+(c.d||'New membership offer is live.')+' Your goals deserve a strong start.\nBook your spot at '+c.n+' before it ends.\n\n'+stFoot(c); },
      function(c){ return 'No more "I will start Monday" '+c.E('😉')+'\n'+(c.d||'Special offer for new members.')+'\nCome train at '+c.n+'.\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('🔥 ')+c.n+' mein dhamaka offer!\n'+(c.d||'Limited time membership offer chal raha hai.')+'\nAaj hi join karo aur apni fitness journey shuru karo '+c.E('💪')+'\n\n'+stFoot(c); },
      function(c){ return c.E('⚡ ')+'Offer alert!\n'+(c.d||'Naya membership offer live hai.')+' Fit hone ka sahi time yahi hai.\nOffer khatam hone se pehle apni jagah pakki karo.\n\n'+stFoot(c); },
      function(c){ return '"Kal se shuru karunga" ab nahi chalega '+c.E('😉')+'\n'+(c.d||'Naye members ke liye special offer.')+'\nAao '+c.n+' mein aur apna best version banao.\n\n'+stFoot(c); }]},
    join:{en:[
      function(c){ return c.E('💥 ')+'Admissions open at '+c.n+'!\nStrength, cardio and guidance from trainers who care.'+(c.d?'\n'+c.d:'')+'\nVisit us for a free tour '+c.E('🏋️')+'\n\n'+stFoot(c); },
      function(c){ return 'Ready to change your routine? '+c.E('🙌')+'\nJoin the '+c.n+' family and train with people who push you.'+(c.d?'\n'+c.d:'')+'\n\n'+stFoot(c); },
      function(c){ return 'New batch starting soon '+c.E('📅')+'\n'+(c.d||'Limited seats.')+' Message us to reserve yours at '+c.n+'.\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('💥 ')+c.n+' mein admission shuru!\nStrength, cardio aur trainers ki puri guidance ek hi jagah.'+(c.d?'\n'+c.d:'')+'\nFree tour ke liye aaj hi aao '+c.E('🏋️')+'\n\n'+stFoot(c); },
      function(c){ return 'Routine badalne ka mann hai? '+c.E('🙌')+'\n'+c.n+' family ka hissa bano aur aise logon ke saath train karo jo tumhe push karein.'+(c.d?'\n'+c.d:'')+'\n\n'+stFoot(c); },
      function(c){ return 'Naya batch jaldi shuru hone wala hai '+c.E('📅')+'\n'+(c.d||'Seats limited hain.')+' '+c.n+' mein apni seat book karne ke liye message karo.\n\n'+stFoot(c); }]},
    transform:{en:[
      function(c){ return c.E('📸 ')+'Transformation Tuesday at '+c.n+'!\n'+(c.d||'Consistency, hard work and the right plan.')+'\nEvery rep counts. Your turn next '+c.E('💪')+'\n\n'+stFoot(c); },
      function(c){ return 'Before and after, with one thing in common: showing up every day '+c.E('🔥')+'\n'+(c.d?c.d+'\n':'')+'Proud of our member. Start your story at '+c.n+'.\n\n'+stFoot(c); },
      function(c){ return 'Results do not come overnight, but they do come '+c.E('✨')+'\n'+(c.d||'Another member hits the goal.')+'\nTrain with us at '+c.n+'.\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('📸 ')+c.n+' ki transformation story!\n'+(c.d||'Consistency, mehnat aur sahi plan.')+'\nHar rep count karta hai. Ab tumhari baari '+c.E('💪')+'\n\n'+stFoot(c); },
      function(c){ return 'Before aur after, aur beech mein ek hi cheez: roz gym aana '+c.E('🔥')+'\n'+(c.d?c.d+'\n':'')+'Hamare member par bahut garv hai. Apni story '+c.n+' se shuru karo.\n\n'+stFoot(c); },
      function(c){ return 'Result raaton-raat nahi aate, par aate zaroor hain '+c.E('✨')+'\n'+(c.d||'Ek aur member ne apna goal hasil kiya.')+'\n'+c.n+' mein aao aur apna goal pakdo.\n\n'+stFoot(c); }]},
    tip:{en:[
      function(c){ return c.E('💡 ')+'Quick tip from '+c.n+':\n'+(c.d||'Warm up for 5 minutes before you lift. It protects your joints and improves your workout.')+'\n\nSave this for your next session '+c.E('📌')+'\n\n'+stFoot(c); },
      function(c){ return 'Train smarter, not just harder '+c.E('🧠')+'\n'+(c.d||'Focus on form first. Weight can come later.')+'\nNeed a plan? Our trainers at '+c.n+' will help.\n\n'+stFoot(c); },
      function(c){ return c.E('✅ ')+'Gym tip of the day:\n'+(c.d||'Drink water, sleep 7 to 8 hours and stay consistent.')+'\nShare this with your gym partner '+c.E('🤝')+'\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('💡 ')+c.n+' ka quick tip:\n'+(c.d||'Weight uthane se pehle 5 minute warm-up zaroor karo. Isse joints safe rehte hain aur workout behtar hota hai.')+'\n\nAgle session ke liye save kar lo '+c.E('📌')+'\n\n'+stFoot(c); },
      function(c){ return 'Zyada mehnat nahi, smart mehnat karo '+c.E('🧠')+'\n'+(c.d||'Pehle form theek karo, weight baad mein badhao.')+'\nPlan chahiye? '+c.n+' ke trainers madad karenge.\n\n'+stFoot(c); },
      function(c){ return c.E('✅ ')+'Aaj ka gym tip:\n'+(c.d||'Paani piyo, 7 se 8 ghante soyo aur regular raho.')+'\nApne gym partner ko share karo '+c.E('🤝')+'\n\n'+stFoot(c); }]},
    motivation:{en:[
      function(c){ return c.E('💪 ')+(c.d||'The only bad workout is the one that did not happen.')+'\n\nSee you at '+c.n+'.\n\n'+stFoot(c); },
      function(c){ return (c.d||'Discipline beats motivation.')+' '+c.E('🔥')+'\nShow up today, even when you do not feel like it.\n\n'+stFoot(c); },
      function(c){ return c.E('🏆 ')+(c.d||'Small steps every day become big results.')+'\nStart yours at '+c.n+'.\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('💪 ')+(c.d||'Sabse bura workout wo hai jo hua hi nahi.')+'\n\nMilte hain '+c.n+' mein.\n\n'+stFoot(c); },
      function(c){ return (c.d||'Discipline motivation se bada hota hai.')+' '+c.E('🔥')+'\nAaj aao, bhale mann na ho.\n\n'+stFoot(c); },
      function(c){ return c.E('🏆 ')+(c.d||'Roz ke chhote kadam bade result banate hain.')+'\nApni shuruaat '+c.n+' se karo.\n\n'+stFoot(c); }]},
    festival:{en:[
      function(c){ return c.E('🎉 ')+'Warm wishes from all of us at '+c.n+'!\n'+(c.d||'May this festival bring you health, strength and happiness.')+'\nEnjoy the sweets, and we will see you at the gym '+c.E('😄')+'\n\n'+stFoot(c); },
      function(c){ return (c.d||'Happy festival to you and your family!')+' '+c.E('✨')+'\nStay fit, stay happy. Team '+c.n+'.\n\n'+stFoot(c); },
      function(c){ return c.E('🪔 ')+(c.d||'Wishing you a healthy and joyful festival.')+'\nFrom the '+c.n+' family.\n\n'+stFoot(c); }],
      hi:[
      function(c){ return c.E('🎉 ')+c.n+' ki taraf se aap sabko dher saari shubhkamnayein!\n'+(c.d||'Ye tyohaar aapke liye sehat, shakti aur khushiyan laye.')+'\nMithai khao, aur phir gym mein milte hain '+c.E('😄')+'\n\n'+stFoot(c); },
      function(c){ return (c.d||'Aapko aur aapke parivar ko tyohaar ki hardik badhai!')+' '+c.E('✨')+'\nFit raho, khush raho. Team '+c.n+'.\n\n'+stFoot(c); },
      function(c){ return c.E('🪔 ')+(c.d||'Aapka tyohaar sehatmand aur khushiyon bhara ho.')+'\n'+c.n+' family ki taraf se.\n\n'+stFoot(c); }]}
  };
  var CAPTAGS = {offer:['gymoffer','membershipoffer','fitnessoffer','joinnow'],join:['gymadmission','joinourgym','newbatch','fitnessclub'],transform:['transformation','beforeandafter','fitnesstransformation','weightloss'],tip:['fitnesstips','gymtips','workouttips','trainsmart'],motivation:['fitnessmotivation','motivation','nevergiveup','discipline'],festival:['festivewishes','happyfestival','festival','wishes']};
  function stTags(c){
    var slug = function(x){ return String(x||'').toLowerCase().replace(/[^a-z0-9]+/g,''); }, t = [slug(c.n)], city = slug(c.city);
    if(city){ t.push(city+'gym'); t.push(city+'fitness'); }
    t = t.concat(CAPTAGS[ST.cap.purpose]||[]).concat(['gym','fitness','workout','fitnessjourney','gymlife','fitindia','personaltrainer','healthylifestyle']);
    var seen = {}; return t.filter(function(x){ if(!x || seen[x]) return false; seen[x] = 1; return true; }).slice(0,15).map(function(x){ return '#'+x; }).join(' ');
  }
  function stCapGen(next){
    var cp = ST.cap, list = (CAPS[cp.purpose]||CAPS.offer)[cp.lang==='en'?'en':'hi']; if(next) cp.v = (cp.v+1)%list.length;
    var c = stCapCtx(); cp.text = list[cp.v%list.length](c)+'\n\n'+stTags(c);
  }
  function stCapHtml(){
    var cp = ST.cap; if(!cp.text) stCapGen(false);
    var h = '<div class="gcard dark"><h4>Caption and hashtags</h4><p class="ghint">Ready-made captions using your gym’s name, city, phone and Instagram handle. Edit freely.</p><label class="gl">What is it about?</label>'+stChips('cap.purpose',cp.purpose,ST_PUR)+'<label class="gl">Language</label>'+stSeg('cap.lang',cp.lang,[['hi','Hinglish'],['en','English']]);
    h += gSw('st-cap-emo',cp.emo,'Emojis','')+'<label class="gl" for="st-cd">Offer or detail (optional)</label><input class="gin" id="st-cd" maxlength="120" value="'+esc(cp.detail)+'" placeholder="For example, 20% off till 31 Oct" autocomplete="off">';
    h += '<label class="gl" for="st-cap">Your caption</label><textarea class="gin" id="st-cap" rows="9">'+esc(cp.text)+'</textarea><div class="gtwo"><button type="button" class="gbtn ghost" data-g="st-cap-gen">Another version</button><button type="button" class="gbtn gold" data-g="st-cap-copy">Copy caption</button></div>';
    return h+'</div>';
  }
  $('gymroot').addEventListener('click',function(ev){
    var b = ev.target.closest('[data-g]'); if(!b) return; var a = b.getAttribute('data-g');
    if(a==='st-mprev'){ stMPrev(); return; }
    if(a==='st-cov-make'){ stCoverMake(); return; }
    if(a==='st-cov-dl'){ if(ST.cov.out) gSaveFile(ST.cov.out,stTitle().replace(/[^A-Za-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,30)+'-cover.png',function(){}); return; }
    if(a==='st-cov-share'){ if(!ST.cov.out) return; try{ var f = new File([ST.cov.out],'cover.png',{type:'image/png'}); if(navigator.canShare && navigator.canShare({files:[f]})) navigator.share({files:[f],title:stTitle()}).catch(function(){}); else toast('Sharing is not supported here. Download the image instead.'); }catch(e){ toast('Sharing is not supported here.'); } return; }
    if(a==='st-cap-emo'){ ST.cap.emo = !ST.cap.emo; stCapGen(false); gRender(); return; }
    if(a==='st-cap-gen'){ stCapGen(true); gRender(); return; }
    if(a==='st-cap-copy'){ var t = $('st-cap'); if(t) kCopyText(t.value); return; }
  });
  function kCopyText(text){ var done = function(){ toast('Caption copied.'); }; if(navigator.clipboard && navigator.clipboard.writeText){ navigator.clipboard.writeText(text).then(done,function(){ stCopyOld(text,done); }); } else stCopyOld(text,done); }
  function stCopyOld(text,done){ var t = document.createElement('textarea'); t.value = text; t.style.cssText = 'position:fixed;left:-9999px;top:0'; document.body.appendChild(t); t.select(); try{ document.execCommand('copy'); done(); }catch(e){ toast('Could not copy. Select the text and copy it.'); } t.remove(); }
  $('gymroot').addEventListener('input',function(ev){
    var id = ev.target.id;
    if(id==='st-mv'){ ST.musVol = +ev.target.value; var l = $('st-mvl'); if(l) l.textContent = ST.musVol+'%'; }
    else if(id==='st-vv'){ ST.vidVol = +ev.target.value; var l2 = $('st-vvl'); if(l2) l2.textContent = ST.vidVol+'%'; }
    else if(id==='st-cts'){ ST.cov.t = Math.max(0,parseFloat(ev.target.value)||0); }
    else if(id==='st-ct'){ ST.cov.txt = ev.target.value; }
    else if(id==='st-cd'){ ST.cap.detail = ev.target.value; }
    else if(id==='st-cap'){ ST.cap.text = ev.target.value; }
  });
  $('gymroot').addEventListener('change',function(ev){
    if(ev.target.id==='st-mfile'){ var f = ev.target.files && ev.target.files[0]; if(f){ ST.musFile = f; ST.musName = f.name; stMStop(); gRender(); } }
    else if(ev.target.id==='st-cd'){ stCapGen(false); gRender(); }
  });

