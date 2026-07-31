(function () {
  var root = document.documentElement;
  var stored = localStorage.getItem('theme');
  var theme = stored === 'dark' ? 'dark' : 'light';

  function applyTheme(next) {
    theme = next;
    if (theme === 'dark') {
      root.setAttribute('data-theme', 'dark');
    } else {
      root.removeAttribute('data-theme');
    }
    localStorage.setItem('theme', theme);
    var lightBtn = document.querySelector('[data-theme-btn="light"]');
    var darkBtn = document.querySelector('[data-theme-btn="dark"]');
    if (lightBtn && darkBtn) {
      lightBtn.classList.toggle('is-active', theme === 'light');
      darkBtn.classList.toggle('is-active', theme === 'dark');
    }
  }

  applyTheme(theme);

  document.addEventListener('DOMContentLoaded', function () {
    var lightBtn = document.querySelector('[data-theme-btn="light"]');
    var darkBtn = document.querySelector('[data-theme-btn="dark"]');
    if (lightBtn) lightBtn.addEventListener('click', function () { applyTheme('light'); });
    if (darkBtn) darkBtn.addEventListener('click', function () { applyTheme('dark'); });
    applyTheme(theme);

    if (window.lucide) window.lucide.createIcons();

    var revealEls = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.15 });
      revealEls.forEach(function (el) { observer.observe(el); });
    } else {
      revealEls.forEach(function (el) { el.classList.add('is-visible'); });
    }

    document.querySelectorAll('img[data-alt-src]').forEach(function (img) {
      var srcA = img.getAttribute('src');
      var srcB = img.getAttribute('data-alt-src');
      var durA = parseInt(img.getAttribute('data-duration-a'), 10);
      var durB = parseInt(img.getAttribute('data-duration-b'), 10);
      var showingA = true;
      (function swap() {
        setTimeout(function () {
          showingA = !showingA;
          img.src = showingA ? srcA : srcB;
          swap();
        }, showingA ? durA : durB);
      })();
    });

    document.querySelectorAll('.pain-point-slider').forEach(function (slider) {
      var slides = Array.prototype.slice.call(slider.querySelectorAll('.pain-point-slide'));
      var dots = Array.prototype.slice.call(slider.querySelectorAll('.pain-point-dot'));
      var prevBtn = slider.querySelector('.pain-point-arrow--prev');
      var nextBtn = slider.querySelector('.pain-point-arrow--next');
      var current = 0;

      function show(i) {
        current = (i + slides.length) % slides.length;
        slides.forEach(function (slide, idx) { slide.hidden = idx !== current; });
        dots.forEach(function (dot, idx) { dot.classList.toggle('is-active', idx === current); });
      }

      dots.forEach(function (dot, idx) {
        dot.addEventListener('click', function () { show(idx); });
      });
      if (prevBtn) prevBtn.addEventListener('click', function () { show(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { show(current + 1); });
    });
  });
})();
