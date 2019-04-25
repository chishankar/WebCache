// testing code

const url = require('url');
const path = require('path');
const { exec } = require('child_process');
const _ = require('underscore');
const fs = require('fs');
const sizeof = require('object-sizeof');
const { PerformanceObserver, performance } = require('perf_hooks');
const BSON = require('bson');
var readline = require("readline");

const stopWords = ["i", "me", "my", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
const INDEX_DIRECTORY = true;
var rngTbl = [];
const MAX_INT_PER_FILE = 250000;
//ONLY WORKS FOR REINDEXING DIRECTORY
var rngFileCnt = 0;
var ioCount =0;
var fileParseTime = 0;
var sizeCheckTime = 0;

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
          if (!stopWords.includes(word)) {
            if (!out.has(word)) {
                out.set(word, []); // create the array if it doesn't exist
            } // push the word to the array
            out.get(word).push(i - word.length);
          }
          word = '';
      }
  }

  // add word to map if we have built a word
  // this the same as in the for loop
  if (!stopWords.includes(word)) {
    if (!out.has(word)) {
        out.set(word, []); // create the array if it doesn't exist
    } // push the word to the array
    out.get(word).push(i - word.length);
  }

  return out;
}

// TODO: save array of N-bit integers as array of 8-bit integers
module.exports = {};
// #############################################################################
/**
   Synchronously write an array of 32-bit integers at the specified location.
   @param {string} filePath - the specified location on disk
   @param {Uint32Array} uint32arr - the array of 32-bit integers
  */
function writeUint32ArrFileSync(filePath, uint32arr) {
    fs.writeFileSync(filePath, new Buffer.from(uint32arr.buffer));
    ioCount++;
}
module.exports['writeUint32ArrFileSync'] = writeUint32ArrFileSync;
/**
   Read a file at the specified location as an array of 32-bit integers.
   @param {string} filePath - the specified location on disk
   @return Uint32Array
  */
function readUint32ArrFileSync(filePath) {
    // read out an array of 32-bit integers at the path
    return new Uint32Array((new Uint8Array(fs.readFileSync(filePath))).buffer);
    ioCount++;
}
module.exports['readUint32ArrFileSync'] = readUint32ArrFileSync;
// #############################################################################

function avg(mainIndex) {
  let sum = 0;
  mainIndex.forEach(w => {
    sum += w.a.length;
  });
  return sum / mainIndex.length;
}

//Lookup table between file name and file number
var lookup = [];
lookup.push({fileName: "", a: []});

function checkIndexForChanges(lookup) {

  for (i = 1; i < Object.keys(lookup).length; i++) {

    let file = lookup[i];
    console.log(lookup[i]);
    //let escapedFN = file.fileName.replace(/(\s+)/g, '\\$1');
    let filePath = path.join(__dirname, '/test_docs/' + `${file.fileName}`);

    fs.stat(filePath, function(err, stats){

      if(err) {
        console.log(`${file.fileName}` + ' file deleted');
      } else {

        //assuming file[1] holds last modification date
        if (stats.mtimeMs != file.lastMod) {
          console.log(`${file.fileName}` + ' file modified');
        }
      }
    });
  }
}

function delFilesFromIndex(mainIndex, fileNames, origData) {
  // case for when files are removed outside of the application, whole index must be traversed
  if (origData === undefined || origData.length == 0) {

  }
}

function saveIndexToFile(mainIndex, table, indexFn, tableFn) {

  let filePath = path.join(__dirname, indexFn);
  return new Promise(resolve => {

    fs.writeFile(filePath, BSON.serialize(mainIndex), function (err) {
      if (err) throw err;
      console.log('Index saved to file');
      let filePath = path.join(__dirname, tableFn);
      fs.writeFile(filePath, BSON.serialize(table), function (err) {
        if (err) throw err;
        resolve();
      });
    });
  });
}

function loadIndexFromFile(indexFn, tableFn) {

  let filePath = path.join(__dirname, indexFn);
  let index;
  let table;
  return new Promise(resolve => {
    fs.readFile(filePath, function(err,data){
      if (err) throw err;
      index = BSON.deserialize(data);
      console.log('Index loaded from file');
      let filePath2 = path.join(__dirname, tableFn);
      fs.readFile(filePath2, function(err,data){
        if (err) throw err;
        table = BSON.deserialize(data);
        resolve([index, table]);
      });

    });
  });
}

