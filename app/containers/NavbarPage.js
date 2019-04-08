import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Navbar from '../components/Navbar';
import * as highlighterActions from '../actions/highlighter';
import * as urlsearchActions from '../actions/urlsearch'

function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl
  };
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(Object.assign({}, highlighterActions, urlsearchActions), dispatch);
// }

export default connect(
  mapStateToProps,
  // mapDispatchToProps
)(Navbar);
