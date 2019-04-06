// @flow
import React, { Component } from 'react';
import Home from '../components/Home';

// type Props = {};

export default class HomePage extends Component<Props> {
  // props: Props;

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  render() {
    return <Home store={this.props.store}/>;
  }
}
