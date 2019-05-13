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
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
import app from 'electron';

let remoteApp;
if (app && app.remote) {
  remoteApp = app.remote.app;
  console.log("main5.js REMOTEAPP exists: " + remoteApp.getPath('appData'));
} else{
  console.log("main5.js: remoteApp doesn't exist??????");
}

const WORD_INDS_LOCATION = (remoteApp ? remoteApp.getPath('appData') : '/Users/peterwang/desktop' )+ '/word_inds';
const virtualConsole = new jsdom.VirtualConsole();
virtualConsole.on("error", () => {
  console.log('Can\'t parse this css sheet')
});

const stopWords = ["i", "me", "my", "we", "our", "ours", "ourselves", "you", "your", "yours", "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"];
const INDEX_DIRECTORY = false;
const SINGLE_WORD_FLAG = 'x';
const MAX_CLUSTER = 1000000;
var rngTbl = [];
const MAX_INT_PER_FILE = 250000;
//ONLY WORKS FOR REINDEXING DIRECTORY
var rngFileCnt = 0;
var ioCount =0;
var fileParseTime = 0;
var sizeCheckTime = 0;
var fileCount = 0;
var wordcount = 0;
var mainIndex = [];


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
          word = word.toLowerCase();
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
  if (word &&!stopWords.includes(word)) {
    if (!out.has(word)) {
        out.set(word, []); // create the array if it doesn't exist
    } // push the word to the array
    out.get(word).push(i - word.length);
  }

  return out;
}

/**
   Synchronously write an array of 32-bit integers at the specified location.
   @param {string} filePath - the specified location on disk
   @param {Uint32Array} uint32arr - the array of 32-bit integers
  */
function writeUint32ArrFileSync(filePath, uint32arr) {
    fs.writeFileSync(filePath, new Buffer.from(uint32arr.buffer));
    ioCount++;
}

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
// #############################################################################



//Lookup table between file name and file number
var lookup = [{fileName: "", a: []}];

/**
   Checks files in directory to see if anything has been
   added, deleted, or modified since last open.
   @param {array} lookup - the file to fileID lookup table
  */
function checkIndexForChanges(lookup) {

  for (i = 1; i < Object.keys(lookup).length; i++) {

    let file = lookup[i];
    console.log(lookup[i]);
    //let escapedFN = file.fileName.replace(/(\s+)/g, '\\$1');
    let filePath = path.join(__dirname, '../data/' + `${file.fileName}`);

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


/**
   Checks if a word appears in an "exclusive index" - it appears
   so many times in the cached pages that it fills up an entire
   range index by itself. There are special cases for handling these words.
   @param {string} word - the word in question
   @return boolean
  */
function checkExclusiveWord(word) {
  let wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === word});
  if (wordIndMain === -1) {return false;}
  return (mainIndex[wordIndMain].fn.slice(0,1) == SINGLE_WORD_FLAG);
}

/**
   Updates a given file. If the file exists, we iterate through the old
   contents of the file and delete the file word by word.
   Then, we add the file again with the same name.
   The file should already be updated in the directory.
   @param {string} filename - the file we are updating
   @param {string} oldStr - the old contents of the file, which
   we iterate through and delete word by word.
  */
export function update(filename, oldStr) {
  if (lookup.findIndex(entry => {return entry.fileName === filename}) < 0) {
    addFilesToMainIndex([filename]);
  }
  else {
    console.log("deleting file");
    deleteFile(filename, oldStr).then(result => {
      addFilesToMainIndex([filename]);
    });
  }
}

/**
   Deletes a file by iterating through the old contents word by word
   and removing/updating the index and range files
   @param {string} filename - the file we are deleting
   @param {string} str - the contents of the file
  */
