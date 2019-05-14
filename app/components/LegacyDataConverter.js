import React, { Component }from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import * as fileTreeActions from '../actions/import';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { ifError } from 'assert';
import ScrapbookToWebcacheFormat from './convert-html.js';
import * as notificationActions from '../actions/notification';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import app from 'electron';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';

const remoteApp = app.remote.app;

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addNotification: notificationActions.addNotification,
    renderFileTree: fileTreeActions.importChange
  },dispatch)
}


var path = require('path');
const util = require('util');
const fs = require('fs-extra');
const searchAPI = require('../../webcache_testing/main5.js');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);
const isFile = util.promisify(fs.stat);

//const fsPromises = require('fs').promises;

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
 * @return {Component} Legacy Data Converter for converting legacy data information into our own native annotation system
 */
class LegacyDataConverter extends Component<Props> {

  constructor(props) {
    super(props);
    this.state = {
      loading: false
    }
  }

  turnOnLoading = () => {
    this.setState({
      loading: true
    })
  }


  turnOffLoading = () => {
    this.setState({
      loading: false
    })
  }

  /**
   * Handles path changes and updates state
   * @param  {Event} e
   */
  onChange = (e: Event) => {
    this.turnOnLoading()
    if (e.target.files[0] != null) {
      //this.setState({ path: e.target.files[0].path });
      // const destFolder = 'data/imported';
      const destFolder = remoteApp.getPath('userData');
      const sourceFolder = e.target.files[0].path;
      fs.copy(sourceFolder, destFolder, (err) => {
        if (err) return this.props.addNotification(`${err}`)
        try{
          this.FindFile(destFolder, this.turnOffLoading);
          this.props.addNotification('Scrapbook data imported')
        } catch(e){
        }
        this.props.renderFileTree();
      });
    }
  };

  /**
   * Finds File
   * @param  {String} dirPath
   */
  async FindFile(dirPath: String, callback: Function) {
    fs.readdir(dirPath, async (err, files) => {
      if (!err) {
        for (var i = 0; i < files.length; i++) {

          var htmlFilePath = path.join(dirPath,files[i]);
          var stat = fs.lstatSync(htmlFilePath);

          if (stat.isDirectory()) {
            this.FindFile(htmlFilePath, null);
          } else if (files[i].indexOf('html') != -1) {
            var datFilePath = path.join(dirPath,'index.dat');
            var annotJsonPath = path.join(dirPath,'annotations-index.json');
            var snJsonPath = path.join(dirPath,'sticky.json');
            try{
              var fileArr = await ScrapbookToWebcacheFormat(htmlFilePath, datFilePath);

              // Write converted HTML to files
              this.WriteToFile(htmlFilePath, fileArr[0]);
              searchAPI.addFilesToMainIndex([htmlFilePath]);

              // Write converted annotation to files
              this.WriteToFile(annotJsonPath, JSON.stringify(fileArr[1]));
              searchAPI.addFilesToMainIndex([annotJsonPath]);

              // Write stkicy jason to files
              this.WriteToFile(snJsonPath, JSON.stringify(fileArr[2]));

            } catch(e) {
              // handle non-legacy imported files
              searchAPI.addFilesToMainIndex([htmlFilePath]);
              searchAPI.addFilesToMainIndex([annotJsonPath]);
            }
          }
        }
      }
      if(callback) {
        callback();
      }
    });
  }
  /**
   * Replaces file at path filePath with replacement text
   * @param  {String} filePath
   * @param  {String} replacement
   */
  async WriteToFile(filePath: String, replacement: String) {
    await writeFile(filePath, replacement);
  }

  render() {
    const { classes } = this.props;
    return (
      <div>
        <input
          type="file"
          webkitdirectory="true"
          onChange={this.onChange}
          className={classes.input}
          id="import"
        />
        <label htmlFor="import">
          <Button variant="contained" color="primary" component="span" className={classes.button}>
            Import Data
          </Button>
        </label>
        <Fade
            in={this.state.loading}
            style={{
              transitionDelay: this.state.loading ? '800ms' : '0ms',
            }}
            unmountOnExit
        >
          <CircularProgress />
        </Fade>
      </div>
    );
  }
}

export default connect(
  null,
  mapDispatchToProps
)(withStyles(styles, { withTheme: true })(LegacyDataConverter));
