(function () {
    var menuButton = document.querySelector(".mobile-menu-button");
    var mobileNav = document.querySelector(".mobile-nav");

    if (menuButton && mobileNav) {
        menuButton.addEventListener("click", function () {
            var isOpen = mobileNav.hasAttribute("hidden") === false;
            if (isOpen) {
                mobileNav.setAttribute("hidden", "");
                menuButton.setAttribute("aria-expanded", "false");
            } else {
                mobileNav.removeAttribute("hidden");
                menuButton.setAttribute("aria-expanded", "true");
            }
        });
    }

    var topButton = document.querySelector(".back-to-top");
    if (topButton) {
        window.addEventListener("scroll", function () {
            if (window.scrollY > 420) {
                topButton.classList.add("is-visible");
            } else {
                topButton.classList.remove("is-visible");
            }
        });

        topButton.addEventListener("click", function () {
            window.scrollTo({ top: 0, behavior: "smooth" });
        });
    }

    var hero = document.querySelector("[data-hero]");
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(hero.querySelectorAll("[data-hero-dot]"));
        var prev = hero.querySelector("[data-hero-prev]");
        var next = hero.querySelector("[data-hero-next]");
        var current = 0;
        var timer = null;

        function showSlide(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, i) {
                slide.classList.toggle("is-active", i === current);
            });
            dots.forEach(function (dot, i) {
                dot.classList.toggle("is-active", i === current);
            });
        }

        function startTimer() {
            stopTimer();
            timer = window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        function stopTimer() {
            if (timer) {
                window.clearInterval(timer);
            }
        }

        if (prev) {
            prev.addEventListener("click", function () {
                showSlide(current - 1);
                startTimer();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                showSlide(current + 1);
                startTimer();
            });
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                showSlide(Number(dot.getAttribute("data-hero-dot")) || 0);
                startTimer();
            });
        });

        hero.addEventListener("mouseenter", stopTimer);
        hero.addEventListener("mouseleave", startTimer);
        startTimer();
    }

    function normalizeText(value) {
        return String(value || "").toLowerCase().trim();
    }

    function setupLocalFilter() {
        var list = document.querySelector("[data-filter-list]");
        var input = document.querySelector(".local-filter-input");
        var yearSelect = document.querySelector(".local-year-filter");
        var empty = document.querySelector("[data-empty-state]");

        if (!list || (!input && !yearSelect)) {
            return;
        }

        var cards = Array.prototype.slice.call(list.querySelectorAll(".movie-card"));

        function applyFilter() {
            var query = normalizeText(input ? input.value : "");
            var year = yearSelect ? yearSelect.value : "";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalizeText([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-region"),
                    card.getAttribute("data-type"),
                    card.getAttribute("data-year"),
                    card.getAttribute("data-genre"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var matchQuery = !query || haystack.indexOf(query) !== -1;
                var matchYear = !year || card.getAttribute("data-year") === year;
                var shouldShow = matchQuery && matchYear;
                card.hidden = !shouldShow;
                if (shouldShow) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.hidden = visible !== 0;
            }
        }

        if (input) {
            input.addEventListener("input", applyFilter);
        }

        if (yearSelect) {
            yearSelect.addEventListener("change", applyFilter);
        }
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    function cardTemplate(movie) {
        var tags = (movie.tags || []).slice(0, 2).map(function (tag) {
            return "<span>" + escapeHtml(tag) + "</span>";
        }).join("");

        return "" +
            "<article class=\"card movie-card\" data-title=\"" + escapeHtml(movie.title) + "\" data-region=\"" + escapeHtml(movie.region) + "\" data-type=\"" + escapeHtml(movie.type) + "\" data-year=\"" + escapeHtml(movie.year) + "\" data-genre=\"" + escapeHtml(movie.genre) + "\" data-tags=\"" + escapeHtml((movie.tags || []).join(" ")) + "\">" +
                "<a href=\"" + escapeHtml(movie.url) + "\" class=\"poster-wrap\" aria-label=\"观看 " + escapeHtml(movie.title) + "\">" +
                    "<img src=\"" + escapeHtml(movie.cover) + "\" alt=\"" + escapeHtml(movie.title) + "\" loading=\"lazy\">" +
                    "<span class=\"poster-shade\"></span>" +
                    "<span class=\"poster-play\">▶</span>" +
                    "<span class=\"rating-badge\">★ " + escapeHtml(movie.rating) + "</span>" +
                "</a>" +
                "<div class=\"card-body\">" +
                    "<h3><a href=\"" + escapeHtml(movie.url) + "\">" + escapeHtml(movie.title) + "</a></h3>" +
                    "<p>" + escapeHtml(movie.oneLine || "") + "</p>" +
                    "<div class=\"meta-line\"><span>" + escapeHtml(movie.year) + "</span><span>" + escapeHtml(movie.region) + "</span></div>" +
                    "<div class=\"tag-line\">" + tags + "</div>" +
                "</div>" +
            "</article>";
    }

    function setupSearchPage() {
        var form = document.querySelector("[data-search-form]");
        var results = document.querySelector("[data-search-results]");
        var summary = document.querySelector("[data-search-summary]");

        if (!form || !results || !window.SEARCH_MOVIES) {
            return;
        }

        var input = form.querySelector("input[name='q']");
        var params = new URLSearchParams(window.location.search);
        var initialQuery = params.get("q") || "";

        if (input) {
            input.value = initialQuery;
        }

        function render() {
            var query = normalizeText(input ? input.value : "");
            var list = window.SEARCH_MOVIES.filter(function (movie) {
                if (!query) {
                    return true;
                }
                var haystack = normalizeText([
                    movie.title,
                    movie.region,
                    movie.type,
                    movie.year,
                    movie.genre,
                    (movie.tags || []).join(" "),
                    movie.oneLine
                ].join(" "));
                return haystack.indexOf(query) !== -1;
            }).slice(0, 120);

            results.innerHTML = list.map(cardTemplate).join("");

            if (summary) {
                summary.textContent = query ? "搜索结果" : "热门影片";
            }
        }

        form.addEventListener("submit", function (event) {
            event.preventDefault();
            render();
        });

        if (input) {
            input.addEventListener("input", render);
        }

        render();
    }

    setupLocalFilter();
    setupSearchPage();
})();

function initializeMoviePlayer(streamUrl) {
    var video = document.getElementById("moviePlayer");
    var button = document.getElementById("moviePlayButton");
    var started = false;
    var hlsInstance = null;

    if (!video || !button || !streamUrl) {
        return;
    }

    function hideButton() {
        button.classList.add("is-hidden");
    }

    function beginPlayback() {
        hideButton();

        if (!started) {
            started = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = streamUrl;
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hlsInstance.loadSource(streamUrl);
                hlsInstance.attachMedia(video);
                hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play().catch(function () {});
                });
                return;
            }

            video.src = streamUrl;
        }

        video.play().catch(function () {});
    }

    button.addEventListener("click", beginPlayback);
    video.addEventListener("click", function () {
        if (!started || video.paused) {
            beginPlayback();
        }
    });
    video.addEventListener("play", hideButton);
    window.addEventListener("pagehide", function () {
        if (hlsInstance) {
            hlsInstance.destroy();
        }
    });
}
