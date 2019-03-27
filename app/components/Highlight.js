import React, {Component} from 'react';
// import styles from './Navbar.css';
import 'font-awesome/css/font-awesome.min.css';
import popup from './Popup.css';

type Props ={};

export default class Highlight extends Component<Props> {
  props: Props;

  render() {
    return (
      <div className='popup'>
        <div className='popup_inner'>
          <span>
            <div className={popup.bckground}>
              <a className={popup.red}></a>
              <a className={popup.green}></a>
              <a className={popup.blue}></a>
              <a className={popup.yellow}></a>
              <a className={popup.purple}></a>
            </div>
          </span>
        </div>
      </div>
    );
  }
}