function getIndicesOf(searchStr, str, caseSensitive) {
  var searchStrLen = searchStr.length;
  if (searchStrLen == 0) {
      return [];
  }
  var startIndex = 0, index, indices = [];
  if (!caseSensitive) {
      str = str.toLowerCase();
      searchStr = searchStr.toLowerCase();
  }
  while ((index = str.indexOf(searchStr, startIndex)) > -1) {
    //Check if this instance is a substring of another word (if next char is whitespace or not) <- FIX
    //TODO: MAKE SURE ALL WORDS HAVE LOCATIONS
    let nextCharIndex = index + searchStrLen;

    if (str.slice(nextCharIndex, nextCharIndex+1).match(/\s/g) &&
        str.slice(index-1, index).match(/\s/g)) {
      indices.push(index);
    }
    startIndex = nextCharIndex;
  }
  return indices;
}

//Takes a file name, returns a list of objects containing words
// and all of the unique IDs of locations that word appears


function getLastMod(fileName) {

  let lastMod = 0;
  return new Promise(resolve => {

    //let escapedFN = fileName.replace(/(\s+)/g, '\\$1');
    let fp = path.join(__dirname, '/test_docs/' + `${fileName}`);
    fs.stat(fp, function(err, stats){

      if(err) {
        console.log("error");
      } else {
        lastMod = stats.mtimeMs;
      }
      resolve(lastMod);
    });
  });
}

function getFileIndex(fileName) {

  //Assigns file ID and adds to lookup table
  let fileNum = lookup.length;
  var fileIndex = [];

  var newEntry = {
    fileName: fileName,
    ID: fileNum,
    lastMod: 0
  };

  getLastMod(fileName).then( result => {
    newEntry.lastMod = result;
  });

  lookup.push(newEntry);

  let filePath = path.join(__dirname, '/test_docs/' + fileName);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      var t1 = performance.now();
        if (!err) {
          // TODO: REMOVE HTML TAGS
          // Case-sensitive indexing not implented for simplicity.
          let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\w\s]/gi, '');
          wordMapping = wordLocsMapping(cleanText);
          wordMapping.forEach(function(value, key) {
            fileIndex.push({
              w: key,
              a: [value.length, fileNum].concat(value)
            });
          });
          //returns the list
          resolve(fileIndex);
        } else {
          console.log(err);
        }
        var t2 = performance.now();
        fileParseTime += (t2 - t1);

    });
  })
}

let tempIndex = [];

let iocounter = 0;

function addToMainIndex(fileIndex, mainIndex, tempIndex) {

  //assumes unique words, and no preexisting entries for the file being added
  fileIndex.forEach(fileWord => {

    wordInd = tempIndex.findIndex(mainWord => mainWord.w == fileWord.w);
    if (wordInd >= 0) {
      tempIndex[wordInd].a = tempIndex[wordInd].a.concat(fileWord.a);
    } else {
      tempIndex.push(fileWord);
    }
  });
}

// takes rng struct, gets list from range file, formats as index
function extractRngIndex(rng) {

  //console.log("reading from file: " + rng.fn);
  let filePath = path.join(__dirname, "/word_inds/" + rng.fn);
  let listInRng = readUint32ArrFileSync(filePath);
  let rngIndex = [];
  let i = mainIndex.findIndex(wordInd => {return wordInd.w === rng.r[0]});
  var wordInd;
  while (i < mainIndex.length && (wordInd = mainIndex[i++]).w <= rng.r[1]) {
    rngIndex.push({
      w: wordInd.w,
      a: listInRng.slice(wordInd.st, wordInd.st + wordInd.sz)
    });
  }
  return rngIndex;
}
// takes rngIndex, converts to single list and stores to respective file
function storeRngIndex(rng, rngIndex) {
  var locArrNew = new Uint32Array(rng.sz);
  let i = mainIndex.findIndex(wordInd => {return wordInd.w === rng.r[0]});
  let j = 0;
  var performSplit;
  //console.log("storing to file: " + rng.fn);
  var wordInd;
  while (i < mainIndex.length && (wordInd = mainIndex[i++]).w <= rng.r[1]) {
    locArrNew.set(rngIndex[j++].a, wordInd.st);
  }
  let filePath = path.join(__dirname, "/word_inds/" + rng.fn);
  writeUint32ArrFileSync(filePath, locArrNew);
}

