(function () {
  window.initializeMoviePlayer = function (source) {
    var video = document.getElementById('moviePlayer');
    var button = document.getElementById('playButton');
    if (!video || !source) {
      return;
    }

    var hlsInstance = null;

    function bindSource() {
      if (hlsInstance || video.getAttribute('src')) {
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(source);
        hlsInstance.attachMedia(video);
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = source;
      }
    }

    function hideButton() {
      if (button) {
        button.classList.add('is-hidden');
      }
    }

    function showButton() {
      if (button && video.paused) {
        button.classList.remove('is-hidden');
      }
    }

    function startPlayback() {
      bindSource();
      var playPromise = video.play();
      if (playPromise && typeof playPromise.then === 'function') {
        playPromise.then(hideButton).catch(showButton);
      } else {
        hideButton();
      }
    }

    bindSource();

    if (button) {
      button.addEventListener('click', startPlayback);
    }
    video.addEventListener('click', function () {
      if (video.paused) {
        startPlayback();
      }
    });
    video.addEventListener('play', hideButton);
    video.addEventListener('pause', showButton);
    video.addEventListener('ended', showButton);
    window.addEventListener('pagehide', function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  };
})();
