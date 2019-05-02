const fs = require('fs');
const util = require('util');
const cheerio = require('cheerio');
const readFile = util.promisify(fs.readFile);

// NOTE: This file has only been very lightly tested.
// TODO: MORE TESTING
// TODO: more robust error handling

/*
  Usage (in NodeJS):

  // require this file
  const { ScrapbookToWebcacheFormat } = require('./convert-html');

  // get the paths to the relevant files
  var htmlFilePath = 'data/Scrapbook/data/20190327234416/index.html',
      datFilePath = 'data/Scrapbook/data/20190327234416/index.dat';

  // print output of async function
  async function printAsync(f) { console.log(await f()); }

  // print output of conversion
  printAsync(() => ScrapbookToWebcacheFormat(htmlFilePath, datFilePath));

 */


// #############################################################################

// This method right here is basically the only one you need to use.
/**
   Gets the converted HTML, inline annotations, sticky annotations, & comment of
   the specified ScrapBook HTML file & DAT file. These files should refer
   to the associated files in the same ScrapBook folder.

   @param {string} htmlFilePath - the associated HTML file
   @param {string} datFilePath - the associated DAT file

   @return {[string, List<JSON>, List<JSON>, List<JSON>, string]} - the
   modified HTML, list of highlights, list of inline annotations, list of
   sticky annotations, and comment
  */

async function ScrapbookToWebcacheFormat(htmlFilePath, datFilePath) {
    // split the annotations & comments into different functions so they

    // could be done in parallel
    var [jsonish, comment] = await Promise.all([
        ScrapbookToWebcacheHTML(htmlFilePath),
        extractCommentFromDatFile(datFilePath)
    ]);

    // return [modified html, List<inline annotation>,
    // List<sticky annotation>, comment]
    return [...jsonish, comment];
}


/**
   Gets the converted HTML, inline annotations, & sticky annnotations of the
   specified ScrapBook HTML file.

   @param {string} htmlFilePath - the path to the specified HTML file

   @return {[string, List<JSON>, List<JSON>, List<JSON>]} - the modified HTML,
   list of highlights, list of inline annotations, and list of sticky
   annotations.
  */
async function ScrapbookToWebcacheHTML(htmlFilePath) {
    // contents of the file, assumed to be an HTML file
    var html = await readFile(htmlFilePath, {encoding: 'utf8'});

    // the file contents, converted to a Cheerio object
    var doc = cheerio.load(html);

    // get the lists of highlights, inline annotations, & sticky annotations
    var relStickies = doc('div').filter('.scrapbook-sticky-relative');

    var highlights = doc('span[class=linemarker-marked-line]'),
        absStickies = doc('div[class=scrapbook-sticky]'),
        relStickies = doc('div[class=scrapbook-sticky-relative]');

    relativeStickyToInlineAnnotation(relStickies);

    var inlines = doc('span[class=scrapbook-inline]');

    // get the JSON objects
    var highlightJSONs = cheerioObjsToHighlightJSON(highlights),
        inlineJSONs = cheerioObjsToInlineAnnotationJSON(inlines),
        stickyJSONs = cheerioObjsToStickyAnnotationJSON(absStickies);

    // remove the sticky annotations from the HTML
    absStickies.replaceWith('');

    var i;
    for (i = 0; i < inlines.length; i++) {
        // set "class" attribute of i-th inline annotation
        // the convention is to use the class of the tag as an id
        inlines.eq(i).attr('class', inlineJSONs[i].id);
    }

    for (i = 0; i < highlights.length; i++) {
        // set "class" attribute of i-th highlight
        highlights.eq(i).attr('class', highlightJSONs[i].id);
    }

    // return the modified HTML & the annotations
    return [doc.html(), highlightJSONs, inlineJSONs, stickyJSONs];
}


/**
   Get the comment from a ScrapBook DAT file.

   @param {string} datFilePath - the path to the DAT file

   @return {string} - the comment in said file
*/
async function extractCommentFromDatFile(datFilePath) {
    var contents = await readFile(datFilePath, {encoding: 'utf8'});
    var lines = contents.split('\n');

    var i = lines.length;
    while(i--) {
        // comment should be the last field
        if (lines[i].substring(0, 7) === 'comment') {
            // TODO: test multiline comments
            return lines[i].substring(8);
        }
    }
    return '';
}

// #############################################################################

