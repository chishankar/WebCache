const scrape = require('website-scraper');

exports.getSite = function (inputUrl, save_location, callback){
  scrape({
    urls: [
      {url: inputUrl, filename: 'index.html'}
    ], // Will be saved with default filename 'index.html',
    directory: save_location,
    recursive: true,
    maxDepth: 1,
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
}).then((result) => {
    // Outputs HTML
    console.log('result of scraping finishing: ' + result);
    console.log("Content succesfully downloaded");
    callback(true);
}).catch((err) => {
    console.log(err);
    callback(false);
});
}
