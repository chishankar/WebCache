import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';
import getSite from '../utilities/webscraper';
import * as urlsearchActions from '../actions/urlsearch';
import * as notficationActions from '../actions/notification';

import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
const searchAPI = require('../../webcache_testing/main5.js');
import app from 'electron';

const remoteApp = app.remote.app;

const fs = require('fs');

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
 * @return {Component} Handles logic and behavior for url search download
 */
export default class UrlSearch extends Component<Props>{


  constructor(props){
    super(props);
    this.state = {
      showValidate: false,
      validUrl: '',
      loading: false
    };
    this.store = this.props.store;
  }

  /**
   * Handles the validation of the input
   * @param  {Event} event
   */
  handleInput = (event: Event) => {

    let value = event.target.value;

    //Following code makes sure url starts with https

    var pattern1 = new RegExp("^https:\/\/");
    var pattern2 = new RegExp("^http:\/\/");

    //if doesn't include http(s) add it
    if (pattern1.test(value) === false) {
      if (pattern2.test(value)) {
        value = "https" + value.substring(4);
      } else {
      value = "https://" + value;
      }
    }
        //if it starts with http, replace with https


      console.log(value);
    if (this.validURL(value)){
      this._setValidUrl(value);
      this._turnOnValidation();
    }else{
      this._turnOffValidation();
    }
  }

  /**
   * Logic for showing and not showing loading bar
   */
  handleClickLoading = () => {
    this.setState(state => ({
      loading: !state.loading,
    }));
  };

  /**
   * Handles logic for when user presses enter on a valid website
   * @param  {Event} event
   */
  handleEnter = (event: Event) => {
    if (event.key === 'Enter' && this.state.showValidate){
      var save_location = remoteApp.getPath('desktop') + '/' + this.state.validUrl.replace(/https:\/\//g,"") + '-' + Date.now();
      this.handleClickLoading();
      getSite.getSite(this.state.validUrl, save_location, () => {
        //add the newly donwloaded files to the main index
          console.log('SAVING NEW PAGE TO: ' + save_location);
          fs.readdir(save_location, (err, files) => {
            if(err){
              this.store.dispatch(notficationActions.addNotification('Not a valid url or URL cannot be loaded'));
              console.log('errors suck')
              return;
            }else{
              let update = files.filter(fn => {return !['img', 'js', 'css', 'fonts'].includes(fn)}).map((x) => {
                console.log("adding " + save_location + '/' + x + " to index");
                return save_location + "/" + x
              });
              searchAPI.addFilesToMainIndex(update);
            }
            this.store.dispatch(urlsearchActions.changeActiveUrl(save_location));
          });
          this.handleClickLoading();
      });
    }

  }

  /**
   * Sets state of url search component with valid url
   * @param  {String} vUrl
   */
  _setValidUrl = (vUrl: String) =>{
    this.setState({validUrl: vUrl});
  }

  /**
   * Turns on validation light
   */
  _turnOnValidation= () =>{
    this.setState({showValidate: true});
  }

 /**
   * Turns off validation light
   */
  _turnOffValidation = () =>{
    this.setState({showValidate: false});
  }

  /**
   * Handles logic of validating input for valid url
   * @param  {String} str
   */
  validURL = (str: String) => {
    var pattern = new RegExp( // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
      '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return !!pattern.test(str);
  }

  render(){

    const showValidate = this.state.showValidate;
    const validateHTML = <i float="right" className="fas fa-check" className={styles.facheck}></i>;
    const notValidateHTML = <i float="right" className="fas fa-check" className={styles.fauncheck}></i>;
      return(

        <div>
            <TextField
            id="outlined-full-width"
            label="URL"
            style={{ margin: 8 }}
            placeholder="https://<website>"
            margin="normal"
            variant="outlined"
            InputLabelProps={{
              shrink: true,
            }}
            onKeyUp={this.handleEnter}
            onChange={this.handleInput}
          />
          <Fade
              in={this.state.loading}
              style={{
                transitionDelay: this.state.loading ? '800ms' : '0ms',
              }}
              unmountOnExit
          >
            <CircularProgress />
          </Fade>
          {showValidate && validateHTML}
          {!showValidate && notValidateHTML}

        </div>
      )
  }
}
