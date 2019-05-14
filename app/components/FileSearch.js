import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as fileSearchActions from '../actions/filesearch';
import * as notificationActions from '../actions/notification';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import app from 'electron';
const searchAPI = require('../../webcache_testing/main5.js');
var fs = require('fs-extra');
var path = require('path');

const remoteApp = app.remote.app;

const UIstyles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  button: {
    margin: theme.spacing.unit * 2,
  },
  placeholder: {
    height: 40,
  },
});


/**
 * @class
 * @param {Object} store
 * @return {Component} FileSearch Component
 */
export default class FileSearch extends Component<Props>{

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  getAllFilesInUserData = (itemPath: String, allFiles: list<String>) => {
    fs.readdirSync(itemPath).forEach(item => {
      let fullPath = path.join(itemPath, item);
      if (fs.lstatSync(fullPath).isDirectory()) {
        this.getAllFilesInUserData(fullPath, allFiles);
      } else {
        if (fullPath.endsWith('html') || fullPath.endsWith('htm') || fullPath.endsWith('json')) {
          allFiles.push(fullPath);
        }
      }
    });
  }

  /**
   * Handles logic for when a user searches for data
   *
   * @param  {Event} event Contains user input for what they are searching for
   * @fires  changeSearchData
   */
  handleEnter = (event: Event) => {
    if (event.key === 'Enter'){
      var elem = event.srcElement || event.target;
      // console.log("Search term: " + elem.value);
      var that = this;
      searchAPI.search(elem.value).then(result => {
        console.log('search worked');
        this.store.dispatch(fileSearchActions.changeSearchData(JSON.stringify(result)));
        this.store.dispatch(fileSearchActions.updateSearchTerm(elem.value));
      }).catch(function (error) {
        console.log('gonna delete and re-index.............');

        that.store.dispatch(notificationActions.addNotification('A fatal error has been caught. Your files are being re-indexed'));
        fs.removeSync(remoteApp.getPath('appData') + '/word_inds');
        fs.mkdir(remoteApp.getPath('appData') + '/word_inds');
        // add all files in the folders
        var all_files = [];
        that.getAllFilesInUserData(remoteApp.getPath('userData'), all_files);
        searchAPI.addFilesToMainIndex(all_files);
        that.store.dispatch(notificationActions.addNotification('All files have been re-indexed.'));
      })
      //searches for the specified word among all archived pages
      //var searchResults = JSON.stringify({results : [{filename: "app/where/who/what/index.html", count: 5}, {filename: "Boring", count: 9}]});
    }
  }

  render(){
      return(
        <div>
            <TextField
            id="outlined-full-width"
            label="File Search"
            style={{ margin: 8 }}
            placeholder="Search archives"
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            onKeyUp={this.handleEnter}
          />
        </div>
      )
  }
}