function relativeStickyToInlineAnnotation(doc, relStickies) {
    var texts = new Array(relStickies.length);

    for (var i = 0; i < relStickies.length; i++) {
        texts[i] = relStickies.eq(i).text();
    }

    // remove text from html
    relStickies.replaceWith('<span class="scrapbook-sticky-relative"></span>');
    relStickies = doc('div').filter('.scrapbook-sticky-relative');

    // add text back in inline annotation format
    for (var i = 0; i < relStickies.length; i++) {
        relStickies.eq(i).attr('title', texts[i]);
    }
    relStickies.attr('class', 'scrapbook-sticky-relative');
}

/**
   Converts the ScrapBook highlight results to a list of JSON.

   @param {Cheerio Object results} highlights - the ScrapBook highlights

   @return {List<JSON>} - each highlight, as a JSON object with fields "id",
   "text", "color"
*/

// the four default highlight styles in ScrapBook
const highlightStyles = [
    'background-color: #FFFF99; color: #000000; border: thin dashed #FFCC00;',
    'border-bottom: medium solid #33FF33;',
    'background-color: #CCFFFF; color: #000000; border: thin solid #0099FF;',
    'background-color: #FFFF00; color: #000000;'
];

function cheerioObjsToHighlightJSON(highlights) {
    var out = new Array(highlights.length);
    for (var i = 0; i < highlights.length; i++) {
        var highlight = highlights.eq(i),
            style = highlight.attr('style');

        // force the highlight styles into a single color
        var forceColor;
        if (style === highlightStyles[0]) {
            forceColor = '#FFCC00';
        } else if(style === highlightStyles[1]) {
            forceColor = '#33FF33';
        } else if (style === highlightStyles[2]) {
            forceColor = '#CCFFFF';
        } else if (style === highlightStyles[3]) {
            forceColor = '#FFFF00';
        } else {
            // if it's not a highlight I recognize, then make it grey
            forceColor = '#999999';
        }

        out[i] = {
            id: randomID(),
            text: highlight.text(),
            color: forceColor
        };
    }
    return out;
}

/**
   Converts the ScrapBook inline annotation results to a list of JSON.

   @param {Cheerio Object results} inlines - the ScrapBook inline annotations

   @return {List<JSON>} - each inline annotation, as a JSON object with fields
   "id", "text".
  */
function cheerioObjsToInlineAnnotationJSON(inlines) {
    var out = new Array(inlines.length);
    for (var i = 0; i < inlines.length; i++) {
        // get the i-th inline annotation, as a Cheerio object
        var inline = inlines.eq(i);
        // the i-th inline annotation, as a JSON
        out[i] = {
            id: randomID(),
            text: inline.attr('title')
        };
    }
    return out;
}


/**
   Converts the ScrapBook sticky annotation results to a list of JSON.

   @param {Cheerio Object results} stickies - the ScrapBook sticky annotations

   @return {List<JSON>} - each sticky annotation, as a JSON object with fields
   "id", "text", "style". The "style" field denotes the location/dimensions of
   the sticky annotation.
  */
function cheerioObjsToStickyAnnotationJSON(stickies) {
    var out = new Array(stickies.length);
    for (var i = 0; i < stickies.length; i++) {
        // get the i-th sticky annotation, as a Cheerio object
        var sticky = stickies.eq(i);

        // The attributes of the i-th sticky annotations.
        // Example:
        // attrs === ('left: 222px; top: 194px; position: absolute;'
        // + ' width: 250px; height: 100px;')
        var attrs = sticky.attr('style');
        attrs = attrs.substring(0, attrs.length - 1) // get rid of last semicolon
        attrs = attrs.split(';');

        // convert attribute string into JSON format
        for (var j = 0; j < attrs.length; j++) {
            // convert each attribute into a key-value pair
            var [k, v] = attrs[j].trim().split(': ');
            // if the key is in the list, it has a unit of pixels
            if (['left', 'top', 'width', 'height'].indexOf(k) >= 0) {
                // remove the unit of pixels & turn it into an integer
                v = parseInt(v.substring(0, v.length - 2));
            }
            attrs[j] = {};
            attrs[j][k] = v;
        }

        // the i-th sticky annotation, as a JSON
        out[i] =  {
            id: randomID(),
            text: sticky.text(),
            style: attrs
        };
    }
    return out;
}


/**
   Get a random ID. It's a copy of "generateRandomID()" somewhere else
   in the code.

   @return {string} - the random ID
*/
function randomID() {
    return (Math.random().toString(36)
            .replace(/[^a-z]+/g, '').substr(2,10));
}

// ############################################################################/

module.exports = {};
module.exports['ScrapbookToWebcacheFormat'] = ScrapbookToWebcacheFormat;
