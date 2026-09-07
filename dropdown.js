(function () {
	function closeAllMenus(exceptEl) {
		document.querySelectorAll('.nested-dropdown.open').forEach(function (dd) {
			if (dd !== exceptEl) {
				dd.classList.remove('open');
				var btn = dd.querySelector('.dropdown-toggle');
				if (btn) btn.setAttribute('aria-expanded', 'false');
			}
		});
	}
 
	document.addEventListener('click', function (e) {
		var toggleBtn = e.target.closest('.nested-dropdown > .dropdown-toggle');
		if (toggleBtn) {
			var dd = toggleBtn.closest('.nested-dropdown');
			if (!dd) return;
			var isOpen = dd.classList.contains('open');
			closeAllMenus(isOpen ? null : dd);
			dd.classList.toggle('open', !isOpen);
			toggleBtn.setAttribute('aria-expanded', String(!isOpen));
			e.preventDefault();
			return;
		}
		// clicked outside any of OUR dropdown menus — close ours only
		if (!e.target.closest('.nested-dropdown-menu')) {
			closeAllMenus(null);
		}
	});
 
	document.addEventListener('keydown', function (e) {
		var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
		if (targetTag === 'input' || targetTag === 'textarea' || (e.target && e.target.isContentEditable)) return;
		if (e.key === 'Escape') closeAllMenus(null);
	});
})();
 
// ── Shared click handler for every dropdown-item (define once) ──
function selectDropdownItem(triggerEl, hiddenInputId, labelId, value, callbackFnName) {
	if (triggerEl.classList.contains('disabled')) return false;
 
	var hiddenInput = document.getElementById(hiddenInputId);
	if (hiddenInput) hiddenInput.value = value;
 
	var label = document.getElementById(labelId);
	if (label) label.textContent = triggerEl.textContent.trim();
 
	var menu = triggerEl.closest('.dropdown-menu');
	if (menu) {
		menu.querySelectorAll('.dropdown-item.active').forEach(function (el) {
			el.classList.remove('active');
		});
	}
	triggerEl.classList.add('active');
 
	// close the menu after picking an item
	var dd = triggerEl.closest('.nested-dropdown');
	if (dd) {
		dd.classList.remove('open');
		var btn = dd.querySelector('.dropdown-toggle');
		if (btn) btn.setAttribute('aria-expanded', 'false');
	}
 
	if (typeof window[callbackFnName] === 'function') {
		window[callbackFnName](value);
	}
	return false; // cancel the href="#" jump
}

function initEffectsDropdown() {
	var btn = document.getElementById('newEffectsButton');
	if (!btn) return;
 
	var wrapper = btn.closest('.dropdown');
	var menu = wrapper ? wrapper.querySelector('.dropdown-menu') : null;
	if (!wrapper || !menu) return;
 
	// avoid double-binding if initEffectsDropdown() is ever called twice
	if (wrapper.dataset.effectsDropdownInit === 'true') return;
	wrapper.dataset.effectsDropdownInit = 'true';
 
	function closeEffectsMenu() {
		wrapper.classList.remove('effects-open');
		menu.classList.remove('show');
		btn.setAttribute('aria-expanded', 'false');
	}
 
	function openEffectsMenu() {
		wrapper.classList.add('effects-open');
		menu.classList.add('show');
		btn.setAttribute('aria-expanded', 'true');
	}
 
	btn.addEventListener('click', function (e) {
		e.preventDefault();
		e.stopPropagation();
		var isOpen = wrapper.classList.contains('effects-open');
		if (isOpen) closeEffectsMenu(); else openEffectsMenu();
	});
 
	// close the menu after picking an effect, without interfering
	// with the item's own onclick="handleEffectClick(...)"
	menu.addEventListener('click', function (e) {
		if (e.target.closest('.dropdown-item')) {
			closeEffectsMenu();
		}
	});
 
	document.addEventListener('click', function (e) {
		if (!wrapper.contains(e.target)) closeEffectsMenu();
	});
 
	document.addEventListener('keydown', function (e) {
		var targetTag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
		if (targetTag === 'input' || targetTag === 'textarea' || (e.target && e.target.isContentEditable)) return;
		if (e.key === 'Escape') closeEffectsMenu();
	});
}