function addToMainAux(fileIndex, mainIndex) {

  fileIndex = _.sortBy(fileIndex, wordInd => {return wordInd.w});

  // if rngTbl is empty, init with range of fileIndex
  if (rngTbl.length === 0) {
    rngTbl.push(
      {
        r: [fileIndex[0].w, fileIndex[fileIndex.length - 1].w],
        fn: (rngFileCnt++).toString() + "_BSON",
        sz: 0
      });
  }

  // Predetermine if fileindex will require first and/or last ranges to be expanded
  else {
    if (fileIndex[fileIndex.length - 1].w > rngTbl[rngTbl.length - 1].r[1]) {
      rngTbl[rngTbl.length - 1].r[1] = fileIndex[fileIndex.length - 1].w;
    }
  }

  let currRng = 0;
  let i = 0;
  let newWords = [];

  while(i < fileIndex.length) {
    let fileWord = fileIndex[i]

    // find correct range for fileWord
    while (fileWord.w > rngTbl[currRng].r[1]) { currRng++ };

    // convert rngFile for currRng to an index format
    let rngIndex = rngTbl[currRng].sz === 0 ? [] : extractRngIndex(rngTbl[currRng]);

    while(i < fileIndex.length && (fileWord = fileIndex[i++]).w <= rngTbl[currRng].r[1]) {
      if (fileWord.w == "1993") {
      }
      // find index of fileWord word in both rngIndex and mainIndex, or would-be index if fileWord hasn't been indexed.

      let wordIndRng = rngIndex.findIndex(rngWord => rngWord.w >= fileWord.w);
      let wordIndMain = mainIndex.findIndex(mainWord => mainWord.w >= fileWord.w);

      let hasBeenIndexed = (wordIndRng >= 0 && rngIndex[wordIndRng].w === fileWord.w);

      // if new locations fit in rng, add them accordingly


      if (hasBeenIndexed) {
        let locArr = rngIndex[wordIndRng].a;
        var locArrNew = new Uint32Array(locArr.length + fileWord.a.length);
        locArrNew.set(locArr);
        locArrNew.set(fileWord.a, locArr.length);
        rngIndex[wordIndRng].a = locArrNew;
        mainIndex[wordIndMain].sz = locArrNew.length;
      }
      // ...otherwise, insert new array into rng index & main index
      else {
        // if either is empty or word is last in range, just push
        if (wordIndMain < 0) {
          mainIndex.push({w: fileWord.w, fn: rngTbl[currRng].fn, st:rngTbl[currRng].sz , sz: fileWord.a.length});
          rngIndex.push({w: fileWord.w, a: new Uint32Array(fileWord.a)});
          wordIndMain = mainIndex.length-1;
          wordIndRng = rngIndex.length-1;
        }
        else if (wordIndRng < 0) {
          rngIndex.push({w: fileWord.w, a: new Uint32Array(fileWord.a)});
          mainIndex.splice(wordIndMain, 0, {w: fileWord.w, fn: rngTbl[currRng].fn, st:rngTbl[currRng].sz , sz: fileWord.a.length});
          wordIndRng = rngIndex.length-1;
        }
        else { // o.w. splice into rng index & main index
          let st = wordIndRng == 0 ? 0 : mainIndex[wordIndMain - 1].st + mainIndex[wordIndMain - 1].sz;
          rngIndex.splice(wordIndRng, 0, {w: fileWord.w, a: new Uint32Array(fileWord.a)});
          mainIndex.splice(wordIndMain, 0, {w: fileWord.w, fn: rngTbl[currRng].fn, st: st , sz: fileWord.a.length});
        }
      }
      if (wordIndRng + 1 < rngIndex.length) {
        let j = wordIndMain + 1;
        while (j < mainIndex.length && mainIndex[j].w <= rngTbl[currRng].r[1]) {
          mainIndex[j++].st += fileWord.a.length;
        }
      }
      rngTbl[currRng].sz += fileWord.a.length;

      if (rngTbl[currRng].sz + fileWord.a.length > MAX_INT_PER_FILE) {

        //stores current size of words seen
        let count = 0;
        //current rngIndex index we are looking at
        let i = 0;
        //The two range indices we are going to split the current one into
        let lowerRng = [];
        let upperRng = [];
        //target size for each
        let totalLen = rngTbl[currRng].sz + fileWord.a.length
        let target = totalLen / 2;
        let currIndMain = mainIndex.findIndex(mainWord => mainWord.w === rngIndex[0].w);

        while (lowerRng.length === 0) {

          count += mainIndex[currIndMain++].sz;
          if (count > target) {

            if (count > MAX_INT_PER_FILE) {
              lowerRng = rngIndex.slice(0,i);
              upperRng = rngIndex.slice(i);
              count -= mainIndex[currIndMain - 1].sz;

            } else {
              lowerRng = rngIndex.slice(0,++i);
              upperRng = rngIndex.slice(i);
            }
          }
          i++;
        }

        rngTbl[currRng].sz = count;
        rngTbl[currRng].r[1] = lowerRng[lowerRng.length - 1].w;

        let newRng = {
          r: [upperRng[0].w, upperRng[upperRng.length - 1].w],
          fn: (rngFileCnt++).toString() + "_BSON",
          sz: totalLen - count
        }

        rngTbl.splice(currRng + 1, 0, newRng);

        let wordIndMain = mainIndex.findIndex(mainWord => mainWord.w === upperRng[0].w);
        let j = wordIndMain;
        while (j < mainIndex.length && mainIndex[j].w <= rngTbl[currRng+1].r[1]) {
          mainIndex[j++].st -= count;
        }
        storeRngIndex(rngTbl[currRng + 1], upperRng);
      }
    }
    rngTbl[currRng].r[0] = rngIndex[0].w;
    storeRngIndex(rngTbl[currRng], rngIndex);
  }
}







