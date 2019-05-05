import React, {Component} from 'react';
import 'font-awesome/css/font-awesome.min.css';
import popup from './Popup.css';
import * as highlighterActions from '../actions/highlighter';

/**
 * @class
 * @return {Component} Highlight Component that allows you select color
 */
export default class Highlight extends Component<Props> {

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  // Each of the below functions dispatches an actions for the designated color
  // These are invoked when a user clicks on an icon

  /**
   * Dispatches red color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changeRed()
   */
  _red = () => {
    this.store.dispatch(highlighterActions.changeRed());
  }

  /**
   * Dispatches green color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changeGreen()
   */
  _green = () => {
    this.store.dispatch(highlighterActions.changeGreen());
  }

  /**
   * Dispatches blue color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changeBlue()
   */
  _blue = () => {
    this.store.dispatch(highlighterActions.changeBlue());
  }

  /**
   * Dispatches yellow color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changeYellow()
   */
  _yellow = () => {
    this.store.dispatch(highlighterActions.changeYellow());
  }

  /**
   * Dispatches purple color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changePurple()
   */
  _purple = () => {
    this.store.dispatch(highlighterActions.changePurple());
  }

  /**
   * Dispatches DEFAULT color for highlighting
   *
   * @param  {}
   * @fires highlighterActions.changeDefault()
   */
  _default = () => {
    this.store.dispatch(highlighterActions.changeDefault());
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
              <a className={popup.default} onClick={this._default}></a>
            </div>
          </span>
        </div>
      </div>
    );
  }
}
