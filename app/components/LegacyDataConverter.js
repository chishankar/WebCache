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
      const destFolder = 'data/imported';
      const sourceFolder = e.target.files[0].path;
      fs.copy(sourceFolder, destFolder, (err) => {
        if (err) return console.error(err);
        FindFile(destFolder);
        console.log('success! moved files to data directory');
      });
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
          <Button variant="contained" color="primary" component="span" className={classes.button}>
            Import Legacy Data
          </Button>
        </label>
      </div>
    );
  }
}

async function FindFile(dirPath) {
  fs.readdir(dirPath, async (err, files) => {
    console.log(files);
    // console.log(items);
    if (!err) {
      for (var i = 0; i < files.length; i++) {

        var htmlFilePath = path.join(dirPath,files[i]);
        var stat = fs.lstatSync(htmlFilePath);
        if (stat.isDirectory()) {
          FindFile(htmlFilePath);
        } else if (files[i].indexOf('index.html') == 0) {
          var datFilePath = path.join(dirPath,'index.dat');
          var hlJsonPath = path.join(dirPath,'highlight.json');
          var ilJsonPath = path.join(dirPath,'inline.json');
          var snJsonPath = path.join(dirPath,'sticky.json');

          var fileArr = await ScrapbookToWebcacheFormat(htmlFilePath, datFilePath);
          // console.log(filePath)
          //console.log(fileArr[0]);
          //console.log(fileArr[3]);

          WriteToFile(htmlFilePath, fileArr[0]);
          WriteToFile(hlJsonPath, JSON.stringify(fileArr[1]));
          WriteToFile(ilJsonPath, JSON.stringify(fileArr[2]));
          WriteToFile(snJsonPath, JSON.stringify(fileArr[3]));
        }
      }
    }
  });
}

async function WriteToFile(filePath, replacement) {
  let filehandle;
  try {
    //console.log(replacement);
    await writeFile(filePath,replacement)
    //const filehandle = await fsPromises.open(filePath, 'w');
    //console.log(replacement);
    //await filehandle.writeFile(replacement);
  } finally {
    //if (filehandle !== undefined){
    //  await filehandle.close();
    //}
  }

  //const filehandle = await fsPromises.open(fileName, 'w');
  //writeFile(filePath, replacement);
}

export default withStyles(styles, { withTheme: true })(LegacyDataConverter);
