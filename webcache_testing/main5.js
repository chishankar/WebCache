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
var emptyRng = []

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
var indexOnFile = false;
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

// TODO: save array of N-bit integers as array of 8-bit integers
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






function delFilesFromIndex(mainIndex, fileNames, origData) {
  // case for when files are removed outside of the application, whole index must be traversed
  if (origData === undefined || origData.length == 0) {

  }
}


function checkExclusiveWord(word) {
  let wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === word});
  if (wordIndMain === -1) {return false;}
  return (mainIndex[wordIndMain].fn.slice(0,1) == SINGLE_WORD_FLAG);
}

function update(filename, oldStr) {
  deleteFile(filename, oldStr).then(result => {
    addFilesToMainIndex([filename]);
  });
}

function deleteFile(filename, str) {

  return new Promise(resolve => {

        let lookupID = lookup.findIndex(entry => {return entry.fileName === filename});
        let fileID = lookup[lookupID].ID;
        let cleanText = str.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' ');
        //retrieves all words we have to delete
        let deleteWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value,index,self) {return !stopWords.includes(value) && self.indexOf(value) === index;});
        deleteWords.sort();
        //deletes each word individually
        let c = 0;
        while (c < deleteWords.length) {
          let word = deleteWords[c];
          let wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === word});
          //find corresponding range table
          let rngInd = rngTbl.findIndex(ind => {return ind.fn === mainIndex[wordIndMain].fn});
          let offset = 0;
          //file path for BSON file
          let filePath = path.join(__dirname, "../data/word_inds/" + mainIndex[wordIndMain].fn);
          let currRng = 0;
          while (word > rngTbl[currRng].r[1]) { currRng++ };

          //if word is exclusive word
          if (checkExclusiveWord(word)) {
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
            let arr = Object.values(readUint32ArrFileSync(filePath));

           //find all words to delete in that single range so we only have to read/write once
            while (deleteWords[c] <= rngTbl[rngInd].r[1] && !checkExclusiveWord(deleteWords[c])) {
              word = deleteWords[c];
              wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === deleteWords[c]});

              if (wordIndMain === -1) {return;}

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
                  mainIndex.splice(wordIndMain,1);
                  //if the upper or lower range is deleted
                  // if (rngTbl[currRng].r[0] === word) {
                  //   rngTbl[currRng].r[0] === mainIndex[wordIndMain + 1].w;
                  // }
                  // if (rngTbl[currRng].r[1] === word) {
                  //   rngTbl[currRng].r[1] === mainIndex[wordIndMain - 1].w;
                  // }
                }

                //updates range file size
                rngTbl[currRng].sz -= offset;

                c++;
            }
            let toStore = new Uint32Array(arr);
            writeUint32ArrFileSync(filePath, toStore);
          }
        lookup[lookupID].fileName = '';
        resolve();
    }
  });
}

function deleteFileFromDirectory(filename) {

  let filePath = path.join(__dirname, "/test_docs/" + filename);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data) {
      if (err) {
      throw err;
      } else {
        let lookupID = lookup.findIndex(entry => {return entry.fileName === filename});
        let fileID = lookup[lookupID].ID;
        let cleanText = data.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' ');
        //retrieves all words we have to delete
        let deleteWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value,index,self) {return !stopWords.includes(value) && self.indexOf(value) === index;});
        deleteWords.sort();
        //deletes each word individually
        let c = 0;
        while (c < deleteWords.length) {
          let word = deleteWords[c];
          let wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === word});
          //find corresponding range table
          let rngInd = rngTbl.findIndex(ind => {return ind.fn === mainIndex[wordIndMain].fn});
          let offset = 0;
          //file path for BSON file
          let filePath = path.join(__dirname, "../data/word_inds/" + mainIndex[wordIndMain].fn);
          let currRng = 0;
          while (word > rngTbl[currRng].r[1]) { currRng++ };

          //if word is exclusive word
          if (checkExclusiveWord(word)) {
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
            let arr = Object.values(readUint32ArrFileSync(filePath));

           //find all words to delete in that single range so we only have to read/write once
            while (deleteWords[c] <= rngTbl[rngInd].r[1] && !checkExclusiveWord(deleteWords[c])) {
              word = deleteWords[c];
              wordIndMain = mainIndex.findIndex(wordInd => {return wordInd.w === deleteWords[c]});

              if (wordIndMain === -1) {return;}

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
                  mainIndex.splice(wordIndMain,1);
                  //if the upper or lower range is deleted
                  // if (rngTbl[currRng].r[0] === word) {
                  //   rngTbl[currRng].r[0] === mainIndex[wordIndMain + 1].w;
                  // }
                  // if (rngTbl[currRng].r[1] === word) {
                  //   rngTbl[currRng].r[1] === mainIndex[wordIndMain - 1].w;
                  // }
                }

                //updates range file size
                rngTbl[currRng].sz -= offset;

                c++;
            }
            let toStore = new Uint32Array(arr);
            writeUint32ArrFileSync(filePath, toStore);
          }
        }}
        resolve();
    });
  });
}

