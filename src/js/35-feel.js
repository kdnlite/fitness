  /* ==== KDN FEEL START ==== quick start, plan-building moment, tap feedback, smooth tab changes */
  /* ---- quick start: 8 questions; home workouts, beginner, 4 days, recommended pace, medium budget ---- */
  function kQuick(v){ if(v!==undefined) kQuick.on = v; return !!kQuick.on; }
  function kQuickJump(i){
    if(!kQuick()) return false;
    var g = val('goal');
    if(!(i===STEP_AMT || (i===STEP_AMT-1 && g==='maintain'))) return false;
    [['loc','h0'],['level','beginner'],['days','4'],['budget','mid']].forEach(function(x){ if(!val(x[0])){ var r = f.querySelector('input[name='+x[0]+'][value="'+x[1]+'"]'); if(r) r.checked = true; } });
    setMode('safe');
    var o = readForm();
    D = o; editing = null; rvErr = {};
    setReviewMode(false); renderReview(); show('s-review');
    toast('Done. Check the details and tap Submit.');
    return true;
  }
  (function(){
    var gs = goStep;
    goStep = function(i){ gs(i); if(kQuick()) $('qcount').textContent = 'Question '+(i+1)+' of '+(val('goal')==='maintain'?7:8); };
    $('b-quick').addEventListener('click',function(){ kQuick(true); buzz(); show('s-form'); goStep(0); });
    $('b-start2').addEventListener('click',function(){ kQuick(false); });
  })();
  /* ---- the moment the first plan is made ---- */
  function kBuildAnim(){
    if(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    var el = document.createElement('div'); el.className = 'kb'; el.setAttribute('aria-hidden','true');
    var L = ['Working out your calories and protein','Picking dishes you will like','Building your weekly workouts','Setting your step goal'];
    el.innerHTML = '<div class="kb-in"><div class="kb-ring"><i></i></div><h3>Building your plan</h3><ul>'+L.map(function(t,i){ return '<li style="--d:'+(i*0.32+0.2)+'s"><span>✓</span>'+t+'</li>'; }).join('')+'</ul></div>';
    document.body.appendChild(el); buzz('big');
    setTimeout(function(){ el.classList.add('out'); buzz('ok'); snd('win'); },1900);
    setTimeout(function(){ el.remove(); },2350);
  }
  /* ---- tap feedback on the main controls ---- */
  document.addEventListener('click',function(ev){
    var b = ev.target.closest && ev.target.closest('#bnav button,.tab,.btn,.tkgo,.hh-gold,.cb,.dchip,.hx-tile,.hx-sub,.hx-gal,.wkstrip button,.qb,[data-hm]');
    if(b && !b.closest('[data-e],[data-fq],[data-gw],[data-w],[data-gr],[data-pg2]')) buzz();
  },true);
  /* ---- smooth tab changes ---- */
  (function(){
    var st = setTab;
    setTab = function(which){ st(which); var p = $('p-'+which); if(p){ p.classList.remove('kin'); void p.offsetWidth; p.classList.add('kin'); } };
  })();
  /* ==== KDN FEEL END ==== */
