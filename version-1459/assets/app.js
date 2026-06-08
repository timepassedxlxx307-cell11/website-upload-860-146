(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
            menuButton.setAttribute('aria-expanded', mobilePanel.classList.contains('is-open') ? 'true' : 'false');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            if (!query) {
                return;
            }
            var target = form.getAttribute('action') || 'search.html';
            window.location.href = target + '?q=' + encodeURIComponent(query);
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var activeIndex = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }
        activeIndex = (index + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === activeIndex);
        });
        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === activeIndex);
        });
    }

    if (slides.length) {
        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
            });
        });
        timer = window.setInterval(function () {
            showSlide(activeIndex + 1);
        }, 5200);
        var hero = document.querySelector('[data-hero]');
        if (hero) {
            hero.addEventListener('mouseenter', function () {
                window.clearInterval(timer);
            });
            hero.addEventListener('mouseleave', function () {
                timer = window.setInterval(function () {
                    showSlide(activeIndex + 1);
                }, 5200);
            });
        }
        showSlide(0);
    }

    document.querySelectorAll('[data-filter-input]').forEach(function (input) {
        var targetSelector = input.getAttribute('data-filter-input');
        var cards = Array.prototype.slice.call(document.querySelectorAll(targetSelector));
        input.addEventListener('input', function () {
            var query = input.value.trim().toLowerCase();
            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') + ' ' + card.getAttribute('data-meta')).toLowerCase();
                card.style.display = haystack.indexOf(query) >= 0 ? '' : 'none';
            });
        });
    });
})();
