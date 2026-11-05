  /* ==== KDN FOOD LOG START ==== type, say or snap what you ate; weekly grocery list */
  function kApi(p){ return (NATIVE ? 'https://kdnfitness.com' : '')+p; }
  /* ---- food index: everyday foods, the dish library and a few common extras ---- */
  function fdExtra(){ return [
    ['Mixed veg sabzi','1 katori',120,3],['Rajma','1 katori',210,9],['Chole','1 katori',240,10],['Khichdi','1 bowl',280,10],['Plain paratha','1',200,5],['Aloo paratha','1',290,6],
    ['Bread','1 slice',75,2.5],['Butter','1 tsp',36,0],['Ghee','1 tsp',45,0],['Sugar','1 tsp',16,0],['Green salad','1 bowl',50,2],['Oats porridge','1 bowl',220,8],
    ['Upma','1 plate',250,6],['Poha','1 plate',270,6],['Idli','1',60,2],['Plain dosa','1',170,4],['Masala dosa','1',350,7],['Sambar','1 katori',130,6],
    ['Grilled chicken','100 g',165,31],['Fish curry','1 katori',230,20],['Egg bhurji (2 eggs)','1 plate',220,13],['Paneer','100 g',265,18],['Soya chunks','1 katori',170,17],
    ['Whey protein','1 scoop',120,24],['Sprouts','1 katori',100,7],['Thepla','1',120,3],['Puri','1',100,2],['Fried rice','1 plate',450,9],['Pulao','1 plate',350,8],
    ['Hakka noodles','1 plate',450,10],['Manchurian','1 plate',400,8],['Dhokla','2 pieces',160,6],['Makhana','1 bowl',100,3],['Orange','1',60,1],['Papaya','1 bowl',60,1],
    ['Grapes','1 bowl',100,1],['Watermelon','1 bowl',45,1],['Guava','1',70,3],['Chikki','1 piece',120,3],['Buttermilk (chaas)','1 glass',60,3],['Nimbu pani','1 glass',60,0],
    ['Black coffee','1 cup',5,0],['Green tea','1 cup',2,0],['Sandwich','1',300,10],['Dal makhani','1 katori',280,9],['Butter chicken','1 katori',330,22],['Paneer butter masala','1 katori',330,12],
    ['Aloo sabzi','1 katori',150,2],['Bhindi sabzi','1 katori',110,2],['Palak paneer','1 katori',250,12],['Kadhi','1 katori',160,6],['Raita','1 katori',90,4],['Papad','1',40,2],['Pickle','1 tsp',30,0]
  ]; }
  function fdAlias(){ return {
    'roti':'Roti / chapati','chapati':'Roti / chapati','chapatti':'Roti / chapati','phulka':'Roti / chapati','fulka':'Roti / chapati','रोटी':'Roti / chapati','चपाती':'Roti / chapati',
    'chawal':'Cooked rice','chaawal':'Cooked rice','rice':'Cooked rice','bhaat':'Cooked rice','चावल':'Cooked rice',
    'dal':'Dal','daal':'Dal','dhal':'Dal','दाल':'Dal','dahi':'Curd','curd':'Curd','yogurt':'Curd','दही':'Curd',
    'doodh':'Milk (full fat)','milk':'Milk (full fat)','दूध':'Milk (full fat)','anda':'Boiled egg','ande':'Boiled egg','egg':'Boiled egg','eggs':'Boiled egg','अंडा':'Boiled egg','अंडे':'Boiled egg',
    'omelette':'Omelette (2 eggs)','omelet':'Omelette (2 eggs)','amlet':'Omelette (2 eggs)','आमलेट':'Omelette (2 eggs)','bhurji':'Egg bhurji (2 eggs)',
    'kela':'Banana','banana':'Banana','केला':'Banana','seb':'Apple','apple':'Apple','सेब':'Apple','aam':'Mango','mango':'Mango','आम':'Mango',
    'chai':'Chai with sugar','tea':'Chai with sugar','चाय':'Chai with sugar','coffee':'Coffee with milk and sugar','कॉफी':'Coffee with milk and sugar','lassi':'Sweet lassi','लस्सी':'Sweet lassi',
    'samosa':'Samosa','समोसा':'Samosa','kachori':'Kachori','कचौरी':'Kachori','vada pav':'Vada pav','vadapav':'Vada pav','pav bhaji':'Pav bhaji','pakoda':'Pakora / bhajiya','pakode':'Pakora / bhajiya','pakora':'Pakora / bhajiya','bhajiya':'Pakora / bhajiya','पकोड़े':'Pakora / bhajiya',
    'maggi':'Instant noodles','noodles':'Instant noodles','momos':'Momos (steamed)','momo':'Momos (steamed)','pizza':'Pizza','burger':'Veg burger','sandwich':'Sandwich','chole bhature':'Chole bhature',
    'paratha':'Plain paratha','parantha':'Plain paratha','पराठा':'Plain paratha','aloo paratha':'Aloo paratha','biryani':'Biryani','biriyani':'Biryani','बिरयानी':'Biryani',
    'gulab jamun':'Gulab jamun','jalebi':'Jalebi','जलेबी':'Jalebi','rasgulla':'Rasgulla','laddu':'Laddu','ladoo':'Laddu','laddoo':'Laddu','लड्डू':'Laddu','barfi':'Barfi','burfi':'Barfi','mithai':'Barfi',
    'halwa':'Halwa','kheer':'Kheer','cake':'Cake','pastry':'Pastry','chocolate':'Chocolate','ice cream':'Ice cream','icecream':'Ice cream','biscuit':'Plain biscuit','biscuits':'Plain biscuit',
    'coke':'Cold drink / soda','pepsi':'Cold drink / soda','cold drink':'Cold drink / soda','soda':'Cold drink / soda','thums up':'Cold drink / soda','sprite':'Cold drink / soda','juice':'Packaged fruit juice',
    'namkeen':'Namkeen / bhujia','bhujia':'Namkeen / bhujia','mixture':'Namkeen / bhujia','chips':'Potato chips','wafers':'Potato chips','fries':'French fries',
    'moongfali':'Peanuts','mungfali':'Peanuts','peanuts':'Peanuts','badam':'Nuts and dry fruits','kaju':'Nuts and dry fruits','nuts':'Nuts and dry fruits','dry fruits':'Nuts and dry fruits',
    'nariyal pani':'Coconut water','coconut water':'Coconut water','paneer':'Paneer sabzi','पनीर':'Paneer sabzi','chicken':'Chicken curry','चिकन':'Chicken curry','sabzi':'Mixed veg sabzi','sabji':'Mixed veg sabzi','सब्जी':'Mixed veg sabzi',
    'rajma':'Rajma','chole':'Chole','chana':'Chole','khichdi':'Khichdi','खिचड़ी':'Khichdi','bread':'Bread','toast':'Bread','salad':'Green salad','oats':'Oats porridge','upma':'Upma','poha':'Poha','पोहा':'Poha',
    'idli':'Idli','इडली':'Idli','dosa':'Plain dosa','डोसा':'Plain dosa','masala dosa':'Masala dosa','sambar':'Sambar','fish':'Fish curry','machli':'Fish curry','whey':'Whey protein','protein shake':'Whey protein',
    'sprouts':'Sprouts','thepla':'Thepla','puri':'Puri','poori':'Puri','pulao':'Pulao','fried rice':'Fried rice','manchurian':'Manchurian','dhokla':'Dhokla','makhana':'Makhana','santra':'Orange','orange':'Orange',
    'papita':'Papaya','papaya':'Papaya','angoor':'Grapes','grapes':'Grapes','tarbooz':'Watermelon','watermelon':'Watermelon','amrood':'Guava','guava':'Guava','chikki':'Chikki',
    'chaas':'Buttermilk (chaas)','chhach':'Buttermilk (chaas)','buttermilk':'Buttermilk (chaas)','nimbu pani':'Nimbu pani','shikanji':'Nimbu pani','black coffee':'Black coffee','green tea':'Green tea',
    'dal makhani':'Dal makhani','butter chicken':'Butter chicken','paneer butter masala':'Paneer butter masala','aloo':'Aloo sabzi','bhindi':'Bhindi sabzi','palak paneer':'Palak paneer','kadhi':'Kadhi','raita':'Raita','papad':'Papad','achar':'Pickle','pickle':'Pickle',
    'ghee':'Ghee','butter':'Butter','makhan':'Butter','sugar':'Sugar','cheeni':'Sugar','beer':'Beer','ganne ka juice':'Sugarcane juice','sugarcane':'Sugarcane juice'
  }; }
  function fdIndex(){
    if(fdIndex.v) return fdIndex.v;
    var L = [], by = {};
    function add(o){ var k = o.n.toLowerCase(); if(by[k]) return; by[k] = o; L.push(o); }
    EXTRAF.forEach(function(x,i){ if(x[0]==='Not sure what it was') return; add({n:x[1],u:x[2],k:x[3],p:x[4],src:'x:'+i}); });
    fdExtra().forEach(function(x){ add({n:x[0],u:x[1],k:x[2],p:x[3],src:'e'}); });
    DISHES.forEach(function(x){ add({n:x.n,u:x.s,k:x.k,p:x.p,src:x.id}); });
    L.forEach(function(o){ o.w = fdNorm(o.n).split(' ').filter(function(w){ return w.length>2 && !/^(with|and|the|of|in|on)$/.test(w); }); });
    fdIndex.v = {L:L,by:by};
    return fdIndex.v;
  }
  function fdNorm(t){ return String(t||'').toLowerCase().replace(/[()\/,.;:!?'"]/g,' ').replace(/\s+/g,' ').trim(); }
  function fdNum(){ return {ek:1,one:1,'एक':1,do:2,two:2,'दो':2,teen:3,three:3,'तीन':3,char:4,chaar:4,four:4,'चार':4,paanch:5,panch:5,five:5,'पांच':5,'पाँच':5,chhe:6,six:6,'छह':6,saat:7,seven:7,'सात':7,aath:8,eight:8,'आठ':8,nau:9,nine:9,das:10,ten:10,'दस':10,
    aadha:0.5,adha:0.5,half:0.5,'आधा':0.5,'आधी':0.5,dedh:1.5,'डेढ़':1.5,dhai:2.5,'ढाई':2.5,pauna:0.75,sawa:1.25,quarter:0.25}; }
  /* "2 roti, dal aur 1 glass chai" -> [{q:2,f:Roti},{q:1,f:Dal},{q:1,f:Chai}] */
  function fdParse(txt){
    var I = fdIndex(), A = fdAlias(), N = fdNum(), out = [];
    var aliasKeys = Object.keys(A).sort(function(a,b){ return b.length-a.length; });
    String(txt||'').split(/,|;|\+|&|\n|\.\s| aur | and | with | ke saath | ke sath | sath | और | तथा | व /i).forEach(function(seg){
      var t = ' '+fdNorm(seg)+' '; if(!t.trim()) return;
      var q = null, m = t.match(/(\d+(?:\.\d+)?)/); if(m) q = parseFloat(m[1]);
      if(q===null){ for(var w in N){ if(t.indexOf(' '+w+' ')>=0){ q = N[w]; break; } } }
      var hit = null;
      for(var i=0;i<aliasKeys.length && !hit;i++){ var a = aliasKeys[i]; if(t.indexOf(' '+a+' ')>=0 || (a.length>4 && t.indexOf(a)>=0)) hit = I.by[A[a].toLowerCase()]; }
      if(!hit){
        var tw = t.trim().split(' '), best = null, bs = 0;
        I.L.forEach(function(o){ if(!o.w.length) return; var n = 0; o.w.forEach(function(w){ if(tw.some(function(x){ return x.length>3 && (x===w || (w.length>4 && x.slice(0,5)===w.slice(0,5))); })) n++; }); var sc = n/o.w.length + n*0.05; if(n && sc>bs){ bs = sc; best = o; } });
        if(best && bs>=0.5) hit = best;
      }
      var clean = seg.trim().replace(/\s+/g,' ').slice(0,60);
      if(hit) out.push({q:q||1,f:hit,t:clean}); else if(/[a-zऀ-ॿ]{3,}/i.test(clean)) out.push({q:q||1,f:null,t:clean});
    });
    return out;
  }
  /* ---- quick add box in "Add what you ate" ---- */
  function fqSt(){ return fqSt.s || (fqSt.s = {txt:'',rows:[],busy:false,err:'',from:''}); }
  function fqHtml(){
    fqAiCheck();
    var s = fqSt(), h = '<div class="fq" id="fq"><span class="tklbl">Quick add · type, say or snap</span>';
    h += '<div class="fq-in"><input id="fq-t" type="text" autocomplete="off" placeholder="e.g. 2 roti, 1 katori dal aur chai" value="'+esc(s.txt)+'" aria-label="What did you eat?">';
    h += '<button type="button" class="fq-ib" data-fq="mic" aria-label="Say what you ate">'+kIco('<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/>')+'</button>';
    h += '<label class="fq-ib'+(fqAiReady()===false?' off':'')+'" aria-label="Photo of your food">'+kIco('<rect x="3" y="6" width="18" height="14" rx="3"/><circle cx="12" cy="13" r="3.5"/><path d="M8 6l2-3h4l2 3"/>')+'<input type="file" accept="image/*" id="fq-ph" hidden></label></div>';
    h += '<button type="button" class="fq-go" data-fq="find">Find calories</button>';
    if(s.busy) h += '<p class="fq-busy"><span class="fq-sp"></span>'+esc(s.busy)+'</p>';
    if(s.err) h += '<p class="fq-err">'+esc(s.err)+'</p>';
    if(s.rows.length){
      var K = 0, P = 0;
      h += '<div class="fq-rows">'+(s.from==='photo'?'<p class="fq-note">From your photo. Check the amounts before adding.</p>':'')+s.rows.map(function(r,i){
        if(!r.f) return '<div class="fq-r miss"><span><b>'+esc(r.t)+'</b><small>Not found. Pick it from the list below.</small></span><button type="button" class="xrm" data-fq="rm" data-i="'+i+'" aria-label="Remove">×</button></div>';
        var k = r.f.k*r.q, p = r.f.p*r.q; K += k; P += p;
        return '<div class="fq-r"><span><b>'+esc(r.f.n)+'</b><small>'+esc(r.f.u)+(r.ai?' · AI estimate':'')+'</small></span><span class="fq-q"><button type="button" data-fq="q-" data-i="'+i+'" aria-label="Less">−</button><b>'+mTxt(r.q)+'</b><button type="button" data-fq="q+" data-i="'+i+'" aria-label="More">+</button></span><span class="fq-k">'+Math.round(k)+'<small>kcal</small></span><button type="button" class="xrm" data-fq="rm" data-i="'+i+'" aria-label="Remove">×</button></div>';
      }).join('')+'</div>';
      if(K) h += '<button type="button" class="tkgo" data-fq="addall">Add '+Math.round(K)+' kcal · '+Math.round(P)+' g protein to today</button>';
    }
    return h+'</div>';
  }
  function fqPaint(){ var el = $('fq'); if(!el) return; var foc = document.activeElement && document.activeElement.id==='fq-t'; el.outerHTML = fqHtml(); if(foc){ var i = $('fq-t'); i.focus(); i.setSelectionRange(i.value.length,i.value.length); } }
  function fqFind(){
    var s = fqSt(); s.txt = ($('fq-t')||{}).value || s.txt; s.err = ''; s.from = 'text';
    var rows = fdParse(s.txt);
    if(!rows.length){ s.err = 'Type what you ate, for example: 2 roti, dal and a glass of milk.'; s.rows = []; }
    else s.rows = rows;
    buzz(); fqPaint();
  }
  /* photo -> Cloudflare Workers AI */
  function fqAiReady(v){ if(v!==undefined) fqAiReady.v = v; return fqAiReady.v; }
  function fqAiCheck(){ if(fqAiReady()!==undefined || fqAiCheck.go) return; fqAiCheck.go = 1; fetch(kApi('/api/food/photo')).then(function(r){ return r.json(); }).then(function(o){ fqAiReady(!!o.ready); fqPaint(); }).catch(function(){ fqAiCheck.go = 0; }); }
  function fqPhoto(file){
    var s = fqSt(); s.err = ''; s.busy = 'Looking at your photo…'; s.rows = []; fqPaint();
    var u = URL.createObjectURL(file), im = new Image();
    im.onload = function(){
      var M = 768, k = Math.min(1,M/Math.max(im.width,im.height)), c = document.createElement('canvas'); c.width = Math.round(im.width*k); c.height = Math.round(im.height*k);
      c.getContext('2d').drawImage(im,0,0,c.width,c.height); URL.revokeObjectURL(u);
      var b64 = c.toDataURL('image/jpeg',.72).split(',')[1];
      fetch(kApi('/api/food/photo'),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({img:b64})})
        .then(function(r){ return r.json().then(function(o){ return {ok:r.ok,o:o}; }); })
        .then(function(x){
          s.busy = false;
          if(!x.ok){ s.err = (x.o && x.o.error) || 'Could not read the photo.'; fqPaint(); return; }
          var I = fdIndex(), A = fdAlias();
          s.rows = (x.o.items||[]).map(function(it){
            var m = fdParse(it.name)[0], f = m && m.f;
            if(f && /piece|katori|plate|glass|cup|slice|bowl|handful|scoop|tsp/.test(f.u+' '+it.unit)) return {q:Math.max(0.5,Math.round(it.qty*2)/2),f:f,t:it.name};
            var per = it.qty>0 ? it.kcal/it.qty : it.kcal;
            return {q:it.qty||1,f:{n:it.name.charAt(0).toUpperCase()+it.name.slice(1),u:'1 '+it.unit,k:Math.round(per),p:Math.round((it.protein||0)/(it.qty||1)*10)/10,src:'ai'},t:it.name,ai:true};
          });
          s.from = 'photo';
          if(!s.rows.length) s.err = (x.o.note || 'No food found in this photo.')+' Try a photo from above, in good light.';
          snd('ok'); buzz('ok'); fqPaint();
        })
        .catch(function(){ s.busy = false; s.err = 'No internet connection. Type what you ate instead.'; fqPaint(); });
    };
    im.onerror = function(){ URL.revokeObjectURL(u); s.busy = false; s.err = 'Could not open this photo.'; fqPaint(); };
    im.src = u;
  }
  /* voice: the browser's speech recognition, or the app's speech plugin */
  function kListen(lang,done,fail){
    var SP = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.SpeechRecognition;
    if(SP){
      SP.requestPermissions().then(function(){ return SP.start({language:lang,maxResults:1,prompt:'Say what you ate',partialResults:false,popup:true}); })
        .then(function(r){ var t = r && r.matches && r.matches[0]; if(t) done(t); else fail('I did not catch that. Try again.'); })
        .catch(function(e){ fail(/denied|permission/i.test(String(e&&e.message))?'Allow the microphone for KDN in your phone settings.':'Voice is not available. Type instead.'); });
      return;
    }
    var R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if(!R){ fail('Voice input does not work in this browser. Type instead, or use Chrome.'); return; }
    try{
      var r = new R(); r.lang = lang; r.interimResults = false; r.maxAlternatives = 1;
      r.onresult = function(ev){ var t = ev.results[0] && ev.results[0][0] && ev.results[0][0].transcript; if(t) done(t); };
      r.onerror = function(ev){ fail(ev.error==='not-allowed'?'Allow the microphone to use voice.':ev.error==='no-speech'?'I did not hear anything. Try again.':'Voice did not work. Type instead.'); };
      r.start(); kListen.r = r;
    }catch(e){ fail('Voice did not work. Type instead.'); }
  }
  function fqMic(){
    var s = fqSt(); s.err = ''; s.busy = 'Listening… say what you ate'; fqPaint(); buzz('big');
    var lang = (typeof kLang==='function' && kLang()==='hi') ? 'hi-IN' : 'en-IN';
    kListen(lang,function(t){ s.busy = false; s.txt = t; fqFind(); },function(msg){ s.busy = false; s.err = msg; fqPaint(); });
  }
  document.addEventListener('click',function(ev){
    var b = ev.target.closest && ev.target.closest('[data-fq]'); if(!b || !S) return;
    var a = b.getAttribute('data-fq'), s = fqSt(), i = parseInt(b.getAttribute('data-i'),10);
    if(a==='find'){ fqFind(); return; }
    if(a==='mic'){ fqMic(); return; }
    if(a==='rm'){ s.rows.splice(i,1); buzz(); fqPaint(); return; }
    if(a==='q-' || a==='q+'){ var r = s.rows[i]; r.q = Math.max(0.25,Math.min(20,r.q+(a==='q+'?(r.q<1?0.25:0.5):(r.q<=1?-0.25:-0.5)))); buzz(); fqPaint(); return; }
    if(a==='addall'){
      var n = 0, K = 0;
      s.rows.forEach(function(r){ if(!r.f) return; xtOf().push({n:r.f.n,u:r.f.u,q:r.q,k:r.f.k*r.q,p:r.f.p*r.q}); n++; K += r.f.k*r.q; });
      fqSt.s = null; lsSet(S); snd('ok'); buzz('ok');
      var y = window.scrollY; renderToday(S,curR); renderHome(); window.scrollTo(0,y);
      toast('Added '+n+' item'+(n>1?'s':'')+' · '+Math.round(K)+' kcal.'); return;
    }
  });
  document.addEventListener('keydown',function(ev){ if(ev.key==='Enter' && ev.target && ev.target.id==='fq-t'){ ev.preventDefault(); fqFind(); } });
  document.addEventListener('input',function(ev){ if(ev.target && ev.target.id==='fq-t') fqSt().txt = ev.target.value; });
  document.addEventListener('change',function(ev){ if(ev.target && ev.target.id==='fq-ph' && ev.target.files && ev.target.files[0]){ if(fqAiReady()===false){ fqSt().err = 'Photo AI is not switched on yet. Type what you ate instead.'; fqPaint(); return; } fqPhoto(ev.target.files[0]); } });

  /* ---- weekly grocery list from the diet plan ---- */
  function grocCat(key,name){
    var t = (key+' '+name).toLowerCase();
    if(/atta|rice|poha|sooji|semolina|oat|bread|flour|wheat|millet|bajra|jowar|ragi|daliya|vermicelli|pasta|maida|corn flakes|muesli/.test(t)) return 'Grains and flour';
    if(/dal|lentil|moong|masoor|chana|rajma|chickpea|besan|soya|tofu|bean|urad|toor/.test(t)) return 'Dal, beans and soya';
    if(/milk|curd|yogurt|paneer|cheese|butter|ghee|whey|greek|egg|cream/.test(t)) return 'Dairy, eggs and protein';
    if(/chicken|fish|mutton|prawn|meat/.test(t)) return 'Meat and fish';
    if(/banana|apple|mango|orange|papaya|guava|fruit|grape|lemon|berries|pomegranate|dates/.test(t)) return 'Fruit';
    if(/peanut|almond|walnut|cashew|nut|seed|flax|chia|makhana|raisin/.test(t)) return 'Nuts and seeds';
    if(/oil|salt|sugar|jaggery|spice|masala|honey|herb|ginger|garlic|chutney|pickle|sauce/.test(t)) return 'Oil, sugar and spices';
    return 'Vegetables and others';
  }
  function grocWeek(){ var d = new Date(), dow = (d.getDay()+6)%7; d.setDate(d.getDate()-dow); return dkey(d); }
  function grocList(){
    var tot = {}, add = function(ing,mult){ (ing||[]).forEach(function(x){ tot[x[0]] = (tot[x[0]]||0)+x[1]*mult; }); };
    for(var dow=0; dow<7; dow++){
      var mp = mealPlan(S,curR,dow);
      mp.slots.forEach(function(it){ add(it.x.ing,it.m||1); });
      mp.tops.forEach(function(q){ add(q.t.ing,q.u); });
      fdAdds(dow).forEach(function(a){ var x = DISHMAP[a.it.id]; if(x) add(x.ing,a.it.m||1); });
    }
    var g = {};
    Object.keys(tot).forEach(function(k){ var I = ING[k], n = I ? I[0] : k, c = grocCat(k,n); (g[c] = g[c]||[]).push({k:k,n:n,gm:tot[k]}); });
    return g;
  }
  function grocAmt(gm){ gm = Math.max(5,gm); if(gm>=1000) return (Math.round(gm/50)*50/1000).toLocaleString('en-IN',{maximumFractionDigits:2})+' kg'; return (gm<100?Math.round(gm/5)*5:Math.round(gm/10)*10)+' g'; }
  function grocGot(){ var w = grocWeek(); if(!S.groc || S.groc.w!==w) S.groc = {w:w,got:{}}; return S.groc.got; }
  function grocBtn(){ return '<button type="button" class="gr-btn" data-gr="open">'+kIco('<path d="M3 4h2l2.4 11h10.2L20 7H6.2"/><circle cx="9" cy="19.5" r="1.5"/><circle cx="17" cy="19.5" r="1.5"/>')+'<span><b>Grocery list for this week</b><small>Everything in your 7-day diet, by aisle</small></span><span aria-hidden="true">›</span></button>'; }
  function grocSheet(){
    var g = grocList(), got = grocGot(), cats = Object.keys(g).sort(), n = 0, d = 0;
    var h = '<p class="hint">Raw weights for your 7-day plan, rounded up a little. Tick things you already have.</p>';
    cats.forEach(function(c){
      h += '<div class="gr-cat"><h4>'+esc(c)+'</h4>'+g[c].sort(function(a,b){ return b.gm-a.gm; }).map(function(it){ n++; if(got[it.k]) d++; return '<label class="gr-it'+(got[it.k]?' got':'')+'"><input type="checkbox" data-grk="'+esc(it.k)+'"'+(got[it.k]?' checked':'')+'><span>'+esc(it.n)+'</span><b>'+grocAmt(it.gm*1.05)+'</b></label>'; }).join('')+'</div>';
    });
    kSheet('Grocery list',h,'<button type="button" class="hh-btn ghost" data-k="grshare">Share</button><button type="button" class="hh-gold wide" data-k="close">Done ('+d+'/'+n+')</button>');
  }
  function grocText(){
    var g = grocList(), got = grocGot(), t = 'KDN grocery list · week of '+kNice(grocWeek(),{day:'numeric',month:'short'})+'\n';
    Object.keys(g).sort().forEach(function(c){ var L = g[c].filter(function(it){ return !got[it.k]; }); if(!L.length) return; t += '\n'+c+'\n'+L.map(function(it){ return '• '+it.n+': '+grocAmt(it.gm*1.05); }).join('\n')+'\n'; });
    return t;
  }
  function grocShare(){
    var t = grocText(), SH = NATIVE && window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Share;
    if(SH){ SH.share({title:'Grocery list',text:t,dialogTitle:'Share grocery list'}).catch(function(){}); return; }
    if(navigator.share){ navigator.share({title:'Grocery list',text:t}).catch(function(){}); return; }
    try{ navigator.clipboard.writeText(t).then(function(){ toast('Grocery list copied. Paste it in WhatsApp or notes.'); }); }catch(e){ toast('Could not share.'); }
  }
  document.addEventListener('click',function(ev){ var b = ev.target.closest && ev.target.closest('[data-gr]'); if(!b || !S) return; buzz(); grocSheet(); });
  function kSheetClick2(a,b){ if(a==='grshare'){ grocShare(); return; } if(typeof kSheetClick3==='function') kSheetClick3(a,b); }
  function kSheetChange2(ev){
    var k = ev.target.getAttribute && ev.target.getAttribute('data-grk');
    if(k){ var got = grocGot(); if(ev.target.checked) got[k] = 1; else delete got[k]; lsSet(S); ev.target.closest('.gr-it').classList.toggle('got',ev.target.checked); buzz();
      var all = document.querySelectorAll('#ksheet [data-grk]').length, dn = document.querySelectorAll('#ksheet [data-grk]:checked').length, f = document.querySelector('#ksheet .hs-foot .hh-gold'); if(f) f.textContent = 'Done ('+dn+'/'+all+')'; return; }
    if(typeof kSheetChange3==='function') kSheetChange3(ev);
  }
  /* ==== KDN FOOD LOG END ==== */
