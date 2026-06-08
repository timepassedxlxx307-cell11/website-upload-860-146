(function () {
    "use strict";

    function ready(callback) {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", callback);
        } else {
            callback();
        }
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function setupMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        var links = document.querySelector("[data-nav-links]");
        if (!toggle || !links) {
            return;
        }
        toggle.addEventListener("click", function () {
            links.classList.toggle("is-open");
        });
    }

    function setupBackTop() {
        var button = document.querySelector("[data-back-top]");
        if (!button) {
            return;
        }
        button.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    function setupHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(root.querySelectorAll("[data-hero-dot]"));
        var prev = root.querySelector("[data-hero-prev]");
        var next = root.querySelector("[data-hero-next]");
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
            }, 5600);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
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
        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                start();
            });
        });
        root.addEventListener("mouseenter", stop);
        root.addEventListener("mouseleave", start);
        show(0);
        start();
    }

    function setupFilters() {
        var panel = document.querySelector("[data-filter-panel]");
        var list = document.querySelector("[data-card-list]");
        if (!panel || !list) {
            return;
        }
        var input = panel.querySelector("[data-search-input]");
        var year = panel.querySelector("[data-filter-year]");
        var type = panel.querySelector("[data-filter-type]");
        var region = panel.querySelector("[data-filter-region]");
        var cards = Array.prototype.slice.call(list.querySelectorAll("[data-card]"));

        function matchesYear(cardYear, selected) {
            if (!selected) {
                return true;
            }
            if (selected === "2020") {
                var numeric = parseInt(cardYear, 10);
                return !numeric || numeric <= 2020;
            }
            return cardYear === selected;
        }

        function applyFilters() {
            var keyword = normalize(input ? input.value : "");
            var selectedYear = year ? year.value : "";
            var selectedType = type ? type.value : "";
            var selectedRegion = region ? region.value : "";

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute("data-title"));
                var genre = normalize(card.getAttribute("data-genre"));
                var tags = normalize(card.getAttribute("data-tags"));
                var cardYear = card.getAttribute("data-year") || "";
                var cardType = card.getAttribute("data-type") || "";
                var cardRegion = card.getAttribute("data-region") || "";
                var haystack = [title, genre, tags, normalize(cardType), normalize(cardRegion), cardYear].join(" ");
                var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                var okYear = matchesYear(cardYear, selectedYear);
                var okType = !selectedType || cardType.indexOf(selectedType) !== -1;
                var okRegion = !selectedRegion || cardRegion.indexOf(selectedRegion) !== -1;
                card.classList.toggle("is-hidden", !(okKeyword && okYear && okType && okRegion));
            });
        }

        [input, year, type, region].forEach(function (control) {
            if (!control) {
                return;
            }
            control.addEventListener("input", applyFilters);
            control.addEventListener("change", applyFilters);
        });
    }

    function setupPlayer(streamUrl) {
        ready(function () {
            var video = document.querySelector("[data-player-video]");
            var cover = document.querySelector("[data-player-start]");
            if (!video || !cover || !streamUrl) {
                return;
            }
            var started = false;
            var hlsInstance = null;

            function playVideo() {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === "function") {
                    playPromise.catch(function () {});
                }
            }

            function attachStream() {
                if (started) {
                    playVideo();
                    return;
                }
                started = true;
                cover.classList.add("is-hidden");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    playVideo();
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({ enableWorker: true });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    hlsInstance.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        playVideo();
                    });
                    return;
                }
                video.src = streamUrl;
                playVideo();
            }

            cover.addEventListener("click", attachStream);
            video.addEventListener("click", function () {
                if (!started || video.paused) {
                    attachStream();
                }
            });
            window.addEventListener("pagehide", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                    hlsInstance = null;
                }
            });
        });
    }

    ready(function () {
        setupMenu();
        setupBackTop();
        setupHero();
        setupFilters();
    });

    window.MovieSitePlayer = setupPlayer;
})();
