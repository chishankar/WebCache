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
var rangeTbl = [];
const maxIntPerFile = 1800;
//ONLY WORKS FOR REINDEXING DIRECTORY
var rngFileCnt = 0;

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
        if (!err) {
          // TODO: REMOVE HTML TAGS
          // Case-sensitive indexing not implented for simplicity.
          let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\w\s]/gi, '');
          let fileWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value, index, self){return self.indexOf(value) === index && !stopWords.includes(value);});

          //Iterate for each unique word in file
          fileWords.forEach( word => {
            //Will hold a list of IDs for each word, one for each location
            let IDList = [];
            let locations = getIndicesOf(word,cleanText);
            IDList.push(locations.length);
            IDList.push(fileNum);
            //Calculates ID for unique location
            locations.forEach(loc => {
              IDList.push(loc);
            });
            //Push object of word and its locations to return
            fileIndex.push({w: word, a: IDList});
          });
          //returns the list
          resolve(fileIndex);
        } else {
          console.log(err);
        }
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


function addToMainAux(fileIndex, mainIndex) {
  // SORT FILE INDEX HERE
  if (rangeTbl.length === 0) {
    rangeTbl.push(
      {
        r: [fileIndex[0].w, fileIndex[fileIndex.length - 1].w],
        fn: rngFileCnt.toString() + "_BSON",
        s: 0
      });
  }
  currRng = rangeTbl[0];

  //assumes unique words, and no preexisting entries for the file being added
  fileIndex.forEach(fileWord => {

    if (withinRng(fileWord.w, currRng))

    wordInd = mainIndex.findIndex(mainWord => mainWord.w == fileWord.w);

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
    }
  });
}


function addFilesToMainIndex(fileNames, mainIndex) {

  let indexPromises = [];

  return new Promise(resolveAll => {

    fileNames.forEach(fileName => {
      indexPromises.push(new Promise(resolve => {
        getFileIndex(fileName).then(fileIndex => {
          addToMainIndex(fileIndex, mainIndex, tempIndex);
          let tempSize = sizeof(tempIndex);
          if (tempSize > 0) {
            //console.log(sizeof(tempIndex));
            addToMainAux(tempIndex, mainIndex);
            tempIndex = [];
          }
          resolve();
        });
      }));
    });
    Promise.all(indexPromises).then(() => {
      addToMainAux(tempIndex, mainIndex);
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
  searchWords.forEach(word => {
    let wordFiles = [];
    //returns a list of all unique location IDs associated with the current word
    results = _.findWhere(index, {w: word});
    //if not found return empty
    if (results == null) return;
    //Changes into filename and location format
    let filePath = path.join(__dirname, "/word_inds/" + results.fn);
    wordLocs = getWordLocs(readUint32ArrFileSync(filePath));
    wordResults.push(wordLocs);
    wordLocs.forEach(fileLocs => {
      wordFiles.push(fileLocs.fileName);
    });
    fileLists.push(wordFiles);
  });

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
      console.log("Indexing completed in  " + (t1 - t0) + " milliseconds.");
      console.log("Size of index: " + sizeof(mainIndex));
      console.log("io calls: " + iocounter);
      saveIndexToFile(mainIndex, lookup, 'ind_bin.txt', 'tbl_bin.txt');
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
    let results = search("performance",mainIndex);
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
