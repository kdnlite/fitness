  /* ==== landing top links, FAQ and footer links ==== */
  (function(){
    var b4 = document.getElementById('b-start4');
    if(b4) b4.addEventListener('click',function(){ var b = document.getElementById('b-start1'); if(b) b.click(); });
    document.addEventListener('click',function(ev){
      var a = ev.target.closest && ev.target.closest('a[href^="#lp-"]');
      if(!a) return;
      var t = document.getElementById(a.getAttribute('href').slice(1));
      if(!t) return;
      ev.preventDefault();
      var land = document.getElementById('s-landing');
      if(land && land.hidden && typeof show==='function') show('s-landing');
      var sec = t.closest('section') || t;
      var y = sec.getBoundingClientRect().top + window.scrollY - 76;
      window.scrollTo({top:Math.max(0,y),behavior:(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches)?'auto':'smooth'});
    });
  })();
