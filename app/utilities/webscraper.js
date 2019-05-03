const scrape = require('website-scraper');
var urlUtil = require('url');
var _ = require('lodash');

exports.getSite = function (inputUrl, save_location, callback){
    var options = {
        urls: [
          {url: inputUrl, filename: 'index.html'}
        ], // Will be saved with default filename 'index.html',
        directory: save_location,
        recursive: true,
        maxDepth: 1,
        urlFilter: function(url){
            return _.startsWith(url, inputUrl);
        },
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
                extensions: ['.jpg', '.png', '.svg']
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
    console.log('result of scraping finishing: ' + result);
    console.log("Content succesfully downloaded");
    callback(true);
}).catch((err) => {
    console.log(err);
    callback(false);
});
}