function saveIndexToFile(indexFn, fileTableFn, rngTableFn) {

  let filePath = path.join(__dirname, indexFn);
  return new Promise(resolve => {

    fs.writeFile(filePath, BSON.serialize(mainIndex), function (err) {
      if (err) throw err;
      console.log('Index saved to file');
      let filePath = path.join(__dirname, fileTableFn);
      fs.writeFile(filePath, BSON.serialize(lookup), function (err) {
        if (err) throw err;
        let filePath = path.join(__dirname, rngTableFn);
        fs.writeFile(filePath, BSON.serialize(rngTbl), function (err) {
          if (err) throw err;
          resolve();
        });
      });
    });
  });
}

function loadIndexFromFile(indexFn, tableFn, rngTableFn) {

  if (!indexOnFile) {
    return;
  }

  let filePath = path.join(__dirname, indexFn);
  return new Promise(resolve => {
    fs.readFile(filePath, function(err,data){
      if (err) throw err;
      mainIndex = BSON.deserialize(data);
      console.log('Index loaded from file');
      let filePath = path.join(__dirname, tableFn);
      fs.readFile(filePath, function(err,data){
        if (err) throw err;
        lookup = BSON.deserialize(data);
        let filePath = path.join(__dirname, rngTableFn);
        fs.readFile(filePath, function(err,data){
          if (err) throw err;
          rngTbl = BSON.deserialize(data);
          resolve([index, fileTable, rngTbl]);
        });
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

  let fileNum = lookup.findIndex(entry => entry.fileName == fileName);
  let fileIndex = [];

 //if (fileNum == -1) {

    //Assigns file ID and adds to lookup table
    fileNum = lookup.length;

    var newEntry = {
      fileName: fileName,
      ID: fileNum,
      lastMod: 0
    };

    // getLastMod(fileName).then( result => {
    //   newEntry.lastMod = result;
    // });

    lookup.push(newEntry);

  // } else {

  //   getLastMod(fileName).then( result => {
  //     lookup[fileNum].lastMod = result;
  //   });
  // }

  let filePath = path.join(__dirname, '../data/' + fileName);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
      var t1 = performance.now();
        if (!err) {
          // TODO: REMOVE HTML TAGS
          // Case-sensitive indexing not implented for simplicity.
          let cleanText = data.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' ');
          let wordMapping = wordLocsMapping(cleanText);
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

// takes rng struct, gets list from range file, formats as index
function extractRngIndex(rng) {
  if (rng.fn.slice(0,1) == SINGLE_WORD_FLAG) {
    let wordList = new Uint32Array(rng.sz);
    let currInd = 0;
    rng.af.forEach(fn => {
      if (currInd < rng.sz) {
        let filePath = path.join(__dirname, "../data/word_inds/" + fn);
        let listInFile = readUint32ArrFileSync(filePath);
        wordList.set(listInFile, currInd);
        currInd += listInFile.length;
      }
    });
    return wordList
  }
  else {
    //console.log("reading from file: " + rng.fn);
    let filePath = path.join(__dirname, "../data/word_inds/" + rng.fn);
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
// takes rngIndex, converts to single list and stores to respective file
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
        let filePath = path.join(__dirname, "../data/word_inds/" + fn);
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
    let filePath = path.join(__dirname, "../data/word_inds/" + rng.fn);
    writeUint32ArrFileSync(filePath, locArrNew);
  }
}

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

    // if (fileWord.w == "another" || fileWord.w == "announcer") {
    //   console.log("here");
    // }

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
        // WE HAVE TO BREAK OUT OF THE MAIN LOOP HERE!! IDK IF THIS DOES IT:
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

      // if (fileWord.w == "another" || fileWord.w == "announcer") {
      //   console.log("here");
      // }

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
          newFn = (rngFileCnt++).toString() + "_BSON";
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
      console.log("ERROR: Storage issue at word " + fileWord.w + ":\n" + error);
    }
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


export function addFilesToMainIndex(fileNames) {

  let indexPromises = [];

  return new Promise(resolveAll => {

    fileNames.forEach(fileName => {
      indexPromises.push(new Promise(resolve => {
        getFileIndex(fileName).then(fileIndex => {
          addToMainIndex(fileIndex);
          var t1 = performance.now();
          let tempSize = sizeof(tempIndex);
          var t2 = performance.now();
          sizeCheckTime += (t2 - t1);
          if (tempSize > MAX_CLUSTER) {
            //console.log(sizeof(tempIndex));
            addToMainAux(tempIndex);
            tempIndex = [];
          }
          resolve();
        });
      }));
    });
    Promise.all(indexPromises).then(() => {
      if (tempIndex.length != 0) {
        addToMainAux(tempIndex);
        tempIndex = [];
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

export function search(searchStr) {
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
    if (results == null) return finalResults;
    //Changes into filename and location format
    var wordLocs;
    if (results.fn.slice(0,1) == SINGLE_WORD_FLAG) {
      let rngInd = rngTbl.findIndex(rng => rng.fn == results.fn);
      let locsList = extractRngIndex(rngTbl[rngInd]);
      wordLocs = getWordLocs(locsList);
    } else {
      let filePath = path.join(__dirname, "../data/word_inds/" + results.fn);
      wordLocs = getWordLocs((readUint32ArrFileSync(filePath)).slice(results.st, results.st + results.sz));
    }
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
          filename: entry.fileName,
          count: entry.fileLocs.length
        });
      });
    });

    return {results: finalResults};
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

  return {results: finalResults};

}
