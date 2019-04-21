/**
   Generate locations (string indexes) of all words (delimited by a regex)
   in one pass of the specified string.
   @param {string} str - the specified string
   @param {regex} delimiter - the specified delimiter, usually /\s/ (whitespace)
   @return {Map<string, Array<integer>>} 
  */
function wordLocsMapping(str, delimiter=/\s/) {
    var out = new Map();
    var word = '';
    var c;
    var i;

    // generate locations of all words in one pass
    for (i = 0; i < str.length; i++) {
        c = str.charAt(i);
        if (!delimiter.test(c)) { // if not whitespace
            word += c; // continue building a word
        } else if (word) {
            // if it is whitespace, check if we have built a word
            // and add it to the map
            if (!out.has(word)) {
                out.set(word, []); // create the array if it doesn't exist
            } // push the word to the array
            out.get(word).push(i - word.length);
            word = '';
        }
    }

    // add word to map if we have built a word
    // this the same as in the for loop
    if (word) {
        if (!out.has(word)) {
            out.set(word, []);
        }
        out.get(word).push(i - word.length);
    }

    return out;
}

module.exports = {};
module.exports['wordLocsMapping'] = wordLocsMapping;
