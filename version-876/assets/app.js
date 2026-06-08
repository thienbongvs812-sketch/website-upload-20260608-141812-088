(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var button = document.querySelector("[data-menu-toggle]");
        var nav = document.querySelector("[data-nav-links]");
        if (!button || !nav) {
            return;
        }
        button.addEventListener("click", function () {
            nav.classList.toggle("is-open");
        });
    }

    function initHero() {
        var root = document.querySelector("[data-hero]");
        if (!root) {
            return;
        }
        var slides = Array.prototype.slice.call(root.querySelectorAll(".hero-slide"));
        var dots = Array.prototype.slice.call(root.querySelectorAll(".hero-dot"));
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

        function play() {
            timer = window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            play();
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener("click", function () {
                show(index);
                restart();
            });
        });
        show(0);
        play();
    }

    function initFilters() {
        var roots = Array.prototype.slice.call(document.querySelectorAll("[data-filter-root]"));
        roots.forEach(function (root) {
            var input = root.querySelector("[data-filter-input]");
            var year = root.querySelector("[data-filter-year]");
            var type = root.querySelector("[data-filter-type]");
            var region = root.querySelector("[data-filter-region]");
            var items = Array.prototype.slice.call(root.querySelectorAll("[data-filter-item]"));

            function val(element) {
                return element ? String(element.value || "").trim().toLowerCase() : "";
            }

            function apply() {
                var keyword = val(input);
                var yearValue = val(year);
                var typeValue = val(type);
                var regionValue = val(region);
                items.forEach(function (item) {
                    var text = String(item.getAttribute("data-search") || "").toLowerCase();
                    var itemYear = String(item.getAttribute("data-year") || "").toLowerCase();
                    var itemType = String(item.getAttribute("data-type") || "").toLowerCase();
                    var itemRegion = String(item.getAttribute("data-region") || "").toLowerCase();
                    var ok = true;
                    if (keyword && text.indexOf(keyword) === -1) {
                        ok = false;
                    }
                    if (yearValue && itemYear !== yearValue) {
                        ok = false;
                    }
                    if (typeValue && itemType !== typeValue) {
                        ok = false;
                    }
                    if (regionValue && itemRegion !== regionValue) {
                        ok = false;
                    }
                    item.classList.toggle("hidden-by-filter", !ok);
                });
            }

            [input, year, type, region].forEach(function (element) {
                if (!element) {
                    return;
                }
                element.addEventListener("input", apply);
                element.addEventListener("change", apply);
            });
            apply();
        });
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var video = player.querySelector("video");
            var cover = player.querySelector(".player-cover");
            var button = player.querySelector(".play-button");
            if (!video) {
                return;
            }
            var streamUrl = video.getAttribute("data-stream") || "";
            var hlsInstance = null;

            function attach() {
                if (!streamUrl || player.getAttribute("data-ready") === "1") {
                    return;
                }
                player.setAttribute("data-ready", "1");
                if (video.canPlayType("application/vnd.apple.mpegurl")) {
                    video.src = streamUrl;
                    return;
                }
                if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(streamUrl);
                    hlsInstance.attachMedia(video);
                    return;
                }
                video.src = streamUrl;
            }

            function start() {
                attach();
                player.classList.add("is-playing");
                var playResult = video.play();
                if (playResult && typeof playResult.catch === "function") {
                    playResult.catch(function () {});
                }
            }

            if (cover) {
                cover.addEventListener("click", start);
            }
            if (button) {
                button.addEventListener("click", start);
            }
            video.addEventListener("click", function () {
                if (video.paused) {
                    start();
                }
            });
            window.addEventListener("beforeunload", function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        });
    }

    ready(function () {
        initMenu();
        initHero();
        initFilters();
        initPlayers();
    });
})();
