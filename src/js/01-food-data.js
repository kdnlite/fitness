  /* ---------- Food illustrations ---------- */
  function svg(inner){return '<svg viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-hidden="true">'+inner+'</svg>'}
  function bowl(color,rim){
    return '<path d="M8 38H72A32 30 0 0 1 8 38Z" fill="#5878B4"/>'+
      '<ellipse cx="40" cy="38" rx="32" ry="8" fill="'+color+'" stroke="'+(rim||'#00000026')+'" stroke-width="1.5"/>'+
      '<path d="M26 66h28" stroke="#3E5A92" stroke-width="4" stroke-linecap="round"/>';
  }
  var ICON = {
    roti:function(){return svg('<circle cx="40" cy="42" r="30" fill="#E6B870" stroke="#C48F45" stroke-width="2"/><circle cx="29" cy="33" r="4.5" fill="#B9772F"/><circle cx="48" cy="29" r="3.5" fill="#B9772F"/><circle cx="52" cy="48" r="5" fill="#B9772F"/><circle cx="33" cy="54" r="3.5" fill="#B9772F"/><circle cx="42" cy="42" r="2.5" fill="#B9772F"/>')},
    bowl:function(c){return svg(bowl(c)+'<circle cx="30" cy="36" r="2" fill="#00000022"/><circle cx="50" cy="39" r="2" fill="#00000022"/>')},
    rice:function(){return svg(bowl('#FFFFFF','#CBD2DC')+'<path d="M12 37Q40 4 68 37Z" fill="#FFFFFF" stroke="#CBD2DC" stroke-width="1.5"/>')},
    cubes:function(c){return svg('<rect x="12" y="38" width="28" height="28" rx="4" fill="'+c+'" stroke="#CDBF8F" stroke-width="2"/><rect x="42" y="38" width="26" height="28" rx="4" fill="'+c+'" stroke="#CDBF8F" stroke-width="2"/><rect x="26" y="12" width="28" height="26" rx="4" fill="'+c+'" stroke="#CDBF8F" stroke-width="2"/>')},
    glass:function(c){return svg('<path d="M22 10H58L53 70H27Z" fill="#EAF2FB" stroke="#9DB2CE" stroke-width="2"/><path d="M24.5 26H55.5L52.5 70H27.5Z" fill="'+c+'"/><path d="M24.5 26H55.5" stroke="#C9D6E6" stroke-width="2"/>')},
    egg:function(){return svg('<ellipse cx="40" cy="42" rx="24" ry="30" fill="#FFFFFF" stroke="#C9CFD8" stroke-width="2"/><circle cx="40" cy="45" r="12" fill="#F5B82E"/><circle cx="36" cy="41" r="3" fill="#FAD36E"/>')},
    omelette:function(){return svg('<path d="M8 56A32 34 0 0 1 72 56Z" fill="#F6C945" stroke="#D49C13" stroke-width="2"/><circle cx="28" cy="46" r="3" fill="#5BAE4E"/><circle cx="44" cy="40" r="3" fill="#E5483B"/><circle cx="54" cy="50" r="2.5" fill="#5BAE4E"/><path d="M8 60H72" stroke="#D49C13" stroke-width="3" stroke-linecap="round"/>')},
    chicken:function(){return svg('<path d="M30 52L14 68" stroke="#F1E7D4" stroke-width="7" stroke-linecap="round"/><circle cx="11" cy="68" r="5" fill="#F1E7D4"/><circle cx="17" cy="72" r="4" fill="#F1E7D4"/><ellipse cx="48" cy="32" rx="26" ry="20" transform="rotate(35 48 32)" fill="#C77A33" stroke="#A25E21" stroke-width="2"/><path d="M40 20Q52 14 60 24" stroke="#E0A15D" stroke-width="3" fill="none" stroke-linecap="round"/>')},
    fish:function(){return svg('<path d="M6 40Q28 10 54 34L74 20L70 40L74 60L54 46Q28 70 6 40Z" fill="#7BA7CB" stroke="#4F7DA3" stroke-width="2"/><circle cx="20" cy="37" r="2.5" fill="#14202B"/><path d="M34 30Q38 40 34 50" stroke="#4F7DA3" stroke-width="2" fill="none"/>')},
    leaves:function(){return svg('<path d="M8 54Q14 16 44 26Q42 56 8 54Z" fill="#43A047"/><path d="M30 62Q36 24 72 30Q68 66 30 62Z" fill="#7CC47F"/><circle cx="58" cy="56" r="11" fill="#E5483B"/><path d="M54 47Q58 44 62 47" stroke="#2E7D32" stroke-width="3" fill="none" stroke-linecap="round"/><circle cx="24" cy="30" r="6" fill="#F0F4C3" stroke="#9CCC65" stroke-width="2"/>')},
    almond:function(){return svg('<ellipse cx="26" cy="44" rx="11" ry="18" transform="rotate(-25 26 44)" fill="#B98250" stroke="#8E5E31" stroke-width="2"/><ellipse cx="50" cy="34" rx="11" ry="18" transform="rotate(20 50 34)" fill="#C4905C" stroke="#8E5E31" stroke-width="2"/><ellipse cx="52" cy="58" rx="11" ry="17" transform="rotate(-70 52 58)" fill="#B98250" stroke="#8E5E31" stroke-width="2"/>')},
    banana:function(){return svg('<path d="M14 16Q18 66 62 62Q72 60 74 52Q42 58 28 14Z" fill="#F6D447" stroke="#C9A21C" stroke-width="2.5" stroke-linejoin="round"/><path d="M14 16L22 12L30 14" stroke="#7A5C1B" stroke-width="4" fill="none" stroke-linecap="round"/>')},
    beans:function(c){var e='';[[24,30,-20],[44,26,15],[58,40,-40],[34,50,30],[52,58,-10],[20,58,50]].forEach(function(b){e+='<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="9" ry="6.5" transform="rotate('+b[2]+' '+b[0]+' '+b[1]+')" fill="'+c+'" stroke="#00000030" stroke-width="1.5"/>'});return svg(e)},
    chilla:function(){return svg('<ellipse cx="40" cy="46" rx="32" ry="26" fill="#E9C46A" stroke="#C9972E" stroke-width="2"/><circle cx="28" cy="40" r="3" fill="#5BAE4E"/><circle cx="46" cy="36" r="3" fill="#5BAE4E"/><circle cx="50" cy="52" r="3" fill="#E5483B"/><circle cx="32" cy="55" r="2.5" fill="#5BAE4E"/>')},
    toast:function(){return svg('<path d="M18 68V34A14 14 0 0 1 24 12H56A14 14 0 0 1 62 34V68Z" fill="#E8C48A" stroke="#C99A55" stroke-width="2.5"/><path d="M26 62V36A8 8 0 0 1 30 20H50A8 8 0 0 1 54 36V62Z" fill="#F4DDB0"/>')},
    poha:function(){return svg('<ellipse cx="40" cy="54" rx="36" ry="12" fill="#E5E7EB" stroke="#C9CFD8" stroke-width="1.5"/><path d="M14 52Q40 6 66 52Z" fill="#F4D35E" stroke="#D9B63A" stroke-width="1.5"/><circle cx="32" cy="38" r="2.5" fill="#C9884A"/><circle cx="46" cy="34" r="2.5" fill="#C9884A"/><circle cx="40" cy="44" r="2.5" fill="#5BAE4E"/><path d="M54 56L68 52L64 62Z" fill="#CDE27A" stroke="#9CB93C" stroke-width="1.5"/>')},
    soya:function(){var e='';[[24,32,-20],[48,26,20],[58,48,-30],[32,52,35]].forEach(function(b){e+='<ellipse cx="'+b[0]+'" cy="'+b[1]+'" rx="14" ry="10" transform="rotate('+b[2]+' '+b[0]+' '+b[1]+')" fill="#9A6A3A" stroke="#6E4821" stroke-width="2"/>'});return svg(e)}
    ,apple:function(c){return svg('<path d="M40 24C28 14 10 22 12 44C14 62 28 72 40 66C52 72 66 62 68 44C70 22 52 14 40 24Z" fill="'+c+'" stroke="#00000030" stroke-width="2"/><path d="M40 24Q40 12 48 8" stroke="#6D4C1F" stroke-width="3.5" fill="none" stroke-linecap="round"/><path d="M46 14Q56 8 60 16Q50 22 46 14Z" fill="#43A047"/>')}
  };
  function icon(i){return ICON[i[0]](i[1])}
  $('plate').innerHTML = [['roti'],['bowl','#E9B949'],['egg'],['banana'],['leaves']].map(function(i){return '<div class="ico">'+icon(i)+'</div>'}).join('');

  /* ---------- Vitamins and minerals ---------- */
  var MICROS = [
    {n:'Iron',need:[8,18,'mg'],src:{veg:'Dal, rajma, chana, spinach and whole wheat roti. Add lemon or amla to the meal to absorb more.',vegan:'Dal, rajma, chana, soya chunks, tofu and spinach. Add lemon or amla to the meal to absorb more.',nonveg:'Chicken, fish, eggs, plus dal and spinach.'},watch:{vegan:1}},
    {n:'Calcium',need:[1000,1000,'mg'],src:{veg:'Milk, curd, paneer and ragi.',vegan:'Fortified soy milk, tofu, ragi, sesame seeds and green leafy vegetables.',nonveg:'Fish, eggs and ragi. Add curd or a glass of milk daily to reach your need.'},watch:{vegan:1,nonveg:1}},
    {n:'Vitamin B12',need:[2.4,2.4,'mcg'],src:{veg:'Milk, curd and paneer usually cover it.',vegan:'Plants do not contain B12. Use fortified foods and take a B12 supplement, which is normally advised for vegans.',nonveg:'Eggs, chicken and fish.'},watch:{vegan:1}},
    {n:'Vitamin C',need:[90,75,'mg'],src:{all:'Amla, guava, orange, lemon, capsicum and tomato in your salad.'},watch:{}},
    {n:'Vitamin A',need:[900,700,'mcg'],src:{veg:'Carrot, spinach, pumpkin, papaya and milk.',vegan:'Carrot, spinach, pumpkin, papaya and mango.',nonveg:'Eggs, carrot, spinach and papaya.'},watch:{}},
    {n:'Folate',need:[400,400,'mcg'],src:{all:'Dal, chana, rajma, sprouts and spinach.'},watch:{}},
    {n:'Magnesium',need:[400,310,'mg'],src:{all:'Almonds, peanuts, whole wheat roti, rajma and banana.'},watch:{}},
    {n:'Zinc',need:[11,8,'mg'],src:{veg:'Paneer, curd, chana and pumpkin seeds.',vegan:'Chana, soya chunks, tofu, peanuts and seeds.',nonveg:'Chicken, eggs, fish and chana.'},watch:{vegan:1}},
    {n:'Vitamin D',need:[15,15,'mcg'],src:{veg:'15 to 20 minutes of morning sun daily. Fortified milk helps.',vegan:'15 to 20 minutes of morning sun daily and fortified soy milk. Ask a doctor about a supplement.',nonveg:'Morning sun, egg yolk and fish.'},watch:{veg:1,vegan:1}},
    {n:'Omega-3',need:[1.6,1.1,'g'],src:{veg:'Flaxseed (alsi), walnuts and mustard oil. Add 1 spoon ground flaxseed daily.',vegan:'Flaxseed (alsi), walnuts and chia. Add 1 spoon ground flaxseed daily.',nonveg:'Fish such as rohu, surmai or mackerel twice a week, plus flaxseed.'},watch:{veg:1,vegan:1}}
  ];
  function needText(m,g){
    var a=m.need[0], b=m.need[1], u=' '+m.need[2];
    if(g==='male') return a+u;
    if(g==='female') return b+u;
    return a===b ? a+u : Math.min(a,b)+' to '+Math.max(a,b)+u;
  }


  /* ---------- Meals ---------- */
  var PORTION = {
    lose:['Fill half your plate with vegetables and salad before anything else.','Keep roti to 2 per meal and rice to 1 small katori.','Skip sugary drinks, packaged juice and fried snacks. Chai with less sugar is fine.'],
    gain:['Add a third roti or an extra half katori of rice at lunch and dinner.','Have a handful of nuts and a glass of milk (or soy milk) between meals.','Do not skip meals. Eat every 3 to 4 hours, even when you are not very hungry.'],
    maintain:['Keep 2 to 3 roti or 1 katori rice per meal and a vegetable at every meal.','Keep sweets and fried food to once or twice a week.','Weigh yourself once a week, same time, and adjust portions if you drift more than 1.5 kg.']
  };


  /* ---------- Ingredients: values per 100 g as bought (raw or dry weight) ---------- */
  /* [name, kcal, protein g, carbs g, fat g, fibre g, approx cost in rupees per 100 g, allergens, rich in] */
  var ING = {
    atta:['Whole wheat flour (atta)',340,12,70,1.7,11,5,['gluten'],'Iron, B vitamins'],
    rice:['Rice (raw)',345,7,78,0.5,0.4,8,[],'Energy'],
    oats:['Rolled oats',380,13,67,7,10,18,[],'Magnesium, zinc'],
    poha:['Poha (flattened rice)',350,6.6,77,1.2,1,9,[],'Iron'],
    sooji:['Semolina (sooji)',350,10,74,1,3,6,['gluten'],'B vitamins'],
    dalia:['Broken wheat (dalia)',340,11.5,71,1.5,11,7,['gluten'],'Iron, magnesium'],
    besan:['Gram flour (besan)',380,22,58,6,11,12,[],'Folate, iron'],
    ragi:['Ragi flour',330,7.3,72,1.3,11.5,9,[],'Calcium, iron'],
    jowar:['Jowar flour',349,10,73,1.7,10,6,[],'Iron, B vitamins'],
    bread:['Whole wheat bread',250,10,43,3.5,6,10,['gluten'],'B vitamins'],
    quinoa:['Quinoa (raw)',368,14,64,6,7,60,[],'Magnesium, iron'],
    toor:['Toor dal (raw)',335,22,62,1.7,15,15,[],'Folate, iron'],
    moong:['Moong dal (raw)',347,24,60,1.2,16,14,[],'Folate, iron, zinc'],
    masoor:['Masoor dal (raw)',343,25,60,0.7,11,12,[],'Folate, iron'],
    urad:['Urad dal (raw)',347,25,59,1.6,18,15,[],'Iron, magnesium'],
    chanadal:['Chana dal (raw)',360,21,60,5.5,13,11,[],'Folate, iron'],
    chickpea:['Chickpeas (raw)',364,19,61,6,17,14,[],'Folate, iron, zinc'],
    rajma:['Rajma (raw)',333,23,60,0.8,25,18,[],'Iron, folate, magnesium'],
    sprouts:['Moong sprouts',30,3,6,0.2,1.8,10,[],'Vitamin C, folate'],
    soya:['Soya chunks (dry)',345,52,33,0.5,13,9,['soy'],'Iron, calcium, magnesium'],
    tofu:['Tofu (firm)',120,13,2.5,7,1,30,['soy'],'Calcium, iron'],
    soymilk:['Soy milk (unsweetened)',40,3.3,2.5,2,0.4,8,['soy'],'Calcium and B12 (if fortified)'],
    sattu:['Sattu (roasted gram flour)',390,21,63,5.5,17,14,[],'Iron, magnesium'],
    peanut:['Peanuts',567,26,16,49,8.5,14,['nuts'],'Vitamin E, magnesium'],
    pbutter:['Peanut butter (no sugar)',588,25,20,50,6,40,['nuts'],'Vitamin E, niacin'],
    almond:['Almonds',579,21,22,50,12.5,80,['nuts'],'Vitamin E, magnesium'],
    walnut:['Walnuts',654,15,14,65,6.7,90,['nuts'],'Omega-3, magnesium'],
    chia:['Chia seeds',486,17,42,31,34,50,[],'Omega-3, calcium'],
    flax:['Flaxseed (alsi)',534,18,29,42,27,20,[],'Omega-3'],
    sesame:['Sesame seeds',573,18,23,50,12,20,[],'Calcium, iron'],
    pumpkinseed:['Pumpkin seeds',559,30,11,49,6,50,[],'Zinc, magnesium'],
    makhana:['Makhana (fox nuts)',350,10,77,0.1,14,80,[],'Magnesium, potassium'],
    milk:['Toned milk',58,3.1,4.8,3,0,5.5,['dairy'],'Calcium, vitamin B12'],
    curd:['Curd (toned milk)',60,3.5,4.7,3,0,7,['dairy'],'Calcium, probiotics'],
    greek:['Greek yogurt (low fat)',73,10,4,2,0,25,['dairy'],'Calcium, B12'],
    paneer:['Paneer',265,18,1.2,20,0,35,['dairy'],'Calcium, vitamin B12'],
    buttermilk:['Buttermilk (chaas)',40,3,4.5,1,0,3,['dairy'],'Calcium'],
    ghee:['Ghee',880,0,0,99,0,60,['dairy'],'Vitamin A'],
    whey:['Whey protein powder',400,80,8,6,0,300,['dairy'],'Protein, calcium'],
    egg:['Egg (whole)',143,12.6,0.7,9.5,0,14,['egg'],'B12, vitamin D, choline'],
    eggwhite:['Egg white',52,11,0.7,0.2,0,10,['egg'],'Protein, selenium'],
    chicken:['Chicken breast (raw)',120,22.5,0,2.6,0,28,[],'B6, niacin, zinc'],
    fish:['Rohu fish (raw)',82,16.6,0,1.4,0,30,['fish'],'Omega-3, B12, iodine'],
    tuna:['Tuna, canned in water',116,26,0,0.8,0,60,['fish'],'B12, selenium'],
    prawns:['Prawns (raw)',85,20,0.9,0.5,0,55,['fish'],'Iodine, B12, zinc'],
    salmon:['Salmon (raw)',208,20,0,13,0,120,['fish'],'Omega-3, vitamin D'],
    onion:['Onion',40,1.1,9.3,0.1,1.7,3,[],'Vitamin C'],
    tomato:['Tomato',18,0.9,3.9,0.2,1.2,3,[],'Vitamin C, lycopene'],
    potato:['Potato',77,2,17,0.1,2.2,3,[],'Potassium, vitamin C'],
    sweetpotato:['Sweet potato',86,1.6,20,0.1,3,4,[],'Vitamin A, potassium'],
    spinach:['Spinach (palak)',23,2.9,3.6,0.4,2.2,4,[],'Iron, folate, vitamin A'],
    cauliflower:['Cauliflower',25,1.9,5,0.3,2,4,[],'Vitamin C, vitamin K'],
    cabbage:['Cabbage',25,1.3,6,0.1,2.5,2.5,[],'Vitamin C, vitamin K'],
    carrot:['Carrot',41,0.9,10,0.2,2.8,4,[],'Vitamin A'],
    peas:['Green peas',81,5.4,14,0.4,5.1,8,[],'Vitamin C, folate'],
    capsicum:['Capsicum',20,0.9,4.6,0.2,1.7,6,[],'Vitamin C'],
    cucumber:['Cucumber',15,0.7,3.6,0.1,0.5,3,[],'Hydration'],
    brinjal:['Brinjal',25,1,6,0.2,3,3,[],'Fibre'],
    lauki:['Bottle gourd (lauki)',14,0.6,3.4,0.1,0.5,2.5,[],'Hydration'],
    pumpkin:['Pumpkin',26,1,6.5,0.1,0.5,3,[],'Vitamin A'],
    mushroom:['Mushrooms',22,3.1,3.3,0.3,1,20,[],'B vitamins, selenium'],
    broccoli:['Broccoli',34,2.8,7,0.4,2.6,10,[],'Vitamin C, vitamin K'],
    corn:['Sweet corn kernels',86,3.3,19,1.2,2,7,[],'Folate, B vitamins'],
    lettuce:['Lettuce',15,1.4,2.9,0.2,1.3,6,[],'Vitamin K'],
    mixveg:['Mixed vegetables',40,2,8,0.3,3,5,[],'Vitamin A, vitamin C, fibre'],
    herbs:['Coriander and mint',23,2.1,3.7,0.5,2.8,10,[],'Vitamin K'],
    garlic:['Garlic',149,6.4,33,0.5,2.1,10,[],'Manganese'],
    ginger:['Ginger',80,1.8,18,0.8,2,8,[],'Gingerols'],
    coconut:['Fresh coconut',354,3.3,15,33,9,20,[],'Manganese'],
    lemon:['Lemon juice',30,0.4,7,0.2,0.3,4,[],'Vitamin C'],
    banana:['Banana',89,1.1,23,0.3,2.6,4,[],'Potassium, vitamin B6'],
    apple:['Apple',52,0.3,14,0.2,2.4,12,[],'Vitamin C, fibre'],
    papaya:['Papaya',43,0.5,11,0.3,1.7,4,[],'Vitamin C, vitamin A'],
    guava:['Guava',68,2.6,14,1,5.4,5,[],'Vitamin C, fibre'],
    orange:['Orange',47,0.9,12,0.1,2.4,6,[],'Vitamin C'],
    pomegranate:['Pomegranate',83,1.7,19,1.2,4,14,[],'Vitamin C, potassium'],
    watermelon:['Watermelon',30,0.6,7.6,0.2,0.4,2,[],'Hydration'],
    dates:['Dates',282,2.5,75,0.4,8,25,[],'Potassium, magnesium'],
    raisin:['Raisins',299,3.1,79,0.5,3.7,25,[],'Iron, potassium'],
    oil:['Cooking oil',900,0,0,100,0,15,[],'Vitamin E'],
    jaggery:['Jaggery',383,0.4,95,0.1,0,7,[],'Iron'],
    honey:['Honey',304,0.3,82,0,0,40,[],'Energy'],
    kalachana:['Kala chana (raw)', 360, 20, 60, 5, 22, 10, [], 'Iron, folate'],
    lobia:['Lobia (black-eyed beans, raw)', 336, 23.5, 60, 1.3, 10.6, 14, [], 'Folate, iron'],
    bajra:['Bajra flour', 361, 11.6, 67, 5, 11.5, 6, [], 'Iron, magnesium'],
    bhindi:['Okra (bhindi)', 33, 1.9, 7, 0.2, 3.2, 5, [], 'Vitamin C, folate'],
    beans:['French beans', 31, 1.8, 7, 0.2, 2.7, 5, [], 'Vitamin C, vitamin K'],
    methi:['Fenugreek leaves (methi)', 49, 4.4, 6, 0.9, 4.9, 6, [], 'Iron, folate'],
    sabudana:['Sabudana (sago)', 351, 0.2, 87, 0.1, 0.9, 10, [], 'Energy'],
    sevai:['Wheat vermicelli (sevai)', 350, 11, 74, 1.5, 3, 10, ['gluten'], 'B vitamins'],
    murmura:['Puffed rice (murmura)', 402, 6.3, 90, 0.5, 1.7, 10, [], 'Energy']
  };

  /* ---------- Dishes: complete meals. Nutrition is computed from the ingredient grams. ---------- */
  /* D(id, name, meal, diet, serving, minutes, ingredients, picture, recipe)
     meal: b breakfast, l lunch, d dinner, s snack. diet: v vegan, g vegetarian (dairy or honey), n non-veg. */
  var DISHES = [];
  function D(id,n,cat,d,s,q,ing,pic,rec){DISHES.push({id:id,n:n,cat:cat,d:d,s:s,q:q,ing:ing,pic:pic,rec:rec.split(' | ')})}
  var Y='#F2C94C', G='#5BAE4E', RB='#8E2F2A', TN='#E6B870', WH='#FFFFFF', OR='#E8913A', CR='#F7F0DC', BR='#8B5E34', PK='#F3B6C0', GD='#D9A441';

  /* ===== Breakfast: vegan ===== */
  D('poha','Vegetable poha with peanuts','b','v','1 plate',15,[['poha',60],['onion',40],['peas',30],['potato',30],['peanut',10],['oil',6],['lemon',5],['herbs',5]],['bowl',Y,G],
    'Rinse the poha in a sieve and leave it for 5 minutes to soften. | Heat the oil, crackle mustard seeds and curry leaves, then cook the onion, diced potato and peas with turmeric and salt until soft. | Add the poha and peanuts, toss gently for 2 minutes, then finish with lemon juice and coriander.');
  D('upma','Vegetable upma','b','v','1 plate',15,[['sooji',60],['onion',30],['carrot',30],['peas',30],['peanut',8],['oil',8],['herbs',3]],['bowl',TN,G],
    'Dry roast the semolina for 3 minutes until lightly fragrant and set it aside. | Heat the oil, crackle mustard seeds and curry leaves, then cook the onion, carrot and peas with salt. | Add 2 cups of hot water, stir in the semolina slowly, cover and cook for 2 minutes. Top with coriander and peanuts.');
  D('besanchilla','Besan chilla with vegetables (2)','b','v','2 chillas',15,[['besan',55],['onion',30],['tomato',30],['spinach',20],['herbs',5],['oil',6]],['disc',Y,G],
    'Whisk the besan with water, salt and a pinch of ajwain into a smooth, pourable batter. | Stir in the chopped onion, tomato, spinach and coriander. | Pour onto a hot, lightly oiled pan, spread thin and cook both sides until golden. Serve with mint chutney.');
  D('moongchilla','Moong dal chilla with mint chutney (2)','b','v','2 chillas',20,[['moong',55],['onion',25],['herbs',8],['ginger',3],['oil',6]],['disc','#C9D86B',G],
    'Soak the moong dal for 3 hours and drain it. | Grind with ginger, green chilli and a little water into a thick batter and add salt. | Pour onto a hot, lightly oiled pan, spread thin, scatter onion and cook both sides until crisp at the edges. Serve with mint chutney.');
  D('idlisambar','Idli (3) with sambar','b','v','3 idlis and 1 katori sambar',20,[['rice',40],['urad',15],['toor',20],['mixveg',80],['oil',4]],['bowl','#F7F2E4',OR],
    'Soak the rice and urad dal separately for 5 hours, grind to a smooth batter, mix, add salt and ferment overnight. | Steam the batter in greased idli moulds for 10 to 12 minutes. | Boil the toor dal and vegetables with tamarind and sambar powder, then add a tempering of mustard seeds and curry leaves in the oil. Serve hot.');
  D('masaladosa','Masala dosa (1 large)','b','v','1 dosa with filling',25,[['rice',45],['urad',12],['potato',100],['onion',40],['oil',8]],['disc',TN,Y],
    'Soak and grind the rice and urad dal, ferment overnight and add salt. | Cook the sliced onion and boiled, mashed potato with turmeric, mustard seeds and curry leaves for the filling. | Spread the batter thin on a hot tawa, brush with a little oil, add the filling and fold.');
  D('oatsbanana','Oats porridge with banana and chia','b','v','1 bowl',8,[['oats',45],['soymilk',200],['banana',60],['chia',8]],['bowl',CR,Y],
    'Cook the oats in the soy milk on low heat for 5 minutes, stirring. | Stir in the chia seeds and let it thicken for 2 minutes. | Top with sliced banana and a pinch of cinnamon.');
  D('dalia','Vegetable dalia (broken wheat porridge)','b','v','1 bowl',20,[['dalia',50],['moong',15],['mixveg',80],['oil',5]],['bowl',GD,G],
    'Roast the dalia and moong dal in the oil for 2 minutes. | Add the vegetables, salt, turmeric and 3 cups of water. | Pressure cook for 3 whistles, mash lightly and serve warm.');
  D('ragiporridge','Ragi porridge with jaggery and flaxseed','b','v','1 bowl',10,[['ragi',40],['soymilk',150],['jaggery',10],['flax',6]],['bowl','#B9856A',CR],
    'Mix the ragi flour with half the soy milk into a smooth paste. | Heat the rest of the soy milk, stir in the paste and cook for 5 minutes until thick. | Add the jaggery and ground flaxseed and serve warm.');
  D('tofutoast','Tofu bhurji with 2 toasts','b','v','1 plate',12,[['tofu',120],['onion',30],['tomato',40],['capsicum',20],['oil',6],['bread',60]],['toast',Y,G],
    'Crumble the tofu. Cook the chopped onion, tomato and capsicum in the oil with turmeric and chilli. | Add the tofu and salt and cook for 4 minutes, stirring. | Toast the bread and serve the bhurji on top.');
  D('pbbanana','Peanut butter banana toast','b','v','2 slices',5,[['bread',60],['pbutter',20],['banana',80],['chia',5]],['toast',BR,Y],
    'Toast the bread. | Spread the peanut butter on both slices. | Top with sliced banana and sprinkle the chia seeds.');
  D('sproutsbowl','Sprouts and chickpea breakfast bowl','b','v','1 bowl',10,[['sprouts',150],['chickpea',25],['cucumber',60],['tomato',50],['onion',20],['peanut',10],['lemon',10],['herbs',5]],['bowl','#B6D96B',RB],
    'Boil the chickpeas until soft (soak overnight first) and steam the sprouts for 3 minutes. | Mix with the chopped cucumber, tomato and onion. | Add roasted peanuts, lemon juice, salt, chaat masala and coriander.');
  D('vegsandwich','Grilled vegetable and tofu sandwich','b','v','1 sandwich',12,[['bread',80],['tofu',60],['cucumber',40],['tomato',40],['lettuce',10],['capsicum',30],['oil',3]],['toast',G,RB],
    'Mash the tofu with salt, pepper and a little mint chutney into a spread. | Spread it on the bread and layer the cucumber, tomato, capsicum and lettuce. | Grill the sandwich on a lightly oiled pan for 2 minutes each side.');
  D('stuffedparatha','Cauliflower paratha (1) with mint chutney','b','v','1 paratha',25,[['atta',60],['cauliflower',60],['onion',15],['oil',8],['herbs',5]],['disc',TN,WH],
    'Grate the cauliflower, squeeze out the water and mix with onion, coriander, chilli, salt and ajwain. | Knead the atta into a soft dough, roll a ball, fill it and roll out again. | Cook on a hot tawa with half the oil on each side until golden brown.');
  D('spchaat','Sweet potato and chickpea chaat','b','v','1 bowl',20,[['sweetpotato',150],['chickpea',30],['onion',20],['oil',3],['lemon',8],['herbs',5]],['bowl',OR,G],
    'Boil the chickpeas until soft (soak overnight). Cube the sweet potato. | Roast the sweet potato in the oil with salt and chilli until golden and tender. | Toss with the chickpeas, onion, lemon juice, chaat masala and coriander.');
  D('masalaoats','Masala oats with vegetables','b','v','1 bowl',12,[['oats',50],['mixveg',100],['onion',30],['peas',30],['oil',6]],['bowl','#D8B27A',G],
    'Cook the onion, mixed vegetables and peas in the oil with turmeric, chilli and salt. | Add the oats and 1.5 cups of water. | Cook for 5 minutes until thick and finish with coriander.');
  D('soysmoothie','Banana oat soy smoothie','b','v','1 large glass',5,[['soymilk',250],['banana',100],['oats',25],['pbutter',10]],['glass',CR,Y],
    'Add the soy milk, banana, oats and peanut butter to a blender. | Blend for 1 minute until smooth. | Serve cold straight away.');
  D('overnightoats','Overnight oats with apple and chia','b','v','1 jar',5,[['oats',40],['soymilk',200],['chia',10],['apple',80],['dates',10]],['bowl',CR,'#E5483B'],
    'Mix the oats, soy milk and chia in a jar and refrigerate overnight. | Chop the dates and apple. | Stir them in the next morning and eat cold.');

  /* ===== Breakfast: vegetarian (dairy) ===== */
  D('paneerbhurji','Paneer bhurji with 1 roti','b','g','1 plate',15,[['paneer',70],['onion',30],['tomato',40],['oil',4],['atta',40]],['plate',Y,TN],
    'Crumble the paneer. Cook the onion and tomato in the oil with turmeric, chilli and salt. | Add the paneer and cook for 3 minutes, stirring. | Serve with a hot roti made from the atta.');
  D('greekparfait','Greek yogurt parfait with oats and seeds','b','g','1 glass',5,[['greek',200],['oats',30],['banana',60],['pumpkinseed',8],['honey',8]],['glass',WH,PK],
    'Layer the Greek yogurt and oats in a glass. | Add the sliced banana and pumpkin seeds. | Drizzle with honey.');
  D('paneerparatha','Paneer paratha (1) with curd','b','g','1 paratha and 1 katori curd',25,[['atta',60],['paneer',50],['oil',6],['curd',100]],['disc',TN,WH],
    'Mix the crumbled paneer with green chilli, coriander and salt. | Knead the atta into a soft dough, fill with the paneer and roll out. | Cook on a tawa with the oil until golden and serve with the curd.');
  D('milkdalia','Sweet dalia with milk and raisins','b','g','1 bowl',20,[['dalia',50],['milk',250],['jaggery',10],['raisin',10]],['bowl',GD,CR],
    'Roast the dalia for 2 minutes. | Cook with the milk on low heat for 15 minutes, stirring now and then. | Add the jaggery and raisins at the end.');
  D('mchillacurd','Moong dal chilla (2) with curd','b','g','2 chillas and 1 katori curd',20,[['moong',50],['oil',6],['curd',100],['onion',20]],['disc','#C9D86B',WH],
    'Soak the moong dal for 3 hours, drain and grind to a batter with ginger and salt. | Spread thin on an oiled pan, add the onion and cook both sides. | Serve with the curd.');
  D('paneerchilla','Besan chilla stuffed with paneer (2)','b','g','2 chillas',20,[['besan',50],['paneer',40],['onion',30],['oil',6]],['disc',Y,PK],
    'Make a thin besan batter with water, salt and ajwain. | Cook thin chillas on an oiled pan. | Fill with crumbled paneer and chopped onion with a pinch of chaat masala and fold.');
  D('chiapudding','Chia pudding with milk and papaya','b','g','1 jar',5,[['milk',200],['chia',20],['papaya',100],['honey',8]],['glass',CR,OR],
    'Stir the chia seeds into the milk and leave in the fridge for at least 2 hours or overnight. | Cube the papaya. | Top the pudding with papaya and honey.');

  /* ===== Breakfast: non-vegetarian ===== */
  D('eggbhurji','Egg bhurji with 2 toasts','b','n','1 plate',12,[['egg',100],['onion',30],['tomato',40],['oil',5],['bread',60]],['toast',Y,RB],
    'Cook the chopped onion and tomato in the oil with turmeric, chilli and salt. | Beat the 2 eggs, pour in and stir on low heat until just set. | Toast the bread and serve.');
  D('vegomelette','Veg omelette (1 egg and 3 whites) with toast','b','n','1 omelette and 2 slices',12,[['egg',50],['eggwhite',100],['onion',25],['tomato',25],['oil',4],['bread',60]],['plate',Y,G],
    'Whisk the egg and whites with salt and pepper. | Fold in the chopped onion, tomato and chilli. | Cook on a lightly oiled pan on low heat, flip once, and serve with the toast.');
  D('boiledeggs','3 boiled eggs with a banana','b','n','3 eggs and 1 banana',12,[['egg',150],['banana',100]],['egg',Y,Y],
    'Place the eggs in boiling water. | Boil for 9 to 10 minutes, then cool in cold water and peel. | Sprinkle with pepper and serve with the banana.');
  D('chickensandwich','Grilled chicken sandwich','b','n','1 sandwich',20,[['bread',80],['chicken',80],['cucumber',40],['tomato',40],['oil',4]],['toast',RB,G],
    'Marinate the chicken with salt, pepper, chilli and lemon for 10 minutes. | Pan grill the chicken for 5 to 6 minutes each side until cooked through, then slice it. | Layer the chicken, cucumber and tomato between the bread slices and toast.');
  D('eggwrap','Egg and vegetable roti wrap','b','n','1 wrap',15,[['atta',40],['egg',100],['onion',30],['capsicum',30],['oil',5]],['plate',TN,Y],
    'Make a roti from the atta. | Beat the 2 eggs with chopped onion, capsicum and salt and cook as a thin omelette. | Roll the omelette inside the roti.');
  D('tunatoast','Tuna and cucumber toast (2)','b','n','2 slices',8,[['bread',60],['tuna',80],['cucumber',40],['lemon',5]],['toast','#C8B79F',G],
    'Drain the tuna and mix it with lemon juice, black pepper and a little salt. | Toast the bread. | Top with the tuna and cucumber slices.');
  D('omeletteroti','Masala omelette (2 eggs) with 1 roti','b','n','1 omelette and 1 roti',15,[['egg',100],['atta',50],['onion',30],['tomato',30],['oil',5]],['plate',Y,TN],
    'Beat the eggs with chopped onion, tomato, chilli and salt. | Cook as an omelette in the oil. | Serve with a hot roti.');
  D('eggoats','Savoury oats with egg and vegetables','b','n','1 bowl',12,[['oats',40],['egg',50],['mixveg',80],['oil',4]],['bowl','#D8B27A',Y],
    'Cook the mixed vegetables in the oil with salt and pepper. | Add the oats and 1.5 cups of water and cook for 5 minutes. | Poach or fry the egg and place it on top.');

  /* ===== Lunch: vegan ===== */
  D('dalrice','Dal, rice and vegetable sabzi','l','v','1 thali plate',30,[['toor',40],['rice',60],['mixveg',120],['oil',8]],['plate',Y,TN],
    'Pressure cook the washed toor dal with turmeric for 3 whistles. | Cook the rice in 2 parts water. Cook the vegetables in half the oil with cumin, turmeric and salt. | Temper the dal with cumin, garlic and the remaining oil. Serve all together.');
  D('rajmachawal','Rajma chawal','l','v','1 plate',35,[['rajma',50],['rice',60],['onion',40],['tomato',60],['oil',8]],['plate',RB,WH],
    'Soak the rajma overnight and pressure cook with salt for 5 to 6 whistles. | Cook the onion and tomato in the oil with rajma masala into a thick base. | Add the rajma with a little cooking water and simmer for 10 minutes. Serve with the cooked rice.');
  D('cholerotis','Chole with 2 rotis','l','v','1 plate',40,[['chickpea',50],['atta',70],['onion',40],['tomato',60],['oil',8]],['plate','#B9772F',TN],
    'Soak the chickpeas overnight and pressure cook until soft. | Cook the onion and tomato in the oil with chole masala. | Add the chickpeas, simmer for 10 minutes and serve with 2 rotis made from the atta.');
  D('soyacurry','Soya chunk curry with rice','l','v','1 plate',25,[['soya',35],['rice',60],['onion',40],['tomato',60],['oil',8]],['plate',BR,WH],
    'Soak the soya chunks in hot water for 10 minutes and squeeze them dry. | Cook the onion and tomato in the oil with garam masala, turmeric and salt. | Add the soya and a cup of water, simmer for 8 minutes and serve with the cooked rice.');
  D('moongkhichdi','Moong dal vegetable khichdi','l','v','1 large bowl',25,[['rice',40],['moong',40],['mixveg',100],['oil',8]],['bowl','#E5C45E',G],
    'Wash the rice and moong dal together. | Heat the oil, add cumin, then the vegetables, turmeric and salt. | Add the rice, dal and 4 cups of water and pressure cook for 3 whistles. Serve hot.');
  D('vegpulao','Vegetable pulao with chickpea salad','l','v','1 plate',30,[['rice',60],['mixveg',80],['oil',8],['chickpea',30],['cucumber',40],['lemon',5]],['plate',TN,G],
    'Boil the chickpeas until soft (soak overnight). Wash the rice. | Heat the oil with whole spices, add the vegetables and rice and 2 parts water. Cook covered for 12 minutes. | Toss the chickpeas with the cucumber, lemon and salt as a side salad.');
  D('sambarrice','Sambar rice with salad','l','v','1 plate',30,[['toor',30],['rice',60],['mixveg',100],['oil',6],['tomato',40]],['plate','#D98A2B',WH],
    'Cook the toor dal until soft. Boil the vegetables with tamarind and sambar powder. | Combine and simmer for 5 minutes, then add a tempering of mustard seeds and curry leaves in the oil. | Serve over the cooked rice with sliced tomato.');
  D('quinoabowl','Quinoa and chickpea power bowl','l','v','1 bowl',25,[['quinoa',50],['chickpea',40],['cucumber',60],['tomato',60],['onion',20],['oil',6],['lemon',8]],['bowl','#E3D5A4',G],
    'Rinse the quinoa and cook it in 2 parts water for 12 minutes. Boil the chickpeas until soft. | Chop the cucumber, tomato and onion. | Combine everything with the oil, lemon juice, salt and pepper.');
  D('tofurice','Tofu and broccoli stir-fry with rice','l','v','1 plate',25,[['tofu',120],['rice',60],['broccoli',80],['capsicum',40],['oil',8]],['plate',G,WH],
    'Cube the tofu and sear it in half the oil until golden. | Stir-fry the broccoli and capsicum in the remaining oil with garlic, soy sauce and pepper for 4 minutes. | Add the tofu and toss. Serve with the cooked rice.');
  D('mixdalroti','Mixed dal tadka with 2 rotis','l','v','1 plate',30,[['masoor',25],['toor',20],['atta',70],['oil',8],['onion',30],['tomato',40]],['plate',Y,TN],
    'Boil the masoor and toor dal together with turmeric until soft. | Temper with cumin, garlic, onion and tomato in the oil. | Pour over the dal and serve with 2 rotis.');
  D('laukichana','Lauki chana dal with 2 rotis','l','v','1 plate',30,[['chanadal',40],['lauki',120],['atta',70],['oil',8]],['plate','#D9C26B',TN],
    'Soak the chana dal for 30 minutes. | Pressure cook with the diced lauki, turmeric and salt for 3 whistles. | Temper with cumin and chilli in the oil and serve with 2 rotis.');
  D('palakchana','Palak chana with rice','l','v','1 plate',30,[['chickpea',40],['spinach',150],['rice',60],['oil',8],['onion',30]],['plate','#3F7F3A',WH],
    'Boil the chickpeas until soft. Blanch the spinach and blend into a puree. | Cook the onion in the oil with garlic and spices, then add the puree and chickpeas. | Simmer for 8 minutes and serve with the cooked rice.');
  D('rajmacorn','Rajma and corn rice bowl','l','v','1 bowl',30,[['rajma',40],['corn',60],['rice',50],['tomato',50],['onion',30],['lettuce',20]],['bowl',RB,Y],
    'Pressure cook the soaked rajma until soft. Cook the rice. | Mix the rajma with the sweet corn, tomato, onion and a little cumin and salt. | Serve over the rice on a bed of lettuce.');
  D('milletdal','Jowar roti (2) with dal and sabzi','l','v','1 plate',35,[['jowar',70],['toor',40],['mixveg',100],['oil',8]],['plate',TN,Y],
    'Knead the jowar flour with hot water and salt and pat out 2 rotis. Cook on a hot tawa. | Boil the toor dal with turmeric and temper with cumin and garlic. | Cook the vegetables in the oil with salt and serve everything together.');
  D('mushroompeas','Mushroom and peas masala with 2 rotis','l','v','1 plate',25,[['mushroom',100],['peas',60],['atta',70],['onion',40],['tomato',60],['oil',8]],['plate','#A67C52',TN],
    'Cook the onion and tomato in the oil with ginger-garlic and spices. | Add the sliced mushrooms and peas and cook for 8 minutes. | Serve with 2 rotis.');
  D('moongcabbage','Moong dal and cabbage sabzi with 2 rotis','l','v','1 plate',25,[['moong',30],['cabbage',120],['atta',70],['oil',8]],['plate','#D4E082',TN],
    'Soak the moong dal for 30 minutes. | Cook the shredded cabbage and dal in the oil with mustard seeds, turmeric and salt, covered, for 12 minutes. | Serve with 2 rotis.');
  D('vegbiryani','Vegetable and soya biryani','l','v','1 plate',35,[['rice',70],['mixveg',120],['soya',20],['oil',10]],['plate',OR,WH],
    'Soak the soya chunks, squeeze and fry them with the vegetables in the oil with biryani masala. | Add the soaked rice and 2 parts water. | Cover and cook on low for 15 minutes. Serve with mint.');
  D('chanawrap','Chana masala roti wrap','l','v','1 large wrap',25,[['atta',60],['chickpea',40],['onion',30],['tomato',40],['cucumber',40]],['plate','#B9772F',TN],
    'Boil the chickpeas and cook with onion, tomato and masala into a dry mix. | Make 2 thin rotis from the atta. | Fill with the chana and cucumber and roll.');

  /* ===== Lunch: vegetarian (dairy) ===== */
  D('paneercurry','Paneer curry with 2 rotis and salad','l','g','1 plate',30,[['paneer',80],['atta',70],['onion',40],['tomato',60],['oil',6],['cucumber',50]],['plate',OR,TN],
    'Cook the onion and tomato in the oil, blend into a smooth gravy and return to the pan with spices. | Add the paneer cubes and simmer for 5 minutes. | Serve with 2 rotis and the cucumber salad.');
  D('daltadkacurd','Dal tadka, rice and curd','l','g','1 plate',30,[['toor',40],['rice',60],['curd',100],['oil',6]],['plate',Y,WH],
    'Boil the toor dal with turmeric until soft. | Cook the rice. | Temper the dal with cumin, garlic and chilli in the oil. Serve with the rice and the curd.');
  D('rajmacurd','Rajma, rice and raita','l','g','1 plate',35,[['rajma',50],['rice',50],['curd',100],['oil',6],['onion',30]],['plate',RB,WH],
    'Pressure cook the soaked rajma until soft. Cook the rice. | Cook the onion in the oil with spices, add the rajma and simmer for 10 minutes. | Whisk the curd with salt, cumin and cucumber as raita.');
  D('kadhi','Kadhi chawal','l','g','1 plate',30,[['besan',30],['curd',150],['rice',60],['oil',5]],['plate',Y,WH],
    'Whisk the besan with the curd and 2 cups of water until smooth. | Simmer with turmeric and salt for 15 minutes, stirring. | Temper with cumin and chilli in the oil and serve over the cooked rice.');
  D('paneerricebowl','Paneer bhurji rice bowl','l','g','1 bowl',20,[['paneer',70],['rice',60],['capsicum',40],['onion',30],['oil',6]],['bowl',Y,G],
    'Cook the rice. Cook the onion and capsicum in the oil. | Add the crumbled paneer, turmeric and salt and cook for 4 minutes. | Serve over the rice.');
  D('palakpaneer','Palak paneer with 2 rotis','l','g','1 plate',30,[['paneer',70],['spinach',150],['atta',70],['oil',6]],['plate','#3F7F3A',TN],
    'Blanch the spinach and blend with green chilli and ginger. | Cook the puree in the oil with garlic and spices for 5 minutes. | Add the paneer cubes, simmer for 4 minutes and serve with 2 rotis.');
  D('curdrice','Curd rice with carrot and pomegranate','l','g','1 bowl',20,[['rice',70],['curd',200],['carrot',40],['pomegranate',30],['oil',4]],['bowl',WH,PK],
    'Cook the rice until very soft and let it cool. | Mix with the curd, salt and grated carrot. | Temper with mustard seeds and curry leaves in the oil, then top with pomegranate.');

  /* ===== Lunch: non-vegetarian ===== */
  D('chickencurry','Chicken curry with rice','l','n','1 plate',35,[['chicken',150],['rice',60],['onion',50],['tomato',60],['oil',10]],['plate',OR,WH],
    'Cook the onion and tomato in the oil with ginger-garlic and spices into a thick masala. | Add the chicken pieces and 1/2 cup of water, cover and cook for 18 to 20 minutes until cooked through. | Serve with the cooked rice.');
  D('grilledchickenroti','Grilled chicken with 2 rotis and salad','l','n','1 plate',30,[['chicken',150],['atta',60],['cucumber',50],['tomato',50],['oil',6]],['plate',RB,TN],
    'Marinate the chicken in curd-free spices: chilli, turmeric, lemon, salt and a little oil for 20 minutes. | Grill or pan cook for 7 to 8 minutes each side until no pink remains. | Serve with 2 rotis and the salad.');
  D('fishcurry','Fish curry with rice','l','n','1 plate',30,[['fish',150],['rice',60],['onion',40],['tomato',60],['oil',8]],['plate','#C4733A',WH],
    'Marinate the fish with turmeric, chilli and salt. | Cook the onion and tomato in the oil with spices and a cup of water for a thin gravy. | Add the fish and simmer for 8 minutes. Serve with the cooked rice.');
  D('eggcurry','Egg curry with rice','l','n','1 plate',30,[['egg',150],['rice',50],['onion',40],['tomato',60],['oil',8]],['plate',OR,Y],
    'Boil the 3 eggs, peel and cut a slit in each. | Cook the onion and tomato in the oil with spices into a gravy. | Add the eggs and simmer for 6 minutes. Serve with the cooked rice.');
  D('chickenbiryani','Light chicken biryani','l','n','1 plate',40,[['chicken',120],['rice',70],['onion',50],['curd',30],['oil',10]],['plate',GD,WH],
    'Marinate the chicken with curd, ginger-garlic and biryani masala for 30 minutes. | Cook the onion in the oil, add the chicken and cook for 10 minutes. | Layer with the soaked rice and 1.5 parts water, cover and cook on low for 15 minutes.');
  D('tunabowl','Tuna, chickpea and quinoa salad bowl','l','n','1 bowl',15,[['tuna',100],['chickpea',30],['quinoa',30],['cucumber',60],['tomato',50],['lettuce',20],['oil',6],['lemon',8]],['bowl','#C8B79F',G],
    'Boil the chickpeas and cook the quinoa. | Drain the tuna and flake it. | Toss everything with the chopped vegetables, oil, lemon, salt and pepper.');
  D('prawnrice','Prawn masala with rice','l','n','1 plate',25,[['prawns',150],['rice',60],['onion',40],['tomato',60],['oil',8]],['plate','#D9684A',WH],
    'Cook the onion and tomato in the oil with ginger-garlic and spices. | Add the cleaned prawns and cook for 5 to 6 minutes until pink. | Serve with the cooked rice.');
  D('chickenstirfry','Chicken stir-fry with vegetables and 2 rotis','l','n','1 plate',25,[['chicken',130],['mixveg',120],['atta',60],['oil',8]],['plate',G,TN],
    'Slice the chicken thin and marinate with salt, pepper and soy sauce. | Stir-fry in the oil on high heat for 6 minutes, then add the vegetables for 4 minutes. | Serve with 2 rotis.');
  D('fishtikkaquinoa','Fish tikka with quinoa and salad','l','n','1 plate',30,[['fish',150],['quinoa',50],['cucumber',50],['tomato',40],['oil',5]],['plate',OR,'#E3D5A4'],
    'Marinate the fish with lemon, turmeric, chilli and a little oil for 15 minutes. | Grill or pan cook for 4 to 5 minutes each side. | Serve with the cooked quinoa and the salad.');

  /* ===== Dinner: vegan ===== */
  D('moongroti','Moong dal with 2 rotis and sabzi','d','v','1 plate',30,[['moong',40],['atta',60],['mixveg',120],['oil',8]],['plate',Y,TN],
    'Boil the moong dal with turmeric and salt until soft. | Temper with cumin and garlic in half the oil. | Cook the vegetables in the remaining oil and serve with 2 rotis.');
  D('soyakeema','Soya keema with 2 rotis','d','v','1 plate',25,[['soya',35],['atta',60],['onion',40],['tomato',60],['peas',40],['oil',8]],['plate',BR,TN],
    'Soak the soya chunks, squeeze and mince or crush them. | Cook the onion and tomato in the oil with spices, then add the soya and peas. | Cook for 8 minutes and serve with 2 rotis.');
  D('tofubhurjiroti','Tofu bhurji with 2 rotis','d','v','1 plate',20,[['tofu',130],['atta',60],['onion',30],['tomato',40],['capsicum',30],['oil',8]],['plate',Y,TN],
    'Crumble the tofu. Cook the onion, tomato and capsicum in the oil with turmeric and chilli. | Add the tofu and salt and cook for 5 minutes. | Serve with 2 rotis.');
  D('soupchana','Vegetable soup with chickpea salad and toast','d','v','1 bowl soup and 1 bowl salad',25,[['mixveg',150],['chickpea',45],['bread',40],['oil',4]],['bowl','#D98A5A',G],
    'Boil the mixed vegetables with garlic, pepper and salt, and blend half for a thick soup. | Boil the chickpeas and toss with salt, lemon and chaat masala. | Toast the bread and serve with the soup and salad.');
  D('rajmaquinoa','Rajma and quinoa salad bowl','d','v','1 bowl',25,[['rajma',45],['quinoa',40],['cucumber',60],['tomato',60],['lettuce',20],['lemon',8]],['bowl',RB,'#E3D5A4'],
    'Pressure cook the soaked rajma and cook the quinoa. | Mix with the chopped cucumber, tomato and lettuce. | Dress with lemon, salt and pepper.');
  D('masoorsoup','Masoor dal soup with toast and salad','d','v','1 bowl and 2 slices',25,[['masoor',50],['carrot',50],['tomato',50],['bread',50],['oil',5]],['bowl','#E08E45',WH],
    'Boil the masoor dal with carrot, tomato, turmeric and salt until soft and blend lightly. | Temper with cumin and garlic in the oil. | Toast the bread and serve with the soup.');
  D('vegkhichdi','Vegetable khichdi','d','v','1 large bowl',25,[['rice',40],['moong',40],['mixveg',100],['oil',6]],['bowl','#E5C45E',G],
    'Wash the rice and dal. | Cook the vegetables in the oil with turmeric, cumin and salt. | Add the rice, dal and 4 cups of water and pressure cook for 3 whistles.');
  D('palakdalroti','Palak dal with 2 rotis','d','v','1 plate',30,[['toor',35],['spinach',120],['atta',60],['oil',8]],['plate','#7FA84C',TN],
    'Boil the toor dal with turmeric until soft. | Cook the chopped spinach in the oil with garlic and chilli for 4 minutes. | Mix into the dal and serve with 2 rotis.');
  D('chanadalroti','Chana dal with 2 rotis and sabzi','d','v','1 plate',35,[['chanadal',40],['atta',60],['mixveg',100],['oil',8]],['plate','#D9C26B',TN],
    'Soak the chana dal for 30 minutes and pressure cook with turmeric. | Temper with cumin, garlic and chilli. | Cook the vegetables and serve with 2 rotis.');
  D('tofustirroti','Tofu and vegetable stir-fry with 2 rotis','d','v','1 plate',20,[['tofu',100],['broccoli',80],['capsicum',40],['atta',50],['oil',8]],['plate',G,TN],
    'Cube and sear the tofu in half the oil. | Stir-fry the broccoli and capsicum in the rest with garlic and pepper. | Combine and serve with 2 rotis.');
  D('idlisambar4','Idli (4) with sambar','d','v','4 idlis and 1 katori sambar',25,[['rice',50],['urad',20],['toor',25],['mixveg',100],['oil',4]],['bowl','#F7F2E4',OR],
    'Steam idlis from the fermented rice and urad batter for 12 minutes. | Boil the toor dal and vegetables with sambar powder and tamarind. | Temper with mustard seeds and curry leaves and serve hot.');
  D('jowarrajma','Jowar roti (2) with rajma','d','v','1 plate',35,[['jowar',60],['rajma',40],['onion',30],['tomato',40],['oil',6]],['plate',RB,TN],
    'Make 2 jowar rotis from the flour and hot water. | Pressure cook the soaked rajma and cook with onion, tomato and spices. | Serve together.');
  D('pumpkinchana','Pumpkin and chana curry with 2 rotis','d','v','1 plate',30,[['pumpkin',150],['chickpea',35],['atta',60],['oil',6]],['plate',OR,TN],
    'Boil the chickpeas until soft. | Cook the cubed pumpkin in the oil with cumin, turmeric and chilli until soft. | Add the chickpeas, simmer for 5 minutes and serve with 2 rotis.');
  D('peaspulao','Peas pulao with dal','d','v','1 plate',30,[['rice',50],['peas',50],['toor',30],['oil',6]],['plate','#8DBF5A',Y],
    'Cook the rice with the peas, cumin and salt. | Boil the toor dal with turmeric and temper with garlic. | Serve together.');
  D('ragithoran','Cabbage and moong thoran with 2 ragi rotis','d','v','1 plate',30,[['ragi',60],['moong',30],['cabbage',120],['coconut',10],['oil',4]],['plate','#B9856A',G],
    'Knead the ragi flour with hot water and make 2 rotis. | Cook the shredded cabbage and soaked moong dal with mustard seeds, curry leaves and salt, then stir in the coconut. | Serve together.');
  D('spchanabowl','Sweet potato and chana bowl','d','v','1 bowl',25,[['sweetpotato',150],['chickpea',45],['spinach',60],['oil',5]],['bowl',OR,G],
    'Roast the cubed sweet potato in half the oil. | Boil the chickpeas. Wilt the spinach in the rest of the oil. | Combine with salt, pepper and lemon.');
  D('daliyadinner','Soya and vegetable daliya','d','v','1 large bowl',25,[['dalia',60],['mixveg',120],['soya',15],['oil',6]],['bowl',GD,G],
    'Soak the soya chunks and squeeze them dry. | Cook the vegetables and soya in the oil with spices, add the dalia and 3 cups of water. | Pressure cook for 3 whistles.');

  /* ===== Dinner: vegetarian (dairy) ===== */
  D('paneertikka','Paneer tikka with 2 rotis and salad','d','g','1 plate',30,[['paneer',90],['atta',60],['curd',30],['capsicum',40],['oil',4],['cucumber',50]],['plate',OR,TN],
    'Marinate the paneer and capsicum in the curd with chilli, turmeric, ginger-garlic and salt for 20 minutes. | Grill or pan cook with the oil until charred at the edges. | Serve with 2 rotis and the cucumber salad.');
  D('palakpaneer1','Palak paneer with 1 roti','d','g','1 plate',30,[['paneer',70],['spinach',150],['atta',40],['oil',6]],['plate','#3F7F3A',TN],
    'Blanch and blend the spinach. | Cook it with garlic, spices and the oil for 5 minutes. | Add the paneer cubes and serve with a roti.');
  D('daltadkaroti','Dal, curd and 2 rotis','d','g','1 plate',30,[['toor',35],['curd',100],['atta',60],['oil',6]],['plate',Y,TN],
    'Boil the toor dal with turmeric. | Temper with cumin, garlic and chilli in the oil. | Serve with the curd and 2 rotis.');
  D('paneerbhurjiroti','Paneer bhurji with 2 rotis','d','g','1 plate',20,[['paneer',80],['atta',60],['onion',30],['tomato',40],['oil',5]],['plate',Y,TN],
    'Cook the onion and tomato in the oil with spices. | Add the crumbled paneer and cook for 4 minutes. | Serve with 2 rotis.');
  D('khichdicurd','Moong khichdi with curd','d','g','1 bowl and 1 katori curd',25,[['rice',40],['moong',35],['curd',120],['oil',5]],['bowl','#E5C45E',WH],
    'Wash the rice and moong dal. | Cook with turmeric, salt and 4 cups of water for 3 whistles with a tempering of cumin in the oil. | Serve with the curd.');
  D('paneerquinoa','Paneer and vegetable stir-fry with quinoa','d','g','1 bowl',25,[['paneer',70],['quinoa',40],['broccoli',80],['capsicum',40],['oil',6]],['bowl','#E3D5A4',G],
    'Cook the quinoa in 2 parts water for 12 minutes. | Sear the paneer cubes in the oil, then stir-fry the broccoli and capsicum with pepper. | Combine and serve.');

  /* ===== Dinner: non-vegetarian ===== */
  D('grilledchickenveg','Grilled chicken with sauteed vegetables and 2 rotis','d','n','1 plate',30,[['chicken',150],['atta',50],['mixveg',120],['oil',8]],['plate',RB,TN],
    'Marinate the chicken with chilli, turmeric, lemon and salt for 20 minutes. | Grill for 7 to 8 minutes each side. Saute the vegetables in the oil with pepper. | Serve with 2 rotis.');
  D('fishtikkaroti','Fish tikka with roti and salad','d','n','1 plate',25,[['fish',150],['atta',50],['cucumber',50],['tomato',50],['oil',6]],['plate',OR,TN],
    'Marinate the fish with lemon, chilli, turmeric and salt. | Pan fry in the oil for 4 minutes each side. | Serve with 2 rotis and the salad.');
  D('chickensoup','Chicken and vegetable soup with toast','d','n','1 large bowl and 2 slices',30,[['chicken',120],['mixveg',150],['bread',60],['oil',4]],['bowl','#E9C27A',G],
    'Simmer the chicken with ginger, garlic and 3 cups of water for 15 minutes, then shred it. | Add the vegetables and cook for 8 minutes with pepper and salt. | Toast the bread and serve with the soup.');
  D('eggcurryroti','Egg curry with 2 rotis','d','n','1 plate',25,[['egg',150],['atta',50],['onion',40],['tomato',50],['oil',6]],['plate',OR,Y],
    'Boil the eggs and peel them. | Cook the onion and tomato in the oil with spices into a gravy. | Add the eggs, simmer for 5 minutes and serve with 2 rotis.');
  D('prawnquinoa','Prawn stir-fry with quinoa','d','n','1 plate',25,[['prawns',150],['quinoa',40],['mixveg',100],['oil',6]],['plate','#D9684A','#E3D5A4'],
    'Cook the quinoa. Saute the garlic in the oil. | Add the prawns and cook for 4 minutes until pink, then add the vegetables for 3 minutes. | Serve over the quinoa.');
  D('salmonrice','Baked salmon with vegetables and rice','d','n','1 plate',30,[['salmon',120],['rice',40],['mixveg',100],['oil',3]],['plate','#F0845A',WH],
    'Season the salmon with lemon, pepper and salt and bake at 200 C for 12 to 15 minutes. | Cook the rice and steam the vegetables. | Serve together.');
  D('chickentikkabowl','Chicken tikka salad bowl','d','n','1 bowl',30,[['chicken',150],['curd',40],['quinoa',30],['cucumber',60],['tomato',50],['lettuce',20]],['bowl',RB,G],
    'Marinate the chicken in the curd with tikka spices for 20 minutes and grill for 8 minutes each side. | Cook the quinoa. | Slice the chicken over the quinoa and fresh vegetables.');
  D('eggwhiteroti','Egg-white vegetable scramble with 2 rotis','d','n','1 plate',20,[['eggwhite',150],['egg',50],['atta',60],['mixveg',80],['oil',5]],['plate',WH,Y],
    'Cook the vegetables in the oil with pepper and salt. | Add the egg whites and whole egg and scramble on low heat until set. | Serve with 2 rotis.');

  /* ===== Snacks: vegan ===== */
  D('roastedchana','Roasted chana (small bowl)','s','v','1 small bowl',2,[['chickpea',35]],['bowl','#D9A860',CR],
    'Dry roast or air fry soaked and drained chickpeas until crisp, or use ready roasted chana. | Season with a pinch of salt and chaat masala.');
  D('sproutschaat','Sprouts chaat','s','v','1 katori',8,[['sprouts',120],['onion',20],['tomato',40],['lemon',5],['herbs',5],['chickpea',15]],['bowl','#9BCB5E',RB],
    'Steam the sprouts for 3 minutes. | Mix with chopped onion, tomato and boiled chickpeas. | Add lemon juice, salt, chaat masala and coriander.');
  D('makhanasnack','Roasted makhana','s','v','1 bowl',6,[['makhana',30],['oil',3]],['bowl',CR,GD],
    'Dry roast the makhana for 5 minutes until crisp. | Toss with the oil, salt and pepper while still warm.');
  D('peanutsnack','Roasted peanuts (a handful)','s','v','1 handful, 25 g',2,[['peanut',25]],['beans','#C99A5B'],
    'Dry roast the peanuts on a pan for 4 minutes. | Cool and eat a measured handful with a pinch of salt.');
  D('fruitbowl','Seasonal fruit bowl','s','v','1 bowl',3,[['papaya',100],['apple',80],['guava',60]],['fruit','#F59E4B','#E5483B'],
    'Wash and chop the fruit into cubes. | Add a squeeze of lemon and eat fresh.');
  D('bananapb','Banana with peanut butter','s','v','1 banana and 1 tbsp',2,[['banana',100],['pbutter',15]],['fruit',Y,BR],
    'Slice the banana lengthways. | Spread with the peanut butter.');
  D('sattudrink','Sattu drink','s','v','1 glass',3,[['sattu',30],['lemon',8],['jaggery',8]],['glass','#C9A66B',CR],
    'Stir the sattu into a glass of cold water until no lumps remain. | Add lemon juice, roasted cumin and salt, or a little jaggery for a sweet version.');
  D('soydates','Soy milk with 2 dates','s','v','1 glass and 2 dates',2,[['soymilk',250],['dates',20]],['glass',CR,BR],
    'Chill the soy milk. | Serve with the dates.');
  D('vegsoup','Clear vegetable and soya soup','s','v','1 bowl',15,[['mixveg',150],['oil',3],['soya',10]],['bowl','#E9C27A',G],
    'Soak the soya chunks and chop them fine. | Simmer them with the vegetables, garlic, pepper and salt in 2 cups of water for 10 minutes. | Finish with the oil.');
  D('hummussticks','Chickpea dip with cucumber and carrot sticks','s','v','1 bowl',10,[['chickpea',25],['sesame',5],['oil',4],['cucumber',80],['carrot',60]],['bowl','#E8D4A0',OR],
    'Boil the chickpeas until soft. | Blend with the sesame, oil, lemon, garlic and salt into a smooth dip. | Serve with the cucumber and carrot sticks.');
  D('cornchaat','Steamed sweet corn chaat','s','v','1 cup',8,[['corn',120],['lemon',5],['herbs',3]],['bowl',Y,G],
    'Steam or boil the corn for 8 minutes. | Toss with lemon juice, salt, chilli and coriander.');
  D('soyachaat','Soya chunk chaat','s','v','1 bowl',12,[['soya',20],['onion',20],['tomato',30],['cucumber',40],['lemon',5]],['bowl',BR,G],
    'Soak the soya chunks in hot water, squeeze them dry and boil for 5 minutes. | Pan roast lightly with chilli and salt. | Mix with the chopped vegetables and lemon.');
  D('datebites','Date and seed energy bites (2)','s','v','2 bites',10,[['dates',25],['oats',10],['pumpkinseed',8]],['fruit',BR,CR],
    'Blend the dates with the oats and pumpkin seeds into a sticky mix. | Roll into 2 small balls. | Chill for 15 minutes.');
  D('orangepom','Orange and pomegranate bowl','s','v','1 bowl',3,[['orange',150],['pomegranate',60]],['fruit',OR,'#C2185B'],
    'Peel and segment the orange. | Mix with the pomegranate seeds and serve chilled.');
  D('besancheela','Mini besan cheela (1)','s','v','1 cheela',10,[['besan',30],['onion',20],['oil',3]],['disc',Y,G],
    'Make a thin batter with the besan, water and salt. | Add the chopped onion and chilli. | Cook on an oiled pan on both sides until golden.');
  D('chiasoy','Chia soy pudding with dates','s','v','1 small jar',5,[['soymilk',150],['chia',15],['dates',10]],['glass',CR,GD],
    'Stir the chia seeds into the soy milk and leave in the fridge for 2 hours. | Chop the dates and stir in.');
  D('ragimalt','Ragi malt','s','v','1 glass',8,[['ragi',20],['soymilk',150],['jaggery',6]],['glass','#B9856A',CR],
    'Mix the ragi flour with the soy milk into a paste. | Cook on low heat for 4 minutes until thick. | Add the jaggery and serve warm.');

  /* ===== Snacks: vegetarian (dairy) ===== */
  D('greeksnack','Greek yogurt with apple','s','g','1 bowl',3,[['greek',150],['apple',80]],['bowl',WH,'#E5483B'],
    'Spoon the Greek yogurt into a bowl. | Top with chopped apple and a pinch of cinnamon.');
  D('paneercubes','Paneer cubes with cucumber','s','g','1 plate',5,[['paneer',50],['cucumber',80],['lemon',5]],['plate',CR,G],
    'Cube the paneer and sprinkle with black pepper, salt and lemon. | Serve with the cucumber slices.');
  D('chaaschana','Masala buttermilk with roasted chana','s','g','1 glass and 1 small bowl',3,[['buttermilk',250],['chickpea',20]],['glass',WH,'#D9A860'],
    'Blend the buttermilk with roasted cumin, salt and mint. | Serve cold with the roasted chana.');
  D('milkdates','Warm milk with dates','s','g','1 glass',3,[['milk',250],['dates',15]],['glass',CR,BR],
    'Warm the milk gently. | Chop the dates and stir in.');
  D('curdchia','Curd with chia and papaya','s','g','1 bowl',3,[['curd',150],['chia',8],['papaya',80]],['bowl',WH,OR],
    'Stir the chia into the curd and rest for 5 minutes. | Top with papaya cubes.');
  D('paneertikkasnack','Paneer tikka (4 pieces)','s','g','4 pieces',15,[['paneer',60],['capsicum',40],['oil',3]],['plate',OR,G],
    'Marinate the paneer and capsicum with chilli, turmeric, ginger-garlic and salt. | Grill with the oil until lightly charred.');
  D('wheyshake','Whey protein shake with banana','s','g','1 large glass',3,[['whey',25],['milk',200],['banana',60]],['glass',CR,Y],
    'Blend the whey, milk and banana for 30 seconds. | Serve cold.');

  /* ===== Snacks: non-vegetarian ===== */
  D('boiled2eggs','2 boiled eggs','s','n','2 eggs',12,[['egg',100]],['egg',Y,Y],
    'Boil the eggs for 9 to 10 minutes. | Cool, peel and sprinkle with pepper and salt.');
  D('eggwhitebhurji','Egg-white vegetable bhurji','s','n','1 small plate',8,[['eggwhite',120],['onion',20],['tomato',20],['oil',3]],['plate',WH,Y],
    'Cook the onion and tomato in the oil. | Add the egg whites with salt and pepper and scramble until set.');
  D('chickentikkasnack','Chicken tikka (4 pieces)','s','n','4 pieces',25,[['chicken',80],['curd',20],['lemon',5]],['plate',RB,G],
    'Marinate the chicken in the curd with tikka spices and lemon for 20 minutes. | Grill for 6 to 7 minutes each side until cooked through.');
  D('tunacucumber','Tuna cucumber boats','s','n','4 pieces',8,[['tuna',60],['cucumber',100],['lemon',5]],['plate','#C8B79F',G],
    'Cut the cucumber into thick slices and scoop out the centre. | Mix the tuna with lemon, pepper and salt and fill the slices.');
  D('chickensoupsnack','Clear chicken soup','s','n','1 bowl',25,[['chicken',80],['mixveg',100]],['bowl','#E9C27A',G],
    'Simmer the chicken and vegetables with ginger, garlic and pepper in 2 cups of water for 15 minutes. | Shred the chicken and serve hot.');
  D('eggsprouts','Egg and sprouts salad','s','n','1 bowl',12,[['egg',50],['sprouts',100],['tomato',30],['onion',15]],['bowl','#9BCB5E',Y],
    'Boil the egg and chop it. | Steam the sprouts for 3 minutes. | Mix everything with lemon, salt and pepper.');
  D('fishbites','Grilled fish bites','s','n','1 plate',20,[['fish',100],['lemon',5]],['plate','#C4733A',G],
    'Marinate the fish with lemon, turmeric, chilli and salt. | Pan grill for 3 to 4 minutes each side.');


  /* ===== Added dishes: vegan, low budget, every meal ===== */
  D("sabudanakhichdi","Sabudana khichdi","b",'v',"1 plate",20,[["sabudana", 60], ["peanut", 15], ["potato", 50], ["oil", 6], ["lemon", 5], ["herbs", 3]],["bowl", "#F7F0DC", "#5BAE4E"],
    "Soak the sabudana for 4 to 5 hours, drain well and mix with crushed roasted peanuts and salt. | Heat the oil, add cumin seeds, green chilli and diced boiled potato and cook for 2 minutes. | Add the sabudana and cook on low heat for 5 minutes until the pearls turn clear. Finish with lemon and coriander.");
  D("semiyaupma","Vegetable semiya upma","b",'v',"1 plate",15,[["sevai", 50], ["onion", 30], ["carrot", 30], ["peas", 30], ["oil", 6], ["herbs", 3]],["bowl", "#E6B870", "#5BAE4E"],
    "Dry roast the vermicelli until light golden and set it aside. | Heat the oil, crackle mustard seeds and curry leaves, then cook the onion, carrot and peas with salt. | Add 1 cup of hot water, stir in the vermicelli, cover and cook for 3 minutes until the water is absorbed.");
  D("alooparatha","Aloo paratha (2 small) with mint chutney","b",'v',"2 small parathas",25,[["atta", 70], ["potato", 100], ["oil", 8], ["herbs", 8]],["disc", "#E6B870", "#5BAE4E"],
    "Knead the atta with water and salt into a soft dough. | Mash the boiled potato with green chilli, coriander, cumin and salt. | Stuff each dough ball, roll gently and cook on a hot tawa with a little oil until golden on both sides. Serve with mint chutney.");
  D("methithepla","Methi thepla (2)","b",'v',"2 theplas",20,[["atta", 50], ["besan", 10], ["methi", 30], ["oil", 6]],["disc", "#D9C27A", "#5BAE4E"],
    "Mix the atta, besan, chopped methi, turmeric, chilli, ajwain and salt. | Knead into a soft dough with water and 1 tsp of the oil. | Roll thin and cook on a hot tawa with the rest of the oil until spotted on both sides.");
  D("pesarattu","Pesarattu (2) with ginger chutney","b",'v',"2 pesarattu",20,[["moong", 60], ["rice", 10], ["onion", 25], ["ginger", 5], ["oil", 6]],["disc", "#C9D86B", "#5BAE4E"],
    "Soak the whole green moong (or moong dal) and rice for 4 hours. | Grind with ginger, green chilli and salt into a smooth batter. | Spread thin on a hot tawa, scatter chopped onion, drizzle oil and cook until crisp. Serve with ginger chutney.");
  D("ragidosa","Ragi dosa (2) with coconut chutney","b",'v',"2 dosas and chutney",15,[["ragi", 40], ["rice", 20], ["onion", 20], ["coconut", 15], ["oil", 5]],["disc", "#9C6E57", "#F7F0DC"],
    "Mix the ragi flour and rice flour (or ground rice) with water, salt and chopped onion into a thin batter and rest 10 minutes. | Pour onto a hot tawa from the edges inward and cook with a little oil until crisp. | Grind the coconut with green chilli and salt for the chutney.");
  D("sproutsusal","Sprouts usal with 1 pav","b",'v',"1 bowl and 1 pav",20,[["sprouts", 120], ["onion", 30], ["tomato", 40], ["oil", 6], ["bread", 40], ["herbs", 3]],["bowl", "#B5651D", "#5BAE4E"],
    "Heat the oil, crackle mustard seeds and cook the onion until soft. | Add tomato, turmeric, chilli and goda or garam masala, then the sprouts with 1 cup of water. | Simmer for 10 minutes, top with coriander and serve with the pav.");
  D("bananapancake","Banana oat pancakes (2)","b",'v',"2 pancakes",15,[["oats", 50], ["banana", 80], ["soymilk", 60], ["oil", 4]],["disc", "#E6B870", "#F2C94C"],
    "Grind the oats into flour. | Mash the banana and mix with the oat flour, soy milk and a pinch of cinnamon into a thick batter. | Cook small pancakes on a lightly oiled pan for 2 minutes each side.");
  D("soojicheela","Sooji vegetable cheela (2)","b",'v',"2 cheelas",15,[["sooji", 50], ["onion", 25], ["tomato", 25], ["capsicum", 20], ["oil", 6], ["herbs", 3]],["disc", "#E6B870", "#E8913A"],
    "Mix the sooji with water and salt and rest for 10 minutes. | Stir in the chopped onion, tomato, capsicum and coriander. | Spread on a hot, oiled tawa and cook both sides until golden.");
  D("khamandhokla","Khaman dhokla (4 pieces) with green chutney","b",'v',"4 pieces",25,[["besan", 50], ["oil", 4], ["lemon", 8], ["herbs", 5]],["plate", "#F2C94C", "#5BAE4E"],
    "Whisk the besan with water, lemon juice, ginger-chilli paste, sugar and salt, then add fruit salt. | Steam in a greased tin for 15 minutes and cut into squares. | Temper mustard seeds and curry leaves in the oil, pour over and serve with green chutney.");
  D("uttapam","Onion tomato uttapam (2)","b",'v',"2 uttapams",20,[["rice", 50], ["urad", 12], ["onion", 30], ["tomato", 30], ["capsicum", 15], ["oil", 6]],["disc", "#F7F0DC", "#E8913A"],
    "Use fermented idli-dosa batter (rice and urad dal). | Spread a thick round on a hot tawa and press chopped onion, tomato and capsicum on top. | Drizzle oil, cover and cook, then flip and cook the topping side for 1 minute.");
  D("besantoast","Besan toast (2 slices)","b",'v',"2 slices",12,[["bread", 60], ["besan", 30], ["onion", 20], ["tomato", 20], ["oil", 6], ["herbs", 3]],["toast", "#F2C94C", "#E8913A"],
    "Mix the besan with water, chopped onion, tomato, coriander, chilli and salt into a thick batter. | Spread the batter on one side of each bread slice. | Cook batter-side down on a lightly oiled pan until golden, then toast the other side.");
  D("soyapoha","Soya poha","b",'v',"1 plate",15,[["poha", 50], ["soya", 15], ["onion", 30], ["peas", 30], ["oil", 6], ["lemon", 5]],["bowl", "#F2C94C", "#8B5E34"],
    "Soak the soya granules or chunks in hot water for 10 minutes, squeeze and chop. Rinse the poha. | Heat the oil, crackle mustard seeds and curry leaves, then cook the onion, peas and soya with turmeric and salt. | Add the poha, toss for 2 minutes and finish with lemon and coriander.");
  D("aloosandwich","Aloo matar grilled sandwich","b",'v',"1 sandwich",15,[["bread", 60], ["potato", 80], ["peas", 20], ["onion", 15], ["oil", 3], ["herbs", 5]],["toast", "#E6B870", "#5BAE4E"],
    "Mash the boiled potato and peas with onion, coriander, chaat masala and salt. | Spread the filling between the bread slices with a little green chutney. | Grill or toast on a lightly oiled pan until crisp on both sides.");
  D("aloogobidal","Aloo gobi with 2 rotis and moong dal","l",'v',"1 plate",30,[["atta", 60], ["potato", 80], ["cauliflower", 100], ["moong", 25], ["oil", 10]],["plate", "#F2C94C", "#E6B870"],
    "Cook the cauliflower and potato in half the oil with cumin, turmeric, chilli and salt, covered, until tender. | Pressure cook the moong dal with turmeric and salt and temper with cumin in the rest of the oil. | Serve both with 2 hot rotis.");
  D("bhindidal","Bhindi masala with 2 rotis and dal","l",'v',"1 plate",30,[["bhindi", 150], ["onion", 30], ["atta", 60], ["toor", 25], ["oil", 10]],["plate", "#5BAE4E", "#F2C94C"],
    "Wash and dry the bhindi fully, then slice it. | Cook it in most of the oil with onion, turmeric, chilli, coriander powder and amchur until no longer sticky. | Serve with toor dal tempered in the rest of the oil and 2 rotis.");
  D("bainganbharta","Baingan bharta with 2 rotis","l",'v',"1 plate",30,[["brinjal", 200], ["onion", 40], ["tomato", 50], ["atta", 70], ["oil", 8]],["plate", "#7B4B6A", "#E6B870"],
    "Roast the brinjal over a flame until the skin chars, then peel and mash. | Cook the onion, tomato, garlic and chilli in the oil until soft. | Add the mashed brinjal and salt, cook for 5 minutes and serve with 2 rotis.");
  D("kalachanarice","Kala chana curry with rice","l",'v',"1 plate",35,[["kalachana", 50], ["onion", 40], ["tomato", 50], ["rice", 60], ["oil", 8]],["plate", "#6B3E26", "#F7F0DC"],
    "Soak the kala chana overnight and pressure cook for 6 whistles. | Cook the onion, ginger-garlic and tomato in the oil with turmeric, chilli and garam masala. | Add the chana with some cooking water, simmer 10 minutes and serve with rice.");
  D("lobiaroti","Lobia curry with 2 rotis","l",'v',"1 plate",35,[["lobia", 45], ["onion", 40], ["tomato", 50], ["atta", 60], ["oil", 8]],["beans", "#C9A27E", "#8E2F2A"],
    "Soak the lobia for 6 hours and pressure cook for 3 whistles. | Make a masala with the onion, tomato, ginger-garlic and spices in the oil. | Add the lobia, simmer for 10 minutes and serve with 2 rotis.");
  D("aloomatar","Aloo matar with 2 rotis and salad","l",'v',"1 plate",25,[["potato", 100], ["peas", 60], ["onion", 30], ["tomato", 50], ["atta", 70], ["oil", 8], ["cucumber", 50]],["plate", "#E8913A", "#5BAE4E"],
    "Cook the onion and tomato masala in the oil with cumin and spices. | Add the cubed potato, peas and 1 cup of water and cook covered until soft. | Serve with 2 rotis and sliced cucumber.");
  D("masoorjeera","Masoor dal with jeera rice","l",'v',"1 plate",25,[["masoor", 45], ["rice", 70], ["onion", 20], ["tomato", 30], ["oil", 8]],["plate", "#E8913A", "#F7F0DC"],
    "Pressure cook the masoor dal with tomato, turmeric and salt. | Temper with cumin, garlic and onion in half the oil. | Cook the rice with cumin fried in the rest of the oil and serve together.");
  D("rajmaroti","Rajma with 2 rotis","l",'v',"1 plate",40,[["rajma", 50], ["onion", 40], ["tomato", 60], ["atta", 70], ["oil", 8]],["beans", "#8E2F2A", "#E6B870"],
    "Soak the rajma overnight and pressure cook until very soft. | Cook the onion, ginger-garlic and tomato in the oil with spices until thick. | Add the rajma, simmer for 15 minutes and serve with 2 rotis.");
  D("lemonrice","Lemon rice with peanuts and sprouts salad","l",'v',"1 plate",20,[["rice", 70], ["peanut", 15], ["oil", 6], ["lemon", 10], ["sprouts", 80], ["tomato", 30]],["plate", "#F2C94C", "#5BAE4E"],
    "Cook the rice and let it cool. | Temper mustard seeds, chana dal, curry leaves, peanuts and turmeric in the oil, then toss in the rice with lemon juice and salt. | Serve with the sprouts mixed with tomato, salt and lemon.");
  D("methialoobajra","Methi aloo with 2 bajra rotis","l",'v',"1 plate",30,[["methi", 80], ["potato", 100], ["bajra", 70], ["oil", 8]],["plate", "#5BAE4E", "#8B5E34"],
    "Cook the cubed potato in the oil with cumin, garlic and turmeric until nearly soft. | Add the chopped methi and salt and cook until wilted. | Knead the bajra flour with warm water, pat into rotis and cook on a tawa.");
  D("mixvegdal","Mixed veg sabzi with 2 rotis and moong dal","l",'v',"1 plate",30,[["mixveg", 150], ["atta", 70], ["moong", 30], ["oil", 10]],["plate", "#E8913A", "#5BAE4E"],
    "Cook the mixed vegetables in most of the oil with cumin, turmeric, chilli and salt. | Pressure cook the moong dal and temper with cumin in the rest of the oil. | Serve both with 2 rotis.");
  D("soyapulao","Soya chunk pulao","l",'v',"1 plate",25,[["rice", 60], ["soya", 25], ["mixveg", 60], ["onion", 30], ["oil", 8]],["plate", "#F7F0DC", "#8B5E34"],
    "Soak the soya chunks in hot water for 10 minutes and squeeze dry. | Fry whole spices and onion in the oil, add the soya and vegetables and cook for 3 minutes. | Add the rinsed rice and water, cook covered until done.");
  D("pavbhaji","Pav bhaji (2 pav)","l",'v',"1 plate",30,[["bread", 80], ["mixveg", 120], ["potato", 60], ["peas", 30], ["onion", 30], ["tomato", 50], ["oil", 10]],["plate", "#C2410C", "#E6B870"],
    "Boil and mash the potato, peas and vegetables. | Cook the onion and tomato in most of the oil, add pav bhaji masala and the mashed vegetables and simmer for 10 minutes. | Toast the pav with the rest of the oil and serve with chopped onion and lemon.");
  D("cholechawal","Chole chawal","l",'v',"1 plate",40,[["chickpea", 50], ["onion", 40], ["tomato", 60], ["rice", 60], ["oil", 8]],["plate", "#C2410C", "#F7F0DC"],
    "Soak the chickpeas overnight and pressure cook until soft. | Cook the onion, ginger-garlic and tomato with chole masala in the oil. | Add the chickpeas and simmer 15 minutes. Serve with rice.");
  D("laukimoong","Lauki sabzi with 2 rotis and moong dal","d",'v',"1 plate",25,[["lauki", 200], ["atta", 60], ["moong", 30], ["oil", 8]],["plate", "#C9D86B", "#F2C94C"],
    "Cook the diced lauki with cumin, turmeric, tomato and salt in half the oil until soft. | Pressure cook the moong dal and temper in the rest of the oil. | Serve with 2 rotis.");
  D("cabbagematar","Cabbage matar with 2 rotis and dal","d",'v',"1 plate",25,[["cabbage", 150], ["peas", 40], ["atta", 60], ["toor", 25], ["oil", 8]],["plate", "#C9D86B", "#5BAE4E"],
    "Cook the shredded cabbage and peas with cumin, turmeric and salt in half the oil until tender. | Cook the toor dal and temper in the rest of the oil. | Serve with 2 rotis.");
  D("tomatodal","Tomato dal with jeera rice","d",'v',"1 plate",25,[["toor", 40], ["tomato", 80], ["rice", 50], ["oil", 7]],["plate", "#E8913A", "#F7F0DC"],
    "Pressure cook the toor dal with chopped tomato, turmeric and salt. | Temper with mustard seeds, garlic and red chilli in half the oil. | Serve with rice cooked with cumin in the rest of the oil.");
  D("kalachanaroti","Kala chana sabzi with 2 rotis","d",'v',"1 plate",35,[["kalachana", 45], ["onion", 30], ["tomato", 40], ["atta", 60], ["oil", 7]],["plate", "#6B3E26", "#E6B870"],
    "Soak the kala chana overnight and pressure cook until soft. | Cook it dry with onion, tomato, amchur and garam masala in the oil. | Serve with 2 rotis.");
  D("lobiarice","Lobia masala with rice","d",'v',"1 plate",35,[["lobia", 45], ["onion", 30], ["tomato", 50], ["rice", 50], ["oil", 7]],["plate", "#C9A27E", "#F7F0DC"],
    "Soak and pressure cook the lobia. | Make an onion-tomato masala in the oil and add the lobia with some water. | Simmer for 10 minutes and serve with rice.");
  D("aloobaingan","Aloo baingan with 2 rotis","d",'v',"1 plate",25,[["potato", 80], ["brinjal", 120], ["onion", 30], ["atta", 60], ["oil", 8]],["plate", "#7B4B6A", "#F2C94C"],
    "Cut the potato and brinjal into cubes. | Cook with onion, cumin, turmeric, chilli and amchur in the oil, covered, until soft. | Serve with 2 rotis.");
  D("pumpkindal","Pumpkin sabzi with 2 rotis and masoor dal","d",'v',"1 plate",25,[["pumpkin", 150], ["atta", 60], ["masoor", 30], ["oil", 8]],["plate", "#E8913A", "#E6B870"],
    "Cook the cubed pumpkin with fenugreek seeds, chilli, a little jaggery and salt in half the oil until soft. | Cook the masoor dal and temper in the rest of the oil. | Serve with 2 rotis.");
  D("rasamrice","Rasam rice with beans poriyal","d",'v',"1 plate",25,[["toor", 20], ["tomato", 60], ["rice", 60], ["beans", 100], ["coconut", 10], ["oil", 6]],["plate", "#C2410C", "#5BAE4E"],
    "Boil the tomato with tamarind, rasam powder and the cooked toor dal water, then temper with mustard and curry leaves. | Stir-fry the chopped beans in the oil with mustard seeds and finish with grated coconut. | Serve both with rice.");
  D("bhindijowar","Bhindi sabzi with 2 jowar rotis and dal","d",'v',"1 plate",30,[["bhindi", 150], ["jowar", 60], ["toor", 25], ["oil", 8]],["plate", "#5BAE4E", "#D9C27A"],
    "Cook the sliced bhindi in half the oil with spices until crisp-tender. | Knead the jowar flour with warm water, pat and cook the rotis. | Serve with toor dal tempered in the rest of the oil.");
  D("soyacurryroti","Soya chunk curry with 2 rotis","d",'v',"1 plate",30,[["soya", 35], ["onion", 40], ["tomato", 60], ["atta", 60], ["oil", 7]],["plate", "#8B5E34", "#E6B870"],
    "Soak the soya chunks in hot water and squeeze dry. | Cook an onion-tomato-ginger masala in the oil, add the soya and 1 cup of water and simmer 10 minutes. | Serve with 2 rotis.");
  D("mushroompulao","Mushroom matar pulao","d",'v',"1 plate",25,[["rice", 60], ["mushroom", 100], ["peas", 40], ["onion", 25], ["oil", 7]],["plate", "#F7F0DC", "#8B5E34"],
    "Fry whole spices and onion in the oil. | Add the sliced mushrooms and peas and cook for 3 minutes. | Add the rinsed rice, water and salt and cook covered until done.");
  D("tofupalak","Tofu palak with 2 rotis","d",'v',"1 plate",25,[["tofu", 100], ["spinach", 150], ["atta", 60], ["oil", 6]],["plate", "#3F7D3A", "#F7F0DC"],
    "Blanch the spinach and blend it smooth. | Cook garlic, onion and spices in the oil, add the spinach purée and simmer 5 minutes. | Add the tofu cubes, warm through and serve with 2 rotis.");
  D("gobimatar","Gobi matar with 2 rotis and moong dal","d",'v',"1 plate",25,[["cauliflower", 150], ["peas", 40], ["atta", 60], ["moong", 25], ["oil", 8]],["plate", "#F7F0DC", "#5BAE4E"],
    "Cook the cauliflower and peas with ginger, tomato and spices in half the oil, covered, until tender. | Cook the moong dal and temper in the rest of the oil. | Serve with 2 rotis.");
  D("daldhokli","Dal dhokli","d",'v',"1 large bowl",35,[["toor", 40], ["atta", 50], ["tomato", 30], ["peanut", 8], ["oil", 6]],["bowl", "#F2C94C", "#E6B870"],
    "Cook the toor dal and whisk it with water, tomato, jaggery, kokum or lemon, peanuts and spices into a thin dal. | Knead the atta with turmeric and ajwain, roll thin and cut into diamonds. | Simmer the pieces in the boiling dal for 10 minutes and temper with mustard seeds in the oil.");
  D("kadaiveg","Kadai vegetable with 2 rotis","d",'v',"1 plate",25,[["mixveg", 150], ["capsicum", 50], ["onion", 30], ["tomato", 50], ["atta", 60], ["oil", 8]],["plate", "#E8913A", "#5BAE4E"],
    "Dry roast and crush coriander seeds and red chilli for kadai masala. | Cook the onion and tomato in the oil, add the vegetables, capsicum and masala and cook until just tender. | Serve with 2 rotis.");
  D("chanapeanut","Roasted chana and peanut mix","s",'v',"1 small bowl",2,[["chickpea", 20], ["peanut", 15]],["bowl", "#C9A27E", "#B5651D"],
    "Mix roasted chana and roasted peanuts. | Add a pinch of chaat masala and salt.");
  D("kalachanachaat","Kala chana chaat","s",'v',"1 bowl",10,[["kalachana", 35], ["onion", 20], ["tomato", 30], ["lemon", 5], ["herbs", 3]],["bowl", "#6B3E26", "#E8913A"],
    "Use kala chana that has been soaked and boiled. | Toss with chopped onion, tomato, coriander, lemon juice, chaat masala and salt.");
  D("sproutsbhel","Bhel with sprouts","s",'v',"1 bowl",10,[["murmura", 25], ["sprouts", 50], ["onion", 20], ["tomato", 25], ["peanut", 10], ["lemon", 5]],["bowl", "#F7F0DC", "#5BAE4E"],
    "Mix the puffed rice, sprouts, onion, tomato and roasted peanuts. | Add lemon, green chutney, chaat masala and salt just before eating.");
  D("guavachaat","Guava with chaat masala","s",'v',"1 guava",2,[["guava", 150]],["fruit", "#8DBF5A", "#F3B6C0"],
    "Cut the guava into wedges. | Sprinkle chaat masala and a pinch of salt.");
  D("watermelonbowl","Watermelon bowl","s",'v',"1 large bowl",3,[["watermelon", 300]],["bowl", "#E5483B", "#5BAE4E"],
    "Cube chilled watermelon. | Add a few mint leaves and a pinch of black salt if you like.");
  D("pohachivda","Roasted poha chivda","s",'v',"1 small bowl",10,[["poha", 30], ["peanut", 10], ["oil", 4]],["bowl", "#F2C94C", "#B5651D"],
    "Dry roast thin poha on low heat until crisp. | Fry peanuts, curry leaves, turmeric and chilli in the oil, add the poha and salt and toss.");
  D("chanasundal","Chana sundal","s",'v',"1 bowl",10,[["chickpea", 30], ["coconut", 10], ["oil", 2]],["bowl", "#E6B870", "#F7F0DC"],
    "Use chickpeas that have been soaked and boiled. | Temper mustard seeds, curry leaves and green chilli in the oil, add the chickpeas and salt and finish with grated coconut.");
  D("bhutta","Roasted bhutta (corn on the cob)","s",'v',"1 cob",10,[["corn", 150], ["lemon", 5]],["fruit", "#F2C94C", "#5BAE4E"],
    "Roast the corn cob over a flame, turning, until charred in spots. | Rub with lemon dipped in salt and chilli powder.");
  D("peanutchikki","Peanut chikki (1 piece)","s",'v',"1 piece",1,[["peanut", 20], ["jaggery", 15]],["plate", "#B5651D", "#E6B870"],
    "Melt the jaggery until it turns thick and golden. | Mix in roasted peanuts, spread thin on a greased plate and cut while warm.");
  D("dateladoo","Date and peanut ladoo (2)","s",'v',"2 ladoos",10,[["dates", 20], ["peanut", 15]],["plate", "#7B4B32", "#B5651D"],
    "Blend pitted dates and roasted peanuts into a sticky mix. | Roll into 2 balls.");
  D("soybananashake","Soy milk banana shake","s",'v',"1 glass",3,[["soymilk", 200], ["banana", 80]],["glass", "#F7F0DC", "#F2C94C"],
    "Blend the soy milk with the banana and a pinch of cardamom. | Serve chilled.");
  D("vegsticks","Cucumber and carrot sticks with peanut chutney","s",'v',"1 plate",10,[["cucumber", 80], ["carrot", 60], ["peanut", 15], ["lemon", 5]],["plate", "#5BAE4E", "#E8913A"],
    "Cut the cucumber and carrot into sticks. | Grind roasted peanuts with green chilli, lemon, salt and a little water into a chutney for dipping.");
  D("spchaatsnack","Roasted sweet potato chaat","s",'v',"1 bowl",20,[["sweetpotato", 150], ["lemon", 5], ["herbs", 3]],["bowl", "#E8913A", "#5BAE4E"],
    "Roast or boil the sweet potato and cut it into cubes. | Toss with lemon, chaat masala, coriander and salt.");

  /* ---- computed nutrition ---- */
  var DISHMAP = {};
  DISHES.forEach(function(x){
    var k=0,p=0,c=0,f=0,fi=0,cost=3,al={},rich=[];
    x.ing.forEach(function(it){
      var g = ING[it[0]], w = it[1]/100;
      if(!g) throw new Error('Unknown ingredient '+it[0]+' in '+x.id);
      k += g[1]*w; p += g[2]*w; c += g[3]*w; f += g[4]*w; fi += g[5]*w; cost += g[6]*w;
      g[7].forEach(function(a){al[a]=1});
      if(g[8] && it[1]>=25 && rich.indexOf(g[8])<0 && g[8]!=='Energy' && g[8]!=='Hydration') rich.push(g[8]);
    });
    x.k = Math.round(k); x.p = Math.round(p*10)/10; x.c = Math.round(c*10)/10; x.f = Math.round(f*10)/10; x.fi = Math.round(fi*10)/10;
    x.cost = Math.round(cost); x.pr = cost<=45 ? 1 : cost<=95 ? 2 : 3;
    x.a = Object.keys(al);
    x.rich = rich.slice(0,3).join('; ');
    DISHMAP[x.id] = x;
  });


