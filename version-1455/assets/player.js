(function () {
  var players = document.querySelectorAll('.player-card[data-stream]');

  players.forEach(function (root) {
    var video = root.querySelector('video');
    var cover = root.querySelector('.video-cover');
    var stream = root.getAttribute('data-stream');
    var hls = null;
    var ready = false;

    function attach() {
      if (!video || !stream || ready) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = stream;
        ready = true;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        ready = true;
        return;
      }

      video.src = stream;
      ready = true;
    }

    function play() {
      attach();
      root.classList.add('is-playing');

      if (cover) {
        cover.setAttribute('hidden', 'hidden');
      }

      var promise = video.play();

      if (promise && typeof promise.catch === 'function') {
        promise.catch(function () {
          root.classList.remove('is-playing');

          if (cover) {
            cover.removeAttribute('hidden');
          }
        });
      }
    }

    if (cover) {
      cover.addEventListener('click', play);
    }

    if (video) {
      video.addEventListener('click', function () {
        if (video.paused) {
          play();
        }
      });
    }
  });
})();
