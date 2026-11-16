/* 毫剪／W 選物 通用結帳預覽（靜態）。商品目錄見 catalog.js（由 build_pages2.py 產生）。
   WordPress 版改由 WooCommerce + 綠界 ECPay 外掛處理；此檔只示範欄位與計價。
   網址：checkout.html?item=<id>；剪刀也可用 ?shear=<key>。 */
(function () {
  'use strict';
  var CATALOG = window.MP_CATALOG || {};
  var BUNDLES = window.MP_BUNDLES || { single: 5000, any3: 13500, any4: 17500 };
  var SETN = { any3: 3, any4: 4 };
  // 折扣碼：在這裡新增或修改。perUnit＝單件每件折、剪刀任選組每組折（新台幣）
  var DISCOUNT_CODES = {
    'MILLI100': { perUnit: 100, label: '每件／每組折 NT$100' }
  };

  var f = document.getElementById('co-form');
  if (!f) return;
  var $ = function (id) { return document.getElementById(id); };
  var applied = null;
  var fmt = function (n) { return 'NT$' + n.toLocaleString('en-US'); };
  var nameOf = function (k) { return CATALOG[k] ? CATALOG[k].name : k; };

  // 決定結帳商品
  var qs = new URLSearchParams(location.search);
  var id = qs.get('item') || qs.get('shear') || 'fine';
  var prod = CATALOG[id];
  var kind = prod ? prod.kind : 'none';
  var available = !!(prod && prod.enabled && prod.price);
  if (kind === 'shear') {
    f.single_item.value = id;
    for (var i = 1; i <= 4; i++) f['set_item_' + i].value = id;
  } else if (prod) {
    $('co-item-id').value = id;
    $('co-item-name').textContent = prod.name;
    $('co-item-price').textContent = prod.price ? fmt(prod.price) : '';
  }
  if (!available) {
    $('co-unavail').hidden = false;
    $('co-unavail').textContent = (prod ? prod.name + '：' : '') + '此商品尚未開放購買。This item is not available yet.';
    f.querySelector('.co-btn--submit').disabled = true;
  }

  function val(name) { var el = f.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function toggle(sel, show) {
    document.querySelectorAll(sel).forEach(function (box) {
      box.hidden = !show;
      box.querySelectorAll('input,select').forEach(function (el) { el.disabled = !show; });
    });
  }

  function render() {
    var isShear = kind === 'shear';
    toggle('[data-kind="shear"]', isShear);
    toggle('[data-kind="item"]', !isShear && !!prod);
    var mode = isShear ? val('mp_bundle') : 'item';
    if (isShear) {
      toggle('[data-mode="single"]', mode === 'single');
      toggle('[data-mode="set"]', mode !== 'single');
      if (mode !== 'single') f.querySelectorAll('.co-field--pick').forEach(function (p, i) {
        var on = i < SETN[mode]; p.hidden = !on; p.querySelector('select').disabled = !on;
      });
    }
    toggle('[data-inv="company"]', $('co-company').checked);

    // 計價
    var lines = [], subtotal = 0, units = 0;
    if (mode === 'single') {
      var qty = Math.max(1, Math.min(10, parseInt(f.quantity.value, 10) || 1));
      subtotal = BUNDLES.single * qty; units = qty;
      lines.push([nameOf(f.single_item.value) + ' × ' + qty, fmt(subtotal)]);
    } else if (mode === 'any3' || mode === 'any4') {
      subtotal = BUNDLES[mode]; units = 1;
      var picked = [];
      for (var j = 1; j <= SETN[mode]; j++) picked.push(nameOf(f['set_item_' + j].value));
      lines.push(['任選 ' + SETN[mode] + ' 把 any ' + (mode === 'any3' ? 'three' : 'four'), fmt(subtotal)]);
      lines.push([picked.join('・'), '']);
    } else if (prod) {
      var iq = Math.max(1, Math.min(10, parseInt(f.item_quantity.value, 10) || 1));
      subtotal = (prod.price || 0) * iq; units = iq;
      lines.push([prod.name + ' × ' + iq, prod.price ? fmt(subtotal) : '—']);
    }
    $('co-lines').innerHTML = lines.map(function (l) {
      return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>';
    }).join('');
    var disc = applied && subtotal ? DISCOUNT_CODES[applied].perUnit * units : 0;
    var total = subtotal - disc;
    $('co-subtotal').textContent = subtotal ? fmt(subtotal) : '—';
    $('co-disc-row').hidden = !disc;
    $('co-disc').textContent = '−' + fmt(disc);
    $('co-disc-code').textContent = applied ? '(' + applied + ')' : '';
    $('co-total').textContent = subtotal ? fmt(total) : '—';

    // 分期：僅 信用卡 ＋ 剪刀任選 3／4 把 可選 3 期 0 利率；其他只有一次付清
    var credit = val('payment_method') === 'Credit';
    var instOK = mode === 'any3' || mode === 'any4';
    var box = f.querySelector('[data-inst]'), opt3 = f.querySelector('[data-inst3]');
    box.hidden = !credit; opt3.hidden = !instOK;
    box.querySelectorAll('input').forEach(function (el) { el.disabled = !credit; });
    opt3.querySelector('input').disabled = !(credit && instOK);
    if (!instOK && val('credit_installment') === '3') f.querySelector('input[name="credit_installment"][value="0"]').checked = true;
    var useInst = credit && instOK && val('credit_installment') === '3';
    $('co-inst-row').hidden = !useInst;
    if (useInst) {
      // 綠界分期：每期金額無條件捨去，除不盡的餘數加在第一期（上線前請以綠界實際試算確認）
      var per = Math.floor(total / 3), first = total - per * 2;
      $('co-inst').innerHTML = first === per ? fmt(per) + ' × 3 期'
        : '首期 ' + fmt(first) + '，<br>之後 ' + fmt(per) + ' × 2 期';
    }
  }

  $('co-apply').addEventListener('click', function () {
    var code = $('co-code').value.trim().toUpperCase();
    var msg = $('co-code-msg'), input = $('co-code');
    if (code && DISCOUNT_CODES[code]) {
      applied = code; msg.className = 'co-code__msg is-ok';
      msg.textContent = '已套用 ' + code + '：' + DISCOUNT_CODES[code].label;
      input.removeAttribute('aria-invalid');
    } else {
      applied = null; msg.className = 'co-code__msg is-err';
      msg.textContent = code ? '折扣碼無效，請再確認。Invalid code.' : '請輸入折扣碼。Enter a code.';
      input.setAttribute('aria-invalid', 'true');
    }
    render();
  });
  $('co-code').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); $('co-apply').click(); } });

  f.addEventListener('input', render);
  f.addEventListener('change', render);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('co-out');
    if (!available) { out.textContent = '此商品尚未開放購買。This item is not available yet.'; return; }
    if (!f.checkValidity()) { f.reportValidity(); out.textContent = '請完成必填欄位。Please complete the required fields.'; return; }
    out.textContent = '目前尚未開放線上下單。Online ordering not open yet.';
  });
  render();
})();
