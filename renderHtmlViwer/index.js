// Event listener to highlighting within the iframe
document.onmouseup = function(event){
  window.parent.postMessage('highlighted text','*');
};

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

// Handles adding the highlight color to the highlighted text
function highlight(color){
  let data = {};

  console.log(color);
  sel = window.getSelection();
  data.text = sel.toString();
  if (sel.rangeCount && sel.getRangeAt) {
      range = sel.getRangeAt(0);
  }
  document.designMode = "on";
  if (range) {
      sel.removeAllRanges();
      sel.addRange(range);
  }
  // Use HiliteColor since some browsers apply BackColor to the whole block
  if (!document.execCommand("HiliteColor", false, color)) {
      document.execCommand("BackColor", false, color);
  }
  document.designMode = "off";

  sel.removeAllRanges();

  data.range = serializeRange(range);
  data.color = color;

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
    console.log('This the message I got: ' + JSON.stringify(e.data))
  }
  let data = e.data;

  if (data.color){
    let highlightResponse = {highlight: highlight(data.color)};
    if (highlightResponse.highlight){
      window.parent.postMessage(highlightResponse,"*");
    }
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