function deleteFile(filename, str) {

  console.log("Entered delete, above promise");
  console.log("filename: " + filename);
  console.log("toDelete: " + str);

  return new Promise(resolve => {

        console.log("entered promise");

        let lookupID = lookup.findIndex(entry => {return entry.fileName === filename});

        console.log("LookupID found");

        let arr = [];

        //if file doesn't exist, don't need to delete
        if (lookupID < 0) { console.log("deleting file not here"); resolve(); }

        console.log("LookupID verified");


        let fileID = lookup[lookupID].ID;
        lookup[lookupID].fileName = '';
        let cleanText = str.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' ');
        //retrieves all words we have to delete
        let deleteWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value,index,self) {return !stopWords.includes(value) && self.indexOf(value) === index;});
        deleteWords.sort();
        //deletes each word individually
        let c = 0;
        while (c < deleteWords.length) {
          console.log("entered delete loop");
          let word = deleteWords[c];
          console.log(word);
          let wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === word});

          //Only delete word if it exists
          if (wordIndMain >= 0) {
            console.log(word + " was found!");
            //find corresponding range table
            let rngInd = rngTbl.findIndex(ind => {return ind.fn === mainIndex[wordIndMain].fn});
            let offset = 0;
            //file path for BSON file
            let filePath = path.join(WORD_INDS_LOCATION, "./" + mainIndex[wordIndMain].fn);
            let currRng = 0;
            while (word > rngTbl[currRng].r[1]) { currRng++ };

            //if word is exclusive word
            if (checkExclusiveWord(word)) {
              console.log("exclusive word");
              let locArr = Object.values(extractRngIndex(rngTbl[currRng]));
              let i = 0;
              //remove values as usual
              while (i < locArr.length) {
                let count = locArr[i];
                if (locArr[i + 1] === fileID) {
                  locArr.splice(i, count + 2);
                  i = locArr.length;
                } else {
                  i += count + 2;
                }
              }

              //re-store
              var locArrNew = new Uint32Array(locArr);
              //if the word only occurs in that file, remove word from index
              locArr.length == 0 ? mainIndex.splice(wordIndMain,1) : mainIndex[wordIndMain].sz = locArr.length;
              //update and store
              rngTbl[currRng].sz = locArr.length;
              storeRngIndex(rngTbl[currRng], [{w: word , a: locArrNew}]);

              c++;

            //word doesen't overflow file
            } else {

            arr = Object.values(readUint32ArrFileSync(filePath));

            //find all words to delete in that single range so we only have to read/write once
              while (deleteWords[c] <= rngTbl[currRng].r[1]) {
                word = deleteWords[c];
                console.log("current word = " + word);
                wordIndMain = mainIndex.findIndex(wordInd => wordInd.w === word);

                if (wordIndMain >= 0) {

                  let i = mainIndex[wordIndMain].st;
                    //removes all aspects of word from file
                    let sizeBound = mainIndex[wordIndMain].st + mainIndex[wordIndMain].sz;
                    while (i < sizeBound) {
                      let count = arr[i];
                      if (arr[i + 1] === fileID) {
                        offset = count + 2;
                        arr.splice(i, offset);
                        i += count + 2;
                        sizeBound -= offset;

                      } else {
                        i += count + 2;
                      }
                    }

                    //change start values of all other words in file
                    let j = wordIndMain + 1;
                    while (j < mainIndex.length && mainIndex[j].w <= rngTbl[rngInd].r[1]) {
                      mainIndex[j++].st -= offset;
                    }

                    //update size of word in question.

                    mainIndex[wordIndMain].sz -= offset;

                    //if word only appears in that file, remove it from index
                    if (mainIndex[wordIndMain].sz === 0) {
                      console.log("deleting: " + mainIndex[wordIndMain].w);
                      mainIndex.splice(wordIndMain,1);
                      //if the upper or lower range is deleted
                      if (rngTbl[currRng].r[0] != rngTbl[currRng].r[1]) {
                        if (rngTbl[currRng].r[0] === word) {
                          rngTbl[currRng].r[0] = mainIndex[wordIndMain].w;
                        }
                        if (rngTbl[currRng].r[1] === word) {
                          rngTbl[currRng].r[1] = mainIndex[wordIndMain - 1].w;
                        }
                      }
                    }

                    //updates range file size
                    rngTbl[currRng].sz -= offset;
                  }

                c++;
              }
            }

            console.log(c)
            console.log("trying to store")
            let toStore = new Uint32Array(arr);
            writeUint32ArrFileSync(filePath, toStore);

          }
          //word doesn't exist, move onto next one
          else {
            console.log("words deleted - incremending c")
            c++;
          }
     }
    resolve();
  });
}

/**
   Saves the current in-application indices to disk.
   This includes the mainIndex, lookup table, and range table.
   @param {string} indexFn - filename we are storing the main index as
   @param {string} fileTableFn - filename we are storing lookup table as
   @param {string} rngTableFn - filename we are storing range table as
  */
