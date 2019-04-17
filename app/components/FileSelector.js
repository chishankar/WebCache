import React from 'react';
import FileTree from 'react-filetree-electron';

export default class FileDialogue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: null
    };
    this.onChange = this.onChange.bind(this);
  }

  onChange(e) {
    this.setState({ path: e.target.files[0].path });
    console.log(this.state.path);
  }

  render() {
    return (
      <div>
        <input type="file" webkitdirectory="true" onChange={this.onChange} />
        <h3>Files</h3>
        <h4>{console.log(this.state.path)}</h4>
        <FileTree directory={this.state.path} />
      </div>
    );
  }
}
