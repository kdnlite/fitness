  /* ==== KDN LANGUAGE START ==== English / हिंदी. Text on screen is swapped as it appears, so every screen
     needs no changes. Dish and exercise names stay in English, as people search for them that way. */
  function kLang(v){
    if(v){ try{ localStorage.setItem('kdn.lang',v); }catch(e){} kLang.v = v; }
    if(!kLang.v){ try{ kLang.v = localStorage.getItem('kdn.lang') || 'en'; }catch(e){ kLang.v = 'en'; } }
    return kLang.v;
  }
  function kLangToggle(){ kLang(kLang()==='hi' ? 'en' : 'hi'); buzz('ok'); location.reload(); }
  function hiDict(){ if(hiDict.d) return hiDict.d; var D = {
    /* navigation and common words */
    'Home':'होम','Steps':'कदम','Diet':'डाइट','Workout':'वर्कआउट','Track':'ट्रैक','Back':'वापस','Close':'बंद करें','Done':'हो गया','Save':'सेव करें','Delete':'हटाएँ','Cancel':'रद्द करें','Edit':'बदलें',
    'Next':'आगे','Share':'शेयर करें','Got it':'ठीक है','Allow':'अनुमति दें','Apply':'लागू करें','Unlock':'अनलॉक करें','Preview':'झलक','Not now':'अभी नहीं','Log out':'लॉग आउट','Log out?':'लॉग आउट करें?',
    'Stay logged in':'लॉग इन रहें','Open menu':'मेनू खोलें','Close menu':'मेनू बंद करें','Main menu':'मुख्य मेनू','App navigation':'ऐप नेविगेशन','Start page':'शुरुआती पेज','Today':'आज','Yesterday':'कल',
    'Now':'अभी','Week':'हफ़्ता','Month':'महीना','Day':'दिन','All':'सब','More':'ज़्यादा','Less':'कम','None':'कुछ नहीं','Date':'तारीख','Time':'समय','Unit':'इकाई','Name':'नाम','Age':'उम्र','Gender':'लिंग',
    'Height':'लंबाई','Weight':'वज़न','Goal':'लक्ष्य','Target':'लक्ष्य','Budget':'बजट','Plan':'प्लान','Plans':'प्लान','Food':'खाना','Meals':'भोजन','Water':'पानी','Body':'शरीर','Progress':'प्रगति','progress':'प्रगति',
    'You':'आप','Male':'पुरुष','Female':'महिला','Other':'अन्य','days':'दिन','hours':'घंटे','steps':'कदम','today':'आज','today.':'आज।','active':'सक्रिय','about':'लगभग','open':'खुला','Fitness':'फ़िटनेस','Tracker':'ट्रैकर',
    'Mon':'सोम','Tue':'मंगल','Wed':'बुध','Thu':'गुरु','Fri':'शुक्र','Sat':'शनि','Sun':'रवि','Monday':'सोमवार','Tuesday':'मंगलवार','Wednesday':'बुधवार','Thursday':'गुरुवार','Friday':'शुक्रवार','Saturday':'शनिवार','Sunday':'रविवार',
    'Breakfast':'नाश्ता','Lunch':'दोपहर का खाना','Dinner':'रात का खाना','Mid-morning snack':'सुबह का स्नैक','Evening snack':'शाम का स्नैक','snacks':'स्नैक्स','lunch ·':'दोपहर ·','dinner ·':'रात ·','breakfast ·':'नाश्ता ·',
    'Protein':'प्रोटीन','protein':'प्रोटीन','Carbs':'कार्ब्स','Carbohydrates':'कार्बोहाइड्रेट','Fat':'फ़ैट','Fibre':'फ़ाइबर','Calories':'कैलोरी','Vegan':'वीगन','Vegetarian':'शाकाहारी','Non-vegetarian':'मांसाहारी',
    'Gluten':'ग्लूटेन','Chest':'छाती','Legs':'पैर','Shoulders':'कंधे','Biceps':'बाइसेप्स','Triceps':'ट्राइसेप्स','Glutes':'हिप्स','Abs & core':'पेट और कोर','Cardio':'कार्डियो','Beginner':'शुरुआती','Intermediate':'मध्यम','Advanced':'एडवांस',
    'per day':'प्रति दिन','kcal per day':'kcal प्रति दिन','of goal':'लक्ष्य का','fits you':'आपके लिए सही','exercises':'एक्सरसाइज़','training':'ट्रेनिंग','Covered':'पूरा','Best value':'सबसे किफ़ायती','Premium':'प्रीमियम',
    'Individual':'इंडिविजुअल','Family':'फ़ैमिली','Gym':'जिम','Coming soon':'जल्द आ रहा है','Congratulations!':'बधाई हो!','Not active':'चालू नहीं','Sound: On':'आवाज़: चालू','Sound: Off':'आवाज़: बंद',
    /* home */
    'Good morning':'सुप्रभात','Good afternoon':'नमस्ते','Good evening':'शुभ संध्या','My plan':'मेरा प्लान','My profile':'मेरी प्रोफ़ाइल','Edit plan':'प्लान बदलें','KDN Premium':'KDN प्रीमियम','KDN Free':'KDN फ़्री',
    'Subscription time left':'सब्सक्रिप्शन में बचा समय','Today’s diet, workout and tracker':'आज की डाइट, वर्कआउट और ट्रैकर','Ask anything · Hindi & English':'कुछ भी पूछें · हिंदी और अंग्रेज़ी',
    'Your body details and goal':'आपके शरीर की जानकारी और लक्ष्य','Change weight, goal, diet or days':'वज़न, लक्ष्य, डाइट या दिन बदलें','Food gallery':'खाने की गैलरी','Workout gallery':'वर्कआउट गैलरी','Gallery':'गैलरी',
    'Indian dishes with recipes':'भारतीय व्यंजन, रेसिपी के साथ','exercises by muscle':'मांसपेशियों के हिसाब से एक्सरसाइज़','Today’s score':'आज का स्कोर','Start your streak':'अपनी स्ट्रीक शुरू करें','Walk to fill your steps':'कदम पूरे करने के लिए चलें',
    'Finish today’s workout':'आज का वर्कआउट पूरा करें','Perfect day!':'शानदार दिन!','Great day so far':'अब तक बढ़िया दिन','Badges':'बैज','Reminders':'रिमाइंडर','Weekly report':'साप्ताहिक रिपोर्ट','On':'चालू','New':'नया',
    'Remove a glass':'एक गिलास हटाएँ','Add a glass of water':'एक गिलास पानी जोड़ें','Saved on this device':'इसी डिवाइस पर सेव','Saved on this device. You are logged in.':'इसी डिवाइस पर सेव हुआ। आप लॉग इन हैं।',
    'My health':'मेरी सेहत','Period tracker':'पीरियड ट्रैकर','Medicine reminders and reports in one place':'दवा रिमाइंडर और रिपोर्ट एक जगह',
    /* score, badges, reminders, report */
    'A day with':'जिस दिन स्कोर','keeps your streak going.':'हो, स्ट्रीक जारी रहती है।','60 or more':'60 या ज़्यादा','Last 14 days':'पिछले 14 दिन','Current streak':'मौजूदा स्ट्रीक','Best streak':'सबसे लंबी स्ट्रीक',
    'Not done yet':'अभी नहीं हुआ','Extra food under 300 kcal':'अतिरिक्त खाना 300 kcal से कम','More than 300 kcal of extras':'अतिरिक्त खाना 300 kcal से ज़्यादा',
    'First workout':'पहला वर्कआउट','Marked your first workout as done':'पहला वर्कआउट पूरा किया','3-day streak':'3 दिन की स्ट्रीक','3 active days in a row':'लगातार 3 सक्रिय दिन','7-day streak':'7 दिन की स्ट्रीक','A full week of active days':'पूरा हफ़्ता सक्रिय',
    '14-day streak':'14 दिन की स्ट्रीक','Two weeks without a break':'दो हफ़्ते बिना रुके','30-day streak':'30 दिन की स्ट्रीक','A month of active days':'पूरा महीना सक्रिय','100-day streak':'100 दिन की स्ट्रीक','100 active days in a row':'लगातार 100 सक्रिय दिन',
    '10,000 steps':'10,000 कदम','Walked 10,000 steps in one day':'एक दिन में 10,000 कदम चले','Hydrated week':'पानी वाला हफ़्ता','Water goal 7 days in a row':'लगातार 7 दिन पानी का लक्ष्य पूरा','10 workouts':'10 वर्कआउट','10 workouts marked as done':'10 वर्कआउट पूरे',
    '50 workouts':'50 वर्कआउट','50 workouts marked as done':'50 वर्कआउट पूरे','Steady check-ins':'नियमित वज़न','Logged your weight 4 times':'4 बार वज़न दर्ज किया','Perfect day':'शानदार दिन','Scored 100 out of 100 in a day':'एक दिन में 100 में से 100',
    'Allow notifications':'नोटिफ़िकेशन की अनुमति दें','Meals':'भोजन','Breakfast, lunch and dinner':'नाश्ता, दोपहर और रात का खाना','On your training days, skipped once it is done':'ट्रेनिंग वाले दिनों में, पूरा होने पर नहीं आएगा',
    'Steps check':'कदमों की जाँच','From':'से','Until':'तक','Every':'हर','On the website, reminders work while KDN is open in a tab. The Android app reminds you even when it is closed.':'वेबसाइट पर रिमाइंडर तभी आते हैं जब KDN किसी टैब में खुला हो। Android ऐप बंद होने पर भी याद दिलाता है।',
    'average daily score':'औसत रोज़ाना स्कोर','Steps a day':'रोज़ के कदम','Workouts':'वर्कआउट','Water a day':'रोज़ का पानी','Active days':'सक्रिय दिन','score 60 or more':'स्कोर 60 या ज़्यादा','planned this week':'इस हफ़्ते प्लान में',
    'same as last week':'पिछले हफ़्ते जितना','Next week':'अगला हफ़्ता','Log your weight once a week to see it in this report.':'इस रिपोर्ट में देखने के लिए हफ़्ते में एक बार वज़न दर्ज करें।',
    /* plan tabs */
    'Today’s diet for you':'आज आपकी डाइट','Today’s workout for you':'आज आपका वर्कआउट','Nutrients':'पोषक तत्व','Full nutrients':'पूरे पोषक तत्व','Step tracker':'स्टेप ट्रैकर','Steps today':'आज के कदम','Steps view':'कदमों का व्यू',
    'Check today’s diet':'आज की डाइट देखें','Check today’s workouts':'आज के वर्कआउट देखें','This day adds up to':'इस दिन का कुल','Protein top-up':'प्रोटीन टॉप-अप','to reach your protein target':'प्रोटीन लक्ष्य पूरा करने के लिए',
    'Add food to today':'आज में खाना जोड़ें','+ Add food to today':'+ आज में खाना जोड़ें','Add exercise to today':'आज में एक्सरसाइज़ जोड़ें','+ Add an exercise':'+ एक्सरसाइज़ जोड़ें','+ Add a food':'+ खाना जोड़ें','+ Add':'+ जोड़ें',
    'Mark workout as done':'वर्कआउट पूरा हुआ','✓ Workout done today':'✓ आज का वर्कआउट पूरा','Rest and gentle movement':'आराम और हल्की हलचल','Rest day':'आराम का दिन','Choose a day':'दिन चुनें','Days of the week':'हफ़्ते के दिन',
    'Next day':'अगला दिन','Previous day':'पिछला दिन','Add what you ate':'जो खाया वो जोड़ें','Ate something extra?':'कुछ ज़्यादा खाया?','Check today’s progress':'आज की प्रगति देखें','Are you on track today?':'क्या आज आप सही रास्ते पर हैं?',
    'Quick add · type, say or snap':'जल्दी जोड़ें · लिखें, बोलें या फ़ोटो लें','Find calories':'कैलोरी देखें','Say what you ate':'बोलें आपने क्या खाया','Photo of your food':'खाने की फ़ोटो','What did you eat?':'आपने क्या खाया?',
    'Not in the list? Choose any food':'लिस्ट में नहीं है? कोई भी खाना चुनें','Add to today':'आज में जोड़ें','Added today':'आज जोड़ा गया','From your photo. Check the amounts before adding.':'आपकी फ़ोटो से। जोड़ने से पहले मात्रा जाँच लें।',
    'Not found. Pick it from the list below.':'नहीं मिला। नीचे की लिस्ट से चुनें।','AI estimate':'AI अनुमान','Looking at your photo…':'आपकी फ़ोटो देख रहे हैं…','Listening… say what you ate':'सुन रहे हैं… बताइए क्या खाया',
    'Grocery list for this week':'इस हफ़्ते की राशन लिस्ट','Everything in your 7-day diet, by aisle':'7 दिन की डाइट का सारा सामान, श्रेणी के हिसाब से','Grocery list':'राशन लिस्ट',
    'Raw weights for your 7-day plan, rounded up a little. Tick things you already have.':'7 दिन के प्लान के लिए कच्चा वज़न, थोड़ा बढ़ाकर। जो पहले से है उस पर टिक करें।',
    'Grains and flour':'अनाज और आटा','Dal, beans and soya':'दाल, बीन्स और सोया','Dairy, eggs and protein':'डेयरी, अंडे और प्रोटीन','Meat and fish':'मांस और मछली','Fruit':'फल','Nuts and seeds':'मेवे और बीज','Oil, sugar and spices':'तेल, चीनी और मसाले','Vegetables and others':'सब्ज़ियाँ और बाकी',
    'Weight progress':'वज़न की प्रगति','Log your weight and see your chart':'वज़न दर्ज करें और चार्ट देखें','Log your weight':'अपना वज़न दर्ज करें','Weigh-ins':'वज़न रिकॉर्ड','Save weigh-in':'वज़न सेव करें','Latest:':'नवीनतम:',
    'Calorie check':'कैलोरी जाँच','Your weight over time':'समय के साथ आपका वज़न','1 month':'1 महीना','3 months':'3 महीने','Measurements':'शरीर का माप','Progress photos':'प्रगति की फ़ोटो','History':'इतिहास',
    'Waist':'कमर','Hips':'हिप्स','Upper arm':'बाँह','Thigh':'जाँघ','Neck':'गर्दन','Before and after':'पहले और बाद','Before':'पहले','After':'बाद','Front':'सामने','Side':'साइड','Take or choose':'फ़ोटो लें या चुनें','Replace':'बदलें','Remove':'हटाएँ','Change':'बदलें',
    'Compare first and latest':'पहली और नई फ़ोटो की तुलना','Measurement history':'माप का इतिहास','Tap a row to change it.':'बदलने के लिए किसी पंक्ति पर टैप करें।',
    'The scale does not show fat lost and muscle gained. Measure your waist and more once every 2 weeks, in the morning, with a soft tape.':'तराज़ू घटी चर्बी और बढ़ी मांसपेशी नहीं दिखाता। हर 2 हफ़्ते में सुबह नरम फ़ीते से कमर वगैरह नापें।',
    'Take a front and side photo every 2–4 weeks, same place, light and clothes. Photos stay only on this phone.':'हर 2–4 हफ़्ते में सामने और साइड की फ़ोटो लें, वही जगह, रोशनी और कपड़े। फ़ोटो सिर्फ़ इसी फ़ोन में रहती हैं।',
    /* guided workout */
    'Start guided workout':'गाइडेड वर्कआउट शुरू करें','One exercise at a time with set and rest timers':'एक बार में एक एक्सरसाइज़, सेट और आराम टाइमर के साथ','Set done ✓':'सेट पूरा ✓','Reps done':'कितने रेप्स किए','Weight (kg)':'वज़न (kg)',
    'How to do it':'कैसे करें','Skip this exercise':'यह एक्सरसाइज़ छोड़ें','Rest':'आराम','Up next':'अगला','Skip rest':'आराम छोड़ें','Breathe slowly. Sip some water.':'धीरे साँस लें। थोड़ा पानी पिएँ।','Pause':'रोकें','Resume':'जारी रखें','Finish':'खत्म करें',
    'Workout complete':'वर्कआउट पूरा','minutes':'मिनट','sets':'सेट','kg lifted':'kg उठाया','New best':'नया रिकॉर्ड','Leave the workout?':'वर्कआउट छोड़ें?','Save and finish':'सेव करके खत्म करें','Leave':'छोड़ें','Keep going':'जारी रखें',
    'Saved. Today’s workout is marked as done.':'सेव हो गया। आज का वर्कआउट पूरा मार्क हुआ।','Hold':'होल्ड करें','Paused':'रुका है','Avoid:':'बचें:',
    /* track panel */
    '1 · Tap what you ate':'1 · जो खाया उस पर टैप करें','Check my progress':'मेरी प्रगति देखें','I ate my plan':'मैंने प्लान के अनुसार खाया','I did my workout':'मैंने वर्कआउट किया','Which exercises did you do?':'आपने कौन सी एक्सरसाइज़ कीं?',
    'Extra snack, sweet or meal':'अतिरिक्त स्नैक, मिठाई या खाना','Fills in all of today’s planned meals':'आज का सारा प्लान किया खाना भर देता है','Quantity':'मात्रा',
    /* menu and screens */
    'Sound':'आवाज़','About KDN':'KDN के बारे में','Subscription':'सब्सक्रिप्शन','See plans':'प्लान देखें','Exercise library':'एक्सरसाइज़ लाइब्रेरी','Food guide':'फ़ूड गाइड','KDN AI':'KDN AI',
    'Voice assistant · Hindi & English':'आवाज़ सहायक · हिंदी और अंग्रेज़ी','Medicines, reports and period tracker':'दवाइयाँ, रिपोर्ट और पीरियड ट्रैकर','Next period, fertile days, symptoms':'अगला पीरियड, फ़र्टाइल दिन, लक्षण',
    'Your diet, nutrients and workouts':'आपकी डाइट, पोषक तत्व और वर्कआउट','Track your family members':'परिवार के सदस्यों को ट्रैक करें','Gym manager':'जिम मैनेजर','Members, trainers, fees':'सदस्य, ट्रेनर, फ़ीस',
    'Removes your data from this device':'इस डिवाइस से आपका डेटा हटाता है','Language: English':'भाषा: English','Speaking language':'बोलने की भाषा','Tap to speak':'बोलने के लिए टैप करें','Or type your request':'या अपना सवाल लिखें',
    'Try saying':'ऐसे बोलकर देखें','Show me chest exercises':'मुझे छाती की एक्सरसाइज़ दिखाओ','I want to improve my chest':'मुझे अपनी छाती बेहतर करनी है','Just say it. KDN AI does it.':'बस बोलिए, KDN AI कर देगा।',
    'Medicines':'दवाइयाँ','Records':'रिकॉर्ड','Periods':'पीरियड','Your health':'आपकी सेहत','Add medicine':'दवा जोड़ें','Today’s medicines':'आज की दवाइयाँ',
    /* wizard */
    'Thirteen questions, about three minutes.':'तेरह सवाल, लगभग तीन मिनट।','About you':'आपके बारे में','How you eat':'आप क्या खाते हैं','Your goal':'आपका लक्ष्य','How you train':'आप कैसे ट्रेनिंग करते हैं','How fast':'कितनी तेज़ी से','Your budget':'आपका बजट',
    'Then':'फिर','Review and submit':'जाँचें और सबमिट करें','Nothing leaves your device.':'कुछ भी आपके डिवाइस से बाहर नहीं जाता।','What is your name?':'आपका नाम क्या है?','What is your current weight?':'आपका अभी का वज़न कितना है?',
    'How tall are you?':'आपकी लंबाई कितनी है?','Feet and inches, for example 5 ft 8 in.':'फ़ुट और इंच में, जैसे 5 ft 8 in.','How old are you?':'आपकी उम्र कितनी है?','years':'साल','What is your gender?':'आपका लिंग क्या है?',
    'It changes how many calories your body burns at rest.':'इससे पता चलता है कि आराम में आपका शरीर कितनी कैलोरी जलाता है।','We use an average value':'हम औसत मान लेते हैं','What do you eat?':'आप क्या खाते हैं?',
    'No dairy, no eggs':'न डेयरी, न अंडे','Dairy is fine':'डेयरी चलती है','Eggs, chicken, fish':'अंडे, चिकन, मछली','What is your goal?':'आपका लक्ष्य क्या है?','Lose weight':'वज़न घटाना','Fat loss, steady pace':'चर्बी घटाना, आराम से',
    'Gain weight':'वज़न बढ़ाना','Muscle and mass':'मांसपेशी और वज़न','Stay stable':'वज़न बनाए रखना','Hold one weight':'एक ही वज़न पर रहना','How much weight do you want to lose?':'आप कितना वज़न घटाना चाहते हैं?',
    'Where will you work out?':'आप कहाँ वर्कआउट करेंगे?','Your exercises are picked from what you have.':'आपके पास जो सामान है, उसी से एक्सरसाइज़ चुनी जाती हैं।','Home, no equipment':'घर पर, बिना सामान','Bodyweight, a chair, a wall, a sturdy table':'शरीर का वज़न, कुर्सी, दीवार, मज़बूत मेज़',
    'Home with dumbbells':'घर पर डम्बल के साथ','Adds weighted exercises':'वज़न वाली एक्सरसाइज़ भी','Barbell, bench, cable and cardio machines':'बारबेल, बेंच, केबल और कार्डियो मशीन','What is your fitness level?':'आपका फ़िटनेस लेवल क्या है?',
    'It sets how many exercises and sets you get in each session.':'इससे तय होता है कि हर सेशन में कितनी एक्सरसाइज़ और सेट मिलेंगे।','How many days a week can you train?':'आप हफ़्ते में कितने दिन ट्रेनिंग कर सकते हैं?',
    'Sunday is always rest. More days is not always better.':'रविवार हमेशा आराम का दिन है। ज़्यादा दिन हमेशा बेहतर नहीं होते।','Monday to Saturday':'सोमवार से शनिवार','How fast do you want to get there?':'आप कितनी जल्दी वहाँ पहुँचना चाहते हैं?',
    'Recommended pace':'सुझाई गई रफ़्तार','My own time':'मेरा अपना समय','Choose how long you want to take':'चुनें कि आप कितना समय लेना चाहते हैं','weeks':'हफ़्ते','months':'महीने','What is your food budget?':'आपका खाने का बजट क्या है?',
    'We pick foods that fit it. You can change this later in your diet plan.':'हम इसी बजट में खाना चुनते हैं। आप इसे बाद में डाइट प्लान में बदल सकते हैं।','Everyday dal, roti, seasonal fruit':'रोज़ की दाल, रोटी, मौसमी फल',
    'Adds paneer, oats, soy milk':'पनीर, ओट्स, सोया मिल्क भी','Adds chicken, fish, nuts':'चिकन, मछली, मेवे भी','e.g. Kabir':'जैसे: कबीर','Weight in kg':'वज़न kg में','Get my plan':'मेरा प्लान बनाएँ','Start my questions':'सवाल शुरू करें',
    'Edit your plan':'अपना प्लान बदलें','Save changes':'बदलाव सेव करें','Your plan in':'आपका प्लान','three steps':'तीन चरणों में','Get Started':'शुरू करें','Start your plan':'अपना प्लान शुरू करें','Here is your plan, Kabir.':'यह रहा आपका प्लान।',
    'Your diet plan is ready. Opening it now.':'आपका डाइट प्लान तैयार है। अभी खोल रहे हैं।',
    /* pay */
    'Choose a plan':'प्लान चुनें','Enter your coupon':'अपना कूपन डालें','or use a coupon':'या कूपन इस्तेमाल करें','Coupon code':'कूपन कोड','Coupon active':'कूपन चालू','1 person':'1 व्यक्ति','Up to 4 people':'4 लोगों तक','3-month plan':'3 महीने का प्लान',
    'for 1 person':'1 व्यक्ति के लिए','Have a code from your trainer?':'क्या ट्रेनर ने कोड दिया है?','Trainer code':'ट्रेनर कोड','Choose Individual':'इंडिविजुअल चुनें','Choose Family':'फ़ैमिली चुनें','Choose Gym':'जिम चुनें',
    'Your coupon is applied. You have full access for 30 days, starting today.':'आपका कूपन लग गया। आज से 30 दिन तक पूरा एक्सेस है।','Unlock your plan':'अपना प्लान अनलॉक करें','What you get':'आपको क्या मिलेगा',
    /* motion permission */
    'Allow step counting':'कदम गिनने की अनुमति दें','Counts steps automatically while KDN is open':'KDN खुला रहने पर कदम अपने आप गिनता है','Fills your daily ring, streak and monthly history':'रोज़ का रिंग, स्ट्रीक और महीने का इतिहास भरता है',
    'You can turn it off any time in your phone settings':'आप इसे कभी भी फ़ोन की सेटिंग में बंद कर सकते हैं','Step counting is off':'कदम गिनना बंद है','How many steps today?':'आज कितने कदम चले?',
    'Steps, km, calories, 30 days':'कदम, km, कैलोरी, 30 दिन','1,100+ exercises sorted by muscle':'1,100+ एक्सरसाइज़, मांसपेशी के हिसाब से','Nutrients in every food':'हर खाने के पोषक तत्व',
    'How the numbers work':'हिसाब कैसे होता है','Logged in on this device':'इस डिवाइस पर लॉग इन','Your plan':'आपका प्लान','Daily target':'रोज़ का लक्ष्य','Rich in today:':'आज इनसे भरपूर:','Weight to lose':'घटाना है',
    'Time to reach it':'पहुँचने का समय','Where you train':'ट्रेनिंग की जगह','Fitness level':'फ़िटनेस लेवल','Training days':'ट्रेनिंग के दिन','Food budget':'खाने का बजट','Meals a day':'दिन में भोजन','Diet settings':'डाइट सेटिंग',
    'Calories burned':'जली कैलोरी','Common mistake:':'आम गलती:','Alternatives':'विकल्प','Start position':'शुरुआती पोज़','End position':'आख़िरी पोज़','Time to reach':'पहुँचने का समय','How it works':'यह कैसे काम करता है',
    'Track and adjust':'ट्रैक करें और सुधारें','Your fitness coach,':'आपका फ़िटनेस कोच,','right in your pocket.':'आपकी जेब में।','Get your daily plan':'अपना रोज़ का प्लान पाएँ','Open my plan':'मेरा प्लान खोलें',
    'KDN AI voice assistant':'KDN AI आवाज़ सहायक','Included in every plan':'हर प्लान में शामिल','Vitamins and minerals':'विटामिन और खनिज','Daily need':'रोज़ की ज़रूरत','You need:':'आपको चाहिए:',
    /* footer */
    'Privacy policy':'प्राइवेसी पॉलिसी','Fitness Tracker · Estimates only, not medical advice. ·':'फ़िटनेस ट्रैकर · सिर्फ़ अनुमान, डॉक्टरी सलाह नहीं। ·'
  }; hiDict.d = D; return D; }
  /* text with numbers inside */
  function hiRx(){ return hiRx.r || (hiRx.r = [
    [/^(\d+)-day streak$/,'$1 दिन की स्ट्रीक'],[/^Exercise (\d+) of (\d+)$/i,'एक्सरसाइज़ $1 / $2'],[/^of (\d+)$/,'/ $1'],[/^Set$/,'सेट'],[/^Set (\d+) of (\d+)$/,'सेट $1 / $2'],
    [/^(\d+) \/ (\d+) glasses$/,'$1 / $2 गिलास'],[/^(\d+) of (\d+) glasses$/,'$1 / $2 गिलास'],[/^([\d,]+) steps$/,'$1 कदम'],[/^([\d,]+) of ([\d,]+)$/,'$1 / $2'],[/^(\d+) min$/,'$1 मिनट'],[/^(\d+) minutes$/,'$1 मिनट'],
    [/^(\d+) reps$/,'$1 रेप्स'],[/^(\d+) reps each side$/,'हर तरफ़ $1 रेप्स'],[/^(\d+) sec$/,'$1 सेकंड'],[/^Start (\d+) sec$/,'$1 सेकंड शुरू करें'],[/^Start (\d+) min$/,'$1 मिनट शुरू करें'],
    [/^Drink (\d+) more glass(es)?$/,'$1 गिलास और पिएँ'],[/^ · best (\d+)$/,' · सबसे लंबी $1'],[/^Week (\d+) of (\d+)$/,'हफ़्ता $1 / $2'],[/^Week (\d+)$/,'हफ़्ता $1'],
    [/^Rest day: walk ([\d,]+) steps to count it$/,'आराम का दिन: इसे गिनने के लिए $1 कदम चलें'],[/^Rest day: light walk done$/,'आराम का दिन: हल्की सैर हो गई'],[/^Every few hours, skipped once you reach (\d+) glasses$/,'हर कुछ घंटे में, $1 गिलास होने पर बंद'],
    [/^Evening nudge if you are short of ([\d,]+) steps$/,'शाम को याद, अगर $1 कदम पूरे न हों'],[/^Add (\d+) kcal · (\d+) g protein to today$/,'आज में $1 kcal · $2 g प्रोटीन जोड़ें'],[/^Done \((\d+)\/(\d+)\)$/,'हो गया ($1/$2)'],
    [/^Added (\d+) items? · (\d+) kcal\.$/,'$1 चीज़ें जोड़ी गईं · $2 kcal।'],[/^([+-]?[\d.]+) kg since you started$/,'शुरू से $1 kg'],[/^([+-]?[\d.]+) kg this week$/,'इस हफ़्ते $1 kg'],[/^(\d+) days apart/,'$1 दिन का फ़र्क'],
    [/^([+-][\d,.]+)( glasses)? vs last week$/,'पिछले हफ़्ते से $1'],[/^goal ([\d,]+)$/,'लक्ष्य $1'],[/^goal (\d+) glasses$/,'लक्ष्य $1 गिलास'],[/^Last time \((.+)\): (.+)$/,'पिछली बार ($1): $2'],
    [/^Well done, (.+)!$/,'शाबाश, $1!'],[/^New badge: (.+)!$/,'नया बैज: $1!'],[/^Earned (.+)$/,'मिला $1'],[/^(\d+) date(s)? · last (.+)\. Saved only on this phone\.$/,'$1 तारीखें · आख़िरी $3। सिर्फ़ इसी फ़ोन में सेव।'],
    [/^Question (\d+) of (\d+)$/,'सवाल $1 / $2'],[/^About (\d+) weeks?$/,'लगभग $1 हफ़्ते'],[/^About (\d+) months?$/,'लगभग $1 महीने'],
    [/^Lose ([\d.]+) kg \(([\d.]+) to ([\d.]+) kg\)$/,'$1 kg घटाना ($2 से $3 kg)'],[/^Gain ([\d.]+) kg \(([\d.]+) to ([\d.]+) kg\)$/,'$1 kg बढ़ाना ($2 से $3 kg)'],[/^Stay at ([\d.]+) kg$/,'$1 kg पर बने रहना'],
    [/^Premium active · until (.+)$/,'प्रीमियम चालू · $1 तक'],[/^Active · (.+) left$/,'चालू · $1 बाकी'],[/^on a vegan diet\.$/,'वीगन डाइट पर।'],[/^on a vegetarian diet\.$/,'शाकाहारी डाइट पर।'],[/^on a non-vegetarian diet\.$/,'मांसाहारी डाइट पर।'],[/^Pay ₹([\d,]+)$/,'₹$1 चुकाएँ'],[/^(\d+) exercises\. Open any one for the pictures, calories burned and alternatives\.$/,'$1 एक्सरसाइज़। फ़ोटो, जली कैलोरी और विकल्प देखने के लिए किसी को भी खोलें।']
  ]); }
  function hiText(t){
    var D = hiDict(), k = t.replace(/\s+/g,' ').trim(); if(!k) return null;
    if(D[k]!==undefined) return t.replace(k,D[k]);
    var R = hiRx();
    for(var i=0;i<R.length;i++){ if(R[i][0].test(k)) return t.replace(k,k.replace(R[i][0],R[i][1])); }
    var m = k.match(/^Edit (.+)$/); if(m && D[m[1]]) return t.replace(k,D[m[1]]+' बदलें');
    return null;
  }
  function hiNode(root){
    if(!root) return;
    if(root.nodeType===3){ var p = root.parentNode; if(!p || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p.nodeName) || (p.closest && p.closest('[data-notr]'))) return; var v = hiText(root.nodeValue); if(v!==null && v!==root.nodeValue) root.nodeValue = v; return; }
    if(root.nodeType!==1 || /^(SCRIPT|STYLE|svg|TEXTAREA)$/i.test(root.nodeName) || root.hasAttribute('data-notr')) return;
    ['placeholder','aria-label','title'].forEach(function(a){ var v = root.getAttribute(a); if(v){ var t = hiText(v); if(t!==null && t!==v) root.setAttribute(a,t); } });
    if(root.nodeName==='INPUT' && (root.type==='button'||root.type==='submit') && root.value){ var tv = hiText(root.value); if(tv!==null) root.value = tv; }
    var w = document.createTreeWalker(root,NodeFilter.SHOW_TEXT|NodeFilter.SHOW_ELEMENT,null), n;
    while((n = w.nextNode())){
      if(n.nodeType===1){ if(/^(SCRIPT|STYLE|svg|TEXTAREA)$/i.test(n.nodeName)) continue; ['placeholder','aria-label','title'].forEach(function(a){ var v = n.getAttribute(a); if(v){ var t = hiText(v); if(t!==null && t!==v) n.setAttribute(a,t); } }); continue; }
      var p2 = n.parentNode; if(!p2 || /^(SCRIPT|STYLE|TEXTAREA)$/.test(p2.nodeName) || (p2.closest && p2.closest('[data-notr]'))) continue;
      var nv = hiText(n.nodeValue); if(nv!==null && nv!==n.nodeValue) n.nodeValue = nv;
    }
  }
  function hiStart(){
    if(kLang()!=='hi' || hiStart.on) return; hiStart.on = true;
    document.documentElement.lang = 'hi'; document.documentElement.classList.add('lang-hi');
    hiNode(document.body);
    new MutationObserver(function(ms){
      for(var i=0;i<ms.length;i++){
        var m = ms[i];
        if(m.type==='characterData'){ var v = hiText(m.target.nodeValue); if(v!==null && v!==m.target.nodeValue) m.target.nodeValue = v; continue; }
        for(var j=0;j<m.addedNodes.length;j++) hiNode(m.addedNodes[j]);
      }
    }).observe(document.body,{childList:true,subtree:true,characterData:true});
    /* toasts and live text set with textContent */
  }
  /* menu button */
  (function(){
    var snd = $('m-snd'); if(!snd || $('m-lang')) return;
    var b = document.createElement('button'); b.type = 'button'; b.id = 'm-lang'; b.setAttribute('data-notr','1');
    b.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18"/></svg><span>'+(kLang()==='hi'?'भाषा: हिंदी · Switch to English':'Language: English · हिंदी में देखें')+'</span>';
    snd.parentNode.insertBefore(b,snd.nextSibling);
    b.addEventListener('click',function(ev){ ev.stopPropagation(); kLangToggle(); });
  })();
  hiStart();
  /* ==== KDN LANGUAGE END ==== */