/*
      if (wordInd >= 0) {
        let filePath = path.join(__dirname, "/word_inds/" + mainIndex[wordInd].fn);
        let locArr =  readUint32ArrFileSync(filePath);
        iocounter++;
        var locArrNew = new Uint32Array(locArr.length + fileWord.a.length);
        locArrNew.set(locArr);
        locArrNew.set(fileWord.a, locArr.length);
        writeUint32ArrFileSync(filePath, locArrNew);
        iocounter++;
      } else {
        let fn = fileWord.w.replace(/\//g, "-") + "_BSON";

        mainIndex.push({w: fileWord.w, fn: fn});
        let filePath = path.join(__dirname, "/word_inds/" + fn);
        writeUint32ArrFileSync(filePath, new Uint32Array(fileWord.a));
        iocounter++;

      */


function addFilesToMainIndex(fileNames, mainIndex) {

  let indexPromises = [];

  return new Promise(resolveAll => {

    fileNames.forEach(fileName => {
      indexPromises.push(new Promise(resolve => {
        getFileIndex(fileName).then(fileIndex => {
          addToMainIndex(fileIndex, mainIndex, tempIndex);
          var t1 = performance.now();
          let tempSize = sizeof(tempIndex);
          var t2 = performance.now();
          sizeCheckTime += (t2 - t1);
          if (tempSize > 1000000) {
            //console.log(sizeof(tempIndex));
            addToMainAux(tempIndex, mainIndex);
            tempIndex = [];
          }
          resolve();
        });
      }));
    });
    Promise.all(indexPromises).then(() => {
      if (tempIndex.length != 0) {
        addToMainAux(tempIndex, mainIndex);
      }
      resolveAll();
    });
  });
}

