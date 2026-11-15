/* 毫剪 結帳預覽（靜態）。WordPress 版改由 WooCommerce + 綠界 ECPay 外掛處理；此檔只示範欄位與計價。 */
(function () {
  'use strict';
  // 價格（新台幣，含稅）
  var PRICE = { single: 5000, any3: 13500, any4: 17500 };
  var SETN = { any3: 3, any4: 4 };
  var NAMES = { fine: '緻 fine', core: '通 core', air: '透 air', flow: '順 flow' };
  // 折扣碼：在這裡新增或修改。perUnit＝單支每把折、任選組每組折（新台幣）
  var DISCOUNT_CODES = {
    'MILLI100': { perUnit: 100, label: '每把／每組折 NT$100' }
  };

  var f = document.getElementById('co-form');
  if (!f) return;
  var $ = function (id) { return document.getElementById(id); };
  var applied = null;
  var fmt = function (n) { return 'NT$' + n.toLocaleString('en-US'); };

  // 由商品頁帶入 ?shear=fine
  var q = new URLSearchParams(location.search).get('shear');
  if (q && NAMES[q]) { f.single_item.value = q; for (var i = 1; i <= 4; i++) f['set_item_' + i].value = q; }

  function val(name) { var el = f.querySelector('input[name="' + name + '"]:checked'); return el ? el.value : ''; }
  function toggle(sel, show) {
    document.querySelectorAll(sel).forEach(function (box) {
      box.hidden = !show;
      box.querySelectorAll('input,select').forEach(function (el) { el.disabled = !show; });
    });
  }

  function render() {
    var mode = val('mp_bundle');
    toggle('[data-mode="single"]', mode === 'single');
    toggle('[data-mode="set"]', mode !== 'single');
    if (mode !== 'single') {
      var picks = f.querySelectorAll('.co-field--pick');
      picks.forEach(function (p, i) {
        var on = i < SETN[mode]; p.hidden = !on; p.querySelector('select').disabled = !on;
      });
    }
    var ship = val('shipping_method');
    toggle('[data-ship="home"]', ship === 'home');
    toggle('[data-ship="cvs"]', ship === 'cvs');
    var inv = val('invoice_type');
    ['mobile', 'cert', 'company'].forEach(function (k) { toggle('[data-inv="' + k + '"]', inv === k); });

    // 計價
    var lines = [], subtotal, units;
    if (mode === 'single') {
      var qty = Math.max(1, Math.min(10, parseInt(f.quantity.value, 10) || 1));
      subtotal = PRICE.single * qty; units = qty;
      lines.push([NAMES[f.single_item.value] + ' × ' + qty, fmt(subtotal)]);
    } else {
      subtotal = PRICE[mode]; units = 1;
      var picked = [];
      for (var j = 1; j <= SETN[mode]; j++) picked.push(NAMES[f['set_item_' + j].value]);
      lines.push(['任選 ' + SETN[mode] + ' 把 any ' + (mode === 'any3' ? 'three' : 'four'), fmt(subtotal)]);
      lines.push([picked.join('・'), '']);
    }
    $('co-lines').innerHTML = lines.map(function (l) {
      return '<li><span>' + l[0] + '</span><span>' + l[1] + '</span></li>';
    }).join('');
    var disc = applied ? DISCOUNT_CODES[applied].perUnit * units : 0;
    $('co-subtotal').textContent = fmt(subtotal);
    $('co-disc-row').hidden = !disc;
    $('co-disc').textContent = '−' + fmt(disc);
    $('co-disc-code').textContent = applied ? '(' + applied + ')' : '';
    var total = subtotal - disc;
    $('co-total').textContent = fmt(total);
    // 分期：任選 3／4 把＋信用卡才可選 3 期 0 利率；單支只有一次付清
    var credit = val('payment_method') === 'Credit';
    var instOK = mode !== 'single';
    var box = f.querySelector('[data-inst]'), opt3 = f.querySelector('[data-inst3]');
    box.hidden = !credit; opt3.hidden = !instOK;
    opt3.querySelector('input').disabled = !instOK;
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

  // 超商門市：WordPress 版開啟綠界電子地圖
  $('co-store').addEventListener('click', function () {
    var brand = val('cvs_type') === 'FAMI' ? '全家' : '7-ELEVEN';
    $('co-store-out').textContent = '預覽版：此處將開啟綠界 ' + brand + ' 門市地圖。Preview: opens the ECPay store map on WordPress.';
  });

  f.addEventListener('input', render);
  f.addEventListener('change', render);
  f.addEventListener('submit', function (e) {
    e.preventDefault();
    var out = $('co-out');
    if (!f.checkValidity()) { f.reportValidity(); out.textContent = '請完成必填欄位。Please complete the required fields.'; return; }
    out.textContent = '預覽版不會送出訂單：上線後此按鈕將於 WordPress 串接綠界 ECPay 付款。Preview only: this will connect to ECPay on WordPress.';
  });
  render();
})();
