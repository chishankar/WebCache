/*
USAGE:
    npm install htmlparser2

DO:
    node gethtmltext.js
to see a demo.

You can import this file to use the function defined here.

Note that with the demo here, I show the document with and without
extraneous whitespace.
*/
const fs = require('fs');
// can use htmlparser2 to get stuff
const htmlparser = require('htmlparser2');

/*
  How do I use the asynchronous version of this?
  I don't know. But at least I can get in the particular
  syntax/naming convention of the functions we need to
  parse the html. -- Vincent
*/

function getFileText(filePath, includeExtraWhiteSpace=false) {
    const rawHtml = fs.readFileSync(filePath).toString();
    var out = '';

    var parser1 = new htmlparser.Parser({
        ontext: function(text) {
            // gets text, including lots of whitespace
            out = out.concat(text);
            out = out.concat(' '); // add extra whitespace in between things of text
        }
    });

    // gets inline comments from scrapbook legacy data
    var parser2 = new htmlparser.Parser({
        onopentag: function(name, attribs) {
            if (name === 'span' && attribs.class === 'scrapbook-inline') {
                out = out.concat(attribs.title);
                out = out.concat(' '); // add extra whitespace between annotations
            }
        }
    });

    parser1.write(rawHtml);
    parser2.write(rawHtml);
    parser1.end();
    parser2.end();

    if (!includeExtraWhiteSpace) {
        // each word is separated by a single space
        out = out.split(/\s+/).join(' ');
    }

    return out;
}

// DEMO STARTS HERE
// the file path of this demo
var primesFilePath = '../test/legacy-data/ScrapBook/data/20190327234416/index.html';

console.log('##################################');
console.log('#### WITH NO EXTRA WHITESPACE ####');
console.log('##################################');
console.log('');
console.log(getFileText(primesFilePath));
console.log('');

console.log('####################################');
console.log('#### WITH EXTRANEOUS WHITESPACE ####');
console.log('####################################');
console.log('');
console.log(getFileText(primesFilePath, true));
console.log('');
 
