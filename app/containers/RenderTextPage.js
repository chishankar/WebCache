import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderText from '../components/RenderText';
import * as sideBarActions from '../actions/sidebar';
import * as notificationActions from '../actions/notification';

function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl,
    delete: state.sidebar.delete,
    annotations: state.sidebar.highlights,
    hideHighlights: state.sidebar.hideHighlights,
    save: state.save.mostRecentUpdate
  };
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addHighlight: sideBarActions.addHighlight,
    clearHighlights: sideBarActions.clearHighlights,
    addNotification: notificationActions.addNotification
  },dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RenderText);
