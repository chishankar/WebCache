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
import 'font-awesome/css/font-awesome.min.css'

var path = require('path');
const fs = require('fs');

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },

  folder: {
    margin: 10 + 'px !important',
  }
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
    this.state = {
      path: '/data',
      result: [],
    };
    this.store = this.props.store;
  }

 traverseDir = (dir: String) => {
      fs.readdirSync(dir).forEach(file => {
        let fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
           this.traverseDir(fullPath);
         } else {
          this.state.result.push({
            key: fullPath.slice(5),
            size: fs.lstatSync(fullPath).size,
            modified: fs.lstatSync(fullPath).mtime,
          })
         }
      });
  }

  componentWillMount(){
    this.traverseDir('./data');
  }

  /**
   * Handles path changes, updates state, and copies to data dir
   *
   * @param  {Event} e
   */
  onChange = (e: Event) => {
    if (e.target.files[0]!=null){
      this.setState({ path: e.target.files[0].path });
    }
  }

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

    return (
      <div>
        <input type="file" webkitdirectory="true" onChange={this.onChange} className={classes.input} id="choose-directory" />
        <label htmlFor="choose-directory">
          <Button variant="contained" component="span" className={classes.button}>
            Choose Directory
          </Button>
        </label>
        <Divider />
        <h3>Files</h3>

        <FileBrowser
          files={this.state.result}
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

export default withStyles(styles, { withTheme: true })(FileDialogue);
