/**
 * Build script v6-custom
 */

const files = [
    { src: 'metaviz-editor.css.ejs', dst: 'metaviz-editor.css' },
    { src: 'metaviz-editor.js.ejs', dst: 'metaviz-editor.js' }
];

const fs = require('fs');
const { readFile } = require('fs').promises;
const ejs = require('ejs');
const cleancss = require('clean-css');
const { minify } = require('terser');

const mincss = (filePath) => {
    try {
        const cssContent = fs.readFileSync(filePath, 'utf8');
        const minifiedCss = new cleancss().minify(cssContent).styles;
        return minifiedCss;
    }
    catch (error) {
        console.error(`Error minifying css ${filePath}:`, error);
        return null;
    }
};

const minjs = async (filePath) => {
    try {
        const inputCode = await readFile(filePath, 'utf8');
        const minifiedCode = (await minify(inputCode)).code;
        return minifiedCode;
    }
    catch (error) {
        console.error(`Error minifying js ${filePath}:`, error);
        return null;
    }
};

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

files.forEach((file) => {

    ejs.render(fs.readFileSync(file.src, 'utf8'), { minjs, mincss }, {async: true})
        .then(output => fs.writeFileSync('dist/' + file.dst, output, 'utf8'));

});

