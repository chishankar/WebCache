import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SideBar from '../components/SideBar';

function mapStateToProps(state){
  return {
    sidebar: state.sidebar.sidebar
  };
}

export default connect(
  mapStateToProps
)(SideBar);
