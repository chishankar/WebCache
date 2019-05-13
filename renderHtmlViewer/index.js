console.log("INDEX.JS successfully injected");
var color = "default";
var highlightIdentifier = 'webcache-highlight-mark'

var hideStyle = document.createElement('style');
hideStyle.type = 'text/css';
hideStyle.innerHTML = `
  .hide-webcache-highlight {
    background-color: inherit !important;
  }
  .search-highlight {
    background-color: inherit !important;
  }`;
document.getElementsByTagName('head')[0].appendChild(hideStyle);

var searchHighlight = document.createElement('style')

// Event listener to highlighting within the iframe
document.onmouseup = function(event){
  console.log("User has highglighted content in iFrame")
  highlight(color);
};

// traverses the DOM tree to get the next node until the endNode is reached
function getNextNode(node, skipChildren, endNode) {
  if(endNode == node) {
    return null;
  }

  if (node.firstChild && !skipChildren) {
    return node.firstChild;
  }

  if (!node.parentNode) {
    return null;
  }

  return node.nextSibling || getNextNode(node.parentNode, true, endNode);
}

// Handles adding the highlight color to the highlighted text
function highlight(color){
  if (color.toLowerCase() == 'default') {
    return;
  }

  let data = {};
  console.log("Highlight got this color: " + color)
  if (color.toLowerCase() !== 'default'){
    console.log("I did not reach this statement")
    var highlightId = generateRandomId();
    var subranges = [];
    var spans = [];

    sel = window.getSelection();
    data.text = sel.toString();
    if (sel.rangeCount && sel.getRangeAt) {
        range = sel.getRangeAt(0);
        var startNode = range.startContainer;
        do {
          var nextNode = getNextNode(startNode, false, range.endContainer);
          // check if the node is a TEXT node
          if (startNode.nodeType == 3) {
            var subrange = document.createRange();
            subrange.setStart(startNode, startNode == range.startContainer ? range.startOffset : 0);
            subrange.setEnd(startNode, startNode == range.endContainer ? range.endOffset : startNode.length);

            var span = document.createElement('span');
            span.style.backgroundColor = color;
            span.style.display = 'inline';
            span.classList.add(highlightId);
            span.classList.add(highlightIdentifier);

            subranges.push(subrange);
            spans.push(span);
          }
          if (!nextNode) {
            break;
          }
          startNode = nextNode;
        } while (true);
    }

    for (let i = 0; i < subranges.length; i++) {
      subranges[i].surroundContents(spans[i]);
    }

    sel.removeAllRanges();

    data.color = color;
    data.id = highlightId;
    data.comment = ""

    window.top.postMessage({highlight: data}, '*');
  }

  return data
}

// given a class id, this will return all spans with that class id
function getSpansWithHighlight(classId) {
  return document.querySelectorAll("span." + classId);
}

// takes in a list of spans, passed in from getSpansWithHighlight, and
// removes the span and leaves the innerHTML
function unwrap(spanList) {
  spanList.forEach(wrapper => {
    var docFrag = document.createDocumentFragment();
    while (wrapper.firstChild) {
        var child = wrapper.removeChild(wrapper.firstChild);
        docFrag.appendChild(child);
    }

    // replace wrapper with document fragment
    wrapper.parentNode.replaceChild(docFrag, wrapper);
  });
}


// Handles returning the data in the iFrame to send back for re-writing the file
function handleSave(){
  removeSearchHighlights();
  console.log("getting the innerHTML data")
  let data = {savedData: document.documentElement.innerHTML};
  console.log(data)
  console.log("sending data back to renderText component")
  window.parent.postMessage(data,"*");
}

// Changes the src of the iframe
function changeIFrameSrc(path){
  document.getElementById('content').src = path;
}

function hideHighlights(){
  let highlightList = getSpansWithHighlight(highlightIdentifier);
  highlightList.forEach(wrapper => {
    wrapper.classList.add('hide-webcache-highlight')
  })
}

function showHighlights(){
  let highlightList = getSpansWithHighlight(highlightIdentifier);
  highlightList.forEach(wrapper => {
    wrapper.classList.remove('hide-webcache-highlight')
  })
}

function scrollToId(id){
  // document.getElementsByClassName(id).scrollIntoView({
  //   behavior: 'smooth'
  // });
  try{
    document.querySelector(`.${id}`).scrollIntoView({behavior: 'smooth'});
  } catch (err){
    console.log("can't find "  + id)
  }

}

// Event listener for events coming from the parent
window.addEventListener('message',function(e){
  let data = e.data;

  if (data.delete) {
    unwrap(getSpansWithHighlight(data.delete));
  }

  if (data.color){
    color = data.color;
    console.log("Color has been updated in iframe to: " + color)
  }

  else if (data.src){
    changeIFrameSrc(data.src);
  }

  else if (data === "save"){
    console.log("recieved save request")
    handleSave();
  }

  else if (data == "show"){
    showHighlights()
  }

  else if (data === "hide"){
    hideHighlights()
  }

  else if (data.showHighlight){

    scrollToId(data.showHighlight)
    console.log("HERE")
  }

  else if (data.searchFor){
    console.log('here');
    doSearch(data.searchFor)
  }

});


// creates random id
function generateRandomId() {

  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

}

function removeSearchHighlights(){
  if(document.querySelector('span[style*="background-color: yellow;"]') !== null){
    unwrap(document.querySelectorAll('span[style*="background-color: yellow;"]'))
  }
}

function doSearch(text) {

 try{

  removeSearchHighlights();

  if (window.find && window.getSelection) {
    document.designMode = "on";
    var sel = window.getSelection();
    sel.collapse(document.body, 0);

    while (window.find(text)) {
        document.execCommand("HiliteColor", false, "yellow");
        sel.collapseToEnd();
    }
    document.designMode = "off";

  } else if (document.body.createTextRange) {

    var textRange = document.body.createTextRange();
    while (textRange.findText(text)) {
        textRange.execCommand("BackColor", false, "yellow");
        textRange.collapse(false);
    }
  }

  } catch (e){
    console.log(e)
  }

}
