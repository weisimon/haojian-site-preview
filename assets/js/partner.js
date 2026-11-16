/* 合作店員工優惠結帳（靜態預覽）。設定見 partners.js（由 build_pages2.py 產生）。網址：partner.html?p=<id> */
(function () {
  'use strict';
  var P = window.MP_PARTNERS || {}, ST = window.MP_STAFF || { price: 4000, shears: [] };
  var f = document.getElementById('pt-form');
  if (!f) return;
  var $ = function (id) { return document.getElementById(id); };
  var fmt = function (n) { return 'NT$' + n.toLocaleString('en-US'); };
  var id = new URLSearchParams(location.search).get('p') || '';
  var partner = Object.prototype.hasOwnProperty.call(P, id) ? P[id] : null;

  if (partner) {
    $('pt-title').innerHTML = '';
    $('pt-title').appendChild(document.createTextNode(partner.name + ' 員工專屬優惠 '));
    var en = document.createElement('span'); en.className = 'en'; en.textContent = 'staff offer'; $('pt-title').appendChild(en);
    document.title = partner.name + ' 員工專屬優惠｜毫剪 Milli Peak';
    partner.branches.forEach(function (b) {
      var o = document.createElement('option'); o.value = b.id; o.textContent = b.name; $('pt-branch').appendChild(o);
    });
  } else {
    $('co-unavail').hidden = false;
    $('co-unavail').textContent = '連結無效，請洽合作窗口。This link is not valid; please contact your partner coordinator.';
    f.querySelectorAll('input,select,button').forEach(function (el) { el.disabled = true; });
  }

  function qty(k) { var n = parseInt($('qty-' + k).value, 10); return isNaN(n) ? 0 : Math.max(0, Math.min(10, n)); }
  function render() {
    var lines = [], count = 0;
    ST.shears.forEach(function (s) {
      var q = qty(s.key); if (!q) return;
      count += q; lines.push('<li><span>' + s.name + ' × ' + q + '</span><span>' + fmt(q * ST.price) + '</span></li>');
    });
    $('co-lines').innerHTML = lines.join('') || '<li class="muted"><span>尚未選擇剪刀 no shears selected</span></li>';
    $('pt-count').textContent = count + ' 把';
    $('co-total').textContent = fmt(count * ST.price);
    var br = partner && partner.branches.filter(function (b) { return b.id === $('pt-branch').value; })[0];
    $('pt-addr').innerHTML = '分店地址 <span class="en">branch address</span>：' + (br ? br.addr : '—');
    var inv = $('co-company').checked, box = f.querySelector('[data-inv="company"]');
    box.hidden = !inv; box.querySelectorAll('input').forEach(function (el) { el.disabled = !inv || !partner; });
    return count;
  }
  f.addEventListener('click', function (e) {
    var b = e.target.closest('[data-step]'); if (!b) return;
    var inp = $('qty-' + b.dataset.k); inp.value = Math.max(0, Math.min(10, qty(b.dataset.k) + parseInt(b.dataset.step, 10))); render();
  });
  f.addEventListener('input', render);
  f.addEventListener('change', render);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('co-out');
    if (!partner) { out.textContent = '連結無效，請洽合作窗口。'; return; }
    if (!render()) { out.textContent = '請至少選擇 1 把剪刀。Please choose at least one shear.'; return; }
    if (!f.checkValidity()) { f.reportValidity(); out.textContent = '請完成必填欄位。Please complete the required fields.'; return; }
    out.textContent = '預覽版不會送出訂單：上線後將於 WordPress 串接綠界 ECPay 付款。Preview only: this will connect to ECPay on WordPress.';
  });
  render();
})();
