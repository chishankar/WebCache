import React, {Component} from 'react';
import 'font-awesome/css/font-awesome.min.css';
import popup from './Popup.css';
import * as highlighterActions from '../actions/highlighter';

// type Props ={};

export default class Highlight extends Component<Props> {
  // props: Props;

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  _red = () => {
    this.store.dispatch(highlighterActions.changeRed());
  }

  _green = () => {
    this.store.dispatch(highlighterActions.changeGreen());
  }

  _blue = () => {
    this.store.dispatch(highlighterActions.changeBlue());
  }

  _yellow = () => {
    this.store.dispatch(highlighterActions.changeYellow());
  }

  _purple = () => {
    this.store.dispatch(highlighterActions.changePurple());
  }


  render() {
    return (
      <div className='popup'>
        <div className='popup_inner'>
          <span>
            <div className={popup.bckground}>
              <a className={popup.red} onClick={this._red}></a>
              <a className={popup.green} onClick={this._green}></a>
              <a className={popup.blue} onClick={this._blue}></a>
              <a className={popup.yellow} onClick={this._yellow}></a>
              <a className={popup.purple} onClick={this._purple}></a>
            </div>
          </span>
        </div>
      </div>
    );
  }
}
