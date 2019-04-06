import React, {Component} from 'react';
import { Switch, Route } from 'react-router';
import routes from './constants/routes';
import App from './containers/App';
import HomePage from './containers/HomePage';
import CounterPage from './containers/CounterPage';
import NavbarPage from './containers/NavbarPage';
import Navbar from './components/Navbar';
import Toolbar from './components/Toolbar';
// import Notification from './components/Notification';

export default class Routes extends Component<Props> {

  constructor(props){
    super(props)
    this.store = this.props.store;
  }
  //           <NavbarPage store={this.store}/>
 //            <Toolbar store={this.store}/>

  render() {
    return (
      <App>
        <HomePage store={this.store}/>
      </App>
    );
  }

}
// this.store.subscribe(render);

// export default () => (
//   <App>
//     <Navbar />
//     <Toolbar />
//     <Switch>
//       <Route path={routes.COUNTER} component={CounterPage} />
//       <Route path={routes.HOME} component={HomePage} />
//     </Switch>
//   </App>


// <Switch>
// <Route path={routes.COUNTER} component={CounterPage} />
// <Route path={routes.HOME} store={this.store} component={HomePage} />
// </Switch>
// );
