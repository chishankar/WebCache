import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import * as resourcePath from '../utilities/ResourcePaths';
import * as highlightActions from '../actions/sidebar';
import * as pickColor from '../utilities/GetColor'
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
  return resourcePath + '/index.html';
}

// Returns the base resource
function getResourceDirectory(resourcePath){
  if(resourcePath.startsWith('LOCAL')) {
    return path.join(resourcePath.substring(5), '..') + '/';
  }
  return resourcePath;
}

type Props = {
  color: String,
  delete: String,
  save: String,
  viewId: String,
  searchTerm: String,
  addHighlight: Function,
  clearHighlights: Function,
  addNotification: Function,
  updateLastUpdate: Function,
  annotations: Object,
  hideHighlights: Boolean
}

/**
 * @class
 * @return {Component} Renders the RenderText component which is responsible for connecting user application events to the iFrame
 */
export default class RenderText extends Component<Props> {

  constructor(props){
    super(props);
    this.iframeRef = React.createRef();
  }

  getRenderText = (filePath, iframeRef, onloadFun) => {
    // clear highlights when a new page is loaded
    this.props.clearHighlights();

    let jsResource = path.join(remoteApp.getAppPath(), './renderHtmlViewer/index.js');

    if (filePath == 'app/default_landing_page.html') {
        let resourceHtml = fs.readFileSync(path.join(remoteApp.getAppPath(), './' + filePath)).toString();
        var injectScript = fs.readFileSync(jsResource).toString();
        resourceHtml += "<script id=\"webcache-script\">" + injectScript + "<\/script>";
        return (
          <iframe name="iframe" className={ styles.setWidth }  ref={(f) => this.iframeRef = f } srcDoc={ resourceHtml }></iframe>
        );
    }
    let resource = getResourceBuilder(filePath);
    let resourceDir = getResourceDirectory(filePath);

    console.log("RESOURCE: " + resource);
    console.log("RESOURCEDIR: " + resourceDir);

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

      // try to re-render the highlights
      try {
        var fd = fs.openSync(path.join(resource, '..') + '/' + 'annotations-' + fileName + '.json', 'r');
        var highlights = JSON.parse(fs.readFileSync(fd));
        highlights.highlightData.forEach(highlight => {
          // only add it if it isn't already in the store
          if (!this.props.annotations.some(element => {
            return element.id == highlight.id;
          })) {
            // console.log("i want to add highlight: " + JSON.stringify(highlight));
            this.props.addHighlight(highlight);
          }
        })
      } catch (err) {
        // this.handleSaveTask()
        //this.props.addNotification("No previous annotations");
        console.log('INNER exception ' + err);
      }

      return (
        <iframe className={ styles.setWidth }  ref={(f) => this.iframeRef = f } srcDoc={ resourceHtml } ></iframe>
      );
    } catch (exception){
      //this.props.addNotification("Url does not exist!")
      console.log('OUTER exception ' + exception);
      return (
        <div>NOOOOOOOOOOOOOOOOOOOOOOOOO</div>
      )
    }

  }


  // Once the component mounts, add an event listener to listen for messages and pass all the messages to the handleIFrameTask
  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
  }

  shouldComponentUpdate(nextProps: Object, nextState: Object){
    var data;
    if (this.props.activeUrl != nextProps.activeUrl) {
      return true;
    }

    if (this.props.color !== nextProps.color) {
      // This updates color in index.js
      let data = {color: pickColor.getColor(nextProps.color)};
      this.iframeRef.contentWindow.postMessage(data,'*');
    }

    // Sends delete request to the iFrame upone delete id change
    if (this.props.delete !== nextProps.delete){
      data = {delete: nextProps.delete};
      this.iframeRef.contentWindow.postMessage(data,'*');
    }

    // This sends the id that the user wants to see
    if (this.props.viewId !== nextProps.viewId){
      data = {showHighlight: nextProps.viewId};
      this.iframeRef.contentWindow.postMessage(data,'*');
    }

    // This sends a message to the iFrame upon save request
    if (this.props.save != nextProps.save){
      this.handleSaveTask()
    }

    // Sends hide or show highlights request to the iFrame
    if (this.props.hideHighlights !== nextProps.hideHighlights){
      data = nextProps.hideHighlights ? 'hide' : 'show';
      this.iframeRef.contentWindow.postMessage(data,'*');
    }

    if (this.props.searchTerm != nextProps.searchTerm){
      data = {searchFor: nextProps.searchTerm}
      this.iframeRef.contentWindow.postMessage(data,'*');
    }

    return false;
  }

  /**
   * Handles logic for saving the data back to the file that it was read from
   * @param {String} htmlData
   */
  handleSave = (htmlData: String) => {
    var saveUrl = this.props.activeUrl.startsWith("LOCAL") ? this.props.activeUrl.substring(5) : this.props.activeUrl + '/index.html';
    let fileName = saveUrl.substring(saveUrl.lastIndexOf('/') + 1, saveUrl.lastIndexOf('.'));

    var annotationsFilePath = path.join(saveUrl, '..') + '/annotations-' + fileName + '.json';
    var annotationsFn = annotationsFilePath;

    let annotationJSON = Object.assign({},
      {"highlightData":this.props.annotations},
      {"lastUpdated":this.props.save}
    )

    console.log("RenderText.js - saveUrl = " + saveUrl);
    console.log("RenderText.js - fileName = " + fileName);
    console.log("RenderText.js - annotationsFilePath = " + annotationsFilePath);

    // add the file to the index for sanity
    searchAPI.addFilesToMainIndex([saveUrl]);

    //update the old index of the annotations json page
    try {
      fs.readFile(annotationsFilePath, (err, buf) => {
        if (err || buf.length === 0) {
          fs.writeFile(annotationsFilePath, JSON.stringify(annotationJSON), (err) => {
            if (!err) {
              console.log("adding new json to index");
              searchAPI.addFilesToMainIndex([annotationsFn]);
            } else {
              console.log(err);
              console.log("error writing new annotations file");
            }
          });
        }
        else {

          fs.writeFile(annotationsFilePath, JSON.stringify(annotationJSON), (err) => {
            if (!err) {
              console.log(buf.toString());
              console.log('Updating json index')
              searchAPI.update(annotationsFn, buf.toString());
            } else {
              console.log("error writing updated annotations file");
            }
          });
        }
      });
    } catch(err) {
      console.log(err);
    }

    var end = htmlData.indexOf("<script id=\"webcache-script\">");
    let updatedHtml = htmlData.substring(0, end); //remove our injected script tag from the document

    fs.writeFileSync(saveUrl, updatedHtml);
    // console.log(this.props);
    this.props.addNotification(`File saved! ${this.props.save}`)
  }

  /**
   * Handles all iframe tasks requests
   *
   * @param {Object} e
   */
  handleIFrameTask = (e: Object) => {
    console.log('RenderText got: ' + e.data);
    if (e.data == 'highlighted text'){

      let data = {color: this.props.color};
      window.postMessage(data,'*');

    } else if (e.data.savedData){
      this.handleSave(e.data.savedData);
    } else if (e.data.highlight){
      if(e.data.highlight.text !== "" && e.data.highlight.color){
        // add highlight to store
        this.props.addHighlight(e.data.highlight);
      }
    }
  }



  /**
   * Sends save request to the iFrame
   */
  handleSaveTask = () => {
    if (this.props.activeUrl != 'app/default_landing_page.html') {
      this.iframeRef.contentWindow.postMessage("save", '*');
    } else {
      this.props.addNotification("can't save annotations on the home page!");
    }
  }

  render() {
    return (
      <div>
        {this.getRenderText(this.props.activeUrl,this.iframeRef,this.handleSaveTask)}
      </div>
    );
  }
}
