import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderText from '../components/RenderText';
import * as sideBarActions from '../actions/sidebar';


function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl,
    delete: state.sidebar.delete,
    annotations: state.sidebar.highlights
  };
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addHighlightColor: sideBarActions.addHighlight
  },dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(RenderText);
