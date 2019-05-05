import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import LegacyDataConverter from '../components/LegacyDataConverter';
import * as notificationActions from '../actions/notification';


function mapDispatchToProps(dispatch){
  return{
    addNotification: (notification) => dispatch(notificationActions.addNotification(notification))
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(LegacyDataConverter);
