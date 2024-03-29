// @flow
import type { Action } from './types';

const initialState = {
  activeUrl: "app/default_landing_page.html"
}

export default function urlsearch(state=initialState, action) {
    switch(action.type){

      case 'URLUPDATE':
        console.log("CHANGING URL TO: " + action.activeUrl);
        return Object.assign({},state, {
          activeUrl: action.activeUrl
       });

       default:
        return state;
    }
}

