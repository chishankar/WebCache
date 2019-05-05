import React, { Component }from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import * as addNotification from '../actions/notification';
import 'react-notifications/lib/notifications.css';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import { ifError } from 'assert';
import ScrapbookToWebcacheFormat from './convert-html.js';


var path = require('path');
const util = require('util');
const fs = require('fs-extra');

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



class LegacyDataConverter extends Component<Props> {

  constructor(props) {
    super(props);
    console.log(props)
  }

  // Handles path changes and updates state
  onChange = (e) => {
    if (e.target.files[0] != null) {
      //this.setState({ path: e.target.files[0].path });
      const destFolder = 'data/imported';
      const sourceFolder = e.target.files[0].path;
      fs.copy(sourceFolder, destFolder, (err) => {
        if (err) return this.props.addNotification(`${err}`)
        try{
          this.FindFile(destFolder);
          this.props.addNotification('Scrapebook data imported')
        } catch(e){
          this.props.addNotification(`${e}`)
        }

        console.log('success! moved files to data directory');
      });

    }
  };

  async FindFile(dirPath) {
    fs.readdir(dirPath, async (err, files) => {
      if (!err) {
        for (var i = 0; i < files.length; i++) {

          var htmlFilePath = path.join(dirPath,files[i]);
          var stat = fs.lstatSync(htmlFilePath);
          if (stat.isDirectory()) {
            this.FindFile(htmlFilePath);
          } else if (files[i].indexOf('index.html') == 0) {
            var datFilePath = path.join(dirPath,'index.dat');
            var annotJsonPath = path.join(dirPath,'annotations-index.json');
            var snJsonPath = path.join(dirPath,'sticky.json');
            try{
              var fileArr = await ScrapbookToWebcacheFormat(htmlFilePath, datFilePath);
              // console.log(filePath)
              //console.log(fileArr[0]);
              //console.log(fileArr[3]);

              this.WriteToFile(htmlFilePath, fileArr[0]);
              this.WriteToFile(annotJsonPath, JSON.stringify(fileArr[1]));
              this.WriteToFile(snJsonPath, JSON.stringify(fileArr[2]));
            } catch(e) {
              this.props.addNotification(`${e}`)
            }
          }
        }
      }
    });
  }

  async WriteToFile(filePath, replacement) {
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
            Import Legacy Data
          </Button>
        </label>
      </div>
    );
  }
}


export default withStyles(styles, { withTheme: true })(LegacyDataConverter);
