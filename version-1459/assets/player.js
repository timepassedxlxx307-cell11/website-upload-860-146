(function () {
    window.initializeMoviePlayer = function (playerId, playlistUrl) {
        var box = document.getElementById(playerId);
        if (!box) {
            return;
        }

        var video = box.querySelector('video');
        var overlay = box.querySelector('[data-player-overlay]');
        var button = box.querySelector('[data-player-button]');
        var hlsInstance = null;
        var isReady = false;

        function attachStream() {
            if (isReady || !video) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = playlistUrl;
                isReady = true;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hlsInstance.loadSource(playlistUrl);
                hlsInstance.attachMedia(video);
                isReady = true;
                return;
            }

            video.src = playlistUrl;
            isReady = true;
        }

        function startPlayback() {
            attachStream();
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
            var attempt = video.play();
            if (attempt && typeof attempt.catch === 'function') {
                attempt.catch(function () {});
            }
        }

        if (button) {
            button.addEventListener('click', startPlayback);
        }

        if (overlay) {
            overlay.addEventListener('click', function (event) {
                if (event.target === overlay) {
                    startPlayback();
                }
            });
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                startPlayback();
            } else {
                video.pause();
            }
        });

        video.addEventListener('play', function () {
            if (overlay) {
                overlay.classList.add('is-hidden');
            }
        });

        video.addEventListener('pause', function () {
            if (overlay && video.currentTime === 0) {
                overlay.classList.remove('is-hidden');
            }
        });

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    };
})();
