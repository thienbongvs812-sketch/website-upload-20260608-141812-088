(function () {
  function all(selector, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(selector));
  }

  function text(value) {
    return (value || "").toString().toLowerCase().trim();
  }

  function setupMenu() {
    var button = document.querySelector(".menu-toggle");
    var menu = document.querySelector(".mobile-menu");
    if (!button || !menu) {
      return;
    }
    button.addEventListener("click", function () {
      var open = menu.classList.toggle("is-open");
      button.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  function setupHero() {
    var hero = document.querySelector("[data-hero]");
    if (!hero) {
      return;
    }
    var slides = all(".hero-slide", hero);
    var dots = all("[data-hero-dot]", hero);
    var prev = hero.querySelector("[data-hero-prev]");
    var next = hero.querySelector("[data-hero-next]");
    var index = 0;
    var timer;

    function show(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach(function (slide, pos) {
        slide.classList.toggle("is-active", pos === index);
      });
      dots.forEach(function (dot, pos) {
        dot.classList.toggle("is-active", pos === index);
      });
    }

    function run() {
      clearInterval(timer);
      timer = setInterval(function () {
        show(index + 1);
      }, 5200);
    }

    dots.forEach(function (dot, pos) {
      dot.addEventListener("click", function () {
        show(pos);
        run();
      });
    });

    if (prev) {
      prev.addEventListener("click", function () {
        show(index - 1);
        run();
      });
    }

    if (next) {
      next.addEventListener("click", function () {
        show(index + 1);
        run();
      });
    }

    if (slides.length > 1) {
      run();
    }
  }

  function setupFilters() {
    var panel = document.querySelector(".filter-panel");
    var list = document.querySelector("[data-filter-list]");
    if (!panel || !list) {
      return;
    }
    var input = panel.querySelector(".filter-input");
    var buttons = all(".filter-button", panel);
    var cards = all(".movie-card", list);
    var activeValue = "all";

    function apply() {
      var query = text(input ? input.value : "");
      cards.forEach(function (card) {
        var haystack = text(card.getAttribute("data-search"));
        var type = text(card.getAttribute("data-type"));
        var year = text(card.getAttribute("data-year"));
        var channel = text(card.getAttribute("data-channel"));
        var active = text(activeValue);
        var matchQuery = !query || haystack.indexOf(query) !== -1;
        var matchButton = active === "all" || haystack.indexOf(active) !== -1 || type === active || year === active || channel === active;
        card.classList.toggle("is-hidden", !(matchQuery && matchButton));
      });
    }

    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (item) {
          item.classList.remove("is-active");
        });
        button.classList.add("is-active");
        activeValue = button.getAttribute("data-filter-value") || "all";
        apply();
      });
    });

    if (input) {
      var params = new URLSearchParams(window.location.search);
      var q = params.get("q");
      if (q) {
        input.value = q;
      }
      input.addEventListener("input", apply);
    }

    apply();
  }

  window.initPlayer = function (videoId, layerId, buttonId, url) {
    var video = document.getElementById(videoId);
    var layer = document.getElementById(layerId);
    var button = document.getElementById(buttonId);
    if (!video || !layer || !url) {
      return;
    }
    var ready = false;
    var waiting = false;
    var hls;

    function begin() {
      layer.classList.add("is-hidden");
      video.controls = true;
      var played = video.play();
      if (played && played.catch) {
        played.catch(function () {
          layer.classList.remove("is-hidden");
        });
      }
    }

    function prepare() {
      if (ready) {
        begin();
        return;
      }
      if (waiting) {
        return;
      }
      waiting = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        video.addEventListener("loadedmetadata", function () {
          ready = true;
          begin();
        }, { once: true });
        video.load();
        return;
      }
      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({ maxBufferLength: 30 });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          ready = true;
          begin();
        });
        hls.on(window.Hls.Events.ERROR, function (event, data) {
          if (data && data.fatal && hls) {
            hls.destroy();
            video.src = url;
            video.addEventListener("loadedmetadata", function () {
              ready = true;
              begin();
            }, { once: true });
            video.load();
          }
        });
        return;
      }
      video.src = url;
      video.addEventListener("loadedmetadata", function () {
        ready = true;
        begin();
      }, { once: true });
      video.load();
    }

    layer.addEventListener("click", prepare);
    if (button) {
      button.addEventListener("click", function (event) {
        event.stopPropagation();
        prepare();
      });
    }
    video.addEventListener("click", function () {
      if (!ready) {
        prepare();
      } else if (video.paused) {
        begin();
      } else {
        video.pause();
      }
    });
  };

  document.addEventListener("DOMContentLoaded", function () {
    setupMenu();
    setupHero();
    setupFilters();
  });
})();
