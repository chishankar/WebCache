import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';
import getSite from '../utilities/webscraper';
import * as urlsearchActions from '../actions/urlsearch';

import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

export default class UrlSearch extends Component<Props>{

  constructor(props){
    super(props);
    this.state = {
      showValidate: false,
      validUrl: ''
    };
    this.store = this.props.store;
  }

  handleInput = (event) => {
    let value = event.target.value;
    if (this.validURL(value)){
      this._setValidUrl(value);
      this._turnOnValidation();
    }else{
      this._turnOffValidation();
    }
  }

  handleEnter = (event) => {
    if (event.key === 'Enter' && this.state.showValidate){
      getSite.getSite(this.state.validUrl, () => {
        // this.store.dispatch(urlsearchActions.changeActiveUrl("data/" + this.state.validUrl.replace(/https:\/\//g,"").replace(/http:\/\//g, "") + "/index.html"));
        this.store.dispatch(urlsearchActions.changeActiveUrl("data/" + this.state.validUrl.replace(/https:\/\//g,"").replace(/http:\/\//g, "")));
      });
    }
  }

  // <input type="text" placeholder="https://<website>" onKeyUp={this.handleEnter} onChange={this.handleInput}/>
  // {showValidate && validateHTML}
  // {!showValidate && notValidateHTML}

  _setValidUrl = (vUrl) =>{
    this.setState({validUrl: vUrl});
  }

  _turnOnValidation= () =>{
    this.setState({showValidate: true});
  }

  _turnOffValidation = () =>{
    this.setState({showValidate: false});
  }

  validURL = (str) => {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
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
          {showValidate && validateHTML}
          {!showValidate && notValidateHTML}

        </div>
      )
  }
}
