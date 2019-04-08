// @flow
import type { Action } from './types';

const initialState = {
  activeUrl: "DEFAULT"
}

export default function urlsearch(state=initialState, action) {
    console.log("action for file path" + action.type);

    switch(action.type){
	    case 'URL_UPDATE':
	      console.log("Highlighter: Red")
	      return Object.assign({},state, {
	          activeUrl: action.activeUrl
	      });

	    default:
	      return state;
    }
}