import React from 'react';
import FileTree from 'react-filetree-electron';
import * as urlsearchActions from '../actions/urlsearch';
import * as resourcePath from '../utilities/ResourcePaths';

const fs = require('fs-extra');

// Builds the data directory path
function getDataDirectory() {
  return new resourcePath.ResourcePaths(null).getBaseDirectory() + '/data';
}

export default class FileDialogue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: ''
    };
    this.store = this.props.store;
  }

  // Handles path changes, updates state, and copies to data dir
  onChange = (e) => {
    this.setState({ path: e.target.files[0].path });

    const destFolder = 'data';
    const sourceFolder = e.target.files[0].path;
    fs.emptydir(destFolder);
    fs.copy(sourceFolder, destFolder, function (err) {
      if (err) return console.error(err)
      console.log('success! moved files to data directory')
    });
  }

  // Dispatches new file path to url store on file click from file browser
  handleFile = (file) =>{
    this.store.dispatch(urlsearchActions.changeActiveUrl('LOCAL' + file.filePath));
  }

  render() {
    return (
      <div>
        <input type="file" webkitdirectory="true" onChange={this.onChange} />
        <h3>Files</h3>
        <h4>{console.log(this.state.path)}</h4>
        <FileTree directory={this.state.path}
        onFileClick={this.handleFile} fileTreeStyle="light"/>
      </div>
    );
  }
}
