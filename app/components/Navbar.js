// @flow
import React, { Component } from 'react';
import styles from './Navbar.css';
import 'font-awesome/css/font-awesome.min.css';
import UrlSearch from './UrlSearch';

type Props = {
  color: string
};

export default class Navbar extends Component<Props> {
  props: Props;

  render() {
    const{
      color
    } = this.props
    return (
      <div className={styles.topnav} data-tid="container">
        <a href="#home">File</a>
        <a href="#about">Edit</a>
        <a href="#contact">View</a>
        <a href="#contact">Setting</a>
        <UrlSearch />
        <a>Current Highlight Color: {color}</a>
      </div>
    );
  }

}
