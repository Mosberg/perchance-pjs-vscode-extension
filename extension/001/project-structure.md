# Project Structure

- `package.json` – Extension manifest: language, grammar, snippets, commands, config.
- `syntaxes/perchance-pjs.tmLanguage.json` – TextMate grammar for syntax highlighting.
- `snippets/perchance-pjs.code-snippets.json` – Snippet definitions.
- `language-configuration.json` – Brackets, comments, auto-close/surround behavior.
- `src/extension.ts` – Main extension entry point; registers providers.
- `src/features/completionProvider.ts` – Intelligent completions and snippet suggestions.
- `src/features/diagnosticsProvider.ts` – Real-time linting / error checking.
- `.vscode/launch.json`, `tasks.json` – Debug and build configuration.
- `tsconfig.json` – TypeScript compiler options.
- `README.md` – User-facing documentation.
- `project-structure.md` – This file.
