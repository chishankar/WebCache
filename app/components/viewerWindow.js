import React, { Component } from 'react';
const { BrowserWindow } = require('electron').remote;
import * as resource from '../utilities/ResourcePaths';

type Props = {
  color: string,
  activeUrl: string
};

export default class Viewer extends Component<Props>{
  props: Props

  // Dyanmically create ref for objects and setting constructor
  constructor(props){
    super(props);
    this.ref = React.createRef();
  }

  // A function to run when the component does mount (life cycle function)
  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
    let data = {src: this.props.activeUrl}
    window.postMessage(data,'*')
    this.loadScript("file:///Users/Chirag/Documents/WebCache/renderHtmlViwer/inject.js")
  }

  componentDidUpdate(prevProps){
    if(!(this.props.activeUrl === prevProps.activeUrl)) {
      let data = {src: this.props.activeUrl}
      console.log("updating data source for iframe")
      window.postMessage(data,'*')
    }
  }

  // Abstracted event message from window in iframe
  handleIFrameTask = (e) => {
    if (e.data == 'clicked button'){
      console.log('It has reached me!');
    }
    if (e.data == 'highlighted text'){
      console.log('Someone highlighted text (.)(.)');
      let data = {color: this.props.color};
      window.postMessage(data,'*');
    }
  }

  // Launches new window upon click
  handleClick = () => {
    let htmlViewerWindow = new BrowserWindow({width:600, height:500})

    htmlViewerWindow.on('close',function(){
      htmlViewerWindow = null;
    })

    let resourcePath = new resource.ResourcePaths(this.props.activeUrl).getFullPath();

    console.log(resourcePath)
    htmlViewerWindow.loadURL("file:///Users/Chirag/Documents/WebCache/renderHtmlViwer/test.html")

    htmlViewerWindow.show()
  }


  loadScript = (src) => {
    var tag = document.createElement('script');
    tag.async = false;
    tag.src = src;

    var test = document.createElement('h1');
    test.textContent = "This is a test :)"

    // this.ref.appendChild(tag);
    document.getElementById('content').appendChild(tag);
  }
//  <script src="file:///Users/Chirag/Documents/WebCache/renderHtmlViwer/inject.js"></script>
  render(){
    return(
      <div>
        <button onClick={this.handleClick}>Click to load page in a new window</button>
        <iframe
        ref = {this.ref}
        id = "content"
        src={"file://" + new resource.ResourcePaths(this.props.activeUrl).getFullPath()}
        frameBorder="0"
        height="625px"
        width="100%"
        sandbox="allow-scripts allow-pointer-lock allow-same-origin"
        />
      </div>
    );
  }

}