export function saveIndexToFile(indexFn, fileTableFn, rngTableFn) {

  let filePath = path.join(WORD_INDS_LOCATION, './' + indexFn);
  return new Promise(resolve => {

    fs.writeFile(filePath, BSON.serialize(mainIndex), function (err) {
      if (err) throw err;
      let filePath = path.join(WORD_INDS_LOCATION, './' + fileTableFn);
      fs.writeFile(filePath, BSON.serialize(lookup), function (err) {
        if (err) throw err;
        let filePath = path.join(WORD_INDS_LOCATION, './' + rngTableFn);
        fs.writeFile(filePath, BSON.serialize(rngTbl), function (err) {
          if (err) throw err;
          console.log('Index saved to file');
          resolve();
        });
      });
    });
  });
}

/**
   Loads indices from disk into application memory.
   @param {string} indexFn - filename of the main index
   @param {string} fileTableFn - filename of the lookup table
   @param {string} rngTableFn - filename of the range table
  */
export function loadIndexFromFile(indexFn, tableFn, rngTableFn) {
  console.log("inside loadIndexFromFile, WORD_INDS_LOCATION = " + WORD_INDS_LOCATION);
  let filePath = path.join(WORD_INDS_LOCATION, './' + indexFn);
  return new Promise(resolve => {
    fs.readFile(filePath, function(err,data1){
      if (err) {mainIndex = []; return;}

      mainIndex = Object.values(BSON.deserialize(data1));
      console.log('Index loaded from file');
      let filePath = path.join(WORD_INDS_LOCATION, './' + tableFn);
      fs.readFile(filePath, function(err,data2){
        if (err) {lookup = [{fileName: "", a: []}]; return;}
        lookup = Object.values(BSON.deserialize(data2));
        filePath = path.join(WORD_INDS_LOCATION, './' + rngTableFn);

        fs.readFile(filePath, function(err,data3){
          if (err) {rngTbl = []; return;}
          rngTbl = Object.values(BSON.deserialize(data3));
          console.log("Index loaded from file.")
          console.log("Index size: " + mainIndex.length);
          console.log("Lookup size: " + lookup.length);
          console.log("rngTbl size: " + rngTbl.length);
          resolve();
        });
      });
    });
  });
}

/**
   Returns last modification date for file
   @param {string} fileName - file we are checking
   @return Date
  */
function getLastMod(fileName) {

  let lastMod = 0;
  return new Promise(resolve => {

    //let escapedFN = fileName.replace(/(\s+)/g, '\\$1');
    let fp = path.join(__dirname, '/test_docs/' + `${fileName}`);
    fs.stat(fp, function(err, stats){

      //if file doesn't exist
      if(err) {
        console.log("error");
      } else {
        lastMod = stats.mtimeMs;
      }
      resolve(lastMod);
    });
  });
}






/**
   Takes a file and returns a list of all indexed words in the file
   with their locations. It calls wordLocsMapping to accomplish this.
   @param {string} filePath - path of the file we are indexing
   @return array - returns an array of objects. Each object has a word field,
   denoted 'w', indicating which word in the file it represents. It also has an
   all-locations field, denoted 'a', which is an array of integers.
   Each integer is the starting position of an instance of the word in the file.
  */
function getFileIndex(filePath) {

  let fileIndex = [];
  //We give file IDs sequentually - we can just set it equal to the length of the
  //lookup tabble that holds all of the files that have been indexed before
  //the current file.
  let fileNum = lookup.length;

  var newEntry = {
    fileName: filePath,
    ID: fileNum,
     lastMod: 0
  };

  lookup.push(newEntry);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      var t1 = performance.now();
      if (!err) {
        // Case-sensitive indexing not implented for simplicity.
        var cleanText = '';
        //if annotations file
        if (filePath.slice(-5) === ".json") {
          let json = JSON.parse(data);
          json.highlightData.forEach(highlight => {
            cleanText = cleanText + " \n " + highlight.comment;
          });
          cleanText = cleanText.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' ');
          cleanText = cleanText.toLowerCase();
        }
        else {
          //parsing html and metadata
          try{
            console.log(filePath)
            console.log('1')
            const dom = new JSDOM(data, { virtualConsole });
            console.log('2')
            let meta = dom.window.document.querySelectorAll("meta");
            //console.log("Meta tag count: " + meta.length);
            console.log('3')
            meta.forEach(tag => {
              console.log('4')
              let content = tag.getAttribute('content');
             // console.log(content);
              cleanText = cleanText + " " + content + " ";
            })
            console.log('5')
            let img = dom.window.document.querySelectorAll("img");
           // console.log("Img tag count: " + img.length);
            img.forEach(tag => {
              let alt =tag.getAttribute('alt');
            //  console.log(alt);
              cleanText = cleanText + " " + alt + " ";
            });
            dom.window.document.querySelectorAll("script, style").forEach(node => node.parentNode.removeChild(node));
            cleanText = cleanText + " " + dom.window.document.documentElement.outerHTML.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, " ");
            let pathStrs = fileName.split('/');
            cleanText = cleanText + " " + pathStrs[0].slice(0, pathStrs[0].lastIndexOf('-'));
            cleanText = cleanText + " " + pathStrs[1];
            cleanText = cleanText.toLowerCase();
          }catch(e){
            console.log("got the css error")
          }
        }
        //returns the locations for every word in the file
        let wordMapping = wordLocsMapping(cleanText);
        //pushes all of these to a list to return
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
  });
}

