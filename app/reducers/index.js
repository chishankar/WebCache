// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import highlighter from './highlighter';
import urlsearch from './urlsearch';
import sidebar from './sidebar';
import save from './save';
import notification from './notification';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    highlighter,
    urlsearch,
    sidebar,
    save,
    notification
  });
}
