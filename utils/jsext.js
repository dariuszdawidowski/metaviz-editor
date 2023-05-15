/**
 * Javascript Language Extensions v 1.23.1
 * (c) 2009-2023 Dariusz Dawidowski, All Rights Reserved.
 */


/******************
 * UUID generator *
 ******************/


/* UUID4 */

function uuid() {
    return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c => (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16));
}


/* Tiny Unique ID (optional array or dict to test uniqueness). */

function tuid(otherIDs = []) {
    let id = '';
    do {
        // First character is always a letter
        id = String.fromCharCode(97 + Math.floor(Math.random() * 26));
        // Random rest of string
        id += Math.random().toString(36).slice(-6);
    } while ((Array.isArray(otherIDs) ? otherIDs.includes(id) : otherIDs.hasOwnProperty(id)));
    return id;
}


/*************
 * Functions *
 *************/


/* Assign one source dict to target (copy only properties which exists) */

function assign(target, source) {
    if (Object(target) !== target || Object(source) !== source)
        return source;
    for (const p in source)
        if (p in target) target[p] = assign(target[p], source[p]);
    return target;
}


/********************
 * Array Extensions *
 ********************/


/* Remove element from inside */

/* This collides with WordPress libs, Array can't be modified.
if (typeof Array.prototype.remove != 'function')
Array.prototype.remove = function(element) {
    const index = this.indexOf(element);
    if (index !== -1) this.splice(index, 1);
};
else console.error('Array.prototype.remove already exist');
*/

function arrayRemove(array, element) {
    const index = array.indexOf(element);
    if (index !== -1) array.splice(index, 1);
}


/******************
 * URI Extensions *
 ******************/


/* Convert dict to URL GET params ?x=..&y=.. */

function dictToUri(dict, prefix = '') {
    let str = [];
    for (const p in dict) {
        if (dict[p]) str.push(encodeURIComponent(p) + '=' + encodeURIComponent(dict[p]));
    }
    if (str.length == 0) return '';
    return prefix + str.join('&');
}


/* Parse URL GET params ?x=..&y=.. and convert to dict */

if (typeof String.prototype.uriToDict != 'function')
String.prototype.uriToDict = function(name = null) {
    let params = {};
    for (const param of this.split('&')) {
        const kv = param.split('=');
        if (kv.length == 2) params[kv[0].replace('?', '').trim()] = kv[1].trim();
    }
    if (name) return params[name];
    return params;
};
else console.error('String.prototype.uriToDict already exist');


/*********************
 * String Extensions *
 *********************/


/* Upper first letter */

if (typeof String.prototype.capitalize != 'function')
String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
};
else console.error('String.prototype.capitalize already exist');


/* Remove all occurences */

if (typeof String.prototype.removeAll != 'function')
String.prototype.removeAll = function(search) {
    return this.replace(new RegExp(search, 'g'), '');
};
else console.error('String.prototype.removeAll already exist');


/* Replace first occurence */

if (typeof String.prototype.replaceFirst != 'function')
String.prototype.replaceFirst = function(search, replacement) {
    return this.replace(new RegExp('^' + search), replacement);
};
else console.error('String.prototype.replaceFirst already exist');


/* Replace last occurence */

if (typeof String.prototype.replaceLast != 'function')
String.prototype.replaceLast = function(search, replacement) {
    return this.replace(new RegExp(search + '$'), replacement);
};
else console.error('String.prototype.replaceLast already exist');


/* Find all occurences and return indices */

if (typeof String.prototype.findAllIndices != 'function')
String.prototype.findAllIndices = function(searchStr) {
    if (searchStr.length == 0) return [];
    let startIndex = 0, index, indices = [];
    while ((index = this.indexOf(searchStr, startIndex)) > -1) {
        indices.push(index);
        startIndex = index + searchStr.length;
    }
    return indices;
}
else console.error('String.prototype.findAllIndices already exist');


/* Extract filename from path */

if (typeof String.prototype.basename != 'function')
String.prototype.basename = function() {
    return this.replace(/^.*[\\\/]/, '');
};
else console.error('String.prototype.basename already exist');


/* Extract file extension */

