import {NotificationContainer, NotificationManager} from 'react-notifications';
import React, { Component } from 'react';

type Props = {
  hasError: boolean
}

function createNotification(type) {
  return () => {
    switch (type) {
      case 'info':
        NotificationManager.info('Info message');
        break;
      case 'success':
        NotificationManager.success('Success message', 'Title here');
        break;
      case 'warning':
        NotificationManager.warning('Warning message', 'Close after 3000ms', 3000);
        break;
      case 'error':
        NotificationManager.error('Error','Close after 3000ms', 3000);
        break;
    }
  };
};

// export default class Notification extends Component<Props>{
//   props: Props;

//   componentDidCatch(error, info) {

//     this.setState({ hasError: true });

//     this.createNotification('error');
//   }

//   render(){
//     const{
//       hasError
//     } = this.props

//     return this.props.children
//   }
// }
export default class Notification extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidCatch(error, info) {
    // Display fallback UI
    this.setState({ hasError: true });
    console.log("Works?");
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
    this.createNotification('error');
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
