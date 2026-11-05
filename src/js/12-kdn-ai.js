  /* ---------- KDN AI: voice + text assistant (Hindi and English). Runs fully on the device. ----------
     Replies in the language the person spoke, with a short "typing" pause and the most natural voice the device has. */
  var AI = {lang:'hi-IN', rec:null, on:false, heard:'', hi:true, busy:0};
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  var HINUM = 'एक दो तीन चार पांच छह सात आठ नौ दस ग्यारह बारह तेरह चौदह पंद्रह सोलह सत्रह अठारह उन्नीस बीस इक्कीस बाईस तेईस चौबीस पच्चीस छब्बीस सत्ताईस अट्ठाईस उनतीस तीस इकतीस बत्तीस तैंतीस चौंतीस पैंतीस छत्तीस सैंतीस अड़तीस उनतालीस चालीस इकतालीस बयालीस तैंतालीस चवालीस पैंतालीस छियालीस सैंतालीस अड़तालीस उनचास पचास इक्यावन बावन तिरपन चौवन पचपन छप्पन सत्तावन अट्ठावन उनसठ साठ इकसठ बासठ तिरसठ चौंसठ पैंसठ छियासठ सड़सठ अड़सठ उनहत्तर सत्तर इकहत्तर बहत्तर तिहत्तर चौहत्तर पचहत्तर छिहत्तर सतहत्तर अठहत्तर उन्यासी अस्सी इक्यासी बयासी तिरासी चौरासी पचासी छियासी सत्तासी अट्ठासी नवासी नब्बे इक्यानवे बानवे तिरानवे चौरानवे पचानवे छियानवे सत्तानवे अट्ठानवे निन्यानवे'.split(' ');
  var HIALT = {'पाँच':5,'छः':6,'छे':6,'सतरह':17,'अठ्ठाईस':28,'अठ्ठावन':58,'अठ्ठासी':88,'सडसठ':67,'अडसठ':68,'अडतीस':38,'अडतालीस':48};
  var ENNUM = {one:1,two:2,three:3,four:4,five:5,six:6,seven:7,eight:8,nine:9,ten:10,eleven:11,twelve:12,thirteen:13,fourteen:14,fifteen:15,sixteen:16,seventeen:17,eighteen:18,nineteen:19,twenty:20,thirty:30,forty:40,fifty:50,sixty:60,seventy:70,eighty:80,ninety:90};

  /* --- voice output --- */
  var VOICES = [];
  function loadVoices(){ try{ VOICES = speechSynthesis.getVoices() || []; }catch(e){ VOICES = []; } }
  if(window.speechSynthesis){ loadVoices(); try{ speechSynthesis.onvoiceschanged = loadVoices; }catch(e){} }
  function bestVoice(lang){
    var base = lang.slice(0,2), pool = VOICES.filter(function(v){ return (v.lang||'').replace('_','-').toLowerCase().indexOf(base)===0; });
    if(!pool.length) return null;
    function score(v){ var n = (v.name||'').toLowerCase(), s = 0;
      if(/natural|neural|online|wavenet|premium|enhanced/.test(n)) s += 6;
      if(/google/.test(n)) s += 4;
      if((v.lang||'').replace('_','-').toLowerCase()===lang.toLowerCase()) s += 3;
      if(/swara|neerja|kalpana|heera|lekha|aditi|raveena|rishi|madhur|prabhat/.test(n)) s += 2;
      if(v.localService===false) s += 1;
      return s; }
    return pool.sort(function(a,b){ return score(b)-score(a); })[0];
  }
  function aiSpeak(txt,hi){
    try{
      if(!window.speechSynthesis) return;
      var clean = txt.replace(/[“”"]/g,'').replace(/→/g,hi?', फिर ':', then ').replace(/\bkg\b/g,hi?'किलो':'kilos').replace(/\bcm\b/g,hi?'सेंटीमीटर':'centimetres');
      var lang = hi ? 'hi-IN' : 'en-IN', v = bestVoice(lang) || (hi ? null : bestVoice('en-GB') || bestVoice('en-US'));
      var u = new SpeechSynthesisUtterance(clean); u.lang = lang; if(v) u.voice = v;
      u.rate = hi ? 0.98 : 1.02; u.pitch = 1.05; u.volume = 1;
      speechSynthesis.speak(u);
    }catch(e){}
  }

  /* --- chat log --- */
  function aiAdd(cls,html){ var d = document.createElement('div'); d.className = 'amsg '+cls; d.innerHTML = html; $('ai-log').appendChild(d); d.scrollIntoView({behavior:'smooth',block:'nearest'}); return d; }
  function aiTyping(){ return aiAdd('a typing','<span class="who">KDN AI</span><span class="dots"><i></i><i></i><i></i></span>'); }
  /* say(en, hi, opt): shows and speaks the reply in the language the person used */
  function aiSay(en,hi,opt){
    opt = opt || {};
    var useHi = AI.hi && hi, txt = useHi ? hi : en;
    var t = aiTyping(); AI.busy++;
    setTimeout(function(){
      AI.busy--;
      var html = '<span class="who">KDN AI</span><span>'+esc(txt)+'</span>';
      if(opt.btn) html += '<button type="button" class="abtn" data-ai="'+opt.btn[0]+'"'+(opt.btn[3]?' data-v="'+esc(opt.btn[3])+'"':'')+'>'+esc(useHi && opt.btn[2] ? opt.btn[2] : opt.btn[1])+'</button>';
      t.className = 'amsg a'+(opt.cls?' '+opt.cls:''); t.innerHTML = html; t.scrollIntoView({behavior:'smooth',block:'nearest'});
      if(!opt.quiet) aiSpeak(txt,useHi);
      if(opt.then) opt.then();
    }, opt.fast ? 350 : 650 + Math.min(700, txt.length*6));
  }
  function aiHL(){ var f = $('ai-form'); f.classList.add('hl'); setTimeout(function(){f.classList.remove('hl')},4000); f.scrollIntoView({behavior:'smooth',block:'center'}); setTimeout(function(){ $('ai-in').focus({preventScroll:true}) },500); }
  function aiConfused(){
    aiSay('Sorry, I’m having a little trouble understanding that. Could you type it in the box below and press Send? I’ll read it and help you right away.',
          'माफ़ कीजिए, मुझे समझने में थोड़ी दिक्कत हो रही है। आप नीचे वाले बॉक्स में लिखकर Send दबा दीजिए, मैं पढ़कर तुरंत बता दूँगा।',{cls:'warn',then:aiHL});
  }
  function aiConfusedFocus(){ aiHL(); }

  /* --- understanding --- */
  function hiDigits(t){
    t = t.replace(/[०-९]/g,function(c){return '०१२३४५६७८९'.indexOf(c)});
    t = t.replace(/[ऀ-ॿ]+/g,function(w){
      if(HIALT[w]) return String(HIALT[w]);
      var i = HINUM.indexOf(w); if(i<0) return w;
      if(i<2) return w; /* एक / दो are common words; handled below only next to units */
      return String(i+1);
    });
    t = t.replace(/(^| )(एक|दो)(?= ?(फुट|फ़ुट|फीट|इंच|किलो|सौ|kg|cm|feet|inch))/g,function(m,a,w){ return a+(w==='एक'?'1':'2'); });
    t = t.replace(/\b(twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)[ -](one|two|three|four|five|six|seven|eight|nine)\b/g,function(m,a,b){ return String(ENNUM[a]+ENNUM[b]); });
    t = t.replace(/\b(one|three|four|five|six|seven|eight|nine|ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|seventeen|eighteen|nineteen|twenty|thirty|forty|fifty|sixty|seventy|eighty|ninety)\b/g,function(m){ return String(ENNUM[m]); });
    t = t.replace(/(\d+) ?(?:सौ|sau|hundred)(?: ?(?:and )?(\d{1,2})\b)?/g,function(m,a,b){ return String(parseInt(a,10)*100+(b?parseInt(b,10):0)); });
    t = t.replace(/(\d+) ?(?:point|पॉइंट|पॉइन्ट|दशमलव|dot) ?(\d+)/g,'$1.$2');
    t = t.replace(/(?:साढ़े|साढे|sadhe|saadhe|saade) ?(\d+)/g,function(m,a){ return (parseInt(a,10)+0.5)+''; });
    t = t.replace(/(\d+) (?:and a half|aur aadha|और आधा)/g,function(m,a){ return (parseInt(a,10)+0.5)+''; });
    return t;
  }
  function aiNorm(t){
    t = String(t||'').toLowerCase().replace(/[,!?।.](?!\d)/g,' ').replace(/\s+/g,' ').trim();
    return hiDigits(t).replace(/\s+/g,' ').trim();
  }
  function isHindi(raw,t){
    return /[ऀ-ॿ]/.test(raw) || /(^| )(mera|meri|mere|mujhe|muje|hai|hain|karna|kar do|krna|kro|karo|bana|banao|batao|bata do|aur|kya|kitna|kitni|wajan|vajan|lambai|kam|chahiye|chaiye|hu|hoon|hun|kaise|kaisa|dikhao|khana|abhi|aaj|accha|acha|theek|thik|shukriya|dhanyawad|liye|ke|ki|ko|karni|karne|chahta|chahti|wala|wali|bhi|nahi|nahin|haan|bolo|batana|dena|do)( |$)/.test(t);
  }
  var W_KEY = /(weight|weigh|weigt|wajan|vajan|wazan|वजन|वज़न|वेट|वेइट|भार)/, H_KEY = /(height|hight|haight|tall|lambai|lambaai|लंबाई|लम्बाई|हाइट|हाईट|\bkad\b|कद)/;
  var DIET_KEY = /(diet|dait|डाइट|डायट|khana|khaana|खाना|khau|खाऊं|खाऊँ|bhojan|भोजन|meal|food|eat|nashta|नाश्ता|lunch|dinner|breakfast|protein|प्रोटीन|calorie|कैलोरी)/;
  var EX_KEY = /(exercise|excercise|exersize|workout|work out|kasrat|कसरत|व्यायाम|एक्सरसाइज|एक्सरसाइज़|वर्कआउट|improve|strong|stronger|tone|mazboot|मजबूत|मज़बूत|banana hai|बनाना|बढ़ाना|kam karna|कम करना|ghatana|घटाना|gym|जिम|muscle|मसल|train)/;
  var STEP_KEY = /(steps|step count|walk|walking|chala|chalna|kadam|कदम|स्टेप|चला|चलना)/;
  var MUSC = [
    ['Abs & core',/(abs|six pack|sixpack|belly|tummy|stomach|core|\bpet\b|पेट|एब्स|सिक्स पैक|तोंद|tond)/,'abs and core','पेट और कोर'],
    ['Chest',/(chest|chhati|chati|छाती|चेस्ट|सीना|seena)/,'chest','छाती'],
    ['Back',/(\bback\b|peeth|pith|पीठ|बैक)/,'back','पीठ'],
    ['Shoulders',/(shoulder|kandha|kandhe|कंधा|कंधे|शोल्डर)/,'shoulder','कंधों'],
    ['Triceps',/(tricep|ट्राइसेप)/,'triceps','ट्राइसेप्स'],
    ['Biceps',/(bicep|बाइसेप|बायसेप|\barms?\b|baju|bazu|बाजू|बाहें|बांह|डोले|dole)/,'biceps and arm','बाइसेप्स'],
    ['Forearms',/(forearm|kalai|कलाई|grip)/,'forearm','कलाई'],
    ['Glutes',/(glute|hips|kulhe|कूल्हे|butt)/,'glute','कूल्हों'],
    ['Hamstrings',/(hamstring|हैमस्ट्रिंग)/,'hamstring','हैमस्ट्रिंग'],
    ['Calves',/(calf|calves|pindli|पिंडली)/,'calf','पिंडली'],
    ['Quads',/(\blegs?\b|thigh|quad|\bpair\b|pairon|पैर|टांग|जांघ|लेग)/,'leg','पैरों'],
    ['Cardio',/(stamina|cardio|स्टैमिना|कार्डियो|fat loss|weight loss|charbi|चर्बी|fat)/,'cardio and stamina','स्टैमिना और कार्डियो'],
    ['Mobility',/(flexib|mobility|stretch|लचीला|स्ट्रेच)/,'mobility and stretching','स्ट्रेचिंग'],
    ['Full body',/(full body|whole body|pura sharir|पूरा शरीर|पूरे शरीर)/,'full body','पूरे शरीर']
  ];
  var KEYS2 = /(weight|weigh|wajan|vajan|wazan|वजन|वज़न|वेट|भार|height|hight|tall|lambai|लंबाई|लम्बाई|हाइट|हाईट|कद)/;
  function segAfter(t,re){
    var m = re.exec(t); if(!m) return null;
    var rest = t.slice(m.index+m[0].length), stop = rest.search(KEYS2);
    if(stop>=0) rest = rest.slice(0,stop);
    var before = t.slice(Math.max(0,m.index-18),m.index);
    return {rest:rest, before:before};
  }
  var FTIN = /(\d+(?:\.\d+)?) ?(?:feet|foot|fit|ft|फुट|फ़ुट|फीट|')(?: ?(?:and|aur|और))? ?(?:(\d+(?:\.\d+)?) ?(?:inches|inch|in\b|इंच|")?)?/;
  function ftinCm(m){ return Math.round(parseFloat(m[1])*30.48 + (m[2]?parseFloat(m[2]):0)*2.54); }
  function parseWeight(t){
    var r = segAfter(t,W_KEY);
    if(r){
      var m = r.rest.match(/\d+(?:\.\d+)?/) || r.before.match(/(\d+(?:\.\d+)?) ?(?:kg|kilo|kgs|किलो)? ?(?:मेरा|mera|my)? ?$/);
      if(m) return parseFloat(m[m.length>1&&m[1]?1:0]);
      return null;
    }
    var k = t.match(/(\d+(?:\.\d+)?) ?(?:kg|kgs|kilo|kilos|kilogram|किलो|केजी)/);
    return k ? parseFloat(k[1]) : null;
  }
  function parseHeight(t){
    var r = segAfter(t,H_KEY), s = r ? r.rest : t, fi = s.match(FTIN);
    if(!r){ if(fi) return ftinCm(fi); var c = t.match(/(\d{3}(?:\.\d+)?) ?(?:cm|centimet|सेंटीमीटर|सेमी)/); return c ? Math.round(parseFloat(c[1])) : null; }
    if(fi) return ftinCm(fi);
    if(!fi && r.before){ var fb = r.before.match(FTIN); if(fb) return ftinCm(fb); }
    var m = s.match(/\d+(?:\.\d+)?/) || r.before.match(/(\d+(?:\.\d+)?) ?(?:cm|सेमी)? ?(?:मेरी|meri|my)? ?$/);
    if(!m) return null;
    var v = parseFloat(m[m.length>1&&m[1]?1:0]);
    return (v>=3 && v<8) ? Math.round(v*30.48) : Math.round(v);
  }
  function needPlan(){
    if(S) return false;
    aiSay('Let’s set up your plan first, so I know a bit about you. It only takes about two minutes.','पहले चलिए आपका प्लान बना लेते हैं, ताकि मुझे आपके बारे में थोड़ा पता चल जाए। बस दो मिनट लगेंगे।',{btn:['setup','Set up my plan','प्लान बनाएं']});
    return true;
  }
  function tNow(){ return new Date().toLocaleTimeString('en-IN',{hour:'numeric',minute:'2-digit'}); }
  function first(n){ var s = S && S.name ? String(S.name).trim().split(' ')[0] : ''; return s ? (n ? ', '+s : s) : ''; }
  function trendBit(w){
    var list = wEntries(); if(list.length<2) return ['',''];
    var prev = list[list.length-2].kg, d = r1(w-prev);
    if(Math.abs(d)<0.1) return [' Same as last time, steady.',' पिछली बार जितना ही है, बढ़िया।'];
    return d<0 ? [' That’s '+Math.abs(d)+' kg less than last time. Nice work!',' पिछली बार से '+Math.abs(d)+' किलो कम है। बहुत बढ़िया!']
               : [' That’s '+d+' kg more than last time.',' पिछली बार से '+d+' किलो ज़्यादा है।'];
  }
  function aiHandle(raw){
    var t = aiNorm(raw); if(!t){ aiConfused(); return; }
    try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    AI.hi = isHindi(raw,t) || (AI.lang==='hi-IN' && !/[a-z]{3,}.*[a-z]{3,}.*[a-z]{3,}/.test(t) && /[ऀ-ॿ]/.test(raw));
    aiAdd('u',esc(raw));
    var w = parseWeight(t), hgt = parseHeight(t);
    if(w!==null && isNaN(w)) w = null; if(hgt!==null && isNaN(hgt)) hgt = null;
    if(w!==null && hgt!==null && w===hgt) hgt = null;
    if(w!==null || hgt!==null){
      if(needPlan()) return;
      if(w!==null){
        if(!(w>=20 && w<=300)) aiSay('Hmm, I caught a weight but not the number. Could you say it again? For example, “my weight is 56 kg”.','मुझे वजन तो सुनाई दिया, पर नंबर साफ़ नहीं आया। एक बार फिर बोलिए, जैसे “मेरा वजन 56 किलो है”।',{cls:'warn'});
        else { var tb = trendBit(w), e = addWeight(todayKey(),w);
          if(e) aiSay(e,'',{cls:'warn'});
          else aiSay('Done'+first(true)+'! I’ve saved '+r1(w)+' kg for today at '+tNow()+'.'+tb[0],'हो गया! आज '+tNow()+' पर आपका वजन '+r1(w)+' किलो सेव कर दिया।'+tb[1],{cls:'ok',btn:['prog','See my progress','प्रोग्रेस देखें']}); }
      }
      if(hgt!==null){
        if(!(hgt>=100 && hgt<=250)) aiSay('I didn’t quite get your height. Try “170 cm” or “5 feet 7 inches”.','आपकी हाइट ठीक से समझ नहीं आई। ऐसे बोलिए: “170 सेंटीमीटर” या “5 फुट 7 इंच”।',{cls:'warn'});
        else { S.height = hgt; lsSet(S); applyProfile(true);
          aiSay('Got it, your height is now '+hgt+' cm. I’ve updated your calories and step numbers to match.','ठीक है, आपकी हाइट '+hgt+' सेंटीमीटर कर दी है। आपकी कैलोरी और स्टेप्स भी उसी हिसाब से अपडेट हो गए।',{cls:'ok',btn:['plan','Open my plan','मेरा प्लान खोलें']}); }
      }
      return;
    }
    var mu = null; for(var i=0;i<MUSC.length;i++){ if(MUSC[i][1].test(t)){ mu = MUSC[i]; break; } }
    if(EX_KEY.test(t) || (mu && !DIET_KEY.test(t))){
      if(mu){
        aiSay('Sure! Here are the best '+mu[2]+' exercises for you. Tap any one to see the demo and how to do it right.','ज़रूर! ये रहीं '+mu[3]+' के लिए सबसे अच्छी एक्सरसाइज़। किसी पर भी टैप करके सही तरीका और डेमो देखिए।',{cls:'ok',btn:['lib','Show exercises','एक्सरसाइज़ देखें',mu[0]],then:function(){ setTimeout(function(){ aiGo('lib',mu[0]) },1600); }});
      } else {
        if(needPlan()) return;
        aiSay('Here’s your workout plan for the week. If you want to work on one area, just tell me, like “chest” or “legs”.','ये रहा इस हफ़्ते का आपका वर्कआउट प्लान। किसी एक हिस्से पर काम करना हो तो बस बोलिए, जैसे “छाती” या “पैर”।',{cls:'ok',btn:['ex','Open my workouts','वर्कआउट खोलें'],then:function(){ setTimeout(function(){ aiGo('ex') },1800); }});
      }
      return;
    }
    if(DIET_KEY.test(t)){
      if(needPlan()) return;
      aiSay('Your diet plan is ready, built around your calorie and protein targets. Opening it for you now.','आपका डाइट प्लान तैयार है, आपकी कैलोरी और प्रोटीन के हिसाब से। अभी खोल देता हूँ।',{cls:'ok',btn:['diet','Open my diet','डाइट खोलें'],then:function(){ setTimeout(function(){ aiGo('diet') },1600); }});
      return;
    }
    if(STEP_KEY.test(t)){
      if(needPlan()) return;
      aiSay('Opening your step tracker.','आपका स्टेप ट्रैकर खोल रहा हूँ।',{cls:'ok',btn:['steps','Open steps','स्टेप्स खोलें'],then:function(){ setTimeout(function(){ aiGo('steps') },1400); }});
      return;
    }
    if(/(thank|thanks|thx|shukriya|dhanyawad|धन्यवाद|शुक्रिया|थैंक)/.test(t)){ aiSay('You’re welcome! I’m here whenever you need me.','आपका स्वागत है! जब भी ज़रूरत हो, बस बोलिए।',{fast:true}); return; }
    if(/(how are you|kaise ho|kaisa hai|कैसे हो|कैसे हैं)/.test(t)){ aiSay('I’m great, thanks for asking! How can I help with your fitness today?','मैं बढ़िया हूँ, पूछने के लिए शुक्रिया! आज फ़िटनेस में क्या मदद करूँ?',{fast:true}); return; }
    if(/(who are you|your name|kaun ho|कौन हो|तुम्हारा नाम|आपका नाम)/.test(t)){ aiSay('I’m KDN AI, your fitness assistant. I can log your weight, update your height, open your diet and find exercises for you.','मैं KDN AI हूँ, आपका फ़िटनेस असिस्टेंट। मैं आपका वजन सेव कर सकता हूँ, हाइट बदल सकता हूँ, डाइट खोल सकता हूँ और एक्सरसाइज़ बता सकता हूँ।',{fast:true}); return; }
    if(/(^| )(bye|goodbye|good night|alvida|अलविदा|बाय)( |$)/.test(t)){ aiSay('Bye'+first(true)+'! Keep it up, see you soon.','बाय! ऐसे ही लगे रहिए, फिर मिलते हैं।',{fast:true}); return; }
    if(/(^| )(hi|hii|hello|hey|namaste|namaskar|नमस्ते|नमस्कार|हेलो|हाय|help|madad|मदद|kya kar sakte|क्या कर सकते)( |$)/.test(t)){
      aiSay('Hi'+first(true)+'! You can tell me your weight or height, ask for your diet, or say which muscle you want to work on. What would you like to do?','नमस्ते! आप मुझे अपना वजन या हाइट बता सकते हैं, डाइट माँग सकते हैं, या बोलिए किस हिस्से की एक्सरसाइज़ चाहिए। बताइए, क्या करना है?',{fast:true});
      return;
    }
    aiConfused();
  }
  function openAI(){
    show('s-ai');
    if(!$('ai-log').children.length){ AI.hi = AI.lang==='hi-IN';
      aiSay('Hi'+first(true)+', I’m KDN AI. Tap the mic and just talk to me, like “my weight is 56 kg” or “make me a diet”.','नमस्ते'+(first()?' '+first():'')+', मैं KDN AI हूँ। माइक दबाइए और आराम से बोलिए, जैसे “मेरा वजन 56 किलो है” या “मेरे लिए डाइट बना दो”।',{fast:true,quiet:true}); }
  }
  function aiGo(a,v){
    if(curScreen!=='s-ai') return;
    if(a==='prog' || a==='diet' || a==='ex' || a==='steps') { if(S) openPlan(a); }
    else if(a==='plan'){ if(S) openPlan('today'); }
    else if(a==='lib'){ LB = {q:'',mu:v||'all',eq:'all',lv:'all',n:30}; show('s-library'); renderLibrary(); }
    else if(a==='setup'){ show('s-intro'); }
  }
  $('ai-log').addEventListener('click',function(ev){ var b = ev.target.closest('button[data-ai]'); if(!b) return; var a = b.getAttribute('data-ai'); if(a==='setup'){ show('s-intro'); return; } var s = curScreen; curScreen = 's-ai'; aiGo(a,b.getAttribute('data-v')); if(curScreen==='s-ai') curScreen = s; });
  $('ai-chips').addEventListener('click',function(ev){ var b = ev.target.closest('button'); if(b) aiHandle(b.textContent); });
  $('ai-form').addEventListener('submit',function(ev){ ev.preventDefault(); var v = $('ai-in').value.trim(); if(!v){ $('ai-in').focus(); return; } $('ai-in').value = ''; aiHandle(v); });
  Array.prototype.forEach.call(document.querySelectorAll('.ailang button'),function(b){
    b.addEventListener('click',function(){ AI.lang = b.getAttribute('data-lang'); Array.prototype.forEach.call(b.parentNode.children,function(x){ var on = x===b; x.classList.toggle('on',on); x.setAttribute('aria-pressed',on); }); });
  });
  function aiState(txt){ $('ai-state').textContent = txt; }
  function aiStop(){ AI.on = false; $('ai-mic').classList.remove('on'); $('ai-mic').setAttribute('aria-label','Tap to speak'); }
  var silenceT = null;
  $('ai-mic').addEventListener('click',function(){
    if(AI.on && AI.rec){ try{ AI.rec.stop(); }catch(e){} return; }
    var hiUI = AI.lang==='hi-IN';
    if(!SR){ AI.hi = hiUI; aiSay('Voice isn’t available in this browser, but you can type your request in the box below.','इस ब्राउज़र में आवाज़ वाला फ़ीचर नहीं चलता, पर आप नीचे बॉक्स में लिखकर भेज सकते हैं।',{cls:'warn',then:aiHL}); return; }
    try{ if(window.speechSynthesis) speechSynthesis.cancel(); }catch(e){}
    var rec = new SR(); AI.rec = rec; AI.heard = '';
    rec.lang = AI.lang; rec.interimResults = true; rec.maxAlternatives = 1; rec.continuous = true;
    rec.onstart = function(){ AI.on = true; $('ai-mic').classList.add('on'); $('ai-mic').setAttribute('aria-label','Stop listening'); aiState(hiUI ? 'सुन रहा हूँ… बोलिए' : 'Listening… go ahead'); $('ai-live').hidden = true; };
    rec.onresult = function(ev){
      var s = ''; for(var i=0;i<ev.results.length;i++) s += ev.results[i][0].transcript+' ';
      AI.heard = s.trim(); var l = $('ai-live'); l.textContent = '“'+AI.heard+'”'; l.hidden = false;
      /* stop on its own after a natural pause, like a person waiting for you to finish */
      clearTimeout(silenceT); silenceT = setTimeout(function(){ try{ rec.stop(); }catch(e){} }, 1400);
    };
    rec.onerror = function(ev){
      clearTimeout(silenceT); aiStop(); aiState(hiUI ? 'माइक दबाइए और बोलिए' : 'Tap the mic and speak'); AI.hi = hiUI;
      if(ev.error==='not-allowed' || ev.error==='service-not-allowed') aiSay('I can’t reach the microphone here. Please allow mic access, or just type below.','यहाँ माइक नहीं मिल रहा। माइक की अनुमति दीजिए, या नीचे लिखकर भेज दीजिए।',{cls:'warn',then:aiHL});
      else if(ev.error==='no-speech') aiSay('I didn’t hear anything. Tap the mic and try again whenever you’re ready.','मुझे कुछ सुनाई नहीं दिया। जब तैयार हों, माइक दबाकर फिर से बोलिए।',{cls:'warn',fast:true});
      else if(ev.error!=='aborted') aiConfused();
      AI.heard = '';
    };
    rec.onend = function(){
      clearTimeout(silenceT);
      var was = AI.on; aiStop(); aiState(hiUI ? 'माइक दबाइए और बोलिए' : 'Tap the mic and speak'); $('ai-live').hidden = true;
      if(was && AI.heard.trim()) aiHandle(AI.heard.trim()); AI.heard = '';
    };
    try{ rec.start(); }catch(e){ aiStop(); aiConfused(); }
  });


