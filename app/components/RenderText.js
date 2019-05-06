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
import * as pickColor from '../utilities/GetColor'
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

// /**
//  * @type {Props} Props for Render Text
//  */
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

/**
 * @class
 * @return {RenderText} Renders the RenderText component which is responsible for connecting user application events to the iFrame
 */
export default class RenderText extends Component<Props> {
  /**
   * @param  {Props} props
   */
  constructor(props: Props){
    super(props);
    this.iframeRef = React.createRef();
  }

  /**
   * Once the component mounts, add an event listener to listen for messages and pass all the messages to the handleIFrameTask
   */
  componentDidMount(){
    window.addEventListener('message',this.handleIFrameTask)
  }

  /**
   * Handles changes on all the different store changes for different application states
   * @param {Object} prevProps
   */
  componentDidUpdate(prevProps: Object){

      // handles what to do on an activeUrl update
      if (this.props.activeUrl != prevProps.activeUrl) {

        // clear highlights when a new page is loaded
        this.props.clearHighlights();

        // get current url
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
        let fileName = resource.substring(resource.lastIndexOf('/') + 1, resource.lastIndexOf('.'));
        try {
          var fd = fs.openSync(path.join(resource, '..') + '/' + 'annotations-' + fileName + '.json', 'r');
          var highlights = JSON.parse(fs.readFileSync(fd));
          // this.props.updateLastUpdate(highlights.lastUpdated)
          this.props.clearHighlights();
          highlights.highlightData.forEach(highlight => {
            // only add it if it isn't arleady in the store
            console.log("processing saved highlight: " + JSON.stringify(highlight));
            if (!this.props.annotations.some(element => {
              console.log(this.props.annotations);
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
      let data = {color: pickColor.getColor(this.props.color)};
      window.postMessage(data,'*');

      // Sends delete request to the iFrame upone delete id change
      if (this.props.delete !== prevProps.delete){
        console.log("sending delete request: " + this.props.delete)
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

  /**
   * Handles logic for saving the data back to the file that it was read from
   * @param {String} htmlData the html of what is in the iFrame
   */
  handleSave = (htmlData: String) => {
    console.log("in save once!");
    var saveUrl = this.props.activeUrl.startsWith("LOCAL") ? this.props.activeUrl.substring(5) : this.props.activeUrl + '/index.html';
    let fileName = saveUrl.substring(saveUrl.lastIndexOf('/') + 1, saveUrl.lastIndexOf('.'));

    var annotationsFn = this.props.activeUrl.substring(5) + '/annotations-' + fileName + '.json';
    var annotationsFilePath = path.join(__dirname,'..','data', annotationsFn);
    console.log("SAVING HTML TO: " + saveUrl);
    console.log("after the path.join: " + path.join(saveUrl, '..'));
    console.log("SAVING ANNOTATIONS TO: " + annotationsFilePath);

    let annotationJSON = Object.assign({},
      {"highlightData":this.props.annotations},
      {"lastUpdated":this.props.save}
    )

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
          console.log("trying to write JSON index");

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
    let updatedHtml = htmlData.substring(0, end - 1); //remove our injected script tag from the document

    fs.writeFileSync(saveUrl, updatedHtml);
    console.log(this.props);
    this.props.addNotification(`File saved! ${this.props.save}`)
  }

  /**
   * Handles all iframe tasks requests
   *
   * @param {Object} e A custom object used for communitication of different events between iframe and the RenderTextComponent
   */
  handleIFrameTask = (e: Object) => {

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

  /**
   * Sends save request to the iFrame
   */
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
