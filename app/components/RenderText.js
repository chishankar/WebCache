import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import * as resourcePath from '../utilities/ResourcePaths';
import * as highlightActions from '../actions/sidebar';
const searchAPI = require('../../webcache_testing/main5.js');
import app from 'electron';

const remoteApp = app.remote.app;

const fs = require('fs');
const ANNOTATIONS_FILE = 'annotations.json';
const path = require('path');

// Returns fulle path needed for iFrame
function getResourceBuilder(resourcePath){
  if(resourcePath.startsWith('LOCAL')) {
    return resourcePath.substring(5);
  }
  return path.join(remoteApp.getAppPath(), '../../../../../../../' + resourcePath + '/index.html');
}

// Returns the base resource
function getResourceDirectory(resourcePath){
  if(resourcePath.startsWith('LOCAL')) {
    return path.join(resourcePath.substring(5), '..') + '/';
  }
  return path.join(remoteApp.getAppPath(), '../../../../../../../' + resourcePath + '/');
}


// Renders dynamic iframe
function getRenderText(filePath, iframeRef, addHighlights) {
  if (filePath == 'app/default_landing_page.html') {
      let jsResource = path.join(remoteApp.getAppPath(), '../../../../../../../renderHtmlViwer/index.js');
      let resourceHtml = fs.readFileSync(filePath).toString();
      var injectScript = fs.readFileSync(jsResource).toString();
      resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";
      return (
        <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml }></iframe>
      );
  }

  let resource = getResourceBuilder(filePath);
  let resourceDir = getResourceDirectory(filePath);

  let jsResource = path.join(remoteApp.getAppPath(), '../../../../../../../renderHtmlViwer/index.js');

  try{
    var resourceHtml = fs.readFileSync(resource).toString();

    var injectScript = fs.readFileSync(jsResource).toString();

    let fileName = resource.substring(resource.lastIndexOf('/') + 1, resource.lastIndexOf('.'));
    let annotations_file = path.join(resource, '..') + '/' + 'annotations-' + fileName + '.json';

    // console.log("RESOURCE DIR: " + resourceDir);

    // change all paths to become relative
    // check to see if the path is already changed - don't change it twice!!
    if (filePath != "app/default_landing_page.html" && !fs.existsSync(annotations_file)) {
      resourceHtml = resourceHtml.replace(/href="([^#].+?)"/g, "href=\"" + path.resolve(resourceDir, "$1") + "\"");
      resourceHtml = resourceHtml.replace(/src="([^#].+?)"/g, "src=\"" + path.resolve(resourceDir, "$1") + "\"");
    }

  resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";
    return (
      // <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml } onLoad={ onloadFun } ></iframe>
      <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml } ></iframe>

    );
  } catch (exception){
    this.props.addNotification("Url does not exist!")
  }

}

type Props = {
  color: String,
  delete: String,
  save: String,
  viewId: String,
  addHighlight: Function,
  clearHighlights: Function,
  addNotification: Function,
  updateLastUpdate: Function,
  annotations: Object,
  hideHighlights: Boolean
}

export default class RenderText extends Component<Props> {
  props: Props;

  constructor(props){
    super(props);
    this.iframeRef = React.createRef();
  }

  getRenderText = (filePath, iframeRef, onloadFun) => {
    if (filePath == 'app/default_landing_page.html') {
        let jsResource = path.join(remoteApp.getAppPath(), '../../../../../../../renderHtmlViwer/index.js');
        let resourceHtml = fs.readFileSync(filePath).toString();
        var injectScript = fs.readFileSync(jsResource).toString();
        resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";
        return (
          <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml }></iframe>
        );
    }
    let resource = getResourceBuilder(filePath);
    let resourceDir = getResourceDirectory(filePath);

    let jsResource = path.join(remoteApp.getAppPath(), '../../../../../../../renderHtmlViwer/index.js');

