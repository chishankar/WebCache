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

// Builds the data directory path
function getDataDirectory() {
  return new resourcePath.ResourcePaths(null).getBaseDirectory() + '/data';
}
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
              key: fullPath.slice(5)
            })
          }
         }
      });
  }

  // /**
  //  * Handles path changes, updates state, and copies to data dir
  //  *
  //  * @param  {Event} e
  //  */
  // onChange = (e: Event) => {
  //   if (e.target.files[0]!=null){
  //     this.setState({ path: e.target.files[0].path });
  //   }
  // }

  /**
   * Updates activeUrl in store to new current user selected file from file browser
   *
   * @param  {String} file
   *
   */
  handleFile = (file) =>{
    console.log(file);
    this.store.dispatch(urlsearchActions.changeActiveUrl("LOCALdata/" + file.key));
  };

  render(){
    const { classes } = this.props;
    var result = [];
    this.traverseDir('./data',result);
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

        {/* <FileTree directory={this.state.path}
        onFileClick={this.handleFile} fileTreeStyle="light"/> */}
      </div>
    );
  }
}

export default connect(
  mapStateToProps,
  null,
)(withStyles(styles, { withTheme: true })(FileDialogue));
