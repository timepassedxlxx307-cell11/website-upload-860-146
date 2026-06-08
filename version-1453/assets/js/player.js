(function () {
  window.initializeMoviePlayer = function (streamUrl) {
    var video = document.querySelector("[data-player-video]");
    var cover = document.querySelector("[data-player-cover]");
    var buttons = Array.prototype.slice.call(document.querySelectorAll("[data-player-start]"));
    var hlsInstance = null;
    var isReady = false;

    if (!video || !streamUrl) {
      return;
    }

    function attachStream() {
      if (isReady) {
        return;
      }
      isReady = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = streamUrl;
      } else if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hlsInstance.loadSource(streamUrl);
        hlsInstance.attachMedia(video);
      } else {
        video.src = streamUrl;
      }
    }

    function beginPlayback() {
      attachStream();
      video.controls = true;
      if (cover) {
        cover.classList.add("is-hidden");
      }
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === "function") {
        playPromise.catch(function () {
          video.controls = true;
          if (cover) {
            cover.classList.remove("is-hidden");
          }
        });
      }
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function (event) {
        event.preventDefault();
        beginPlayback();
      });
    });

    if (cover) {
      cover.addEventListener("click", beginPlayback);
    }

    video.addEventListener("click", function () {
      if (!isReady || video.paused) {
        beginPlayback();
      }
    });

    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
        hlsInstance = null;
      }
    });
  };
})();
