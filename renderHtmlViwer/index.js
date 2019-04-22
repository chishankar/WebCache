var color;
// Event listener to highlighting within the iframe
document.onmouseup = function(event){
  highlight(color);
};

// make the range into a JSON object so that it can be passed to the parent
function serializeRange(range) {
  if (!range || ((range.startContainer === range.endContainer) && (range.startOffset === range.endOffset))) {
    return null;
  }

  return {
    startContainer: JSON.parse(JSON.stringify(range.startContainer)),
    startOffset: range.startOffset,
    endContainer: JSON.parse(JSON.stringify(range.endContainer)),
    endOffset: range.endOffset
  }
}

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
  let data = {};
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

  data.range = serializeRange(range);
  data.color = color;

  window.top.postMessage({highlight: data}, '*');
  return data;
}

// Handles returning the data in the iFrame to send back for re-writing the file
function handleSave(){
  console.log("Saving ...");
  let data = {savedData: document.documentElement.innerHTML};
  window.parent.postMessage(data,"*");
}

// Changes the src of the iframe
function changeIFrameSrc(path){
  document.getElementById('content').src = path;
}

// Event listener for events coming from the parent
window.parent.addEventListener('message',function(e){
  if (!e.data.type){
    console.log('iFrame received: ' + JSON.stringify(e.data))
  }
  let data = e.data;

  if (data.color){
    console.log('setting color to ' + data.color);
    color = data.color;
  }

  else if (data.src){
    changeIFrameSrc(data.src);
  }

  else if (data === "save"){
    handleSave();
  }

});


// creates random id
function generateRandomId() {

  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

}


