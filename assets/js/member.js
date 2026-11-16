/* 會員選單（靜態預覽）。WordPress 版由 WooCommerce 依登入狀態輸出。
   預設未登入；任一頁加 ?demo=member 切成已登入（本分頁內保留），?demo=guest 或「登出」切回。 */
(function () {
  'use strict';
  var K = 'mp_demo_member', q = new URLSearchParams(location.search).get('demo');
  try {
    if (q === 'member') sessionStorage.setItem(K, '1');
    if (q === 'guest') sessionStorage.removeItem(K);
  } catch (e) {}
  var member = false; try { member = sessionStorage.getItem(K) === '1'; } catch (e) {}
  if (q === 'member' || q === 'guest') { var u = new URL(location.href); u.searchParams.delete('demo'); if (history.replaceState) history.replaceState(null, '', u.pathname + u.search + u.hash); }
  document.querySelectorAll('[data-acct]').forEach(function (el) { el.hidden = el.getAttribute('data-acct') !== (member ? 'member' : 'guest'); });
  document.documentElement.classList.toggle('is-member', member);
  // 點選單外關閉
  document.addEventListener('click', function (e) { document.querySelectorAll('details.acct[open]').forEach(function (d) { if (!d.contains(e.target)) d.open = false; }); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') document.querySelectorAll('details.acct[open]').forEach(function (d) { d.open = false; }); });
  // account.html 預覽表單不送出
  document.querySelectorAll('[data-demo-form]').forEach(function (f) {
    f.addEventListener('submit', function (e) { e.preventDefault(); var o = f.querySelector('.co-out'); if (o) o.textContent = '目前尚未開放會員功能。Accounts are not open yet.'; });
  });
})();
