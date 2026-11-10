  /* ---------- Dish library: filters, pictures, day menus and dish pages ---------- */
  var BUDGET = {low:1,mid:2,high:3};
  var BUDGET_NAME = {low:'Low · ₹',mid:'Medium · ₹₹',high:'High · ₹₹₹'};
  var AVOID_OPTS = {dairy:'Dairy',gluten:'Gluten',nuts:'Nuts',soy:'Soy',egg:'Egg',fish:'Fish'};
  function avoidFor(diet){return diet==='vegan' ? ['gluten','nuts','soy'] : diet==='veg' ? ['dairy','gluten','nuts','soy'] : ['dairy','gluten','nuts','soy','egg','fish']}
  var CATN = {b:'Breakfast',l:'Lunch',d:'Dinner',s:'Snacks'};
  var DIETN = {v:'Vegan',g:'Vegetarian',n:'Non-vegetarian'};
  var SLOTSETS = {
    5:[['Breakfast','breakfast',0.25,'b'],['Mid-morning snack','am',0.10,'s'],['Lunch','lunch',0.30,'l'],['Evening snack','pm',0.10,'s'],['Dinner','dinner',0.25,'d']],
    4:[['Breakfast','breakfast',0.25,'b'],['Lunch','lunch',0.35,'l'],['Evening snack','pm',0.10,'s'],['Dinner','dinner',0.30,'d']],
    3:[['Breakfast','breakfast',0.30,'b'],['Lunch','lunch',0.40,'l'],['Dinner','dinner',0.30,'d']]
  };
  function dietOk(x,diet){return diet==='vegan' ? x.d==='v' : diet==='veg' ? x.d!=='n' : true}
  function eligible(x,o){
    var pr = o.prefs;
    if(!dietOk(x,o.diet)) return false;
    if(x.pr > BUDGET[o.budget]) return false;
    if(pr.avoid.some(function(a){return x.a.indexOf(a)>=0})) return false;
    if(pr.quick && x.q > 15) return false;
    if(pr.protein && x.p*4/x.k < 0.2) return false;
    return true;
  }
  function mTxt(m){return (Math.abs(m-Math.round(m))<0.001 ? String(Math.round(m)) : m.toFixed(1))}
  function priceTxt(x){return x.pr===1 ? '₹ low' : x.pr===2 ? '₹₹ medium' : '₹₹₹ higher'}
  function nutOf(ing,m){
    var t = {k:0,p:0,c:0,f:0,fi:0,cost:3*m};
    ing.forEach(function(it){var g=ING[it[0]], w=it[1]*m/100; t.k+=g[1]*w; t.p+=g[2]*w; t.c+=g[3]*w; t.f+=g[4]*w; t.fi+=g[5]*w; t.cost+=g[6]*w});
    return t;
  }
  /* Protein top-ups, used only when the day's dishes fall short of the protein target. */
  var TOPL = {
    vegan:[{n:'Roasted soya chunks',s:'30 g dry',ing:[['soya',30]],note:'Soak in hot water, squeeze, then pan roast with pepper and salt.',max:6},{n:'Tofu scramble',s:'150 g',ing:[['tofu',150]],note:'Crumble and cook with turmeric, pepper and salt.',max:3}],
    veg:[{n:'Whey protein shake',s:'1 scoop (30 g) in water',ing:[['whey',30]],note:'Mix with water or milk.',max:2},{n:'Greek yogurt',s:'200 g',ing:[['greek',200]],note:'Plain, unsweetened. Add fruit if you like.',max:2}],
    nonveg:[{n:'Grilled chicken breast',s:'100 g raw weight',ing:[['chicken',100]],note:'Grill or pan cook with pepper and salt until no pink remains.',max:3},{n:'Whey protein shake',s:'1 scoop (30 g) in water',ing:[['whey',30]],note:'Mix with water or milk.',max:2}]
  };
  Object.keys(TOPL).forEach(function(k){TOPL[k].forEach(function(t){var n=nutOf(t.ing,1); t.k=n.k; t.p=n.p; t.c=n.c; t.f=n.f; t.fi=n.fi; t.cost=n.cost})});

  /* ---- pictures: drawn illustrations of each dish ---- */
  var PICS = {
    bowl:function(a,b){return '<ellipse cx="40" cy="71" rx="26" ry="3" fill="#0000001A"/><path d="M8 38H72A32 30 0 0 1 8 38Z" fill="#5878B4"/><path d="M12 44H68" stroke="#FFFFFF55" stroke-width="2"/>'+
      '<path d="M13 38Q40 4 67 38Z" fill="'+a+'" stroke="#00000022" stroke-width="1.4"/><path d="M22 30Q31 17 45 14" stroke="#FFFFFF77" stroke-width="3" fill="none" stroke-linecap="round"/>'+
      '<circle cx="31" cy="30" r="3" fill="'+b+'"/><circle cx="45" cy="24" r="3.2" fill="'+b+'"/><circle cx="53" cy="32" r="2.6" fill="'+b+'"/><circle cx="38" cy="34" r="2.2" fill="'+b+'"/>'+
      '<ellipse cx="40" cy="38" rx="32" ry="6" fill="none" stroke="#3E5A92" stroke-width="2"/><path d="M26 66h28" stroke="#3E5A92" stroke-width="4" stroke-linecap="round"/>'},
    plate:function(a,b){return '<ellipse cx="40" cy="70" rx="32" ry="3" fill="#0000001A"/><ellipse cx="40" cy="46" rx="36" ry="25" fill="#fff" stroke="#CBD2DC" stroke-width="2"/><ellipse cx="40" cy="46" rx="26" ry="17" fill="#F1F4F9"/>'+
      '<ellipse cx="33" cy="44" rx="17" ry="11" fill="'+a+'" stroke="#00000026" stroke-width="1.6"/><path d="M22 41Q30 34 40 36" stroke="#FFFFFF77" stroke-width="2.4" fill="none" stroke-linecap="round"/>'+
      '<ellipse cx="55" cy="50" rx="9" ry="6" fill="'+b+'" stroke="#00000022" stroke-width="1.4"/><circle cx="53" cy="36" r="4" fill="'+b+'"/><circle cx="58" cy="40" r="3" fill="'+b+'"/><path d="M28 50L34 54L40 49" stroke="#00000022" stroke-width="1.4" fill="none"/>'},
    glass:function(a,b){return '<ellipse cx="40" cy="73" rx="20" ry="3" fill="#0000001A"/><path d="M22 10H58L53 70H27Z" fill="#EAF2FB" stroke="#9DB2CE" stroke-width="2"/><path d="M24.5 24H55.5L52.5 70H27.5Z" fill="'+a+'"/>'+
      '<path d="M24 24Q32 18 40 24T56 24V20Q48 14 40 20T24 20Z" fill="'+b+'"/><path d="M30 34L28.6 62" stroke="#FFFFFF88" stroke-width="3" stroke-linecap="round"/><path d="M46 8L52 -2" stroke="#E5483B" stroke-width="3" stroke-linecap="round"/>'},
    toast:function(a,b){return '<ellipse cx="40" cy="73" rx="30" ry="3" fill="#0000001A"/><path d="M8 66V36A11 11 0 0 1 12 18H34A11 11 0 0 1 38 36V66Z" fill="#E8C48A" stroke="#C99A55" stroke-width="2.2"/><path d="M13 60V37A6 6 0 0 1 16 23H30A6 6 0 0 1 33 37V60Z" fill="'+a+'"/>'+
      '<path d="M40 66V36A11 11 0 0 1 44 18H66A11 11 0 0 1 70 36V66Z" fill="#E8C48A" stroke="#C99A55" stroke-width="2.2"/><path d="M45 60V37A6 6 0 0 1 48 23H62A6 6 0 0 1 65 37V60Z" fill="'+a+'"/>'+
      '<circle cx="22" cy="34" r="3" fill="'+b+'"/><circle cx="24" cy="48" r="2.6" fill="'+b+'"/><circle cx="54" cy="32" r="3" fill="'+b+'"/><circle cx="55" cy="46" r="2.6" fill="'+b+'"/>'},
    disc:function(a,b){return '<ellipse cx="38" cy="71" rx="30" ry="3" fill="#0000001A"/><circle cx="38" cy="42" r="30" fill="'+a+'" stroke="#00000030" stroke-width="2"/><circle cx="38" cy="42" r="21" fill="none" stroke="#FFFFFF55" stroke-width="2"/>'+
      '<circle cx="26" cy="34" r="3.6" fill="'+b+'"/><circle cx="44" cy="30" r="3.2" fill="'+b+'"/><circle cx="48" cy="48" r="3.8" fill="'+b+'"/><circle cx="30" cy="52" r="3" fill="'+b+'"/><circle cx="38" cy="42" r="2.4" fill="'+b+'"/>'+
      '<circle cx="66" cy="62" r="10" fill="'+b+'" stroke="#00000030" stroke-width="2"/><circle cx="66" cy="62" r="6" fill="#FFFFFF44"/>'},
    fruit:function(a,b){return '<ellipse cx="40" cy="72" rx="26" ry="3" fill="#0000001A"/><path d="M28 24C18 16 6 24 8 42C10 58 22 68 30 62C38 68 50 60 52 42C54 24 40 16 28 24Z" fill="'+a+'" stroke="#00000030" stroke-width="2"/><path d="M28 24Q28 12 36 8" stroke="#6D4C1F" stroke-width="3.2" fill="none" stroke-linecap="round"/><path d="M34 14Q44 8 48 16Q38 22 34 14Z" fill="'+b+'"/>'+
      '<path d="M16 34Q18 28 24 28" stroke="#FFFFFF88" stroke-width="3" fill="none" stroke-linecap="round"/><path d="M52 60Q58 40 72 36Q76 56 62 68Q56 68 52 60Z" fill="'+a+'" stroke="#00000030" stroke-width="2"/><path d="M58 58Q62 48 68 44" stroke="#FFFFFF88" stroke-width="2" fill="none"/>'},
    egg:function(a,b){return '<ellipse cx="40" cy="70" rx="32" ry="3" fill="#0000001A"/><ellipse cx="40" cy="46" rx="34" ry="24" fill="#fff" stroke="#CBD2DC" stroke-width="2"/>'+
      '<ellipse cx="26" cy="44" rx="13" ry="17" fill="#fff" stroke="#C9CFD8" stroke-width="2"/><circle cx="26" cy="46" r="7" fill="'+a+'"/><circle cx="23.6" cy="43.6" r="2" fill="#FFFFFF77"/>'+
      '<ellipse cx="54" cy="44" rx="13" ry="17" fill="#fff" stroke="#C9CFD8" stroke-width="2"/><circle cx="54" cy="46" r="7" fill="'+a+'"/><circle cx="51.6" cy="43.6" r="2" fill="#FFFFFF77"/>'+
      '<circle cx="40" cy="62" r="3" fill="'+b+'"/><circle cx="46" cy="64" r="2.4" fill="'+b+'"/><circle cx="34" cy="64" r="2.4" fill="'+b+'"/>'},
    beans:function(a,b){var e='<ellipse cx="40" cy="71" rx="30" ry="3" fill="#0000001A"/><path d="M8 40H72A32 28 0 0 1 8 40Z" fill="#5878B4"/>';
      [[24,36,-20],[40,30,15],[56,36,-35],[32,44,30],[50,46,-10],[20,46,50],[62,46,25]].forEach(function(p){e+='<ellipse cx="'+p[0]+'" cy="'+p[1]+'" rx="9" ry="6.4" transform="rotate('+p[2]+' '+p[0]+' '+p[1]+')" fill="'+a+'" stroke="#00000030" stroke-width="1.4"/>'});
      return e+'<circle cx="40" cy="26" r="3.4" fill="'+b+'"/><circle cx="30" cy="28" r="2.6" fill="'+b+'"/><circle cx="50" cy="28" r="2.6" fill="'+b+'"/><ellipse cx="40" cy="40" rx="32" ry="5" fill="none" stroke="#3E5A92" stroke-width="2"/>'}
  };
  /* Real dish photos (first 10 dishes); everything else keeps its drawn picture */
  var DPH = {"poha": "assets/img/d76d72c7684f.webp", "idlisambar": "assets/img/094866d06b29.webp", "masaladosa": "assets/img/b42e31698e42.webp", "paneerparatha": "assets/img/52ffe47d0b6f.webp", "eggbhurji": "assets/img/4c3fffd5f117.webp", "rajmachawal": "assets/img/aa56a12c279e.webp", "dalrice": "assets/img/174ab854f48c.webp", "cholerotis": "assets/img/41896024061e.webp", "chickencurry": "assets/img/46af6aa10717.webp", "palakpaneer": "assets/img/446f8f5b211c.webp", "kadhi": "assets/img/8af2cee56b10.webp", "moongkhichdi": "assets/img/44d52f1bbf8b.webp", "fishcurry": "assets/img/88d734c1d7fe.webp", "eggcurry": "assets/img/4568d35a4f58.webp", "oatsbanana": "assets/img/78666381a285.webp", "daltadkacurd": "assets/img/e9978ccfc4ee.webp", "paneercurry": "assets/img/ba1e12e13be0.webp", "omeletteroti": "assets/img/9958b646312a.webp", "besanchilla": "assets/img/bdc10e60e68f.webp", "upma": "assets/img/985efec8c500.webp", "paneerbhurji": "assets/img/4bbe170c1b20.webp", "dalia": "assets/img/1e5af54fc725.webp", "mchillacurd": "assets/img/36ad185c9664.webp", "boiledeggs": "assets/img/23875eb5a1b5.webp", "soyacurry": "assets/img/33637ad70aa5.webp", "mixdalroti": "assets/img/a8ed6068572a.webp", "curdrice": "assets/img/8a4906566ae7.webp", "vegpulao": "assets/img/64a85025d823.webp", "sambarrice": "assets/img/32bb4ab52e9c.webp", "grilledchickenroti": "assets/img/6a42841ecf3d.webp", "chickenbiryani": "assets/img/394d72a3a33f.webp", "prawnrice": "assets/img/e6329a7e5575.webp", "sproutschaat": "assets/img/9054a6db25e9.webp", "moongroti": "assets/img/b3a6b47860e4.webp", "paneertikka": "assets/img/7c3c13685794.webp", "roastedchana": "assets/img/2545b548d5b1.webp", "chaaschana": "assets/img/49cd92b04bf7.webp", "greeksnack": "assets/img/9c71a7779a0e.webp", "fruitbowl": "assets/img/c9f6270b7c5a.webp", "chickentikkasnack": "assets/img/e39935badf91.webp", "masalaoats": "assets/img/c15db7d0f755.webp", "pbbanana": "assets/img/3829236cabc3.webp", "vegomelette": "assets/img/cb8907f0045a.webp", "chickensandwich": "assets/img/9246938aacef.webp", "palakchana": "assets/img/55ae250425ca.webp", "mushroompeas": "assets/img/018b67f44baf.webp", "chanawrap": "assets/img/60ec1a21b989.webp", "vegbiryani": "assets/img/314a129c1a89.webp", "rajmacurd": "assets/img/9706c7a0bb47.webp", "eggcurryroti": "assets/img/5555f52f943e.webp", "tofutoast": "assets/img/6c808bb110d5.webp", "paneerchilla": "assets/img/7e42514cdb4c.webp", "milkdalia": "assets/img/6f9401c31fb7.webp", "ragiporridge": "assets/img/deaf2246770b.webp", "greekparfait": "assets/img/8a4ccf40ddea.webp", "laukichana": "assets/img/b6eff40a4599.webp", "milletdal": "assets/img/6e70574acf17.webp", "chickenstirfry": "assets/img/ebb93b95c53b.webp", "fishtikkaquinoa": "assets/img/84bb228b4daf.webp", "palakpaneer1": "assets/img/464150e80f87.webp", "sproutsbowl": "assets/img/9705482405f9.webp", "vegsandwich": "assets/img/60f230d2dece.webp", "stuffedparatha": "assets/img/8014929a79f2.webp", "chiapudding": "assets/img/92e45dad856b.webp", "tunatoast": "assets/img/b6a75c8f3d49.webp", "eggoats": "assets/img/471a0ff8305c.webp", "quinoabowl": "assets/img/12f607ff801f.webp", "tofurice": "assets/img/2f32fa3fe2a4.webp", "rajmacorn": "assets/img/13d157659338.webp", "paneerricebowl": "assets/img/88f232539e9d.webp", "vegkhichdi": "assets/img/44d52f1bbf8b.webp", "moongchilla": "assets/img/fe47ba53cbf8.webp", "spchaat": "assets/img/a803cf867d74.webp", "soysmoothie": "assets/img/6728d89995ae.webp", "overnightoats": "assets/img/5b8ade19376b.webp", "eggwrap": "assets/img/00f7abe26b97.webp", "moongcabbage": "assets/img/b4c36868504f.webp", "tunabowl": "assets/img/7b4a77507719.webp", "soyakeema": "assets/img/275fb1c5e420.webp", "tofubhurjiroti": "assets/img/22168f37d94f.webp", "soupchana": "assets/img/ed4e90ac5863.webp", "idlisambar4": "assets/img/094866d06b29.webp", "rajmaquinoa": "assets/img/07de8047d5ea.webp", "masoorsoup": "assets/img/a1775f2ac466.webp", "palakdalroti": "assets/img/96133f147e90.webp", "chanadalroti": "assets/img/030f74088fea.webp", "tofustirroti": "assets/img/0e580e13dbef.webp", "jowarrajma": "assets/img/f7877e661af2.webp", "pumpkinchana": "assets/img/07951c3fdef1.webp", "peaspulao": "assets/img/d0ac13f0fb82.webp", "ragithoran": "assets/img/3061ae48c13b.webp", "spchanabowl": "assets/img/2a37f100b805.webp", "paneerbhurjiroti": "assets/img/4bbe170c1b20.webp", "khichdicurd": "assets/img/44d52f1bbf8b.webp", "daliyadinner": "assets/img/8eea080fecfa.webp", "daltadkaroti": "assets/img/9944d82e6680.webp", "paneerquinoa": "assets/img/2542eafdafec.webp", "grilledchickenveg": "assets/img/880c0d0a9a71.webp", "fishtikkaroti": "assets/img/9b2be8ca340f.webp", "chickensoup": "assets/img/b6dbd8961088.webp", "prawnquinoa": "assets/img/db67b8803d79.webp", "salmonrice": "assets/img/2f5ca9d6c412.webp", "chickentikkabowl": "assets/img/4c06bb849acd.webp", "eggwhiteroti": "assets/img/5fd9f2f58c8d.webp", "makhanasnack": "assets/img/fa9c76930e71.webp", "peanutsnack": "assets/img/02eb20bde5ba.webp", "bananapb": "assets/img/03ec015349d7.webp", "sattudrink": "assets/img/0293c9fb59e3.webp", "soydates": "assets/img/6b753c2f7450.webp", "vegsoup": "assets/img/6d007b509740.webp", "hummussticks": "assets/img/12acd05c420a.webp", "cornchaat": "assets/img/eceb4108f11b.webp", "soyachaat": "assets/img/86b0bdc9124d.webp", "datebites": "assets/img/a89ea9208fae.webp", "orangepom": "assets/img/4438b448f158.webp", "besancheela": "assets/img/9c5455123b0f.webp", "chiasoy": "assets/img/a13ebf71d29b.webp", "ragimalt": "assets/img/b0bfdcd4bc6e.webp", "paneercubes": "assets/img/4f63f98b4485.webp", "milkdates": "assets/img/8d831d9615b6.webp", "curdchia": "assets/img/15964992ca45.webp", "paneertikkasnack": "assets/img/24ef35ae57f3.webp", "wheyshake": "assets/img/975f41816c2e.webp", "boiled2eggs": "assets/img/0421c3f6c251.webp", "eggwhitebhurji": "assets/img/952b01d5ee2f.webp", "tunacucumber": "assets/img/aa5bf08bc725.webp", "chickensoupsnack": "assets/img/68b580e27280.webp", "eggsprouts": "assets/img/8bb151c4d5b8.webp", "fishbites": "assets/img/6cc25e541371.webp", "sabudanakhichdi": "assets/img/4b9446713a98.webp", "semiyaupma": "assets/img/4a55059c62d3.webp", "alooparatha": "assets/img/93a9c4d70b1e.webp", "methithepla": "assets/img/12175240f560.webp", "pesarattu": "assets/img/bea71d2dc615.webp", "ragidosa": "assets/img/0f64469c176d.webp", "sproutsusal": "assets/img/bc83baf88abf.webp", "bananapancake": "assets/img/94296ee6b0e7.webp", "soojicheela": "assets/img/15b581f93cba.webp", "khamandhokla": "assets/img/aa335f44db3b.webp", "uttapam": "assets/img/99c8f7b17caa.webp", "besantoast": "assets/img/102078e54aa9.webp", "soyapoha": "assets/img/aff840f7d8a0.webp", "aloosandwich": "assets/img/4d5f31657041.webp", "aloogobidal": "assets/img/b5dbd7f0b01e.webp", "bhindidal": "assets/img/a4a6a281d8a9.webp", "bainganbharta": "assets/img/2d77954a37bf.webp", "kalachanarice": "assets/img/8b7a30531777.webp", "lobiaroti": "assets/img/430942418210.webp", "aloomatar": "assets/img/e97a40670f01.webp", "masoorjeera": "assets/img/ef2b6b5dc393.webp", "rajmaroti": "assets/img/141823129318.webp", "lemonrice": "assets/img/3e53d7c8aabf.webp", "methialoobajra": "assets/img/de9057efca34.webp", "mixvegdal": "assets/img/bcaf4461ed11.webp", "soyapulao": "assets/img/8fa1647af836.webp", "pavbhaji": "assets/img/db5fddbc4ee3.webp", "cholechawal": "assets/img/16affe053b09.webp", "laukimoong": "assets/img/a6f2d78fb8bc.webp", "cabbagematar": "assets/img/87d094f876c0.webp", "tomatodal": "assets/img/aff5db69e761.webp", "kalachanaroti": "assets/img/c26e47211972.webp", "lobiarice": "assets/img/3235d3426399.webp", "aloobaingan": "assets/img/1c2ada9b0b24.webp", "pumpkindal": "assets/img/d2a8eb803e40.webp", "rasamrice": "assets/img/09ba6d41c613.webp", "bhindijowar": "assets/img/b8b0e46e0d0d.webp", "soyacurryroti": "assets/img/3babe3ba1413.webp", "mushroompulao": "assets/img/35d345d73c50.webp", "tofupalak": "assets/img/059b7671c595.webp", "gobimatar": "assets/img/941022f2a01d.webp", "daldhokli": "assets/img/0715a4ac4303.webp", "kadaiveg": "assets/img/6b29cc8457bc.webp", "chanapeanut": "assets/img/b30b4511964c.webp", "kalachanachaat": "assets/img/6452eb6289d6.webp", "sproutsbhel": "assets/img/a4882c27b65d.webp", "guavachaat": "assets/img/94b1ff5f9ced.webp", "watermelonbowl": "assets/img/e6dbfe4a36eb.webp", "pohachivda": "assets/img/f748babcc299.webp", "chanasundal": "assets/img/9d1afc5712ce.webp", "bhutta": "assets/img/afa7c9259a46.webp", "peanutchikki": "assets/img/02eda3a37cba.webp", "dateladoo": "assets/img/a17ad61ab746.webp", "soybananashake": "assets/img/81909d0c0033.webp", "vegsticks": "assets/img/42f0de1ecace.webp", "spchaatsnack": "assets/img/7244d9d5fcfd.webp"};
  var DPHD = {};
  var DPHI = {"poha": "assets/img/bcf149d0101b.webp", "idlisambar": "assets/img/011573cf385c.webp", "masaladosa": "assets/img/d9c1bd39dae6.webp", "paneerparatha": "assets/img/c055f682ed72.webp", "eggbhurji": "assets/img/e942b3cab69a.webp", "rajmachawal": "assets/img/8f9edbd6ff26.webp", "dalrice": "assets/img/2afc953b7430.webp", "cholerotis": "assets/img/b8b52de12e45.webp", "chickencurry": "assets/img/0a1804c146b8.webp", "palakpaneer": "assets/img/de6cc4a46768.webp", "kadhi": "assets/img/fb8769de5a24.webp", "moongkhichdi": "assets/img/b147f28450f6.webp", "fishcurry": "assets/img/b8429bc09fe2.webp", "eggcurry": "assets/img/b217162fee3c.webp", "oatsbanana": "assets/img/b984c2cb514a.webp", "daltadkacurd": "assets/img/323febfdbb61.webp", "paneercurry": "assets/img/dc267cbb1f30.webp", "omeletteroti": "assets/img/a9d2112c8485.webp", "besanchilla": "assets/img/c1a9b3b28bc7.webp", "upma": "assets/img/18aeb67fe131.webp", "paneerbhurji": "assets/img/d57c5cfa878e.webp", "dalia": "assets/img/a004300d6863.webp", "mchillacurd": "assets/img/bb8de3422517.webp", "boiledeggs": "assets/img/2d63e9f2aa9d.webp", "soyacurry": "assets/img/7a75981eb4bc.webp", "mixdalroti": "assets/img/5dcd9d35b9a2.webp", "curdrice": "assets/img/7976a918c7af.webp", "vegpulao": "assets/img/8da039d89b1b.webp", "sambarrice": "assets/img/5445d71de7e9.webp", "grilledchickenroti": "assets/img/1996f0fb96c2.webp", "chickenbiryani": "assets/img/f973735caf31.webp", "prawnrice": "assets/img/ceddf10bd98e.webp", "sproutschaat": "assets/img/2dd275567900.webp", "moongroti": "assets/img/6ab72b2fc369.webp", "paneertikka": "assets/img/45842e82bcac.webp", "roastedchana": "assets/img/b8d79c045b4e.webp", "chaaschana": "assets/img/4e3b129ca1f3.webp", "greeksnack": "assets/img/01bbadc9f9c0.webp", "fruitbowl": "assets/img/83682262ca6c.webp", "chickentikkasnack": "assets/img/972b7d3cb7a6.webp", "masalaoats": "assets/img/622826071cab.webp", "pbbanana": "assets/img/ff7e66e573b8.webp", "vegomelette": "assets/img/3117dd21133a.webp", "chickensandwich": "assets/img/90eea2430b79.webp", "palakchana": "assets/img/d5b7da9fcff0.webp", "mushroompeas": "assets/img/a569952ce8c4.webp", "chanawrap": "assets/img/dfdbd5ffd179.webp", "vegbiryani": "assets/img/08638752502e.webp", "rajmacurd": "assets/img/9bc6d2e7677c.webp", "eggcurryroti": "assets/img/c552a69e20bc.webp", "tofutoast": "assets/img/2b893fc9392b.webp", "paneerchilla": "assets/img/6ea876689966.webp", "milkdalia": "assets/img/3b8bdfecfe14.webp", "ragiporridge": "assets/img/7ae3a77f3d66.webp", "greekparfait": "assets/img/af7b5494596a.webp", "laukichana": "assets/img/ac42ae358a88.webp", "milletdal": "assets/img/0d74fb48bf1a.webp", "chickenstirfry": "assets/img/291228b3eb7e.webp", "fishtikkaquinoa": "assets/img/e45ba5354854.webp", "palakpaneer1": "assets/img/baa1acbe0259.webp", "sproutsbowl": "assets/img/2c132437f7cc.webp", "vegsandwich": "assets/img/8d5137e20bb4.webp", "stuffedparatha": "assets/img/e7560da012e5.webp", "chiapudding": "assets/img/ec6ff6785229.webp", "tunatoast": "assets/img/76c55c237c82.webp", "eggoats": "assets/img/3be27f1adcab.webp", "quinoabowl": "assets/img/52606ad93f89.webp", "tofurice": "assets/img/cd7ca9594e98.webp", "rajmacorn": "assets/img/43122c58ac4d.webp", "paneerricebowl": "assets/img/666a07d9ded6.webp", "vegkhichdi": "assets/img/b147f28450f6.webp", "moongchilla": "assets/img/a95868c1917e.webp", "spchaat": "assets/img/5cb655c53d64.webp", "soysmoothie": "assets/img/2dcd3e7ef82e.webp", "overnightoats": "assets/img/8b6133d85979.webp", "eggwrap": "assets/img/46d65973569f.webp", "moongcabbage": "assets/img/352de34880b0.webp", "tunabowl": "assets/img/b7bfb3d265ab.webp", "soyakeema": "assets/img/7a0734478642.webp", "tofubhurjiroti": "assets/img/5b3980826005.webp", "soupchana": "assets/img/9959717a3ccd.webp", "idlisambar4": "assets/img/011573cf385c.webp", "rajmaquinoa": "assets/img/07eebb593076.webp", "masoorsoup": "assets/img/6f1a30feba6b.webp", "palakdalroti": "assets/img/f41b1e61c10c.webp", "chanadalroti": "assets/img/d9e922541dc2.webp", "tofustirroti": "assets/img/96ee6930b6fe.webp", "jowarrajma": "assets/img/1f347fd13281.webp", "pumpkinchana": "assets/img/79d6136c8127.webp", "peaspulao": "assets/img/6d879f776e8d.webp", "ragithoran": "assets/img/33c2b2fa9654.webp", "spchanabowl": "assets/img/58e133933c86.webp", "paneerbhurjiroti": "assets/img/d57c5cfa878e.webp", "khichdicurd": "assets/img/b147f28450f6.webp", "daliyadinner": "assets/img/658d9142706f.webp", "daltadkaroti": "assets/img/75692dfaf37f.webp", "paneerquinoa": "assets/img/a6bb464a4784.webp", "grilledchickenveg": "assets/img/265cf00e2876.webp", "fishtikkaroti": "assets/img/42a3bf8b37a2.webp", "chickensoup": "assets/img/e7d5de116cdb.webp", "prawnquinoa": "assets/img/8a83fd6154e0.webp", "salmonrice": "assets/img/7d4643b8654a.webp", "chickentikkabowl": "assets/img/edb28c175d13.webp", "eggwhiteroti": "assets/img/55b1fc079a51.webp", "makhanasnack": "assets/img/8d1a599d724d.webp", "peanutsnack": "assets/img/29a6f7237f37.webp", "bananapb": "assets/img/34e1b82ae025.webp", "sattudrink": "assets/img/79288b0cc3fc.webp", "soydates": "assets/img/af9b6756be7a.webp", "vegsoup": "assets/img/20babc56f7cd.webp", "hummussticks": "assets/img/4eb378760498.webp", "cornchaat": "assets/img/a73f517f7723.webp", "soyachaat": "assets/img/eab07a249ebc.webp", "datebites": "assets/img/235c777e1c07.webp", "orangepom": "assets/img/3eb4690a18e1.webp", "besancheela": "assets/img/4ae9d20ee09a.webp", "chiasoy": "assets/img/8d65d3526f79.webp", "ragimalt": "assets/img/18f9087e8362.webp", "paneercubes": "assets/img/39cd48c38baf.webp", "milkdates": "assets/img/db49ff7665f8.webp", "curdchia": "assets/img/c1aba0865a9e.webp", "paneertikkasnack": "assets/img/13b88952143b.webp", "wheyshake": "assets/img/fa9e23b62533.webp", "boiled2eggs": "assets/img/c2dc71e08b6a.webp", "eggwhitebhurji": "assets/img/c82a0d41103e.webp", "tunacucumber": "assets/img/b8c7cb7e38ad.webp", "chickensoupsnack": "assets/img/353ed1215294.webp", "eggsprouts": "assets/img/1228ed87ea1b.webp", "fishbites": "assets/img/a3470c8b71c7.webp", "sabudanakhichdi": "assets/img/406de83e9b4e.webp", "semiyaupma": "assets/img/ab21b9c9ef81.webp", "alooparatha": "assets/img/b01444f733d0.webp", "methithepla": "assets/img/51c793399f75.webp", "pesarattu": "assets/img/a6f5bf41c1fe.webp", "ragidosa": "assets/img/e17b2db0f223.webp", "sproutsusal": "assets/img/c2af1cb11a52.webp", "bananapancake": "assets/img/0b85bef7a933.webp", "soojicheela": "assets/img/0204f02c18f6.webp", "khamandhokla": "assets/img/5ac22304d50a.webp", "uttapam": "assets/img/a7c521b29b10.webp", "besantoast": "assets/img/b618d1addaba.webp", "soyapoha": "assets/img/6f46aee89559.webp", "aloosandwich": "assets/img/5ad775ba0050.webp", "aloogobidal": "assets/img/60ebb3a5c0d0.webp", "bhindidal": "assets/img/3e939fd84095.webp", "bainganbharta": "assets/img/0472b3a495dd.webp", "kalachanarice": "assets/img/02b89b43c1f4.webp", "lobiaroti": "assets/img/716c3d6c4ea3.webp", "aloomatar": "assets/img/1d5883d74dd2.webp", "masoorjeera": "assets/img/6898be0a9f0a.webp", "rajmaroti": "assets/img/1a9025645d78.webp", "lemonrice": "assets/img/5fcdb0989ba1.webp", "methialoobajra": "assets/img/200a800f23d7.webp", "mixvegdal": "assets/img/838f4de6a626.webp", "soyapulao": "assets/img/1ff4ed536a26.webp", "pavbhaji": "assets/img/486a8976a498.webp", "cholechawal": "assets/img/14379c3a996d.webp", "laukimoong": "assets/img/068566f2d809.webp", "cabbagematar": "assets/img/5b2b5384690e.webp", "tomatodal": "assets/img/13366757a976.webp", "kalachanaroti": "assets/img/d6f5c35a239a.webp", "lobiarice": "assets/img/32a9016d7206.webp", "aloobaingan": "assets/img/ad540e19705a.webp", "pumpkindal": "assets/img/41ee8c063efb.webp", "rasamrice": "assets/img/7fdd19d8823e.webp", "bhindijowar": "assets/img/df09eb991553.webp", "soyacurryroti": "assets/img/ef3f0ef616ff.webp", "mushroompulao": "assets/img/36a9a72fec08.webp", "tofupalak": "assets/img/e72038e7da2e.webp", "gobimatar": "assets/img/900d1bcd9f9b.webp", "daldhokli": "assets/img/f70557e01409.webp", "kadaiveg": "assets/img/8e58968cee18.webp", "chanapeanut": "assets/img/424692e9c308.webp", "kalachanachaat": "assets/img/e541311628ae.webp", "sproutsbhel": "assets/img/8f0dde0a7864.webp", "guavachaat": "assets/img/24fda16b306f.webp", "watermelonbowl": "assets/img/bbbfe15481ae.webp", "pohachivda": "assets/img/cc0fca6e830e.webp", "chanasundal": "assets/img/29407c66fc3a.webp", "bhutta": "assets/img/b01c514f9a8e.webp", "peanutchikki": "assets/img/ca385da5b2a0.webp", "dateladoo": "assets/img/3de6333eb500.webp", "soybananashake": "assets/img/374aea956df7.webp", "vegsticks": "assets/img/c2a116e952c0.webp", "spchaatsnack": "assets/img/1ef64eedf1fc.webp"};
  function dishPic(x){ if(DPH[x.id]) return '<img class="dph" src="'+DPH[x.id]+'"'+(DPHD[x.id]?' data-hd="'+DPHD[x.id]+'"':'')+' alt="" data-name="'+esc(x.n)+'" loading="lazy" decoding="async">'; var p = x.pic; return svg((PICS[p[0]]||PICS.bowl)(p[1],p[2])) }

  /* ---- day menu: pick dishes and portions so the day lands on your calories and protein ---- */
  function clampM(m){return Math.min(2.5,Math.max(0.5,Math.round(m*10)/10))}
  function slotTarget(r,sl){return r.target*sl[2]}
  function candidates(o,r,sl,dow,si){
    var forced = o.dsel && o.dsel[dow] && o.dsel[dow][sl[1]];
    if(forced && DISHMAP[forced] && dietOk(DISHMAP[forced],o.diet) && DISHMAP[forced].cat===sl[3]) return [DISHMAP[forced]];
    var tk = slotTarget(r,sl);
    var all = DISHES.filter(function(x){return !x.src && x.cat===sl[3] && eligible(x,o)});
    if(!all.length) all = DISHES.filter(function(x){return !x.src && x.cat===sl[3] && dietOk(x,o.diet)});
    var ok = all.filter(function(x){var m=tk/x.k; return m>=0.6 && m<=2.2});
    if(ok.length<6) ok = all.filter(function(x){var m=tk/x.k; return m>=0.5 && m<=2.5});
    if(ok.length<3) ok = all;
    function score(x){return r.dir==='gain' ? x.p*2+x.k/40 : x.p*4/x.k*100+x.fi/x.k*100}
    ok.sort(function(a,b){return score(b)-score(a) || (a.id<b.id?-1:1)});
    var top = ok.slice(0,Math.min(ok.length,16)), out = top.slice(0,3), rest = top.slice(3), start = rest.length ? (dow*3+si*2)%rest.length : 0;
    for(var i=0;i<Math.min(3,rest.length);i++) out.push(rest[(start+i)%rest.length]);
    return out;
  }
  var MPC = {};
  function mealPlan(o,r,dow){
    var ck = [dow,r.target,r.protein,o.diet,o.budget,o.prefs.meals,o.prefs.quick,o.prefs.protein,o.prefs.avoid.join(','),JSON.stringify(o.dsel&&o.dsel[dow]||{})].join('|');
    if(MPC[ck]) return MPC[ck];
    var slots = SLOTSETS[o.prefs.meals], lists = slots.map(function(sl,i){return candidates(o,r,sl,dow,i)});
    var tops = TOPL[o.diet], T = r.target, PT = r.protein, t1 = tops[0], t2 = tops[1];
    var best = null, idx = [], n = slots.length;
    function evalCombo(u1,u2){
      var tk = u1*t1.k+u2*t2.k, tp = u1*t1.p+u2*t2.p;
      if(tk > T*0.36) return;
      var avail = T - tk, K = tk, P = tp, edge = 0, ms = [];
      for(var i=0;i<n;i++){
        var x = lists[i][idx[i]], raw = avail*slots[i][2]/x.k, m = clampM(raw);
        if(m!==Math.round(raw*10)/10) edge++;
        ms.push(m); K += x.k*m; P += x.p*m;
      }
      var err = Math.abs(K-T)/T + 2.6*Math.max(0,PT-P)/PT + 0.5*Math.max(0,P-PT*1.3)/PT + 0.02*(u1+u2) + 0.04*edge;
      if(!best || err < best.err) best = {err:err,idx:idx.slice(),ms:ms,u1:u1,u2:u2,K:K,P:P};
    }
    (function rec(i){
      if(i===n){ for(var a=0;a<=t1.max;a++) for(var b=0;b<=t2.max;b++) evalCombo(a,b); return; }
      for(var j=0;j<lists[i].length;j++){
        var dup = false;
        for(var q=0;q<i;q++) if(lists[q][idx[q]]===lists[i][j]) dup = true;
        if(dup) continue;
        idx[i] = j; rec(i+1);
      }
    })(0);
    if(!best){ idx = lists.map(function(){return 0}); evalCombo(0,0); }
    var ms = best.ms.slice(), u1 = best.u1, u2 = best.u2;
    function total(){var K=u1*t1.k+u2*t2.k; for(var i=0;i<n;i++) K += lists[i][best.idx[i]].k*ms[i]; return K}
    for(var pass=0;pass<4;pass++){
      for(var i=0;i<n;i++){
        var cur = Math.abs(total()-T);
        [0.1,-0.1].forEach(function(dm){
          var nm = clampM(ms[i]+dm); if(nm===ms[i]) return;
          var old = ms[i]; ms[i] = nm;
          if(Math.abs(total()-T) < cur - 0.5) cur = Math.abs(total()-T); else ms[i] = old;
        });
      }
    }
    var res = {slots:[],tops:[],K:0,P:0,C:0,F:0,FI:0,cost:0};
    for(var k=0;k<n;k++){
      var d = lists[k][best.idx[k]], m = ms[k];
      var it = {sl:slots[k],x:d,m:m,k:d.k*m,p:d.p*m,c:d.c*m,f:d.f*m,fi:d.fi*m,cost:d.cost*m,forced:!!(o.dsel&&o.dsel[dow]&&o.dsel[dow][slots[k][1]])};
      res.slots.push(it); res.K+=it.k; res.P+=it.p; res.C+=it.c; res.F+=it.f; res.FI+=it.fi; res.cost+=it.cost;
    }
    [[t1,u1],[t2,u2]].forEach(function(q){ if(q[1]>0){ var t=q[0],u=q[1]; res.tops.push({t:t,u:u}); res.K+=u*t.k; res.P+=u*t.p; res.C+=u*t.c; res.F+=u*t.f; res.FI+=u*t.fi; res.cost+=u*t.cost; } });
    return MPC[ck] = res;
  }
  /* all dishes you can pick for a meal: those that fit your filters first, then the rest of your diet */
  function dishOptions(o,r,sl){
    var tk = slotTarget(r,sl);
    var all = DISHES.filter(function(x){return x.cat===sl[3] && dietOk(x,o.diet)});
    function by(a,b){return Math.abs(a.k-tk)-Math.abs(b.k-tk) || (a.id<b.id?-1:1)}
    var ph = function(x){return !!(typeof DPH!=='undefined' && DPH[x.id])};
    var a = all.filter(function(x){return ph(x) && eligible(x,o)}).sort(by), b = all.filter(function(x){return ph(x) && !eligible(x,o)}).sort(by);
    var c = all.filter(function(x){return !ph(x) && eligible(x,o)}).sort(by), d = all.filter(function(x){return !ph(x) && !eligible(x,o)}).sort(by);
    return a.map(function(x){return {x:x,ok:true}}).concat(b.map(function(x){return {x:x,ok:false}}),c.map(function(x){return {x:x,ok:true}}),d.map(function(x){return {x:x,ok:false}}));
  }
  function gramTxt(g){return g>=20 ? String(Math.round(g/5)*5) : String(Math.round(g))}
  function tagsHtml(x,m){
    if(x.src) return '<span class="tags"><i class="dt '+x.d+'">'+DIETN[x.d]+'</i><i>INDB</i></span>';
    return '<span class="tags"><i class="dt '+x.d+'">'+DIETN[x.d]+'</i><i>'+x.q+' min</i><i>'+priceTxt(x)+' · about ₹'+Math.round(x.cost*(m||1))+'</i></span>';
  }
  function numsHtml(k,p,c,f,fi){
    return '<div class="nums big"><div><b>'+Math.round(k)+'</b><small>kcal</small></div><div><b>'+r1(p)+'</b><small>Protein g</small></div><div><b>'+r1(c)+'</b><small>Carbs g</small></div><div><b>'+r1(f)+'</b><small>Fat g</small></div><div><b>'+r1(fi)+'</b><small>Fibre g</small></div></div>';
  }
  function dishBody(x,m,withRecipe){
    var h = '<div class="fdb"><div class="fdhero"><div class="fdpic">'+dishPic(x)+'</div><div class="fdt">'+tagsHtml(x,m)+'<p>'+(x.a.length ? 'Contains: '+x.a.join(', ') : 'No common allergens')+'.</p></div></div>';
    h += '<h5>Nutrition for your portion ('+mTxt(m)+' × '+esc(x.s)+')</h5>'+numsHtml(x.k*m,x.p*m,x.c*m,x.f*m,x.fi*m);
    h += '<p class="hint">One serving ('+esc(x.s)+'): '+x.k+' kcal, '+x.p+' g protein, '+x.c+' g carbs, '+x.f+' g fat, '+x.fi+' g fibre.'+(x.rich ? ' Rich in: '+esc(x.rich)+'.' : '')+'</p>';
    if(x.src){ h += '<h5>Ingredients for one serving</h5><ul class="ingr">'+(x.ix||[]).map(function(t){return '<li>'+esc(t)+'</li>'}).join('')+'</ul><p class="hint">Nutrition from the Indian Nutrient Databank (INDB), built on ICMR-NIN Indian Food Composition Tables. Amounts are approximate and change with oil and cooking.</p>'; return h+'</div>'; }
    if(DPHI[x.id]) h += '<figure class="ingph"><img src="'+DPHI[x.id]+'" alt="Raw ingredients for one serving of '+esc(x.n)+'" loading="lazy"><figcaption>Ingredients for one serving</figcaption></figure>';
    h += '<h5>Ingredients for your portion</h5><ul class="ingr">'+x.ing.map(function(it){return '<li>'+gramTxt(it[1]*m)+' g '+esc(ING[it[0]][0].toLowerCase())+'</li>'}).join('')+'</ul><p class="hint">Weights are raw or dry, before cooking. Add salt, spices, lemon and water as needed. They add almost no calories.</p>';
    if(withRecipe!==false) h += '<h5>Recipe · '+x.q+' min</h5><ol class="rsteps">'+x.rec.map(function(s){return '<li>'+esc(s)+'</li>'}).join('')+'</ol>';
    return h+'</div>';
  }
  function dishCard(x){
    return '<details class="food dcard"><summary><span class="pic">'+dishPic(x)+'</span><span class="body"><h4>'+esc(x.n)+'</h4><span class="tags"><i class="dt '+x.d+'">'+DIETN[x.d]+'</i>'+(x.q?'<i>'+x.q+' min</i>':'<i>INDB</i>')+'</span><span class="sv">'+esc(x.s)+' · '+x.k+' kcal · '+x.p+' g protein</span></span></summary>'+dishBody(x,1)+'</details>';
  }

