document.addEventListener('DOMContentLoaded', function () {
  var box = document.querySelector('[data-player]');
  if (!box) {
    return;
  }
  var video = box.querySelector('video');
  var trigger = box.querySelector('[data-play]');
  if (!video || !trigger) {
    return;
  }
  var stream = trigger.getAttribute('data-stream');
  var hls = null;
  var attached = false;

  function attachStream() {
    if (attached || !stream) {
      return Promise.resolve();
    }
    attached = true;
    if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = stream;
      return Promise.resolve();
    }
    if (window.Hls && window.Hls.isSupported()) {
      return new Promise(function (resolve) {
        hls = new window.Hls({
          maxBufferLength: 40,
          enableWorker: true
        });
        hls.loadSource(stream);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          resolve();
        });
        window.setTimeout(resolve, 1300);
      });
    }
    video.src = stream;
    return Promise.resolve();
  }

  function beginPlay() {
    attachStream().then(function () {
      trigger.classList.add('is-hidden');
      video.controls = true;
      var playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {});
      }
    });
  }

  trigger.addEventListener('click', beginPlay);
  video.addEventListener('click', function () {
    if (video.paused) {
      beginPlay();
    }
  });
  window.addEventListener('beforeunload', function () {
    if (hls) {
      hls.destroy();
    }
  });
});