let tempIndex = [];

/**
   Takes a list of words and locations returned by getFileIndex
   and adds them to the main index. These are added to a temporary index first
   before being stored to the main index and written to file to reduce individual i/o calls
   and instead do a batch i/o when we reach a certain capacity.
   @param {array} fileIndex - returned by calling getFileIndex on the name of the file
  */
function addToMainIndex(fileIndex) {

  //assumes unique words, and no preexisting entries for the file being added
  fileIndex.forEach(fileWord => {

    let wordInd = tempIndex.findIndex(mainWord => mainWord.w == fileWord.w);
    if (wordInd >= 0) {
      tempIndex[wordInd].a = tempIndex[wordInd].a.concat(fileWord.a);
    } else {
      tempIndex.push(fileWord);
    }
  });
}

/**
   Takes a range struct, gets the content of file as a list,
   and formats it as an index of words -> location arrays
   @param {Object} rng - A range object, which holds the filename
   of the range it refers to, as well as the upper and lower bounds
   for the words it contains. (i.e., words from apple to dog)
   @return array - returns an array of objects. Each object has a word field,
   denoted 'w', indicating which word in the file it represents. It also has an
   all-locations field, denoted 'a', which is an array of integers.
   From these integers we can call GetWordLocs and get a list of files
   and locations within the files.
  */
