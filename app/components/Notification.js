import {NotificationContainer, NotificationManager} from 'react-notifications';
import React, { Component } from 'react';
import Snackbar from '@material-ui/core/Snackbar';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import IconButton from '@material-ui/core/IconButton';

import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import * as notificationActions from '../actions/notification';

const styles = theme => ({
  close: {
    padding: theme.spacing.unit / 2,
  },
});

function mapDispatchToProps(dispatch){
  return bindActionCreators({
    removeNotification: notificationActions.removeNotification,
  },dispatch);
}

/**
 * @class
 * @param {String} message Text that is highlighted
 * @param {String} id The color that the highlight is in
 * @return {Component} Notification component that gets triggered upon variety of events
 */
class Notification extends Component {
    /**
   * @param  {Props} props
   * @this
   */
  constructor(props) {
    super(props);
    this.message = this.props.message
    this.id = this.props.id
    this.state = {
      open: true
    }
  }

  /**
   * Creates the notification
   */
  notificationOpen = () => {
    this.setState({
      open: true
    })
  }

  /**
   * Closes and removes the notification
   * @fires removeNotification
   */
  notificationClose = () => {
    this.setState({
      open: false
    })
    this.props.removeNotification(this.id)
  }

  render() {

    return(
      <Snackbar
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
      open={this.state.open}
      onClose={this.notificationClose}
      autoHideDuration={6000}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      message={<span id="message-id">{this.message}</span>}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={styles.close}
          onClick={this.notificationClose}
        >
          <CloseIcon  />
        </IconButton>,
      ]}
    />
    )
  }
}

export default connect(
  null,
  mapDispatchToProps,
)(Notification);
