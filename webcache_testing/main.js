//testing code
const electron = require('electron');
const Fuse = require('fuse.js');
const url = require('url');
const path = require('path');
const { exec } = require('child_process');
const _ = require('underscore');
const fs = require('fs');

const {app, BrowserWindow, Menu} = electron;

let mainWindow;



function checkIndexForChanges(lastFileStats, dirFiles, index) {

  // try to find each file from stats list

  for(var i = 0; i < lastFileStats.length; i++) {

    var match = _.find(dirFiles, `${lastFileStats[i].title}`);

    if(match) {

      let escapedFN = lastFileStats[i].title;
      escapedFN.replace(/(\s+)/g, '\\$1');

      exec(`date -r test_docs/${escapedFN}`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }

        // if last modified date isn't the one we have listed, update doc and stats

        if (stdout != `${lastFileStats[i].lastMod}`) {

          filePath = path.join(__dirname, '/test_docs/' + `${escapedFN}`);

          fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
              if (!err) {
                index.update({
                  title: `${lastFileStats[i].title}`,
                  html: data
                });

                lastFileStats[i].lastMod = stdout;

              } else {
                console.log(err);
              }
          });
        }
      });

    } else {
      // file was removed from dir, so remove from index
      index.removeDoc({
        title: lastFileStats[i].title,
      });
    }
  }
}

function checkForNewFiles(lastFileStats, dirFiles, index) {

  console.log("length: " + dirFiles.length)
  dirFiles.forEach(function(fileName) {

    var match = _.find(lastFileStats, {title: fileName});
    console.log(match);

    if(match === undefined) {

      let escapedFN = fileName.replace(/(\s+)/g, '\\$1');

      // file hasn't been added to index, so add it to index and stats list.

      exec(`date -r test_docs/${escapedFN}`, (err, stdout, stderr) => {


        if (err) {
          console.log(`error trying to run: date -r test_docs/${fileName}`)
          // node couldn't execute the command
          return;
        }

        filePath = path.join(__dirname, '/test_docs/' + fileName);

        fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
            if (!err) {
              index.addDoc({
                title: fileName,
                html: data
              });
              lastFileStats.push({
                title: fileName,
                lastMod: stdout
              });
              console.log("File added to index");
            } else {
              console.log(err);
            }
        });
      });
    }
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
    /*
    if (str.slice(nextCharIndex, nextCharIndex+1).match(/\S/g) &&
        str.slice(index-1, index).match(/\S/g)) {
      indices.push(index);
    }*/
    indices.push(index);
    startIndex = nextCharIndex;
  }
  return indices;
}

function getFileIndex(fileName) {

  var fileIndex = [];

  filePath = path.join(__dirname, '/test_docs/' + fileName);

  return new Promise(resolve => {
    fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
        if (!err) {
          // TODO: REMOVE HTML TAGS
          // Case-sensitive indexing not implented for simplicity.
          let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "");
          let fileWords = cleanText.toLowerCase().trim().split(/\s+/).filter(function(value, index, self){return self.indexOf(value) === index;});
          fileWords.forEach(function(word) {
            let locations = getIndicesOf(word,cleanText);
            fileIndex.push({word: word, locations: locations});
          });

          resolve(fileIndex);
        } else {
          console.log(err);
        }
    });
  })
}

function addToMainIndex(fileName, fileIndex, mainIndex) {

  //assumes unique words, and no preexisting entries for the file being added
  fileIndex.forEach(fileWord => {
    let newWordEntry = {
      fileName: fileName,
      fileLocs: fileWord.locations
    };

    wordInd = mainIndex.findIndex(mainWord => mainWord.word == fileWord.word);

    if (wordInd > 0) {
      mainIndex[wordInd].allLocs.push(newWordEntry);
    } else {
      mainIndex.push({
        word: fileWord.word,
        allLocs: [newWordEntry]
      });
    }
  });
}

function addFilesToMainIndex(fileNames, mainIndex) {

  return new Promise(resolve => {
    fileNames.forEach(fileName => {
      getFileIndex(fileName).then(fileIndex => {
        addToMainIndex(fileName, fileIndex, mainIndex);
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

  // populate fileLists with lists of files holding each word.
  searchWords.forEach(word => {
    let wordFiles = [];
    results = _.findWhere(index, {word: word})
    wordResults.push(results.allLocs);
    results.allLocs.forEach(wordLocs => {
      wordFiles.push(wordLocs.fileName);
    });
    fileLists.push(wordFiles);
  });

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

function fuseSearch(index, searchStr) {
  //THIS ONLY WORKS FOR SINGLE WORDS
  var options = {
    shouldSort: true,
    includeMatches: true,
    threshold: 0,
    location: 0,
    distance: 0,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [
      "word"
    ]
  };
  var fuse = new Fuse(index, options); // "list" is the item array
  var result = fuse.search(searchStr);
}


app.on('ready', function(){
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'mainWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // fresh index and stat table for testing

  var lastFileStats = [];

  // initialize index, sync with directory

  /*
  let p1 = new Promise(function(resolve, reject) {

    var proc = exec('ls test_docs', (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        reject(Error("ls did not execute correctly"));
      }
      // the *entire* stdout and stderr (buffered)
      console.log(`result of ls call: ${stdout}`);

      resolve(stdout);
    });

  }).then(

    function(result) {
      dirFiles = result.split(/\r?\n/);
      dirFiles.pop();
      checkIndexForChanges(lastFileStats, dirFiles, index);
      checkForNewFiles(lastFileStats, dirFiles, index);
    },
    function(error) {console.log("error: " + error);}
  )
  */

  const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

const mainIndex = [];

const mainMenuTemplate = [
  {
    label: 'File',
    submenu:[
      {
        label: 'Search Test',
        click(){

          addFilesToMainIndex(['testdoc1.txt', 'testdoc2.txt'], mainIndex).then(function() {
            let results = search("it has",mainIndex);
            results.forEach(obj => {
              console.log(obj.fileName + " at " + obj.locations);
            });
          });

          // let p = new Promise(function(resolve, reject){
          //   let index = getFileIndex("elasticlunr.html");
          //   resolve(index);
          // }).then(function(index){
          // });
        }
      }
    ]
  }
];
