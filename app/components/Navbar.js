// @flow
import React, { Component } from 'react';
import styles from './Navbar.css';
import 'font-awesome/css/font-awesome.min.css';
import UrlSearch from './UrlSearch';
import popup from './Popup.css';

type Props = {
  color: string
};

class ShowHighlightColor extends Component{

  getColor = (color) => {
    switch (color){
      case 'red':
        return popup.yellow;
      case 'green':
        return popup.green;
      case 'blue':
        return popup.blue;
      case 'yellow':
        return popup.yellow;
      case 'purple':
        return popup.purple;
      case 'DEFAULT':
        return popup.default;
    }
  }

  render(){
    return (
      <a className={this.getColor(this.props.color)}></a>
    )
  }
}

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
        <ShowHighlightColor color={color}/>
      </div>
    );
  }

}
