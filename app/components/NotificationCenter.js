import React, { Component } from 'react';
import Notification from './Notification';

import { connect } from 'react-redux';

function mapStateToProps(state) {
  return {
    notifications: state.notification.notifications
  };
}

/**
 * @class
 * @return {NotificationCenter} Notification Center component that holds the notifications
 */
class NotificationCenter extends Component{
    /**
   * @param  {Props} props
   * @this
   */
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
