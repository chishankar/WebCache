import { connect } from 'react-redux';
import SearchSideBar from '../components/SearchSideBar';

function mapStateToProps(state){
  return {
    searchData: state.filesearch.searchData,
  };
}

export default connect(
  mapStateToProps,
  null,
)(SearchSideBar);
