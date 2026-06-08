(function () {
    function playBox(box) {
        var video = box.querySelector('video');
        var button = box.querySelector('[data-play-trigger]');
        var url = box.getAttribute('data-url');

        if (!video || !url) {
            return;
        }

        function begin() {
            if (button) {
                button.classList.add('is-hidden');
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                if (!video.src) {
                    video.src = url;
                }
                video.play().catch(function () {});
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                if (!box.__hlsReady) {
                    var hls = new window.Hls();
                    hls.loadSource(url);
                    hls.attachMedia(video);
                    box.__hlsReady = true;
                    box.__hls = hls;
                    hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
                        video.play().catch(function () {});
                    });
                } else {
                    video.play().catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', begin);
        }

        video.addEventListener('click', function () {
            if (video.paused) {
                begin();
            }
        });
    }

    Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(playBox);
})();
