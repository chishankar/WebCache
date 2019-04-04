import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderText from '../components/RenderText';
// import * as highlighterActions from '../actions/highlighter';

function mapStateToProps(state) {
  // console.log(state.highlighter.color);
  return {
    color: state.highlighter.color
  };
}

// function mapDispatchToProps(dispatch) {
//   return bindActionCreators(highlighterActions, dispatch);
// }

export default connect(
  mapStateToProps,
)(RenderText);
