/* KDN live content: plan prices and the announcement bar, set from kdnfitness.com/admin.
   If the API is unreachable the page keeps the prices written in index.html. */
(function () {
  'use strict';
  function inr(n) { return '₹' + Number(n).toLocaleString('en-IN'); }
  function apply(c) {
    if (c.plans) {
      ['ind', 'fam', 'gym'].forEach(function (k) {
        var p = c.plans[k];
        var btn = document.querySelector('.lp-plan [data-pick="' + k + '"]');
        if (!p || !btn) return;
        var card = btn.closest('.lp-plan');
        var amt = card.querySelector('.lp-amt2');
        if (amt) amt.innerHTML = (p.mrp ? '<s>' + inr(p.mrp) + '</s>' : '') + '<b>' + inr(p.price) + '</b>';
        var per = card.querySelector('.lp-per');
        if (per && p.per) per.textContent = p.per;
      });
    }
    var b = c.banner;
    if (b && b.on && b.text && !document.getElementById('kdn-live-bar')) {
      var bar = document.createElement(b.link ? 'a' : 'div');
      bar.id = 'kdn-live-bar';
      bar.textContent = b.text;
      if (b.link) bar.href = b.link;
      bar.style.cssText = 'display:block;margin:0 -20px;padding:10px 20px;background:#14202B;color:#F2D58A;text-align:center;font:600 14px/1.4 "DM Sans",system-ui,sans-serif;text-decoration:none';
      document.body.insertBefore(bar, document.body.firstChild);
    }
  }
  function load() {
    fetch('/api/public/content', { cache: 'no-cache' })
      .then(function (r) { return r.ok ? r.json() : {}; })
      .then(apply)
      .catch(function () {});
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', load); else load();
})();
