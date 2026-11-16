/* 購物車頁 cart.html */
document.addEventListener('DOMContentLoaded', function () {
  'use strict';
  var C = window.MPCart; if (!C) return;
  var $ = function (id) { return document.getElementById(id); };
  function esc(t) { var d = document.createElement('div'); d.textContent = t; return d.innerHTML; }
  function render() {
    var cart = C.get(), pr = C.price(cart);
    $('cart-empty').hidden = !pr.empty; $('cart-go').hidden = pr.empty;
    $('cart-rows').innerHTML = cart.map(function (l) {
      var p = C.catalog[l.id];
      var img = p.img ? '<img src="' + p.img + '" width="1200" height="900" alt="">' : '<span class="cart-row__ph" aria-hidden="true"></span>';
      var unit = p.price ? C.fmt(p.price) : '示範價格（待提供）';
      var kind = p.kind === 'course' ? '線上課程 online course' : (p.demo ? '示範商品 demo item' : p.model);
      return '<li class="cart-row"><div class="cart-row__img">' + img + '</div><div class="cart-row__meta">' +
        '<p class="cart-row__name">' + esc(p.name) + '</p><p class="cart-row__sub">' + esc(kind) + '・' + unit + '</p>' +
        '<div class="cart-row__ctl"><div class="pt-step" role="group" aria-label="' + esc(p.name) + ' 數量">' +
        '<button type="button" class="pt-step__btn" data-q="-1" data-id="' + l.id + '" aria-label="減少">−</button>' +
        '<input class="pt-step__n" type="number" value="' + l.qty + '" min="1" max="' + (p.max || 10) + '" data-id="' + l.id + '" aria-label="數量">' +
        '<button type="button" class="pt-step__btn" data-q="1" data-id="' + l.id + '" aria-label="增加"' + (l.qty >= (p.max || 10) ? ' disabled' : '') + '>＋</button></div>' +
        '<button type="button" class="cart-row__rm" data-rm="' + l.id + '">移除 <span class="en">remove</span></button></div></div></li>';
    }).join('');
    $('co-lines').innerHTML = pr.lines.map(function (x) { return '<li' + (x.sub ? ' class="co-lines__sub"' : '') + '><span>' + esc(x.label) + '</span><span>' + esc(x.amount) + '</span></li>'; }).join('');
    $('co-total').textContent = C.fmt(pr.subtotal);
    $('co-demo-note').hidden = !pr.hasDemo;
    document.querySelectorAll('[data-physical]').forEach(function (el) { el.hidden = !pr.physical; });
  }
  document.addEventListener('click', function (e) {
    var q = e.target.closest('[data-q]'), rm = e.target.closest('[data-rm]');
    if (q) { var id = q.dataset.id, l = C.get().filter(function (x) { return x.id === id; })[0]; C.setQty(id, Math.max(1, (l ? l.qty : 1) + (+q.dataset.q))); }
    if (rm) C.remove(rm.dataset.rm);
  });
  document.addEventListener('change', function (e) { if (e.target.matches('.pt-step__n[data-id]')) C.setQty(e.target.dataset.id, Math.max(1, parseInt(e.target.value, 10) || 1)); });
  document.addEventListener('mpcart', render);
  render();
});
