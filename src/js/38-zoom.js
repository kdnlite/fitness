  /* ==== KDN PHOTO VIEWER START ==== tap an exercise photo: it opens full screen in full quality; tap again to close */
  function kZoomOpen(img){
    var hd = img.getAttribute('data-hd') || img.currentSrc || img.src, z = $('kzoom');
    if(!z){ z = document.createElement('div'); z.id = 'kzoom'; z.className = 'kzoom'; z.setAttribute('role','dialog'); z.setAttribute('aria-modal','true'); document.body.appendChild(z); }
    var cap = img.getAttribute('alt') || '', name = '';
    var host = img.closest('.ex,.exrow,.tddrow,.gw,[data-ex],details'); if(host){ var h = host.querySelector('h2,h3,b,strong,.exn'); if(h) name = h.textContent.trim(); }
    z.setAttribute('aria-label',(name?name+', ':'')+cap);
    z.innerHTML = '<img class="kz-img" src="'+(img.currentSrc||img.src)+'" alt="'+esc(cap)+'"><span class="kz-load" aria-hidden="true"></span><div class="kz-cap">'+(name?'<b>'+esc(name)+'</b>':'')+'<span>'+esc(cap)+' · tap to close</span></div>';
    z.hidden = false; document.documentElement.classList.add('hlock');
    requestAnimationFrame(function(){ z.classList.add('open'); });
    if(hd && hd!==(img.currentSrc||img.src)){
      z.classList.add('loading');
      var big = new Image(); big.decoding = 'async';
      big.onload = function(){ var i = z.querySelector('.kz-img'); if(i && z.classList.contains('open')){ i.src = hd; } z.classList.remove('loading'); };
      big.onerror = function(){ z.classList.remove('loading'); };
      big.src = hd;
    }
    buzz();
  }
  function kZoomClose(){ var z = $('kzoom'); if(!z || z.hidden) return false; z.classList.remove('open'); document.documentElement.classList.remove('hlock'); setTimeout(function(){ if(!z.classList.contains('open')){ z.hidden = true; z.innerHTML = ''; } },220); return true; }
  function kZoomIsOpen(){ var z = $('kzoom'); return !!(z && !z.hidden); }
  document.addEventListener('click',function(ev){
    var t = ev.target;
    if(kZoomIsOpen() && t.closest && t.closest('#kzoom')){ ev.preventDefault(); ev.stopPropagation(); kZoomClose(); return; }
    var img = t.closest && t.closest('img.eph');
    if(!img){ var fig = t.closest && t.closest('#gw-fig'); if(fig){ var ims = fig.querySelectorAll('img'); img = ims[fig.classList.contains('alt') && ims[1] ? 1 : 0]; } }
    if(!img) return;
    ev.preventDefault(); ev.stopPropagation();
    kZoomOpen(img);
  },true);
  document.addEventListener('keydown',function(ev){ if(ev.key==='Escape' && kZoomIsOpen()){ ev.stopPropagation(); kZoomClose(); } },true);
  /* the app's back button closes the photo first */
  (function(){ var kb = kBack; kBack = function(){ if(kZoomClose()) return true; return kb(); }; })();
  /* ==== KDN PHOTO VIEWER END ==== */
