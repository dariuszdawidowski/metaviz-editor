<h1 align="center">
Metaviz Editor
</h1>
<p align="center">
Diagramming application for web browser.
<p>
<p align="center">
v0.9.12
<p>

[![build](https://github.com/dariuszdawidowski/metaviz-editor/actions/workflows/build.yml/badge.svg)](https://github.com/dariuszdawidowski/metaviz-editor/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/metaviz-editor)](https://www.npmjs.com/package/metaviz-editor)
[![NPM Downloads](https://img.shields.io/npm/dm/metaviz-editor)](https://www.npmjs.com/package/metaviz-editor)
[![license](https://img.shields.io/github/license/dariuszdawidowski/metaviz-editor?color=9cf)](./LICENSE)

# Install

Clone these dependency repositories next to metaviz-editor project:
```bash
git clone git@github.com:dariuszdawidowski/total-diagram.git
git clone git@github.com:dariuszdawidowski/total-pro-menu.git
git clone git@github.com:dariuszdawidowski/total-text.git
```

Directory structure:
```
project/
|-- metaviz-editor/
|-- total-diagram/
|-- total-pro-menu/
|-- total-text/
```

# Quick Start

Open metaviz-editor/index.html directly in the browser (File->Open file... or just drag&drop).

# Build minified bundle file

```bash
npm install
npm run build
```
Note: This is browser-centric vanilla JavaScript library, npm is only used to minify and bundle files into one.

# Load from CDN

As a library to include in other projects:

https://unpkg.com/metaviz-editor@latest/dist/metaviz-editor.js\
https://unpkg.com/metaviz-editor@latest/dist/metaviz-editor.css


Ready to use bundled webapp:

https://unpkg.com/metaviz-editor@latest/dist/metaviz-editor.html

# Authors

Dariusz Dawidowski\
Maksym Godovanets
