(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobilePanel = document.querySelector('[data-mobile-panel]');

    if (menuButton && mobilePanel) {
        menuButton.addEventListener('click', function () {
            mobilePanel.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('.hero-carousel');
    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var prev = hero.querySelector('[data-hero-prev]');
        var next = hero.querySelector('[data-hero-next]');
        var index = 0;
        var timer = null;

        function showSlide(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                showSlide(index + 1);
            }, 5200);
        }

        if (prev) {
            prev.addEventListener('click', function () {
                showSlide(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                showSlide(index + 1);
                restart();
            });
        }

        dots.forEach(function (dot, dotIndex) {
            dot.addEventListener('click', function () {
                showSlide(dotIndex);
                restart();
            });
        });

        showSlide(0);
        restart();
    }

    var searchPage = document.querySelector('[data-search-page]');
    if (searchPage) {
        var form = searchPage.querySelector('[data-search-form]');
        var keyword = searchPage.querySelector('[data-search-keyword]');
        var region = searchPage.querySelector('[data-search-region]');
        var type = searchPage.querySelector('[data-search-type]');
        var year = searchPage.querySelector('[data-search-year]');
        var cards = Array.prototype.slice.call(searchPage.querySelectorAll('[data-movie-card]'));
        var empty = searchPage.querySelector('[data-search-empty]');
        var params = new URL(window.location.href).searchParams;
        var initial = params.get('q') || '';

        if (keyword) {
            keyword.value = initial;
        }

        function norm(value) {
            return (value || '').toString().trim().toLowerCase();
        }

        function runFilter() {
            var q = norm(keyword && keyword.value);
            var selectedRegion = norm(region && region.value);
            var selectedType = norm(type && type.value);
            var selectedYear = norm(year && year.value);
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = norm(card.getAttribute('data-search'));
                var cardRegion = norm(card.getAttribute('data-region'));
                var cardType = norm(card.getAttribute('data-type'));
                var cardYear = norm(card.getAttribute('data-year'));
                var matched = true;

                if (q && haystack.indexOf(q) === -1) {
                    matched = false;
                }
                if (selectedRegion && cardRegion !== selectedRegion) {
                    matched = false;
                }
                if (selectedType && cardType !== selectedType) {
                    matched = false;
                }
                if (selectedYear && cardYear !== selectedYear) {
                    matched = false;
                }

                card.style.display = matched ? '' : 'none';
                if (matched) {
                    visible += 1;
                }
            });

            if (empty) {
                empty.classList.toggle('is-visible', visible === 0);
            }
        }

        if (form) {
            form.addEventListener('submit', function (event) {
                event.preventDefault();
                runFilter();
            });
        }

        [keyword, region, type, year].forEach(function (control) {
            if (control) {
                control.addEventListener('input', runFilter);
                control.addEventListener('change', runFilter);
            }
        });

        runFilter();
    }
})();
