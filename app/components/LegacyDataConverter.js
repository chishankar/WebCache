import React, { Component }from 'react';
import classNames from 'classnames';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import { ifError } from 'assert';
var path = require('path');

const util = require('util');
const fs = require('fs');
const cheerio = require('cheerio');
// Convert fs.readFile into Promise version of same

const { ScrapbookToWebcacheFormat } = require('./convert-html');

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
      FindFile(e.target.files[0].path);
      // const destFolder = 'data';
      // const sourceFolder = e.target.files[0].path;
      // fs.emptydir(destFolder);
      // fs.copy(sourceFolder, destFolder, (err) => {
      //   if (err) return console.error(err)
      //   console.log('success! moved files to data directory')
      // });
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

function FindFile(dirPath) {
  fs.readdir(dirPath, (err, files) => {
    // console.log(items);
    if (!err) {
      for (var i = 0; i < files.length; i++) {
        var filePath = path.join(dirPath,files[i]);
        var stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
          FindFile(filePath);
        } else if (files[i].indexOf('index.html') >= 0) {
          var datFilePath = path.join(dirPath,'index.dat');
          ScrapbookToWebcacheFormat(filePath, datFilePath);
        }
      }
    }
  });
}

// ##################################################################33
export default withStyles(styles, { withTheme: true })(LegacyDataConverter);
