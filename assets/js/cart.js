/* 毫剪／W 選物 購物車（靜態預覽，localStorage）。WordPress 版改用 WooCommerce 購物車。
   MPCart.get() → [{id, qty}]；MPCart.price(cart) → 計價明細（剪刀滿 3／4 把自動任選組）。 */
(function () {
  'use strict';
  var KEY = 'mp_cart_v1';
  var CAT = window.MP_CATALOG || {};
  var B = window.MP_BUNDLES || { single: 5000, any3: 13500, any4: 17500 };
  var fmt = function (n) { return 'NT$' + n.toLocaleString('en-US'); };

  function read() {
    try { var c = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(c) ? c.filter(function (l) { return CAT[l.id] && l.qty > 0; }) : []; }
    catch (e) { return []; }
  }
  function write(c) { try { localStorage.setItem(KEY, JSON.stringify(c)); } catch (e) {} badge(); document.dispatchEvent(new CustomEvent('mpcart')); }
  function clamp(id, q) { var m = (CAT[id] && CAT[id].max) || 10; return Math.max(0, Math.min(m, q | 0)); }
  function add(id, q) {
    if (!CAT[id]) return; var c = read(), l = c.filter(function (x) { return x.id === id; })[0];
    if (l) l.qty = clamp(id, l.qty + (q || 1)); else c.push({ id: id, qty: clamp(id, q || 1) });
    write(c);
  }
  function setQty(id, q) { var c = read().map(function (l) { if (l.id === id) l.qty = clamp(id, q); return l; }).filter(function (l) { return l.qty > 0; }); write(c); }
  function remove(id) { write(read().filter(function (l) { return l.id !== id; })); }
  function count() { return read().reduce(function (s, l) { return s + l.qty; }, 0); }

  // 剪刀組合：在 4 把組、3 把組、單支間取最低價
  function shearSplit(n) {
    var best = { a: 0, b: 0, c: n, cost: n * B.single };
    for (var a = 0; a * 4 <= n; a++) for (var b = 0; a * 4 + b * 3 <= n; b++) {
      var c = n - a * 4 - b * 3, cost = a * B.any4 + b * B.any3 + c * B.single;
      if (cost < best.cost) best = { a: a, b: b, c: c, cost: cost };
    }
    return best;
  }
  function price(cart) {
    var lines = [], subtotal = 0, units = 0, nShear = 0, names = [], hasDemo = false,
        physical = false, course = false, shear = false, discUnits = 0, shearDisc = false;
    cart.forEach(function (l) {
      var p = CAT[l.id]; if (!p) return;
      if (p.physical) physical = true; if (p.kind === 'course') course = true;
      if (p.kind === 'shear') { shear = true; if (p.discountable) shearDisc = true; nShear += l.qty; for (var i = 0; i < l.qty; i++) names.push(p.name); return; }
      if (p.price) { subtotal += p.price * l.qty; units += l.qty; if (p.discountable) discUnits += l.qty; lines.push({ label: p.name + ' × ' + l.qty, amount: fmt(p.price * l.qty) }); }
      else { hasDemo = true; lines.push({ label: p.name + ' × ' + l.qty, amount: '示範價格（待提供）', demo: true }); }
    });
    var split = shearSplit(nShear), bundle = split.a + split.b > 0;
    if (nShear) {
      var sl = [];
      if (split.a) sl.push({ label: '任選 4 把 any four' + (split.a > 1 ? ' × ' + split.a : ''), amount: fmt(split.a * B.any4) });
      if (split.b) sl.push({ label: '任選 3 把 any three' + (split.b > 1 ? ' × ' + split.b : ''), amount: fmt(split.b * B.any3) });
      if (split.c) sl.push({ label: '單支 single × ' + split.c, amount: fmt(split.c * B.single) });
      sl.push({ label: names.join('・'), amount: '', sub: true });
      lines = sl.concat(lines);
      subtotal += split.cost; units += split.a + split.b + split.c; if (shearDisc) discUnits += split.a + split.b + split.c;
    }
    return { lines: lines, subtotal: subtotal, units: units, bundle: bundle, hasDemo: hasDemo, physical: physical, course: course, shear: shear, nShear: nShear, discUnits: discUnits, empty: !cart.length };
  }

  function badge() {
    var n = count();
    document.querySelectorAll('[data-cart-count]').forEach(function (el) { el.textContent = n; el.hidden = !n; });
    document.querySelectorAll('.cart-link').forEach(function (a) { a.setAttribute('aria-label', '購物車 cart（' + n + '）'); });
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-add-to-cart]'); if (!b) return;
    var id = b.getAttribute('data-add-to-cart'); add(id, 1);
    var msg = document.querySelector('[data-cart-msg]');
    if (msg) msg.innerHTML = '已加入購物車：' + (CAT[id] ? CAT[id].name : id) + '　<a href="' + (document.querySelector('.cart-link') || {}).getAttribute('href') + '">查看購物車 view cart →</a>';
  });
  window.MPCart = { get: read, set: write, add: add, setQty: setQty, remove: remove, count: count, price: price, fmt: fmt, catalog: CAT };
  badge();
})();