function extractRngIndex(rng) {
  if (rng.fn.slice(0,1) == SINGLE_WORD_FLAG) {
    let wordList = new Uint32Array(rng.sz);
    let currInd = 0;
    rng.af.forEach(fn => {
      if (currInd < rng.sz) {
        let filePath = path.join(WORD_INDS_LOCATION, "./" + fn);
        let listInFile = readUint32ArrFileSync(filePath);
        wordList.set(listInFile, currInd);
        currInd += listInFile.length;
      }
    });
    return wordList
  }
  else {
    //console.log("reading from file: " + rng.fn);
    let filePath = path.join(WORD_INDS_LOCATION, "./" + rng.fn);
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
}

/**
   Takes a range object, converts it to a single list, and
   stores it in the range index. Afterward, it will write the
   range index to file in the data/word_inds folder.
   @param {Object} rng - Range object we want to store
   @param {Object} rngIndex - our index that stores ranges
**/
function storeRngIndex(rng, rngIndex) {
  if (rng.fn.slice(0,1) == SINGLE_WORD_FLAG) {
    let wordList = rngIndex[0].a;
    let currInt = 0;
    let reqExtraFiles = Math.ceil(rng.sz / MAX_INT_PER_FILE) - rng.af.length;
    while (reqExtraFiles > 0) {
      let newFn = SINGLE_WORD_FLAG + (rngFileCnt++).toString() + "_BSON";
      rng.af.push(newFn);
      reqExtraFiles--;
    }
    rng.af.forEach(fn => {
      let remainder = rng.sz - currInt;
      if (remainder > 0) {
        let fileSz = remainder < MAX_INT_PER_FILE ? remainder : MAX_INT_PER_FILE;
        let filePath = path.join(WORD_INDS_LOCATION, "./" + fn);
        writeUint32ArrFileSync(filePath, wordList.slice(currInt, currInt + fileSz));
        currInt += fileSz;
      }
    });
  }
  else {
    var locArrNew = new Uint32Array(rng.sz);
    let i = mainIndex.findIndex(wordInd => {return wordInd.w === rng.r[0]});
    let j = 0;
    var performSplit;
    //console.log("storing to file: " + rng.fn);
    var wordInd;
    while (i < mainIndex.length && (wordInd = mainIndex[i++]).w <= rng.r[1]) {
      locArrNew.set(rngIndex[j++].a, wordInd.st);
    }
    let filePath = path.join(WORD_INDS_LOCATION, "./" + rng.fn);
    writeUint32ArrFileSync(filePath, locArrNew);
  }
}


/**
   Does most of the work for converting a fileIndex and storing it
   in our main index and range tables. Deals with all logic of creating
   range files, adding new files, and removing stuff.
   @param {Array} fileIndex - a file index object returned by getFileIndex
  */
function addToMainAux(fileIndex) {

  fileCount++;
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
      if (rngTbl[rngTbl.length - 1].fn.slice(0,1) == SINGLE_WORD_FLAG) {
        let newFn = (rngFileCnt++).toString() + "_BSON";
        let newLowerInd = fileIndex.findIndex(fileWord => fileWord.w > rngTbl[currRng].r[1]);
        let newRng = {
          r: [fileIndex[newLowerInd].w, fileIndex[fileIndex.length - 1].w],
          fn: newFn,
          sz: 0
        }
        rngTbl.push(newRng);
      }
      else {
        rngTbl[rngTbl.length - 1].r[1] = fileIndex[fileIndex.length - 1].w;
      }
    }
  }

  let currRng = 0;
  let i = 0;
  let newWords = [];

  while(i < fileIndex.length) {
    let fileWord = fileIndex[i];

    // find correct range for fileWord
    while (fileWord.w > rngTbl[currRng].r[1]) { currRng++ };

    // if range is occupied by single word, check if word should be added to exclusive range, or expand previous range and use that range
    if (rngTbl[currRng].fn.slice(0,1) == SINGLE_WORD_FLAG) {
      if (fileWord.w == rngTbl[currRng].r[1]) {
        let locArr = extractRngIndex(rngTbl[currRng]);
        var locArrNew = new Uint32Array(locArr.length + fileWord.a.length);
        locArrNew.set(locArr);
        locArrNew.set(fileWord.a, locArr.length);
        mainIndex[mainIndex.findIndex(mainWord => mainWord.w == fileWord.w)].sz = locArrNew.length;
        storeRngIndex(rngTbl[currRng], [{w: fileWord.w , a: locArrNew}]);
        break;
      }
      else {
        let newUpperInd = fileIndex.findIndex(fileWord => fileWord.w >= rngTbl[currRng].r[1]) - 1;
        // if previous rng is also exclusive, need to make a new range
        if (currRng == 0 || rngTbl[currRng - 1].fn.slice(0,1) == SINGLE_WORD_FLAG) {
          let newFn = (rngFileCnt++).toString() + "_BSON";
          let newRng = {
            r: [fileWord.w, fileIndex[newUpperInd].w],
            fn: newFn,
            sz: 0
          }
          rngTbl.splice(currRng, 0, newRng)
        } else {
          rngTbl[--currRng].r[1] = fileWord.w;
        }
      }
    }

    // convert rngFile for currRng to an index format
    let rngIndex = rngTbl[currRng].sz === 0 ? [] : extractRngIndex(rngTbl[currRng]);

    while(i < fileIndex.length && (fileWord = fileIndex[i]).w <= rngTbl[currRng].r[1]) {
      // find index of fileWord word in both rngIndex and mainIndex, or would-be index if fileWord hasn't been indexed.

      let wordIndRng = rngIndex.findIndex(rngWord => rngWord.w >= fileWord.w);
      let wordIndMain = mainIndex.findIndex(mainWord => mainWord.w >= fileWord.w);

      let hasBeenIndexed = (wordIndRng >= 0 && rngIndex[wordIndRng].w === fileWord.w);

      // if locations fit in rng, add them accordingly

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
        wordcount++;
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

      if (rngTbl[currRng].sz > MAX_INT_PER_FILE) {

        //stores current size of words seen
        let count = 0;
        //current rngIndex index we are looking at
        let k = 0;
        //target size for each
        let totalLen = rngTbl[currRng].sz;
        let target = totalLen / 2;
        let currIndMain = mainIndex.findIndex(mainWord => mainWord.w === rngIndex[0].w);

        while (count < target) {
          count += mainIndex[currIndMain++].sz;
          k++;
        }
        // at the end of loop, i is the index after the last word summed in count.

        if (count > MAX_INT_PER_FILE) {
          count -= mainIndex[currIndMain - 1].sz;
          k--;
        }
        // special case in which single word index exceeds max int per file
        if (totalLen - count  >= MAX_INT_PER_FILE) {

          newFn1 = SINGLE_WORD_FLAG + (rngFileCnt++).toString() + "_BSON";
          newFn2 = SINGLE_WORD_FLAG + (rngFileCnt++).toString() + "_BSON";

          let newRng = {
            r: [fileWord.w, fileWord.w],
            fn: newFn1,
            sz: rngIndex[wordIndRng].a.length,
            af: [newFn1, newFn2]
          }

          mainIndex[wordIndMain].fn = newFn1;
          mainIndex[wordIndMain].st = 0;
          mainIndex[wordIndMain].sz = newRng.sz;

          // sub-case: said word is first word in range
          if (wordIndRng == 0) {
            // sub-sub-case: said word is only word in range (and range is not to be filled with more values)
            // NEED TODO : DELETE OLD FILE!!
            if (rngIndex.length === 1 && rngTbl[currRng].r[1] === fileWord.w) {
              rngTbl[currRng] = newRng;
              // let exclRngIndex = rngIndex;
              // storeRngIndex(rngTbl[currRng], exclRngIndex);
            } else {
              rngTbl.splice(currRng,0, newRng);
              //update currRng (from just inserted exlusive range to next range) and update bounds
              if ((rngTbl[++currRng].sz -= newRng.sz) == 0) {
                rngTbl[currRng].r[0] = fileIndex[i + 1].w;
              } else {
                rngTbl[currRng].r[0] = rngIndex[wordIndRng + 1].w;
              }
              let exclRngIndex = rngIndex.slice(0,1);
              rngIndex = rngIndex.slice(1); // rngIndex is now the remainder of rngIndex after the added word
              storeRngIndex(rngTbl[currRng - 1], exclRngIndex);
              let j = wordIndMain + 1;
              while (j < mainIndex.length && mainIndex[j].w <= rngTbl[currRng].r[1]) {
                mainIndex[j++].st -= mainIndex[wordIndMain].sz;
              }
            }
          }
          else {
            let lowerRngIndex = rngIndex.slice(0, wordIndRng);
            // if said word is in middle of range, need to create 2nd new ranges (non exclusive)
            if (wordIndRng != rngIndex.length - 1 || rngTbl[currRng].r[1] != fileWord.w) {
              let newFn3 = (rngFileCnt++).toString() + "_BSON";
              let newSize = rngTbl[currRng].sz - count - rngIndex[wordIndRng].a.length;
              let newLowerRng = newSize > 0 ? rngIndex[wordIndRng + 1].w : fileIndex[i + 1].w;
              let newRng2 = {
                r: [newLowerRng, rngTbl[currRng].r[1]],
                fn: newFn3,
                sz: newSize
              }
              // update lower rng (currently currRng)
              rngTbl[currRng].r[0] = rngIndex[0].w;
              rngTbl[currRng].r[1] = rngIndex[wordIndRng - 1].w;
              rngTbl[currRng].sz = count;
              // if curr range is last in table, just push new ranges, o.w. splice.
              // Set currRng to index of newRng2;
              if (currRng == rngTbl.length - 1) {
                rngTbl.push(newRng);
                rngTbl.push(newRng2);
                currRng = rngTbl.length - 1;
              } else {
                rngTbl.splice(++currRng,0, newRng);
                rngTbl.splice(++currRng,0, newRng2);
              }
              let exclRngIndex = rngIndex.slice(wordIndRng,wordIndRng + 1);
              rngIndex = rngIndex.slice(wordIndRng + 1);
              // done with lower and exclusive ranges, so store them
              // first need to update mainIndex entries for

              storeRngIndex(rngTbl[currRng-2], lowerRngIndex);
              storeRngIndex(rngTbl[currRng-1], exclRngIndex);
              let j = wordIndMain + 1;
              while (j < mainIndex.length && mainIndex[j].w <= rngTbl[currRng].r[1]) {
                mainIndex[j].fn = newFn3;
                mainIndex[j++].st -= (mainIndex[wordIndMain].sz + count);
              }
            }
            // if word is last in range:
            else {
              // update lower rng (currently currRng)
              rngTbl[currRng].r[0] = rngIndex[0].w;
              rngTbl[currRng].r[1] = rngIndex[wordIndRng - 1].w;
              rngTbl[currRng].sz = count;
              if (currRng == rngTbl.length - 1) {
                rngTbl.push(newRng);
                currRng = rngTbl.length - 1;
              } else {
                rngTbl.splice(++currRng,0, newRng);
              }
              rngIndex = rngIndex.slice(wordIndRng);
              storeRngIndex(rngTbl[currRng-1], lowerRngIndex);
            }
          }
        }
        else {
          if (rngIndex.length <= k) {
            console.log("ERRORRRR");
          }
          let upperRngIndex = rngIndex.slice(k);
          rngIndex = rngIndex.slice(0,k);

          rngTbl[currRng].sz = count;
          let tempRng = rngTbl[currRng].r[1];
          rngTbl[currRng].r[1] = rngIndex[rngIndex.length - 1].w;
          let newFn = (rngFileCnt++).toString() + "_BSON";
          let newRng = {
            r: [upperRngIndex[0].w, tempRng],
            fn: newFn,
            sz: totalLen - count
          };
          rngTbl.splice(currRng + 1, 0, newRng);

          let j = mainIndex.findIndex(mainWord => mainWord.w === upperRngIndex[0].w);
          while (j < mainIndex.length && mainIndex[j].w <= rngTbl[currRng+1].r[1]) {
            mainIndex[j].fn = newFn;
            mainIndex[j++].st -= count;
          }
          try {
            storeRngIndex(rngTbl[currRng + 1], upperRngIndex);
          } catch(error) {
            console.log(error.stack);
            console.log("ERROR: Storage issue at word " + fileWord.w + " at file " + fileCount + ":\n" + error);
          }
        }
      }
      i++;
    }

    rngTbl[currRng].r[0] = rngIndex[0].w;
    try {
      storeRngIndex(rngTbl[currRng], rngIndex);
    } catch(error) {
      console.log(error.stack);
      console.log("ERROR: Storage issue at word " + fileWord.w + ":\n" + error);
    }
  }
}



