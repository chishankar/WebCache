import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Navbar from '../components/Navbar';
import * as highlighterActions from '../actions/highlighter';

function mapStateToProps(state) {
  // console.log(state.highlighter.color);
  return {
    color: state.highlighter.color
  };
}

function mapDispatchToProps(dispatch) {
  return bindActionCreators(highlighterActions, dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Navbar);
