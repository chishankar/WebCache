function getWordLocs(codes) {
  wordLocs = []
  codes.forEach( code => {
    locStart = 1+parseInt(slice(0,1))
    id = parseInt(code.toString().slice(1,locStart));
    fn = _.findWhere(lookup, {id: id});
    loc = parseInt(code.toString().slice(locStart))

    fileInd = wordLocs.findIndex(file => file.fileName == fn);

    if (fileInd > 0) {
      wordLocs[fileInd].fileLocs.push(loc);
    } else {
      wordLocs.push({
        fileName: fn,
        allLocs: [loc]
      });
    }
  });
}

function search(searchStr, index) {
  let finalResults = [];
  let fileLists = []; // will hold all files for each search word
  let wordResults = [];
  let reducedFileList = []; // will hold all files that contain all search words
  let searchWords = searchStr.toLowerCase().trim().split(/\s+/);
  let startIndex = 0;

  // populate fileLists with lists of files holding each word.
  searchWords.forEach(word => {
    let wordFiles = [];
    results = _.findWhere(index, {word: word});
    wordLocs = getWordLocs(results.allLocs);
    wordResults.push(wordLocs);
    wordLocs.forEach(fileLocs => {
      wordFiles.push(fileLocs.fileName);
    });
    fileLists.push(wordFiles);
  });

  if (searchWords.length <= 1) {
    wordResults.forEach(obj => {
      finalResults.push({
        fileName: obj.fileName,
        locations: obj.fileLocs
      });
    })

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
