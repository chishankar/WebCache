const scrape = require('website-scraper');
var urlUtil = require('url');
var _ = require('lodash');
const searchAPI = require('../../webcache_testing/main5.js');
const path = require('path');
const iframeRegex = /x-frame-options:\s+(\w*)/


class MyPlugin {

  constructor(save_location){
    this.loc = save_location
  }

  apply(registerAction) {
      registerAction('onResourceSaved', ({resource}) => {
        if (resource.type === "html"){
          let fullPath = path.join('../',this.loc,resource.filename)
          searchAPI.addFilesToMainIndex([fullPath]);
        }
      });
  }
}


exports.getSite = function (inputUrl, save_location, callback){
    var options = {
        urls: [
          // filename: inputUrl.match(/\//g).length > 2 ? inputUrl.slice(inputUrl.lastIndexOf('/')) : 'index.html'
          {url: inputUrl, filename: "index.html"}
        ],
        urlFilter: function(url) {
          var req = new XMLHttpRequest();
          req.open('HEAD', url, false);
          req.send(null);
          let header = req.getAllResponseHeaders();

          let matches = header.match(iframeRegex);

          console.log(matches)
          //  || matches[1].toLowerCase() === 'sameorigin')
          if (matches && matches[1].toLowerCase() === 'deny'){
            console.log(matches[1].toLowerCase())
            return false
          }

          return true;

          // return (url.indexOf('github.com') === -1 || url.indexof('stackoverflow.com') === -1);
        }, // Will be saved with default filename 'index.html',
        directory: save_location,
        recursive: true,
        maxRecursiveDepth: 1,
        maxDepth: 2,
        outputPathGenerator: function(resource, directory){
            var urlObject = urlUtil.parse(resource.url);
            // Todo: add logic to check if it is an HTML page which does not end in '.html'
            // If so, append '/index.html'
            var relativePath = './data/' + urlObject.path;
            return pathUtil.resolve(directory, relativePath);
        },
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
    console.log("THERE WAS AN ERROR")
    callback(false);
    return "failed"
});
}
