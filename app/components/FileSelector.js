import React from 'react';
import FileTree from 'react-filetree-electron';
import * as urlsearchActions from '../actions/urlsearch';
import * as resourcePath from '../utilities/ResourcePaths';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

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
 * @param {Object} store The store object that holds the applications state
 * @return {FileDialogue} FileDialogue
 */
class FileDialogue extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: ''
    };
    this.store = this.props.store;
  }

  /**
   * Handles path changes, updates state, and copies to data dir
   *
   * @param  {Event} e Click event fired for user clicking on file from folder viewer
   */
  onChange = (e: Event) => {
    if (e.target.files[0]!=null){
      this.setState({ path: e.target.files[0].path });
    }
  }

  /**
   * Updates activeUrl in store to new current user selected file from file browser
   *
   * @param  {String} file File path
   *
   */
  handleFile = (file: String) =>{
    this.store.dispatch(urlsearchActions.changeActiveUrl('LOCAL' + file.filePath));
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

        <FileTree directory={this.state.path}
        onFileClick={this.handleFile} fileTreeStyle="light"/>
      </div>
    );
  }
}

export default withStyles(styles, { withTheme: true })(FileDialogue);
