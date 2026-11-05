
(function(){
  var $ = function(id){return document.getElementById(id)};
  var NATIVE = !!(window.Capacitor && window.Capacitor.isNativePlatform && window.Capacitor.isNativePlatform());
  /* Medicines and medical records are on the website only. Google Play treats them as "Medical" apps,
     which need an organization developer account, so the Android app keeps just the period tracker. */
  var HMED = !NATIVE;
  var screens = ['s-landing','s-pay','s-ai','s-family','s-gym','s-trainer','s-share','s-home','s-intro','s-form','s-review','s-result','s-library','s-foods','s-about','s-health'];
  var curScreen = 's-landing';
  var planDone = false;
  var OPENSCR = ['s-landing','s-pay','s-about','s-trainer','s-share'];
  var KPREV = ['s-library','s-foods','s-gym'];
  function show(id){
    if(OPENSCR.indexOf(id)<0 && KPREV.indexOf(id)<0 && typeof licensed==='function' && !licensed()){ id = 's-pay'; payGateNote(); }
    if(typeof licensed==='function' && licensed()){
      if(id==='s-family' && licPlan()!=='fam'){ payNoteTxt = 'The family tracker comes with the Family plan. Your plan now is '+PLANNAME[licPlan()]+'.'; id = 's-pay'; }
      else if(id==='s-health' && licPlan()==='gym'){ payNoteTxt = 'My health (medicines, records and period tracker) comes with the Individual and Family plans.'; id = 's-pay'; }
    }
    var prevScreen = curScreen;
    curScreen = id;
    document.body.classList.toggle('onland', id==='s-landing');
    var gymOn = id==='s-gym' && typeof licensed==='function' && licensed() && licPlan()==='gym';
    document.body.classList.toggle('gymmode',gymOn||id==='s-trainer');
    if(!gymOn && typeof gymLeave==='function') gymLeave();
    screens.forEach(function(s){$(s).hidden = (s !== id)});
    window.scrollTo(0,0);
    var h = $(id).querySelector('h1,h2');
    if(h){h.setAttribute('tabindex','-1');h.focus({preventScroll:true})}
    syncNav();
    if(id==='s-landing'){ heroKick(); if(window.kdnWalkReplay) setTimeout(window.kdnWalkReplay,50); }
    if(id==='s-pay'){ payShow(); if(typeof kPayNote==='function') kPayNote(); }
    if(id==='s-family') renderFamily();
    if(id==='s-gym'){ if(gymOn) gymEnter(); else kGymPreview(); }
    if(id==='s-health' && typeof hOpen==='function') hOpen();
    if(id!==prevScreen && typeof kdnScreenIn==='function') kdnScreenIn(id);
    if(id==='s-trainer') trOpen();
  }
  function esc(s){return String(s).replace(/[&<>"']/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]})}
  function fmt(n){return n.toLocaleString('en-IN')}

