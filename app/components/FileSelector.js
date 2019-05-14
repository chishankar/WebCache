import React from 'react';
import FileTree from 'react-filetree-electron';
import * as urlsearchActions from '../actions/urlsearch';
import * as resourcePath from '../utilities/ResourcePaths';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';
import FileBrowser from './fileBrowserSource/browser'
import Moment from 'moment'
import Icons from './fileBrowserSource/icons'
import folderIcon from '@material-ui/icons/folder';
import 'font-awesome/css/font-awesome.min.css';
import {connect} from 'react-redux';
import app from 'electron';

const remoteApp = app.remote.app;

function mapStateToProps(state){
  return {
   url: state.urlsearch.activeUrl,
   importState: state.imports.importState
  }
}

var path = require('path');
const fs = require('fs');


const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },

});

/**
 * @class
 * @param {Object} store
 * @return {Component} FileDialogue
 */
class FileDialogue extends React.Component {
  constructor(props) {
    super(props);
    // this.state = {
    //   path: '/data',
    // };
    this.store = this.props.store;
  }

 traverseDir = (dir: String, result: Array) => {
      fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
           this.traverseDir(fullPath,result);
         } else {
          if (fullPath.endsWith(".html") || fullPath.endsWith(".htm")){
              result.push({
              key: fullPath.substring(remoteApp.getPath('userData').length)
            })
          }
         }
      });
  }

  /**
   * Updates activeUrl in store to new current user selected file from file browser
   *
   * @param  {String} file
   *
   */
  handleFile = (file) =>{
    this.store.dispatch(urlsearchActions.changeActiveUrl("LOCAL" + remoteApp.getPath('userData') + '/' + file.key));
  };

  render(){
    const { classes } = this.props;
    var result = [];
    this.traverseDir(remoteApp.getPath('userData'), result);
    return (
      <div>
        {/* <input type="file" webkitdirectory="true" onChange={this.onChange} className={classes.input} id="choose-directory" />
        <label htmlFor="choose-directory">
          <Button variant="contained" component="span" className={classes.button}>
            Choose Directory
          </Button>
        </label> */}
        <Divider />
        <h3>Files</h3>

        <FileBrowser
          files={result}
          onSelectFile={this.handleFile}
          icons={{
          File: <i className="fas fa-file"></i>,
          Image: <i className="file-image" aria-hidden="true" />,
          PDF: <i className="file-pdf" aria-hidden="true" />,
          Rename: <i className="i-cursor" aria-hidden="true" />,
          Folder: <i className="fas fa-folder"></i>,
          FolderOpen: <i className="fas fa-folder-open"></i>,
          Delete: <i className="trash" aria-hidden="true" />,
          Loading: <i className="circle-notch spin" aria-hidden="true" />,
        }}
        />

      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  null,
)(withStyles(styles, { withTheme: true })(FileDialogue));
