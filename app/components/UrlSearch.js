import React, {Component} from 'react';
import styles from './UrlSearch.css';
import 'font-awesome/css/font-awesome.min.css';

export default class UrlSearch extends Component<Props>{

  constructor(props){
    super(props);
    this.state = {showValidate: false};
  }

  handleInput = (event) => {
    let value = event.target.value;
    if (this.validURL(value)){
      this._turnOnValidation();
    }else{
      this._turnOffValidation();
    }
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
      return(
        <div>
          <input type="text" placeholder="Google Search.." onChange={this.handleInput}/>
          {showValidate && validateHTML}
        </div>
      )
  }
}
