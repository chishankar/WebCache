// Event listener to highlighting within the iframe
document.onmouseup = function(event){
  window.parent.postMessage('highlighted text','*');
};

// Handles adding the highlight color to the highlighted text
function highlight(color){
  let data = {}
  let _selection = window.getSelection();

  if (_selection){

    if (_selection.getRangeAt(0)){

      let _range = _selection.getRangeAt(0);
      let highlightId = generateRandomId();
      var _span = document.createElement('span');

      _span.style.backgroundColor = color;
      _span.style.display = 'inline';
      _span.classList.add(highlightId);

      let range = _range.cloneRange();
      range.surroundContents(_span);

      _selection.removeAllRanges();
      _selection.addRange(range);

      // data.range = range;
      data.text = window.getSelection().toString();
      data.id = highlightId;
      data.color = color;

      return data;
    }
  }
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


