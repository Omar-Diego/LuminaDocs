// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import mermaid from 'astro-mermaid';

// https://astro.build/config
export default defineConfig({
	integrations: [
		mermaid({
			// Lumina es un tema único claro (ver DESIGN.md) — autoTheme lo pisaría con el tema 'dark' de mermaid.
			theme: 'base',
			autoTheme: false,
			mermaidConfig: {
				themeVariables: {
					fontFamily: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
					background: '#ffffff',
					primaryColor: '#d7ffb8', // Storybook Green
					primaryTextColor: '#4b4b4b', // Charcoal
					primaryBorderColor: '#58cc02', // Eager Green
					lineColor: '#4b4b4b', // Charcoal
					textColor: '#4b4b4b',
					secondaryColor: '#eaf7ff',
					secondaryBorderColor: '#1cb0f6', // Spark Blue
					tertiaryColor: '#ffffff',
					tertiaryBorderColor: '#afafaf', // Faded Gray
				},
			},
		}),
		starlight({
			title: 'Lumina',
			locales: {
				root: { label: 'Español', lang: 'es' },
			},
			components: {
				ThemeSelect: './src/components/NoThemeSelect.astro',
			},
			logo: {
				src: './src/assets/logo-lumina.png',
				alt: 'Lumina',
				replacesTitle: true,
			},
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			head: [
				{ tag: 'link', attrs: { rel: 'icon', type: 'image/png', href: '/favicon-96x96.png', sizes: '96x96' } },
				{ tag: 'link', attrs: { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' } },
				{ tag: 'link', attrs: { rel: 'manifest', href: '/site.webmanifest' } },
				// Botón de pantalla completa para diagramas mermaid, con <dialog> nativo.
				{
					tag: 'script',
					content: `
(function () {
	function ensureDialog() {
		var dialog = document.getElementById('mermaid-fullscreen-dialog');
		if (dialog) return dialog;
		dialog = document.createElement('dialog');
		dialog.id = 'mermaid-fullscreen-dialog';
		var closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'mermaid-fullscreen-close';
		closeBtn.setAttribute('aria-label', 'Cerrar');
		closeBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>';
		closeBtn.addEventListener('click', function () { dialog.close(); });
		var content = document.createElement('div');
		content.className = 'mermaid-fullscreen-content';
		dialog.appendChild(closeBtn);
		dialog.appendChild(content);
		dialog.addEventListener('click', function (e) {
			if (e.target === dialog) dialog.close();
		});
		dialog.addEventListener('close', function () {
			document.documentElement.style.removeProperty('overflow');
		});
		document.body.appendChild(dialog);
		return dialog;
	}

	function openFullscreen(pre) {
		var svg = pre.querySelector('svg');
		if (!svg) return;
		var dialog = ensureDialog();
		var content = dialog.querySelector('.mermaid-fullscreen-content');
		content.innerHTML = '';
		content.appendChild(svg.cloneNode(true));
		document.documentElement.style.overflow = 'hidden';
		dialog.showModal();
	}

	function addExpandButtons() {
		document.querySelectorAll('pre.mermaid[data-processed]').forEach(function (pre) {
			if (pre.querySelector('.mermaid-expand-btn')) return;
			var btn = document.createElement('button');
			btn.type = 'button';
			btn.className = 'mermaid-expand-btn';
			btn.setAttribute('aria-label', 'Ver diagrama en pantalla completa');
			btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M3 16v3a2 2 0 0 0 2 2h3"/></svg>';
			btn.addEventListener('click', function (e) {
				e.stopPropagation();
				openFullscreen(pre);
			});
			pre.appendChild(btn);
		});
	}

	var observer = new MutationObserver(function () { addExpandButtons(); });

	function init() {
		addExpandButtons();
		observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['data-processed'] });
	}

	if (document.readyState === 'loading') {
		document.addEventListener('DOMContentLoaded', init);
	} else {
		init();
	}

	document.addEventListener('astro:after-swap', function () {
		addExpandButtons();
	});
})();
`,
				},
			],
			customCss: ['./src/styles/custom.css'],
			sidebar: [
				{
					label: 'Proyecto',
					items: [
						{ label: 'Parte 1: Requerimientos y Metodología', slug: 'parte-1-requerimientos' },
						{ label: 'Parte 2: Arquitectura y Modelado', slug: 'parte-2-arquitectura' },
					],
				},
			],
		}),
	],
});
