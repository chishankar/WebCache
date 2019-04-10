// @flow
import React, { Component } from 'react';
import { remote,ipcRenderer }from 'electron';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
import webview from 'electron';
import styles from './Text.css';
import HighlightText from './HighlightText';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import renderHTML from 'react-render-html';
import * as resource from '../utilities/ResourcePaths';
import fs from 'fs'
import electronDebug from 'electron-debug';

type Props = {
  color: string
}

export default class RenderText extends Component<Props> {
  props: Props;

  constructor(props){
    super(props)
    this.ref = React.createRef();
    this.fullPath = ''
  }

  handleHighlight = (event) =>{
    console.log(event)
    if (this.props.color != "DEFAULT"){
      var _selection = window.getSelection();
      let _range = _selection.getRangeAt(0);
      var span = document.createElement(span);

      span.style.backgroundColor = this.props.color;
      span.style.display = 'inline';
//this code is wrong
      if (_selection) {
          var range = _range.cloneRange();
          range.surroundContents(span);
          _selection.removeAllRanges();
          _selection.addRange(range);
      }
    }
  };

  getRenderText = (filePath) => {
    //"file://" +
    let ResourceObj = new resource.ResourcePaths(filePath);
    let fullPath = ResourceObj.getFullPath();
    var someHtml = fs.readFileSync(fullPath).toString();
    return (renderHTML(someHtml))
  }

  openModal = (fullPath) => {
    let viewer = '/Users/Chirag/Documents/WebCache/htmlviewer/htmlViewer.html'
    let win = new remote.BrowserWindow({
      parent: remote.getCurrentWindow()
    })

    ipcRenderer.on('loaded',function(){
      console.log('hello')
    })

    var theUrl = 'file://' + viewer
    console.log('url', theUrl);
    win.loadURL(theUrl);
  }

  componentDidUpdate(prevProps) {
    console.log("detected updated");
    if(!(this.props.activeUrl === prevProps.activeUrl)) {
      this.render();
    }
  }

  _updateFullPath(fullPath){
    this.setState({fullPath: fullPath})
  }

  _seeEvent = (e) =>{
    console.log(e);
  }

  componentDidMount = () =>{
    window.addEventListener("message",this._seeEvent(event))
  }

  render() {
    console.log(this.ref);
    const testPath = './test/';
    const legacyPath = 'legacy-data/ScrapBook/data/20190327234416/';
    var filePath = `${testPath + legacyPath}index.html`;
    let displayInput = this.props.activeUrl.startsWith('data');

    return (
      <div>
        <p onClick={this.openModal}>Click this</p>
        {this.getRenderText(this.props.activeUrl)}
      </div>
    );
  }
}
