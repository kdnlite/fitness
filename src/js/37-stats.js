  /* ==== KDN STATS START ==== anonymous counts for the admin dashboard (website only, no personal data) */
  function kHit(k){
    if(NATIVE) return;
    try{ var key = 'kdn.hit.'+k; if(sessionStorage.getItem(key)) return; sessionStorage.setItem(key,'1'); }catch(e){}
    try{ fetch('/api/public/hit',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({k:k}),keepalive:true}).catch(function(){}); }catch(e){}
  }
  (function(){
    var sh = show;
    show = function(id){ sh(id); if(id==='s-form') kHit('start'); else if(id==='s-pay') kHit('pay'); };
    var ba = kBuildAnim;
    kBuildAnim = function(){ kHit('plan'); ba(); };
    setTimeout(function(){ kHit('visit'); },1500);
  })();
  /* ==== KDN STATS END ==== */
