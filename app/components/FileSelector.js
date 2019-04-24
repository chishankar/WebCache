import React from 'react';
import FileTree from 'react-filetree-electron';
import * as urlsearchActions from '../actions/urlsearch';
import * as resourcePath from '../utilities/ResourcePaths';

const fs = require('fs');

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

  onChange = (e) => {
    this.setState({ path: e.target.files[0].path });
  }

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
