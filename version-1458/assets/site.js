(function () {
  var header = document.querySelector('.site-header');
  var toggle = document.querySelector('.nav-toggle');

  if (toggle && header) {
    toggle.addEventListener('click', function () {
      header.classList.toggle('is-open');
    });
  }

  var hero = document.querySelector('[data-hero]');

  if (hero) {
    var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
    var index = 0;

    function showSlide(next) {
      index = (next + slides.length) % slides.length;
      slides.forEach(function (slide, current) {
        slide.classList.toggle('active', current === index);
      });
      dots.forEach(function (dot, current) {
        dot.classList.toggle('active', current === index);
      });
    }

    dots.forEach(function (dot, current) {
      dot.addEventListener('click', function () {
        showSlide(current);
      });
    });

    if (slides.length > 1) {
      setInterval(function () {
        showSlide(index + 1);
      }, 5200);
    }
  }

  var localSearch = document.querySelector('.local-search');
  var cards = Array.prototype.slice.call(document.querySelectorAll('.movie-card'));
  var emptyState = document.querySelector('.empty-state');

  function getQueryValue() {
    var params = new URLSearchParams(window.location.search);
    return params.get('q') || '';
  }

  function filterCards(value) {
    var keyword = value.trim().toLowerCase();
    var visible = 0;

    cards.forEach(function (card) {
      var text = ((card.getAttribute('data-title') || '') + ' ' + (card.getAttribute('data-meta') || '')).toLowerCase();
      var matched = keyword === '' || text.indexOf(keyword) !== -1;
      card.hidden = !matched;
      if (matched) {
        visible += 1;
      }
    });

    if (emptyState) {
      emptyState.hidden = visible !== 0;
    }
  }

  if (localSearch && cards.length) {
    var initial = getQueryValue();
    localSearch.value = initial;
    filterCards(initial);
    localSearch.addEventListener('input', function () {
      filterCards(localSearch.value);
    });
  }

  function preparePlayer(shell) {
    var video = shell.querySelector('video');
    var cover = shell.querySelector('.player-cover');
    var url = shell.getAttribute('data-video');

    if (!video || !url) {
      return;
    }

    function loadVideo() {
      if (shell.getAttribute('data-ready') === '1') {
        return;
      }

      shell.setAttribute('data-ready', '1');

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
      } else if (window.Hls && window.Hls.isSupported()) {
        var hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        shell.hls = hls;
      } else {
        video.src = url;
      }
    }

    function startVideo() {
      loadVideo();

      if (cover) {
        cover.classList.add('is-hidden');
      }

      var playResult = video.play();

      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          if (cover) {
            cover.classList.remove('is-hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', startVideo);
    }

    video.addEventListener('click', function () {
      if (video.paused) {
        startVideo();
      } else {
        video.pause();
      }
    });
  }

  Array.prototype.slice.call(document.querySelectorAll('.hls-player')).forEach(preparePlayer);
})();
