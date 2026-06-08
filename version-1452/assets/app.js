(function () {
    var menuButton = document.querySelector(".menu-toggle");
    var mobilePanel = document.querySelector(".mobile-panel");

    if (menuButton && mobilePanel) {
        menuButton.addEventListener("click", function () {
            mobilePanel.classList.toggle("is-open");
            menuButton.textContent = mobilePanel.classList.contains("is-open") ? "×" : "☰";
        });
    }

    var hero = document.querySelector("[data-hero]");

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        var setSlide = function (nextIndex) {
            if (!slides.length) {
                return;
            }

            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, current) {
                slide.classList.toggle("is-active", current === index);
            });
            dots.forEach(function (dot, current) {
                dot.classList.toggle("is-active", current === index);
            });
        };

        var start = function () {
            timer = window.setInterval(function () {
                setSlide(index + 1);
            }, 5000);
        };

        var restart = function () {
            if (timer) {
                window.clearInterval(timer);
            }
            start();
        };

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                setSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (prev) {
            prev.addEventListener("click", function () {
                setSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                setSlide(index + 1);
                restart();
            });
        }

        start();
    }

    var yearTabs = Array.prototype.slice.call(document.querySelectorAll("[data-year-tab]"));
    var yearPanels = Array.prototype.slice.call(document.querySelectorAll("[data-year-panel]"));

    yearTabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            var year = tab.getAttribute("data-year-tab");
            yearTabs.forEach(function (item) {
                item.classList.toggle("is-active", item === tab);
            });
            yearPanels.forEach(function (panel) {
                panel.classList.toggle("is-active", panel.getAttribute("data-year-panel") === year);
            });
        });
    });

    var filterInput = document.getElementById("movieFilterInput");
    var typeFilter = document.getElementById("typeFilter");
    var yearFilter = document.getElementById("yearFilter");
    var cards = Array.prototype.slice.call(document.querySelectorAll("[data-filter-area] .movie-card"));

    if (filterInput && cards.length) {
        var params = new URLSearchParams(window.location.search);
        var query = params.get("q") || "";

        if (query) {
            filterInput.value = query;
        }

        var normalize = function (value) {
            return String(value || "").trim().toLowerCase();
        };

        var applyFilters = function () {
            var text = normalize(filterInput.value);
            var type = normalize(typeFilter ? typeFilter.value : "");
            var year = normalize(yearFilter ? yearFilter.value : "");

            cards.forEach(function (card) {
                var search = normalize(card.getAttribute("data-search"));
                var cardType = normalize(card.getAttribute("data-type"));
                var cardYear = normalize(card.getAttribute("data-year"));
                var matchedText = !text || search.indexOf(text) !== -1;
                var matchedType = !type || cardType === type;
                var matchedYear = !year || cardYear === year;
                card.classList.toggle("is-hidden", !(matchedText && matchedType && matchedYear));
            });
        };

        filterInput.addEventListener("input", applyFilters);

        if (typeFilter) {
            typeFilter.addEventListener("change", applyFilters);
        }

        if (yearFilter) {
            yearFilter.addEventListener("change", applyFilters);
        }

        applyFilters();
    }
})();

function setupPlayer(mediaUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("playButton");
    var loaded = false;
    var hlsInstance = null;

    if (!video || !button || !mediaUrl) {
        return;
    }

    var loadMedia = function () {
        if (loaded) {
            return;
        }

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = mediaUrl;
        } else if (window.Hls && window.Hls.isSupported()) {
            hlsInstance = new Hls({
                enableWorker: true,
                lowLatencyMode: true
            });
            hlsInstance.loadSource(mediaUrl);
            hlsInstance.attachMedia(video);
        } else {
            video.src = mediaUrl;
        }

        loaded = true;
    };

    var playVideo = function () {
        loadMedia();
        button.classList.add("is-hidden");
        var playPromise = video.play();

        if (playPromise && typeof playPromise.catch === "function") {
            playPromise.catch(function () {
                button.classList.remove("is-hidden");
            });
        }
    };

    button.addEventListener("click", playVideo);
    video.addEventListener("pointerdown", function () {
        if (!loaded) {
            playVideo();
        }
    }, { once: true });
    video.addEventListener("play", function () {
        button.classList.add("is-hidden");
    });
    video.addEventListener("ended", function () {
        button.classList.remove("is-hidden");
    });

    window.addEventListener("beforeunload", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
