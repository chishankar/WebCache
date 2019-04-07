import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import RenderText from '../components/RenderText';

function mapStateToProps(state) {
  return {
    color: state.highlighter.color,
    activeUrl: state.urlsearch.activeUrl
  };
}

export default connect(
  mapStateToProps,
)(RenderText);