/**
   Main function that will be called by the front end when we
   want to index files. This calls all the previous methods in tandem
   to take a list of filenames and index all the words within.
   @param {Array of strings} fileNames - names of the file we are indexing
  */

export function addFilesToMainIndex(fileNames) {
  console.log("inside addFilesToMainIndex: WORD_INDS_LOCATION = " + WORD_INDS_LOCATION);
  console.log("called with: " + JSON.stringify(fileNames));
  if (!fs.existsSync(WORD_INDS_LOCATION)){
    fs.mkdirSync(WORD_INDS_LOCATION);
  }

  //determines if we have seen a file before - if we have,
  //we don't index it.
  let newFiles = [];

  fileNames.forEach(fileName => {
    if (lookup.findIndex(entry => {return entry.fileName === fileName}) < 0) {
      newFiles.push(fileName);
    }
  });

  let indexPromises = [];

  return new Promise(resolveAll => {

    newFiles.forEach(fileName => {
      indexPromises.push(new Promise(resolve => {
        getFileIndex(fileName).then(fileIndex => {
          addToMainIndex(fileIndex);
          var t1 = performance.now();
          let tempSize = sizeof(tempIndex);
          var t2 = performance.now();
          sizeCheckTime += (t2 - t1);
          if (tempSize > MAX_CLUSTER) {
            //store temp index to file
            addToMainAux(tempIndex);
            tempIndex = [];
          }
          resolve();
        });
      }));
    });
    Promise.all(indexPromises).then(() => { //!!!!
      if (tempIndex.length != 0) {
        addToMainAux(tempIndex);
        tempIndex = [];
      }
      saveIndexToFile("index_BSON", "lookup_BSON", "ranges_BSON");
      console.log("Index saved to file.");
      resolveAll();
    });
  });
}

