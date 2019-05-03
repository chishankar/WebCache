import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SideBar from '../components/SideBar';
import * as sideBarActions from '../actions/sidebar';

function mapStateToProps(state){
  return {
    highlights: state.sidebar.highlights,
    color: state.highlighter.color
  };
}

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    addComment: sideBarActions.addComment,
  },dispatch);
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(SideBar);
