const url = require('url');
const path = require('path');
const { exec } = require('child_process');
const _ = require('underscore');
const fs = require('fs');
const sizeof = require('object-sizeof');
const { PerformanceObserver, performance } = require('perf_hooks');
const BSON = require('bson');
var readline = require("readline");
const searchAPI = require('main5.js');

const jsdom = require("jsdom");
const { JSDOM } = jsdom;
var htmlStr;


//var list = [1,2,3,4,5];
//console.log(list.slice(2,5));
// test1 = [{w: 'a', d: 1}, {w: 'b', d: 2}, {w: 'c', d: 3}, {w: 'd', d: 4}, {w: 'e', d: 5}];

// let i = 0;

// while((wordInd = test1[i++]).w <= 'c') {
//   console.log(wordInd.d);
// }


// let filePath = path.join(__dirname, 'test_bin.txt');

// fs.writeFile(filePath, BSON.serialize(test), function (err) {
//   if (err) throw err;
//   console.log('Index saved to file');
// });



let filePath = path.join(__dirname, '../data/' + "google.com-1556758057280/hAIygGBPp11bIg.html");



fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
  var t1 = performance.now();
  if (!err) {
    // TODO: REMOVE HTML TAGS
    // Case-sensitive indexing not implented for simplicity.
    htmlStr = data;
    const dom = new JSDOM(htmlStr);
    dom.window.document.querySelectorAll("script, style").forEach(node => node.parentNode.removeChild(node));
    console.log(dom.window.document.documentElement.outerHTML.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' '));
    //console.log(data.replace(/<\/?[^>]+(>|$)/g, " ").replace(/[^\w\s]/gi, ' '))
    //let cleanText = toRemove.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\w\s]/gi, '');
   // console.log(htmlStr);
  } else {
    console.log("error");
  }
});






