import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import * as resourcePath from '../utilities/ResourcePaths';

const fs = require('fs');

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

  var resourceHtml = fs.readFileSync(resource).toString();
  var injectScript = fs.readFileSync(jsResource).toString();

  resourceHtml += "<script>" + injectScript + "<\/script>";

  // change all paths to become relative
  resourceHtml = resourceHtml.replace(/href="/g, "href=\"" + resourceDir + "/");
  resourceHtml = resourceHtml.replace(/src="/g, "src=\"" + resourceDir + "/");

  return (
    <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml }></iframe>
  );
}

type Props = {
  color: string
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
    // window.postMessage(data,'*')
  }

  // Upon URL change, change the URL
  componentDidUpdate(prevProps){
      console.log("updating data source for iframe")
      // window.postMessage(data,'*')
  }

  // Takes in data returned by window.postMessage from the iframe rendered within the component
  handleIFrameTask = (e) => {

    if (e.data == 'clicked button'){

    } else if (e.data == 'highlighted text'){

      let data = {color: this.props.color};
      window.postMessage(data,'*');

    } else if (e.data.savedData){

      console.log(e.data.savedData);

    }
  }

  // Function to handle saving data
  handleSaveTask = () => {

    let data = {save: "save"}
    window.postMessage(data, '*');

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
