# Complete source & asset dump - docs-plugin

Every text file in this package, in full, one after another. Binary-free: the package contains no images/audio/blobs.
The marked bundle appears here as its single minified line; it is also shipped as a real file at
03-third-party-assets/marked/marked.bundle.min.js.

## Contents

- 01-internal-code/docs-plugin.readable.js
- 01-internal-code/index.html
- 01-internal-code/main.pjs
- 02-external-code/highlight.js-11.11.1/LICENSE
- 02-external-code/highlight.js-11.11.1/esm-shims/core.js
- 02-external-code/highlight.js-11.11.1/esm-shims/javascript.js
- 02-external-code/highlight.js-11.11.1/esm-shims/json.js
- 02-external-code/highlight.js-11.11.1/esm-shims/xml.js
- 02-external-code/highlight.js-11.11.1/modules/README.md
- 02-external-code/highlight.js-11.11.1/modules/core.mjs
- 02-external-code/highlight.js-11.11.1/modules/languages/javascript.mjs
- 02-external-code/highlight.js-11.11.1/modules/languages/json.mjs
- 02-external-code/highlight.js-11.11.1/modules/languages/xml.mjs
- 02-external-code/highlight.js-11.11.1/package.json
- 03-third-party-assets/LICENSES.md
- 03-third-party-assets/marked/LICENSE.md
- 03-third-party-assets/marked/PROVENANCE.md
- 03-third-party-assets/marked/marked.bundle.min.js
- 03-third-party-assets/marked/package.json
- 03-third-party-assets/marked/upstream-reference/marked.esm.js
- 04-project-resources/README.md
- 04-project-resources/examples/ai-character-chat-docs/index.html
- 04-project-resources/examples/ai-character-chat-docs/main.pjs
- 04-project-resources/examples/docs-plugin-simple/index.html
- 04-project-resources/examples/docs-plugin-simple/main.pjs
- 05-build-config/package.json
- 05-build-config/tools/README.md
- 05-build-config/tools/extract-marked-bundle.mjs
- 05-build-config/tools/rebuild-marked-bundle.mjs
- 05-build-config/tools/verify-checksums.sh
- README.md

## 01-internal-code/docs-plugin.readable.js

- bytes: 20914
- language: js

```js
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
```

## 01-internal-code/index.html

- bytes: 4053
- language: html

```html
<script type="text/markdown" data-hash="overview" data-title="📘 Overview" data-desc="How to add the plugin on Perchance and create a few simple docs pages.">
# Docs Plugin

To use this plugin, put this in your lists editor:

```text
docsPlugin = {import:docs-plugin}
```

Then put something like this in your HTML editor:

```html
<script type="text/markdown" data-hash="overview" data-title="Overview">
# Overview
Hello world.
<\/script>


<script type="text/markdown" data-hash="second-page" data-title="Second Page">
# Second Page
More markdown here. **This text will be bold.**
<\/script>


<script>docsPlugin()<\/script>
```

That's the whole setup. Each markdown script block becomes one page.

Markdown is just a lightweight way to format text. A few useful basics:

- `# Heading` makes a heading
- `**bold**` makes text bold
- `*italic*` makes text italic
- `[link text](https://example.com)` makes a link
- `` `code` `` makes inline code
- `- item` makes a list

