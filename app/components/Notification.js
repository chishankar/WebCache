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

class Notification extends Component {
  constructor(props) {
    super(props);
    this.message = this.props.message
    this.id = this.props.id
    this.state = {
      open: true
    }
  }

  notificationOpen = () => {
    this.setState({
      open: true
    })
  }

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
        vertical: 'top',
        horizontal: 'right',
      }}
      open={this.state.open}
      autoHideDuration={6000}
      onClose={this.handleClose}
      ContentProps={{
        'aria-describedby': 'message-id',
      }}
      onClick={this.notificationClose}
      message={<span id="message-id">{this.message}</span>}
      action={[
        <IconButton
          key="close"
          aria-label="Close"
          color="inherit"
          className={styles.close}
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
