# Perchance.org \*.pjs Language Support Extension

This extension provides comprehensive language support for Perchance.org \*.pjs code, including its list-based generators, plugin system, and dynamic content features, enabling productive development with syntax highlighting, intelligent code completion, and real-time error checking.

## Features

### Declarative Language Features

- Syntax highlighting for Perchance lists, choices, numbers, strings, references, dynamic odds, and list functions
- Meta highlighting for `meta:` tags (including `meta:import` and `meta:position`) and `$meta` list items
- Property highlighting for assignment blocks, list settings, and async property functions
- Special constructs like `{||}` and `<<<placeholder>>>` markers
- Snippet completion for lists, `$output`, imports, plugins, and HTML scaffolds
- Bracket matching, autoclosing, and autosurrounding for `{}`, `[]`, `()`

## Installation

1. Clone this repository.
2. Run `npm install`.
3. Open in VS Code and press `F5` to launch the Extension Development Host.

## Usage

Open any `.pjs` file to get:

- Full syntax highlighting
- Snippet completions (`list`, `output`, `metaimport`, `html`, etc.)
- Basic diagnostics (e.g., empty list definitions)

## Configuration

- `perchancePjs.enableDiagnostics`: Toggle real-time error checking.

## Project Structure

See [project-structure.md](./project-structure.md).

## License

MIT
