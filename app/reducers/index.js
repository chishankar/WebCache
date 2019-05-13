// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import highlighter from './highlighter';
import urlsearch from './urlsearch';
import sidebar from './sidebar';
import filesearch from './filesearch';
import sidebarstate from './sidebarstate';
import save from './save';
import notification from './notification';
import imports from './import'

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    highlighter,
    urlsearch,
    filesearch,
    sidebar,
    sidebarstate,
    save,
    notification,
    imports
  });
}
