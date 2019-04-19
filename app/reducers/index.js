// @flow
import { combineReducers } from 'redux';
import { connectRouter } from 'connected-react-router';
import counter from './counter';
import highlighter from './highlighter';
import urlsearch from './urlsearch';
import sidebar from './sidebar';

export default function createRootReducer(history: History) {
  return combineReducers({
    router: connectRouter(history),
    counter,
    highlighter,
    urlsearch
  });
}
