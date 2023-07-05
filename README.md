<h1 align="center">
Metaviz Editor
</h1>
<p align="center">
Diagramming editor library for web browser.
</p>
<p align="center">
v0.9.12
</p>
<p align="center">
[![build](https://github.com/dariuszdawidowski/metaviz-editor/actions/workflows/build.yml/badge.svg)](https://github.com/dariuszdawidowski/metaviz-editor/actions/workflows/build.yml)
[![npm](https://img.shields.io/npm/v/metaviz-editor)](https://www.npmjs.com/package/metaviz-editor)
[![NPM Downloads](https://img.shields.io/npm/dm/metaviz-editor)](https://www.npmjs.com/package/metaviz-editor)
[![license](https://img.shields.io/github/license/dariuszdawidowski/metaviz-editor?color=9cf)](./LICENSE)
</p>

# About

Metaviz is a web-based team productivity tool for creating visually stunning diagrams with ease.

Important note: this repository is for developers and contains editor code with development information.
If you want to start using the tool quickly - go to the distribution page https://github.com/dariuszdawidowski/metaviz containing the ready-to-use package.

<img src="https://raw.githubusercontent.com/dariuszdawidowski/metaviz-editor/main/metaviz-editor-showcase.png" />

# Component libraries

Total Diagram: https://github.com/dariuszdawidowski/total-diagram

Total Text: https://github.com/dariuszdawidowski/total-text

Total Pro Menu: https://github.com/dariuszdawidowski/total-pro-menu

# Third party libraries

Emoji Picker: https://github.com/nolanlawson/emoji-picker-element

# Install

Clone these dependency repositories next to metaviz-editor project:
```bash
git clone git@github.com:dariuszdawidowski/total-diagram.git
git clone git@github.com:dariuszdawidowski/total-pro-menu.git
git clone git@github.com:dariuszdawidowski/total-text.git
```

Directory structure:
```
metaviz/
|-- metaviz-editor/
|-- total-diagram/
|-- total-pro-menu/
|-- total-text/
```

Third party libraries are loaded from CDN.

# Quick start in development mode

Open metaviz-editor/index.html directly in the browser (File->Open file... or just drag&drop).

# Build minified bundle files

```bash
npm install
npm run build
```
Note: This is browser-centric vanilla JavaScript library, npm is only used to minify and bundle files into one.

# Load from CDN

https://unpkg.com/metaviz-editor@latest/dist/metaviz-editor.js  
https://unpkg.com/metaviz-editor@latest/dist/metaviz-editor.css

# Authors

Dariusz Dawidowski  
Maksym Godovanets