if (typeof String.prototype.ext != 'function')
String.prototype.ext = function(name = null) {
    if (!name) return this.substring(this.lastIndexOf('.') + 1, this.length) || '';
    else return (this.substring(this.lastIndexOf('.') + 1, this.length) == name);
};
else console.error('String.prototype.ext already exist');


/* Slug */

if (typeof String.prototype.slug != 'function')
String.prototype.slug = function() {
    return this
    .replace(/ą/g, 'a').replace(/Ą/g, 'A')
    .replace(/ć/g, 'c').replace(/Ć/g, 'C')
    .replace(/ę/g, 'e').replace(/Ę/g, 'E')
    .replace(/ł/g, 'l').replace(/Ł/g, 'L')
    .replace(/ń/g, 'n').replace(/Ń/g, 'N')
    .replace(/ó/g, 'o').replace(/Ó/g, 'O')
    .replace(/ś/g, 's').replace(/Ś/g, 'S')
    .replace(/ż/g, 'z').replace(/Ż/g, 'Z')
    .replace(/ź/g, 'z').replace(/Ź/g, 'Z')
    .toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}
else console.error('String.prototype.slug already exist');


/* Add trailing space if not exists */

if (typeof String.prototype.spaceize != 'function')
String.prototype.spaceize = function() {
    return this.trimRight() + ' ';
};
else console.error('String.prototype.spaceize already exist');


/* Detect inside string int or float and convert it */

if (typeof String.prototype.toIntOrFloat != 'function')
String.prototype.toIntOrFloat = function() {
    if (this.indexOf(',') != -1 || this.indexOf('.') != -1) return parseFloat(this.replace(',', '.'));
    return parseInt(this);
};
else console.error('String.prototype.toIntOrFloat already exist');


/* Detect if string is numeric */

if (typeof String.prototype.isNumeric != 'function')
String.prototype.isNumeric = function() {
    return !isNaN(this) && !isNaN(parseFloat(this));
}
else console.error('String.prototype.isNumeric already exist');


/* Put three dots in the middle */

if (typeof String.prototype.ellipsis != 'function')
String.prototype.ellipsis = function(visible = 10) {
    return this.substr(0, visible) + '...' + this.substr(this.length - visible, this.length);
}
else console.error('String.prototype.ellipsis already exist');


/* Convert '12px' to int */

if (typeof String.prototype.pxToInt != 'function')
String.prototype.pxToInt = function() {
    return parseInt(this.replace('px', ''));
}
else console.error('String.prototype.pxToInt already exist');


/* Convert '11px 12px' to [int, int] */

if (typeof String.prototype.pxArrToInt != 'function')
String.prototype.pxArrToInt = function() {
    const pos = this.split(' ');
    return [parseInt(pos[0].replace('px', '')), parseInt(pos[1].replace('px', ''))];
}
else console.error('String.prototype.pxArrToInt already exist');


/* Get synopsis */

if (typeof String.prototype.synopsis != 'function')
String.prototype.synopsis = function(length = 10) {
    const cleanText = document.createElement('div');
    cleanText.innerHTML = this.trim();
    return cleanText.innerText.trim().slice(0, length).replace('<', '&lt;').replace('>', '&gt;');
};
else console.error('String.prototype.synopsis already exist');


/* Convert text to emojis */
// https://en.wikipedia.org/wiki/List_of_emoticons

if (typeof String.prototype.filterEmoji != 'function')
String.prototype.filterEmoji = function() {
    let text = this;
    const emojis = {
        '😇': /O:\)|:innocent:/g,
        '😈': />:\)|:smiling_imp:/g,
        '😡': />:\(|:rage:/g,
        '🙂': /:\)|:smile:/g,
        '😀': /:D|:grinning:/g,
        '😆': /XD|:laughing:/g,
        '🙁': /:\(|:slight_frown:|:sad:/g,
        '😢': /:'\(|:cry:/g,
        '😮': /:O|:open_mouth:|:shock:/g,
        '😛': /:P|:stuck_out_tongue:/g,
        '😜': /;P|:stuck_out_tongue_winking_eye:/g,
        '😉': /;\)|:wink:/g,
        '😎': /B\)|:sunglasses:|:cool:/g,
        '🐱': /:3|:cat:/g,
        '😺': /=3|:smiley_cat:/g,
        '😸': /x3|:smile_cat:/g,
        '❤️': /<3|:heart:/g,
        '💩': /\/\\|:poo:/g,
        '🐽': /:8|\(OO\)|\(oo\)|:pig_nose:/g,
        '👍': /\+1|:\+1:|:thumbup:|:thumbsup:/g,
        '👎': /-1|:-1:|:thumbdown:|:thumbsdown:/g,
    };
    for (const [emoji, regex] of Object.entries(emojis)) {
        text = text.replace(regex, emoji);
    }
    return text;
};
else console.error('String.prototype.filterEmoji already exist');


