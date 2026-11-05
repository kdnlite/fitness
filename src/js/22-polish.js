  /* ==== KDN POLISH START ==== smoother scrolling and a more premium feel */
  (function(){
    var RM = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    /* header turns to glass once the page scrolls */
    var hd = document.querySelector('.hd'), tick = false;
    function onScroll(){ if(tick) return; tick = true; requestAnimationFrame(function(){ tick = false; if(hd) hd.classList.toggle('sc', window.scrollY>6); }); }
    window.addEventListener('scroll',onScroll,{passive:true}); onScroll();
    /* pictures decode off the main thread, so scrolling does not stutter */
    function asyncImgs(root){ if(!root || !root.querySelectorAll) return; if(root.tagName==='IMG' && !root.getAttribute('decoding')) root.decoding = 'async'; Array.prototype.forEach.call(root.querySelectorAll('img:not([decoding])'),function(i){ i.decoding = 'async'; }); }
    asyncImgs(document.body);
    if(window.MutationObserver) new MutationObserver(function(ms){ for(var i=0;i<ms.length;i++) for(var j=0;j<ms[i].addedNodes.length;j++){ var n = ms[i].addedNodes[j]; if(n.nodeType===1) asyncImgs(n); } }).observe(document.body,{childList:true,subtree:true});
    /* landing sections fade up as they come into view */
    if(!RM && 'IntersectionObserver' in window){
      var io = new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } }); },{rootMargin:'0px 0px -8% 0px',threshold:0.06});
      Array.prototype.forEach.call(document.querySelectorAll('#s-landing .lp-sec > *, #s-landing .lp-plan, #s-landing .lp-final > *'),function(el){
        if(el.getBoundingClientRect().top < innerHeight) return;
        el.classList.add('rv'); io.observe(el);
      });
    }
    /* light haptic tick on the bottom bar (Android) */
    var bn = document.getElementById('bnav');
    if(bn) bn.addEventListener('click',function(ev){ if(ev.target.closest('button') && navigator.vibrate){ try{ navigator.vibrate(8); }catch(e){} } });
  })();
  if(!NATIVE && 'serviceWorker' in navigator && location.protocol==='https:') window.addEventListener('load',function(){ setTimeout(function(){ try{ navigator.serviceWorker.register('/sw.js'); }catch(e){} },1500); });
  function kdnScreenIn(id){
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var box = {'s-home':'home','s-health':'health','s-family':'family'}[id], el = box && document.getElementById(box);
    if(!el) return;
    el.classList.remove('kin'); void el.offsetWidth; el.classList.add('kin');
    clearTimeout(el._kin); el._kin = setTimeout(function(){ el.classList.remove('kin'); },1100);
  }
  /* ==== KDN POLISH END ==== */
