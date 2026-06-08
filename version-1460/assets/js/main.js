(function () {
    function ready(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }

    function initNavigation() {
        var toggle = document.querySelector('[data-nav-toggle]');
        if (!toggle) {
            return;
        }
        toggle.addEventListener('click', function () {
            document.body.classList.toggle('nav-open');
        });
    }

    function initHero() {
        var slider = document.querySelector('[data-hero-slider]');
        if (!slider) {
            return;
        }
        var slides = Array.prototype.slice.call(slider.querySelectorAll('.hero__slide'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        if (slides.length <= 1) {
            return;
        }
        var activeIndex = 0;
        var timer = null;

        function showSlide(index) {
            activeIndex = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === activeIndex);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === activeIndex);
            });
        }

        function start() {
            window.clearInterval(timer);
            timer = window.setInterval(function () {
                showSlide(activeIndex + 1);
            }, 5200);
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                showSlide(index);
                start();
            });
        });

        slider.addEventListener('mouseenter', function () {
            window.clearInterval(timer);
        });
        slider.addEventListener('mouseleave', start);
        showSlide(0);
        start();
    }

    function normalized(value) {
        return String(value || '').toLowerCase().trim();
    }

    function initFilters() {
        var panels = Array.prototype.slice.call(document.querySelectorAll('[data-filter-panel]'));
        panels.forEach(function (panel) {
            var scope = panel.parentElement || document;
            var input = panel.querySelector('[data-filter-search]');
            var selects = Array.prototype.slice.call(panel.querySelectorAll('[data-filter-select]'));
            var empty = panel.querySelector('[data-filter-empty]');
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card'));

            function applyFilter() {
                var keyword = normalized(input ? input.value : '');
                var filters = {};
                selects.forEach(function (select) {
                    filters[select.getAttribute('data-filter-select')] = normalized(select.value);
                });
                var visible = 0;
                cards.forEach(function (card) {
                    var haystack = normalized([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-year'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-tags')
                    ].join(' '));
                    var matched = true;
                    if (keyword && haystack.indexOf(keyword) === -1) {
                        matched = false;
                    }
                    Object.keys(filters).forEach(function (key) {
                        var selected = filters[key];
                        var value = normalized(card.getAttribute('data-' + key));
                        if (selected && value !== selected) {
                            matched = false;
                        }
                    });
                    card.hidden = !matched;
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.hidden = visible !== 0;
                }
            }

            if (input) {
                input.addEventListener('input', applyFilter);
            }
            selects.forEach(function (select) {
                select.addEventListener('change', applyFilter);
            });
        });
    }

    function loadHls(callback, onError) {
        if (window.Hls) {
            callback();
            return;
        }
        var existing = document.querySelector('script[data-hls-loader]');
        if (existing) {
            existing.addEventListener('load', callback, { once: true });
            existing.addEventListener('error', onError, { once: true });
            return;
        }
        var script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.5.18/dist/hls.min.js';
        script.defer = true;
        script.setAttribute('data-hls-loader', 'true');
        script.addEventListener('load', callback, { once: true });
        script.addEventListener('error', onError, { once: true });
        document.head.appendChild(script);
    }

    function initPlayer(player) {
        var video = player.querySelector('video');
        var button = player.querySelector('.js-play-button');
        var message = player.querySelector('.player-message');
        var url = player.getAttribute('data-video-url');
        if (!video || !button || !url) {
            return;
        }

        function setMessage(text) {
            if (message) {
                message.textContent = text || '';
            }
        }

        function playVideo() {
            var promise = video.play();
            if (promise && promise.catch) {
                promise.catch(function () {
                    setMessage('请再次点击播放器开始播放。');
                });
            }
        }

        function useNativeSource() {
            video.src = url;
            video.controls = true;
            playVideo();
        }

        function useHlsSource() {
            if (!window.Hls || !window.Hls.isSupported()) {
                useNativeSource();
                return;
            }
            if (player._hls) {
                player._hls.destroy();
            }
            var hls = new window.Hls({
                enableWorker: true,
                lowLatencyMode: true,
                maxBufferLength: 30
            });
            player._hls = hls;
            hls.loadSource(url);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                video.controls = true;
                playVideo();
            });
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    setMessage('播放源正在重连，请稍后重试。');
                    hls.destroy();
                    player._hls = null;
                    useNativeSource();
                }
            });
        }

        button.addEventListener('click', function () {
            button.hidden = true;
            setMessage('正在加载高清播放源...');
            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                useNativeSource();
                return;
            }
            loadHls(function () {
                setMessage('');
                useHlsSource();
            }, function () {
                setMessage('播放器组件加载失败，正在尝试浏览器原生播放。');
                useNativeSource();
            });
        });
    }

    function initPlayers() {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    }

    ready(function () {
        initNavigation();
        initHero();
        initFilters();
        initPlayers();
    });
}());
