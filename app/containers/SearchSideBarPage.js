import { connect } from 'react-redux';
import SearchSideBar from '../components/SearchSideBar';

function mapStateToProps(state, ownProps){
  return {
    searchData: state.filesearch.searchData, 
    store: ownProps.store
  };
}

export default connect(
  mapStateToProps,
  null,
)(SearchSideBar);
