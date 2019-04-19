import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Viewer from '../components/viewerWindow';
import * as highlighterActions from '../actions/highlighter';
import * as urlsearchActions from '../actions/urlsearch';

function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl
  };
}

export default connect(mapStateToProps)(Viewer);