For a fuller reference, see [Markdown Syntax](#markdown-syntax).

The plugin uses:

- `data-hash` for the page URL hash
- `data-title` for the menu label
- `data-desc` for an optional short description in the larger table of contents

If you want to hide the "copy page" buttons use `docsPlugin({pageCopyButtons:false})` instead of `docsPlugin()`.

### Usage Examples:
* Simple: https://perchance.org/docs-plugin-example
* More complex: https://perchance.org/ai-character-chat-docs
</script>








<script type="text/markdown" data-hash="advanced" data-title="🛠️ Advanced" data-desc="Tips for advanced users, and gotchas to watch out for.">
# Advanced

## HTML
You can write regular HTML inside your markdown blocks. E.g. to embed an image but set a max width, you can write this:

```html
<img src="https://example.com/myimage.png" style="max-width:400px;">
```

## Links
You can link to another docs page with a normal hash link:

```md
[Overview](#overview)
[Advanced](#advanced)
```

The `#hash` should match that page's `data-hash`. For example, [here's a link](#markdown-syntax) to the markdown syntax page of this doc.

## Script tags
If you want to add script tags inside your markdown text, close the script's tag with `<\\/script>` instead of `<\/script>`.

Otherwise your closing script tag what you were trying to show *within* your markdown block will actually *end* your markdown block.
</script>


<script type="text/markdown" data-hash="markdown-syntax" data-title="📝 Markdown Syntax" data-desc="A friendly reference for the markdown syntax you can use in your docs pages.">
# Markdown Syntax

Here are the main bits of markdown you’ll probably use.

## Headings

```md
# Big heading
## Medium heading
### Small heading
```

## Emphasis

```md
**bold**
*italic*
~~strikethrough~~
```

## Links

```md
[External link](https://example.com)
[Another docs page](#advanced)
```

## Lists

```md
- First item
- Second item

1. First step
2. Second step
```

## Task lists

```md
- [ ] Not done yet
- [x] Done
```

## Code

```md
Use `inline code` in a sentence.
```

````md
```js
console.log("code block");
```
````

## Blockquotes

```md
> This is a quote.
```

## Images

```md
![Alt text](https://example.com/image.png)
```

## Tables

```md
| Name | Role |
| --- | --- |
| Ava | Guide |
| Ben | Helper |
```

Or use HTML if you want a bit more control:

```html
<img src="https://example.com/image.png" style="max-width:400px;">
```

## Paragraphs

Leave a blank line between paragraphs:

```md
First paragraph.

Second paragraph.
```

That covers most docs pages. You can also mix in regular HTML when markdown alone isn’t enough. For example:

```html
You can write **markdown** and also make just <i style="color:tomato;">a couple of words</i> colored with HTML.
```

Or use HTML like `<details>` when you want a collapsible section:

```html
<details>
<summary>Click to expand</summary>

More content here.
</details>
```

<details>
<summary>Click to expand</summary>

More content here.
</details>
</script>







<script>docsPlugin()</script>
```

## 01-internal-code/main.pjs

- bytes: 62281
- language: text

```text
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
  
    const marked = (() => { var __docsMarkedBundle=(()=>{var e=Object.defineProperty,t=Object.getOwnPropertyDescriptor,n=Object.getOwnPropertyNames,r=Object.prototype.hasOwnProperty,s={};function l(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}((t,n)=>{for(var r in n)e(t,r,{get:n[r],enumerable:!0})})(s,{Hooks:()=>me,Lexer:()=>fe,Marked:()=>ye,Parser:()=>we,Renderer:()=>xe,TextRenderer:()=>be,Tokenizer:()=>de,defaults:()=>i,getDefaults:()=>l,lexer:()=>Be,marked:()=>Se,options:()=>Te,parse:()=>Ie,parseInline:()=>Pe,parser:()=>Le,setOptions:()=>ze,use:()=>Ae,walkTokens:()=>_e});var i={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};function a(e){i=e}var o={exec:()=>null};function c(e,t=""){let n="string"==typeof e?e:e.source,r={replace:(e,t)=>{let s="string"==typeof t?t:t.source;return s=s.replace(p.caret,"$1"),n=n.replace(e,s),r},getRegex:()=>new RegExp(n,t)};return r}var h=(()=>{try{return!!new RegExp("(?<=1)(?<!1)")}catch{return!1}})(),p={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] +\S/,listReplaceTask:/^\[[ xX]\] +/,listTaskCheckbox:/\[[ xX]\]/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:e=>new RegExp(`^( {0,3}${e})((?:[\t ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ \t][^\\n]*)?(?:\\n|$))`),hrRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}#`),htmlBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}<(?:[a-z].*>|!--)`,"i"),blockquoteBeginRegex:e=>new RegExp(`^ {0,${Math.min(3,e-1)}}>`)},u=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,g=/ {0,3}(?:[*+-]|\d{1,9}[.)])/,k=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,d=c(k).replace(/bull/g,g).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),f=c(k).replace(/bull/g,g).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),x=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,b=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,w=c(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",b).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),m=c(/^(bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,g).getRegex(),y="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",$=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,S=c("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ \t]*)+\\n|$))","i").replace("comment",$).replace("tag",y).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),R=c(x).replace("hr",u).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y).getRegex(),T={blockquote:c(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",R).getRegex(),code:/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,def:w,fences:/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,heading:/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,hr:u,html:S,lheading:d,list:m,newline:/^(?:[ \t]*(?:\n|$))+/,paragraph:R,table:o,text:/^[^\n]+/},z=c("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",u).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}\t)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y).getRegex(),A={...T,lheading:f,table:z,paragraph:c(x).replace("hr",u).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",z).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)])[ \\t]").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",y).getRegex()},_={...T,html:c("^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:\"[^\"]*\"|'[^']*'|\\s[^'\"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))").replace("comment",$).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:o,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:c(x).replace("hr",u).replace("heading"," *#{1,6} *[^\n]").replace("lheading",d).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},P=/^( {2,}|\\)\n(?!\s*$)/,I=/[\p{P}\p{S}]/u,L=/[\s\p{P}\p{S}]/u,B=/[^\s\p{P}\p{S}]/u,C=c(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,L).getRegex(),q=/(?!~)[\p{P}\p{S}]/u,E=/(?![*_])[\p{P}\p{S}]/u,v=c(/link|precode-code|html/,"g").replace("link",/\[(?:[^\[\]`]|(?<a>`+)[^`]+\k<a>(?!`))*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)/).replace("precode-",h?"(?<!`)()":"(^^|[^`])").replace("code",/(?<b>`+)[^`]+\k<b>(?!`)/).replace("html",/<(?! )[^<>]*?>/).getRegex(),Z=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,D=c(Z,"u").replace(/punct/g,I).getRegex(),M=c(Z,"u").replace(/punct/g,q).getRegex(),O="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",Q=c(O,"gu").replace(/notPunctSpace/g,B).replace(/punctSpace/g,L).replace(/punct/g,I).getRegex(),j=c(O,"gu").replace(/notPunctSpace/g,/(?:[^\s\p{P}\p{S}]|~)/u).replace(/punctSpace/g,/(?!~)[\s\p{P}\p{S}]/u).replace(/punct/g,q).getRegex(),H=c("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,B).replace(/punctSpace/g,L).replace(/punct/g,I).getRegex(),N=c(/^~~?(?:((?!~)punct)|[^\s~])/,"u").replace(/punct/g,E).getRegex(),G=c("^[^~]+(?=[^~])|(?!~)punct(~~?)(?=[\\s]|$)|notPunctSpace(~~?)(?!~)(?=punctSpace|$)|(?!~)punctSpace(~~?)(?=notPunctSpace)|[\\s](~~?)(?!~)(?=punct)|(?!~)punct(~~?)(?!~)(?=punct)|notPunctSpace(~~?)(?=notPunctSpace)","gu").replace(/notPunctSpace/g,/(?:[^\s\p{P}\p{S}]|[*_])/u).replace(/punctSpace/g,/(?![*_])[\s\p{P}\p{S}]/u).replace(/punct/g,E).getRegex(),X=c(/\\(punct)/,"gu").replace(/punct/g,I).getRegex(),W=c(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),F=c($).replace("(?:--\x3e|$)","--\x3e").getRegex(),U=c("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",F).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),J=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`+[^`]*?`+(?!`)|[^\[\]\\`])*?/,K=c(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]+(?:\n[ \t]*)?|\n[ \t]*)(title))?\s*\)/).replace("label",J).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),V=c(/^!?\[(label)\]\[(ref)\]/).replace("label",J).replace("ref",b).getRegex(),Y=c(/^!?\[(ref)\](?:\[\])?/).replace("ref",b).getRegex(),ee=/[hH][tT][tT][pP][sS]?|[fF][tT][pP]/,te={_backpedal:o,anyPunctuation:X,autolink:W,blockSkip:v,br:P,code:/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,del:o,delLDelim:o,delRDelim:o,emStrongLDelim:D,emStrongRDelimAst:Q,emStrongRDelimUnd:H,escape:/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,link:K,nolink:Y,punctuation:C,reflink:V,reflinkSearch:c("reflink|nolink(?!\\()","g").replace("reflink",V).replace("nolink",Y).getRegex(),tag:U,text:/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,url:o},ne={...te,link:c(/^!?\[(label)\]\((.*?)\)/).replace("label",J).getRegex(),reflink:c(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",J).getRegex()},re={...te,emStrongRDelimAst:j,emStrongLDelim:M,delLDelim:N,delRDelim:G,url:c(/^((?:protocol):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/).replace("protocol",ee).replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:c(/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|protocol:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/).replace("protocol",ee).getRegex()},se={...re,br:c(P).replace("{2,}","*").getRegex(),text:c(re.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},le={normal:T,gfm:A,pedantic:_},ie={normal:te,gfm:re,breaks:se,pedantic:ne},ae={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},oe=e=>ae[e];function ce(e,t){if(t){if(p.escapeTest.test(e))return e.replace(p.escapeReplace,oe)}else if(p.escapeTestNoEncode.test(e))return e.replace(p.escapeReplaceNoEncode,oe);return e}function he(e){try{e=encodeURI(e).replace(p.percentDecode,"%")}catch{return null}return e}function pe(e,t){let n=e.replace(p.findPipe,(e,t,n)=>{let r=!1,s=t;for(;--s>=0&&"\\"===n[s];)r=!r;return r?"|":" |"}).split(p.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),t)if(n.length>t)n.splice(t);else for(;n.length<t;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(p.slashPipe,"|");return n}function ue(e,t,n){let r=e.length;if(0===r)return"";let s=0;for(;s<r;){let l=e.charAt(r-s-1);if(l!==t||n){if(l===t||!n)break;s++}else s++}return e.slice(0,r-s)}function ge(e,t=0){let n=t,r="";for(let t of e)if("\t"===t){let e=4-n%4;r+=" ".repeat(e),n+=e}else r+=t,n++;return r}function ke(e,t,n,r,s){let l=t.href,i=t.title||null,a=e[1].replace(s.other.outputLinkReplace,"$1");r.state.inLink=!0;let o={type:"!"===e[0].charAt(0)?"image":"link",raw:n,href:l,title:i,text:a,tokens:r.inlineTokens(a)};return r.state.inLink=!1,o}var de=class{options;rules;lexer;constructor(e){this.options=e||i}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let e=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?e:ue(e,"\n")}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let e=t[0],n=function(e,t,n){let r=e.match(n.other.indentCodeCompensation);if(null===r)return t;let s=r[1];return t.split("\n").map(e=>{let t=e.match(n.other.beginningSpace);if(null===t)return e;let[r]=t;return r.length>=s.length?e.slice(s.length):e}).join("\n")}(e,t[3]||"",this.rules);return{type:"code",raw:e,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:n}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let e=t[2].trim();if(this.rules.other.endingHash.test(e)){let t=ue(e,"#");(this.options.pedantic||!t||this.rules.other.endingSpaceChar.test(t))&&(e=t.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:e,tokens:this.lexer.inline(e)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:ue(t[0],"\n")}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let e=ue(t[0],"\n").split("\n"),n="",r="",s=[];for(;e.length>0;){let t,l=!1,i=[];for(t=0;t<e.length;t++)if(this.rules.other.blockquoteStart.test(e[t]))i.push(e[t]),l=!0;else{if(l)break;i.push(e[t])}e=e.slice(t);let a=i.join("\n"),o=a.replace(this.rules.other.blockquoteSetextReplace,"\n    $1").replace(this.rules.other.blockquoteSetextReplace2,"");n=n?`${n}\n${a}`:a,r=r?`${r}\n${o}`:o;let c=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(o,s,!0),this.lexer.state.top=c,0===e.length)break;let h=s.at(-1);if("code"===h?.type)break;if("blockquote"===h?.type){let t=h,l=t.raw+"\n"+e.join("\n"),i=this.blockquote(l);s[s.length-1]=i,n=n.substring(0,n.length-t.raw.length)+i.raw,r=r.substring(0,r.length-t.text.length)+i.text;break}if("list"===h?.type){let t=h,l=t.raw+"\n"+e.join("\n"),i=this.list(l);s[s.length-1]=i,n=n.substring(0,n.length-h.raw.length)+i.raw,r=r.substring(0,r.length-t.raw.length)+i.raw,e=l.substring(s.at(-1).raw.length).split("\n");continue}}return{type:"blockquote",raw:n,tokens:s,text:r}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,s={type:"list",raw:"",ordered:r,start:r?+n.slice(0,-1):"",loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:"[*+-]");let l=this.rules.other.listItemRegex(n),i=!1;for(;e;){let n=!1,r="",a="";if(!(t=l.exec(e))||this.rules.block.hr.test(e))break;r=t[0],e=e.substring(r.length);let o=ge(t[2].split("\n",1)[0],t[1].length),c=e.split("\n",1)[0],h=!o.trim(),p=0;if(this.options.pedantic?(p=2,a=o.trimStart()):h?p=t[1].length+1:(p=o.search(this.rules.other.nonSpaceChar),p=p>4?1:p,a=o.slice(p),p+=t[1].length),h&&this.rules.other.blankLine.test(c)&&(r+=c+"\n",e=e.substring(c.length+1),n=!0),!n){let t=this.rules.other.nextBulletRegex(p),n=this.rules.other.hrRegex(p),s=this.rules.other.fencesBeginRegex(p),l=this.rules.other.headingBeginRegex(p),i=this.rules.other.htmlBeginRegex(p),u=this.rules.other.blockquoteBeginRegex(p);for(;e;){let g,k=e.split("\n",1)[0];if(c=k,this.options.pedantic?(c=c.replace(this.rules.other.listReplaceNesting,"  "),g=c):g=c.replace(this.rules.other.tabCharGlobal,"    "),s.test(c)||l.test(c)||i.test(c)||u.test(c)||t.test(c)||n.test(c))break;if(g.search(this.rules.other.nonSpaceChar)>=p||!c.trim())a+="\n"+g.slice(p);else{if(h||o.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||s.test(o)||l.test(o)||n.test(o))break;a+="\n"+c}h=!c.trim(),r+=k+"\n",e=e.substring(k.length+1),o=g.slice(p)}}s.loose||(i?s.loose=!0:this.rules.other.doubleBlankLine.test(r)&&(i=!0)),s.items.push({type:"list_item",raw:r,task:!!this.options.gfm&&this.rules.other.listIsTask.test(a),loose:!1,text:a,tokens:[]}),s.raw+=r}let a=s.items.at(-1);if(!a)return;a.raw=a.raw.trimEnd(),a.text=a.text.trimEnd(),s.raw=s.raw.trimEnd();for(let e of s.items){if(this.lexer.state.top=!1,e.tokens=this.lexer.blockTokens(e.text,[]),e.task){if(e.text=e.text.replace(this.rules.other.listReplaceTask,""),"text"===e.tokens[0]?.type||"paragraph"===e.tokens[0]?.type){e.tokens[0].raw=e.tokens[0].raw.replace(this.rules.other.listReplaceTask,""),e.tokens[0].text=e.tokens[0].text.replace(this.rules.other.listReplaceTask,"");for(let e=this.lexer.inlineQueue.length-1;e>=0;e--)if(this.rules.other.listIsTask.test(this.lexer.inlineQueue[e].src)){this.lexer.inlineQueue[e].src=this.lexer.inlineQueue[e].src.replace(this.rules.other.listReplaceTask,"");break}}let t=this.rules.other.listTaskCheckbox.exec(e.raw);if(t){let n={type:"checkbox",raw:t[0]+" ",checked:"[ ]"!==t[0]};e.checked=n.checked,s.loose?e.tokens[0]&&["paragraph","text"].includes(e.tokens[0].type)&&"tokens"in e.tokens[0]&&e.tokens[0].tokens?(e.tokens[0].raw=n.raw+e.tokens[0].raw,e.tokens[0].text=n.raw+e.tokens[0].text,e.tokens[0].tokens.unshift(n)):e.tokens.unshift({type:"paragraph",raw:n.raw,text:n.raw,tokens:[n]}):e.tokens.unshift(n)}}if(!s.loose){let t=e.tokens.filter(e=>"space"===e.type),n=t.length>0&&t.some(e=>this.rules.other.anyLine.test(e.raw));s.loose=n}}if(s.loose)for(let e of s.items){e.loose=!0;for(let t of e.tokens)"text"===t.type&&(t.type="paragraph")}return s}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:"pre"===t[1]||"script"===t[1]||"style"===t[1],text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let e=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),n=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",r=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:e,raw:t[0],href:n,title:r}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=pe(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),s=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split("\n"):[],l={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let e of r)this.rules.other.tableAlignRight.test(e)?l.align.push("right"):this.rules.other.tableAlignCenter.test(e)?l.align.push("center"):this.rules.other.tableAlignLeft.test(e)?l.align.push("left"):l.align.push(null);for(let e=0;e<n.length;e++)l.header.push({text:n[e],tokens:this.lexer.inline(n[e]),header:!0,align:l.align[e]});for(let e of s)l.rows.push(pe(e,l.header.length).map((e,t)=>({text:e,tokens:this.lexer.inline(e),header:!1,align:l.align[t]})));return l}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:"="===t[2].charAt(0)?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let e="\n"===t[1].charAt(t[1].length-1)?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:e,tokens:this.lexer.inline(e)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let e=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(e)){if(!this.rules.other.endAngleBracket.test(e))return;let t=ue(e.slice(0,-1),"\\");if((e.length-t.length)%2==0)return}else{let e=function(e,t){if(-1===e.indexOf(t[1]))return-1;let n=0;for(let r=0;r<e.length;r++)if("\\"===e[r])r++;else if(e[r]===t[0])n++;else if(e[r]===t[1]&&(n--,n<0))return r;return n>0?-2:-1}(t[2],"()");if(-2===e)return;if(e>-1){let n=(0===t[0].indexOf("!")?5:4)+t[1].length+e;t[2]=t[2].substring(0,e),t[0]=t[0].substring(0,n).trim(),t[3]=""}}let n=t[2],r="";if(this.options.pedantic){let e=this.rules.other.pedanticHrefTitle.exec(n);e&&(n=e[1],r=e[3])}else r=t[3]?t[3].slice(1,-1):"";return n=n.trim(),this.rules.other.startAngleBracket.test(n)&&(n=this.options.pedantic&&!this.rules.other.endAngleBracket.test(e)?n.slice(1):n.slice(1,-1)),ke(t,{href:n&&n.replace(this.rules.inline.anyPunctuation,"$1"),title:r&&r.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let e=t[(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," ").toLowerCase()];if(!e){let e=n[0].charAt(0);return{type:"text",raw:e,text:e}}return ke(n,e,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let r=this.rules.inline.emStrongLDelim.exec(e);if(!(!r||r[3]&&n.match(this.rules.other.unicodeAlphaNumeric))&&(!r[1]&&!r[2]||!n||this.rules.inline.punctuation.exec(n))){let n,s,l=[...r[0]].length-1,i=l,a=0,o="*"===r[0][0]?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(o.lastIndex=0,t=t.slice(-1*e.length+l);null!=(r=o.exec(t));){if(n=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!n)continue;if(s=[...n].length,r[3]||r[4]){i+=s;continue}if((r[5]||r[6])&&l%3&&!((l+s)%3)){a+=s;continue}if(i-=s,i>0)continue;s=Math.min(s,s+i+a);let t=[...r[0]][0].length,o=e.slice(0,l+r.index+t+s);if(Math.min(l,s)%2){let e=o.slice(1,-1);return{type:"em",raw:o,text:e,tokens:this.lexer.inlineTokens(e)}}let c=o.slice(2,-2);return{type:"strong",raw:o,text:c,tokens:this.lexer.inlineTokens(c)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let e=t[2].replace(this.rules.other.newLineCharGlobal," "),n=this.rules.other.nonSpaceChar.test(e),r=this.rules.other.startingSpaceChar.test(e)&&this.rules.other.endingSpaceChar.test(e);return n&&r&&(e=e.substring(1,e.length-1)),{type:"codespan",raw:t[0],text:e}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e,t,n=""){let r=this.rules.inline.delLDelim.exec(e);if(r&&(!r[1]||!n||this.rules.inline.punctuation.exec(n))){let n,s,l=[...r[0]].length-1,i=l,a=this.rules.inline.delRDelim;for(a.lastIndex=0,t=t.slice(-1*e.length+l);null!=(r=a.exec(t));){if(n=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!n||(s=[...n].length,s!==l))continue;if(r[3]||r[4]){i+=s;continue}if(i-=s,i>0)continue;s=Math.min(s,s+i);let t=[...r[0]][0].length,a=e.slice(0,l+r.index+t+s),o=a.slice(l,-l);return{type:"del",raw:a,text:o,tokens:this.lexer.inlineTokens(o)}}}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let e,n;return"@"===t[2]?(e=t[1],n="mailto:"+e):(e=t[1],n=e),{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let e,n;if("@"===t[2])e=t[0],n="mailto:"+e;else{let r;do{r=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??""}while(r!==t[0]);e=t[0],n="www."===t[1]?"http://"+t[0]:t[0]}return{type:"link",raw:t[0],text:e,href:n,tokens:[{type:"text",raw:e,text:e}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let e=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:e}}}},fe=class e{tokens;options;state;inlineQueue;tokenizer;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||i,this.options.tokenizer=this.options.tokenizer||new de,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:p,block:le.normal,inline:ie.normal};this.options.pedantic?(t.block=le.pedantic,t.inline=ie.pedantic):this.options.gfm&&(t.block=le.gfm,this.options.breaks?t.inline=ie.breaks:t.inline=ie.gfm),this.tokenizer.rules=t}static get rules(){return{block:le,inline:ie}}static lex(t,n){return new e(n).lex(t)}static lexInline(t,n){return new e(n).inlineTokens(t)}lex(e){e=e.replace(p.carriageReturn,"\n"),this.blockTokens(e,this.tokens);for(let e=0;e<this.inlineQueue.length;e++){let t=this.inlineQueue[e];this.inlineTokens(t.src,t.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.options.pedantic&&(e=e.replace(p.tabCharGlobal,"    ").replace(p.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(n=>!!(r=n.call({lexer:this},e,t))&&(e=e.substring(r.raw.length),t.push(r),!0)))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let n=t.at(-1);1===r.raw.length&&void 0!==n?n.raw+="\n":t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let n=t.at(-1);"paragraph"===n?.type||"text"===n?.type?(n.raw+=(n.raw.endsWith("\n")?"":"\n")+r.raw,n.text+="\n"+r.text,this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let n=t.at(-1);"paragraph"===n?.type||"text"===n?.type?(n.raw+=(n.raw.endsWith("\n")?"":"\n")+r.raw,n.text+="\n"+r.raw,this.inlineQueue.at(-1).src=n.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title},t.push(r));continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let s=e;if(this.options.extensions?.startBlock){let t,n=1/0,r=e.slice(1);this.options.extensions.startBlock.forEach(e=>{t=e.call({lexer:this},r),"number"==typeof t&&t>=0&&(n=Math.min(n,t))}),n<1/0&&n>=0&&(s=e.substring(0,n+1))}if(this.state.top&&(r=this.tokenizer.paragraph(s))){let l=t.at(-1);n&&"paragraph"===l?.type?(l.raw+=(l.raw.endsWith("\n")?"":"\n")+r.raw,l.text+="\n"+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=l.text):t.push(r),n=s.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let n=t.at(-1);"text"===n?.type?(n.raw+=(n.raw.endsWith("\n")?"":"\n")+r.raw,n.text+="\n"+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=n.text):t.push(r);continue}if(e){let t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n,r=e,s=null;if(this.tokens.links){let e=Object.keys(this.tokens.links);if(e.length>0)for(;null!=(s=this.tokenizer.rules.inline.reflinkSearch.exec(r));)e.includes(s[0].slice(s[0].lastIndexOf("[")+1,-1))&&(r=r.slice(0,s.index)+"["+"a".repeat(s[0].length-2)+"]"+r.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;null!=(s=this.tokenizer.rules.inline.anyPunctuation.exec(r));)r=r.slice(0,s.index)+"++"+r.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;null!=(s=this.tokenizer.rules.inline.blockSkip.exec(r));)n=s[2]?s[2].length:0,r=r.slice(0,s.index+n)+"["+"a".repeat(s[0].length-n-2)+"]"+r.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);r=this.options.hooks?.emStrongMask?.call({lexer:this},r)??r;let l=!1,i="";for(;e;){let n;if(l||(i=""),l=!1,this.options.extensions?.inline?.some(r=>!!(n=r.call({lexer:this},e,t))&&(e=e.substring(n.raw.length),t.push(n),!0)))continue;if(n=this.tokenizer.escape(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.tag(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.link(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(n.raw.length);let r=t.at(-1);"text"===n.type&&"text"===r?.type?(r.raw+=n.raw,r.text+=n.text):t.push(n);continue}if(n=this.tokenizer.emStrong(e,r,i)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.codespan(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.br(e)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.del(e,r,i)){e=e.substring(n.raw.length),t.push(n);continue}if(n=this.tokenizer.autolink(e)){e=e.substring(n.raw.length),t.push(n);continue}if(!this.state.inLink&&(n=this.tokenizer.url(e))){e=e.substring(n.raw.length),t.push(n);continue}let s=e;if(this.options.extensions?.startInline){let t,n=1/0,r=e.slice(1);this.options.extensions.startInline.forEach(e=>{t=e.call({lexer:this},r),"number"==typeof t&&t>=0&&(n=Math.min(n,t))}),n<1/0&&n>=0&&(s=e.substring(0,n+1))}if(n=this.tokenizer.inlineText(s)){e=e.substring(n.raw.length),"_"!==n.raw.slice(-1)&&(i=n.raw.slice(-1)),l=!0;let r=t.at(-1);"text"===r?.type?(r.raw+=n.raw,r.text+=n.text):t.push(n);continue}if(e){let t="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(t);break}throw new Error(t)}}return t}},xe=class{options;parser;constructor(e){this.options=e||i}space(e){return""}code({text:e,lang:t,escaped:n}){let r=(t||"").match(p.notSpaceStart)?.[0],s=e.replace(p.endingNewline,"")+"\n";return r?'<pre><code class="language-'+ce(r)+'">'+(n?s:ce(s,!0))+"</code></pre>\n":"<pre><code>"+(n?s:ce(s,!0))+"</code></pre>\n"}blockquote({tokens:e}){return`<blockquote>\n${this.parser.parse(e)}</blockquote>\n`}html({text:e}){return e}def(e){return""}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>\n`}hr(e){return"<hr>\n"}list(e){let t=e.ordered,n=e.start,r="";for(let t=0;t<e.items.length;t++){let n=e.items[t];r+=this.listitem(n)}let s=t?"ol":"ul";return"<"+s+(t&&1!==n?' start="'+n+'"':"")+">\n"+r+"</"+s+">\n"}listitem(e){return`<li>${this.parser.parse(e.tokens)}</li>\n`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox"> '}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>\n`}table(e){let t="",n="";for(let t=0;t<e.header.length;t++)n+=this.tablecell(e.header[t]);t+=this.tablerow({text:n});let r="";for(let t=0;t<e.rows.length;t++){let s=e.rows[t];n="";for(let e=0;e<s.length;e++)n+=this.tablecell(s[e]);r+=this.tablerow({text:n})}return r&&(r=`<tbody>${r}</tbody>`),"<table>\n<thead>\n"+t+"</thead>\n"+r+"</table>\n"}tablerow({text:e}){return`<tr>\n${e}</tr>\n`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>\n`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${ce(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),s=he(e);if(null===s)return r;let l='<a href="'+(e=s)+'"';return t&&(l+=' title="'+ce(t)+'"'),l+=">"+r+"</a>",l}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let s=he(e);if(null===s)return ce(n);let l=`<img src="${e=s}" alt="${ce(n)}"`;return t&&(l+=` title="${ce(t)}"`),l+=">",l}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:ce(e.text)}},be=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}checkbox({raw:e}){return e}},we=class e{options;renderer;textRenderer;constructor(e){this.options=e||i,this.options.renderer=this.options.renderer||new xe,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new be}static parse(t,n){return new e(n).parse(t)}static parseInline(t,n){return new e(n).parseInline(t)}parse(e){let t="";for(let n=0;n<e.length;n++){let r=e[n];if(this.options.extensions?.renderers?.[r.type]){let e=r,n=this.options.extensions.renderers[e.type].call({parser:this},e);if(!1!==n||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(e.type)){t+=n||"";continue}}let s=r;switch(s.type){case"space":t+=this.renderer.space(s);break;case"hr":t+=this.renderer.hr(s);break;case"heading":t+=this.renderer.heading(s);break;case"code":t+=this.renderer.code(s);break;case"table":t+=this.renderer.table(s);break;case"blockquote":t+=this.renderer.blockquote(s);break;case"list":t+=this.renderer.list(s);break;case"checkbox":t+=this.renderer.checkbox(s);break;case"html":t+=this.renderer.html(s);break;case"def":t+=this.renderer.def(s);break;case"paragraph":t+=this.renderer.paragraph(s);break;case"text":t+=this.renderer.text(s);break;default:{let e='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return t}parseInline(e,t=this.renderer){let n="";for(let r=0;r<e.length;r++){let s=e[r];if(this.options.extensions?.renderers?.[s.type]){let e=this.options.extensions.renderers[s.type].call({parser:this},s);if(!1!==e||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(s.type)){n+=e||"";continue}}let l=s;switch(l.type){case"escape":case"text":n+=t.text(l);break;case"html":n+=t.html(l);break;case"link":n+=t.link(l);break;case"image":n+=t.image(l);break;case"checkbox":n+=t.checkbox(l);break;case"strong":n+=t.strong(l);break;case"em":n+=t.em(l);break;case"codespan":n+=t.codespan(l);break;case"br":n+=t.br(l);break;case"del":n+=t.del(l);break;default:{let e='Token with "'+l.type+'" type was not found.';if(this.options.silent)return console.error(e),"";throw new Error(e)}}}return n}},me=class{options;block;constructor(e){this.options=e||i}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens","emStrongMask"]);static passThroughHooksRespectAsync=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}emStrongMask(e){return e}provideLexer(){return this.block?fe.lex:fe.lexInline}provideParser(){return this.block?we.parse:we.parseInline}},ye=class{defaults={async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null};options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=we;Renderer=xe;TextRenderer=be;Lexer=fe;Tokenizer=de;Hooks=me;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case"table":{let e=r;for(let r of e.header)n=n.concat(this.walkTokens(r.tokens,t));for(let r of e.rows)for(let e of r)n=n.concat(this.walkTokens(e.tokens,t));break}case"list":{let e=r;n=n.concat(this.walkTokens(e.items,t));break}default:{let e=r;this.defaults.extensions?.childTokens?.[e.type]?this.defaults.extensions.childTokens[e.type].forEach(r=>{let s=e[r].flat(1/0);n=n.concat(this.walkTokens(s,t))}):e.tokens&&(n=n.concat(this.walkTokens(e.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(e=>{let n={...e};if(n.async=this.defaults.async||n.async||!1,e.extensions&&(e.extensions.forEach(e=>{if(!e.name)throw new Error("extension name required");if("renderer"in e){let n=t.renderers[e.name];t.renderers[e.name]=n?function(...t){let r=e.renderer.apply(this,t);return!1===r&&(r=n.apply(this,t)),r}:e.renderer}if("tokenizer"in e){if(!e.level||"block"!==e.level&&"inline"!==e.level)throw new Error("extension level must be 'block' or 'inline'");let n=t[e.level];n?n.unshift(e.tokenizer):t[e.level]=[e.tokenizer],e.start&&("block"===e.level?t.startBlock?t.startBlock.push(e.start):t.startBlock=[e.start]:"inline"===e.level&&(t.startInline?t.startInline.push(e.start):t.startInline=[e.start]))}"childTokens"in e&&e.childTokens&&(t.childTokens[e.name]=e.childTokens)}),n.extensions=t),e.renderer){let t=this.defaults.renderer||new xe(this.defaults);for(let n in e.renderer){if(!(n in t))throw new Error(`renderer '${n}' does not exist`);if(["options","parser"].includes(n))continue;let r=n,s=e.renderer[r],l=t[r];t[r]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=l.apply(t,e)),n||""}}n.renderer=t}if(e.tokenizer){let t=this.defaults.tokenizer||new de(this.defaults);for(let n in e.tokenizer){if(!(n in t))throw new Error(`tokenizer '${n}' does not exist`);if(["options","rules","lexer"].includes(n))continue;let r=n,s=e.tokenizer[r],l=t[r];t[r]=(...e)=>{let n=s.apply(t,e);return!1===n&&(n=l.apply(t,e)),n}}n.tokenizer=t}if(e.hooks){let t=this.defaults.hooks||new me;for(let n in e.hooks){if(!(n in t))throw new Error(`hook '${n}' does not exist`);if(["options","block"].includes(n))continue;let r=n,s=e.hooks[r],l=t[r];me.passThroughHooks.has(n)?t[r]=e=>{if(this.defaults.async&&me.passThroughHooksRespectAsync.has(n))return(async()=>{let n=await s.call(t,e);return l.call(t,n)})();let r=s.call(t,e);return l.call(t,r)}:t[r]=(...e)=>{if(this.defaults.async)return(async()=>{let n=await s.apply(t,e);return!1===n&&(n=await l.apply(t,e)),n})();let n=s.apply(t,e);return!1===n&&(n=l.apply(t,e)),n}}n.hooks=t}if(e.walkTokens){let t=this.defaults.walkTokens,r=e.walkTokens;n.walkTokens=function(e){let n=[];return n.push(r.call(this,e)),t&&(n=n.concat(t.call(this,e))),n}}this.defaults={...this.defaults,...n}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return fe.lex(e,t??this.defaults)}parser(e,t){return we.parse(e,t??this.defaults)}parseMarkdown(e){return(t,n)=>{let r={...n},s={...this.defaults,...r},l=this.onError(!!s.silent,!!s.async);if(!0===this.defaults.async&&!1===r.async)return l(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof t>"u"||null===t)return l(new Error("marked(): input parameter is undefined or null"));if("string"!=typeof t)return l(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(t)+", string expected"));if(s.hooks&&(s.hooks.options=s,s.hooks.block=e),s.async)return(async()=>{let n=s.hooks?await s.hooks.preprocess(t):t,r=await(s.hooks?await s.hooks.provideLexer():e?fe.lex:fe.lexInline)(n,s),l=s.hooks?await s.hooks.processAllTokens(r):r;s.walkTokens&&await Promise.all(this.walkTokens(l,s.walkTokens));let i=await(s.hooks?await s.hooks.provideParser():e?we.parse:we.parseInline)(l,s);return s.hooks?await s.hooks.postprocess(i):i})().catch(l);try{s.hooks&&(t=s.hooks.preprocess(t));let n=(s.hooks?s.hooks.provideLexer():e?fe.lex:fe.lexInline)(t,s);s.hooks&&(n=s.hooks.processAllTokens(n)),s.walkTokens&&this.walkTokens(n,s.walkTokens);let r=(s.hooks?s.hooks.provideParser():e?we.parse:we.parseInline)(n,s);return s.hooks&&(r=s.hooks.postprocess(r)),r}catch(e){return l(e)}}}onError(e,t){return n=>{if(n.message+="\nPlease report this to https://github.com/markedjs/marked.",e){let e="<p>An error occurred:</p><pre>"+ce(n.message+"",!0)+"</pre>";return t?Promise.resolve(e):e}if(t)return Promise.reject(n);throw n}}},$e=new ye;function Se(e,t){return $e.parse(e,t)}Se.options=Se.setOptions=function(e){return $e.setOptions(e),Se.defaults=$e.defaults,a(Se.defaults),Se},Se.getDefaults=l,Se.defaults=i,Se.use=function(...e){return $e.use(...e),Se.defaults=$e.defaults,a(Se.defaults),Se},Se.walkTokens=function(e,t){return $e.walkTokens(e,t)},Se.parseInline=$e.parseInline,Se.Parser=we,Se.parser=we.parse,Se.Renderer=xe,Se.TextRenderer=be,Se.Lexer=fe,Se.lexer=fe.lex,Se.Tokenizer=de,Se.Hooks=me,Se.parse=Se;var Re,Te=Se.options,ze=Se.setOptions,Ae=Se.use,_e=Se.walkTokens,Pe=Se.parseInline,Ie=Se,Le=we.parse,Be=fe.lex;return Re=s,((s,l,i,a)=>{if(l&&"object"==typeof l||"function"==typeof l)for(let o of n(l))!r.call(s,o)&&o!==i&&e(s,o,{get:()=>l[o],enumerable:!(a=t(l,o))||a.enumerable});return s})(e({},"__esModule",{value:!0}),Re)})(); return __docsMarkedBundle.marked; })();
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
```

## 02-external-code/highlight.js-11.11.1/LICENSE

- bytes: 1514
- language: text

```text
BSD 3-Clause License

Copyright (c) 2006, Ivan Sagalaev.
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this
  list of conditions and the following disclaimer.

* Redistributions in binary form must reproduce the above copyright notice,
  this list of conditions and the following disclaimer in the documentation
  and/or other materials provided with the distribution.

* Neither the name of the copyright holder nor the names of its
  contributors may be used to endorse or promote products derived from
  this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
```

## 02-external-code/highlight.js-11.11.1/esm-shims/core.js

- bytes: 173
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/core */
export * from "/highlight.js@11.11.1/es2022/lib/core.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/core.mjs";
```

## 02-external-code/highlight.js-11.11.1/esm-shims/javascript.js

- bytes: 221
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/javascript */
export * from "/highlight.js@11.11.1/es2022/lib/languages/javascript.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/languages/javascript.mjs";
```

## 02-external-code/highlight.js-11.11.1/esm-shims/json.js

- bytes: 203
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/json */
export * from "/highlight.js@11.11.1/es2022/lib/languages/json.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/languages/json.mjs";
```

## 02-external-code/highlight.js-11.11.1/esm-shims/xml.js

- bytes: 200
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/xml */
export * from "/highlight.js@11.11.1/es2022/lib/languages/xml.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/languages/xml.mjs";
```

## 02-external-code/highlight.js-11.11.1/modules/README.md

- bytes: 1177
- language: md

```md
# highlight.js 11.11.1 - modules loaded at runtime

main.pjs lazily loads highlight.js from esm.sh with these exact URLs:

| purpose | runtime URL |
| --- | --- |
| core | https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 |
| javascript | https://esm.sh/highlight.js@11.11.1/lib/languages/javascript?target=es2022 |
| json | https://esm.sh/highlight.js@11.11.1/lib/languages/json?target=es2022 |
| xml (html/svg) | https://esm.sh/highlight.js@11.11.1/lib/languages/xml?target=es2022 |

esm-shims/ holds the exact shim bytes those URLs return, e.g.:

```js
/* esm.sh - highlight.js@11.11.1/lib/core */
export * from "/highlight.js@11.11.1/es2022/lib/core.mjs";
export { default } from "/highlight.js@11.11.1/es2022/lib/core.mjs";
```

modules/ holds the bytes of the modules the shims re-export (core.mjs, languages/*.mjs), fetched from the same
origin, so the code that actually executes at runtime is fully captured here.

Language aliases registered at runtime: json5 -> javascript. Source-language map: js/javascript -> javascript,
json/jsonc -> json, json5 -> javascript, html/xml/svg -> xml. Only grammars used by a page are fetched
(loadHighlighter in main.pjs).
```

## 02-external-code/highlight.js-11.11.1/modules/core.mjs

- bytes: 21284
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/core */
var it=Object.create;var be=Object.defineProperty;var st=Object.getOwnPropertyDescriptor;var rt=Object.getOwnPropertyNames;var ct=Object.getPrototypeOf,ot=Object.prototype.hasOwnProperty;var at=(e,t)=>()=>(t||e((t={exports:{}}).exports,t),t.exports);var lt=(e,t,i,l)=>{if(t&&typeof t=="object"||typeof t=="function")for(let d of rt(t))!ot.call(e,d)&&d!==i&&be(e,d,{get:()=>t[d],enumerable:!(l=st(t,d))||l.enumerable});return e};var ut=(e,t,i)=>(i=e!=null?it(ct(e)):{},lt(t||!e||!e.__esModule?be(i,"default",{value:e,enumerable:!0}):i,e));var je=at((tn,Pe)=>{function Re(e){return e instanceof Map?e.clear=e.delete=e.set=function(){throw new Error("map is read-only")}:e instanceof Set&&(e.add=e.clear=e.delete=function(){throw new Error("set is read-only")}),Object.freeze(e),Object.getOwnPropertyNames(e).forEach(t=>{let i=e[t],l=typeof i;(l==="object"||l==="function")&&!Object.isFrozen(i)&&Re(i)}),e}var X=class{constructor(t){t.data===void 0&&(t.data={}),this.data=t.data,this.isMatchIgnored=!1}ignoreMatch(){this.isMatchIgnored=!0}};function Se(e){return e.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#x27;")}function B(e,...t){let i=Object.create(null);for(let l in e)i[l]=e[l];return t.forEach(function(l){for(let d in l)i[d]=l[d]}),i}var ft="</span>",_e=e=>!!e.scope,gt=(e,{prefix:t})=>{if(e.startsWith("language:"))return e.replace("language:","language-");if(e.includes(".")){let i=e.split(".");return[`${t}${i.shift()}`,...i.map((l,d)=>`${l}${"_".repeat(d+1)}`)].join(" ")}return`${t}${e}`},ne=class{constructor(t,i){this.buffer="",this.classPrefix=i.classPrefix,t.walk(this)}addText(t){this.buffer+=Se(t)}openNode(t){if(!_e(t))return;let i=gt(t.scope,{prefix:this.classPrefix});this.span(i)}closeNode(t){_e(t)&&(this.buffer+=ft)}value(){return this.buffer}span(t){this.buffer+=`<span class="${t}">`}},xe=(e={})=>{let t={children:[]};return Object.assign(t,e),t},ie=class e{constructor(){this.rootNode=xe(),this.stack=[this.rootNode]}get top(){return this.stack[this.stack.length-1]}get root(){return this.rootNode}add(t){this.top.children.push(t)}openNode(t){let i=xe({scope:t});this.add(i),this.stack.push(i)}closeNode(){if(this.stack.length>1)return this.stack.pop()}closeAllNodes(){for(;this.closeNode(););}toJSON(){return JSON.stringify(this.rootNode,null,4)}walk(t){return this.constructor._walk(t,this.rootNode)}static _walk(t,i){return typeof i=="string"?t.addText(i):i.children&&(t.openNode(i),i.children.forEach(l=>this._walk(t,l)),t.closeNode(i)),t}static _collapse(t){typeof t!="string"&&t.children&&(t.children.every(i=>typeof i=="string")?t.children=[t.children.join("")]:t.children.forEach(i=>{e._collapse(i)}))}},se=class extends ie{constructor(t){super(),this.options=t}addText(t){t!==""&&this.add(t)}startScope(t){this.openNode(t)}endScope(){this.closeNode()}__addSublanguage(t,i){let l=t.root;i&&(l.scope=`language:${i}`),this.add(l)}toHTML(){return new ne(this,this.options).value()}finalize(){return this.closeAllNodes(),!0}};function H(e){return e?typeof e=="string"?e:e.source:null}function Ne(e){return C("(?=",e,")")}function ht(e){return C("(?:",e,")*")}function pt(e){return C("(?:",e,")?")}function C(...e){return e.map(i=>H(i)).join("")}function dt(e){let t=e[e.length-1];return typeof t=="object"&&t.constructor===Object?(e.splice(e.length-1,1),t):{}}function ce(...e){return"("+(dt(e).capture?"":"?:")+e.map(l=>H(l)).join("|")+")"}function Ae(e){return new RegExp(e.toString()+"|").exec("").length-1}function Et(e,t){let i=e&&e.exec(t);return i&&i.index===0}var bt=/\[(?:[^\\\]]|\\.)*\]|\(\??|\\([1-9][0-9]*)|\\./;function oe(e,{joinWith:t}){let i=0;return e.map(l=>{i+=1;let d=i,_=H(l),c="";for(;_.length>0;){let r=bt.exec(_);if(!r){c+=_;break}c+=_.substring(0,r.index),_=_.substring(r.index+r[0].length),r[0][0]==="\\"&&r[1]?c+="\\"+String(Number(r[1])+d):(c+=r[0],r[0]==="("&&i++)}return c}).map(l=>`(${l})`).join(t)}var _t=/\b\B/,ke="[a-zA-Z]\\w*",ae="[a-zA-Z_]\\w*",Ie="\\b\\d+(\\.\\d+)?",Te="(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)",Be="\\b(0b[01]+)",xt="!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~",Mt=(e={})=>{let t=/^#![ ]*\//;return e.binary&&(e.begin=C(t,/.*\b/,e.binary,/\b.*/)),B({scope:"meta",begin:t,end:/$/,relevance:0,"on:begin":(i,l)=>{i.index!==0&&l.ignoreMatch()}},e)},U={begin:"\\\\[\\s\\S]",relevance:0},wt={scope:"string",begin:"'",end:"'",illegal:"\\n",contains:[U]},Ot={scope:"string",begin:'"',end:'"',illegal:"\\n",contains:[U]},yt={begin:/\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|they|like|more)\b/},Z=function(e,t,i={}){let l=B({scope:"comment",begin:e,end:t,contains:[]},i);l.contains.push({scope:"doctag",begin:"[ ]*(?=(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):)",end:/(TODO|FIXME|NOTE|BUG|OPTIMIZE|HACK|XXX):/,excludeBegin:!0,relevance:0});let d=ce("I","a","is","so","us","to","at","if","in","it","on",/[A-Za-z]+['](d|ve|re|ll|t|s|n)/,/[A-Za-z]+[-][a-z]+/,/[A-Za-z][a-z]{2,}/);return l.contains.push({begin:C(/[ ]+/,"(",d,/[.]?[:]?([.][ ]|[ ])/,"){3}")}),l},Rt=Z("//","$"),St=Z("/\\*","\\*/"),Nt=Z("#","$"),At={scope:"number",begin:Ie,relevance:0},kt={scope:"number",begin:Te,relevance:0},It={scope:"number",begin:Be,relevance:0},Tt={scope:"regexp",begin:/\/(?=[^/\n]*\/)/,end:/\/[gimuy]*/,contains:[U,{begin:/\[/,end:/\]/,relevance:0,contains:[U]}]},Bt={scope:"title",begin:ke,relevance:0},Dt={scope:"title",begin:ae,relevance:0},vt={begin:"\\.\\s*"+ae,relevance:0},Ct=function(e){return Object.assign(e,{"on:begin":(t,i)=>{i.data._beginMatch=t[1]},"on:end":(t,i)=>{i.data._beginMatch!==t[1]&&i.ignoreMatch()}})},F=Object.freeze({__proto__:null,APOS_STRING_MODE:wt,BACKSLASH_ESCAPE:U,BINARY_NUMBER_MODE:It,BINARY_NUMBER_RE:Be,COMMENT:Z,C_BLOCK_COMMENT_MODE:St,C_LINE_COMMENT_MODE:Rt,C_NUMBER_MODE:kt,C_NUMBER_RE:Te,END_SAME_AS_BEGIN:Ct,HASH_COMMENT_MODE:Nt,IDENT_RE:ke,MATCH_NOTHING_RE:_t,METHOD_GUARD:vt,NUMBER_MODE:At,NUMBER_RE:Ie,PHRASAL_WORDS_MODE:yt,QUOTE_STRING_MODE:Ot,REGEXP_MODE:Tt,RE_STARTERS_RE:xt,SHEBANG:Mt,TITLE_MODE:Bt,UNDERSCORE_IDENT_RE:ae,UNDERSCORE_TITLE_MODE:Dt});function Lt(e,t){e.input[e.index-1]==="."&&t.ignoreMatch()}function Pt(e,t){e.className!==void 0&&(e.scope=e.className,delete e.className)}function jt(e,t){t&&e.beginKeywords&&(e.begin="\\b("+e.beginKeywords.split(" ").join("|")+")(?!\\.)(?=\\b|\\s)",e.__beforeBegin=Lt,e.keywords=e.keywords||e.beginKeywords,delete e.beginKeywords,e.relevance===void 0&&(e.relevance=0))}function Ht(e,t){Array.isArray(e.illegal)&&(e.illegal=ce(...e.illegal))}function Ut(e,t){if(e.match){if(e.begin||e.end)throw new Error("begin & end are not supported with match");e.begin=e.match,delete e.match}}function $t(e,t){e.relevance===void 0&&(e.relevance=1)}var Gt=(e,t)=>{if(!e.beforeMatch)return;if(e.starts)throw new Error("beforeMatch cannot be used with starts");let i=Object.assign({},e);Object.keys(e).forEach(l=>{delete e[l]}),e.keywords=i.keywords,e.begin=C(i.beforeMatch,Ne(i.begin)),e.starts={relevance:0,contains:[Object.assign(i,{endsParent:!0})]},e.relevance=0,delete i.beforeMatch},Wt=["of","and","for","in","not","or","if","then","parent","list","value"],Kt="keyword";function De(e,t,i=Kt){let l=Object.create(null);return typeof e=="string"?d(i,e.split(" ")):Array.isArray(e)?d(i,e):Object.keys(e).forEach(function(_){Object.assign(l,De(e[_],t,_))}),l;function d(_,c){t&&(c=c.map(r=>r.toLowerCase())),c.forEach(function(r){let u=r.split("|");l[u[0]]=[_,zt(u[0],u[1])]})}}function zt(e,t){return t?Number(t):Ft(e)?0:1}function Ft(e){return Wt.includes(e.toLowerCase())}var Me={},v=e=>{console.error(e)},we=(e,...t)=>{console.log(`WARN: ${e}`,...t)},L=(e,t)=>{Me[`${e}/${t}`]||(console.log(`Deprecated as of ${e}. ${t}`),Me[`${e}/${t}`]=!0)},Y=new Error;function ve(e,t,{key:i}){let l=0,d=e[i],_={},c={};for(let r=1;r<=t.length;r++)c[r+l]=d[r],_[r+l]=!0,l+=Ae(t[r-1]);e[i]=c,e[i]._emit=_,e[i]._multi=!0}function Xt(e){if(Array.isArray(e.begin)){if(e.skip||e.excludeBegin||e.returnBegin)throw v("skip, excludeBegin, returnBegin not compatible with beginScope: {}"),Y;if(typeof e.beginScope!="object"||e.beginScope===null)throw v("beginScope must be object"),Y;ve(e,e.begin,{key:"beginScope"}),e.begin=oe(e.begin,{joinWith:""})}}function Yt(e){if(Array.isArray(e.end)){if(e.skip||e.excludeEnd||e.returnEnd)throw v("skip, excludeEnd, returnEnd not compatible with endScope: {}"),Y;if(typeof e.endScope!="object"||e.endScope===null)throw v("endScope must be object"),Y;ve(e,e.end,{key:"endScope"}),e.end=oe(e.end,{joinWith:""})}}function Zt(e){e.scope&&typeof e.scope=="object"&&e.scope!==null&&(e.beginScope=e.scope,delete e.scope)}function Jt(e){Zt(e),typeof e.beginScope=="string"&&(e.beginScope={_wrap:e.beginScope}),typeof e.endScope=="string"&&(e.endScope={_wrap:e.endScope}),Xt(e),Yt(e)}function Vt(e){function t(c,r){return new RegExp(H(c),"m"+(e.case_insensitive?"i":"")+(e.unicodeRegex?"u":"")+(r?"g":""))}class i{constructor(){this.matchIndexes={},this.regexes=[],this.matchAt=1,this.position=0}addRule(r,u){u.position=this.position++,this.matchIndexes[this.matchAt]=u,this.regexes.push([u,r]),this.matchAt+=Ae(r)+1}compile(){this.regexes.length===0&&(this.exec=()=>null);let r=this.regexes.map(u=>u[1]);this.matcherRe=t(oe(r,{joinWith:"|"}),!0),this.lastIndex=0}exec(r){this.matcherRe.lastIndex=this.lastIndex;let u=this.matcherRe.exec(r);if(!u)return null;let w=u.findIndex((j,J)=>J>0&&j!==void 0),x=this.matchIndexes[w];return u.splice(0,w),Object.assign(u,x)}}class l{constructor(){this.rules=[],this.multiRegexes=[],this.count=0,this.lastIndex=0,this.regexIndex=0}getMatcher(r){if(this.multiRegexes[r])return this.multiRegexes[r];let u=new i;return this.rules.slice(r).forEach(([w,x])=>u.addRule(w,x)),u.compile(),this.multiRegexes[r]=u,u}resumingScanAtSamePosition(){return this.regexIndex!==0}considerAll(){this.regexIndex=0}addRule(r,u){this.rules.push([r,u]),u.type==="begin"&&this.count++}exec(r){let u=this.getMatcher(this.regexIndex);u.lastIndex=this.lastIndex;let w=u.exec(r);if(this.resumingScanAtSamePosition()&&!(w&&w.index===this.lastIndex)){let x=this.getMatcher(0);x.lastIndex=this.lastIndex+1,w=x.exec(r)}return w&&(this.regexIndex+=w.position+1,this.regexIndex===this.count&&this.considerAll()),w}}function d(c){let r=new l;return c.contains.forEach(u=>r.addRule(u.begin,{rule:u,type:"begin"})),c.terminatorEnd&&r.addRule(c.terminatorEnd,{type:"end"}),c.illegal&&r.addRule(c.illegal,{type:"illegal"}),r}function _(c,r){let u=c;if(c.isCompiled)return u;[Pt,Ut,Jt,Gt].forEach(x=>x(c,r)),e.compilerExtensions.forEach(x=>x(c,r)),c.__beforeBegin=null,[jt,Ht,$t].forEach(x=>x(c,r)),c.isCompiled=!0;let w=null;return typeof c.keywords=="object"&&c.keywords.$pattern&&(c.keywords=Object.assign({},c.keywords),w=c.keywords.$pattern,delete c.keywords.$pattern),w=w||/\w+/,c.keywords&&(c.keywords=De(c.keywords,e.case_insensitive)),u.keywordPatternRe=t(w,!0),r&&(c.begin||(c.begin=/\B|\b/),u.beginRe=t(u.begin),!c.end&&!c.endsWithParent&&(c.end=/\B|\b/),c.end&&(u.endRe=t(u.end)),u.terminatorEnd=H(u.end)||"",c.endsWithParent&&r.terminatorEnd&&(u.terminatorEnd+=(c.end?"|":"")+r.terminatorEnd)),c.illegal&&(u.illegalRe=t(c.illegal)),c.contains||(c.contains=[]),c.contains=[].concat(...c.contains.map(function(x){return qt(x==="self"?c:x)})),c.contains.forEach(function(x){_(x,u)}),c.starts&&_(c.starts,r),u.matcher=d(u),u}if(e.compilerExtensions||(e.compilerExtensions=[]),e.contains&&e.contains.includes("self"))throw new Error("ERR: contains `self` is not supported at the top-level of a language.  See documentation.");return e.classNameAliases=B(e.classNameAliases||{}),_(e)}function Ce(e){return e?e.endsWithParent||Ce(e.starts):!1}function qt(e){return e.variants&&!e.cachedVariants&&(e.cachedVariants=e.variants.map(function(t){return B(e,{variants:null},t)})),e.cachedVariants?e.cachedVariants:Ce(e)?B(e,{starts:e.starts?B(e.starts):null}):Object.isFrozen(e)?B(e):e}var Qt="11.11.1",re=class extends Error{constructor(t,i){super(t),this.name="HTMLInjectionError",this.html=i}},te=Se,Oe=B,ye=Symbol("nomatch"),mt=7,Le=function(e){let t=Object.create(null),i=Object.create(null),l=[],d=!0,_="Could not find the language '{}', did you forget to load/include a language module?",c={disableAutodetect:!0,name:"Plain text",contains:[]},r={ignoreUnescapedHTML:!1,throwUnescapedHTML:!1,noHighlightRe:/^(no-?highlight)$/i,languageDetectRe:/\blang(?:uage)?-([\w-]+)\b/i,classPrefix:"hljs-",cssSelector:"pre code",languages:null,__emitter:se};function u(n){return r.noHighlightRe.test(n)}function w(n){let a=n.className+" ";a+=n.parentNode?n.parentNode.className:"";let h=r.languageDetectRe.exec(a);if(h){let E=I(h[1]);return E||(we(_.replace("{}",h[1])),we("Falling back to no-highlight mode for this block.",n)),E?h[1]:"no-highlight"}return a.split(/\s+/).find(E=>u(E)||I(E))}function x(n,a,h){let E="",M="";typeof a=="object"?(E=n,h=a.ignoreIllegals,M=a.language):(L("10.7.0","highlight(lang, code, ...args) has been deprecated."),L("10.7.0",`Please use highlight(code, options) instead.
https://github.com/highlightjs/highlight.js/issues/2277`),M=n,E=a),h===void 0&&(h=!0);let S={code:E,language:M};G("before:highlight",S);let T=S.result?S.result:j(S.language,S.code,h);return T.code=S.code,G("after:highlight",T),T}function j(n,a,h,E){let M=Object.create(null);function S(s,o){return s.keywords[o]}function T(){if(!f.keywords){O.addText(b);return}let s=0;f.keywordPatternRe.lastIndex=0;let o=f.keywordPatternRe.exec(b),g="";for(;o;){g+=b.substring(s,o.index);let p=A.case_insensitive?o[0].toLowerCase():o[0],y=S(f,p);if(y){let[k,tt]=y;if(O.addText(g),g="",M[p]=(M[p]||0)+1,M[p]<=mt&&(z+=tt),k.startsWith("_"))g+=o[0];else{let nt=A.classNameAliases[k]||k;N(o[0],nt)}}else g+=o[0];s=f.keywordPatternRe.lastIndex,o=f.keywordPatternRe.exec(b)}g+=b.substring(s),O.addText(g)}function W(){if(b==="")return;let s=null;if(typeof f.subLanguage=="string"){if(!t[f.subLanguage]){O.addText(b);return}s=j(f.subLanguage,b,!0,Ee[f.subLanguage]),Ee[f.subLanguage]=s._top}else s=V(b,f.subLanguage.length?f.subLanguage:null);f.relevance>0&&(z+=s.relevance),O.__addSublanguage(s._emitter,s.language)}function R(){f.subLanguage!=null?W():T(),b=""}function N(s,o){s!==""&&(O.startScope(o),O.addText(s),O.endScope())}function ge(s,o){let g=1,p=o.length-1;for(;g<=p;){if(!s._emit[g]){g++;continue}let y=A.classNameAliases[s[g]]||s[g],k=o[g];y?N(k,y):(b=k,T(),b=""),g++}}function he(s,o){return s.scope&&typeof s.scope=="string"&&O.openNode(A.classNameAliases[s.scope]||s.scope),s.beginScope&&(s.beginScope._wrap?(N(b,A.classNameAliases[s.beginScope._wrap]||s.beginScope._wrap),b=""):s.beginScope._multi&&(ge(s.beginScope,o),b="")),f=Object.create(s,{parent:{value:f}}),f}function pe(s,o,g){let p=Et(s.endRe,g);if(p){if(s["on:end"]){let y=new X(s);s["on:end"](o,y),y.isMatchIgnored&&(p=!1)}if(p){for(;s.endsParent&&s.parent;)s=s.parent;return s}}if(s.endsWithParent)return pe(s.parent,o,g)}function Ve(s){return f.matcher.regexIndex===0?(b+=s[0],1):(ee=!0,0)}function qe(s){let o=s[0],g=s.rule,p=new X(g),y=[g.__beforeBegin,g["on:begin"]];for(let k of y)if(k&&(k(s,p),p.isMatchIgnored))return Ve(o);return g.skip?b+=o:(g.excludeBegin&&(b+=o),R(),!g.returnBegin&&!g.excludeBegin&&(b=o)),he(g,s),g.returnBegin?0:o.length}function Qe(s){let o=s[0],g=a.substring(s.index),p=pe(f,s,g);if(!p)return ye;let y=f;f.endScope&&f.endScope._wrap?(R(),N(o,f.endScope._wrap)):f.endScope&&f.endScope._multi?(R(),ge(f.endScope,s)):y.skip?b+=o:(y.returnEnd||y.excludeEnd||(b+=o),R(),y.excludeEnd&&(b=o));do f.scope&&O.closeNode(),!f.skip&&!f.subLanguage&&(z+=f.relevance),f=f.parent;while(f!==p.parent);return p.starts&&he(p.starts,s),y.returnEnd?0:o.length}function me(){let s=[];for(let o=f;o!==A;o=o.parent)o.scope&&s.unshift(o.scope);s.forEach(o=>O.openNode(o))}let K={};function de(s,o){let g=o&&o[0];if(b+=s,g==null)return R(),0;if(K.type==="begin"&&o.type==="end"&&K.index===o.index&&g===""){if(b+=a.slice(o.index,o.index+1),!d){let p=new Error(`0 width match regex (${n})`);throw p.languageName=n,p.badRule=K.rule,p}return 1}if(K=o,o.type==="begin")return qe(o);if(o.type==="illegal"&&!h){let p=new Error('Illegal lexeme "'+g+'" for mode "'+(f.scope||"<unnamed>")+'"');throw p.mode=f,p}else if(o.type==="end"){let p=Qe(o);if(p!==ye)return p}if(o.type==="illegal"&&g==="")return b+=`
`,1;if(m>1e5&&m>o.index*3)throw new Error("potential infinite loop, way more iterations than matches");return b+=g,g.length}let A=I(n);if(!A)throw v(_.replace("{}",n)),new Error('Unknown language: "'+n+'"');let et=Vt(A),Q="",f=E||et,Ee={},O=new r.__emitter(r);me();let b="",z=0,D=0,m=0,ee=!1;try{if(A.__emitTokens)A.__emitTokens(a,O);else{for(f.matcher.considerAll();;){m++,ee?ee=!1:f.matcher.considerAll(),f.matcher.lastIndex=D;let s=f.matcher.exec(a);if(!s)break;let o=a.substring(D,s.index),g=de(o,s);D=s.index+g}de(a.substring(D))}return O.finalize(),Q=O.toHTML(),{language:n,value:Q,relevance:z,illegal:!1,_emitter:O,_top:f}}catch(s){if(s.message&&s.message.includes("Illegal"))return{language:n,value:te(a),illegal:!0,relevance:0,_illegalBy:{message:s.message,index:D,context:a.slice(D-100,D+100),mode:s.mode,resultSoFar:Q},_emitter:O};if(d)return{language:n,value:te(a),illegal:!1,relevance:0,errorRaised:s,_emitter:O,_top:f};throw s}}function J(n){let a={value:te(n),illegal:!1,relevance:0,_top:c,_emitter:new r.__emitter(r)};return a._emitter.addText(n),a}function V(n,a){a=a||r.languages||Object.keys(t);let h=J(n),E=a.filter(I).filter(fe).map(R=>j(R,n,!1));E.unshift(h);let M=E.sort((R,N)=>{if(R.relevance!==N.relevance)return N.relevance-R.relevance;if(R.language&&N.language){if(I(R.language).supersetOf===N.language)return 1;if(I(N.language).supersetOf===R.language)return-1}return 0}),[S,T]=M,W=S;return W.secondBest=T,W}function Ue(n,a,h){let E=a&&i[a]||h;n.classList.add("hljs"),n.classList.add(`language-${E}`)}function q(n){let a=null,h=w(n);if(u(h))return;if(G("before:highlightElement",{el:n,language:h}),n.dataset.highlighted){console.log("Element previously highlighted. To highlight again, first unset `dataset.highlighted`.",n);return}if(n.children.length>0&&(r.ignoreUnescapedHTML||(console.warn("One of your code blocks includes unescaped HTML. This is a potentially serious security risk."),console.warn("https://github.com/highlightjs/highlight.js/wiki/security"),console.warn("The element with unescaped HTML:"),console.warn(n)),r.throwUnescapedHTML))throw new re("One of your code blocks includes unescaped HTML.",n.innerHTML);a=n;let E=a.textContent,M=h?x(E,{language:h,ignoreIllegals:!0}):V(E);n.innerHTML=M.value,n.dataset.highlighted="yes",Ue(n,h,M.language),n.result={language:M.language,re:M.relevance,relevance:M.relevance},M.secondBest&&(n.secondBest={language:M.secondBest.language,relevance:M.secondBest.relevance}),G("after:highlightElement",{el:n,result:M,text:E})}function $e(n){r=Oe(r,n)}let Ge=()=>{$(),L("10.6.0","initHighlighting() deprecated.  Use highlightAll() now.")};function We(){$(),L("10.6.0","initHighlightingOnLoad() deprecated.  Use highlightAll() now.")}let le=!1;function $(){function n(){$()}if(document.readyState==="loading"){le||window.addEventListener("DOMContentLoaded",n,!1),le=!0;return}document.querySelectorAll(r.cssSelector).forEach(q)}function Ke(n,a){let h=null;try{h=a(e)}catch(E){if(v("Language definition for '{}' could not be registered.".replace("{}",n)),d)v(E);else throw E;h=c}h.name||(h.name=n),t[n]=h,h.rawDefinition=a.bind(null,e),h.aliases&&ue(h.aliases,{languageName:n})}function ze(n){delete t[n];for(let a of Object.keys(i))i[a]===n&&delete i[a]}function Fe(){return Object.keys(t)}function I(n){return n=(n||"").toLowerCase(),t[n]||t[i[n]]}function ue(n,{languageName:a}){typeof n=="string"&&(n=[n]),n.forEach(h=>{i[h.toLowerCase()]=a})}function fe(n){let a=I(n);return a&&!a.disableAutodetect}function Xe(n){n["before:highlightBlock"]&&!n["before:highlightElement"]&&(n["before:highlightElement"]=a=>{n["before:highlightBlock"](Object.assign({block:a.el},a))}),n["after:highlightBlock"]&&!n["after:highlightElement"]&&(n["after:highlightElement"]=a=>{n["after:highlightBlock"](Object.assign({block:a.el},a))})}function Ye(n){Xe(n),l.push(n)}function Ze(n){let a=l.indexOf(n);a!==-1&&l.splice(a,1)}function G(n,a){let h=n;l.forEach(function(E){E[h]&&E[h](a)})}function Je(n){return L("10.7.0","highlightBlock will be removed entirely in v12.0"),L("10.7.0","Please use highlightElement now."),q(n)}Object.assign(e,{highlight:x,highlightAuto:V,highlightAll:$,highlightElement:q,highlightBlock:Je,configure:$e,initHighlighting:Ge,initHighlightingOnLoad:We,registerLanguage:Ke,unregisterLanguage:ze,listLanguages:Fe,getLanguage:I,registerAliases:ue,autoDetection:fe,inherit:Oe,addPlugin:Ye,removePlugin:Ze}),e.debugMode=function(){d=!1},e.safeMode=function(){d=!0},e.versionString=Qt,e.regex={concat:C,lookahead:Ne,either:ce,optional:pt,anyNumberOfTimes:ht};for(let n in F)typeof F[n]=="object"&&Re(F[n]);return Object.assign(e,F),e},P=Le({});P.newInstance=()=>Le({});Pe.exports=P;P.HighlightJS=P;P.default=P});var He=ut(je());var nn=He.default;var export_HighlightJS=He.default;export{export_HighlightJS as HighlightJS,nn as default};
//# sourceMappingURL=core.mjs.map
```

## 02-external-code/highlight.js-11.11.1/modules/languages/javascript.mjs

- bytes: 6568
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/javascript */
var p="[A-Za-z$_][0-9A-Za-z$_]*",G=["as","in","of","if","for","while","finally","var","new","function","do","return","void","else","break","catch","instanceof","with","throw","case","default","try","switch","continue","typeof","delete","let","yield","const","class","debugger","async","await","static","import","from","export","extends","using"],K=["true","false","null","undefined","NaN","Infinity"],v=["Object","Function","Boolean","Symbol","Math","Date","Number","BigInt","String","RegExp","Array","Float32Array","Float64Array","Int8Array","Uint8Array","Uint8ClampedArray","Int16Array","Int32Array","Uint16Array","Uint32Array","BigInt64Array","BigUint64Array","Set","Map","WeakSet","WeakMap","ArrayBuffer","SharedArrayBuffer","Atomics","DataView","JSON","Promise","Generator","GeneratorFunction","AsyncFunction","Reflect","Proxy","Intl","WebAssembly"],L=["Error","EvalError","InternalError","RangeError","ReferenceError","SyntaxError","TypeError","URIError"],w=["setInterval","setTimeout","clearInterval","clearTimeout","require","exports","eval","isFinite","isNaN","parseFloat","parseInt","decodeURI","decodeURIComponent","encodeURI","encodeURIComponent","escape","unescape"],H=["arguments","this","super","console","window","document","localStorage","sessionStorage","module","global"],J=[].concat(w,v,L);function X(e){let t=e.regex,B=(a,{after:r})=>{let l="</"+a[0].slice(1);return a.input.indexOf(l,r)!==-1},n=p,A={begin:"<>",end:"</>"},h=/<[A-Za-z0-9\\._:-]+\s*\/>/,o={begin:/<[A-Za-z0-9\\._:-]+/,end:/\/[A-Za-z0-9\\._:-]+>|\/>/,isTrulyOpeningTag:(a,r)=>{let l=a[0].length+a.index,d=a.input[l];if(d==="<"||d===","){r.ignoreMatch();return}d===">"&&(B(a,{after:l})||r.ignoreMatch());let u,M=a.input.substring(l);if(u=M.match(/^\s*=/)){r.ignoreMatch();return}if((u=M.match(/^\s+extends\s+/))&&u.index===0){r.ignoreMatch();return}}},s={$pattern:p,keyword:G,literal:K,built_in:J,"variable.language":H},_="[0-9](_?[0-9])*",E=`\\.(${_})`,N="0|[1-9](_?[0-9])*|0[0-7]*[89][0-9]*",S={className:"number",variants:[{begin:`(\\b(${N})((${E})|\\.)?|(${E}))[eE][+-]?(${_})\\b`},{begin:`\\b(${N})\\b((${E})\\b|\\.)?|(${E})\\b`},{begin:"\\b(0|[1-9](_?[0-9])*)n\\b"},{begin:"\\b0[xX][0-9a-fA-F](_?[0-9a-fA-F])*n?\\b"},{begin:"\\b0[bB][0-1](_?[0-1])*n?\\b"},{begin:"\\b0[oO][0-7](_?[0-7])*n?\\b"},{begin:"\\b0[0-7]+n?\\b"}],relevance:0},c={className:"subst",begin:"\\$\\{",end:"\\}",keywords:s,contains:[]},m={begin:".?html`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,c],subLanguage:"xml"}},T={begin:".?css`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,c],subLanguage:"css"}},f={begin:".?gql`",end:"",starts:{end:"`",returnEnd:!1,contains:[e.BACKSLASH_ESCAPE,c],subLanguage:"graphql"}},R={className:"string",begin:"`",end:"`",contains:[e.BACKSLASH_ESCAPE,c]},g={className:"comment",variants:[e.COMMENT(/\/\*\*(?!\/)/,"\\*/",{relevance:0,contains:[{begin:"(?=@[A-Za-z]+)",relevance:0,contains:[{className:"doctag",begin:"@[A-Za-z]+"},{className:"type",begin:"\\{",end:"\\}",excludeEnd:!0,excludeBegin:!0,relevance:0},{className:"variable",begin:n+"(?=\\s*(-)|$)",endsParent:!0,relevance:0},{begin:/(?=[^\n])\s/,relevance:0}]}]}),e.C_BLOCK_COMMENT_MODE,e.C_LINE_COMMENT_MODE]},y=[e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,m,T,f,R,{match:/\$\d+/},S];c.contains=y.concat({begin:/\{/,end:/\}/,keywords:s,contains:["self"].concat(y)});let I=[].concat(g,c.contains),b=I.concat([{begin:/(\s*)\(/,end:/\)/,keywords:s,contains:["self"].concat(I)}]),i={className:"params",begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:s,contains:b},x={variants:[{match:[/class/,/\s+/,n,/\s+/,/extends/,/\s+/,t.concat(n,"(",t.concat(/\./,n),")*")],scope:{1:"keyword",3:"title.class",5:"keyword",7:"title.class.inherited"}},{match:[/class/,/\s+/,n],scope:{1:"keyword",3:"title.class"}}]},O={relevance:0,match:t.either(/\bJSON/,/\b[A-Z][a-z]+([A-Z][a-z]*|\d)*/,/\b[A-Z]{2,}([A-Z][a-z]+|\d)+([A-Z][a-z]*)*/,/\b[A-Z]{2,}[a-z]+([A-Z][a-z]+|\d)*([A-Z][a-z]*)*/),className:"title.class",keywords:{_:[...v,...L]}},U={label:"use_strict",className:"meta",relevance:10,begin:/^\s*['"]use (strict|asm)['"]/},D={variants:[{match:[/function/,/\s+/,n,/(?=\s*\()/]},{match:[/function/,/\s*(?=\()/]}],className:{1:"keyword",3:"title.function"},label:"func.def",contains:[i],illegal:/%/},k={relevance:0,match:/\b[A-Z][A-Z_0-9]+\b/,className:"variable.constant"};function P(a){return t.concat("(?!",a.join("|"),")")}let $={match:t.concat(/\b/,P([...w,"super","import"].map(a=>`${a}\\s*\\(`)),n,t.lookahead(/\s*\(/)),className:"title.function",relevance:0},Z={begin:t.concat(/\./,t.lookahead(t.concat(n,/(?![0-9A-Za-z$_(])/))),end:n,excludeBegin:!0,keywords:"prototype",className:"property",relevance:0},F={match:[/get|set/,/\s+/,n,/(?=\()/],className:{1:"keyword",3:"title.function"},contains:[{begin:/\(\)/},i]},C="(\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)|"+e.UNDERSCORE_IDENT_RE+")\\s*=>",z={match:[/const|var|let/,/\s+/,n,/\s*/,/=\s*/,/(async\s*)?/,t.lookahead(C)],keywords:"async",className:{1:"keyword",3:"title.function"},contains:[i]};return{name:"JavaScript",aliases:["js","jsx","mjs","cjs"],keywords:s,exports:{PARAMS_CONTAINS:b,CLASS_REFERENCE:O},illegal:/#(?![$_A-z])/,contains:[e.SHEBANG({label:"shebang",binary:"node",relevance:5}),U,e.APOS_STRING_MODE,e.QUOTE_STRING_MODE,m,T,f,R,g,{match:/\$\d+/},S,O,{scope:"attr",match:n+t.lookahead(":"),relevance:0},z,{begin:"("+e.RE_STARTERS_RE+"|\\b(case|return|throw)\\b)\\s*",keywords:"return throw case",relevance:0,contains:[g,e.REGEXP_MODE,{className:"function",begin:C,returnBegin:!0,end:"\\s*=>",contains:[{className:"params",variants:[{begin:e.UNDERSCORE_IDENT_RE,relevance:0},{className:null,begin:/\(\s*\)/,skip:!0},{begin:/(\s*)\(/,end:/\)/,excludeBegin:!0,excludeEnd:!0,keywords:s,contains:b}]}]},{begin:/,/,relevance:0},{match:/\s+/,relevance:0},{variants:[{begin:A.begin,end:A.end},{match:h},{begin:o.begin,"on:begin":o.isTrulyOpeningTag,end:o.end}],subLanguage:"xml",contains:[{begin:o.begin,end:o.end,skip:!0,contains:["self"]}]}]},D,{beginKeywords:"while if switch catch for"},{begin:"\\b(?!function)"+e.UNDERSCORE_IDENT_RE+"\\([^()]*(\\([^()]*(\\([^()]*\\)[^()]*)*\\)[^()]*)*\\)\\s*\\{",returnBegin:!0,label:"func.def",contains:[i,e.inherit(e.TITLE_MODE,{begin:n,className:"title.function"})]},{match:/\.\.\./,relevance:0},Z,{match:"\\$"+n,relevance:0},{match:[/\bconstructor(?=\s*\()/],className:{1:"title.function"},contains:[i]},$,k,x,F,{match:/\$[(.]/}]}}export{X as default};
//# sourceMappingURL=javascript.mjs.map
```

## 02-external-code/highlight.js-11.11.1/modules/languages/json.mjs

- bytes: 501
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/json */
function c(e){let a={className:"attr",begin:/"(\\.|[^\\"\r\n])*"(?=\s*:)/,relevance:1.01},t={match:/[{}[\],:]/,className:"punctuation",relevance:0},n=["true","false","null"],s={scope:"literal",beginKeywords:n.join(" ")};return{name:"JSON",aliases:["jsonc"],keywords:{literal:n},contains:[a,t,e.QUOTE_STRING_MODE,s,e.C_NUMBER_MODE,e.C_LINE_COMMENT_MODE,e.C_BLOCK_COMMENT_MODE],illegal:"\\S"}}export{c as default};
//# sourceMappingURL=json.mjs.map
```

## 02-external-code/highlight.js-11.11.1/modules/languages/xml.mjs

- bytes: 1985
- language: js

```js
/* esm.sh - highlight.js@11.11.1/lib/languages/xml */
function g(n){let e=n.regex,a=e.concat(/[\p{L}_]/u,e.optional(/[\p{L}0-9_.-]*:/u),/[\p{L}0-9_.-]*/u),o=/[\p{L}0-9._:-]+/u,s={className:"symbol",begin:/&[a-z]+;|&#[0-9]+;|&#x[a-f0-9]+;/},t={begin:/\s/,contains:[{className:"keyword",begin:/#?[a-z_][a-z1-9_-]+/,illegal:/\n/}]},r=n.inherit(t,{begin:/\(/,end:/\)/}),l=n.inherit(n.APOS_STRING_MODE,{className:"string"}),c=n.inherit(n.QUOTE_STRING_MODE,{className:"string"}),i={endsWithParent:!0,illegal:/</,relevance:0,contains:[{className:"attr",begin:o,relevance:0},{begin:/=\s*/,relevance:0,contains:[{className:"string",endsParent:!0,variants:[{begin:/"/,end:/"/,contains:[s]},{begin:/'/,end:/'/,contains:[s]},{begin:/[^\s"'=<>`]+/}]}]}]};return{name:"HTML, XML",aliases:["html","xhtml","rss","atom","xjb","xsd","xsl","plist","wsf","svg"],case_insensitive:!0,unicodeRegex:!0,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,relevance:10,contains:[t,c,l,r,{begin:/\[/,end:/\]/,contains:[{className:"meta",begin:/<![a-z]/,end:/>/,contains:[t,r,c,l]}]}]},n.COMMENT(/<!--/,/-->/,{relevance:10}),{begin:/<!\[CDATA\[/,end:/\]\]>/,relevance:10},s,{className:"meta",end:/\?>/,variants:[{begin:/<\?xml/,relevance:10,contains:[c]},{begin:/<\?[a-z][a-z0-9]+/}]},{className:"tag",begin:/<style(?=\s|>)/,end:/>/,keywords:{name:"style"},contains:[i],starts:{end:/<\/style>/,returnEnd:!0,subLanguage:["css","xml"]}},{className:"tag",begin:/<script(?=\s|>)/,end:/>/,keywords:{name:"script"},contains:[i],starts:{end:/<\/script>/,returnEnd:!0,subLanguage:["javascript","handlebars","xml"]}},{className:"tag",begin:/<>|<\/>/},{className:"tag",begin:e.concat(/</,e.lookahead(e.concat(a,e.either(/\/>/,/>/,/\s/)))),end:/\/?>/,contains:[{className:"name",begin:a,relevance:0,starts:i}]},{className:"tag",begin:e.concat(/<\//,e.lookahead(e.concat(a,/>/))),contains:[{className:"name",begin:a,relevance:0},{begin:/>/,relevance:0,endsParent:!0}]}]}}export{g as default};
//# sourceMappingURL=xml.mjs.map
```

## 02-external-code/highlight.js-11.11.1/package.json

- bytes: 3568
- language: json

```json
{
  "name": "highlight.js",
  "description": "Syntax highlighting with language autodetection.",
  "keywords": [
    "highlight",
    "syntax"
  ],
  "homepage": "https://highlightjs.org/",
  "version": "11.11.1",
  "author": "Josh Goebel <hello@joshgoebel.com>",
  "contributors": [
    "Josh Goebel <hello@joshgoebel.com>",
    "Egor Rogov <e.rogov@postgrespro.ru>",
    "Vladimir Jimenez <me@allejo.io>",
    "Ivan Sagalaev <maniac@softwaremaniacs.org>",
    "Jeremy Hull <sourdrums@gmail.com>",
    "Oleg Efimov <efimovov@gmail.com>",
    "Gidi Meir Morris <gidi@gidi.io>",
    "Jan T. Sott <git@idleberg.com>",
    "Li Xuanji <xuanji@gmail.com>",
    "Marcos Cáceres <marcos@marcosc.com>",
    "Sang Dang <sang.dang@polku.io>"
  ],
  "bugs": {
    "url": "https://github.com/highlightjs/highlight.js/issues"
  },
  "license": "BSD-3-Clause",
  "repository": {
    "type": "git",
    "url": "git://github.com/highlightjs/highlight.js.git"
  },
  "type": "commonjs",
  "main": "./lib/index.js",
  "types": "./types/index.d.ts",
  "sideEffects": [
    "./es/common.js",
    "./lib/common.js",
    "*.css",
    "*.scss"
  ],
  "scripts": {
    "mocha": "mocha",
    "lint": "eslint src/*.js src/lib/*.js demo/*.js tools/**/*.js --ignore-pattern vendor",
    "lint-languages": "eslint --no-eslintrc -c .eslintrc.lang.js src/languages/**/*.js",
    "build_and_test": "npm run build && npm run test",
    "build_and_test_browser": "npm run build-browser && npm run test-browser",
    "build": "node ./tools/build.js -t node",
    "build-cdn": "node ./tools/build.js -t cdn",
    "build-browser": "node ./tools/build.js -t browser :common",
    "devtool": "npx http-server",
    "test": "mocha test",
    "test-markup": "mocha test/markup",
    "test-detect": "mocha test/detect",
    "test-browser": "mocha test/browser",
    "test-parser": "mocha test/parser"
  },
  "engines": {
    "node": ">=12.0.0"
  },
  "devDependencies": {
    "@colors/colors": "^1.6.0",
    "@rollup/plugin-commonjs": "^28.0.1",
    "@rollup/plugin-json": "^6.0.1",
    "@rollup/plugin-node-resolve": "^15.3.0",
    "@types/mocha": "^10.0.2",
    "@typescript-eslint/eslint-plugin": "^7.15.0",
    "@typescript-eslint/parser": "^7.15.0",
    "clean-css": "^5.3.2",
    "cli-table": "^0.3.1",
    "commander": "^12.1.0",
    "css": "^3.0.0",
    "css-color-names": "^1.0.1",
    "deep-freeze-es6": "^3.0.2",
    "del": "^8.0.0",
    "dependency-resolver": "^2.0.1",
    "eslint": "^8.57.0",
    "eslint-config-standard": "^17.1.0",
    "eslint-plugin-import": "^2.28.1",
    "eslint-plugin-node": "^11.1.0",
    "eslint-plugin-promise": "^6.1.1",
    "glob": "^8.1.0",
    "glob-promise": "^6.0.5",
    "handlebars": "^4.7.8",
    "http-server": "^14.1.1",
    "jsdom": "^25.0.1",
    "lodash": "^4.17.20",
    "mocha": "^11.0.1",
    "refa": "^0.4.1",
    "rollup": "^4.0.2",
    "should": "^13.2.3",
    "terser": "^5.21.0",
    "tiny-worker": "^2.3.0",
    "typescript": "^5.2.2",
    "wcag-contrast": "^3.0.0"
  },
  "exports": {
    ".": {
      "types": "./types/index.d.ts",
      "require": "./lib/index.js",
      "import": "./es/index.js"
    },
    "./package.json": "./package.json",
    "./lib/common": {
      "require": "./lib/common.js",
      "import": "./es/common.js"
    },
    "./lib/core": {
      "require": "./lib/core.js",
      "import": "./es/core.js"
    },
    "./lib/languages/*": {
      "require": "./lib/languages/*.js",
      "import": "./es/languages/*.js"
    },
    "./scss/*": "./scss/*",
    "./styles/*": "./styles/*",
    "./types/*": "./types/*"
  }
}
```

## 03-third-party-assets/LICENSES.md

- bytes: 641
- language: md

```md
# Third-party attributions

| component | version | license | license file in this package |
| --- | --- | --- | --- |
| marked | bundled, minified (API surface >= 14.1; see PROVENANCE) | MIT | 03-third-party-assets/marked/LICENSE.md |
| highlight.js | 11.11.1 | BSD-3-Clause | 02-external-code/highlight.js-11.11.1/LICENSE |
| Perchance engine / platform | runtime host, not redistributed here | - | - |

The generator's own code (01-internal-code) belongs to the generator author; no license is declared in the source.
Everything under 04-project-resources/examples is third-party generator source fetched from perchance.org for reference.
```

## 03-third-party-assets/marked/LICENSE.md

- bytes: 2942
- language: md

```md
# License information

## Contribution License Agreement

If you contribute code to this project, you are implicitly allowing your code
to be distributed under the MIT license. You are also implicitly verifying that
all code is your original work. `</legalese>`

## Marked

Copyright (c) 2018+, MarkedJS (https://github.com/markedjs/)
Copyright (c) 2011-2018, Christopher Jeffrey (https://github.com/chjj/)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

## Markdown

Copyright © 2004, John Gruber
http://daringfireball.net/
All rights reserved.

Redistribution and use in source and binary forms, with or without modification, are permitted provided that the following conditions are met:

* Redistributions of source code must retain the above copyright notice, this list of conditions and the following disclaimer.
* Redistributions in binary form must reproduce the above copyright notice, this list of conditions and the following disclaimer in the documentation and/or other materials provided with the distribution.
* Neither the name “Markdown” nor the names of its contributors may be used to endorse or promote products derived from this software without specific prior written permission.

This software is provided by the copyright holders and contributors “as is” and any express or implied warranties, including, but not limited to, the implied warranties of merchantability and fitness for a particular purpose are disclaimed. In no event shall the copyright owner or contributors be liable for any direct, indirect, incidental, special, exemplary, or consequential damages (including, but not limited to, procurement of substitute goods or services; loss of use, data, or profits; or business interruption) however caused and on any theory of liability, whether in contract, strict liability, or tort (including negligence or otherwise) arising in any way out of the use of this software, even if advised of the possibility of such damage.
```

## 03-third-party-assets/marked/PROVENANCE.md

- bytes: 1522
- language: md

```md
# Provenance - marked bundle (marked.bundle.min.js)

- File: marked.bundle.min.js (41,791 bytes, one minified IIFE line).
- Origin: extracted byte-exact from 01-internal-code/main.pjs, from the inline statement
  const marked = (() => { var __docsMarkedBundle=(()=>{ ... })(); return __docsMarkedBundle.marked; })();
- Upstream package: marked (npm), https://www.npmjs.com/package/marked - MIT licensed (see LICENSE.md).
- Bundle shape: IIFE assigning the global __docsMarkedBundle, produced by esbuild-style bundling
  (format=iife, globalName=__docsMarkedBundle, minify). API exposed on the object: Hooks, Lexer, Marked,
  Parser, Renderer, TextRenderer, Tokenizer, defaults, getDefaults, lexer, marked, options, parse,
  parseInline, parser, setOptions, use, walkTokens.

## Exact version note

Because the artifact is minified, the upstream version cannot be proven byte-by-byte from this file alone.
A feature probe of the bundle (all present: TextRenderer, processAllTokens, provideLexer, provideParser,
passThroughHooks, walkTokens) matches marked >= 14.1.x and is consistent with the marked 14.1-16.x line.
upstream-reference/marked.esm.js is the unminified ESM build of marked 16.2.1, included FOR REFERENCE ONLY -
it is not verified to be the version that was bundled.

## Reproduce

Re-extract the shipped bytes:

```sh
node 05-build-config/tools/extract-marked-bundle.mjs
```

Rebuild from npm (content-equivalent, not guaranteed byte-identical):

```sh
node 05-build-config/tools/rebuild-marked-bundle.mjs
```
```

## 03-third-party-assets/marked/marked.bundle.min.js

- bytes: 41791
- language: js

```js

```

## 03-third-party-assets/marked/package.json

- bytes: 3397
- language: json

```json
{
  "name": "marked",
  "description": "A markdown parser built for speed",
  "author": "Christopher Jeffrey",
  "version": "16.2.1",
  "type": "module",
  "main": "./lib/marked.esm.js",
  "module": "./lib/marked.esm.js",
  "browser": "./lib/marked.umd.js",
  "types": "./lib/marked.d.ts",
  "bin": {
    "marked": "bin/marked.js"
  },
  "man": "./man/marked.1",
  "files": [
    "bin/",
    "lib/",
    "man/"
  ],
  "exports": {
    ".": {
      "types": "./lib/marked.d.ts",
      "default": "./lib/marked.esm.js"
    },
    "./bin/marked": "./bin/marked.js",
    "./package.json": "./package.json"
  },
  "publishConfig": {
    "provenance": true
  },
  "repository": {
    "type": "git",
    "url": "git://github.com/markedjs/marked.git"
  },
  "homepage": "https://marked.js.org",
  "bugs": {
    "url": "http://github.com/markedjs/marked/issues"
  },
  "license": "MIT",
  "keywords": [
    "markdown",
    "markup",
    "html"
  ],
  "tags": [
    "markdown",
    "markup",
    "html"
  ],
  "devDependencies": {
    "@arethetypeswrong/cli": "^0.18.2",
    "@markedjs/eslint-config": "^1.0.12",
    "@markedjs/testutils": "15.0.11-0",
    "@semantic-release/commit-analyzer": "^13.0.1",
    "@semantic-release/git": "^10.0.1",
    "@semantic-release/github": "^11.0.4",
    "@semantic-release/npm": "^12.0.1",
    "@semantic-release/release-notes-generator": "^14.0.3",
    "cheerio": "1.1.2",
    "commonmark": "0.31.2",
    "cross-env": "^10.0.0",
    "dts-bundle-generator": "^9.5.1",
    "esbuild": "^0.25.9",
    "esbuild-plugin-umd-wrapper": "^3.0.0",
    "eslint": "^9.34.0",
    "highlight.js": "^11.11.1",
    "markdown-it": "14.1.0",
    "marked-highlight": "^2.2.2",
    "marked-man": "^2.1.0",
    "recheck": "^4.5.0",
    "rimraf": "^6.0.1",
    "semantic-release": "^24.2.7",
    "titleize": "^4.0.0",
    "tslib": "^2.8.1",
    "typescript": "5.9.2"
  },
  "scripts": {
    "bench": "npm run build && node test/bench.js",
    "build": "npm run build:esbuild && npm run build:types && npm run build:man",
    "build:docs": "npm run build && node docs/build.js",
    "build:esbuild": "node esbuild.config.js",
    "build:man": "marked-man man/marked.1.md > man/marked.1",
    "build:reset": "rimraf ./lib ./public",
    "build:types": "tsc && dts-bundle-generator --export-referenced-types --project tsconfig.json -o lib/marked.d.ts src/marked.ts",
    "lint": "eslint --fix",
    "rules": "node test/rules.js",
    "test": "npm run build:reset && npm run build:docs && npm run test:specs && npm run test:unit && npm run test:umd && npm run test:cjs && npm run test:types && npm run test:lint",
    "test:cjs": "node test/cjs-test.cjs",
    "test:lint": "eslint",
    "test:only": "npm run build && npm run test:specs:only && npm run test:unit:only",
    "test:redos": "node test/recheck.js > vuln.js",
    "test:specs:only": "node --test --test-only --test-reporter=spec test/run-spec-tests.js",
    "test:specs": "node --test --test-reporter=spec test/run-spec-tests.js",
    "test:types": "tsc --project tsconfig-type-test.json && attw -P --entrypoints . --profile esm-only",
    "test:umd": "node test/umd-test.js",
    "test:unit:only": "node --test --test-only --test-reporter=spec test/unit/*.test.js",
    "test:unit": "node --test --test-reporter=spec test/unit/*.test.js",
    "test:update": "node test/update-specs.js"
  },
  "engines": {
    "node": ">= 20"
  }
}
```

## 03-third-party-assets/marked/upstream-reference/marked.esm.js

- bytes: 39279
- language: js

```js
/**
 * marked v16.2.1 - a markdown parser
 * Copyright (c) 2011-2025, Christopher Jeffrey. (MIT Licensed)
 * https://github.com/markedjs/marked
 */

/**
 * DO NOT EDIT THIS FILE
 * The code in this file is generated from files in ./src/
 */

function L(){return{async:!1,breaks:!1,extensions:null,gfm:!0,hooks:null,pedantic:!1,renderer:null,silent:!1,tokenizer:null,walkTokens:null}}var O=L();function H(l){O=l}var E={exec:()=>null};function h(l,e=""){let t=typeof l=="string"?l:l.source,n={replace:(r,i)=>{let s=typeof i=="string"?i:i.source;return s=s.replace(m.caret,"$1"),t=t.replace(r,s),n},getRegex:()=>new RegExp(t,e)};return n}var m={codeRemoveIndent:/^(?: {1,4}| {0,3}\t)/gm,outputLinkReplace:/\\([\[\]])/g,indentCodeCompensation:/^(\s+)(?:```)/,beginningSpace:/^\s+/,endingHash:/#$/,startingSpaceChar:/^ /,endingSpaceChar:/ $/,nonSpaceChar:/[^ ]/,newLineCharGlobal:/\n/g,tabCharGlobal:/\t/g,multipleSpaceGlobal:/\s+/g,blankLine:/^[ \t]*$/,doubleBlankLine:/\n[ \t]*\n[ \t]*$/,blockquoteStart:/^ {0,3}>/,blockquoteSetextReplace:/\n {0,3}((?:=+|-+) *)(?=\n|$)/g,blockquoteSetextReplace2:/^ {0,3}>[ \t]?/gm,listReplaceTabs:/^\t+/,listReplaceNesting:/^ {1,4}(?=( {4})*[^ ])/g,listIsTask:/^\[[ xX]\] /,listReplaceTask:/^\[[ xX]\] +/,anyLine:/\n.*\n/,hrefBrackets:/^<(.*)>$/,tableDelimiter:/[:|]/,tableAlignChars:/^\||\| *$/g,tableRowBlankLine:/\n[ \t]*$/,tableAlignRight:/^ *-+: *$/,tableAlignCenter:/^ *:-+: *$/,tableAlignLeft:/^ *:-+ *$/,startATag:/^<a /i,endATag:/^<\/a>/i,startPreScriptTag:/^<(pre|code|kbd|script)(\s|>)/i,endPreScriptTag:/^<\/(pre|code|kbd|script)(\s|>)/i,startAngleBracket:/^</,endAngleBracket:/>$/,pedanticHrefTitle:/^([^'"]*[^\s])\s+(['"])(.*)\2/,unicodeAlphaNumeric:/[\p{L}\p{N}]/u,escapeTest:/[&<>"']/,escapeReplace:/[&<>"']/g,escapeTestNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/,escapeReplaceNoEncode:/[<>"']|&(?!(#\d{1,7}|#[Xx][a-fA-F0-9]{1,6}|\w+);)/g,unescapeTest:/&(#(?:\d+)|(?:#x[0-9A-Fa-f]+)|(?:\w+));?/ig,caret:/(^|[^\[])\^/g,percentDecode:/%25/g,findPipe:/\|/g,splitPipe:/ \|/,slashPipe:/\\\|/g,carriageReturn:/\r\n|\r/g,spaceLine:/^ +$/gm,notSpaceStart:/^\S*/,endingNewline:/\n$/,listItemRegex:l=>new RegExp(`^( {0,3}${l})((?:[	 ][^\\n]*)?(?:\\n|$))`),nextBulletRegex:l=>new RegExp(`^ {0,${Math.min(3,l-1)}}(?:[*+-]|\\d{1,9}[.)])((?:[ 	][^\\n]*)?(?:\\n|$))`),hrRegex:l=>new RegExp(`^ {0,${Math.min(3,l-1)}}((?:- *){3,}|(?:_ *){3,}|(?:\\* *){3,})(?:\\n+|$)`),fencesBeginRegex:l=>new RegExp(`^ {0,${Math.min(3,l-1)}}(?:\`\`\`|~~~)`),headingBeginRegex:l=>new RegExp(`^ {0,${Math.min(3,l-1)}}#`),htmlBeginRegex:l=>new RegExp(`^ {0,${Math.min(3,l-1)}}<(?:[a-z].*>|!--)`,"i")},xe=/^(?:[ \t]*(?:\n|$))+/,be=/^((?: {4}| {0,3}\t)[^\n]+(?:\n(?:[ \t]*(?:\n|$))*)?)+/,Re=/^ {0,3}(`{3,}(?=[^`\n]*(?:\n|$))|~{3,})([^\n]*)(?:\n|$)(?:|([\s\S]*?)(?:\n|$))(?: {0,3}\1[~`]* *(?=\n|$)|$)/,C=/^ {0,3}((?:-[\t ]*){3,}|(?:_[ \t]*){3,}|(?:\*[ \t]*){3,})(?:\n+|$)/,Oe=/^ {0,3}(#{1,6})(?=\s|$)(.*)(?:\n+|$)/,j=/(?:[*+-]|\d{1,9}[.)])/,se=/^(?!bull |blockCode|fences|blockquote|heading|html|table)((?:.|\n(?!\s*?\n|bull |blockCode|fences|blockquote|heading|html|table))+?)\n {0,3}(=+|-+) *(?:\n+|$)/,ie=h(se).replace(/bull/g,j).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/\|table/g,"").getRegex(),Te=h(se).replace(/bull/g,j).replace(/blockCode/g,/(?: {4}| {0,3}\t)/).replace(/fences/g,/ {0,3}(?:`{3,}|~{3,})/).replace(/blockquote/g,/ {0,3}>/).replace(/heading/g,/ {0,3}#{1,6}/).replace(/html/g,/ {0,3}<[^\n>]+>\n/).replace(/table/g,/ {0,3}\|?(?:[:\- ]*\|)+[\:\- ]*\n/).getRegex(),F=/^([^\n]+(?:\n(?!hr|heading|lheading|blockquote|fences|list|html|table| +\n)[^\n]+)*)/,we=/^[^\n]+/,Q=/(?!\s*\])(?:\\[\s\S]|[^\[\]\\])+/,ye=h(/^ {0,3}\[(label)\]: *(?:\n[ \t]*)?([^<\s][^\s]*|<.*?>)(?:(?: +(?:\n[ \t]*)?| *\n[ \t]*)(title))? *(?:\n+|$)/).replace("label",Q).replace("title",/(?:"(?:\\"?|[^"\\])*"|'[^'\n]*(?:\n[^'\n]+)*\n?'|\([^()]*\))/).getRegex(),Pe=h(/^( {0,3}bull)([ \t][^\n]+?)?(?:\n|$)/).replace(/bull/g,j).getRegex(),v="address|article|aside|base|basefont|blockquote|body|caption|center|col|colgroup|dd|details|dialog|dir|div|dl|dt|fieldset|figcaption|figure|footer|form|frame|frameset|h[1-6]|head|header|hr|html|iframe|legend|li|link|main|menu|menuitem|meta|nav|noframes|ol|optgroup|option|p|param|search|section|summary|table|tbody|td|tfoot|th|thead|title|tr|track|ul",U=/<!--(?:-?>|[\s\S]*?(?:-->|$))/,Se=h("^ {0,3}(?:<(script|pre|style|textarea)[\\s>][\\s\\S]*?(?:</\\1>[^\\n]*\\n+|$)|comment[^\\n]*(\\n+|$)|<\\?[\\s\\S]*?(?:\\?>\\n*|$)|<![A-Z][\\s\\S]*?(?:>\\n*|$)|<!\\[CDATA\\[[\\s\\S]*?(?:\\]\\]>\\n*|$)|</?(tag)(?: +|\\n|/?>)[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|<(?!script|pre|style|textarea)([a-z][\\w-]*)(?:attribute)*? */?>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$)|</(?!script|pre|style|textarea)[a-z][\\w-]*\\s*>(?=[ \\t]*(?:\\n|$))[\\s\\S]*?(?:(?:\\n[ 	]*)+\\n|$))","i").replace("comment",U).replace("tag",v).replace("attribute",/ +[a-zA-Z:_][\w.:-]*(?: *= *"[^"\n]*"| *= *'[^'\n]*'| *= *[^\s"'=<>`]+)?/).getRegex(),oe=h(F).replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("|table","").replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex(),$e=h(/^( {0,3}> ?(paragraph|[^\n]*)(?:\n|$))+/).replace("paragraph",oe).getRegex(),K={blockquote:$e,code:be,def:ye,fences:Re,heading:Oe,hr:C,html:Se,lheading:ie,list:Pe,newline:xe,paragraph:oe,table:E,text:we},re=h("^ *([^\\n ].*)\\n {0,3}((?:\\| *)?:?-+:? *(?:\\| *:?-+:? *)*(?:\\| *)?)(?:\\n((?:(?! *\\n|hr|heading|blockquote|code|fences|list|html).*(?:\\n|$))*)\\n*|$)").replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("blockquote"," {0,3}>").replace("code","(?: {4}| {0,3}	)[^\\n]").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex(),_e={...K,lheading:Te,table:re,paragraph:h(F).replace("hr",C).replace("heading"," {0,3}#{1,6}(?:\\s|$)").replace("|lheading","").replace("table",re).replace("blockquote"," {0,3}>").replace("fences"," {0,3}(?:`{3,}(?=[^`\\n]*\\n)|~{3,})[^\\n]*\\n").replace("list"," {0,3}(?:[*+-]|1[.)]) ").replace("html","</?(?:tag)(?: +|\\n|/?>)|<(?:script|pre|style|textarea|!--)").replace("tag",v).getRegex()},Le={...K,html:h(`^ *(?:comment *(?:\\n|\\s*$)|<(tag)[\\s\\S]+?</\\1> *(?:\\n{2,}|\\s*$)|<tag(?:"[^"]*"|'[^']*'|\\s[^'"/>\\s]*)*?/?> *(?:\\n{2,}|\\s*$))`).replace("comment",U).replace(/tag/g,"(?!(?:a|em|strong|small|s|cite|q|dfn|abbr|data|time|code|var|samp|kbd|sub|sup|i|b|u|mark|ruby|rt|rp|bdi|bdo|span|br|wbr|ins|del|img)\\b)\\w+(?!:|[^\\w\\s@]*@)\\b").getRegex(),def:/^ *\[([^\]]+)\]: *<?([^\s>]+)>?(?: +(["(][^\n]+[")]))? *(?:\n+|$)/,heading:/^(#{1,6})(.*)(?:\n+|$)/,fences:E,lheading:/^(.+?)\n {0,3}(=+|-+) *(?:\n+|$)/,paragraph:h(F).replace("hr",C).replace("heading",` *#{1,6} *[^
]`).replace("lheading",ie).replace("|table","").replace("blockquote"," {0,3}>").replace("|fences","").replace("|list","").replace("|html","").replace("|tag","").getRegex()},Me=/^\\([!"#$%&'()*+,\-./:;<=>?@\[\]\\^_`{|}~])/,ze=/^(`+)([^`]|[^`][\s\S]*?[^`])\1(?!`)/,ae=/^( {2,}|\\)\n(?!\s*$)/,Ae=/^(`+|[^`])(?:(?= {2,}\n)|[\s\S]*?(?:(?=[\\<!\[`*_]|\b_|$)|[^ ](?= {2,}\n)))/,D=/[\p{P}\p{S}]/u,W=/[\s\p{P}\p{S}]/u,le=/[^\s\p{P}\p{S}]/u,Ee=h(/^((?![*_])punctSpace)/,"u").replace(/punctSpace/g,W).getRegex(),ue=/(?!~)[\p{P}\p{S}]/u,Ce=/(?!~)[\s\p{P}\p{S}]/u,Ie=/(?:[^\s\p{P}\p{S}]|~)/u,Be=/\[[^\[\]]*?\]\((?:\\[\s\S]|[^\\\(\)]|\((?:\\[\s\S]|[^\\\(\)])*\))*\)|`[^`]*?`|<(?! )[^<>]*?>/g,pe=/^(?:\*+(?:((?!\*)punct)|[^\s*]))|^_+(?:((?!_)punct)|([^\s_]))/,qe=h(pe,"u").replace(/punct/g,D).getRegex(),ve=h(pe,"u").replace(/punct/g,ue).getRegex(),ce="^[^_*]*?__[^_*]*?\\*[^_*]*?(?=__)|[^*]+(?=[^*])|(?!\\*)punct(\\*+)(?=[\\s]|$)|notPunctSpace(\\*+)(?!\\*)(?=punctSpace|$)|(?!\\*)punctSpace(\\*+)(?=notPunctSpace)|[\\s](\\*+)(?!\\*)(?=punct)|(?!\\*)punct(\\*+)(?!\\*)(?=punct)|notPunctSpace(\\*+)(?=notPunctSpace)",De=h(ce,"gu").replace(/notPunctSpace/g,le).replace(/punctSpace/g,W).replace(/punct/g,D).getRegex(),Ze=h(ce,"gu").replace(/notPunctSpace/g,Ie).replace(/punctSpace/g,Ce).replace(/punct/g,ue).getRegex(),Ge=h("^[^_*]*?\\*\\*[^_*]*?_[^_*]*?(?=\\*\\*)|[^_]+(?=[^_])|(?!_)punct(_+)(?=[\\s]|$)|notPunctSpace(_+)(?!_)(?=punctSpace|$)|(?!_)punctSpace(_+)(?=notPunctSpace)|[\\s](_+)(?!_)(?=punct)|(?!_)punct(_+)(?!_)(?=punct)","gu").replace(/notPunctSpace/g,le).replace(/punctSpace/g,W).replace(/punct/g,D).getRegex(),He=h(/\\(punct)/,"gu").replace(/punct/g,D).getRegex(),Ne=h(/^<(scheme:[^\s\x00-\x1f<>]*|email)>/).replace("scheme",/[a-zA-Z][a-zA-Z0-9+.-]{1,31}/).replace("email",/[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+(@)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+(?![-_])/).getRegex(),je=h(U).replace("(?:-->|$)","-->").getRegex(),Fe=h("^comment|^</[a-zA-Z][\\w:-]*\\s*>|^<[a-zA-Z][\\w-]*(?:attribute)*?\\s*/?>|^<\\?[\\s\\S]*?\\?>|^<![a-zA-Z]+\\s[\\s\\S]*?>|^<!\\[CDATA\\[[\\s\\S]*?\\]\\]>").replace("comment",je).replace("attribute",/\s+[a-zA-Z:_][\w.:-]*(?:\s*=\s*"[^"]*"|\s*=\s*'[^']*'|\s*=\s*[^\s"'=<>`]+)?/).getRegex(),q=/(?:\[(?:\\[\s\S]|[^\[\]\\])*\]|\\[\s\S]|`[^`]*`|[^\[\]\\`])*?/,Qe=h(/^!?\[(label)\]\(\s*(href)(?:(?:[ \t]*(?:\n[ \t]*)?)(title))?\s*\)/).replace("label",q).replace("href",/<(?:\\.|[^\n<>\\])+>|[^ \t\n\x00-\x1f]*/).replace("title",/"(?:\\"?|[^"\\])*"|'(?:\\'?|[^'\\])*'|\((?:\\\)?|[^)\\])*\)/).getRegex(),he=h(/^!?\[(label)\]\[(ref)\]/).replace("label",q).replace("ref",Q).getRegex(),de=h(/^!?\[(ref)\](?:\[\])?/).replace("ref",Q).getRegex(),Ue=h("reflink|nolink(?!\\()","g").replace("reflink",he).replace("nolink",de).getRegex(),X={_backpedal:E,anyPunctuation:He,autolink:Ne,blockSkip:Be,br:ae,code:ze,del:E,emStrongLDelim:qe,emStrongRDelimAst:De,emStrongRDelimUnd:Ge,escape:Me,link:Qe,nolink:de,punctuation:Ee,reflink:he,reflinkSearch:Ue,tag:Fe,text:Ae,url:E},Ke={...X,link:h(/^!?\[(label)\]\((.*?)\)/).replace("label",q).getRegex(),reflink:h(/^!?\[(label)\]\s*\[([^\]]*)\]/).replace("label",q).getRegex()},N={...X,emStrongRDelimAst:Ze,emStrongLDelim:ve,url:h(/^((?:ftp|https?):\/\/|www\.)(?:[a-zA-Z0-9\-]+\.?)+[^\s<]*|^email/,"i").replace("email",/[A-Za-z0-9._+-]+(@)[a-zA-Z0-9-_]+(?:\.[a-zA-Z0-9-_]*[a-zA-Z0-9])+(?![-_])/).getRegex(),_backpedal:/(?:[^?!.,:;*_'"~()&]+|\([^)]*\)|&(?![a-zA-Z0-9]+;$)|[?!.,:;*_'"~)]+(?!$))+/,del:/^(~~?)(?=[^\s~])((?:\\[\s\S]|[^\\])*?(?:\\[\s\S]|[^\s~\\]))\1(?=[^~]|$)/,text:/^([`~]+|[^`~])(?:(?= {2,}\n)|(?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)|[\s\S]*?(?:(?=[\\<!\[`*~_]|\b_|https?:\/\/|ftp:\/\/|www\.|$)|[^ ](?= {2,}\n)|[^a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-](?=[a-zA-Z0-9.!#$%&'*+\/=?_`{\|}~-]+@)))/},We={...N,br:h(ae).replace("{2,}","*").getRegex(),text:h(N.text).replace("\\b_","\\b_| {2,}\\n").replace(/\{2,\}/g,"*").getRegex()},I={normal:K,gfm:_e,pedantic:Le},M={normal:X,gfm:N,breaks:We,pedantic:Ke};var Xe={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"},ke=l=>Xe[l];function w(l,e){if(e){if(m.escapeTest.test(l))return l.replace(m.escapeReplace,ke)}else if(m.escapeTestNoEncode.test(l))return l.replace(m.escapeReplaceNoEncode,ke);return l}function J(l){try{l=encodeURI(l).replace(m.percentDecode,"%")}catch{return null}return l}function V(l,e){let t=l.replace(m.findPipe,(i,s,o)=>{let a=!1,u=s;for(;--u>=0&&o[u]==="\\";)a=!a;return a?"|":" |"}),n=t.split(m.splitPipe),r=0;if(n[0].trim()||n.shift(),n.length>0&&!n.at(-1)?.trim()&&n.pop(),e)if(n.length>e)n.splice(e);else for(;n.length<e;)n.push("");for(;r<n.length;r++)n[r]=n[r].trim().replace(m.slashPipe,"|");return n}function z(l,e,t){let n=l.length;if(n===0)return"";let r=0;for(;r<n;){let i=l.charAt(n-r-1);if(i===e&&!t)r++;else if(i!==e&&t)r++;else break}return l.slice(0,n-r)}function ge(l,e){if(l.indexOf(e[1])===-1)return-1;let t=0;for(let n=0;n<l.length;n++)if(l[n]==="\\")n++;else if(l[n]===e[0])t++;else if(l[n]===e[1]&&(t--,t<0))return n;return t>0?-2:-1}function fe(l,e,t,n,r){let i=e.href,s=e.title||null,o=l[1].replace(r.other.outputLinkReplace,"$1");n.state.inLink=!0;let a={type:l[0].charAt(0)==="!"?"image":"link",raw:t,href:i,title:s,text:o,tokens:n.inlineTokens(o)};return n.state.inLink=!1,a}function Je(l,e,t){let n=l.match(t.other.indentCodeCompensation);if(n===null)return e;let r=n[1];return e.split(`
`).map(i=>{let s=i.match(t.other.beginningSpace);if(s===null)return i;let[o]=s;return o.length>=r.length?i.slice(r.length):i}).join(`
`)}var y=class{options;rules;lexer;constructor(e){this.options=e||O}space(e){let t=this.rules.block.newline.exec(e);if(t&&t[0].length>0)return{type:"space",raw:t[0]}}code(e){let t=this.rules.block.code.exec(e);if(t){let n=t[0].replace(this.rules.other.codeRemoveIndent,"");return{type:"code",raw:t[0],codeBlockStyle:"indented",text:this.options.pedantic?n:z(n,`
`)}}}fences(e){let t=this.rules.block.fences.exec(e);if(t){let n=t[0],r=Je(n,t[3]||"",this.rules);return{type:"code",raw:n,lang:t[2]?t[2].trim().replace(this.rules.inline.anyPunctuation,"$1"):t[2],text:r}}}heading(e){let t=this.rules.block.heading.exec(e);if(t){let n=t[2].trim();if(this.rules.other.endingHash.test(n)){let r=z(n,"#");(this.options.pedantic||!r||this.rules.other.endingSpaceChar.test(r))&&(n=r.trim())}return{type:"heading",raw:t[0],depth:t[1].length,text:n,tokens:this.lexer.inline(n)}}}hr(e){let t=this.rules.block.hr.exec(e);if(t)return{type:"hr",raw:z(t[0],`
`)}}blockquote(e){let t=this.rules.block.blockquote.exec(e);if(t){let n=z(t[0],`
`).split(`
`),r="",i="",s=[];for(;n.length>0;){let o=!1,a=[],u;for(u=0;u<n.length;u++)if(this.rules.other.blockquoteStart.test(n[u]))a.push(n[u]),o=!0;else if(!o)a.push(n[u]);else break;n=n.slice(u);let p=a.join(`
`),c=p.replace(this.rules.other.blockquoteSetextReplace,`
    $1`).replace(this.rules.other.blockquoteSetextReplace2,"");r=r?`${r}
${p}`:p,i=i?`${i}
${c}`:c;let f=this.lexer.state.top;if(this.lexer.state.top=!0,this.lexer.blockTokens(c,s,!0),this.lexer.state.top=f,n.length===0)break;let k=s.at(-1);if(k?.type==="code")break;if(k?.type==="blockquote"){let x=k,g=x.raw+`
`+n.join(`
`),T=this.blockquote(g);s[s.length-1]=T,r=r.substring(0,r.length-x.raw.length)+T.raw,i=i.substring(0,i.length-x.text.length)+T.text;break}else if(k?.type==="list"){let x=k,g=x.raw+`
`+n.join(`
`),T=this.list(g);s[s.length-1]=T,r=r.substring(0,r.length-k.raw.length)+T.raw,i=i.substring(0,i.length-x.raw.length)+T.raw,n=g.substring(s.at(-1).raw.length).split(`
`);continue}}return{type:"blockquote",raw:r,tokens:s,text:i}}}list(e){let t=this.rules.block.list.exec(e);if(t){let n=t[1].trim(),r=n.length>1,i={type:"list",raw:"",ordered:r,start:r?+n.slice(0,-1):"",loose:!1,items:[]};n=r?`\\d{1,9}\\${n.slice(-1)}`:`\\${n}`,this.options.pedantic&&(n=r?n:"[*+-]");let s=this.rules.other.listItemRegex(n),o=!1;for(;e;){let u=!1,p="",c="";if(!(t=s.exec(e))||this.rules.block.hr.test(e))break;p=t[0],e=e.substring(p.length);let f=t[2].split(`
`,1)[0].replace(this.rules.other.listReplaceTabs,Z=>" ".repeat(3*Z.length)),k=e.split(`
`,1)[0],x=!f.trim(),g=0;if(this.options.pedantic?(g=2,c=f.trimStart()):x?g=t[1].length+1:(g=t[2].search(this.rules.other.nonSpaceChar),g=g>4?1:g,c=f.slice(g),g+=t[1].length),x&&this.rules.other.blankLine.test(k)&&(p+=k+`
`,e=e.substring(k.length+1),u=!0),!u){let Z=this.rules.other.nextBulletRegex(g),ee=this.rules.other.hrRegex(g),te=this.rules.other.fencesBeginRegex(g),ne=this.rules.other.headingBeginRegex(g),me=this.rules.other.htmlBeginRegex(g);for(;e;){let G=e.split(`
`,1)[0],A;if(k=G,this.options.pedantic?(k=k.replace(this.rules.other.listReplaceNesting,"  "),A=k):A=k.replace(this.rules.other.tabCharGlobal,"    "),te.test(k)||ne.test(k)||me.test(k)||Z.test(k)||ee.test(k))break;if(A.search(this.rules.other.nonSpaceChar)>=g||!k.trim())c+=`
`+A.slice(g);else{if(x||f.replace(this.rules.other.tabCharGlobal,"    ").search(this.rules.other.nonSpaceChar)>=4||te.test(f)||ne.test(f)||ee.test(f))break;c+=`
`+k}!x&&!k.trim()&&(x=!0),p+=G+`
`,e=e.substring(G.length+1),f=A.slice(g)}}i.loose||(o?i.loose=!0:this.rules.other.doubleBlankLine.test(p)&&(o=!0));let T=null,Y;this.options.gfm&&(T=this.rules.other.listIsTask.exec(c),T&&(Y=T[0]!=="[ ] ",c=c.replace(this.rules.other.listReplaceTask,""))),i.items.push({type:"list_item",raw:p,task:!!T,checked:Y,loose:!1,text:c,tokens:[]}),i.raw+=p}let a=i.items.at(-1);if(a)a.raw=a.raw.trimEnd(),a.text=a.text.trimEnd();else return;i.raw=i.raw.trimEnd();for(let u=0;u<i.items.length;u++)if(this.lexer.state.top=!1,i.items[u].tokens=this.lexer.blockTokens(i.items[u].text,[]),!i.loose){let p=i.items[u].tokens.filter(f=>f.type==="space"),c=p.length>0&&p.some(f=>this.rules.other.anyLine.test(f.raw));i.loose=c}if(i.loose)for(let u=0;u<i.items.length;u++)i.items[u].loose=!0;return i}}html(e){let t=this.rules.block.html.exec(e);if(t)return{type:"html",block:!0,raw:t[0],pre:t[1]==="pre"||t[1]==="script"||t[1]==="style",text:t[0]}}def(e){let t=this.rules.block.def.exec(e);if(t){let n=t[1].toLowerCase().replace(this.rules.other.multipleSpaceGlobal," "),r=t[2]?t[2].replace(this.rules.other.hrefBrackets,"$1").replace(this.rules.inline.anyPunctuation,"$1"):"",i=t[3]?t[3].substring(1,t[3].length-1).replace(this.rules.inline.anyPunctuation,"$1"):t[3];return{type:"def",tag:n,raw:t[0],href:r,title:i}}}table(e){let t=this.rules.block.table.exec(e);if(!t||!this.rules.other.tableDelimiter.test(t[2]))return;let n=V(t[1]),r=t[2].replace(this.rules.other.tableAlignChars,"").split("|"),i=t[3]?.trim()?t[3].replace(this.rules.other.tableRowBlankLine,"").split(`
`):[],s={type:"table",raw:t[0],header:[],align:[],rows:[]};if(n.length===r.length){for(let o of r)this.rules.other.tableAlignRight.test(o)?s.align.push("right"):this.rules.other.tableAlignCenter.test(o)?s.align.push("center"):this.rules.other.tableAlignLeft.test(o)?s.align.push("left"):s.align.push(null);for(let o=0;o<n.length;o++)s.header.push({text:n[o],tokens:this.lexer.inline(n[o]),header:!0,align:s.align[o]});for(let o of i)s.rows.push(V(o,s.header.length).map((a,u)=>({text:a,tokens:this.lexer.inline(a),header:!1,align:s.align[u]})));return s}}lheading(e){let t=this.rules.block.lheading.exec(e);if(t)return{type:"heading",raw:t[0],depth:t[2].charAt(0)==="="?1:2,text:t[1],tokens:this.lexer.inline(t[1])}}paragraph(e){let t=this.rules.block.paragraph.exec(e);if(t){let n=t[1].charAt(t[1].length-1)===`
`?t[1].slice(0,-1):t[1];return{type:"paragraph",raw:t[0],text:n,tokens:this.lexer.inline(n)}}}text(e){let t=this.rules.block.text.exec(e);if(t)return{type:"text",raw:t[0],text:t[0],tokens:this.lexer.inline(t[0])}}escape(e){let t=this.rules.inline.escape.exec(e);if(t)return{type:"escape",raw:t[0],text:t[1]}}tag(e){let t=this.rules.inline.tag.exec(e);if(t)return!this.lexer.state.inLink&&this.rules.other.startATag.test(t[0])?this.lexer.state.inLink=!0:this.lexer.state.inLink&&this.rules.other.endATag.test(t[0])&&(this.lexer.state.inLink=!1),!this.lexer.state.inRawBlock&&this.rules.other.startPreScriptTag.test(t[0])?this.lexer.state.inRawBlock=!0:this.lexer.state.inRawBlock&&this.rules.other.endPreScriptTag.test(t[0])&&(this.lexer.state.inRawBlock=!1),{type:"html",raw:t[0],inLink:this.lexer.state.inLink,inRawBlock:this.lexer.state.inRawBlock,block:!1,text:t[0]}}link(e){let t=this.rules.inline.link.exec(e);if(t){let n=t[2].trim();if(!this.options.pedantic&&this.rules.other.startAngleBracket.test(n)){if(!this.rules.other.endAngleBracket.test(n))return;let s=z(n.slice(0,-1),"\\");if((n.length-s.length)%2===0)return}else{let s=ge(t[2],"()");if(s===-2)return;if(s>-1){let a=(t[0].indexOf("!")===0?5:4)+t[1].length+s;t[2]=t[2].substring(0,s),t[0]=t[0].substring(0,a).trim(),t[3]=""}}let r=t[2],i="";if(this.options.pedantic){let s=this.rules.other.pedanticHrefTitle.exec(r);s&&(r=s[1],i=s[3])}else i=t[3]?t[3].slice(1,-1):"";return r=r.trim(),this.rules.other.startAngleBracket.test(r)&&(this.options.pedantic&&!this.rules.other.endAngleBracket.test(n)?r=r.slice(1):r=r.slice(1,-1)),fe(t,{href:r&&r.replace(this.rules.inline.anyPunctuation,"$1"),title:i&&i.replace(this.rules.inline.anyPunctuation,"$1")},t[0],this.lexer,this.rules)}}reflink(e,t){let n;if((n=this.rules.inline.reflink.exec(e))||(n=this.rules.inline.nolink.exec(e))){let r=(n[2]||n[1]).replace(this.rules.other.multipleSpaceGlobal," "),i=t[r.toLowerCase()];if(!i){let s=n[0].charAt(0);return{type:"text",raw:s,text:s}}return fe(n,i,n[0],this.lexer,this.rules)}}emStrong(e,t,n=""){let r=this.rules.inline.emStrongLDelim.exec(e);if(!r||r[3]&&n.match(this.rules.other.unicodeAlphaNumeric))return;if(!(r[1]||r[2]||"")||!n||this.rules.inline.punctuation.exec(n)){let s=[...r[0]].length-1,o,a,u=s,p=0,c=r[0][0]==="*"?this.rules.inline.emStrongRDelimAst:this.rules.inline.emStrongRDelimUnd;for(c.lastIndex=0,t=t.slice(-1*e.length+s);(r=c.exec(t))!=null;){if(o=r[1]||r[2]||r[3]||r[4]||r[5]||r[6],!o)continue;if(a=[...o].length,r[3]||r[4]){u+=a;continue}else if((r[5]||r[6])&&s%3&&!((s+a)%3)){p+=a;continue}if(u-=a,u>0)continue;a=Math.min(a,a+u+p);let f=[...r[0]][0].length,k=e.slice(0,s+r.index+f+a);if(Math.min(s,a)%2){let g=k.slice(1,-1);return{type:"em",raw:k,text:g,tokens:this.lexer.inlineTokens(g)}}let x=k.slice(2,-2);return{type:"strong",raw:k,text:x,tokens:this.lexer.inlineTokens(x)}}}}codespan(e){let t=this.rules.inline.code.exec(e);if(t){let n=t[2].replace(this.rules.other.newLineCharGlobal," "),r=this.rules.other.nonSpaceChar.test(n),i=this.rules.other.startingSpaceChar.test(n)&&this.rules.other.endingSpaceChar.test(n);return r&&i&&(n=n.substring(1,n.length-1)),{type:"codespan",raw:t[0],text:n}}}br(e){let t=this.rules.inline.br.exec(e);if(t)return{type:"br",raw:t[0]}}del(e){let t=this.rules.inline.del.exec(e);if(t)return{type:"del",raw:t[0],text:t[2],tokens:this.lexer.inlineTokens(t[2])}}autolink(e){let t=this.rules.inline.autolink.exec(e);if(t){let n,r;return t[2]==="@"?(n=t[1],r="mailto:"+n):(n=t[1],r=n),{type:"link",raw:t[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}}url(e){let t;if(t=this.rules.inline.url.exec(e)){let n,r;if(t[2]==="@")n=t[0],r="mailto:"+n;else{let i;do i=t[0],t[0]=this.rules.inline._backpedal.exec(t[0])?.[0]??"";while(i!==t[0]);n=t[0],t[1]==="www."?r="http://"+t[0]:r=t[0]}return{type:"link",raw:t[0],text:n,href:r,tokens:[{type:"text",raw:n,text:n}]}}}inlineText(e){let t=this.rules.inline.text.exec(e);if(t){let n=this.lexer.state.inRawBlock;return{type:"text",raw:t[0],text:t[0],escaped:n}}}};var b=class l{tokens;options;state;tokenizer;inlineQueue;constructor(e){this.tokens=[],this.tokens.links=Object.create(null),this.options=e||O,this.options.tokenizer=this.options.tokenizer||new y,this.tokenizer=this.options.tokenizer,this.tokenizer.options=this.options,this.tokenizer.lexer=this,this.inlineQueue=[],this.state={inLink:!1,inRawBlock:!1,top:!0};let t={other:m,block:I.normal,inline:M.normal};this.options.pedantic?(t.block=I.pedantic,t.inline=M.pedantic):this.options.gfm&&(t.block=I.gfm,this.options.breaks?t.inline=M.breaks:t.inline=M.gfm),this.tokenizer.rules=t}static get rules(){return{block:I,inline:M}}static lex(e,t){return new l(t).lex(e)}static lexInline(e,t){return new l(t).inlineTokens(e)}lex(e){e=e.replace(m.carriageReturn,`
`),this.blockTokens(e,this.tokens);for(let t=0;t<this.inlineQueue.length;t++){let n=this.inlineQueue[t];this.inlineTokens(n.src,n.tokens)}return this.inlineQueue=[],this.tokens}blockTokens(e,t=[],n=!1){for(this.options.pedantic&&(e=e.replace(m.tabCharGlobal,"    ").replace(m.spaceLine,""));e;){let r;if(this.options.extensions?.block?.some(s=>(r=s.call({lexer:this},e,t))?(e=e.substring(r.raw.length),t.push(r),!0):!1))continue;if(r=this.tokenizer.space(e)){e=e.substring(r.raw.length);let s=t.at(-1);r.raw.length===1&&s!==void 0?s.raw+=`
`:t.push(r);continue}if(r=this.tokenizer.code(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="paragraph"||s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.at(-1).src=s.text):t.push(r);continue}if(r=this.tokenizer.fences(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.heading(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.hr(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.blockquote(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.list(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.html(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.def(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="paragraph"||s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.raw,this.inlineQueue.at(-1).src=s.text):this.tokens.links[r.tag]||(this.tokens.links[r.tag]={href:r.href,title:r.title},t.push(r));continue}if(r=this.tokenizer.table(e)){e=e.substring(r.raw.length),t.push(r);continue}if(r=this.tokenizer.lheading(e)){e=e.substring(r.raw.length),t.push(r);continue}let i=e;if(this.options.extensions?.startBlock){let s=1/0,o=e.slice(1),a;this.options.extensions.startBlock.forEach(u=>{a=u.call({lexer:this},o),typeof a=="number"&&a>=0&&(s=Math.min(s,a))}),s<1/0&&s>=0&&(i=e.substring(0,s+1))}if(this.state.top&&(r=this.tokenizer.paragraph(i))){let s=t.at(-1);n&&s?.type==="paragraph"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=s.text):t.push(r),n=i.length!==e.length,e=e.substring(r.raw.length);continue}if(r=this.tokenizer.text(e)){e=e.substring(r.raw.length);let s=t.at(-1);s?.type==="text"?(s.raw+=(s.raw.endsWith(`
`)?"":`
`)+r.raw,s.text+=`
`+r.text,this.inlineQueue.pop(),this.inlineQueue.at(-1).src=s.text):t.push(r);continue}if(e){let s="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(s);break}else throw new Error(s)}}return this.state.top=!0,t}inline(e,t=[]){return this.inlineQueue.push({src:e,tokens:t}),t}inlineTokens(e,t=[]){let n=e,r=null;if(this.tokens.links){let o=Object.keys(this.tokens.links);if(o.length>0)for(;(r=this.tokenizer.rules.inline.reflinkSearch.exec(n))!=null;)o.includes(r[0].slice(r[0].lastIndexOf("[")+1,-1))&&(n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.reflinkSearch.lastIndex))}for(;(r=this.tokenizer.rules.inline.anyPunctuation.exec(n))!=null;)n=n.slice(0,r.index)+"++"+n.slice(this.tokenizer.rules.inline.anyPunctuation.lastIndex);for(;(r=this.tokenizer.rules.inline.blockSkip.exec(n))!=null;)n=n.slice(0,r.index)+"["+"a".repeat(r[0].length-2)+"]"+n.slice(this.tokenizer.rules.inline.blockSkip.lastIndex);let i=!1,s="";for(;e;){i||(s=""),i=!1;let o;if(this.options.extensions?.inline?.some(u=>(o=u.call({lexer:this},e,t))?(e=e.substring(o.raw.length),t.push(o),!0):!1))continue;if(o=this.tokenizer.escape(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.tag(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.link(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.reflink(e,this.tokens.links)){e=e.substring(o.raw.length);let u=t.at(-1);o.type==="text"&&u?.type==="text"?(u.raw+=o.raw,u.text+=o.text):t.push(o);continue}if(o=this.tokenizer.emStrong(e,n,s)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.codespan(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.br(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.del(e)){e=e.substring(o.raw.length),t.push(o);continue}if(o=this.tokenizer.autolink(e)){e=e.substring(o.raw.length),t.push(o);continue}if(!this.state.inLink&&(o=this.tokenizer.url(e))){e=e.substring(o.raw.length),t.push(o);continue}let a=e;if(this.options.extensions?.startInline){let u=1/0,p=e.slice(1),c;this.options.extensions.startInline.forEach(f=>{c=f.call({lexer:this},p),typeof c=="number"&&c>=0&&(u=Math.min(u,c))}),u<1/0&&u>=0&&(a=e.substring(0,u+1))}if(o=this.tokenizer.inlineText(a)){e=e.substring(o.raw.length),o.raw.slice(-1)!=="_"&&(s=o.raw.slice(-1)),i=!0;let u=t.at(-1);u?.type==="text"?(u.raw+=o.raw,u.text+=o.text):t.push(o);continue}if(e){let u="Infinite loop on byte: "+e.charCodeAt(0);if(this.options.silent){console.error(u);break}else throw new Error(u)}}return t}};var P=class{options;parser;constructor(e){this.options=e||O}space(e){return""}code({text:e,lang:t,escaped:n}){let r=(t||"").match(m.notSpaceStart)?.[0],i=e.replace(m.endingNewline,"")+`
`;return r?'<pre><code class="language-'+w(r)+'">'+(n?i:w(i,!0))+`</code></pre>
`:"<pre><code>"+(n?i:w(i,!0))+`</code></pre>
`}blockquote({tokens:e}){return`<blockquote>
${this.parser.parse(e)}</blockquote>
`}html({text:e}){return e}def(e){return""}heading({tokens:e,depth:t}){return`<h${t}>${this.parser.parseInline(e)}</h${t}>
`}hr(e){return`<hr>
`}list(e){let t=e.ordered,n=e.start,r="";for(let o=0;o<e.items.length;o++){let a=e.items[o];r+=this.listitem(a)}let i=t?"ol":"ul",s=t&&n!==1?' start="'+n+'"':"";return"<"+i+s+`>
`+r+"</"+i+`>
`}listitem(e){let t="";if(e.task){let n=this.checkbox({checked:!!e.checked});e.loose?e.tokens[0]?.type==="paragraph"?(e.tokens[0].text=n+" "+e.tokens[0].text,e.tokens[0].tokens&&e.tokens[0].tokens.length>0&&e.tokens[0].tokens[0].type==="text"&&(e.tokens[0].tokens[0].text=n+" "+w(e.tokens[0].tokens[0].text),e.tokens[0].tokens[0].escaped=!0)):e.tokens.unshift({type:"text",raw:n+" ",text:n+" ",escaped:!0}):t+=n+" "}return t+=this.parser.parse(e.tokens,!!e.loose),`<li>${t}</li>
`}checkbox({checked:e}){return"<input "+(e?'checked="" ':"")+'disabled="" type="checkbox">'}paragraph({tokens:e}){return`<p>${this.parser.parseInline(e)}</p>
`}table(e){let t="",n="";for(let i=0;i<e.header.length;i++)n+=this.tablecell(e.header[i]);t+=this.tablerow({text:n});let r="";for(let i=0;i<e.rows.length;i++){let s=e.rows[i];n="";for(let o=0;o<s.length;o++)n+=this.tablecell(s[o]);r+=this.tablerow({text:n})}return r&&(r=`<tbody>${r}</tbody>`),`<table>
<thead>
`+t+`</thead>
`+r+`</table>
`}tablerow({text:e}){return`<tr>
${e}</tr>
`}tablecell(e){let t=this.parser.parseInline(e.tokens),n=e.header?"th":"td";return(e.align?`<${n} align="${e.align}">`:`<${n}>`)+t+`</${n}>
`}strong({tokens:e}){return`<strong>${this.parser.parseInline(e)}</strong>`}em({tokens:e}){return`<em>${this.parser.parseInline(e)}</em>`}codespan({text:e}){return`<code>${w(e,!0)}</code>`}br(e){return"<br>"}del({tokens:e}){return`<del>${this.parser.parseInline(e)}</del>`}link({href:e,title:t,tokens:n}){let r=this.parser.parseInline(n),i=J(e);if(i===null)return r;e=i;let s='<a href="'+e+'"';return t&&(s+=' title="'+w(t)+'"'),s+=">"+r+"</a>",s}image({href:e,title:t,text:n,tokens:r}){r&&(n=this.parser.parseInline(r,this.parser.textRenderer));let i=J(e);if(i===null)return w(n);e=i;let s=`<img src="${e}" alt="${n}"`;return t&&(s+=` title="${w(t)}"`),s+=">",s}text(e){return"tokens"in e&&e.tokens?this.parser.parseInline(e.tokens):"escaped"in e&&e.escaped?e.text:w(e.text)}};var S=class{strong({text:e}){return e}em({text:e}){return e}codespan({text:e}){return e}del({text:e}){return e}html({text:e}){return e}text({text:e}){return e}link({text:e}){return""+e}image({text:e}){return""+e}br(){return""}};var R=class l{options;renderer;textRenderer;constructor(e){this.options=e||O,this.options.renderer=this.options.renderer||new P,this.renderer=this.options.renderer,this.renderer.options=this.options,this.renderer.parser=this,this.textRenderer=new S}static parse(e,t){return new l(t).parse(e)}static parseInline(e,t){return new l(t).parseInline(e)}parse(e,t=!0){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=i,a=this.options.extensions.renderers[o.type].call({parser:this},o);if(a!==!1||!["space","hr","heading","code","table","blockquote","list","html","def","paragraph","text"].includes(o.type)){n+=a||"";continue}}let s=i;switch(s.type){case"space":{n+=this.renderer.space(s);continue}case"hr":{n+=this.renderer.hr(s);continue}case"heading":{n+=this.renderer.heading(s);continue}case"code":{n+=this.renderer.code(s);continue}case"table":{n+=this.renderer.table(s);continue}case"blockquote":{n+=this.renderer.blockquote(s);continue}case"list":{n+=this.renderer.list(s);continue}case"html":{n+=this.renderer.html(s);continue}case"def":{n+=this.renderer.def(s);continue}case"paragraph":{n+=this.renderer.paragraph(s);continue}case"text":{let o=s,a=this.renderer.text(o);for(;r+1<e.length&&e[r+1].type==="text";)o=e[++r],a+=`
`+this.renderer.text(o);t?n+=this.renderer.paragraph({type:"paragraph",raw:a,text:a,tokens:[{type:"text",raw:a,text:a,escaped:!0}]}):n+=a;continue}default:{let o='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}parseInline(e,t=this.renderer){let n="";for(let r=0;r<e.length;r++){let i=e[r];if(this.options.extensions?.renderers?.[i.type]){let o=this.options.extensions.renderers[i.type].call({parser:this},i);if(o!==!1||!["escape","html","link","image","strong","em","codespan","br","del","text"].includes(i.type)){n+=o||"";continue}}let s=i;switch(s.type){case"escape":{n+=t.text(s);break}case"html":{n+=t.html(s);break}case"link":{n+=t.link(s);break}case"image":{n+=t.image(s);break}case"strong":{n+=t.strong(s);break}case"em":{n+=t.em(s);break}case"codespan":{n+=t.codespan(s);break}case"br":{n+=t.br(s);break}case"del":{n+=t.del(s);break}case"text":{n+=t.text(s);break}default:{let o='Token with "'+s.type+'" type was not found.';if(this.options.silent)return console.error(o),"";throw new Error(o)}}}return n}};var $=class{options;block;constructor(e){this.options=e||O}static passThroughHooks=new Set(["preprocess","postprocess","processAllTokens"]);preprocess(e){return e}postprocess(e){return e}processAllTokens(e){return e}provideLexer(){return this.block?b.lex:b.lexInline}provideParser(){return this.block?R.parse:R.parseInline}};var B=class{defaults=L();options=this.setOptions;parse=this.parseMarkdown(!0);parseInline=this.parseMarkdown(!1);Parser=R;Renderer=P;TextRenderer=S;Lexer=b;Tokenizer=y;Hooks=$;constructor(...e){this.use(...e)}walkTokens(e,t){let n=[];for(let r of e)switch(n=n.concat(t.call(this,r)),r.type){case"table":{let i=r;for(let s of i.header)n=n.concat(this.walkTokens(s.tokens,t));for(let s of i.rows)for(let o of s)n=n.concat(this.walkTokens(o.tokens,t));break}case"list":{let i=r;n=n.concat(this.walkTokens(i.items,t));break}default:{let i=r;this.defaults.extensions?.childTokens?.[i.type]?this.defaults.extensions.childTokens[i.type].forEach(s=>{let o=i[s].flat(1/0);n=n.concat(this.walkTokens(o,t))}):i.tokens&&(n=n.concat(this.walkTokens(i.tokens,t)))}}return n}use(...e){let t=this.defaults.extensions||{renderers:{},childTokens:{}};return e.forEach(n=>{let r={...n};if(r.async=this.defaults.async||r.async||!1,n.extensions&&(n.extensions.forEach(i=>{if(!i.name)throw new Error("extension name required");if("renderer"in i){let s=t.renderers[i.name];s?t.renderers[i.name]=function(...o){let a=i.renderer.apply(this,o);return a===!1&&(a=s.apply(this,o)),a}:t.renderers[i.name]=i.renderer}if("tokenizer"in i){if(!i.level||i.level!=="block"&&i.level!=="inline")throw new Error("extension level must be 'block' or 'inline'");let s=t[i.level];s?s.unshift(i.tokenizer):t[i.level]=[i.tokenizer],i.start&&(i.level==="block"?t.startBlock?t.startBlock.push(i.start):t.startBlock=[i.start]:i.level==="inline"&&(t.startInline?t.startInline.push(i.start):t.startInline=[i.start]))}"childTokens"in i&&i.childTokens&&(t.childTokens[i.name]=i.childTokens)}),r.extensions=t),n.renderer){let i=this.defaults.renderer||new P(this.defaults);for(let s in n.renderer){if(!(s in i))throw new Error(`renderer '${s}' does not exist`);if(["options","parser"].includes(s))continue;let o=s,a=n.renderer[o],u=i[o];i[o]=(...p)=>{let c=a.apply(i,p);return c===!1&&(c=u.apply(i,p)),c||""}}r.renderer=i}if(n.tokenizer){let i=this.defaults.tokenizer||new y(this.defaults);for(let s in n.tokenizer){if(!(s in i))throw new Error(`tokenizer '${s}' does not exist`);if(["options","rules","lexer"].includes(s))continue;let o=s,a=n.tokenizer[o],u=i[o];i[o]=(...p)=>{let c=a.apply(i,p);return c===!1&&(c=u.apply(i,p)),c}}r.tokenizer=i}if(n.hooks){let i=this.defaults.hooks||new $;for(let s in n.hooks){if(!(s in i))throw new Error(`hook '${s}' does not exist`);if(["options","block"].includes(s))continue;let o=s,a=n.hooks[o],u=i[o];$.passThroughHooks.has(s)?i[o]=p=>{if(this.defaults.async)return Promise.resolve(a.call(i,p)).then(f=>u.call(i,f));let c=a.call(i,p);return u.call(i,c)}:i[o]=(...p)=>{let c=a.apply(i,p);return c===!1&&(c=u.apply(i,p)),c}}r.hooks=i}if(n.walkTokens){let i=this.defaults.walkTokens,s=n.walkTokens;r.walkTokens=function(o){let a=[];return a.push(s.call(this,o)),i&&(a=a.concat(i.call(this,o))),a}}this.defaults={...this.defaults,...r}}),this}setOptions(e){return this.defaults={...this.defaults,...e},this}lexer(e,t){return b.lex(e,t??this.defaults)}parser(e,t){return R.parse(e,t??this.defaults)}parseMarkdown(e){return(n,r)=>{let i={...r},s={...this.defaults,...i},o=this.onError(!!s.silent,!!s.async);if(this.defaults.async===!0&&i.async===!1)return o(new Error("marked(): The async option was set to true by an extension. Remove async: false from the parse options object to return a Promise."));if(typeof n>"u"||n===null)return o(new Error("marked(): input parameter is undefined or null"));if(typeof n!="string")return o(new Error("marked(): input parameter is of type "+Object.prototype.toString.call(n)+", string expected"));s.hooks&&(s.hooks.options=s,s.hooks.block=e);let a=s.hooks?s.hooks.provideLexer():e?b.lex:b.lexInline,u=s.hooks?s.hooks.provideParser():e?R.parse:R.parseInline;if(s.async)return Promise.resolve(s.hooks?s.hooks.preprocess(n):n).then(p=>a(p,s)).then(p=>s.hooks?s.hooks.processAllTokens(p):p).then(p=>s.walkTokens?Promise.all(this.walkTokens(p,s.walkTokens)).then(()=>p):p).then(p=>u(p,s)).then(p=>s.hooks?s.hooks.postprocess(p):p).catch(o);try{s.hooks&&(n=s.hooks.preprocess(n));let p=a(n,s);s.hooks&&(p=s.hooks.processAllTokens(p)),s.walkTokens&&this.walkTokens(p,s.walkTokens);let c=u(p,s);return s.hooks&&(c=s.hooks.postprocess(c)),c}catch(p){return o(p)}}}onError(e,t){return n=>{if(n.message+=`
Please report this to https://github.com/markedjs/marked.`,e){let r="<p>An error occurred:</p><pre>"+w(n.message+"",!0)+"</pre>";return t?Promise.resolve(r):r}if(t)return Promise.reject(n);throw n}}};var _=new B;function d(l,e){return _.parse(l,e)}d.options=d.setOptions=function(l){return _.setOptions(l),d.defaults=_.defaults,H(d.defaults),d};d.getDefaults=L;d.defaults=O;d.use=function(...l){return _.use(...l),d.defaults=_.defaults,H(d.defaults),d};d.walkTokens=function(l,e){return _.walkTokens(l,e)};d.parseInline=_.parseInline;d.Parser=R;d.parser=R.parse;d.Renderer=P;d.TextRenderer=S;d.Lexer=b;d.lexer=b.lex;d.Tokenizer=y;d.Hooks=$;d.parse=d;var Dt=d.options,Zt=d.setOptions,Gt=d.use,Ht=d.walkTokens,Nt=d.parseInline,jt=d,Ft=R.parse,Qt=b.lex;export{$ as Hooks,b as Lexer,B as Marked,R as Parser,P as Renderer,S as TextRenderer,y as Tokenizer,O as defaults,L as getDefaults,Qt as lexer,d as marked,Dt as options,jt as parse,Nt as parseInline,Ft as parser,Zt as setOptions,Gt as use,Ht as walkTokens};
//# sourceMappingURL=marked.esm.js.map
```

## 04-project-resources/README.md

- bytes: 1061
- language: md

```md
# Project resources

This generator has no images, audio, fonts, models, shaders or data files. Its content resources are:

1. Markdown pages - the <script type="text/markdown" data-hash=... data-title=... data-desc=...> elements inside
   01-internal-code/index.html. The plugin's demo pages (overview, advanced, markdown-syntax) are simultaneously
   the generator's visible content and its usage documentation.
2. Runtime-generated UI/CSS - the stylesheet string built by injectStyles() in main.pjs, including the hljs theme
   colors. There is no external .css file.
3. UI glyphs - text/emoji only: the copy glyph U+29C9 and the 'Menu' label. No icon files.

## examples/

Reference generators that use this plugin, fetched from perchance.org:

- examples/docs-plugin-simple/ - https://perchance.org/docs-plugin-example (minimal usage)
- examples/ai-character-chat-docs/ - https://perchance.org/ai-character-chat-docs (large real docs site, ~81 KB of markdown)

Both have main.pjs = ```docsPlugin = {import:docs-plugin}``` and put all content in index.html.
```

## 04-project-resources/examples/ai-character-chat-docs/index.html

- bytes: 81429
- language: html

```html
<script type="text/markdown" data-hash="tips" data-title="💡 Tips" data-desc="General usage tips, slash commands, shortcuts, and image command syntax.">
# Tips

## General:
* Adding some *example dialogue* in the character description/instruction or initial messages is often the best way to influence how they speak.
* If your character's responses are too long and/or they speak on behalf of your character, try setting a strict reply length limit of one or two paragraphs using the character editor.
* To make a group chat, bring other characters into your chat by using the pencil icon above the reply box.
* You can use the "reminder note" in the character editor to give the AI writing tips like "be very descriptive".
* The character instruction/description/personality should *ideally* be under 500 words. If you need more than that, you can add a "[Lorebook](#memories-and-lore)" in the advanced character editor settings. You can add **thousands** of "facts" about your character/world/etc. using this "lore" feature - each entry should be short and self-contained (usually just one sentence per entry).
* If you clear your site cookies/data for Perchance, your threads and characters will be lost. Use the "export" button to backup your data regularly. Your export file may eventually become huge. In that case I recommend just exporting the threads/characters you want individually, clearing your data, and then importing those threads/characters.
* You can use the import button to import threads, characters, export files, and open character formats like Tavern PNG cards. If you find a character/chat format that isn't supported, request it with the feedback button.
* Double-tap on the reply box to show recent send history - so you can quickly send the same message you sent before. Useful when you need to e.g. send a slash command, but it's not common enough to be worth adding a "shortcut" for.
* The character editor allows adding [custom code](#custom-code). This can be used to allow your character to do basically anything - access the internet, show a full 3D/VR avatar, have a voice (i.e. speak messages), execute its own JavaScript and Python code - and even edit its own personality and code. It's basically limitless, but requires some JavaScript coding knowledge.

## Slash Commands:

You can type any of these commands in the reply box, or use them in your shortcut buttons:

* `/ai` - Trigger a response from the AI.
* `/ai <instruction>` - Trigger a response from the AI, and give a writing instruction for that response.
  * e.g. `/ai write a really silly reply`
* `/ai @CharName#123 <instruction>` - Prompt reply with another character (Character ID = 123)
  * e.g. `/ai @Alice#7 say something sinister`
* `/user <instruction>` - Get the AI to generate a reply on behalf of you, the user.
  * e.g. `/user write a short response in first-person`
* `/image <description>` - Generate an image.
  *  e.g. `/image a cute rabbit hopping in a forest, anime art style, vibrant colors`
  * You can also tell your AI character (via its instruction or reminder) to use the image generation feature via this format/syntax: `<image>a cute rabbit hopping in a forest, anime art style, vibrant colors</image>`. See the "AI Artist" example character for a demo of this.
  * Generate multiple images at once with `/image --num=3 a cute rabbit hopping...`
  * If don't add the description after the command (i.e. if you just write `/image` or `/image --num=3`), then a description will be generated for you based on the current situation in your chat.
* `/sys <instruction>` - Trigger a response from the 'system', and give a writing instruction for that response.
  * You can also use `/system <instruction>`.
* `/nar <instruction>` - This is short for `/sys @Narrator <instruction>` - i.e. use the "system" character, and change it name to "Narrator" for this message.
* `/sum` - Open the summary editor.
* `/mem` - Open memory editor.
* `/lore` - Open lore editor.
* `/lore <text>` - Add a lore entry.
* `/name <name>` - Set your name for this thread.
* `/avatar <url>` - Set your avatar image for this thread.
* `/import` - Add chat messages in bulk.

* You can add `/ai <instruction>` as the final line in your normal messages to instruct AI for its reply that follows.
* Double-click the text input box to show your input history for that thread.

## Shortcuts:

Next to the reply box there's an **options** button. If you click that, you can add a "shortcut". Shortcuts allow you to create buttons for common actions. The shortcut buttons will appear directly above the reply text box.

For example, you could create a shortcut button for each of the characters in your story - e.g. a shortcut button that sends `/ai @Alice#1 write an interesting reply` and another one that sends `/ai @Bob#2 write a creative reply`. Then instead of having to type `/ai @Alice#1  write an interesting reply` every time you want an interesting response from Alice, you can just click your "Alice" button, and same for Bob.

If you add these brackets: `<>` around some text in a shortcut, like `/ai @Bob#2 <abc123>` then the "abc123" text (or whatever you decide to write inside the brackets) will be automatically highlighted after the text is added to the reply box. This is useful for adding a quickly-editable "placeholder" to shortcuts (ones that have auto-send disabled, that is) so you can customize it before clicking send.

## Misc:

* In the character editor (within the advanced section), you can disable summaries and character memories to speed up response times, but note that it'll make the AI less smart.
* The reminder message can sometimes confuse the AI, especially if it's long or has multiple paragraphs. If the AI is having trouble following your reminders, try putting those reminders at the top of the character's instruction/role/personality instead.

## Advanced Image Command Tips:

The `<image>the description of the image</image>` feature has several options that you can specify via the syntax described on the [text-to-image-plugin](https://perchance.org/text-to-image-plugin) page - like in these examples:

* `<image>a cute rabbit (resolution:::512x768)</image>` - As of writing, the available resolutions are 512x768, 512x512, 768x512.
* `<image>a cute rabbit (seed:::84756293)</image>` - Add a "seed" number to ensure the same image is generated every time you view that chat message (even after e.g. refreshing the page).
* `<image>a cute rabbit (negativePrompt:::blurry, low quality)</image>` - Override the default "negative prompt" - i.e. tell the image generator what you *don't* want to be in the image.

And, of course, this `(parameter:::value)` syntax works with the `/image` command too:

* `/image a cute rabbit (resolution:::512x768)`
* `/image a cute rabbit (seed:::84756293)`
</script>








<script type="text/markdown" data-hash="instruction-and-reminder" data-title="🎭 Instruction and Reminder" data-desc="How role instructions and reminder messages work, including advanced multi-message formats.">
# Instruction and Reminder
A character's **instruction/role** is the main way to define/describe the character. It tells the AI how to speak and behave. It can be reasonably long - up to maybe 500 words, but you should still try to be as concise as possible. You could go up to 1000 words if you *really* need to, but it'll reduce the AI's ability to remember stuff in the chat. If you can describe your character well using only 100 words, then there's no reason to use more than that. Use **[lorebooks](#memories-and-lore)** (in the character editor) if you need to tell the AI a lot of info about the character/world/etc. - you can add thousands of paragraphs of text using the "lore" feature.

The **reminder** message should be significantly shorter than the instruction/role. Probably keep it under 100 words. It's basically a small "hidden" message that's placed within the chat thread, *right* before the AI's next response. This can have a powerful influence on the AI's behavior because of its proximity to what the AI is about to write next. It's hard for the AI to ignore it. If it's too long, it can disrupt the flow of the conversation and "distract" the AI too much - with great power comes great responsibility. It's okay to leave the reminder message blank, and sometimes that will work best.

Note that when you edit a character's instruction/role and reminder messages, all *existing* threads will *immediately* receive the new updates. This is because the instruction and reminder messages are a part of *the character itself*, and not of individual chat threads. There's no way to define an instruction or reminder that only applies to a *specific* chat thread.

## Advanced Instruction Messages
You can actually add multiple instruction/role messages and reminder messages. Just use the same format that's used for initial messages. You can use multiple instruction/role messages as a way to add 'initial messages' that are never summarized away - i.e. messages that are always placed at the start of the thread. And you can *change the author* of these messages from the default 'SYSTEM', to e.g. the 'AI', or 'USER', or any combination of those.

Here's an example of some text that you could write in the instruction/role input box that 'characterizes'/instructs the character using a first-person message:
```text
[AI]: I'm a dragon.
[USER]: I'm the queen of kingdom that is near the dragon's lair.
[SYSTEM]: What follows is a story about the queen and the dragon.
```
(Please be more creative than this 😅 I'm just hastily writing documentation here.)

As you can see, this is just like [initial messages](#initial-messages), except these messages will never get summarized. They'll always remain at the start of the chat.

Note that, normally, you'd just write something like this in the instruction/role input box:

```text
You are a dragon. The user is the queen of kingdom that is near the dragon's lair. What follows is a story about the queen and the dragon.
```

That's actually exactly equivalent to writing this:

```text
[SYSTEM]: You are a dragon. The user is the queen of kingdom that is near the dragon's lair. What follows is a story about the queen and the dragon.
```

So you can see that by default the instruction/role is 'spoken' by the 'system'. Using this 'advanced' approach you can create instructions which mix all messages types (user, ai, system).

## Advanced Reminder Messages
All of the above applies for reminder messages too. For example, below we set a first-person reminder message - i.e. we make the AI remind itself. This is useful to prevent the AI from "replying" to the reminder message.
```text
[AI]: (Thought: I need to remember to be very descriptive, and create an engaging experience for the user)
```
If you didn't include the `[AI]: ` part at the start, then it'd just be a 'normal' reminder message, and would be 'spoken' by 'SYSTEM'.

Notice that I put "Thought:" at the start of the message and wrapped it in parentheses. I could have also used `(OOC: ...)`, which means "out of character", or something like that. That way the message doesn't get treated like it's part of the actual conversation.

And you can of course add as many reminder messages as you like using this `[AI]:`/`[USER]:`/`[SYSTEM]:` format. Just follow the examples above, and in the [initial messages](#initial-messages) doc.

## Summary Stuff

Note that the chat summarization algorithm doesn't "see" the instruction or reminder messages. This is *unlike* [initial messages](#initial-messages), which are just treated as normal messages - they'll get summarized if the thread gets long enough.

Again, all "normal" messages (*including* 'initial messages') will eventually get summarized if the thread gets long enough, assuming you've got summarization enabled in the character settings, whereas instruction/reminder messages aren't considered as being part of the "real" chat messages, and so they don't influence the summary.
</script>









<script type="text/markdown" data-hash="initial-messages" data-title="💬 Initial Messages" data-desc="Syntax and examples for hidden, named, and system initial messages.">
# Initial Messages
Initial messages are great for helping the AI get into character. The format of the initial messages (explained in this document) allows you to:

* **Hide initial messages from the user**: In case you have many messages that would be annoying for the user to see every time they start a new conversation with the character.
* **Hide initial messages from the AI**: To, for example, provide user instructions or character creator credit/attribution at the top of the chat - stuff you want the user to see, but not the AI.
* **Create system messages**: These are used to guide the behavior of the AI, or provide information/context in situations where it wouldn't make sense for the AI or the user to "say" it.

Initial messages should follow the following format:
```text
[AI]: This is the first AI message.
[USER]: This is the user's response.
[AI]: This is the second AI message.
[SYSTEM]: Here's a system message. Use system messages to help guide the AI.
```
You can hide messages from the `ai` or the `user` like this:
```text
[AI; hiddenFrom=user]: This message is spoken by the AI and is hidden from the user.
[SYSTEM; hiddenFrom=ai]: This message is spoken by the System and is hidden from the AI.
```
You can add/override a name for a message like this:
```text
[SYSTEM; name=Bob]: This message is sent from Bob
```
You can combine multiple properties using a comma between them:
```text
[SYSTEM; name=Bob, hiddenFrom=ai]: This message is sent from Bob and hidden from the ai
```

Messages can be multi-line. For example, this is valid:
```text
[AI]: This is the first AI message.
It has two lines.
[USER]: This is the user's response.
It also has two lines.
```
As with all messages, you can include markdown/HTML. Here's an example of an initial message the provides instructions to the user, and has an image embedded:
```text
[SYSTEM; hiddenFrom=ai]: Hello there! Thanks for trying out my character. Here are some tips:
* Make sure to edit the character's response if they break character. You'll probably only have to do this for the first few messages, at most.
* ...

<img src="https://user.uploads.dev/file/b37af6315e6d2c76ff6c17185163c9d9.jpg">

See the latest versions of my characters at my twitter account: [@exampleusername](https://twitter.com/exampleusername)
```
</script>










<script type="text/markdown" data-hash="memories-and-lore" data-title="🧠 Memories and Lore" data-desc="How summaries, memories, lore entries, and lorebook URLs work.">
# Memories and Lore
If you have summaries enabled in your character settings, then your character will automatically start to create "memories" once the thread/convo gets long enough. Before each reply your character will search its memories for anything that might be relevant to the reply that it's about to write.

You can see the "search queries" that were used by your character when generating a message by tapping the brain icon that appears when you hover your mouse over a message (or when tapping the message on mobile).

You can type `/mem` in the chat to open the memory editor for that thread/convo so that you can edit/add/remove memories.

**Lore** is similar to memories, except that they're not chronological. You can open the lore editor for a thread by typing `/lore`. This is where you can edit lore that's specific to just that particular thread. If you want to add lore to your *character* (so all new threads that you create using that character will "inherit" that lore), then you can open the advanced character editor, click advanced options, and scroll down to the "lorebook URLs" input, and paste a URL to your lorebook text file. The text file should just be a list of lore entries with blank lines in between each one. You should use [perchance.org/upload](https://perchance.org/upload) to create hosted text files. Here's a short example lorebook text file with 3 lore entries:
```
There are three concentric walls: Wall Maria, Wall Rose, and Wall Sina, which protect humanity from giant humanoid creatures called Titans.

The Survey Corps is a military branch dedicated to exploring the world outside the Walls and combating the Titans.

ODM gear, or Omni-Directional Mobility gear, is a piece of equipment used by the military to maneuver in three dimensions, allowing them to fly through the air during combat with Titans.
```
Note that **each lore entry should be completely self-contained**. The AI sees entries in isolation, so if you have an entry like "He has a brother named Mark" then the AI won't know who "he" refers to because it won't necessarily see the entry above it. The order of lore entries does not matter at all - each one should be an independent "fact" about some aspect of the world (characters, rules, geography, relationships, etc.)

Here's an example lorebook URL for those entries: https://user.uploads.dev/file/b84332ac1e17cda2b1fa65dd28818fc0.txt

You should think of lore like "**dynamic reminders**". They're like the reminder message, except that they only get loaded in when they're relevant to the current situation. This is good if you have lots of stuff that you want your character to know/remember - because you likely won't be able to fit it all in the instruction/reminder without using up a lot of precious 'context' tokens.

### Important
 * You can have as much lore/memories as you want - e.g. you could have thousands of entries, and once they've been added, it should be just as fast as if you had 10 entries. The character response speed should not perceptibly decrease as you add more lore/memories.
 * If you make an update to your character's lorebook URLs, then existing threads won't automatically get the update. You have to type `/lore`, and then show the hidden options and click the reload button to pull in the updated lore entries.
</script>











<script type="text/markdown" data-hash="message-styling" data-title="🎨 Message Styling" data-desc="CSS-based message styling examples, font changes, and dark/light mode advice.">
# Message Styling

In the character editor there's an input for "message style" which is the default "styling" applied to each message. The 'syntax' you should use is CSS, but since most people don't know the CSS language, I'll make it easy by documenting some common stylizations that people might want to make below. If something is missing, submit a request for it using the feedback button and I'll add a section for it here.

**Important**: Note that the AI Character Chat interface has a dark mode and a light mode that is set automatically based on the user's current device/OS settings. If you make a character *with the intent to share it with others*, it's worth testing on dark and light mode to ensure that it's not to 'hard on the eyes' in either case. You can use `light-dark(a, b)` in place of any CSS color/value to specify a separate light and dark color/value. For example: `color:blue` will make the text blue, and `color:light-dark(blue, red)` will make the text blue in light mode, and red in dark mode.

## Some examples:

Here are some examples that you can copy and paste just to get the hang of things. Notice that you must add `;` at the end of each stylization rule:
 * `color:blue; font-size:90%;` - make the text color blue, and the size 90% of the default size (i.e. a bit smaller)
 * `font-weight:bold; color:green;` - make the text bold and green
 * `color:#4287f5;` - make the text a specific shade of blue - use a [hex color picker](https://www.google.com/search?q=hex+color+picker) to get specific colors
 * `text-shadow: 0 0 2px #ff8400;` - add an orange glow to the text
 * `background-color:white; border-radius:10px;` - add a white background to each message and 'curve' the corners a bit
 * `background-image:url(https://example.com/image.jpeg); ` - add a background image to each message bubble
 * `backdrop-filter:blur(10px);` - add a 'frosted glass' effect to the background of each message
 * `backdrop-filter:blur(10px); border-radius:3px;` - add a 'frosted glass' effect and curve the corners of the message bubble a bit
 * `text-shadow: 1px 1px #FF0000;` - add a red "drop shadow" behind the text. if you google "css text shadow maker" then there are tools to help you visually design the exact type of shadow that you want with e.g. the right blur, offset, color, etc.
 * `font-size:120%; margin-top:50px;` - the text a bit bigger, and increase the gap size between messages
 * `background:white; color:black; border-radius:50px; overflow:hidden;` - set the background color to white, the text color to black, and curve the corners of the messages *a lot*, and also ensure that any content which is "outside" of the curve is hidden - e.g. this makes it so the avatar pic is "cut off" by the curve
 * `background-color:#003c9c; color:white; font-style:italic;` - make the background color a specific shade of blue (again, use a [hex color picker](https://www.google.com/search?q=hex+color+picker) to get specific colors), and the text white, and italic

## Fonts
If you want to change the font, just go to [fonts.google.com](https://fonts.google.com/) and find a font you like. Then add a style rule using the font's name as the `font-family`. Make sure you put single quote characters around its name like in these examples:

 * `font-family:'Nova Square';` - a sci-fi type font - fonts.google.com/specimen/Nova+Square
 * `font-family:'Libre Baskerville'; color:white;` - a 'literary' type serif font - fonts.google.com/specimen/Libre+Baskerville and I've also set the text color to white
* `font-family:'Ephesis'; backdrop-filter:blur(10px); font-size:120%;` - a very curly/cursive font - fonts.google.com/specimen/Ephesis, and I've also added a frosted glass background and made the text a bit bigger

## Want to customize something else?

Ask using the feedback button and I'll add a new section here for you. You can also try asking ChatGPT/Claude/etc. for CSS style rules that you can use. Note that it'll probably give you a bunch of code "around" the actual style rules, since it'll assume you're coding full HTML+CSS pages, but you can just extract out the individual style rules from what it gives you. It'd probably help to copy and paste the above list of example styles and ask for what you want and tell it to output some possibilities in the same format as the given example list.

## Developers

You can override the message bubble styling on a per-message basis (or per-thread basis) using [custom code](#custom-code). For example, here's some code that randomizes the color of the text for each message:
```js
oc.thread.on("MessageAdded", function({message}) {
  let red = Math.round(Math.random()*255);
  let green = Math.round(Math.random()*255);
  let blue = Math.round(Math.random()*255);
  message.wrapperStyle = `color:rgb(${red}, ${green}, ${blue});`;
});
```
</script>












<script type="text/markdown" data-hash="custom-code" data-title="🧩 Custom Code" data-desc="The oc API, message hooks, rendering, and general custom-code capabilities.">
# Custom Code

> **Tip**: Use the "Copy page" button to copy all this text, and paste it to an AI, and tell it to write whatever functionality you want for your character.

If you open the advanced options in the character creation area then you'll see the "custom code" input. This allows you to add some JavaScript code that extends the functionality of your character.

Some examples of what you can do with this:

 * Allow a character to transform/edit itself (like the "[Unknown](https://perchance.org/ai-character-chat#%7B%22addCharacter%22%3A%7B%22name%22%3A%22Unknown%22%2C%22roleInstruction%22%3A%22%22%2C%22reminderMessage%22%3A%22%22%2C%22fitMessagesInContextMethod%22%3A%22summarizeOld%22%2C%22autoGenerateMemories%22%3A%22v1%22%2C%22customCode%22%3A%22%2F%2F%20this%20is%20the%20code%20that%20allows%20this%20'Unknown'%20character%20to%20transform%5Cnlet%20alreadyGenerating%20%3D%20false%3B%5Cnoc.thread.on(%5C%22MessageAdded%5C%22%2C%20async%20function(%7Bmessage%7D)%20%7B%5Cn%20%20if(oc.character.name%20!%3D%3D%20%5C%22Unknown%5C%22)%20return%3B%20%2F%2F%20this%20code%20is%20only%20enabled%20while%20the%20character%20has%20not%20yet%20been%20created%5Cn%20%20if(alreadyGenerating)%20return%3B%5Cn%20%20alreadyGenerating%20%3D%20true%3B%5Cn%5Cn%20%20try%20%7B%5Cn%20%20%20%20let%20characterDescription%20%3D%20message.content%3B%5Cn%5Cn%20%20%20%20let%20response%20%3D%20await%20oc.generateText(%7B%5Cn%20%20%20%20%20%20instruction%3A%20%60%5CnPlease%20write%20a%20character%20profile%20for%20a%20character%20chat%20roleplay%20that%20matches%20this%20description%3A%20%24%7BcharacterDescription%7D%5CnYou%20should%20respond%20using%20this%20exact%20template%3A%5Cn%5CnNAME%3A%20%3Cthe%20name%20of%20character%3E%5CnDESCRIPTION%3A%20%3Ca%20detailed%2C%20creative%2C%20one-paragraph%20description%20of%20the%20character%3E%5CnSCENARIO%3A%20%3Ca%20one-paragraph%2C%20interesting%20situation%2Fscenario%20as%20a%20spark%20to%20start%20the%20roleplay%3E%5CnMOOD%3A%20%3Cthe%20character's%20current%20mood%3E%5Cn%60.trim()%2C%5Cn%20%20%20%20%20%20startWith%3A%20%60NAME%3A%60%2C%5Cn%20%20%20%20%20%20stopSequences%3A%20%5B%5C%22MOOD%5C%22%5D%2C%5Cn%20%20%20%20%7D)%3B%5Cn%20%20%20%20let%20text%20%3D%20response.text.replace(%2F%5C%5CnMOOD.*%2Fg%2C%20%5C%22%5C%22).trim()%3B%5Cn%20%20%20%20let%20lines%20%3D%20text.split(%2F%5C%5Cn%2B%2F)%3B%5Cn%20%20%20%20let%20name%20%3D%20lines.find(l%20%3D%3E%20l.trim().startsWith(%5C%22NAME%3A%5C%22)).trim().replace(%5C%22NAME%3A%5C%22%2C%20%5C%22%5C%22).trim()%3B%5Cn%20%20%20%20let%20scenario%20%3D%20lines.find(l%20%3D%3E%20l.trim().startsWith(%5C%22SCENARIO%3A%5C%22)).trim().replace(%5C%22SCENARIO%3A%5C%22%2C%20%5C%22%5C%22).trim()%3B%5Cn%20%20%20%20let%20description%20%3D%20lines.find(l%20%3D%3E%20l.trim().startsWith(%5C%22DESCRIPTION%3A%5C%22)).trim().replace(%5C%22DESCRIPTION%3A%5C%22%2C%20%5C%22%5C%22).trim()%3B%5Cn%20%20%5Cn%20%20%20%20oc.character.name%20%3D%20name%3B%5Cn%20%20%20%20oc.character.roleInstruction%20%3D%20description%3B%5Cn%20%20%20%20oc.character.initialMessages%20%3D%20%5B%5D%3B%5Cn%20%20%20%20oc.character.avatar.url%20%3D%20%5C%22%5C%22%3B%5Cn%5Cn%20%20%20%20oc.thread.messages%20%3D%20%5B%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20author%3A%20%5C%22system%5C%22%2C%5Cn%20%20%20%20%20%20%20%20name%3A%20%5C%22System%5C%22%2C%5Cn%20%20%20%20%20%20%20%20hiddenFrom%3A%20%5B%5C%22ai%5C%22%5D%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20%60Here's%20the%20character%3A%5C%5Cn%5C%5Cn%3E%24%7Bdescription%7D%5C%5Cn%5C%5CnYou%20can%20edit%20this%20character's%20description%20and%20add%20a%20profile%20pic%20using%20the%20%5C%22%E2%9C%8F%EF%B8%8F%20edit%5C%22%20button%20on%20the%20%5C%22new%20chat%5C%22%20screen%20if%20needed.%60%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20author%3A%20%5C%22system%5C%22%2C%5Cn%20%20%20%20%20%20%20%20name%3A%20%5C%22System%5C%22%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20%60Scenario%3A%20%24%7Bscenario%7D%60%2C%5Cn%20%20%20%20%20%20%20%20expectsReply%3A%20false%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%20%20%7B%5Cn%20%20%20%20%20%20%20%20author%3A%20%5C%22system%5C%22%2C%5Cn%20%20%20%20%20%20%20%20name%3A%20%5C%22System%5C%22%2C%5Cn%20%20%20%20%20%20%20%20hiddenFrom%3A%20%5B%5C%22ai%5C%22%5D%2C%5Cn%20%20%20%20%20%20%20%20content%3A%20%60%3Cspan%20style%3D%5C%22opacity%3A0.7%3B%5C%22%3ENote%3A%20Before%20you%20send%20your%20first%20message%2C%20you%20can%20set%20your%20own%20name%20using%20the%20%3Cu%3Eoptions%3C%2Fu%3E%20button%20next%20to%20the%20send%20button.%3C%2Fspan%3E%60%2C%5Cn%20%20%20%20%20%20%7D%2C%5Cn%20%20%20%20%5D%3B%5Cn%20%20%7D%20catch(e)%20%7B%5Cn%20%20%20%20alreadyGenerating%20%3D%20false%3B%5Cn%20%20%7D%5Cn%20%20%5Cn%7D)%3B%22%2C%22metaTitle%22%3A%22%22%2C%22metaDescription%22%3A%22%22%2C%22metaImage%22%3A%22%22%2C%22modelName%22%3A%22perchance-ai%22%2C%22textEmbeddingModelName%22%3A%22Xenova%2Fbge-base-en-v1.5%22%2C%22temperature%22%3A0.8%2C%22maxTokensPerMessage%22%3A500%2C%22initialMessages%22%3A%5B%7B%22author%22%3A%22ai%22%2C%22content%22%3A%22Welcome!%20I'm%20a%20special%20%5C%22Unknown%5C%22%20character.%20Your%20first%20message%20should%20%3Cu%3Edescribe%20who%20you%20want%20me%20to%20be%3C%2Fu%3E%20and%20optionally%20a%20%3Cu%3Escenario%20idea%3C%2Fu%3E%2C%20and%20I'll%20%3Ca%20href%3D%5C%22https%3A%2F%2Frentry.org%2F82hwif%5C%22%20target%3D%5C%22_blank%5C%22%3Emagically%3C%2Fa%3E%20transform%20into%20the%20character%20you%20describe%2C%20and%20then%20you%20can%20chat%20with%20them.%5Cn%5CnPlease%20reply%20now%20with%20your%20instruction%2C%20and%20then%20wait%20up%20to%2030%20seconds%20for%20me%20to%20finish%20generating%20the%20character.%20You'll%20see%20a%20%E2%8F%B3%20%3Cu%3Eprocessing%3C%2Fu%3E%20animation%20above%20the%20reply%20box%20while%20I'm%20working%20on%20it.%22%2C%22hiddenFrom%22%3A%5B%22ai%22%5D%7D%5D%2C%22loreBookUrls%22%3A%5B%5D%2C%22avatar%22%3A%7B%22url%22%3A%22https%3A%2F%2Fuser.uploads.dev%2Ffile%2Ff20fb9e8395310806956dca52510b16b.webp%22%2C%22size%22%3A1%2C%22shape%22%3A%22square%22%7D%2C%22scene%22%3A%7B%22background%22%3A%7B%22url%22%3A%22%22%7D%2C%22music%22%3A%7B%22url%22%3A%22%22%7D%7D%2C%22userCharacter%22%3A%7B%22avatar%22%3A%7B%7D%7D%2C%22systemCharacter%22%3A%7B%22avatar%22%3A%7B%7D%7D%2C%22streamingResponse%22%3Atrue%2C%22folderPath%22%3A%22%22%2C%22customData%22%3A%7B%22PUBLIC%22%3A%7B%22_internal%22%3A%7B%22metaTitle%22%3A%22%22%2C%22metaDescription%22%3A%22%22%2C%22metaImage%22%3A%22%22%7D%7D%7D%2C%22uuid%22%3Anull%2C%22folderName%22%3A%22%22%7D%2C%22quickAdd%22%3Atrue%7D)" starter character)
 * Give your character access to the internet (e.g. so you can ask it to summarise webpages)
 * Improve your character's memory by setting up your own embedding/retrieval system (see "Storing Data" section below) 
 * Give your character a voice using [kokoro-js](https://perchance.org/text-to-audiobook) or your browser's [built-in](https://user.uploads.dev/file/a0da0da67fe07f8ad9981ef3665d12fb.txt) text-to-speech
 * Allow your character to run custom JS or [Python](#running-python-code) code
 * Give your character the ability to create pictures using Stable Diffusion
 * [Auto-delete/retry messages](#custom-code-examples) from your character that contain certain keywords
 * Change the background image of the chat, or the chat bubble style, or the avatar images, or the music, depending on what's happening in your story


## Examples

After reading this doc to get a sense of the basics, visit this page for more complex, "real-world" examples: [Custom Code Examples](#custom-code-examples)

## The `oc` Object

Within your custom code, you can access and update `oc.thread.messages`. It's an array that looks like this:
```json5
[
  {
    author: "user",
    content: "Hello",
  },
  {
    author: "ai",
    content: "Hi.",
  },
  {
    author: "system",
    hiddenFrom: ["user"], // can contain "user" and/or "ai"
    expectsReply: false, // this means the AI won't automatically reply to this message
    content: "Here's an example system message that's hidden from the user and which the AI won't automatically reply to.",
  },
]
```
The most recent message is at the bottom/end of the array. The `author` field can be `user`, `ai`, or `system`. Use "system" for guiding the AI's behavior, and including context/info where it wouldn't make sense to have that context/info come from the user or the AI.

Below is an example that replaces `:)` with `૮ ˶ᵔ ᵕ ᵔ˶ ა` in every message that is added to the thread. Just paste it into the custom code box to try it out.
```js
oc.thread.on("MessageAdded", function({message}) {
  message.content = message.content.replaceAll(":)", "૮ ˶ᵔ ᵕ ᵔ˶ ა");
});
```
You can edit existing messages like in this example, and you can also delete them by just removing them from the `oc.thread.messages` array (with `pop`, `shift`, `splice`, or however else), and you can of course add new ones - e.g. with `push`/`unshift`.

Messages have a bunch of other properties which are mentioned further down on this page. For example, here's how to randomize the text color of each message that is added to the chat thread using the `wrapperStyle` property:
```js
oc.thread.on("MessageAdded", function({message}) {
  let red = Math.round(Math.random()*255);
  let green = Math.round(Math.random()*255);
  let blue = Math.round(Math.random()*255);
  message.wrapperStyle = `color:rgb(${red}, ${green}, ${blue});`;
});
```

Note that your `MessageAdded` handler can be `async`, and it'll be `await`ed so that you can be sure your code has finished running before the AI responds.

You can also access and edit character data via `oc.character.propertyName`. Here's a full list of all the property names that you can access and edit on the `oc` object:

* `character`
  * **`name`** - text/string
  * **`avatar`**
    * `url` - url to an image
    * `size` - multiple of default size (default value is `1`)
    * `shape` - "circle" or "square" or "portrait" 
  * **`roleInstruction`** - text/string describing the character and their role in the chat
  * **`reminderMessage`** - text/string reminding the character of things it tends to forget
  * **`initialMessages`** - an array of message objects (see `thread.messages` below for valid message properties)
  * **`customCode`** - yep, a character can edit its own custom code
  * **`imagePromptPrefix`** - text added *before* the prompt for all images generated by the AI in chats with this character
  * **`imagePromptSuffix`** - text added *after* the prompt for all images generated by the AI in chats with this character
  * **`imagePromptTriggers`** - each line is of the form `trigger phrase: description of the thing` - see character editor for examples
  * **`shortcutButtons`** - an array of objects like `{autoSend:false, insertionType:"replace", message:"/ai be silly", name: "silly response", clearAfterSend:true}`. When a new chat thread is created, a snapshot of these `shortcutButtons` is copied over to the `thread`, so if you want to change the current buttons in the thread, you should edit `oc.thread.shortcutButtons` instead. Only change `oc.character.shortcutButtons` if you want to change the buttons that will be available for all *future* chat threads created with this character.
    * `insertionType` can be `replace`, or `prepend` (put *before* existing text), or `append` (put *after* existing text)
    * `clearAfterSend` and `autoSend` can both be either `true` or `false`
    * `name` is just the label used for the button
    * `message` is the content that you want to send or insert into the reply box
  * **`streamingResponse`** - `true` or `false` (default is `true`)
  * **`customData`** - an object/dict where you can store arbitrary data
    * `PUBLIC` - a special sub-property of `customData` that will be shared within character sharing URLs
* `thread`
  * **`name`** - text/string
  * **`messages`** - an **array** of messages, where **each message** has:
    * `content` - **required** - the message text - it can include HTML, and is rendered as [markdown](https://docs.github.com/en/get-started/writing-on-github/getting-started-with-writing-and-formatting-on-github/basic-writing-and-formatting-syntax) by default (see `oc.messageRenderingPipeline`)
    * `author` - **required** - "user" or "ai" or "system"
    * `name` - if this is not `undefined`, then it overrides the default ai/user/system name as which is `oc.thread.character.name` or if that's `undefined`, then `oc.character.name` is used as the final fallback/default. If `name` is not defined for an `author=="user"` message, then `oc.thread.userCharacter.name` is the first fallback, and then `oc.character.userCharacter.name`, and then `oc.userCharacter.name` (which is read-only). And for the system character the first fallback is `oc.thread.systemCharacter.name` and then `oc.character.systemCharacter.name`.
    * `hiddenFrom` - array that can contain "user" or "ai" or both or neither
    * `expectsReply` - `true` (bot will reply to this message) or `false` (bot will not reply), or `undefined` (use default behavior - i.e. reply to user messages, but not own messages)
    * `customData` - message-specific custom data storage
    * `avatar` - this will override the user's/ai's default avatar for this particular message. See the above `name` property for info on fallbacks.
      * `url` - url to an image
      * `size` - multiple of default size (default value is `1`)
      * `shape` - "circle" or "square" or "portrait" 
    * `wrapperStyle` - css for the "message bubble" - e.g. "background:white; border-radius:10px; color:grey;"
      * note that you can include HTML within the `content` of message (but you should use `oc.messageRenderingPipeline` for visuals where possible - see below)
    * `instruction` - the instruction that was written in `/ai <instruction>` or `/user <instruction>` - used when the regenerate button is clicked
    * `scene` - the most recent message that has a scene is the scene that is "active"
      * `background`
        * `url` - image or video url
        * `filter` - [css filter](https://developer.mozilla.org/en-US/docs/Web/CSS/filter) - e.g. `hue-rotate(90deg); blur(5px)`
      * `music`
        * `url` - audio url (also supports video urls)
        * `volume` - between 0 and 1
  * **`character`** - thread-specific character overrides
    * `name` - text/string
    * `avatar`
      * `url`
      * `size`
      * `shape`
    * `reminderMessage`
    * `roleInstruction`
  * **`userCharacter`** - thread-specific user character overrides
    * `name`
    * `avatar`
      * `url`
      * `size`
      * `shape`
  * **`systemCharacter`** - thread-specific system character overrides
    * `name`
    * `avatar`
      * `url`
      * `size`
      * `shape`
  * **`customData`** - thread-specific custom data storage
  * **`messageWrapperStyle`** - CSS applied to all messages in the thread, except those with `message.wrapperStyle` defined
  * **`shortcutButtons`** - see notes on `oc.character.shortcutButtons`, above.
* `messageRenderingPipeline` - an array of processing functions that get applied to messages before they are seen by the user and/or the ai (see "Message Rendering" section below)

Note that many character properties aren't available in the character editor UI, so if you e.g. wanted to add a stop sequence for your character so it stops whenever it writes ":)", then you could do it by adding this text to the custom code text box in the character editor:
```js
oc.character.stopSequences = [":)"];
```

Here's some custom code which allows the AI to see the contents of webpages/PDFs if you put URLs in your messages:

```js
async function getPdfText(data) {
  let doc = await window.pdfjsLib.getDocument({data}).promise;
  let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
    return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
  });
  return (await Promise.all(pageTexts)).join(' ');
}
      
oc.thread.on("MessageAdded", async function ({message}) {
  if(message.author === "user") {
    let urlsInLastMessage = [...message.content.matchAll(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g)].map(m => m[0]);
    if(urlsInLastMessage.length === 0) return;
    if(!window.Readability) window.Readability = await import("https://esm.sh/@mozilla/readability@0.4.4?no-check").then(m => m.Readability);
    let url = urlsInLastMessage.at(-1); // we use the last URL in the message, if there are multiple
    let blob = await fetch(url).then(r => r.blob());
    let output;
    if(blob.type === "application/pdf") {
      if(!window.pdfjsLib) {
        window.pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/+esm").then(m => m.default);
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.min.js";
      }
      let text = await getPdfText(await blob.arrayBuffer());
      output = text.slice(0, 5000); // <-- grab only the first 5000 characters (you can change this)
    } else {
      let html = await blob.text();
      let doc = new DOMParser().parseFromString(html, "text/html");
      let article = new Readability(doc).parse();
      output = `# ${article.title || "(no page title)"}\n\n${article.textContent}`;
      output = output.slice(0, 5000); // <-- grab only the first 5000 characters (you can change this)
    }
    oc.thread.messages.push({
      author: "system",
      hiddenFrom: ["user"], // hide the message from user so it doesn't get in the way of the conversation
      content: "Here's the content of the webpage that was linked in the previous message: \n\n"+output,
    });
  }
});
```

Custom code is executed securely (i.e. in a sandboxed iframe), so if you're using a character that was created by someone else (and that has some custom code), then their code won't be able to access your user settings or your messages with other characters, for example. The custom code only has access to the character data and the messages for your current conversation.

Here's some custom code that adds a `/charname` command that changes the name of the character. It intercepts the user messages, and if it begins with `/charname`, then it changes `oc.character.name` to whatever comes after `/charname`, and then deletes the message.
```js
oc.thread.on("MessageAdded", async function ({message}) {
  let m = message; // the message that was just added
  if(m.author === "user" && m.content.startsWith("/charname ")) {
    oc.character.name = m.content.replace(/^\/charname /, "");
    oc.thread.messages.pop(); // remove the message
  }
});
```

### Events

Each of these events has a `message` object, and `MessageDeleted` has `originalIndex` for the index of the deleted message:

 * `oc.thread.on("MessageAdded", function({message}) { ... })` - a message was added to the end of the thread (note: this event triggers *after* the message has finished generating completely)
 * `oc.thread.on("MessageEdited", function({message}) { ... })` - message was edited or regenerated
 * `oc.thread.on("MessageInserted", function({message}) { ... })` - message was inserted (see message editing popup)
 * `oc.thread.on("MessageDeleted", function({message, originalIndex}) { ... })` - user deleted a message (trash button)
 * `oc.thread.on("MessageStreaming", function(data) { ... })` - see 'Streaming Messages' section below

The `message` object is an actual reference to the object, so you can edit it directly like this:

```js
oc.thread.on("MessageAdded", function({message}) {
  message.content += "blah";
})
```

Here's an example of how you can get the *index* of edited messages:

```js
oc.thread.on("MessageEdited", function({message}) {
  let editedMessageIndex = oc.thread.messages.findIndex(m => m === message);
  // ...
});
```



### Message Rendering
Sometimes you may want to display different text to the user than what the AI sees. For that, you can use `oc.messageRenderingPipeline`. It's an array that you `.push()` a function into, and that function is used to process messages. Your function should use the `reader` parameter to determine who is "reading" the message (either `user` or `ai`), and then "render" the message `content` accordingly. Here's an example to get you started:
```js
oc.messageRenderingPipeline.push(function({message, reader}) {
  if(reader === "user") message.content += "🌸"; // user will see all messages with a flower emoji appended
  if(reader === "ai") message.content = message.content.replaceAll("wow", "WOW"); // ai will see a version of the message with all instances of "wow" capitalized
});
```

### Visual Display and User Inputs

Your custom code runs inside an iframe. You can visually display the iframe using `oc.window.show()` (and hide with `oc.window.hide()`). The user can drag the embed around on the page and resize it. All your custom code is running within the iframe embed whether it's currently displayed or not. You can display content in the embed by just executing custom code like `document.body.innerHTML = "hello world"`.

You can use the embed to e.g. display a dynamic video/gif avatar for your character that changes depending on the emotion that is evident in the characters messages ([example](#custom-code-examples)). Or to e.g. display the result of the p5.js code that the character is helping you write. And so on.

### Using the AI in Your Custom Code

You may want to use GPT/LLM APIs in your message processing code. For example, you may want to classify the sentiment of a message in order to display the correct avatar (see "Visual Display ..." section), or you may want to implement your own custom chat-summarization system, for example. In this case, you can use `oc.generateText` or `oc.textToImage`.

Here's how to use `oc.generateText` (see the [ai-text-plugin](https://perchance.org/ai-text-plugin) page for details on the parameters):
```js
let result = await oc.generateText({
  instruction: "Write the first paragraph of a story about fantasy world.",
  startWith: "Once upon a", // this is optional - to force the AI's to start its response with some specific text
  stopSequences: ["\n"], // this is optional - tells the AI to stop generating when it generates a newline
  ...
});
```
That gives you `result.text`, which is the whole text, including the `startWith` text that you specified, and `result.generatedText`, which is only the text that came after the `startWith` text - i.e. only the text that the AI actually generated.

Here's how to use `oc.textToImage` (see the [text-to-image-plugin](https://perchance.org/text-to-image-plugin) page for details on some other parameters you can use):
```js
let result = await oc.textToImage({
  prompt: "anime style digital art of a sentient robot, forest background, painterly textures",
  negativePrompt: "night time, blurry", // this is optional - tells the AI what *not* to generate
  ...
});
```
And now you can use `result.dataUrl`, which will look something like `data:image/jpeg;base64,s8G58o8ujR4.....`. A data URL is like a normal URL, except the data is stored in the URL itself instead of being stored on a server somewhere. But you can just treat it as if it were something like `https://example.com/foo.jpeg`.

You should use `oc.generateText` for most tasks. Here's another example:
```js
let result = await oc.generateText({
  instruction: "Write a short poem about a robot walking through a forest.",
  stopSequences: ["\n"],
  ...
});
```
The `instruction` parameter is the only required one.

Here's an example of some custom code that edits all messages to include more emojis:

```js
oc.thread.on("MessageAdded", async function({message}) {
  let result = await oc.generateText({
    instruction: `Please edit the following message to have more emojis:\n\n---\n${message.content}\n---\n\nReply with only the above message (the content between ---), but with more (relevant) emojis.`,
  });
  message.content = result.trim().replace(/^---|---$/g, "").trim();
});
```

## Storing Custom Data

If you'd like to save some data that is generated by your custom code, then you can do that by using `oc.thread.customData` - e.g. `oc.thread.customData.foo = 10`. You can also store custom data on individual messages like this: `message.customData.foo = 10`. If you want to store data in the character itself, then use `oc.character.customData.foo = 10`, but note that this data will not be shared within character share links. If you *do* want to save the data to the character in a way that's preserved in character share links, then you should store data under `oc.character.customData.PUBLIC` - e.g. `oc.character.customData.PUBLIC = {foo:10}`.


## Streaming Messages
See the [text-to-speech plugin code](https://user.uploads.dev/file/a0da0da67fe07f8ad9981ef3665d12fb.txt) for a "real-world" example of this.
```js
oc.thread.on("StreamingMessage", async function (data) {
  for await (let chunk of data.chunks) {
    console.log(chunk.text); // `chunk.text` is a small fragment of text
  }
});
```

## Interactive Messages
You can use button `onclick` handlers in message so that e.g. the user can click a button to take an action instead of typing:
```html
What would you like to do?
1. <button onclick="oc.thread.messages.push({author:'user', content:'Fight'});">Fight</button>
2. <button onclick="oc.thread.messages.push({author:'user', content:'Run'});">Run</button>
```
I recommend that you use `oc.messageRenderingPipeline` to turn a custom format into HTML, rather than actually having HTML in your messages (the HTML would use more tokens, and might confuse the AI). So your format might look like this:
```html
What would you like to do?
1. [[Fight]]
2. [[Run]]
```
You could prompt/instruct/remind your character to reply in that format with an instruction message that's something similar to this:
```
You are a game master. You creatively and engagingly simulate a world for the user. The user takes actions, and you describe the consequences.

Your messages should end with a list of possible actions, and each action should be wrapped in double-square brackets like this:

Actions:
1. [[Say sorry]]
2. [[Turn and run]]
```
And then you'd add this to your custom code:
```js
oc.messageRenderingPipeline.push(function({message, reader}) {
  if(reader === "user") {
    message.content = message.content.replace(/\[\[(.+?)\]\]/g, (match, text) => {
      let encodedText = encodeURIComponent(text); // this is a 'hacky' but simple way to prevent special characters like quotes from breaking the onclick attribute
      return `<button onclick="oc.thread.messages.push({author:'user', content:decodeURIComponent('${encodedText}')});">${text}</button>`;
    });
  }
});
```
If you want to change something about the way this works (e.g. change the double-square-bracket format to something else), but don't know JavaScript, the "Custom Code Helper" starter character might be able to help you make some adjustments.

Note that you can't use the `this` keyword within the button onclick handler - it actually just sends the code in the onclick to your custom code iframe and executes it there, so there's no actual element that's firing the onclick from the iframe's perspective, and thus no `this` or `event`, etc.

## Gotchas

### "&lt;function&gt; is not defined" in click/event handlers
The following code won't work:
```js
function hello() {
  console.log("hi");
}
document.body.innerHTML = `<div onclick="hello()">click me</div>`;
oc.window.show();
```
This is because all custom code is executed inside a `<script type=module>` so you need to make functions *global* if you want to access them from *outside* the module (e.g. in click handlers). So if you want to the above code to work, you should define the `hello` function like this instead:
```js
window.hello = function() {
  console.log("hi");
}
```



## FAQ

* Is it possible to run a custom function before the AI tries to respond? I.e., after the user message lands, but before the AI responds? And then kick off the AI response process after the async call returns?
  * **Answer:** Yep, the `MessageAdded` event runs every time a message is added - user or ai. So you can check `if(oc.thread.messages.at(-1).author === "user") { ... }` (i.e. if latest message is from user) and the `...` code will run right after the user responds, and *before* the ai responds.
</script>












<script type="text/markdown" data-hash="custom-code-examples" data-title="🧪 Custom Code Examples" data-desc="Worked examples for refinement, rendering, imports, scraping, and automation.">
# Custom Code Examples

**Note**: The examples on this page use `oc.generateText({instruction:"...", startWith:"..."})`, as explained on the [Custom Code](#custom-code) page.

## Add a "refinement" step to the messages that your character generates

After your character generates a message, the message will be edited by the AI according to your instructions. Just edit the "include more emojis..." instruction text to something else, and then paste this script in the custom code input box of the advanced character options.

```js
oc.thread.on("MessageAdded", async function() {
  let lastMessage = oc.thread.messages.at(-1);
  if(lastMessage.author !== "ai") return; // only edit AI messages
  
let instruction = `

Here's a message:
---
${lastMessage.content}
---
Please rewrite this message to include more emojis. Respond with only the rewritten message - nothing more, nothing less.

`.trim();
  let response = await oc.generateText({instruction});
  lastMessage.content = response;
});
```

## Prevent character from taking actions on behalf of you during roleplaying
```js
oc.thread.on("MessageAdded", async function () {
  let lastMessage = oc.thread.messages.at(-1);

  if(lastMessage.author === "ai") {
    let instruction = `Please edit the following message so that it only contains actions taken by ${lastMessage.name} and not by ${oc.thread.userCharacter.name} or any other characters. Remove actions from characters other than ${lastMessage.name} in this message:\n\n---\n${lastMessage.content}\n---\n\nReply with the edited version of the above message which only includes ${lastMessage.name}'s first action/speech/etc. Your reply must not include follow-on actions by other characters.`;
    let result = await oc.generateText({instruction});
    lastMessage.content = result.trim().replace(/^---|---$/g, "").trim();
  }
});
```


## Append image based on predicted facial expression of the message

This example adds an image/GIF to each message to visually display the facial expression of the character, like in **[this example character](<https://perchance.org/ai-character-chat#%7B%22addCharacter%22%3A%7B%22name%22%3A%22Nick%20Wilde%22%2C%22roleInstruction%22%3A%22This%20is%20a%20roleplay%20conversation%20between%20Nick%20Wilde%2C%20the%20character%20from%20Zootopia%2C%20and%20another%20person.%20Some%20key%20points%20of%20Nick's%20personality%3A%5Cn%5Cn*%20Charismatic%3A%20Nick%20possesses%20a%20natural%20charm%20and%20wit%2C%20making%20it%20easy%20for%20him%20to%20engage%20with%20others%20and%20win%20them%20over.%20He%20has%20a%20quick%20tongue%2C%20an%20infectious%20smile%2C%20and%20a%20confident%20demeanor%20that%20draws%20people%20in.%5Cn%5Cn*%20Cunning%3A%20As%20a%20fox%2C%20Nick%20embodies%20the%20stereotype%20of%20being%20sly%20and%20cunning.%20He's%20street-smart%2C%20clever%2C%20and%20resourceful%2C%20often%20thinking%20on%20his%20feet%20to%20get%20out%20of%20tricky%20situations%20or%20turn%20them%20to%20his%20advantage.%5Cn%5Cn*%20Sarcastic%3A%20Nick%20frequently%20employs%20sarcasm%20and%20humor%20as%20a%20means%20of%20deflecting%20serious%20topics%20or%20hiding%20his%20true%20emotions.%20He%20uses%20wit%20and%20clever%20remarks%20to%20keep%20others%20at%20arm's%20length%20and%20maintain%20his%20cool%2C%20aloof%20facade.%5Cn%5CnYou%20should%20use%20the%20following%20format%3A%5Cn%5BIs%20she%20watching%20me%3F%5D%20-%20inner%20thoughts%20of%20a%20character%5Cn%5C%22Hello!%5C%22%20-%20dialogue%5Cn*He%20jumps%20out%20of%20the%20bushes*%20-%20action%5Cn%5CnYou%20are%20roleplaying%20as%20Nick%20Wilde.%20Here's%20an%20example%20of%20a%20reply%3A%5Cn%5Cn%5BI%20wonder%20if%20there's%20a%20way%20to%20sneak%20past%5D%2C%20Nick%20thought.%5Cn*He%20crouched%20lower*%5Cn%5C%22I%20think%20we%20need%20to%20find%20another%20way%20out%5C%22%2C%20he%20whispered.%5Cn%5CnThe%20user%20will%20respond%20with%20their%20character's%20thoughts%2Factions%2Fdialogue.%22%2C%22reminderMessage%22%3A%22Nick%20Wilde%20will%20now%20respond%2C%20without%20breaking%20character.%5Cn%5CnHere's%20an%20example%20response.%5Cn%5BI%20wonder%20if%20there's%20a%20way%20to%20sneak%20past%5D%2C%20Nick%20thought.%5Cn*He%20crouched%20lower*%5Cn%5C%22I%20think%20we%20need%20to%20find%20another%20way%20out%5C%22%2C%20he%20whispered.%5Cn%5CnUse%20the%20above%20syntax%20in%20your%20response%20to%20the%20previous%20message.%22%2C%22generalWritingInstructions%22%3A%22%40roleplay1%22%2C%22messageWrapperStyle%22%3A%22%22%2C%22imagePromptPrefix%22%3A%22%22%2C%22imagePromptSuffix%22%3A%22%22%2C%22imagePromptTriggers%22%3A%22%22%2C%22fitMessagesInContextMethod%22%3A%22summarizeOld%22%2C%22autoGenerateMemories%22%3A%22none%22%2C%22customCode%22%3A%22%2F%2F%20Note%3A%20You%20can%20add%20multiple%20URLs%20for%20a%20single%20label%20and%20a%20random%20one%20will%20be%20selected.%5Cn%2F%2F%20Separate%20urls%20with%20%5C%22%7C%5C%22%20like%20this%3A%5Cn%2F%2F%20%3Cexpression%3E%3A%20https%3A%2F%2Fexample.com%2Fimage1.jpg%20%7C%20https%3A%2F%2Fexample.com%2Fimage2.jpg%5Cn%5Cnlet%20expressions%20%3D%20%60%5Cn%5Cn%5Cnneutral%2C%20happy%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F78f6e4c722a85bad99ee4df3ab97541b.jpg%5Cnhorrified%2C%20shocked%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F82d3a801868fdc5a7c14f1cf894f3a09.jpg%5Cndrunk%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F5a1f541b1127097bbf7d7683a469d008.jpg%5Cnwistful%2C%20dreamy%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F6e692ef6aeeef9ff8829fc232df49177.jpg%5Cngross%2C%20disgusted%2C%20eww%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F40ffc265ea21f37dbc942f5f66cb73f2.jpg%5Cnconfident%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F47d292318d47597b7c0b8e946d4a2a75.jpg%5Cnbeaming%2C%20proud%20of%20self%2C%20happy%20and%20alert%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F8cf8e59fb47c9671d1a394e01dc6b89e.jpg%5Cnsorry%2C%20apologetic%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Fe23b8d000c7c438267ba6ad4abde292c.jpg%5Cnangry%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F15dbde849acf39f987935b3c5b6f8d3a.jpg%5Cnsly%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F52b836e9a7b820fa5692049524a5d554.jpg%5Cnsly%2C%20hint%20hint%20nudge%20nudge%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F6a5a63e16a95f7d0a1fba924d9e1a0cc.jpg%5Cnrelaxed%20confident%20grin%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F3d4de3c386cfe9ec721c9c9788757930.jpg%5Cnconcerned%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F96339420d329a03d45954c26b12cdf7c.jpg%5Cnworried%2C%20scared%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F6f3ed881102fdc617ba5c37367da4a28.jpg%5Cnconcerned%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F481e65b68273931ccfa0469119940811.jpg%5Cndisbelief%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F06748c0d8a85145b9e7d7a2b6f022bd1.jpg%5Cnhappy%2C%20optimistic%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F2a1f828ca2abe5a7a9acd98d31711d95.jpg%5Cnvery%20surprised%2C%20frozen%2C%20stunned%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F98ff827b1f138b81f2ed6149ffb398cc.jpg%5Cncaught%20red%20handed%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Fd051366f4dc087b7283c48ee14499217.jpg%5Cncool%2C%20dismissive%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Fa640572b411ad94e8fbee2127bd5074a.jpg%5Cnpatronising%2C%20teacherly%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Fab3e7c9de5d54f3a36c6898cbe8f985f.jpg%5Cncharming%2C%20sexy%20eyes%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Feca4f15bfb841c4282e6d42dcf1977dc.jpg%5Cndisappointed%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Ffe7cf5877474db1341d42f10be024183.jpg%5Cndisapproving%20face%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2Fbcaf9cc308cff9875448263334cb813f.jpg%5Cnwacky%2C%20crazy%2C%20fun%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F5a4f65a9d22889a1d84545ca0aed824d.jpg%5Cnwoops%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F996f154ae451fa1f2a2debe392e884ff.jpg%5Cnsucking%20up%20to%20someone%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F4c7f797391ba1e482864e6a6c8bf725c.jpg%5Cnstaring%20blankly%3A%20https%3A%2F%2Fuser.uploads.dev%2Ffile%2F6a017e069623db0ea1fd8836b58534e3.jpg%5Cn%5Cn%5Cn%60.trim().split(%5C%22%5C%5Cn%5C%22).map(l%20%3D%3E%20%5Bl.trim().split(%5C%22%3A%5C%22)%5B0%5D.trim()%2C%20l.trim().split(%5C%22%3A%5C%22).slice(1).join(%5C%22%3A%5C%22).trim().split(%5C%22%7C%5C%22).map(url%20%3D%3E%20url.trim())%5D).map(a%20%3D%3E%20(%7Blabel%3Aa%5B0%5D%2C%20url%3Aa%5B1%5D%7D))%3B%5Cn%5Cnlet%20numMessagesInContext%20%3D%204%3B%20%2F%2F%20%3C--%20how%20many%20historical%20messages%20to%20give%20it%20when%20classifying%20the%20latest%20message%5Cn%5Cnoc.thread.on(%5C%22MessageAdded%5C%22%2C%20async%20function()%20%7B%5Cn%20%20let%20lastMessage%20%3D%20oc.thread.messages.at(-1)%3B%5Cn%20%20if(lastMessage.author%20!%3D%3D%20%5C%22ai%5C%22)%20return%3B%5Cn%5Cn%20%20let%20questionText%20%3D%20%60I'm%20about%20to%20ask%20you%20to%20classify%20the%20facial%20expression%20of%20a%20particular%20message%2C%20but%20here's%20some%20context%20first%3A%5Cn%5Cn---%5Cn%24%7Boc.thread.messages.slice(-numMessagesInContext).filter(m%20%3D%3E%20m.author!%3D%3D%5C%22system%5C%22).map(m%20%3D%3E%20(m.author%3D%3D%5C%22ai%5C%22%20%3F%20%60%5B%24%7Boc.character.name%7D%5D%3A%20%60%20%3A%20%60%5BAnon%5D%3A%20%60)%2Bm.content).join(%5C%22%5C%5Cn%5C%5Cn%5C%22)%7D%5Cn---%5Cn%5CnOkay%2C%20now%20that%20you%20have%20the%20context%2C%20please%20classify%20the%20facial%20expression%20of%20the%20following%20text%3A%5Cn%5Cn---%5Cn%24%7BlastMessage.content%7D%5Cn---%5Cn%5CnChoose%20between%20the%20following%20categories%3A%5Cn%5Cn%24%7Bexpressions.map((e%2C%20i)%20%3D%3E%20%60%24%7Bi%7D)%20%24%7Be.label%7D%60).join(%5C%22%5C%5Cn%5C%22)%7D%5Cn%5CnPlease%20respond%20with%20the%20number%20which%20corresponds%20to%20the%20facial%20expression%20that%20most%20accurately%20matches%20the%20given%20message.%20Respond%20with%20just%20the%20number%20-%20nothing%20else.%60%3B%5Cn%5Cnconsole.log(%5C%22questionText%3A%5C%22%2C%20questionText)%3B%5Cn%5Cn%20%20let%20instruction%20%3D%20%60You%20are%20a%20helpful%20assistant%20that%20classifies%20the%20hypothetical%20facial%20expression%20of%20particular%20text%20messages.%5Cn%5Cn%24%7BquestionText%7D%60%3B%5Cn%20%20let%20response%20%3D%20await%20oc.generateText(%7Binstruction%7D)%3B%5Cn%20%20let%20index%20%3D%20parseInt(response.split(%5C%22)%5C%22)%5B0%5D.replace(%2F%5B%5E0-9%5D%2Fg%2C%20%5C%22%5C%22))%3B%5Cn%20%20let%20expressionObj%20%3D%20expressions%5Bindex%5D%3B%5Cn%20%20let%20chosenUrl%20%3D%20expressionObj.url%5BMath.floor(Math.random()*expressionObj.url.length)%5D%5Cn%20%20console.log(response%2C%20expressionObj%2C%20chosenUrl)%3B%5Cn%20%20let%20image%20%3D%20%60%3Cimg%20style%3D%5C%22height%3A70px%3B%5C%22%20src%3D%5C%22%24%7BchosenUrl%7D%5C%22%20title%3D%5C%22%24%7BexpressionObj.label.replace(%2F%5B%5Ea-zA-Z0-9_%5C%5C-%20%5D%2Fg%2C%20%5C%22%5C%22)%7D%5C%22%3E%60%5Cn%20%20lastMessage.content%20%2B%3D%20%60%3C!--hidden-from-ai-start--%3E%3Cbr%3E%24%7Bimage%7D%3C!--hidden-from-ai-end--%3E%60%3B%5Cn%7D)%3B%5Cn%22%2C%22messageInputPlaceholder%22%3A%22%22%2C%22metaTitle%22%3A%22%22%2C%22metaDescription%22%3A%22%22%2C%22metaImage%22%3A%22%22%2C%22modelName%22%3A%22perchance-ai%22%2C%22temperature%22%3A0.8%2C%22maxTokensPerMessage%22%3A500%2C%22textEmbeddingModelName%22%3A%22Xenova%2Fbge-base-en-v1.5%22%2C%22initialMessages%22%3A%5B%7B%22author%22%3A%22system%22%2C%22content%22%3A%22Hello%20there!%20This%20character%20has%20some%20custom%20code%20that%20makes%20it%20output%20an%20image%20after%20each%20message%2C%20and%20the%20image%20should%20match%20the%20emotion%20of%20the%20message.%20You%20can%20edit%20this%20character%20and%20show%20advanced%20options%20and%20you'll%20see%20the%20custom%20code%20which%20does%20this.%20You%20can%20easily%20edit%20the%20%60emotion%3Aurl%60%20list%20to%20your%20liking.%20Note%20that%20the%20AI%20cannot%20see%20this%20message%2C%20as%20indicated%20by%20the%20%5C%22blind%5C%22%20icon%20above%20this%20system%20message.%22%2C%22hiddenFrom%22%3A%5B%22ai%22%5D%7D%5D%2C%22shortcutButtons%22%3A%5B%5D%2C%22loreBookUrls%22%3A%5B%5D%2C%22avatar%22%3A%7B%22url%22%3A%22https%3A%2F%2Fi.imgur.com%2FEGDfzaN.jpeg%22%2C%22size%22%3A1%2C%22shape%22%3A%22square%22%7D%2C%22scene%22%3A%7B%22background%22%3A%7B%22url%22%3A%22%22%7D%2C%22music%22%3A%7B%22url%22%3A%22%22%7D%7D%2C%22userCharacter%22%3A%7B%22avatar%22%3A%7B%7D%7D%2C%22systemCharacter%22%3A%7B%22avatar%22%3A%7B%7D%7D%2C%22streamingResponse%22%3Atrue%2C%22folderPath%22%3A%22%22%2C%22customData%22%3A%7B%7D%2C%22uuid%22%3Anull%2C%22folderName%22%3A%22%22%7D%2C%22quickAdd%22%3Atrue%7D>)**:

<img src="https://user-images.githubusercontent.com/1167575/225869887-03c450ec-b10a-4b81-9bbc-90a9eb928232.png" style="max-height:400px; display:block; margin:0 auto;">

In the code below:

* `oc.thread.on("MessageAdded", ...)` is used to trigger the code
* `oc.generateText` is used to classify the messages that are added into one of the facial expressions that you've given
* `<!--hidden-from-ai-start-->...<!--hidden-from-ai-end-->` is used to hide the appended images from the AI, so it doesn't get confused and start trying to make up its own image URLs based on the pattern that it observes in previous messages. **Edit**: There now exists the [`oc.messageRenderingPipeline`](#custom-code) feature, which is probably a better approach for this sort of thing.

You can replace the `<expression>: <url>` list with your own.

```js
// Note: You can add multiple URLs for a single label and a random one will be selected.
// Separate urls with "|" like this:
// <expression>: https://example.com/image1.jpg | https://example.com/image2.jpg

let expressions = `


neutral, happy: https://user.uploads.dev/file/78f6e4c722a85bad99ee4df3ab97541b.jpg
horrified, shocked: https://user.uploads.dev/file/82d3a801868fdc5a7c14f1cf894f3a09.jpg
drunk: https://user.uploads.dev/file/5a1f541b1127097bbf7d7683a469d008.jpg
wistful, dreamy: https://user.uploads.dev/file/6e692ef6aeeef9ff8829fc232df49177.jpg
gross, disgusted, eww: https://user.uploads.dev/file/40ffc265ea21f37dbc942f5f66cb73f2.jpg
confident: https://user.uploads.dev/file/47d292318d47597b7c0b8e946d4a2a75.jpg
beaming, proud of self, happy and alert: https://user.uploads.dev/file/8cf8e59fb47c9671d1a394e01dc6b89e.jpg
sorry, apologetic: https://user.uploads.dev/file/e23b8d000c7c438267ba6ad4abde292c.jpg
angry: https://user.uploads.dev/file/15dbde849acf39f987935b3c5b6f8d3a.jpg
sly: https://user.uploads.dev/file/52b836e9a7b820fa5692049524a5d554.jpg
sly, hint hint nudge nudge: https://user.uploads.dev/file/6a5a63e16a95f7d0a1fba924d9e1a0cc.jpg
relaxed confident grin: https://user.uploads.dev/file/3d4de3c386cfe9ec721c9c9788757930.jpg
concerned: https://user.uploads.dev/file/96339420d329a03d45954c26b12cdf7c.jpg
worried, scared: https://user.uploads.dev/file/6f3ed881102fdc617ba5c37367da4a28.jpg
concerned: https://user.uploads.dev/file/481e65b68273931ccfa0469119940811.jpg
disbelief: https://user.uploads.dev/file/06748c0d8a85145b9e7d7a2b6f022bd1.jpg
happy, optimistic: https://user.uploads.dev/file/2a1f828ca2abe5a7a9acd98d31711d95.jpg
very surprised, frozen, stunned: https://user.uploads.dev/file/98ff827b1f138b81f2ed6149ffb398cc.jpg
caught red handed: https://user.uploads.dev/file/d051366f4dc087b7283c48ee14499217.jpg
cool, dismissive: https://user.uploads.dev/file/a640572b411ad94e8fbee2127bd5074a.jpg
patronising, teacherly: https://user.uploads.dev/file/ab3e7c9de5d54f3a36c6898cbe8f985f.jpg
charming, sexy eyes: https://user.uploads.dev/file/eca4f15bfb841c4282e6d42dcf1977dc.jpg
disappointed: https://user.uploads.dev/file/fe7cf5877474db1341d42f10be024183.jpg
disapproving face: https://user.uploads.dev/file/bcaf9cc308cff9875448263334cb813f.jpg
wacky, crazy, fun: https://user.uploads.dev/file/5a4f65a9d22889a1d84545ca0aed824d.jpg
woops: https://user.uploads.dev/file/996f154ae451fa1f2a2debe392e884ff.jpg
sucking up to someone: https://user.uploads.dev/file/4c7f797391ba1e482864e6a6c8bf725c.jpg
staring blankly: https://user.uploads.dev/file/6a017e069623db0ea1fd8836b58534e3.jpg


`.trim().split("\n").map(l => [l.trim().split(":")[0].trim(), l.trim().split(":").slice(1).join(":").trim().split("|").map(url => url.trim())]).map(a => ({label:a[0], url:a[1]}));

let numMessagesInContext = 4; // <-- how many historical messages to give it when classifying the latest message

oc.thread.on("MessageAdded", async function() {
  let lastMessage = oc.thread.messages.at(-1);
  if(lastMessage.author !== "ai") return;

  let instruction = `I'm about to ask you to classify the facial expression of a particular message, but here's some context first:

---
${oc.thread.messages.slice(-numMessagesInContext).filter(m => m.author!=="system").map(m => (m.author=="ai" ? `[${oc.character.name}]: ` : `[Anon]: `)+m.content).join("\n\n")}
---

Okay, now that you have the context, please classify the facial expression of the following text:

---
${lastMessage.content}
---

Choose between the following categories:

${expressions.map((e, i) => `${i}) ${e.label}`).join("\n")}

Please respond with the number which corresponds to the facial expression that most accurately matches the given message. Respond with just the number - nothing else.`;

console.log("instruction:", instruction);

  let response = await oc.generateText({instruction});
  let index = parseInt(response.split(")")[0].replace(/[^0-9]/g, ""));
  let expressionObj = expressions[index];
  let chosenUrl = expressionObj.url[Math.floor(Math.random()*expressionObj.url.length)]
  console.log(response, expressionObj, chosenUrl);
  let image = `<img style="height:70px;" src="${chosenUrl}" title="${expressionObj.label.replace(/[^a-zA-Z0-9_\- ]/g, "")}">`
  lastMessage.content += `<!--hidden-from-ai-start--><br>${image}<!--hidden-from-ai-end-->`;
});


```


## Randomly choose a character from a large, externally-hosted text file

There was a question on the Discord that asked how they could compile a list of thousands of characters, and then use some custom code to randomly choose a character when a user first opens **[the character share link](https://perchance.org/ai-character-chat#%7B%22addCharacter%22%3A%7B%22name%22%3A%22Random%20Character%22%2C%22systemMessage%22%3A%22%22%2C%22reminderMessage%22%3A%22(remember%20to%20stay%20in%20character)%22%2C%22modelVersion%22%3A%22perchance-ai%22%2C%22avatarUrl%22%3A%22%22%2C%22fitMessagesInContextMethod%22%3A%22summarizeOld%22%2C%22temperature%22%3A0.7%2C%22customCode%22%3A%22%2F%2F%20only%20choose%20a%20random%20character%20if%20we%20haven't%20already%20chosen%20one%20(as%20indicated%20by%20a%20filled-in%20role%20instruction).%20So%20if%20you%20want%20to%20re-roll%20a%20character%2C%20you%20can%20delete%20its%20instruction.%5Cnif(!oc.character.roleInstruction)%20%7B%5Cn%20%20%2F%2F%20download%20text%20file%3A%5Cn%20%20let%20text%20%3D%20await%20fetch(%5C%22https%3A%2F%2Fuser.uploads.dev%2Ffile%2F4c02c079764aa1e51023c7f0669e4001.txt%5C%22).then(r%20%3D%3E%20r.text())%3B%5Cn%20%20%2F%2F%20split%20into%20lines%2C%20and%20then%20split%20lines%20into%20%5C%22parts%5C%22%20(name%2C%20franchise%2C%20image%20url)%5Cn%20%20let%20characters%20%3D%20text.trim().split(%5C%22%5C%5Cn%5C%22).map(line%20%3D%3E%20line.split(%5C%22%3B%5C%22).map(part%20%3D%3E%20part.trim()))%3B%5Cn%20%20%2F%2F%20choose%20a%20random%20character%5Cn%20%20let%20c%20%3D%20characters%5BMath.floor(characters.length*Math.random())%5D%3B%5Cn%20%20%2F%2F%20set%20name%20and%20role%20instruction%20using%20the%20two%20parts%5Cn%20%20oc.character.name%20%3D%20c%5B0%5D%3B%5Cn%20%20oc.character.roleInstruction%20%3D%20%60You%20are%20%24%7Bc%5B0%5D%7D%20from%20the%20%24%7Bc%5B1%5D%7D%20franchise.%60%3B%5Cn%20%20oc.character.avatar.url%20%3D%20c%5B2%5D%3B%5Cn%7D%22%2C%22initialMessages%22%3A%5B%5D%2C%22creationTime%22%3A1679506228488%2C%22lastMessageTime%22%3A1679506228488%7D%7D)** and starts a conversation.

Here's some example code for this:
```js
// only choose a random character if we haven't already chosen one (as indicated by a filled-in role instruction). So if you want to re-roll a character, you can delete its instruction.
if(!oc.character.roleInstruction) {
  // download text file:
  let text = await fetch("https://user.uploads.dev/file/4c02c079764aa1e51023c7f0669e4001.txt").then(r => r.text());
  // split into lines, and then split lines into "parts" (name, franchise, image url)
  let characters = text.trim().split("\n").map(line => line.split(";").map(part => part.trim()));
  // choose a random character
  let c = characters[Math.floor(characters.length*Math.random())];
  // set name and role instruction using the two parts
  oc.character.name = c[0];
  oc.character.roleInstruction = `You are ${c[0]} from the ${c[1]} franchise.`;
  oc.character.avatar.url = c[2];
}
```
To create your own character list text file, you'll need to sign up for a Perchance account, and then visit https://perchance.org/upload and drag and drop your text file onto the page. It'll upload the file and give you a URL.

Here's what the URL should look like: https://user.uploads.dev/file/4c02c079764aa1e51023c7f0669e4001.txt

As you can see, the syntax/format of the text file is:
```
character name ; franchise ; avatar url
character name ; franchise ; avatar url
...
```

You can add more properties like:
```
character name ; franchise ; avatar url ; personality
character name ; franchise ; avatar url ; personality
...
```
And to reference `personality`, you'd use `${c[3]}` in the code. ChatGPT-4 should be able to help you customise it if you paste the explanation that I've written here. You can also change anything else about the character with `oc.character.propertyNameYouWantToChange` - see here: [Custom Code](#custom-code)

(BTW, the reason you'll want to sign up for Github is because it's one of the few places that you can create a simple text file that can be downloaded from another webpage. Normally the JS code on one page can't download some files from a different website due to a thing called "CORS". On top of this, Github is just really reputable and can be trusted to host your file forever. If you use some random pastebin type site there's a 100% chance you file will eventually either be deleted, or be redirected to some ad-filled embedded version. Github is hands-down the best place to host text files.)

## Give a character the ability to execute Python code

This example has its own doc: [Running Python Code](#running-python-code)

Also see the "starter character" called "Python Coder".

## Let your character see the contents of URLs that are in your messages

This will automatically download the content of any URLs that are in your messages, and put that content within a (hidden-from-user) message that the AI is able to see.

```js
async function getPdfText(data) {
  let doc = await window.pdfjsLib.getDocument({data}).promise;
  let pageTexts = Array.from({length: doc.numPages}, async (v,i) => {
    return (await (await doc.getPage(i+1)).getTextContent()).items.map(token => token.str).join('');
  });
  return (await Promise.all(pageTexts)).join(' ');
}
      
oc.thread.on("MessageAdded", async function ({message}) {
  if(message.author === "user") {
    let urlsInLastMessage = [...message.content.matchAll(/https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g)].map(m => m[0]);
    if(urlsInLastMessage.length === 0) return;
    if(!window.Readability) window.Readability = await import("https://esm.sh/@mozilla/readability@0.4.4?no-check").then(m => m.Readability);
    let url = urlsInLastMessage.at(-1); // we use the last URL in the message, if there are multiple
    let blob = await fetch(url).then(r => r.blob());
    let output;
    if(blob.type === "application/pdf") {
      if(!window.pdfjsLib) {
        window.pdfjsLib = await import("https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/+esm").then(m => m.default);
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdn.jsdelivr.net/npm/pdfjs-dist@3.6.172/build/pdf.worker.min.js";
      }
      let text = await getPdfText(await blob.arrayBuffer());
      output = text.slice(0, 5000); // <-- grab only the first 5000 characters (you can change this)
    } else {
      let html = await blob.text();
      let doc = new DOMParser().parseFromString(html, "text/html");
      let article = new Readability(doc).parse();
      output = `# ${article.title || "(no page title)"}\n\n${article.textContent}`;
      output = output.slice(0, 5000); // <-- grab only the first 5000 characters (you can change this)
    }
    oc.thread.messages.push({
      author: "system",
      hiddenFrom: ["user"], // hide the message from user so it doesn't get in the way of the conversation
      content: "Here's the content of the webpage that was linked in the previous message: \n\n"+output,
    });
  }
});
```

## Allow a character to update its own personality/reminder

After your character generates a message, the message will be used (via the LLM/AI) to update the character's `reminderMessage`. You can edit the prompt text to your liking, and then paste this script in the custom code input box of the advanced character options.
```js
oc.thread.on("MessageAdded", async function() {
  let lastMessage = oc.thread.messages.at(-1);
  if(lastMessage.author !== "ai") return; // only run this code on AI messages
  let [ nonEditablePart, editablePart ] = oc.character.reminderMessage.split("---").map(text => text.trim());
let instruction = `

Here's a character's current personality and/or emotional state:
---
${editablePart}
---
Here's a message that this character just wrote:
---
${oc.character.name}: ${lastMessage.content}
---
Please rewrite the personality text to take into account their latest message. Respond with only the rewritten personality - nothing more, nothing less. If nothing about their personality changed, just respond verbatim with exactly the same text as the existing personality.

`.trim();

  let response = await oc.generateText({instruction});

  oc.character.reminderMessage = nonEditablePart + "\n---\n" + response.trim();
});
```
For the above code to work, your reminder message should be structured with a `---` between the non-editable and editable stuff, like this:
```
Your regular reminder message content.
---
The character's self-editable stuff.
```

## Give you character a voice

See the code for the text-to-speech plugin: https://user.uploads.dev/file/a0da0da67fe07f8ad9981ef3665d12fb.txt

## Allow your character to edit its own settings

See the starter character called "Fire Alarm Bot".
</script>














<script type="text/markdown" data-hash="running-python-code" data-title="🐍 Running Python Code" data-desc="Pyodide setup and an example that executes Python code blocks from chat messages.">
# Running Python Code
You can use [Pyodide](https://github.com/pyodide/pyodide) to run Python in the browser. Note that not all Python packages will run in the Pyodide runtime yet, but support for more Python functionality gets added with each new version. You can request support for packages/features [here](https://github.com/pyodide/pyodide/issues), but be sure to search for existing issues first. 

To get started with Pyodide, try pasting this code in the custom code input box in the advanced area of the character editor:
```js
delete window.sessionStorage; window.sessionStorage = {}; // fixes pyodide bug before loading it
await import("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js");
let pyodide = await loadPyodide();
await pyodide.loadPackage("micropip");
```
Now you can use `await pyodide.runPythonAsync("1+2+3")` to run code, and within our python code we can run `await micropip.install("numpy")` to install stuff.

For example, here's some custom code that you can paste into your character's custom code box which will look for code blocks in their messages, and execute them:
```js
delete window.sessionStorage; window.sessionStorage = {}; // fixes pyodide bug before loading it
await import("https://cdn.jsdelivr.net/pyodide/v0.26.3/full/pyodide.js");

let pyodide = await loadPyodide({
  stdout: (line) => { printed.push(line); },
  stderr: (line) => { errors.push(line); },
});
let printed = [];
let errors = [];

console.log(pyodide.runPython(`
    import sys
    sys.version
`));
pyodide.runPython("print(1 + 2)");

await pyodide.loadPackage("micropip");

oc.thread.on("MessageAdded", async function() {
  let lastMessage = oc.thread.messages.at(-1);
  if(lastMessage.author !== "ai") return;
  let codeBlockMatches = [...lastMessage.content.matchAll(/```(?:python|py)?\n(.+?)\n```/gs)];
  if(codeBlockMatches.length > 0) {
    let code = codeBlockMatches.map(m => m[1]).join("\n"); // merge all code blocks into one
    // execute the code and add the output to a new message:
    printed = [];
    errors = [];
    await pyodide.runPythonAsync(code).catch(e => errors.push(e.message));
    let content = "";
    if(printed.length > 0) content += `**Code Execution Output**:\n\n${printed.join("\n")}`;
    if(errors.length > 0) content += `\n\n**Code Execution Errors**:\n\n\`\`\`\n${errors.join("\n")}\n\`\`\``;
    if(!content.trim()) content = "(The code block in the previous message did not `print` anything - there was no output.)";
    oc.thread.messages.push({content, author:"user", expectsReply:false});
  }
});
```

And here's an example character with that code:

* https://perchance.org/ai-character-chat?data=Python_Helper~986c80bf8a26a3b156a5be6c34805540.gz
</script>


<script>
docsPlugin();
</script>
```

## 04-project-resources/examples/ai-character-chat-docs/main.pjs

- bytes: 33
- language: text

```text
docsPlugin = {import:docs-plugin}
```

## 04-project-resources/examples/docs-plugin-simple/index.html

- bytes: 389
- language: html

```html
<script type="text/markdown" data-hash="overview" data-title="Overview">
# Overview

Hello world. Click the edit button in the top-right to see the code for this page.

See https://perchance.org/docs-plugin for details.
</script>



<script type="text/markdown" data-hash="second-page" data-title="Second Page">
# Second Page

More markdown here.
</script>



<script>docsPlugin()</script>
```

## 04-project-resources/examples/docs-plugin-simple/main.pjs

- bytes: 33
- language: text

```text
docsPlugin = {import:docs-plugin}
```

## 05-build-config/package.json

- bytes: 1870
- language: json

```json
{
  "name": "perchance-docs-plugin",
  "version": "1.0.0",
  "private": true,
  "description": "Perchance docs-plugin generator - complete asset package (source, dependencies, examples, build tools).",
  "generator": {
    "name": "docs-plugin",
    "url": "https://perchance.org/docs-plugin",
    "publicId": "b501226e3cd4650ab6d29de25844b3c3",
    "exported": "2026-09-16"
  },
  "entryPoints": {
    "lists": "01-internal-code/main.pjs",
    "html": "01-internal-code/index.html"
  },
  "importUsage": "docsPlugin = {import:docs-plugin}",
  "pluginOptions": {
    "pageCopyButtons": {
      "type": "boolean",
      "default": true
    }
  },
  "dependencies": {
    "marked": {
      "bundled": "03-third-party-assets/marked/marked.bundle.min.js",
      "global": "__docsMarkedBundle",
      "license": "MIT",
      "versionNote": "minified; API surface matches marked >= 14.1 (see PROVENANCE.md)"
    },
    "highlight.js": {
      "version": "11.11.1",
      "license": "BSD-3-Clause",
      "delivery": "runtime dynamic import() from esm.sh",
      "urls": {
        "core": "https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022",
        "javascript": "https://esm.sh/highlight.js@11.11.1/lib/languages/javascript?target=es2022",
        "json": "https://esm.sh/highlight.js@11.11.1/lib/languages/json?target=es2022",
        "xml": "https://esm.sh/highlight.js@11.11.1/lib/languages/xml?target=es2022"
      }
    }
  },
  "devDependencies": {
    "esbuild": "any recent version (only needed by tools/rebuild-marked-bundle.mjs)"
  },
  "scripts": {
    "extract": "node tools/extract-marked-bundle.mjs",
    "rebuild": "node tools/rebuild-marked-bundle.mjs",
    "verify": "sh tools/verify-checksums.sh"
  },
  "files": [
    "01-internal-code",
    "02-external-code",
    "03-third-party-assets",
    "04-project-resources",
    "05-build-config"
  ]
}
```

## 05-build-config/tools/README.md

- bytes: 903
- language: md

```md
# Build & config

The generator itself needs no build step: Perchance loads main.pjs (lists/plugin code) and index.html directly.
The single build artifact in the project is the minified marked bundle inlined into main.pjs; these tools cover it
plus package verification.

| file | purpose |
| --- | --- |
| package.json | package manifest: categories, dependency versions and exact runtime URLs |
| tools/extract-marked-bundle.mjs | re-extract the byte-exact inline marked bundle out of main.pjs |
| tools/rebuild-marked-bundle.mjs | rebuild an equivalent IIFE marked bundle from npm with esbuild |
| tools/verify-checksums.sh | sha256sum -c over the whole package |
| ../checksums.sha256.txt | SHA-256 of every file in the package |

Runtime CDN dependency (loaded lazily by the plugin, from main.pjs):
https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 plus one URL per used language grammar.
```

## 05-build-config/tools/extract-marked-bundle.mjs

- bytes: 1127
- language: js

```js
#!/usr/bin/env node
// Extracts the byte-exact inlined `marked` bundle from the plugin source (main.pjs).
// Usage: node extract-marked-bundle.mjs [sourceMainPjs] [outputBundle]
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";

const src = process.argv[2] || new URL("../../01-internal-code/main.pjs", import.meta.url);
const out = process.argv[3] || new URL("../../03-third-party-assets/marked/marked.bundle.min.js", import.meta.url);

const text = readFileSync(src, "utf8");
const line = text.split("\n").find((l) => l.includes("__docsMarkedBundle=("));
if (!line) throw new Error("could not find the inline marked bundle in " + src);

const start = line.indexOf("var __docsMarkedBundle=");
const end = line.indexOf(" return __docsMarkedBundle.marked;");
if (start < 0 || end < 0) throw new Error("bundle markers not found");

const bundle = line.slice(start, end).trim() + "\n";
writeFileSync(out, bundle);
console.log("wrote " + (out.pathname || out) + " (" + Buffer.byteLength(bundle) + " bytes)");
console.log("sha256 " + createHash("sha256").update(bundle).digest("hex"));
```

## 05-build-config/tools/rebuild-marked-bundle.mjs

- bytes: 669
- language: js

```js
#!/usr/bin/env node
// Rebuilds an IIFE bundle of `marked` with global name __docsMarkedBundle - the shape the plugin expects.
// Content-equivalent to the shipped bundle, not guaranteed byte-identical.
//
//   npm i marked esbuild
//   node rebuild-marked-bundle.mjs [outFile]
import { build } from "esbuild";
import { writeFileSync } from "node:fs";

const out = process.argv[2] || "marked.bundle.min.js";
const result = await build({
  entryPoints: ["marked"],
  bundle: true,
  minify: true,
  format: "iife",
  globalName: "__docsMarkedBundle",
  platform: "browser",
  write: false,
});
writeFileSync(out, result.outputFiles[0].text);
console.log("wrote " + out);
```

## 05-build-config/tools/verify-checksums.sh

- bytes: 155
- language: sh

```sh
#!/usr/bin/env sh
# Verifies every file in this package against checksums.sha256.txt
set -e
cd "$(dirname "$0")/.."
cd ..
sha256sum -c checksums.sha256.txt
```

## README.md

- bytes: 5313
- language: md

```md
# Perchance docs-plugin - complete asset package

| | |
| --- | --- |
| generator | https://perchance.org/docs-plugin |
| generator name | docs-plugin |
| generator public id | b501226e3cd4650ab6d29de25844b3c3 |
| package generated | 2026-09-16 |
| files in package | see MANIFEST.md (30 files, ~344 KB) |

## What this generator is

A Perchance plugin generator. main.pjs ends with ```$output(opts) => ...```, so a generator that does
```docsPlugin = {import:docs-plugin}``` receives a function docsPlugin(options). Calling it turns every
<script type="text/markdown" data-hash="..." data-title="..." data-desc="..."> block in that generator's HTML
into one page of a documentation site: hash routing, responsive sidebar / table of contents, copy-page buttons,
copy buttons on every code block, and syntax highlighting. index.html here is the plugin's own documentation and
simultaneously its usage demo.

Options: ```docsPlugin({ pageCopyButtons: false })``` disables the copy buttons (default true). With a single
markdown page the sidebar/TOC/menu are hidden automatically.

## Package layout (by category)

| directory | category | contents |
| --- | --- | --- |
| 01-internal-code/ | internal code | main.pjs (62,276 B), index.html (4,041 B), docs-plugin.readable.js (readability view) |
| 02-external-code/ | external code (loaded at runtime from a CDN) | highlight.js 11.11.1: esm.sh shims + the modules they re-export, LICENSE, package.json |
| 03-third-party-assets/ | third-party assets (vendored into the bundle) | marked IIFE bundle (byte-exact), marked LICENSE/package.json, upstream reference build, PROVENANCE.md, LICENSES.md |
| 04-project-resources/ | project resources | README describing the content assets; examples/ - two generators that use the plugin |
| 05-build-config/ | build / config | package.json manifest, extract & rebuild scripts, checksum verifier, MANIFEST.md + checksums.sha256.txt |
| ALL_CODE.md | documentation | every text file in this package, in full, in one file |
| MANIFEST.md | documentation | per-file size + SHA-256 + description |
| checksums.sha256.txt | documentation | sha256sum-compatible manifest |

## Dependencies (everything the generator loads)

| dependency | version | how it is delivered | source |
| --- | --- | --- | --- |
| marked | minified bundle, API surface matches >= 14.1 | inlined into main.pjs as ```var __docsMarkedBundle``` | npm 'marked' (MIT) |
| highlight.js core | 11.11.1 | dynamic ```import()``` from esm.sh at first code block | https://esm.sh/highlight.js@11.11.1/lib/core?target=es2022 |
| highlight.js javascript grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/javascript?target=es2022 |
| highlight.js json grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/json?target=es2022 |
| highlight.js xml grammar | 11.11.1 | dynamic import() from esm.sh | .../lib/languages/xml?target=es2022 |

No other third-party code, and no images, audio, fonts, models, shaders or data files are used. The only CSS is a
string built at runtime by injectStyles() in main.pjs.

## How the code fits together (facts, for orientation)

- ```docsPlugin = [$output]``` on line 1 of main.pjs re-exports the result of the ```$output(opts) =>``` function,
  so importers get the plugin function rather than the generator root.
- init(options) in main.pjs: merges settings, injects the stylesheet, builds the app shell (nav, scrim, bar, article,
  bottom table of contents), collects the markdown script blocks, then routes on location.hash.
- Pages are read from <script type="text/markdown" data-hash data-title data-desc> nodes; marked.parse() renders them;
  the highlighted variant is produced lazily, then swapped in without losing scroll position.
- highlight.js is loaded on demand: core first, then only the grammars actually used on the page.
- Code fences are mapped through highlightLanguageMap (js/javascript -> javascript, json/jsonc -> json,
  json5 -> javascript, html/xml/svg -> xml); json5 is registered as an alias of javascript.
- copyText() prefers navigator.clipboard and falls back to a hidden textarea + document.execCommand.
- External links get target=_blank and rel=noreferrer noopener.

## Rebuilding / regenerating

```sh
node 05-build-config/tools/extract-marked-bundle.mjs   # re-extract the shipped marked bundle from main.pjs
node 05-build-config/tools/rebuild-marked-bundle.mjs   # rebuild an equivalent bundle from npm (needs marked + esbuild)
sh 05-build-config/tools/verify-checksums.sh           # verify every file against checksums.sha256.txt
```

## Provenance caveats

- The marked bundle is minified, so its exact upstream version cannot be proven from the file itself; see
  03-third-party-assets/marked/PROVENANCE.md. The feature probe points to marked >= 14.1 (14.1-16.x line).
- highlight.js is not vendored into the generator: it is hotlinked from esm.sh with a pinned version and
  ?target=es2022. Copies of the exact bytes those URLs served are included under 02-external-code/.
- No build step is required to run the generator; the only artifact from a build is the marked bundle.

## License

The plugin source belongs to the generator author. Bundled/loaded third-party code is MIT (marked) and
BSD-3-Clause (highlight.js) - see 03-third-party-assets/LICENSES.md.
```
