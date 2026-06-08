(function () {
  function qs(selector, root) {
    return (root || document).querySelector(selector);
  }

  function qsa(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        "\"": "&quot;"
      }[char];
    });
  }

  function initMenu() {
    var button = qs("[data-menu-toggle]");
    var nav = qs("[data-mobile-nav]");
    if (!button || !nav) {
      return;
    }
    button.addEventListener("click", function () {
      nav.classList.toggle("is-open");
    });
  }

  function initHero() {
    var hero = qs("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = qsa("[data-hero-slide]", hero);
    var dots = qsa("[data-hero-dot]", hero);
    var prev = qs("[data-hero-prev]", hero);
    var next = qs("[data-hero-next]", hero);
    if (!slides.length) {
      return;
    }
    var current = 0;
    var timer = null;
    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle("is-active", slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle("is-active", dotIndex === current);
      });
    }
    function start() {
      stop();
      timer = window.setInterval(function () {
        show(current + 1);
      }, 5200);
    }
    function stop() {
      if (timer) {
        window.clearInterval(timer);
      }
    }
    if (prev) {
      prev.addEventListener("click", function () {
        show(current - 1);
        start();
      });
    }
    if (next) {
      next.addEventListener("click", function () {
        show(current + 1);
        start();
      });
    }
    dots.forEach(function (dot) {
      dot.addEventListener("click", function () {
        show(Number(dot.getAttribute("data-hero-dot")) || 0);
        start();
      });
    });
    hero.addEventListener("mouseenter", stop);
    hero.addEventListener("mouseleave", start);
    show(0);
    start();
  }

  function initPlayers() {
    qsa("[data-player]").forEach(function (shell) {
      var video = qs("video[data-hls]", shell);
      var button = qs("[data-player-button]", shell);
      if (!video || !button) {
        return;
      }
      var hlsUrl = video.getAttribute("data-hls");
      var ready = false;
      function prepare() {
        if (ready) {
          return;
        }
        ready = true;
        if (video.canPlayType("application/vnd.apple.mpegurl")) {
          video.src = hlsUrl;
          return;
        }
        if (window.Hls && window.Hls.isSupported()) {
          var hls = new window.Hls({ enableWorker: true, lowLatencyMode: true });
          hls.loadSource(hlsUrl);
          hls.attachMedia(video);
          shell.hlsPlayer = hls;
          return;
        }
        video.src = hlsUrl;
      }
      function start() {
        prepare();
        shell.classList.add("is-started");
        var playPromise = video.play();
        if (playPromise && playPromise.catch) {
          playPromise.catch(function () {
            shell.classList.remove("is-started");
          });
        }
      }
      button.addEventListener("click", start);
      video.addEventListener("click", function () {
        if (video.paused) {
          start();
        }
      });
      video.addEventListener("play", function () {
        shell.classList.add("is-started");
      });
    });
  }

  function initSearchPage() {
    var root = qs("[data-search-page]");
    var resultRoot = qs("[data-search-results]");
    var title = qs("[data-search-title]");
    if (!root || !resultRoot || typeof SEARCH_INDEX === "undefined") {
      return;
    }
    var params = new URLSearchParams(window.location.search);
    var query = (params.get("q") || "").trim().toLowerCase();
    var items = SEARCH_INDEX;
    if (query) {
      items = SEARCH_INDEX.filter(function (item) {
        return item.searchText.indexOf(query) !== -1;
      }).slice(0, 80);
      if (title) {
        title.textContent = "搜索：“" + params.get("q").trim() + "”";
      }
    } else {
      items = SEARCH_INDEX.slice(0, 24);
    }
    if (!items.length) {
      resultRoot.innerHTML = "<div class=\"empty-state\"><h2>未找到相关影片</h2><p>可以尝试更换片名、类型、地区或年份。</p></div>";
      return;
    }
    resultRoot.innerHTML = items.map(function (item) {
      return [
        "<article class=\"movie-card\">",
        "<a class=\"poster-link\" href=\"" + item.url + "\">",
        "<img src=\"" + item.image + "\" alt=\"" + escapeHtml(item.title) + "\" loading=\"lazy\">",
        "<span class=\"hover-play\">▶</span>",
        "</a>",
        "<div class=\"card-body\">",
        "<h3><a href=\"" + item.url + "\">" + escapeHtml(item.title) + "</a></h3>",
        "<p>" + escapeHtml(item.oneLine) + "</p>",
        "<div class=\"card-meta\"><span>" + escapeHtml(item.year) + "</span><span>" + escapeHtml(item.region) + "</span><span>" + escapeHtml(item.category) + "</span></div>",
        "</div>",
        "</article>"
      ].join("");
    }).join("");
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMenu();
    initHero();
    initPlayers();
    initSearchPage();
  });
})();
