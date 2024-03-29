import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderText from '../components/RenderText';
import * as sideBarActions from '../actions/sidebar';
import * as notificationActions from '../actions/notification';
import * as saveActions from '../actions/save';


function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl,
    delete: state.sidebar.delete,
    annotations: state.sidebar.highlights,
    hideHighlights: state.sidebar.hideHighlights,
    save: state.save.mostRecentUpdate,
    viewId: state.sidebar.viewId,
    searchTerm: state.filesearch.search
  };
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addHighlight: sideBarActions.addHighlight,
    clearHighlights: sideBarActions.clearHighlights,
    addNotification: notificationActions.addNotification,
    updateLastUpdate: saveActions.ChangeSave
  },dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RenderText);
