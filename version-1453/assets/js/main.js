(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  function setupMenu() {
    var toggle = document.querySelector("[data-menu-toggle]");
    var panel = document.querySelector("[data-mobile-panel]");
    if (!toggle || !panel) {
      return;
    }
    toggle.addEventListener("click", function () {
      panel.classList.toggle("is-open");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
    var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
    if (slides.length < 2) {
      return;
    }
    var index = 0;
    var timer = null;

    function show(nextIndex) {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === index);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === index);
      });
    }

    function start() {
      stop();
      timer = window.setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
      timer = null;
    }

    dots.forEach(function (dot, dotIndex) {
      dot.addEventListener("click", function () {
        show(dotIndex);
        start();
      });
    });

    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function normalize(value) {
    return String(value || "").toLowerCase().trim();
  }

  function setupMovieFilter() {
    var scope = document.querySelector("[data-filter-scope]");
    if (!scope) {
      return;
    }
    var input = scope.querySelector("[data-filter-input]");
    var year = scope.querySelector("[data-filter-year]");
    var type = scope.querySelector("[data-filter-type]");
    var cards = Array.prototype.slice.call(scope.querySelectorAll("[data-movie-card]"));
    var status = scope.querySelector("[data-search-status]");
    var params = new URLSearchParams(window.location.search);
    var initialQuery = params.get("q") || "";

    if (input && initialQuery) {
      input.value = initialQuery;
    }

    function apply() {
      var queryValue = normalize(input ? input.value : "");
      var yearValue = normalize(year ? year.value : "");
      var typeValue = normalize(type ? type.value : "");
      var visible = 0;

      cards.forEach(function (card) {
        var haystack = normalize((card.getAttribute("data-title") || "") + " " + (card.getAttribute("data-meta") || ""));
        var matchesQuery = !queryValue || haystack.indexOf(queryValue) !== -1;
        var matchesYear = !yearValue || haystack.indexOf(yearValue) !== -1;
        var matchesType = !typeValue || haystack.indexOf(typeValue) !== -1;
        var shouldShow = matchesQuery && matchesYear && matchesType;
        card.classList.toggle("is-hidden", !shouldShow);
        if (shouldShow) {
          visible += 1;
        }
      });

      if (status) {
        status.classList.toggle("is-visible", Boolean(queryValue || yearValue || typeValue));
        if (visible > 0) {
          status.textContent = "已筛选出相关影片";
        } else {
          status.textContent = "没有找到匹配的影片";
        }
      }
    }

    [input, year, type].forEach(function (control) {
      if (control) {
        control.addEventListener("input", apply);
        control.addEventListener("change", apply);
      }
    });

    apply();
  }

  ready(function () {
    setupMenu();
    setupHero();
    setupMovieFilter();
  });
})();
