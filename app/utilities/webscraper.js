const scrape = require('website-scraper');

function getSite(){
  scrape({
    urls: [
        'http://chishankar.github.io', // Will be saved with default filename 'index.html'
    ],
    directory: './node-website',
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
}).catch(function (err) {
    console.log(err);
});
}

module.exports(getSite);
