# Build and configuration files

None - and none are possible in the usual sense.

Perchance is a hosted, interpreted platform:

- no package manager, no `package.json`, no lockfile, no `node_modules`
- no bundler, transpiler, minifier or compiler step
- no CI/CD configuration, container or deployment script
- no environment variables or secret files

`main.pjs` is parsed by the Perchance engine on each request; `index.html` is inserted as
the body of the page. Square-bracket blocks are evaluated before the page's scripts run.

## Deployment procedure

1. Open the generator in the Perchance editor (`https://perchance.org/sum-odds-plugin#edit`).
2. Paste `internal-code/main.pjs` into the code editor.
3. Paste `internal-code/index.html` into the HTML editor.
4. Save.

No other steps, files or commands are required.
