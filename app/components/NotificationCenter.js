import React, { Component } from 'react';
import Notification from './Notification';

import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    notifications: state.notification.notifications
  };
}

class NotificationCenter extends Component{
  constructor(props){
    super(props)
  }

  render(){
    return (
      <div>

        {this.props.notifications.map(notification =>
          <Notification key={notification.id} message={notification.message} id={notification.id} />
        )}

      </div>
    )
  }
}

export default connect(
  mapStateToProps,
  null)(NotificationCenter);
