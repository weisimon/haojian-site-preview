/* 毫剪／W 選物 結帳（靜態預覽）。讀購物車（cart.js）；checkout.html?item=<id> 或 ?shear=<key> 會先把該商品放進購物車。
   WordPress 版改由 WooCommerce + 綠界 ECPay 外掛處理；此檔只示範欄位與計價。 */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var C = window.MPCart; if (!C) return;
  // 折扣碼：在這裡新增或修改。perUnit＝每支單支剪刀／每組任選組折（新台幣）。
  // 只有商品目錄 discountable: true 的商品（目前只有剪刀）計入；課程、吹風機、離子夾不折。
  var DISCOUNT_CODES = { 'MILLI100': { perUnit: 100, label: '剪刀每支／每組折 NT$100' } };
  var NOT_ELIGIBLE = '此折扣碼僅適用毫剪剪刀。This code applies to Milli Peak shears only.';
  var f = document.getElementById('co-form'); if (!f) return;
  var $ = function (id) { return document.getElementById(id); };
  var applied = null, fmt = C.fmt;
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

  // 直接連結：?item= / ?shear= 先加進購物車（已在購物車就不重複加），再把網址參數拿掉避免重新整理重複加入
  var qs = new URLSearchParams(location.search), id = qs.get('item') || qs.get('shear');
  if (id) {
    if (C.catalog[id] && !C.get().some(function (l) { return l.id === id; })) C.add(id, 1);
    if (!C.catalog[id]) { $('co-unavail').hidden = false; $('co-unavail').textContent = '找不到此商品。Item not found.'; }
    if (history.replaceState) history.replaceState(null, '', location.pathname);
  }
  function val(name) { var el = f.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function show(sel, on) {
    document.querySelectorAll(sel).forEach(function (box) {
      box.hidden = !on; box.querySelectorAll('input,select').forEach(function (el) { el.disabled = !on; });
      if (box.matches('input')) box.disabled = !on;
    });
  }
  function render() {
    var cart = C.get(), pr = C.price(cart);
    $('co-cart').innerHTML = pr.empty ? '<li class="muted">購物車是空的。Your cart is empty. <a href="index.html#products">看剪刀</a>・<a href="select.html">選物</a></li>' :
      cart.map(function (l) { var p = C.catalog[l.id]; return '<li><span>' + esc(p.name) + (p.kind === 'course' ? '（線上課程）' : p.demo ? '（示範）' : '') + '</span><span>× ' + l.qty + '</span></li>'; }).join('');
    $('co-unavail').hidden = !pr.empty && $('co-unavail').textContent.indexOf('找不到') < 0;
    if (pr.empty) { $('co-unavail').hidden = false; if ($('co-unavail').textContent.indexOf('找不到') < 0) $('co-unavail').textContent = '購物車是空的，請先加入商品。Your cart is empty.'; }
    f.querySelector('.co-btn--submit').disabled = pr.empty;
    show('[data-shear-hint]', pr.shear);
    show('[data-physical]', pr.physical);
    show('[data-course]', pr.course);
    show('[data-terms="physical"]', pr.physical);
    show('[data-terms="course"]', pr.course);
    show('[data-inv="company"]', $('co-company').checked);
    // 段落編號依顯示中的段落重排
    var n = 0; document.querySelectorAll('[data-sec]').forEach(function (s) { if (!s.hidden) s.querySelector('.co-no').textContent = ('0' + (++n)).slice(-2); });
    $('co-sum-no').textContent = ('0' + (n + 1)).slice(-2);

    $('co-lines').innerHTML = pr.lines.map(function (x) { return '<li' + (x.sub ? ' class="co-lines__sub"' : '') + '><span>' + esc(x.label) + '</span><span>' + esc(x.amount) + '</span></li>'; }).join('');
    if (applied && !pr.discUnits) { applied = null; var m = $('co-code-msg'); m.className = 'co-code__msg is-err'; m.textContent = NOT_ELIGIBLE; }
    var disc = applied ? Math.min(pr.subtotal, DISCOUNT_CODES[applied].perUnit * pr.discUnits) : 0, total = pr.subtotal - disc;
    $('co-disc-note').hidden = !(applied && (pr.discUnits < pr.units || pr.hasDemo));
    $('co-subtotal').textContent = fmt(pr.subtotal);
    $('co-disc-row').hidden = !disc; $('co-disc').textContent = '−' + fmt(disc);
    $('co-disc-code').textContent = applied ? '(' + applied + ')' : '';
    $('co-total').textContent = fmt(total);
    $('co-demo-note').hidden = !pr.hasDemo;

    // 3 期 0 利率：信用卡＋購物車內有剪刀任選組才可選
    var credit = val('payment_method') === 'Credit', box = f.querySelector('[data-inst]'), opt3 = f.querySelector('[data-inst3]');
    box.hidden = !credit; opt3.hidden = !pr.bundle;
    box.querySelectorAll('input').forEach(function (el) { el.disabled = !credit; });
    opt3.querySelector('input').disabled = !(credit && pr.bundle);
    if (!pr.bundle && val('credit_installment') === '3') f.querySelector('input[name="credit_installment"][value="0"]').checked = true;
    var useInst = credit && pr.bundle && val('credit_installment') === '3';
    $('co-inst-row').hidden = !useInst;
    if (useInst) {
      // 綠界分期：每期金額無條件捨去，除不盡的餘數加在第一期（上線前請以綠界實際試算確認）
      var per = Math.floor(total / 3), first = total - per * 2;
      $('co-inst').innerHTML = first === per ? fmt(per) + ' × 3 期' : '首期 ' + fmt(first) + '，<br>之後 ' + fmt(per) + ' × 2 期';
    }
  }
  $('co-apply').addEventListener('click', function () {
    var code = $('co-code').value.trim().toUpperCase(), msg = $('co-code-msg'), input = $('co-code');
    if (code && DISCOUNT_CODES[code] && !C.price(C.get()).discUnits) { applied = null; msg.className = 'co-code__msg is-err'; msg.textContent = NOT_ELIGIBLE; input.setAttribute('aria-invalid', 'true'); }
    else if (code && DISCOUNT_CODES[code]) { applied = code; msg.className = 'co-code__msg is-ok'; msg.textContent = '已套用 ' + code + '：' + DISCOUNT_CODES[code].label; input.removeAttribute('aria-invalid'); }
    else { applied = null; msg.className = 'co-code__msg is-err'; msg.textContent = code ? '折扣碼無效，請再確認。Invalid code.' : '請輸入折扣碼。Enter a code.'; input.setAttribute('aria-invalid', 'true'); }
    render();
  });
  $('co-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('co-apply').click(); } });
  f.addEventListener('input', render); f.addEventListener('change', render);
  document.addEventListener('mpcart', render);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('co-out');
    if (C.price(C.get()).empty) { out.textContent = '購物車是空的。Your cart is empty.'; return; }
    if (!f.checkValidity()) { f.reportValidity(); out.textContent = '請完成必填欄位。Please complete the required fields.'; return; }
    out.textContent = '目前尚未開放線上下單。Online ordering not open yet.';
  });
  render();
});