    try{
      var resourceHtml = fs.readFileSync(resource).toString();

      var injectScript = fs.readFileSync(jsResource).toString();

      let fileName = resource.substring(resource.lastIndexOf('/') + 1, resource.lastIndexOf('.'));
      let annotations_file = path.join(resource, '..') + '/' + 'annotations-' + fileName + '.json';

      // change all paths to become relative
      // check to see if the page has been saved before -> don't change it twice!!
      if (filePath != "app/default_landing_page.html" && !fs.existsSync(annotations_file)) {
        resourceHtml = resourceHtml.replace(/href="([^#].+?)"/g, "href=\"" + path.resolve(resourceDir, "$1") + "\"");
        resourceHtml = resourceHtml.replace(/src="([^#].+?)"/g, "src=\"" + path.resolve(resourceDir, "$1") + "\"");
      }

      resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";

      return (

        // <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml } onLoad={ onloadFun } ></iframe>
        <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml } ></iframe>

      );
    } catch (exception){
      this.props.addNotification("Url does not exist!")
    }

  }


  // Once the component mounts, add an event listener to listen for messages and pass all the messages to the handleIFrameTask
  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
  }

  // Upon URL change, change the URL
  componentDidUpdate(prevProps){

      // handles what to do on an activeUrl update
      if (this.props.activeUrl != prevProps.activeUrl) {

        // clear highlights when a new page is loaded
        this.props.clearHighlights();

        // get current url
        var filePath = this.props.activeUrl;

        // load the annotations from the json file
        let resource = getResourceBuilder(filePath);
        let resourceDir = getResourceDirectory(filePath);
        let jsResource = path.join(remoteApp.getAppPath(), '../../../../../../../renderHtmlViwer/index.js');
        let local = false;

        let fileName = resource.substring(resource.lastIndexOf('/') + 1, resource.lastIndexOf('.'));
        try {
          var fd = fs.openSync(path.join(resource, '..') + '/' + 'annotations-' + fileName + '.json', 'r');
          var highlights = JSON.parse(fs.readFileSync(fd));
          // this.props.updateLastUpdate(highlights.lastUpdated)
          this.props.clearHighlights();
          highlights.highlightData.forEach(highlight => {
            // only add it if it isn't arleady in the store
            // console.log("processing saved highlight: " + JSON.stringify(highlight));
            if (!this.props.annotations.some(element => {
              // console.log(this.props.annotations);
              return element.id == highlight.id;
            })) {
              this.props.addHighlight(highlight);
            }
          })
        } catch (err) {
          // this.handleSaveTask()
          this.props.addNotification("No previous annotations");
          // console.log(err);
        }

        }

      // This updates color in index.js
      let data = {color: this.props.color};
      window.postMessage(data,'*');

      // Sends delete request to the iFrame upone delete id change
      if (this.props.delete !== this.props.delete){
        data = {delete: this.props.delete};
        window.postMessage(data, '*');
      }

      // This sends the id that the user wants to see
      if (this.props.viewId !== prevProps.viewId){
        data = {showHighlight: this.props.viewId};
        window.postMessage(data, '*');
      }

      // This sends a message to the iFrame upon save request
      if (this.props.save != prevProps.save){
        this.handleSaveTask()
      }

      // Sends hideHighlights request to the iFrame
      if (this.props.hideHighlights){
        data = 'hide'
        window.postMessage(data,"*");
      }

      // Sends show highlight request to the iframe
      if (!this.props.hideHighlights){
        data = 'show'
        window.postMessage(data,"*");
      }


  }

  // Logic for saving file
  handleSave = (htmlData) => {
    var saveUrl = this.props.activeUrl.startsWith("LOCAL") ? this.props.activeUrl.substring(5) : this.props.activeUrl + '/index.html';
    let fileName = saveUrl.substring(saveUrl.lastIndexOf('/') + 1, saveUrl.lastIndexOf('.'));

    var annotationsUrl = path.join(saveUrl, '..') + '/' + 'annotations-' + fileName + '.json';
    console.log("SAVING HTML TO: " + saveUrl);
    console.log("SAVING ANNOTATIONS TO: " + annotationsUrl);
    var fd = fs.openSync(annotationsUrl, 'w');

    let annotationJSON = Object.assign({},
      {"highlightData":this.props.annotations},
      {"lastUpdated":this.props.save}
    )

    //update the old index of the annotations json page
    fs.readFile(annotationsUrl, (err, buf) => {
      if (err) {
        fs.writeFileSync(fd, JSON.stringify(annotationJSON));
        searchAPI.addFilesToMainIndex([annotationsUrl]);
      }
      fs.writeFileSync(fd, JSON.stringify(annotationJSON));
      searchAPI.update(annotationsUrl, buf.toString());
    });

    var end = htmlData.indexOf("<script id=\"webcache-script\">");
    let updatedHtml = htmlData.substring(0, end - 1); //remove our injected script tag from the document
    // re write the current version of the html page and update the old index
    fs.readFile(saveUrl, (err, buf) => {
      fs.writeFileSync(saveUrl, updatedHtml);
      searchAPI.update(annotationJSON, buf.toString());
      this.props.addNotification(`File saved! ${this.props.save}`)
      fs.writeFileSync(fd, JSON.stringify(annotationJSON));
    });

  }

  // Takes in data returned by window.postMessage from the iframe rendered within the component
  handleIFrameTask = (e) => {

    if (e.data == 'clicked button'){
      console.log("TEMPORARY")

    } else if (e.data == 'highlighted text'){

      let data = {color: this.props.color};
      window.postMessage(data,'*');

    } else if (e.data.savedData){
      if (this.props.activeUrl !== 'app/default_landing_page.html') {
        this.handleSave(e.data.savedData);
      } else {
        this.props.addNotification("can't save annotations on the home page!")
      }

    } else if (e.data.highlight){
      if(e.data.highlight.text !== "" && e.data.highlight.color){
        // add highlight to store
        this.props.addHighlight(e.data.highlight);
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
        {this.getRenderText(this.props.activeUrl,this.iframeRef,this.handleSaveTask)}
      </div>

    );
  }
}
