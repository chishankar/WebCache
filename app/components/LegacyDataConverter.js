import React, { Component }from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ifError } from 'assert';
import ScrapbookToWebcacheFormat from './convert-html.js';

var path = require('path');

const util = require('util');
const fs = require('fs-extra');

// Convert fs.readFile into Promise version of same
const readFile = util.promisify(fs.readFile);
const fsPromises = require('fs').promises;

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

class LegacyDataConverter extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      path: ''
    };
    this.store = this.props.store;
  }

  // Handles path changes and updates state
  onChange = (e) => {
    if (e.target.files[0] != null) {
      //this.setState({ path: e.target.files[0].path });
      const destFolder = 'data';
      const sourceFolder = e.target.files[0].path;
      fs.copy(sourceFolder, destFolder, (err) => {
        if (err) return console.error(err)
        console.log('success! moved files to data directory')
      });
      FindFile(destFolder);
    }
  };

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
          <Button variant="contained" component="span" className={classes.button}>
            Import
          </Button>
        </label>
      </div>
    );
  }
}

async function FindFile(dirPath) {
  fs.readdir(dirPath, async (err, files) => {
    // console.log(items);
    if (!err) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(dirPath,files[i]);
        var stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
          FindFile(filePath);
        } else if (files[i].indexOf('index.html') == 0) {
          var datFilePath = path.join(dirPath,'index.dat');
          var fileArr = await ScrapbookToWebcacheFormat(filePath, datFilePath);
          console.log(fileArr[1])
          //var fileArr = ScrapbookFunctions(filePath,datFilePath)
          WriteToFile(filePath, fileArr[0]);
          //WriteToFile(+'/.', fileArr[0]);
        }
      }
    }
  });
}

async function WriteToFile(filePath, replacement) {
  try {
    const filehandle = await fsPromises.open(filePath, 'w');
    //console.log(replacement);
    await filehandle.writeFile(replacement);
    await filehandle.close();
  } catch (err) {
    console.error(err);
  }

  //const filehandle = await fsPromises.open(fileName, 'w');
  //writeFile(filePath, replacement);
}

export default withStyles(styles, { withTheme: true })(LegacyDataConverter);
