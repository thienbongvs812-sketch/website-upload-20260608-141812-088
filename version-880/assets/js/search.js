(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-input]');
    var results = document.querySelector('[data-search-results]');

    if (input) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function matched(item, q) {
        if (!q) {
            return true;
        }

        var haystack = [
            item.title,
            item.description,
            item.category,
            item.year,
            item.region,
            item.type,
            item.genre,
            (item.tags || []).join(' ')
        ].join(' ');

        return normalize(haystack).indexOf(normalize(q)) !== -1;
    }

    function card(item) {
        var tags = (item.tags || []).slice(0, 3).map(function (tag) {
            return '<span>' + escapeHtml(tag) + '</span>';
        }).join('');

        return '' +
            '<article class="movie-card">' +
                '<a class="poster-link" href="' + escapeHtml(item.url) + '">' +
                    '<img src="' + escapeHtml(item.cover) + '" alt="' + escapeHtml(item.title) + '" loading="lazy">' +
                    '<span class="poster-category">' + escapeHtml(item.category) + '</span>' +
                    '<span class="poster-duration">' + escapeHtml(item.duration) + '</span>' +
                    '<span class="poster-mask"><span>▶</span></span>' +
                '</a>' +
                '<div class="card-body">' +
                    '<h3><a href="' + escapeHtml(item.url) + '">' + escapeHtml(item.title) + '</a></h3>' +
                    '<p>' + escapeHtml(item.description) + '</p>' +
                    '<div class="tag-row">' + tags + '</div>' +
                    '<div class="card-meta"><span>👁 ' + Number(item.views).toLocaleString() + '</span><span>★ ' + escapeHtml(item.rating) + '</span></div>' +
                '</div>' +
            '</article>';
    }

    function escapeHtml(value) {
        return String(value == null ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    if (results && Array.isArray(window.MOVIE_SEARCH_DATA)) {
        var list = window.MOVIE_SEARCH_DATA.filter(function (item) {
            return matched(item, query);
        }).slice(0, 120);

        if (!list.length) {
            list = window.MOVIE_SEARCH_DATA.slice(0, 24);
        }

        results.innerHTML = list.map(card).join('');
    }
})();
