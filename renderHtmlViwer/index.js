function highlight(color){
  let _selection = window.getSelection()
  if (_selection){
    if (_selection.getRangeAt(0)){
      let _range = _selection.getRangeAt(0);
      var _span = document.createElement('span');

      _span.style.backgroundColor = color;
      _span.style.display = 'inline';

      let range = _range.cloneRange();
      range.surroundContents(_span);
      _selection.removeAllRanges();
      _selection.addRange(range);
    }
  }
}

function handleSave(){
  console.log("in handle save");
  let data = {savedData: document.documentElement.innerHTML};
  console.log(data)
  window.parent.postMessage(data,"*");
}

function changeIFrameSrc(path){
  document.getElementById('content').src = path;
}

document.onmouseup = function(event){
  window.parent.postMessage('highlighted text','*')
}

window.parent.addEventListener('message',function(e){
  console.log('This the message I got: ' + JSON.stringify(e.data))
  let data = e.data;

  if (data.color){
    highlight(data.color);
  }

  else if (data.src){
    changeIFrameSrc(data.src);
  }

  else if (data.save){
    handleSave()
  }

})


