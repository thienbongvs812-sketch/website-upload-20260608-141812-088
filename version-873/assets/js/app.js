(function () {
    function qs(selector, root) {
        return (root || document).querySelector(selector);
    }

    function qsa(selector, root) {
        return Array.prototype.slice.call((root || document).querySelectorAll(selector));
    }

    function normalize(text) {
        return String(text || '').toLowerCase().trim();
    }

    function initMobileMenu() {
        var button = qs('[data-mobile-toggle]');
        var menu = qs('[data-mobile-menu]');
        if (!button || !menu) {
            return;
        }
        button.addEventListener('click', function () {
            menu.classList.toggle('is-open');
        });
    }

    function initHeroCarousel() {
        var root = qs('[data-hero-carousel]');
        if (!root) {
            return;
        }
        var slides = qsa('.hero-slide', root);
        var dots = qsa('[data-hero-dot]', root);
        var prev = qs('[data-hero-prev]', root);
        var next = qs('[data-hero-next]', root);
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === index);
            });
        }

        function start() {
            stop();
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5000);
        }

        function stop() {
            if (timer) {
                window.clearInterval(timer);
                timer = null;
            }
        }

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                show(Number(dot.getAttribute('data-hero-dot')) || 0);
                start();
            });
        });

        if (prev) {
            prev.addEventListener('click', function () {
                show(index - 1);
                start();
            });
        }

        if (next) {
            next.addEventListener('click', function () {
                show(index + 1);
                start();
            });
        }

        root.addEventListener('mouseenter', stop);
        root.addEventListener('mouseleave', start);
        start();
    }

    function initBrokenImageFallback() {
        qsa('img').forEach(function (image) {
            image.addEventListener('error', function () {
                image.style.display = 'none';
                var holder = image.closest('.poster-wrap, .hero-visual, .rank-thumb, .overview-image');
                if (holder) {
                    holder.classList.add('image-missing');
                }
            }, { once: true });
        });
    }

    function initFilters() {
        qsa('[data-filter-root]').forEach(function (root) {
            var input = qs('[data-search-input]', root);
            var yearFilter = qs('[data-year-filter]', root);
            var categoryFilter = qs('[data-category-filter]', root);
            var sortSelect = qs('[data-sort-select]', root);
            var grid = qs('[data-card-grid]', root);
            var count = qs('[data-result-count]', root);
            var empty = qs('[data-empty-tip]', root);
            var cards = qsa('[data-movie-card]', root);

            function matchYear(card, selected) {
                var year = Number(card.getAttribute('data-year')) || 0;
                if (!selected || selected === '全部年份') {
                    return true;
                }
                if (selected === '2020以前') {
                    return year > 0 && year < 2020;
                }
                return String(year) === selected;
            }

            function applySort(visibleCards) {
                if (!grid || !sortSelect) {
                    return;
                }
                var mode = sortSelect.value;
                visibleCards.sort(function (a, b) {
                    var ay = Number(a.getAttribute('data-year')) || 0;
                    var by = Number(b.getAttribute('data-year')) || 0;
                    var at = a.getAttribute('data-title') || '';
                    var bt = b.getAttribute('data-title') || '';
                    if (mode === 'year-asc') {
                        return ay - by || at.localeCompare(bt, 'zh-Hans-CN');
                    }
                    if (mode === 'title-asc') {
                        return at.localeCompare(bt, 'zh-Hans-CN');
                    }
                    return by - ay || at.localeCompare(bt, 'zh-Hans-CN');
                });
                visibleCards.forEach(function (card) {
                    grid.appendChild(card);
                });
            }

            function apply() {
                var keyword = normalize(input && input.value);
                var selectedYear = yearFilter ? yearFilter.value : '全部年份';
                var selectedCategory = categoryFilter ? categoryFilter.value : '全部分类';
                var visibleCards = [];

                cards.forEach(function (card) {
                    var haystack = normalize([
                        card.getAttribute('data-title'),
                        card.getAttribute('data-region'),
                        card.getAttribute('data-type'),
                        card.getAttribute('data-genre'),
                        card.getAttribute('data-category')
                    ].join(' '));
                    var okKeyword = !keyword || haystack.indexOf(keyword) !== -1;
                    var okYear = matchYear(card, selectedYear);
                    var okCategory = selectedCategory === '全部分类' || card.getAttribute('data-category') === selectedCategory;
                    var visible = okKeyword && okYear && okCategory;
                    card.classList.toggle('is-hidden', !visible);
                    if (visible) {
                        visibleCards.push(card);
                    }
                });

                applySort(visibleCards);

                if (count) {
                    count.textContent = '共 ' + visibleCards.length + ' 部';
                }
                if (empty) {
                    empty.classList.toggle('is-visible', visibleCards.length === 0);
                }
            }

            [input, yearFilter, categoryFilter, sortSelect].forEach(function (control) {
                if (control) {
                    control.addEventListener('input', apply);
                    control.addEventListener('change', apply);
                }
            });

            apply();
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        initMobileMenu();
        initHeroCarousel();
        initBrokenImageFallback();
        initFilters();
    });
}());
