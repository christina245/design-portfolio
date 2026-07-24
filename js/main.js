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
  });
})();
