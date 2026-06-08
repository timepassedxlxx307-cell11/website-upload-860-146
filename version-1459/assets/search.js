(function () {
    var params = new URLSearchParams(window.location.search);
    var query = (params.get('q') || '').trim();
    var input = document.querySelector('[data-search-page-input]');
    var container = document.querySelector('[data-search-results]');
    var title = document.querySelector('[data-search-title]');

    if (input) {
        input.value = query;
    }

    function normalize(value) {
        return String(value || '').toLowerCase();
    }

    function cardTemplate(item) {
        return [
            '<a class="movie-card" href="' + item.url + '" data-title="' + item.title.replace(/"/g, '&quot;') + '" data-meta="' + item.meta.replace(/"/g, '&quot;') + '">',
            '    <div class="poster-wrap">',
            '        <img src="' + item.cover + '" alt="' + item.title.replace(/"/g, '&quot;') + '">',
            '        <span class="badge poster-badge">' + item.category + '</span>',
            '        <span class="duration">' + item.duration + '</span>',
            '        <span class="poster-shade"></span>',
            '        <span class="play-hover"><span class="play-circle">▶</span></span>',
            '    </div>',
            '    <div class="card-body">',
            '        <h3 class="card-title">' + item.title + '</h3>',
            '        <p class="card-desc">' + item.desc + '</p>',
            '        <div class="card-meta"><span>' + item.year + '</span><span>' + item.region + '</span><span>' + item.type + '</span></div>',
            '    </div>',
            '</a>'
        ].join('\n');
    }

    function render() {
        if (!container || !window.siteSearchData) {
            return;
        }

        var words = normalize(query).split(/\s+/).filter(Boolean);
        var results = window.siteSearchData.filter(function (item) {
            if (!words.length) {
                return true;
            }
            var haystack = normalize(item.title + ' ' + item.meta + ' ' + item.desc);
            return words.every(function (word) {
                return haystack.indexOf(word) >= 0;
            });
        }).slice(0, 96);

        if (title) {
            title.textContent = query ? '搜索：' + query : '搜索影视作品';
        }

        if (!results.length) {
            container.innerHTML = '<div class="empty-state">未找到匹配内容，请尝试其他片名、类型、年份或地区。</div>';
            return;
        }

        container.innerHTML = results.map(cardTemplate).join('\n');
    }

    render();
})();
