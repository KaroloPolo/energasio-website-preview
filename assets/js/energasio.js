/**
 * Energasio - Theme-Skripte
 * ---------------------------------------------------------------
 * 1. Sticky-Header
 * 2. Mobile-Navigation inkl. Untermenues
 * 3. Akkordeon (FAQ)
 * 4. Cookie-Hinweis
 * 5. Back-to-top
 * 6. Sanftes Einblenden von Abschnitten
 * 7. Formular-Validierung (Frontend)
 * 8. Portfolio-Wizard
 * 9. Kontakt-Dock
 * 10. Zusammenfassung auf der Danke-Seite
 */
(function () {
	'use strict';

	var doc = document;

	/* ---------------------------------------------------------------
	 * 1. Sticky-Header
	 * ------------------------------------------------------------- */
	function initStickyHeader() {
		var header = doc.querySelector('.site-header');
		if (!header) { return; }

		var toggle = function () {
			header.classList.toggle('is-stuck', window.scrollY > 24);
		};
		toggle();
		window.addEventListener('scroll', toggle, { passive: true });
	}

	/* ---------------------------------------------------------------
	 * 2. Mobile-Navigation
	 * ------------------------------------------------------------- */
	function initNavigation() {
		var button = doc.querySelector('.menu-toggle');
		var nav = doc.getElementById('site-navigation');
		if (!button || !nav) { return; }

		button.addEventListener('click', function () {
			var open = button.getAttribute('aria-expanded') === 'true';
			button.setAttribute('aria-expanded', open ? 'false' : 'true');
			nav.classList.toggle('is-open', !open);
			doc.body.classList.toggle('ea-nav-open', !open);
		});

		// Untermenues auf Touch-/Mobilbreite aufklappen
		nav.querySelectorAll('.menu-item-has-children > a').forEach(function (link) {
			link.addEventListener('click', function (event) {
				if (window.matchMedia('(min-width: 981px)').matches) { return; }
				event.preventDefault();
				var item = link.parentNode;
				var sub = item.querySelector('.sub-menu');
				item.classList.toggle('is-open');
				if (sub) { sub.classList.toggle('is-open'); }
			});
		});

		// Schliessen bei Escape
		doc.addEventListener('keydown', function (event) {
			if (event.key === 'Escape' && nav.classList.contains('is-open')) {
				button.setAttribute('aria-expanded', 'false');
				nav.classList.remove('is-open');
				doc.body.classList.remove('ea-nav-open');
				button.focus();
			}
		});
	}

	/* ---------------------------------------------------------------
	 * 3. Akkordeon
	 * ------------------------------------------------------------- */
	function initAccordion() {
		doc.querySelectorAll('.ea-accordion__btn').forEach(function (button) {
			button.addEventListener('click', function () {
				var panel = doc.getElementById(button.getAttribute('aria-controls'));
				var open = button.getAttribute('aria-expanded') === 'true';
				button.setAttribute('aria-expanded', open ? 'false' : 'true');
				if (panel) { panel.classList.toggle('is-open', !open); }
			});
		});
	}

	/* ---------------------------------------------------------------
	 * 4. Cookie-Hinweis
	 *    Hinweis: Platzhalter-Logik. Vor dem Live-Gang durch ein
	 *    Consent-Tool (z. B. Borlabs Cookie, Real Cookie Banner,
	 *    CCM19) ersetzen, sobald Tracking eingebunden wird.
	 * ------------------------------------------------------------- */
	function initCookieNotice() {
		var box = doc.querySelector('.ea-cookie');
		if (!box) { return; }

		var KEY = 'energasio_consent';
		var stored = null;
		try { stored = window.localStorage.getItem(KEY); } catch (e) { stored = null; }

		if (!stored) {
			window.setTimeout(function () { box.classList.add('is-visible'); }, 700);
		}

		box.querySelectorAll('[data-consent]').forEach(function (button) {
			button.addEventListener('click', function () {
				try { window.localStorage.setItem(KEY, button.getAttribute('data-consent')); } catch (e) {}
				box.classList.remove('is-visible');
			});
		});
	}

	/* ---------------------------------------------------------------
	 * 5. Back-to-top
	 * ------------------------------------------------------------- */
	function initBackToTop() {
		var button = doc.querySelector('.ea-totop');
		if (!button) { return; }

		var toggle = function () {
			button.classList.toggle('is-visible', window.scrollY > 700);
		};
		toggle();
		window.addEventListener('scroll', toggle, { passive: true });

		button.addEventListener('click', function () {
			window.scrollTo({ top: 0, behavior: 'smooth' });
		});
	}

	/* ---------------------------------------------------------------
	 * 6. Einblenden beim Scrollen
	 * ------------------------------------------------------------- */
	function initReveal() {
		var items = doc.querySelectorAll('.ea-reveal');
		if (!items.length) { return; }

		// Die Animation ist reine Zugabe: Der Inhalt ist per CSS ohnehin
		// sichtbar. Faellt der Observer aus, passiert schlicht nichts.
		if (!('IntersectionObserver' in window) ||
			window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
			!window.innerHeight) {
			return;
		}

		var observer = new IntersectionObserver(function (entries) {
			entries.forEach(function (entry) {
				if (entry.isIntersecting) {
					entry.target.classList.add('is-in');
					observer.unobserve(entry.target);
				}
			});
		}, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });

		items.forEach(function (item) { observer.observe(item); });
	}

	/* ---------------------------------------------------------------
	 * 7. Formular
	 *    Reine Frontend-Pruefung. Der Versand muss serverseitig
	 *    angebunden werden (Contact Form 7, WPForms o. ae.).
	 * ------------------------------------------------------------- */
	function initForms() {
		doc.querySelectorAll('.wpcf7-form').forEach(function (form) {
			// Der Wizard bringt eine eigene, mehrstufige Prüfung mit.
			if (form.id === 'ea-wizard') { return; }

			var output = form.querySelector('.wpcf7-response-output');

			form.addEventListener('submit', function (event) {
				event.preventDefault();
				var valid = true;

				form.querySelectorAll('[required]').forEach(function (field) {
					var tip = field.parentNode.querySelector('.wpcf7-not-valid-tip');
					if (tip) { tip.remove(); }
					field.classList.remove('wpcf7-not-valid');

					var empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
					var badMail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value);

					if (empty || badMail) {
						valid = false;
						field.classList.add('wpcf7-not-valid');
						var span = doc.createElement('span');
						span.className = 'wpcf7-not-valid-tip';
						span.setAttribute('role', 'alert');
						span.textContent = badMail
							? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
							: 'Bitte füllen Sie dieses Feld aus.';
						field.parentNode.appendChild(span);
					}
				});

				if (!output) { return; }
				output.classList.add('is-visible');
				output.textContent = valid
					? (form.getAttribute('data-success') ||
						'Vielen Dank. Ihre Anfrage wurde erfasst – wir melden uns innerhalb eines Werktags. (Hinweis für die Redaktion: Formularversand noch nicht angebunden.)')
					: 'Bitte prüfen Sie die markierten Felder.';

				if (valid) {
					form.reset();
					output.scrollIntoView({ behavior: 'smooth', block: 'center' });
				}
			});
		});
	}

	/* ---------------------------------------------------------------
	 * 8. Portfolio-Wizard
	 *    Mehrstufiges Lead-Formular. Der Versand muss serverseitig
	 *    angebunden werden - siehe Kommentar bei "submit".
	 * ------------------------------------------------------------- */
	var WIZARD_KEY = 'energasio_wizard_draft';
	var LEAD_KEY = 'energasio_lead';

	var WIZARD_LABELS = {
		profil: 'Profil',
		bedarf: 'Bedarf',
		groesse: 'Portfoliogröße',
		wohneinheiten: 'Wohneinheiten',
		laufzeit: 'Vertragsende'
	};

	function initWizard() {
		var form = doc.getElementById('ea-wizard');
		if (!form) { return; }

		var steps = Array.prototype.slice.call(form.querySelectorAll('.ea-wizard__step'));
		var progress = Array.prototype.slice.call(form.querySelectorAll('.ea-wizard__progress li'));
		var prevBtn = form.querySelector('[data-wizard-prev]');
		var nextBtn = form.querySelector('[data-wizard-next]');
		var submitBtn = form.querySelector('[data-wizard-submit]');
		var counter = form.querySelector('[data-wizard-count]');
		var output = form.querySelector('.wpcf7-response-output');
		var summary = doc.getElementById('ea-wizard-summary');
		var current = 0;

		function collect() {
			var data = {};
			new FormData(form).forEach(function (value, key) {
				if (!String(value).trim()) { return; }
				if (data[key]) { data[key] = [].concat(data[key], value); }
				else { data[key] = value; }
			});
			return data;
		}

		function saveDraft() {
			try { window.localStorage.setItem(WIZARD_KEY, JSON.stringify(collect())); } catch (e) {}
		}

		function restoreDraft() {
			var raw = null;
			try { raw = window.localStorage.getItem(WIZARD_KEY); } catch (e) { return; }
			if (!raw) { return; }
			var data;
			try { data = JSON.parse(raw); } catch (e) { return; }

			Object.keys(data).forEach(function (key) {
				var values = [].concat(data[key]);
				var fields = form.querySelectorAll('[name="' + key + '"]');
				Array.prototype.forEach.call(fields, function (field) {
					if (field.type === 'radio' || field.type === 'checkbox') {
						if (values.indexOf(field.value) !== -1) { field.checked = true; }
					} else if (values[0] !== undefined) {
						field.value = values[0];
					}
				});
			});
		}

		function renderSummary() {
			if (!summary) { return; }
			var data = collect();
			var rows = ['profil', 'bedarf', 'groesse', 'wohneinheiten', 'laufzeit']
				.filter(function (key) { return data[key]; })
				.map(function (key) {
					var value = [].concat(data[key]).join(', ');
					return '<dt>' + WIZARD_LABELS[key] + '</dt><dd>' + value.replace(/</g, '&lt;') + '</dd>';
				});
			summary.innerHTML = rows.length
				? '<strong>Ihre Angaben</strong><dl>' + rows.join('') + '</dl>'
				: '';
		}

		function show(index, moveFocus) {
			current = Math.max(0, Math.min(index, steps.length - 1));

			steps.forEach(function (step, i) { step.hidden = i !== current; });
			progress.forEach(function (item, i) {
				item.classList.toggle('is-active', i === current);
				item.classList.toggle('is-done', i < current);
				if (i === current) { item.setAttribute('aria-current', 'step'); }
				else { item.removeAttribute('aria-current'); }
			});

			var last = current === steps.length - 1;
			if (prevBtn) { prevBtn.hidden = current === 0; }
			if (nextBtn) { nextBtn.hidden = last; }
			if (submitBtn) { submitBtn.hidden = !last; }
			if (counter) { counter.textContent = 'Schritt ' + (current + 1) + ' von ' + steps.length; }
			if (last) { renderSummary(); }

			if (output) { output.classList.remove('is-visible'); }

			// Fokus nur beim Blättern setzen, nicht beim ersten Aufbau der Seite.
			if (moveFocus) {
				var legend = steps[current].querySelector('legend');
				if (legend) { legend.setAttribute('tabindex', '-1'); legend.focus({ preventScroll: true }); }

				var top = form.getBoundingClientRect().top + window.scrollY - 110;
				if (window.scrollY > top) { window.scrollTo({ top: top, behavior: 'smooth' }); }
			}
		}

		function clearErrors(step) {
			step.querySelectorAll('.wpcf7-not-valid-tip').forEach(function (tip) { tip.remove(); });
			step.querySelectorAll('.wpcf7-not-valid').forEach(function (f) { f.classList.remove('wpcf7-not-valid'); });
			step.querySelectorAll('.is-invalid').forEach(function (g) { g.classList.remove('is-invalid'); });
		}

		function complain(target, message) {
			var tip = doc.createElement('span');
			tip.className = 'wpcf7-not-valid-tip';
			tip.setAttribute('role', 'alert');
			tip.textContent = message;
			target.appendChild(tip);
		}

		function validate(step) {
			clearErrors(step);
			var valid = true;

			// Gruppen, in denen mindestens eine Auswahl nötig ist
			step.querySelectorAll('[data-require-one]').forEach(function (group) {
				if (!group.querySelector('input:checked')) {
					valid = false;
					group.classList.add('is-invalid');
					complain(group.parentNode, 'Bitte wählen Sie mindestens eine Option.');
				}
			});

			// Pflichtfelder
			step.querySelectorAll('[required]').forEach(function (field) {
				if (field.type === 'radio') {
					var group = form.querySelectorAll('[name="' + field.name + '"]');
					if (!Array.prototype.some.call(group, function (r) { return r.checked; })) {
						var box = field.closest('.ea-options');
						if (box && !box.classList.contains('is-invalid')) {
							valid = false;
							box.classList.add('is-invalid');
							complain(box.parentNode, 'Bitte wählen Sie eine Option.');
						}
					}
					return;
				}

				var empty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
				var badMail = field.type === 'email' && field.value && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(field.value);
				if (empty || badMail) {
					valid = false;
					field.classList.add('wpcf7-not-valid');
					complain(field.parentNode, badMail
						? 'Bitte geben Sie eine gültige E-Mail-Adresse ein.'
						: 'Bitte füllen Sie dieses Feld aus.');
				}
			});

			return valid;
		}

		if (nextBtn) {
			nextBtn.addEventListener('click', function () {
				if (!validate(steps[current])) { return; }
				saveDraft();
				show(current + 1, true);
			});
		}
		if (prevBtn) {
			prevBtn.addEventListener('click', function () { show(current - 1, true); });
		}

		form.addEventListener('change', saveDraft);

		// Auswahlkarten: Enter/Leertaste sollen wie ein Klick wirken
		form.addEventListener('keydown', function (event) {
			if (event.key !== 'Enter') { return; }
			var field = event.target;
			if (field.tagName === 'TEXTAREA') { return; }
			if (field.closest('.ea-wizard__step')) {
				event.preventDefault();
				if (nextBtn && !nextBtn.hidden) { nextBtn.click(); }
			}
		});

		form.addEventListener('submit', function (event) {
			event.preventDefault();
			if (!validate(steps[current])) {
				if (output) {
					output.classList.add('is-visible');
					output.textContent = 'Bitte prüfen Sie die markierten Felder.';
				}
				return;
			}

			var payload = collect();

			// TODO: Hier den echten Versand einhängen, z. B.
			// fetch('/wp-json/contact-form-7/v1/contact-forms/145/feedback', { method: 'POST', body: new FormData(form) })
			try {
				window.sessionStorage.setItem(LEAD_KEY, JSON.stringify(payload));
				window.localStorage.removeItem(WIZARD_KEY);
			} catch (e) {}

			window.location.href = 'danke.html';
		});

		restoreDraft();
		show(0, false);
	}

	/* ---------------------------------------------------------------
	 * 9. Kontakt-Dock
	 * ------------------------------------------------------------- */
	function initDock() {
		var dock = doc.querySelector('.ea-dock');
		if (!dock) { return; }

		var toggle = dock.querySelector('.ea-dock__toggle');
		var panel = dock.querySelector('.ea-dock__panel');
		if (!toggle || !panel) { return; }

		var setOpen = function (open) {
			toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
			panel.hidden = !open;
		};

		toggle.addEventListener('click', function () {
			setOpen(toggle.getAttribute('aria-expanded') !== 'true');
		});

		doc.addEventListener('click', function (event) {
			if (!dock.contains(event.target)) { setOpen(false); }
		});

		doc.addEventListener('keydown', function (event) {
			if (event.key === 'Escape') { setOpen(false); }
		});
	}

	/* ---------------------------------------------------------------
	 * 10. Zusammenfassung auf der Danke-Seite
	 * ------------------------------------------------------------- */
	function initThanks() {
		var box = doc.getElementById('ea-danke-summary');
		var list = doc.getElementById('ea-danke-list');
		if (!box || !list) { return; }

		var raw = null;
		try { raw = window.sessionStorage.getItem(LEAD_KEY); } catch (e) { return; }
		if (!raw) { return; }

		var data;
		try { data = JSON.parse(raw); } catch (e) { return; }

		var labels = {
			unternehmen: 'Unternehmen',
			name: 'Ansprechpartner',
			email: 'E-Mail',
			telefon: 'Telefon',
			profil: 'Profil',
			bedarf: 'Bedarf',
			groesse: 'Portfoliogröße',
			wohneinheiten: 'Wohneinheiten',
			laufzeit: 'Vertragsende'
		};

		var html = Object.keys(labels)
			.filter(function (key) { return data[key]; })
			.map(function (key) {
				var value = [].concat(data[key]).join(', ');
				var dt = doc.createElement('dt');
				var dd = doc.createElement('dd');
				dt.textContent = labels[key];
				dd.textContent = value;
				return dt.outerHTML + dd.outerHTML;
			})
			.join('');

		if (!html) { return; }
		list.innerHTML = html;
		box.hidden = false;
	}

	/* ------------------------------------------------------------- */
	doc.addEventListener('DOMContentLoaded', function () {
		initStickyHeader();
		initNavigation();
		initAccordion();
		initCookieNotice();
		initBackToTop();
		initReveal();
		initForms();
		initWizard();
		initDock();
		initThanks();

		// Aktuelles Jahr im Footer
		doc.querySelectorAll('[data-current-year]').forEach(function (node) {
			node.textContent = String(new Date().getFullYear());
		});
	});
}());
