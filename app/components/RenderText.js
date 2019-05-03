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
const searchAPI = require('../../webcache_testing/main5.js');

const fs = require('fs');
const ANNOTATIONS_FILE = 'annotations.json';
const path = require('path');

// Returns fulle path needed for iFrame
function getResourceBuilder(path){
  return new resourcePath.ResourcePaths(path).getFullPath();
}

// Returns the base resource
function getResourcePath(path){
  return new resourcePath.ResourcePaths(path).getResourceDir();
}

// Return the base Resource directory
function getResourceBase(path){
  return new resourcePath.ResourcePaths(path).getResourceBase();
}

// Renders dynamic iframe
function getRenderText(filePath, iframeRef, addHighlights) {
  let resource = getResourceBuilder(filePath);
  let resourceDir = getResourcePath(filePath);
  let jsResource = getResourceBuilder('renderHtmlViwer/index.js');
  let local = false;

  if(filePath.startsWith("LOCAL")) {
    local = true;
    resource = filePath.substr(5, filePath.length);
  }

  var resourceHtml = fs.readFileSync(resource).toString();

  var injectScript = fs.readFileSync(jsResource).toString();

  resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";

  // change all paths to become relative
  // check to see if the path is already changed - don't change it twice!!
  if (filePath != "app/default_landing_page.html" && !local) {
    resourceHtml = resourceHtml.replace(/href="([\.\/\w+]+)"/g, "href=\"" + resourceDir + "$1" + "\"");
    resourceHtml = resourceHtml.replace(/src="([\.\/\w+]+)"/g, "src=\"" + resourceDir + "$1" + "\"");
  }


  return (

    <iframe className={ styles.setWidth }  ref={ iframeRef } srcDoc={ resourceHtml }></iframe>

  );
}

type Props = {
  color: String,
  delete: String,
  save: String,
  addHighlight: Function,
  clearHighlights: Function,
  addNotification: Function,
  annotations: Object,
  hideHighlights: Boolean
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

        var filePath = this.props.activeUrl;
        // load the annotations from the json file
        let resource = getResourceBuilder(filePath);
        let resourceDir = getResourcePath(filePath);
        let jsResource = getResourceBuilder('renderHtmlViwer/index.js');
        let local = false;

        if(filePath.startsWith("LOCAL")) {
          local = true;
          resource = filePath.substr(5, filePath.length);
        }
        try {
          var fd = fs.openSync(path.join(resource, '..') + '/' + ANNOTATIONS_FILE, 'r');
          var highlights = JSON.parse(fs.readFileSync(fd));
          console.log(highlights)
          console.log(highlights.highlightData)
          // add each highlight to the store
          // for (var key in highlights.highlightData){
          //   let highlight = highlights.highlightData[key]
          //   console.log(key)
          //   if (!this.props.annotations.some(element => {
          //     return element.id == highlight.id;
          //   })) {
          //     this.props.addHighlight(highlight);
          //   }
          // }

          highlights.highlightData.forEach(highlight => {
            // only add it if it isn't arleady in the store
            if (!this.props.annotations.some(element => {
              return element.id == highlight.id;
            })) {
              this.props.addHighlight(highlight);
            }
          })
        } catch (err) {
          console.log(err)
          // console.log('annotations.json does not exist!');
        }
      }
      let data = {color: this.props.color};
      window.postMessage(data,'*');

      // Sends delete request to the iFrame
      if (this.props.delete !== ""){
        data = {delete: this.props.delete};
        window.postMessage(data, '*');
      }

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
    var annotationsUrl = path.join(saveUrl, '..') + '/' + ANNOTATIONS_FILE;
    console.log("ORIGINAL: " + this.props.activeUrl);
    console.log("SAVING HTML TO: " + saveUrl);
    console.log("after the path.join: " + path.join(saveUrl, '..'));
    console.log("SAVING ANNOTATIONS TO: " + annotationsUrl);
    var fd = fs.openSync(annotationsUrl, 'w');

    console.log(this.props.annotations)

    let annotationJSON = Object.assign({},
      {"highlightData":this.props.annotations},
      {"lastUpdated":this.props.save}
    )

    //update the old index of the annotations json page
    fs.readFile(annotationsUrl, (err, buf) => {
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
        {getRenderText(this.props.activeUrl,this.iframeRef)}
      </div>

    );
  }
}
