(function () {
    var players = document.querySelectorAll('[data-player]');

    players.forEach(function (player) {
        var video = player.querySelector('video');
        var button = player.querySelector('[data-play-button]');
        var source = video ? video.getAttribute('data-src') : '';
        var ready = false;
        var hls = null;

        function prepare() {
            if (!video || !source || ready) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    lowLatencyMode: true,
                    backBufferLength: 90
                });
                hls.loadSource(source);
                hls.attachMedia(video);
            } else {
                video.src = source;
            }

            video.controls = true;
            ready = true;
        }

        function hideButton() {
            if (button) {
                button.classList.add('is-hidden');
            }
        }

        function start() {
            prepare();
            hideButton();
            if (!video) {
                return;
            }
            var promise = video.play();
            if (promise && typeof promise.catch === 'function') {
                promise.catch(function () {
                    video.muted = true;
                    video.play().catch(function () {});
                });
            }
        }

        if (button) {
            button.addEventListener('click', start);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!ready || video.paused) {
                    start();
                }
            });
            video.addEventListener('play', hideButton);
        }

        window.addEventListener('beforeunload', function () {
            if (hls && typeof hls.destroy === 'function') {
                hls.destroy();
            }
        });
    });
})();
