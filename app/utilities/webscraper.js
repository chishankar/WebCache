const scrape = require('website-scraper');
var urlUtil = require('url');
var _ = require('lodash');
const searchAPI = require('../../webcache_testing/main5.js');
const path = require('path');

exports.getSite = function (inputUrl, save_location, callback){
    var options = {
        urls: [
          // filename: inputUrl.match(/\//g).length > 2 ? inputUrl.slice(inputUrl.lastIndexOf('/')) : 'index.html'
          {url: inputUrl, filename: "index.html"}
        ],
        // Will be saved with default filename 'index.html',
        directory: save_location,
        recursive: true,
        maxRecursiveDepth: 1,
        maxDepth: 2,
        subdirectories: [
            {
                directory: 'img',
                extensions: ['.gif', '.jpg', '.png', '.svg']
            },
            {
                directory: 'js',
                extensions: ['.js']
            },
            {
                directory: 'css',
                extensions: ['.css']
            },
            {
                directory: 'fonts',
                extensions: ['.woff','.ttf']
            },
            {
              directory: 'misc',
              extensions: ['']
            }
        ],
        sources: [
            {
                selector: 'img',
                attr: 'src'
            },
            {
                selector: 'link[rel="stylesheet"]',
                attr: 'href'
            },
            {
                selector: 'script',
                attr: 'src'
            }
        ]
    }
  scrape(options).then((result) => {
    // Outputs HTML
    // console.log('result of scraping finishing: ' + result);
    // console.log("Content succesfully downloaded");
    callback(true);
    return "passed"
}).catch((err) => {
    // console.log(err);
    // console.log("error in webscraper.js: " + err)
    callback(false);
    return "failed"
});
}