/**
   Takes an array of numbers returned by extractRng and converts them
   into objects for the search function.
   @param {Array of integers} codes - An array of integers that give all
   locations of a specific word. The format is:
   Number of times it appears in file, fileID, starting locations
   So, [1,4,25] means the word appears once in file 4 at location 25.
   @return array - returns an array of objects associated with the word.
   The objects have the filename and locations within the file. Each
   object corresponds to a single file.
  */
function getWordLocs(codes) {
  let wordLocs = [];

  for (let i = 0; i < codes.length; i++) {
    //gets number of locations in specific file
    let numLocs = codes[i++];
    //returns file ID number
    let fileID = codes[i];
    let fn = lookup[fileID].fileName;

    //adds all locations
    let locs = [];
    for (let j = 1; j <= numLocs; j++) {
      locs.push(codes[i + j]);
    }
    i += numLocs;
    wordLocs.push({
      fileName: fn,
      fileLocs: locs
    });
  }
  return wordLocs;
}


/**
   Search function that is called when the user searches for a term.
   If the main Index and tables have not been loaded from file, they are
   loaded and then the searchIndex function is called. Otherwise, we just
   call the searchIndex function.
   @param {string} searchStr - The term or phrase we are searching for
   @return array - returns a JSON object of filenames and locations where the
   word or phrase was found. If the phrase was not found, the object is empty
  */