//Enter the array we have stored in the index,
//return a list of words with filenames locations
//that we can use in search method
function getWordLocs(codes) {
  let wordLocs = [];

  for (i = 0; i < codes.length; i++) {
    //gets number of locations in specific file
    let numLocs = codes[i++];
    //returns file ID number
    let fileID = codes[i];
    let fn = lookup[fileID].fileName;

    //adds all locations
    let locs = [];
    for (j = 1; j <= numLocs; j++) {
      locs.push(codes[i + j]);
      i;
    }
    i += numLocs;
    wordLocs.push({
      fileName: fn,
      fileLocs: locs
    });
  }
  return wordLocs;
}

function search(searchStr, index) {
  let finalResults = [];
  let fileLists = []; // will hold all files for each search word
  let wordResults = [];
  let reducedFileList = []; // will hold all files that contain all search words
  let searchWords = searchStr.toLowerCase().trim().split(/\s+/).filter(function(value,index,self) {return !stopWords.includes(value);});
  let startIndex = 0;

  // populate fileLists with lists of files holding each word.
  for (var i = 0 ; i < searchWords.length ; i ++) {
    let word = searchWords[i];
    let wordFiles = [];
    //returns a list of all unique location IDs associated with the current word
    let results = _.findWhere(index, {w: word});
    //if not found return empty
    if (results == null) return finalResults;
    //Changes into filename and location format
    let filePath = path.join(__dirname, "/word_inds/" + results.fn);
    let wordLocs = getWordLocs((readUint32ArrFileSync(filePath)).slice(results.st, results.st + results.sz));
    wordResults.push(wordLocs);
    wordLocs.forEach(fileLocs => {
      wordFiles.push(fileLocs.fileName);
    });
    fileLists.push(wordFiles);
  }

  if (searchWords.length <= 1) {
    wordResults.forEach(obj => {
      obj.forEach( entry => {
        finalResults.push({
          fileName: entry.fileName,
          locations: entry.fileLocs
        });
      });
    });

    return finalResults;
  }

  //  PART 1: Get list of files that contain all search words

  let lastFileInds = [];

  fileLists.forEach(wordFiles => {
    wordFiles.sort();
    lastFileInds.push(0);
  });

  let wordNum = 0;
  let numWords = searchWords.length;
  let listReduced = false;

  while(listReduced === false) {

    if (lastFileInds[0] === fileLists[0].length) {
      break;
    }

    let currFile = fileLists[0][lastFileInds[0]];
    wordNum = 1;
    while(wordNum > 0) {
      // if end of a list reached, reducedFileList done.
      if (lastFileInds[wordNum] === fileLists[wordNum].length) {
        listReduced = true;
        break;
      }

      if (fileLists[wordNum][lastFileInds[wordNum]] < currFile) {
        lastFileInds[wordNum]++;
      }

      else if (fileLists[wordNum][lastFileInds[wordNum]] > currFile) {
        // backtrack
        lastFileInds[--wordNum]++;
      }

      else {
        if (wordNum = searchWords.length - 1) {
          reducedFileList.push(currFile);
          lastFileInds[0]++;
          wordNum = 0;
        }
        else {
          wordNum++
        }
      }
    }
  }

  // PART 2: Find search string locations in each file

  reducedFileList.forEach(fileName => {
    let startIndex = 0;
    let wordLocs = [];
    let lastLocInds = [];
    let desiredLocs = [];
    let dists = [];
    let fileResults = [];

    for (var i = 0 ; i < searchWords.length ; i++ ){
      let dist = searchStr.indexOf(searchWords[i],startIndex);
      startIndex = startIndex + searchWords[i].length;
      lastLocInds.push(0);
      dists.push(dist);
      desiredLocs.push(dist);

      wordLocs.push(_.findWhere(wordResults[i], {fileName: fileName}).fileLocs.sort(function(a, b){return a-b}));
    }

    let wordNum = 0;
    let searchComplete = false;
    while(searchComplete === false) {

      if (lastLocInds[0] === wordLocs[0].length) {
        break;
      }

      for (var i = 1; i < numWords; i++) {
        desiredLocs[i] = wordLocs[0][lastLocInds[0]] + dists[i];
      }

      wordNum = 1;

      while(wordNum > 0) {
        // if end of a list reached, reducedFileList done.
        if (lastLocInds[wordNum] === wordLocs[wordNum].length) {
          searchComplete = true;
          break;
        }

        if (wordLocs[wordNum][lastLocInds[wordNum]] < desiredLocs[wordNum]) {
          lastLocInds[wordNum]++;
        }

        else if (wordLocs[wordNum][lastLocInds[wordNum]] > desiredLocs[wordNum]) {
          // backtrack
          lastLocInds[--wordNum]++;
        }

        else {
          if (wordNum = searchWords.length - 1) {
            fileResults.push(wordLocs[0][lastLocInds[0]]);
            lastLocInds[0]++;
            wordNum = 0;
          }
          else {
            wordNum++
          }
        }
      }
    }

    finalResults.push({
      fileName: fileName,
      locations: fileResults
    });

  });

  return finalResults;

}

