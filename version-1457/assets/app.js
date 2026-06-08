(function () {
  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function normalize(value) {
    return (value || '').toString().toLowerCase().trim();
  }

  function setupMobileMenu() {
    var button = document.querySelector('[data-mobile-toggle]');
    var panel = document.querySelector('[data-mobile-panel]');
    if (!button || !panel) {
      return;
    }
    button.addEventListener('click', function () {
      panel.classList.toggle('is-open');
    });
  }

  function setupHero() {
    var hero = document.querySelector('[data-hero]');
    if (!hero) {
      return;
    }
    var slides = qsa('[data-hero-slide]', hero);
    var dots = qsa('[data-hero-dot]', hero);
    var prev = hero.querySelector('[data-hero-prev]');
    var next = hero.querySelector('[data-hero-next]');
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
      });
    }

    function start() {
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5000);
    }

    function restart() {
      if (timer) {
        window.clearInterval(timer);
      }
      start();
    }

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        restart();
      });
    }
    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        restart();
      });
    }
    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        restart();
      });
    });
    show(0);
    start();
  }

  function setupScrollRows() {
    qsa('[data-scroll-row]').forEach(function (section) {
      var row = section.querySelector('.scroll-row');
      var left = section.querySelector('[data-scroll-left]');
      var right = section.querySelector('[data-scroll-right]');
      if (!row) {
        return;
      }
      if (left) {
        left.addEventListener('click', function () {
          row.scrollBy({ left: -420, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function () {
          row.scrollBy({ left: 420, behavior: 'smooth' });
        });
      }
    });
  }

  function setupTabs() {
    qsa('[data-tabs]').forEach(function (wrap) {
      var buttons = qsa('[data-tab-target]', wrap);
      var panels = qsa('[data-tab-panel]', wrap);
      buttons.forEach(function (button) {
        button.addEventListener('click', function () {
          var target = button.getAttribute('data-tab-target');
          buttons.forEach(function (item) {
            item.classList.toggle('is-active', item === button);
          });
          panels.forEach(function (panel) {
            panel.classList.toggle('is-active', panel.getAttribute('id') === target);
          });
        });
      });
    });
  }

  function setupFilters() {
    qsa('[data-filter-scope]').forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var type = scope.querySelector('[data-filter-type]');
      var region = scope.querySelector('[data-filter-region]');
      var year = scope.querySelector('[data-filter-year]');
      var cards = qsa('.searchable-card', scope);

      function apply() {
        var keyword = normalize(search && search.value);
        var typeValue = normalize(type && type.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        cards.forEach(function (card) {
          var text = normalize([
            card.getAttribute('data-title'),
            card.getAttribute('data-region'),
            card.getAttribute('data-type'),
            card.getAttribute('data-year'),
            card.getAttribute('data-tags')
          ].join(' '));
          var matched = true;
          if (keyword && text.indexOf(keyword) === -1) {
            matched = false;
          }
          if (typeValue && normalize(card.getAttribute('data-type')).indexOf(typeValue) === -1) {
            matched = false;
          }
          if (regionValue && normalize(card.getAttribute('data-region')).indexOf(regionValue) === -1) {
            matched = false;
          }
          if (yearValue && normalize(card.getAttribute('data-year')) !== yearValue) {
            matched = false;
          }
          card.classList.toggle('hide-card', !matched);
        });
      }

      [search, type, region, year].forEach(function (element) {
        if (element) {
          element.addEventListener('input', apply);
          element.addEventListener('change', apply);
        }
      });
      apply();
    });
  }

  function setupImages() {
    qsa('img').forEach(function (image) {
      image.addEventListener('error', function () {
        image.classList.add('image-missing');
      });
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    setupMobileMenu();
    setupHero();
    setupScrollRows();
    setupTabs();
    setupFilters();
    setupImages();
  });
})();
