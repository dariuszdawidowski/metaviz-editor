/**
 * Build script
 */

const fs = require('fs');
const ejs = require('ejs');
const cleancss = require('clean-css');
const { readFile } = require('fs').promises;
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

ejs.render(fs.readFileSync('metaviz.html.ejs', 'utf8'), { mincss, minjs }, {async: true})
.then(output => fs.writeFileSync('metaviz.html', output, 'utf8'));