/*********************
 * Number Extensions *
 *********************/


/* Change bytes to B/KB/MB/GB/TB */

if (typeof Number.prototype.bytes2Human != 'function')
Number.prototype.bytes2Human = function() {
    // Petabytes
    if (this > (1024 ** 5)) return '' + (this / (1024 ** 5)).toFixed(2) + ' PB';
    // Terabytes
    if (this > (1024 ** 4)) return '' + (this / (1024 ** 4)).toFixed(2) + ' TB';
    // Gigabytes
    if (this > (1024 ** 3)) return '' + (this / (1024 ** 3)).toFixed(2) + ' GB';
    // Megabytes
    if (this > (1024 ** 2)) return '' + (this / (1024 ** 2)).toFixed(2) + ' MB';
    // Kilobytes
    if (this > 1024) return '' + Math.round(this / 1024) + ' KB';
    // Bytes
    return '' + this + ' B';
};
else console.error('Number.prototype.bytes2Human already exist');


/* Clamp */

if (typeof Number.prototype.clamp != 'function')
Number.prototype.clamp = function(min, max) {
    return Math.max(min, Math.min(max, this));
};
else console.error('Number.prototype.clamp already exist');


/* Scale */

// Convert 33 from a 0-100 range to a 0-65535 range
// number.scale(33, [0, 100], [0, 65535]);

if (typeof Number.prototype.scale != 'function')
Number.prototype.scale = function(from, to) {
    const scale = (to[1] - to[0]) / (from[1] - from[0]);
    const capped = Math.min(from[1], Math.max(from[0], this)) - from[0];
    return ~~(capped * scale + to[0]);
};
else console.error('Number.prototype.scale already exist');


/*******************
 * Math Extensions *
 *******************/


/* Angle */

if (typeof Math.angle != 'function')
Math.angle = function(obj1, obj2) {
    return Math.atan2(obj2.y - obj1.y, obj2.x - obj1.x) * (180 / Math.PI);
};
else console.error('Math.angle already exist');


/* Round2 */

if (typeof Math.round2 != 'function')
Math.round2 = function(value) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
};
else console.error('Math.round2 already exist');


/* Random with range */

if (typeof Math.randomRange != 'function')
Math.randomRange = function(min, max) {
    return Math.random() * (max - min) + min;
};
else console.error('Math.randomRange already exist');


/* Random with range (int) */

if (typeof Math.randomRangeInt != 'function')
Math.randomRangeInt = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};
else console.error('Math.randomRangeInt already exist');


/**************************
 * DOM Element Extensions *
 **************************/


/* Class is present */

if (typeof Element.prototype.hasClass != 'function')
Element.prototype.hasClass = function(name) {
    return this.classList.contains(name);
};
else console.error('Element.prototype.hasClass already exist');


/* One of class is present (0 fo all) */

if (typeof Element.prototype.hasClasses != 'function')
Element.prototype.hasClasses = function(names, howmany = 0) {
    if (howmany == 1) return names.some(className => this.classList.contains(className))
};
else console.error('Element.prototype.hasClasses already exist');


/* Move to end of DOM structure */

if (typeof Element.prototype.moveToEnd != 'function')
Element.prototype.moveToEnd = function(name) {
    this.parentNode.append(this);
};
else console.error('Element.prototype.moveToEnd already exist');


/* Clear text selection in inputs, textareas and contenteditables */

if (typeof Window.prototype.clearSelection != 'function')
Window.prototype.clearSelection = function(name) {
    if (this.getSelection) {
        if (this.getSelection().empty) {  // Chrome
            this.getSelection().empty();
        } else if (this.getSelection().removeAllRanges) {  // Firefox
            this.getSelection().removeAllRanges();
        }
    }
};
else console.error('Window.prototype.clearSelection already exist');
