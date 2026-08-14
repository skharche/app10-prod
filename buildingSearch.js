function InitiateCityGridBuildingAutoSuggest(options) {
    options = options || {};

    const inputId = options.inputId || 'buildingSearchInput';
    const listId = options.listId || 'buildingSuggestList';
    const wrapperSelector = options.wrapperSelector || '.buildingAutosuggestWrapper';
    const onSelect = typeof options.onSelect === 'function' ? options.onSelect : onBuildingSelected;

    const input = document.getElementById(inputId);
    const list = document.getElementById(listId);

    if (!input || !list) {
        console.warn('InitiateCityGridBuildingAutoSuggest: input or list element not found', inputId, listId);
        return null;
    }

    // If this element was already initialized, tear down old listeners first
    if (input._autoSuggestCleanup) {
        input._autoSuggestCleanup();
    }

    // ---- instance-scoped state (no longer global) ----
    let currentResults = [];
    let activeIndex = -1;
    let debounceTimer = null;

    function handleInput() {
        const term = input.value.trim();

        clearTimeout(debounceTimer);

        if (term.length === 0) {
            hideList();
            return;
        }

        debounceTimer = setTimeout(() => {
            fetchBuildingSuggestions(term);
        }, 250); // debounce delay
    }

    function handleKeydown(e) {
        if (list.style.display === 'none' || currentResults.length === 0) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = (activeIndex + 1) % currentResults.length;
            highlightActive();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = (activeIndex - 1 + currentResults.length) % currentResults.length;
            highlightActive();
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (activeIndex >= 0 && currentResults[activeIndex]) {
                selectBuilding(currentResults[activeIndex]);
            }
        } else if (e.key === 'Escape') {
            hideList();
        }
    }

    function handleDocumentClick(e) {
        if (!e.target.closest(wrapperSelector)) {
            hideList();
        }
    }

    function fetchBuildingSuggestions(term) {
        const formData = new FormData();
        formData.append('action', 'searchBuildings');
        formData.append('term', term);

        fetch('searchBuildings.php', {
            method: 'POST',
            body: formData
        })
            .then(response => response.json())
            .then(data => {
                currentResults = Array.isArray(data) ? data : [];
                renderList();
            })
            .catch(err => {
                console.error('Building search error:', err);
                hideList();
            });
    }

    function renderList() {
        list.innerHTML = '';
        activeIndex = -1;

        if (currentResults.length === 0) {
            hideList();
            return;
        }

        currentResults.forEach((item, idx) => {
			console.log(item);
            const li = document.createElement('li');
            li.dataset.index = idx;
			/*
            li.innerHTML =
                '<span>' + escapeHtml(item.address) + '</span>' +
                '<span class="suggest-sub">'+escapeHtml(item.ssubname || '')+'(' + escapeHtml(item.scityname || '') + ')</span>';
				*/
			li.innerHTML =
                '<span>' + escapeHtml(item.sbuildingname) + '</span>' +
                '<span class="suggest-sub">' + escapeHtml(item.address || '') + ' (' + escapeHtml(item.scityname || '') + ')</span>';

            li.addEventListener('mouseenter', () => {
                activeIndex = idx;
                highlightActive();
            });

            li.addEventListener('click', () => {
                selectBuilding(item);
            });

            list.appendChild(li);
        });

        list.style.display = 'block';
    }

    function highlightActive() {
        const items = list.querySelectorAll('li');
        items.forEach((li, idx) => {
            li.classList.toggle('active', idx === activeIndex);
        });

        if (activeIndex >= 0 && items[activeIndex]) {
            items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
    }

    function selectBuilding(item) {
        input.value = item.sbuildingname;
        hideList();
        onSelect(item.idtbuilding, item.idtcity, item);
    }

    function hideList() {
        list.style.display = 'none';
        list.innerHTML = '';
        currentResults = [];
        activeIndex = -1;
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>"']/g, function (m) {
            return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m];
        });
    }

    // ---- wire up listeners ----
    input.addEventListener('input', handleInput);
    input.addEventListener('keydown', handleKeydown);
    document.addEventListener('click', handleDocumentClick);

    // stash a cleanup fn on the element so re-init doesn't double-bind
    const cleanup = function () {
        input.removeEventListener('input', handleInput);
        input.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('click', handleDocumentClick);
        input._autoSuggestCleanup = null;
    };
    input._autoSuggestCleanup = cleanup;

    // expose a small handle in case caller wants manual control
    return {
        destroy: cleanup,
        hideList: hideList
    };
}

// Default handler — used if no onSelect override is passed
function onBuildingSelected(idtbuilding, idtcity, item) {
    console.log('Selected building ID:', idtbuilding, item);
	$("#cityVis"+idtcity).val("All");
	var cityD = [];
	lastCityLoaded = idtcity;
	cityD.idtcity = idtcity;
	openVisualizationForCity(cityD, idtbuilding);
    // e.g. zoom map to building, load details panel, etc.
    // loadBuildingDetails(idtbuilding);
}