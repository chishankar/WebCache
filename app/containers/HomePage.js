// @flow
import { connect } from 'react-redux';
import React, { Component } from 'react';
import Home from '../components/Home';

// type Props = {};
function mapStateToProps(state) {
  return {
    searchTerms: state.filesearch.searchTerms
  };
}

export class HomePage extends Component<Props> {
  // props: Props;

  constructor(props){
    super(props);
    this.store = this.props.store;
  }

  render() {
    return <Home store={this.props.store}/>;
  }
}

export default connect(
  mapStateToProps,
  null,
)(Home);