export function search(searchStr) {
  //if we need to laod index from file
  if (mainIndex.length === 0) {
    return new Promise (function (resolve, reject) {
      loadIndexFromFile("index_BSON", "lookup_BSON", "ranges_BSON").then((thing) => {
        console.log("Index loaded from file." + performance.now());
        var searchClauses = searchStr.trim().split('&&');
        var results;
        if (searchClauses.length > 1) {
          console.log("Search clauses: " + searchClauses);
          var clauseResults = [];
          searchClauses.forEach(clause => {
            searchIndex(clause).results.forEach(hit => {
              var ind;
              if ((ind = _.findIndex(clauseResults, clauseResult => clauseResult.filename === hit.filename)) >= 0) {
                clauseResults[ind].clauses++;
                clauseResults[ind].count += hit.count;
              } else {
                clauseResults.push({filename: hit.filename, clauses: 1, count: hit.count});
              }
            });
          });
          results = {results: clauseResults.filter(result => result.clauses == searchClauses.length)};
        } else {
          results = searchIndex(searchStr);
          console.log(results);
        }
        resolve(results);
      });
    });

  } else {
    return new Promise (function (resolve, reject) {
      var searchClauses = searchStr.trim().split('&&');
      var results;
      if (searchClauses.length > 1) {
        console.log("Search clauses: " + searchClauses);
        var clauseResults = [];
        searchClauses.forEach(clause => {
          searchIndex(clause).results.forEach(hit => {
            var ind;
            if ((ind = _.findIndex(clauseResults, clauseResult => clauseResult.filename === hit.filename)) >= 0) {
              clauseResults[ind].clauses++;
              clauseResults[ind].count += hit.count;
            } else {
              clauseResults.push({filename: hit.filename, clauses: 1, count: hit.count});
            }
          });
        });
        results = {results: clauseResults.filter(result => result.clauses == searchClauses.length)};
      } else {
        results = searchIndex(searchStr);
        console.log(results);
      }
      resolve(results);
    });
  }
}


/**
   Search function that looks through our index and range files to
   retrieve all locations of a word. It first gets a list of files that contain
   each word. If the search was only for a single word, then the search is done.
   Otherwise, we then check these files to see which ones contain all the words,
   and then if any of those contain the phrase.
   @param {string} searchStr - The term or phrase we are searching for
   @return array - returns a JSON object of filenames and locations where the
   word or phrase was found. If the phrase was not found, the object is empty
  */

function searchIndex(searchStr) {

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
    let results = _.findWhere(mainIndex, {w: word});
    //if not found return empty
    if (results == null) return {results: finalResults};
    //Changes into filename and location format
    let wordLocs = [];
    //If word is in an exclusive range, we need to retrieve its
    //locations in a special way
    if (results.fn.slice(0,1) === SINGLE_WORD_FLAG) {
      let rngInd = rngTbl.findIndex(rng => rng.fn == results.fn);
      let locsList = extractRngIndex(rngTbl[rngInd]);
      wordLocs = getWordLocs(locsList);
    } else {
      let filePath = path.join(WORD_INDS_LOCATION, "./" + results.fn);
      wordLocs = getWordLocs((readUint32ArrFileSync(filePath)).slice(results.st, results.st + results.sz));
    }
    wordResults.push(wordLocs);
    wordLocs.forEach(fileLocs => {
      wordFiles.push(fileLocs.fileName);
    });
    fileLists.push(wordFiles);
  }

  //search for a single term means we can stop here
  if (searchWords.length <= 1) {
    wordResults.forEach(obj => {
      obj.forEach( entry => {
        if (entry.fileName != '') {
          finalResults.push({
            filename: entry.fileName,
            count: entry.fileLocs.length
          });
        }
      });
    });
    console.log(finalResults);
    return {results: _.sortBy(finalResults, result => {return -result.count})};
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
      filename: fileName,
      count: fileResults.length
    });

  });

  return {results: _.sortBy(finalResults, result => {return (-result.count)})};

}
