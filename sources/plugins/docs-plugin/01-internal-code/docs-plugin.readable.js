/*
 * Readable view of the plugin source.
 * Authoritative byte-exact source: ../01-internal-code/main.pjs
 * Only edit here: the ~42 KB minified `marked` bundle inlined by main.pjs has been
 * replaced with a reference comment. The untouched bundle bytes ship as
 * ../../03-third-party-assets/marked/marked.bundle.min.js
 */
docsPlugin = [$output]

$output(opts) =>
  function init(options = {}) {
    const settings = {
      pageCopyButtons: true,
      ...options,
    };
  
    const highlightModuleUrls = {
      core: 'https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022',
      javascript: 'https://esm.sh/highlight.js@11.11.1/lib/languages/javascript?target=es2022',
      json: 'https://esm.sh/highlight.js@11.11.1/lib/languages/json?target=es2022',
      xml: 'https://esm.sh/highlight.js@11.11.1/lib/languages/xml?target=es2022',
    };
  
    const highlightLanguageMap = {
      js: 'javascript',
      javascript: 'javascript',
      json: 'json',
      jsonc: 'json',
      json5: 'javascript',
      html: 'xml',
      xml: 'xml',
      svg: 'xml',
    };
  
    const highlighterState = {
      core: null,
      aliasesRegistered: false,
      loadedLanguages: new Set(),
    };
  
    injectStyles();
  
    const app = buildApp();
    document.body.append(app);
  
    const elements = {
      article: app.querySelector('.page'),
      bottomActions: app.querySelector('.bottom-actions'),
      bottomLinks: app.querySelector('.bottom-links'),
      menuButton: app.querySelector('.menu'),
      navActions: app.querySelector('.nav-actions'),
      navLinks: app.querySelector('.nav-links'),
      scrim: app.querySelector('.scrim'),
      title: app.querySelector('.title'),
    };
  
    const marked = (() => { /* inlined marked bundle omitted here - see 03-third-party-assets/marked/marked.bundle.min.js */ return __docsMarkedBundle.marked; })();
    marked.setOptions({ gfm: true });
    const pageNodes = [...document.querySelectorAll('script[type="text/markdown"][data-hash]')];
    const pages = pageNodes.map(readPageDefinition);
    const hasMultiplePages = pages.length > 1;
    const hasDescriptions = pages.some((page) => page.desc.trim());
    const pageMap = new Map(pages.map((page) => [page.hash, page]));
  
    app.classList.toggle('single-page', !hasMultiplePages);
    app.classList.toggle('has-descriptions', hasDescriptions);
    app.classList.toggle('no-descriptions', !hasDescriptions);
    if (settings.pageCopyButtons && hasMultiplePages) renderGlobalCopyButtons();
  
    elements.menuButton.addEventListener('click', toggleMenu);
    elements.scrim.addEventListener('click', () => setMenuOpen(false));
    window.addEventListener('hashchange', renderCurrentRoute);
  
    renderCurrentRoute();
  
    function injectStyles() {
      const style = document.createElement('style');
      style.textContent = `
        html { color-scheme: light dark; }
        * { box-sizing: border-box; }
        html, body { margin: 0; }
        body { font: 15px/1.55 ui-sans-serif, system-ui, sans-serif; background: Canvas; color: color-mix(in oklab, CanvasText 96%, Canvas 4%); text-align:left; }
        a { color: LinkText; }
        img { max-width: 100%; height: auto; }
        code, pre { font: 13px/1.5 ui-monospace, SFMono-Regular, Menlo, Consolas, monospace; }
        pre { position: relative; overflow: auto; padding: .8rem; padding-right: 2.55rem; border: 1px solid var(--border); background: var(--code); border-radius: .4rem; }
        code { background: var(--code); padding: .1rem .28rem; border-radius: .25rem; }
        pre code { background: none; padding: 0; border-radius: 0; }
        table { border-collapse: collapse; display: block; max-width: 100%; overflow: auto; }
        th, td { border: 1px solid var(--border); padding: .35rem .55rem; text-align: left; }
        blockquote { margin: 1rem 0; padding: .1rem 0 .1rem .9rem; border-left: 3px solid var(--border); color: var(--muted); }
        hr { border: 0; border-top: 1px solid var(--border); margin: 1.4rem 0; }
        h1, h2, h3, h4, h5, h6 { line-height: 1.2; margin: 1.25em 0 .5em; }
        h1 { font-size: 1.9rem; }
        h2 { font-size: 1.35rem; }
        h3 { font-size: 1.1rem; }
        p, ul, ol { margin: .75rem 0; }
        ul, ol { padding-left: 1.2rem; }
        li + li { margin-top: .22rem; }
        :root {
          --border: color-mix(in oklab, CanvasText 16%, Canvas 84%);
          --muted: color-mix(in oklab, CanvasText 62%, Canvas 38%);
          --bg2: color-mix(in oklab, CanvasText 2.5%, Canvas 97.5%);
          --bg3: color-mix(in oklab, CanvasText 4.5%, Canvas 95.5%);
          --code: color-mix(in oklab, CanvasText 4%, Canvas 96%);
          --active: color-mix(in oklab, LinkText 12%, Canvas 88%);
        }
        body.menu-open { overflow: hidden; }
        .app { display: block; }
        .nav { position: fixed; inset: 0 auto 0 0; width: min(19rem, 86vw); padding: 1rem; border-right: 1px solid var(--border); background: Canvas; overflow: auto; transform: translateX(-100%); transition: transform .09s ease; z-index: 30; }
        .menu-open .nav { transform: translateX(0); }
        .scrim { position: fixed; inset: 0; background: rgb(0 0 0 / .24); opacity: 0; pointer-events: none; transition: opacity .09s ease; z-index: 20; }
        .menu-open .scrim { opacity: 1; pointer-events: auto; }
        .main { min-width: 0; }
        .bar { position: sticky; top: 0; display: flex; align-items: center; gap: .75rem; padding: .7rem .9rem; border-bottom: 1px solid var(--border); background: Canvas; z-index: 10; }
        .menu, .copy-button { appearance: none; border: 1px solid var(--border); background: var(--bg2); color: inherit; border-radius: .35rem; padding: .4rem .65rem; font: inherit; cursor: pointer; }
        .menu:hover, .copy-button:hover, .nav a:hover, .bottom a:hover { background: var(--bg3); }
        .title { font-weight: 600; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .page { max-width: 56rem; padding: 1rem .95rem 3rem; margin: 0 auto; }
        .page > :first-child { margin-top: 0; }
        .page-tools { display: flex; justify-content: flex-end; margin-bottom: .35rem; }
        .copy-button { display: inline-flex; align-items: center; gap: .38rem; padding: .28rem .52rem; line-height: 1.2; }
        .copy-button .icon { font-size: .95em; line-height: 1; }
        .page-tools + h1 { margin-top: .15rem; }
        .copy-button[data-state="done"] { background: var(--active); color: LinkText; }
        .code-copy-button { position: absolute; top: .45rem; right: .45rem; width: 1.85rem; height: 1.85rem; padding: 0; justify-content: center; gap: 0; }
        .bottom { max-width: 56rem; margin: 0 auto 2.5rem; padding: 1.1rem .95rem 0; border-top: 1px solid var(--border); }
        .bottom h2 { font-size: .98rem; margin: 0 0 .75rem; }
        .nav a, .bottom a { display: block; padding: .42rem .55rem; border-radius: .35rem; text-decoration: none; color: inherit; }
        .nav a.active, .bottom a.active { background: var(--active); color: LinkText; }
        .nav small, .bottom small { display: block; color: var(--muted); margin-top: .16rem; line-height: 1.35; }
        .nav .group { display: grid; gap: .1rem; }
        .bottom .group { display: grid; gap: .3rem; }
        .nav-actions, .bottom-actions { margin-top: .85rem; }
        .nav-actions .copy-button, .bottom-actions .copy-button { width: 100%; justify-content: center; }
        .footer-note { margin-top: .8rem; color: var(--muted); font-size: .92rem; }
        .app.single-page .nav, .app.single-page .bottom, .app.single-page .scrim, .app.single-page .menu { display: none; }
        .hljs { color: #24292f; }
        .hljs-comment, .hljs-quote { color: #6a737d; }
        .hljs-tag, .hljs-name, .hljs-selector-tag { color: #22863a; }
        .hljs-attribute { color: #005cc5; }
        .hljs-string, .hljs-symbol, .hljs-bullet, .hljs-addition { color: #032f62; }
        .hljs-keyword { color: #d73a49; }
        .hljs-title, .hljs-section { color: #6f42c1; }
        .hljs-number, .hljs-built_in, .hljs-builtin-name, .hljs-literal, .hljs-type, .hljs-params, .hljs-meta, .hljs-link { color: #005cc5; }
        .hljs-variable, .hljs-template-variable, .hljs-selector-id, .hljs-selector-class, .hljs-regexp, .hljs-deletion { color: #e36209; }
        .hljs-emphasis { font-style: italic; }
        .hljs-strong { font-weight: 700; }
        @media (prefers-color-scheme: dark) {
          body { color: color-mix(in oklab, CanvasText 88%, Canvas 12%); }
          code { background: color-mix(in oklab, CanvasText 12%, Canvas 88%); }
          .hljs { color: #d4d4d4; }
          .hljs-comment, .hljs-quote { color: #6a9955; }
          .hljs-tag, .hljs-name, .hljs-selector-tag { color: #4ec9b0; }
          .hljs-attribute { color: #9cdcfe; }
          .hljs-string, .hljs-symbol, .hljs-bullet, .hljs-addition { color: #ce9178; }
          .hljs-keyword { color: #c586c0; }
          .hljs-title, .hljs-section { color: #569cd6; }
          .hljs-number, .hljs-built_in, .hljs-builtin-name, .hljs-literal, .hljs-type, .hljs-params, .hljs-meta, .hljs-link { color: #b5cea8; }
          .hljs-variable, .hljs-template-variable, .hljs-selector-id, .hljs-selector-class, .hljs-regexp, .hljs-deletion { color: #f44747; }
        }
        @media (min-width: 960px) {
          body.menu-open { overflow: auto; }
          .app { display: grid; grid-template-columns: 18.5rem minmax(0, 1fr); }
          .app.single-page { display: block; }
          .app.no-descriptions .bottom { display: none; }
          .code-copy-button { opacity: 0; pointer-events: none; transition: opacity .12s ease; }
          pre:hover .code-copy-button, pre:focus-within .code-copy-button { opacity: 1; pointer-events: auto; }
          .nav { position: sticky; top: 0; transform: none; width: auto; height: 100vh; }
          .scrim, .menu { display: none; }
          .bar { display: none; }
          .page { padding: 1.2rem 1.2rem 3rem; }
          .bottom { padding: 1.2rem 1.2rem 0; }
        }
      `;
      document.head.append(style);
    }
  
    function buildApp() {
      const app = document.createElement('div');
      app.className = 'app';
      app.innerHTML = `
        <aside class="nav" id="docs-nav">
          <div class="group nav-links"></div>
          <div class="nav-actions"></div>
        </aside>
        <div class="scrim"></div>
        <main class="main">
          <header class="bar">
            <button class="menu" type="button" aria-expanded="false" aria-controls="docs-nav">Menu</button>
            <div class="title"></div>
          </header>
          <article class="page"></article>
          <nav class="bottom">
            <h2>Table of contents</h2>
            <div class="group bottom-links"></div>
            <div class="bottom-actions"></div>
          </nav>
        </main>
      `;
      return app;
    }
  
    function readPageDefinition(node, index) {
      return {
        index,
        desc: node.dataset.desc || '',
        hash: node.dataset.hash,
        html: null,
        highlightedHtml: null,
        highlightPromise: null,
        source: node.textContent.replace(/<(\\+)\/script>/gi, (_, slashes) => {
          return `<${'\\'.repeat(slashes.length - 1)}/scr` + 'ipt>';
        }),
        title: node.dataset.title || node.dataset.hash,
      };
    }
  
    function parseRoute() {
      const rawHash = decodeURIComponent(location.hash.replace(/^#/, ''));
  
      if (!rawHash) {
        return pages[0];
      }
  
      const pageHash = rawHash.split('/')[0];
      return pageMap.get(pageHash) || pages[0];
    }
  
    function setMenuOpen(isOpen) {
      document.body.classList.toggle('menu-open', isOpen);
      elements.menuButton.setAttribute('aria-expanded', String(isOpen));
    }
  
    function toggleMenu() {
      const isOpen = document.body.classList.contains('menu-open');
      setMenuOpen(!isOpen);
    }
  
    function renderNavigation(currentPage) {
      renderLinkList(elements.navLinks, currentPage, false);
      renderLinkList(elements.bottomLinks, currentPage, true);
    }
  
    function renderLinkList(target, currentPage, showDescription) {
      const showHoverDescription = target === elements.navLinks && hasDescriptions;
  
      target.innerHTML = pages.map((page) => {
        const activeClass = page.hash === currentPage.hash ? ' class="active"' : '';
        const description = showDescription && page.desc ? `<small>${escapeHtml(page.desc)}</small>` : '';
        const title = showHoverDescription && page.desc ? ` title="${escapeHtml(page.desc)}"` : '';
  
        return `<a href="#${page.hash}"${activeClass}${title}><span>${escapeHtml(page.title)}</span>${description}</a>`;
      }).join('');
    }
  
    function renderCurrentRoute() {
      const page = parseRoute();
  
      renderNavigation(page);
      elements.title.textContent = page.title;
      document.title = `${page.title} · AI Character Chat Docs`;
  
      renderPage(page);
      setMenuOpen(false);
      window.scrollTo(0, 0);
    }
  
    function renderPage(page) {
      if (page.html === null) {
        const rendered = document.createElement('div');
  
        rendered.innerHTML = marked.parse(page.source);
        postProcessPage(rendered);
        page.html = rendered.innerHTML;
      }
  
      elements.article.innerHTML = page.highlightedHtml || page.html;
      renderPageChrome(page);
      ensureHighlightedPage(page);
    }
  
    function ensureHighlightedPage(page) {
      if (page.highlightedHtml !== null || page.highlightPromise) return;
  
      page.highlightPromise = (async () => {
        const rendered = document.createElement('div');
  
        rendered.innerHTML = page.html;
        const highlighted = await highlightCodeBlocks(rendered);
  
        page.highlightedHtml = highlighted ? rendered.innerHTML : page.html;
  
        if (parseRoute().hash === page.hash) {
          const scrollTop = window.scrollY;
  
          elements.article.innerHTML = page.highlightedHtml;
          renderPageChrome(page);
          window.scrollTo(0, scrollTop);
        }
      })().finally(() => {
        page.highlightPromise = null;
      });
    }
  
    function renderPageChrome(page) {
      renderPageTools(page);
      renderCodeBlockCopyButtons();
    }
  
    function renderPageTools(page) {
      if (!settings.pageCopyButtons) return;
  
      const tools = document.createElement('div');
  
      tools.className = 'page-tools';
      tools.append(createCopyButton('Copy page', () => copyText(page.source)));
      elements.article.prepend(tools);
    }
  
    function renderCodeBlockCopyButtons() {
      if (!settings.pageCopyButtons) return;
  
      elements.article.querySelectorAll('pre').forEach((pre) => {
        const code = pre.querySelector('code');
        if (!code) return;
  
        pre.append(createCodeCopyButton(() => code.textContent));
      });
    }
  
    function renderGlobalCopyButtons() {
      const allDocsMarkdown = getAllDocsMarkdown();
  
      elements.navActions.append(createCopyButton('Copy all pages', () => copyText(allDocsMarkdown)));
      elements.bottomActions.append(createCopyButton('Copy all pages', () => copyText(allDocsMarkdown)));
    }
  
    function createCopyButton(label, action) {
      const button = document.createElement('button');
      const icon = document.createElement('span');
      const text = document.createElement('span');
  
      button.className = 'copy-button';
      button.type = 'button';
      icon.className = 'icon';
      icon.setAttribute('aria-hidden', 'true');
      icon.textContent = '⧉';
      text.className = 'label';
      text.textContent = label;
      button.append(icon, text);
      button.addEventListener('click', async () => {
        const originalLabel = text.textContent;
        const fixedWidth = `${Math.ceil(button.getBoundingClientRect().width)}px`;
  
        button.disabled = true;
        button.style.width = fixedWidth;
  
        try {
          await action();
          button.dataset.state = 'done';
          text.textContent = 'Copied';
        } catch {
          text.textContent = 'Copy Failed';
        }
  
        window.setTimeout(() => {
          button.disabled = false;
          button.dataset.state = '';
          text.textContent = originalLabel;
          button.style.width = '';
        }, 1200);
      });
  
      return button;
    }
  
    function createCodeCopyButton(getText) {
      const button = document.createElement('button');
  
      button.className = 'copy-button code-copy-button';
      button.type = 'button';
      button.setAttribute('aria-label', 'Copy code');
      button.textContent = '⧉';
      button.addEventListener('click', async () => {
        button.disabled = true;
  
        try {
          await copyText(getText());
          button.dataset.state = 'done';
        } catch {
          button.dataset.state = 'error';
        }
  
        window.setTimeout(() => {
          button.disabled = false;
          button.dataset.state = '';
        }, 900);
      });
  
      return button;
    }
  
    function postProcessPage(root) {
      root.querySelectorAll('a[href]').forEach((link) => {
        const href = link.getAttribute('href') || '';
  
        if (!/^https?:\/\//i.test(href)) return;
  
        link.target = '_blank';
        link.rel = 'noreferrer noopener';
      });
    }
  
    async function copyText(text) {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
      }
  
      const textarea = document.createElement('textarea');
  
      textarea.value = text;
      textarea.setAttribute('readonly', '');
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.append(textarea);
      textarea.select();
  
      try {
        document.execCommand('copy');
      } finally {
        textarea.remove();
      }
    }
  
    function getAllDocsMarkdown() {
      return pages.map((page) => page.source.trim()).join('\n\n\n');
    }
  
    function escapeHtml(text) {
      return text.replace(/[&<>"']/g, (char) => {
        return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char];
      });
    }
  
    async function highlightCodeBlocks(root) {
      const blocks = [...root.querySelectorAll('pre code')];
  
      if (!blocks.length) return false;
  
      const languages = new Set();
  
      for (const block of blocks) {
        const language = getBlockLanguage(block);
        if (language) languages.add(language);
      }
  
      const hljs = await loadHighlighter(languages);
      if (!hljs) return false;
  
      for (const block of blocks) {
        const originalLanguage = getBlockLanguage(block);
        const language = normalizeLanguage(originalLanguage);
  
        if (!language || !hljs.getLanguage(language)) continue;
  
        const result = hljs.highlight(block.textContent, {
          ignoreIllegals: true,
          language,
        });
  
        block.innerHTML = result.value;
        block.classList.add('hljs', `language-${language}`);
        if (originalLanguage && originalLanguage !== language) {
          block.dataset.originalLanguage = originalLanguage;
        }
      }
  
      return true;
    }
  
    function getBlockLanguage(block) {
      const match = block.className.match(/(?:^|\s)language-([\w-]+)/);
      return match ? match[1].toLowerCase() : null;
    }
  
    function normalizeLanguage(language) {
      if (!language) return null;
      return highlightLanguageMap[language.toLowerCase()] || null;
    }
  
    async function loadHighlighter(languages) {
      const neededLanguages = [...languages]
        .map(normalizeLanguage)
        .filter(Boolean);
  
      if (!neededLanguages.length) return null;
  
      if (!highlighterState.core) {
        const coreModule = await import(highlightModuleUrls.core);
        highlighterState.core = coreModule.default || coreModule;
      }
  
      const languagesToLoad = [...new Set(neededLanguages)].filter((language) => {
        return !highlighterState.loadedLanguages.has(language);
      });
  
      await Promise.all(languagesToLoad.map(async (language) => {
        const languageModule = await import(highlightModuleUrls[language]);
        const grammar = languageModule.default || languageModule;
  
        highlighterState.core.registerLanguage(language, grammar);
        highlighterState.loadedLanguages.add(language);
      }));
  
      if (!highlighterState.aliasesRegistered) {
        highlighterState.core.registerAliases(['json5'], { languageName: 'javascript' });
        highlighterState.aliasesRegistered = true;
      }
  
      return highlighterState.core;
    }
  }
  init(opts);
