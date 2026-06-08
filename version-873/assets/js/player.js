(function () {
    function setStatus(element, text) {
        if (element) {
            element.textContent = text;
        }
    }

    function initPlayer(root) {
        var video = root.querySelector('[data-player-video]');
        var start = root.querySelector('[data-player-start]');
        var status = root.querySelector('[data-player-status]');
        if (!video || !start) {
            return;
        }

        var source = video.getAttribute('data-source');
        var hlsInstance = null;

        function attachSource() {
            if (!source) {
                setStatus(status, '未检测到播放源。');
                return Promise.reject(new Error('missing source'));
            }

            if (/\.m3u8(\?|#|$)/i.test(source)) {
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = source;
                    setStatus(status, '已使用浏览器原生 HLS 能力播放。');
                    return Promise.resolve();
                }

                if (window.Hls && window.Hls.isSupported()) {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: false,
                        backBufferLength: 90
                    });
                    hlsInstance.loadSource(source);
                    hlsInstance.attachMedia(video);
                    setStatus(status, 'HLS 播放器已初始化，正在加载视频。');
                    return Promise.resolve();
                }

                setStatus(status, '当前浏览器不支持 HLS，请更换浏览器或启用 HLS 支持。');
                return Promise.reject(new Error('hls not supported'));
            }

            video.src = source;
            setStatus(status, 'MP4 播放源已加载，正在播放。');
            return Promise.resolve();
        }

        start.addEventListener('click', function () {
            root.classList.add('is-playing');
            video.controls = true;
            attachSource().then(function () {
                var playPromise = video.play();
                if (playPromise && typeof playPromise.catch === 'function') {
                    playPromise.catch(function () {
                        setStatus(status, '播放器已加载，请再次点击视频区域开始播放。');
                    });
                }
            }).catch(function () {
                root.classList.remove('is-playing');
            });
        });
    }

    document.addEventListener('DOMContentLoaded', function () {
        Array.prototype.slice.call(document.querySelectorAll('[data-player]')).forEach(initPlayer);
    });
}());
