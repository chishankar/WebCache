import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import * as resourcePath from '../utilities/ResourcePaths';
import * as highlightActions from '../actions/sidebar';

const fs = require('fs');
const ANNOTATIONS_FILE = 'annotations.json';

// Returns fulle path needed for iFrame
function getResourceBuilder(path){
  return new resourcePath.ResourcePaths(path).getFullPath();
}

// Returns the base resource
function getResourcePath(path){
  return new resourcePath.ResourcePaths(path).getResourceDir();
}

// Renders dynamic iframe
function getRenderText(filePath, iframeRef) {
  let resource = getResourceBuilder(filePath);
  let resourceDir = getResourcePath(filePath);
  let jsResource = getResourceBuilder('renderHtmlViwer/index.js');

  var resourceHtml;
  if(!filePath.startsWith("LOCAL")){
    resourceHtml = fs.readFileSync(resource).toString();
  } else {
    resourceHtml = fs.readFileSync(filePath.substr(5, filePath.length));
  }

  var injectScript = fs.readFileSync(jsResource).toString();

  resourceHtml += "<script>" + injectScript + "<\/script>";

  // change all paths to become relative
  // check to see if the path is already changed - don't change it twice!!
  if (filePath != "app/default_landing_page.html" && !filePath.startsWith("LOCAL")) {
    resourceHtml = resourceHtml.replace(/href="([\.\/\w+]+)"/g, "href=\"" + resourceDir + "$1" + "\"");
    resourceHtml = resourceHtml.replace(/src="([\.\/\w+]+)"/g, "src=\"" + resourceDir + "$1" + "\"");
  }

  //TODO: check if an annotations.json exists in resourceDir - if it does, load it into the store

  return (

    <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml }></iframe>

  );
}

type Props = {
  color: String,
  addHighlightColor: Function,
  clearHighlights: Function,
  delete: String,
  annotations: Object
}

export default class RenderText extends Component<Props> {
  props: Props;

  constructor(props){
    super(props);
    this.iframeRef = React.createRef();
  }

  // Once the component mounts, add an event listener to listen for messages and pass all the messages to the handleIFrameTask
  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
  }

  // Upon URL change, change the URL
  componentDidUpdate(prevProps){
      if (this.props.activeUrl != prevProps.activeUrl) {
        // clear highlights when a new page is loaded
        this.props.clearHighlights();
      }
      let data = {color: this.props.color};
      window.postMessage(data,'*');

      if (this.props.delete !== ""){
        data = {delete: this.props.delete};
        window.postMessage(data, '*');
      }
  }

  handleSave = (htmlData) => {
    var fd = fs.openSync(getResourcePath(this.props.activeUrl) + ANNOTATIONS_FILE, 'w');
    fs.writeFileSync(fd, JSON.stringify(this.props.annotations));

    //TODO: handle the regular save stuff @akbar
  }

  // Takes in data returned by window.postMessage from the iframe rendered within the component
  handleIFrameTask = (e) => {
    // console.log('parent received: ' + e.data);

    if (e.data == 'clicked button'){
      console.log("TEMPORARY")

    } else if (e.data == 'highlighted text'){

      let data = {color: this.props.color};
      window.postMessage(data,'*');

    } else if (e.data.savedData){
      if (this.props.activeUrl !== 'app/default_landing_page.html') {
        this.handleSave(e.data.savedData);
      } else {
        console.log("what to do about saving annotations on the home page??");
      }

    } else if (e.data.highlight){
      if(e.data.highlight.text !== "" && e.data.highlight.color !== "DEFAULT"){
        // add highlight to store
        this.props.addHighlightColor(e.data.highlight);
      }
    }
  }

  // Function to handle saving data
  handleSaveTask = () => {

    window.postMessage("save", '*');

  }

  render() {

    return (

      <div>
        <button onClick={this.handleSaveTask}>Save</button>
        {getRenderText(this.props.activeUrl,this.iframeRef)}
      </div>

    );
  }
}