// fresh index and stat table for testing

var mainIndex = [];

var lastFileStats = [];

if(INDEX_DIRECTORY) {
  var proc = exec('ls test_docs', (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
      reject(Error("ls did not execute correctly"));
    }

    dirFiles = stdout.split(/\r?\n/);
    dirFiles.pop();

    var t0 = performance.now();
    addFilesToMainIndex(dirFiles, mainIndex).then(result => {
      var t1 = performance.now();
      console.log("Indexing completed in " + (t1 - t0) + " milliseconds.");
      console.log("File parsing took up " + fileParseTime + " milliseconds.");
      console.log("Size checking took up " + sizeCheckTime + " milliseconds.");
      console.log("Size of index: " + sizeof(mainIndex));
      console.log("io calls: " + ioCount);
      saveIndexToFile(mainIndex, lookup, 'ind_bin.txt', 'tbl_bin.txt');
      let results = search("displeasure",mainIndex);
    });

  // addFilesToSecondIndex(dirFiles, secondInd);
  });
} else {
  var t0 = performance.now();
  loadIndexFromFile('ind_bin.txt', 'tbl_bin.txt').then(result => {
    mainIndex = result[0];
    lookup = result[1];
    var t1 = performance.now();
    console.log("Loaded index from file in  " + (t1 - t0) + " milliseconds.");
    console.log("Size of index: " + sizeof(mainIndex));
    console.log("lookup table size: " + sizeof(lookup));

  });
}

function user_search(str) {
  console.log("Search Results for " + str + ":");
  var t0 = performance.now();
  let results = search(str,mainIndex);
  //let results2 = searchSecond(str, secondInd);
  var t1 = performance.now();
  results.forEach(obj => {
    locations = [];
    Object.keys(obj.locations).forEach(ind => {
      locations.push(obj.locations[ind]);
    })
    console.log(obj.fileName + " at " + obj.locations);
  });

  console.log("Test results\n");
  // results2.forEach(obj => {
  //   console.log(obj.name + " at " + obj.locs);
  // });

  console.log("Size of index: " + sizeof(mainIndex));
  console.log("Search took " + (t1 - t0) + " milliseconds.")
}

var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
 });

//FOLLOWING FUNCTIONS FOR TESTING
const secondInd = [];

function getFileBody(fileName) {

    let filePath = path.join(__dirname, '/test_docs/' + fileName);

    return new Promise(resolve => {
      fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
          if (!err) {
            let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");
            resolve({name: fileName, body: cleanText});
          } else {
            console.log(err);
          }
      });
    })
}

function addFilesToSecondIndex(fileNames, secondInd) {

    return new Promise(resolve => {
      fileNames.forEach(fileName => {
        getFileBody(fileName).then(fileIndex => {
          secondInd.push(fileIndex);
        });
      });
      resolve();
    });
}

function searchSecond(searchStr, secondInd) {

    var results = [];

    secondInd.forEach(fileName => {
        let curr = getIndicesOf(searchStr, fileName.body, false);
        if (curr.length != 0) {
            results.push({name: fileName.name, locs: curr});
        }
    });
    return results;
}


rl.on("line", function (line) {
  //  lookup.forEach( fileWord => {
  //   console.log(fileWord.fileName + " " + fileWord.ID + "\n");
  // });
    // mainIndex.forEach( fileWord => {
    // console.log(fileWord.w + ":\n" + fileWord.a + "\n");
    // });
   // checkIndexForChanges(lookup);
    user_search(line);


    //console.log(mainIndex.length);
 // });
 });
