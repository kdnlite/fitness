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
  /* ==== phones: a Get Started bar slides up once the hero is scrolled past ==== */
  (function(){
    if(!('IntersectionObserver' in window)) return;
    var hero = document.querySelector('.lp-hero'), fin = document.querySelector('.lp-final'), land = document.getElementById('s-landing');
    if(!hero || !land) return;
    var bar = document.createElement('div');
    bar.className = 'lp-sbar'; bar.setAttribute('aria-hidden','true');
    bar.innerHTML = '<div><b>Your plan in 2 minutes</b><span>Plans from ₹799 for 3 months</span></div><button class="btn" type="button" tabindex="-1">Get Started</button>';
    document.body.appendChild(bar);
    new MutationObserver(function(){ upd(); }).observe(land,{attributes:true,attributeFilter:['hidden']});
    bar.querySelector('button').addEventListener('click',function(){ var b = document.getElementById('b-start1'); if(b) b.click(); });
    var pastHero = false, atEnd = false;
    function upd(){ var on = pastHero && !atEnd && !land.hidden; bar.classList.toggle('on',on); bar.setAttribute('aria-hidden',on?'false':'true'); bar.querySelector('button').tabIndex = on?0:-1; }
    new IntersectionObserver(function(es){ pastHero = !es[0].isIntersecting && es[0].boundingClientRect.top < 0; upd(); }).observe(hero);
    if(fin) new IntersectionObserver(function(es){ atEnd = es[0].isIntersecting; upd(); },{threshold:.05}).observe(fin);
  })();
