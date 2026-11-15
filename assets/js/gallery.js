/* 毫剪 單品頁滑動圖庫：CSS scroll-snap ＋ 圓點同步；不自動播放、無外部套件 */
(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.pg').forEach(function (root) {
    var track = root.querySelector('.pg__track');
    var slides = track.querySelectorAll('.pg__slide');
    var dots = root.querySelectorAll('.pg__dot');
    var prev = root.querySelector('.pg__arrow--prev');
    var next = root.querySelector('.pg__arrow--next');
    var n = slides.length, cur = 0, ticking = false;
    function width() { return track.clientWidth || 1; }
    function index() { return Math.max(0, Math.min(n - 1, Math.round(track.scrollLeft / width()))); }
    function update() {
      ticking = false;
      var i = index();
      cur = i;
      dots.forEach(function (d, j) { if (j === i) d.setAttribute('aria-current', 'true'); else d.removeAttribute('aria-current'); });
      if (prev) prev.disabled = i === 0;
      if (next) next.disabled = i === n - 1;
    }
    function go(i) {
      i = Math.max(0, Math.min(n - 1, i));
      track.scrollTo({ left: i * width(), behavior: reduce ? 'auto' : 'smooth' });
    }
    track.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    window.addEventListener('resize', function () { track.scrollLeft = cur * width(); });
    dots.forEach(function (d, j) { d.addEventListener('click', function () { go(j); }); });
    if (prev) prev.addEventListener('click', function () { go(index() - 1); });
    if (next) next.addEventListener('click', function () { go(index() + 1); });
    track.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(index() - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); go(index() + 1); }
    });
    /* 桌機滑鼠拖曳（觸控交給原生捲動） */
    var down = false, sx = 0, sl = 0, moved = false;
    track.addEventListener('pointerdown', function (e) {
      if (e.pointerType !== 'mouse' || e.button !== 0) return;
      down = true; moved = false; sx = e.clientX; sl = track.scrollLeft;
      track.classList.add('is-drag');
    });
    window.addEventListener('pointermove', function (e) {
      if (!down) return;
      var dx = e.clientX - sx;
      if (Math.abs(dx) > 3) moved = true;
      track.scrollLeft = sl - dx;
    });
    window.addEventListener('pointerup', function (e) {
      if (!down) return;
      down = false; track.classList.remove('is-drag');
      var dx = e.clientX - sx, base = Math.round(sl / width());
      go(Math.abs(dx) > width() * 0.15 ? base + (dx < 0 ? 1 : -1) : base);
    });
    track.addEventListener('click', function (e) { if (moved) { e.preventDefault(); moved = false; } }, true);
    update();
  });
})();
