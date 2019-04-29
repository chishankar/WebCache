import React from 'react';
import FileTree from 'react-filetree-electron';
import * as urlsearchActions from '../actions/urlsearch';
import * as resourcePath from '../utilities/ResourcePaths';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const fs = require('fs-extra');

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

class FileDialogue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: ''
    };
    this.store = this.props.store;
  }

  // Handles path changes, updates state, and copies to data dir
  onChange = (e) => {
    if (e.target.files[0]!=null){
      this.setState({ path: e.target.files[0].path });
    }

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
    const { classes } = this.props;
    return (
      <div>
        <input type="file" webkitdirectory="true" onChange={this.onChange} className={classes.input} id="choose-directory" />
        <label htmlFor="choose-directory">
          <Button variant="contained" component="span" className={classes.button}>
            Choose Directory
          </Button>
        </label>
        <h3>Files</h3>
        <h4>{console.log(this.state.path)}</h4>
        <FileTree directory={this.state.path}
        onFileClick={this.handleFile} fileTreeStyle="light"/>

      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(FileDialogue);
