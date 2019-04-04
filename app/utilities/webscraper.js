const scrape = require('website-scraper');

exports.getSite = function (url){
  scrape({
    urls: url, // Will be saved with default filename 'index.html',
    directory: '‎⁨⁨../hello2',
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
}).then(function (result) {
    // Outputs HTML
    // console.log(result);
    console.log("Content succesfully downloaded");
    return true;
}).catch(function (err) {
    console.log(err);
    return false;
});
}
