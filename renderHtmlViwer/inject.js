console.log("this doesn't run");
let injectScript = document.createElement('script');
injectScript.src = '/Users/Chirag/Documents/WebCache/renderHtmlViwer/index.js';
document.getElementById('content').appendChild(injectScript);
