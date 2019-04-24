import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';
import getSite from '../utilities/webscraper';
import * as urlsearchActions from '../actions/urlsearch';
import CircularProgress from '@material-ui/core/CircularProgress';
import Fade from '@material-ui/core/Fade';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';

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

  // Handles the validation of the input
  handleInput = (event) => {
    let value = event.target.value;
    if (this.validURL(value)){
      this._setValidUrl(value);
      this._turnOnValidation();
    }else{
      this._turnOffValidation();
    }
  }

  // Logic for showing and not showing loading bar
  handleClickLoading = () => {
    this.setState(state => ({
      loading: !state.loading,
    }));
  };

  // Handles logic for when user presses enter on a valid website
  handleEnter = (event) => {
    if (event.key === 'Enter' && this.state.showValidate){
      var save_location = "data/" + this.state.validUrl.replace(/https:\/\//g,"") + '-' + Date.now();
      this.handleClickLoading();
      getSite.getSite(this.state.validUrl, save_location, () => {
        this.store.dispatch(urlsearchActions.changeActiveUrl(save_location));
        this.handleClickLoading();
      });
    }
  }

  // Sets state of url search component with valid url
  _setValidUrl = (vUrl) =>{
    this.setState({validUrl: vUrl});
  }

  // turns on validation light
  _turnOnValidation= () =>{
    this.setState({showValidate: true});
  }

  // turns off validation light
  _turnOffValidation = () =>{
    this.setState({showValidate: false});
  }

  // handles logic of validating input for valid url
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
