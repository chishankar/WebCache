// @flow
import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import routes from '../constants/routes';
// import styles from './Home.css';
import RenderTextPage from '../containers/RenderTextPage';

type Props = {};

export default class Home extends Component<Props> {
  props: Props;

  // <h2>Home</h2>
  // <Link to={routes.COUNTER}>to Counter</Link>

  render() {
    return (
      <div data-tid="container">
        < RenderTextPage/>
      </div>
    );
  }
}
