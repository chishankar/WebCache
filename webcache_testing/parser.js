const jsdom = require("jsdom");
const { JSDOM } = jsdom;

//let filePath = path.join(__dirname, '../data/);

// fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data){
//   var t1 = performance.now();
//     if (!err) {
//       // TODO: REMOVE HTML TAGS
//       // Case-sensitive indexing not implented for simplicity.
//       htmlStr = data;
//     } else {
//       console.log(err);
//     }

// });









const dom = new JSDOM(


`

<p>Hello<p><p>good<p>

`



);

console.log(dom.window.document.querySelector("*").textContent);




//let cleanText = data.replace(/<\/?[^>]+(>|$)/g, "").replace(/[^\w\s]/gi, '');
