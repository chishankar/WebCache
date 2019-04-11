// testing code

const url = require('url');
const path = require('path');
const { exec } = require('child_process');
const _ = require('underscore');
const fs = require('fs');
const sizeof = require('object-sizeof');
const { PerformanceObserver, performance } = require('perf_hooks');

var readline = require("readline");


//Lookup table between file name and file number
let lookup = [];
lookup.push({word: " ", allLocs: []});

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
function getFileIndex(fileName) {

  //Assigns file ID and adds to lookup table
  let fileNum = lookup.length;
  var fileIndex = [];
  var newEntry = {
    fileName: fileName,
    ID: fileNum
  };

  lookup.push(newEntry);

  let filePath = path.join(__dirname, '/test_docs/' + fileName);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
          // TODO: REMOVE HTML TAGS
          // Case-sensitive indexing not implented for simplicity.

          let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");
          let fileWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value, index, self){return self.indexOf(value) === index;});

          //Iterate for each unique word in file
          fileWords.forEach( word => {
            //Will hold a list of IDs for each word, one for each location
            let w2 = word;
            let IDList = [];
            let locations = getIndicesOf(word,cleanText);
            //Calculates ID for unique location
            locations.forEach(loc => {
              let locLen = loc.toString().length;
              let fileLen = fileNum.toString.length;
              let newID = loc + Math.pow(10, locLen) * fileNum + Math.pow(10, (locLen + fileLen)) * fileLen;
              IDList.push(newID);
            });
            //Push object of word and its locations to return
            fileIndex.push({word: word, allLocs: IDList});
          });
          //returns the list
          resolve(fileIndex);
        } else {
          console.log(err);
        }
    });
  })
}

function addToMainIndex(fileIndex, mainIndex) {

  //assumes unique words, and no preexisting entries for the file being added
  fileIndex.forEach( fileWord => {

    wordInd = mainIndex.findIndex(mainWord => mainWord.word == fileWord.word);

    if (wordInd > 0) {
      mainIndex[wordInd].allLocs.concat(fileWord.allLocs);
    } else {
      mainIndex.push(fileWord);
    }
  });
}

function addFilesToMainIndex(fileNames, mainIndex) {

  return new Promise(resolve => {
    fileNames.forEach(fileName => {
      getFileIndex(fileName).then(fileIndex => {
        addToMainIndex(fileIndex, mainIndex);
      });
    });
    resolve();
  });
}

function search(searchStr, index) {
  let finalResults = []
  let fileLists = []; // will hold all files for each search word
  let wordResults = [];
  let reducedFileList = []; // will hold all files that contain all search words
  let searchWords = searchStr.toLowerCase().trim().split(/\s+/);
  let startIndex = 0;
  let singleRes = [];

  // populate fileLists with lists of files holding each word.
  searchWords.forEach(word => {
    let wordFiles = [];
    let results = _.findWhere(index, {word: word})
    wordResults.push(results.allLocs);
    if (searchWords.length <= 1) {
      singleRes = results.allLocs;
      return;
    }
    results.allLocs.forEach(wordLocs => {
      wordFiles.push(wordLocs.fileName);
    });

    fileLists.push(wordFiles);
  });

  if (searchWords.length <= 1) {
    return singleRes;
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

const mainIndex = [];

var lastFileStats = [];

var proc = exec('ls test_docs', (err, stdout, stderr) => {
  if (err) {
    // node couldn't execute the command
    reject(Error("ls did not execute correctly"));
  }

  dirFiles = stdout.split(/\r?\n/);
  dirFiles.pop();
  addFilesToMainIndex(dirFiles, mainIndex);
 // addFilesToSecondIndex(dirFiles, secondInd);
  // mainIndex.forEach(entry => {
  //   if (entry.word === has) {
  //     console.log(entry.allLocs);
  //   }
  // });
});



function user_search(str) {
  console.log("Search Results for " + str + ":");
  var t0 = performance.now();
  let results = search(str,mainIndex);
  let results2 = searchSecond(str, secondInd);
  var t1 = performance.now();
  results.forEach(obj => {
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

 rl.on("line", function (line) {
  //  lookup.forEach( fileWord => {
  //   console.log(fileWord.fileName + " " + fileWord.ID + "\n");
  //  });
    mainIndex.forEach( fileWord => {
    console.log(fileWord.word + ":\n" + fileWord.allLocs + "\n");
  });
 });


//FOLLOWING FUNCTIONS FOR TESTING
const secondInd = [];

function getFileBody(fileName) {

    filePath = path.join(__dirname, '/test_docs/' + fileName);

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
        if (curr != []) {
            results.push({name: fileName.name, locs: curr});
        }
    });
    return results;
}


