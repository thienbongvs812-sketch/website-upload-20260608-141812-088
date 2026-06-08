(function () {
    var navButton = document.querySelector('[data-nav-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (navButton && mobileNav) {
        navButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('img').forEach(function (image) {
        image.addEventListener('error', function () {
            image.removeAttribute('src');
        });
    });

    var slides = Array.prototype.slice.call(document.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(document.querySelectorAll('[data-hero-dot]'));
    var prev = document.querySelector('[data-hero-prev]');
    var next = document.querySelector('[data-hero-next]');
    var active = 0;
    var timer = null;

    function showSlide(index) {
        if (!slides.length) {
            return;
        }

        active = (index + slides.length) % slides.length;

        slides.forEach(function (slide, slideIndex) {
            slide.classList.toggle('is-active', slideIndex === active);
        });

        dots.forEach(function (dot, dotIndex) {
            dot.classList.toggle('is-active', dotIndex === active);
        });
    }

    function startSlider() {
        if (timer || slides.length <= 1) {
            return;
        }

        timer = window.setInterval(function () {
            showSlide(active + 1);
        }, 5000);
    }

    function resetSlider() {
        if (timer) {
            window.clearInterval(timer);
            timer = null;
        }
        startSlider();
    }

    if (slides.length) {
        showSlide(0);
        startSlider();
    }

    if (prev) {
        prev.addEventListener('click', function () {
            showSlide(active - 1);
            resetSlider();
        });
    }

    if (next) {
        next.addEventListener('click', function () {
            showSlide(active + 1);
            resetSlider();
        });
    }

    dots.forEach(function (dot, dotIndex) {
        dot.addEventListener('click', function () {
            showSlide(dotIndex);
            resetSlider();
        });
    });

    var filterPanels = document.querySelectorAll('[data-filter-panel]');

    filterPanels.forEach(function (panel) {
        var scope = panel.getAttribute('data-filter-panel') || 'body';
        var cards = Array.prototype.slice.call(document.querySelectorAll(scope + ' [data-title]'));
        var keyword = panel.querySelector('[data-filter-keyword]');
        var year = panel.querySelector('[data-filter-year]');
        var region = panel.querySelector('[data-filter-region]');
        var type = panel.querySelector('[data-filter-type]');

        function normalize(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function applyFilters() {
            var q = normalize(keyword && keyword.value);
            var y = normalize(year && year.value);
            var r = normalize(region && region.value);
            var t = normalize(type && type.value);

            cards.forEach(function (card) {
                var title = normalize(card.getAttribute('data-title'));
                var cardYear = normalize(card.getAttribute('data-year'));
                var cardRegion = normalize(card.getAttribute('data-region'));
                var cardType = normalize(card.getAttribute('data-type'));
                var text = normalize(card.textContent);
                var matched = true;

                if (q && title.indexOf(q) === -1 && text.indexOf(q) === -1) {
                    matched = false;
                }

                if (y && cardYear !== y) {
                    matched = false;
                }

                if (r && cardRegion !== r) {
                    matched = false;
                }

                if (t && cardType !== t) {
                    matched = false;
                }

                card.classList.toggle('hidden-card', !matched);
            });
        }

        [keyword, year, region, type].forEach(function (control) {
            if (control) {
                control.addEventListener('input', applyFilters);
                control.addEventListener('change', applyFilters);
            }
        });
    });

    var video = document.querySelector('[data-play]');

    if (video) {
        var source = video.getAttribute('data-play');

        if (source && window.Hls && window.Hls.isSupported()) {
            var stream = new window.Hls();
            stream.loadSource(source);
            stream.attachMedia(video);
        } else if (source && video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
        } else if (source) {
            video.src = source;
        }
    }
})();
