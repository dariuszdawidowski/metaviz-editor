const fs = require('fs');
const ejs = require('ejs');
const cleancss = require('clean-css');
const { readFile } = require('fs').promises;
const { minify } = require('terser');

const template = fs.readFileSync('index.ejs', 'utf8');

const mincss = (filePath) => {
    const cssContent = fs.readFileSync(filePath, 'utf8');
    const minifiedCss = new cleancss().minify(cssContent).styles;
    return minifiedCss;
};

const minjs = async (filePath) => {
    try {
        const inputCode = await readFile(filePath, 'utf8');
        const minifiedCode = (await minify(inputCode)).code;
        return minifiedCode;
    }
    catch (error) {
        console.error(`Error minifying ${filePath}:`, error);
    }
};

ejs.render(template, { mincss, minjs }, {async: true}).then(output => fs.writeFileSync('metaviz.html', output, 'utf8'));
