import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SideBar from '../components/SideBar';

function mapStateToProps(state){
  return {
    highlights: state.sidebar.highlights
  };
}

export default connect(
  mapStateToProps,
)(SideBar);
