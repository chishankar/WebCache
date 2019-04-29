// @flow
import type { Action } from './types';

const initialState = {
  sideBarState: false
}

export default function sidebarstate(state=initialState, action) {
    switch(action.type){

      case 'SIDEBARUPDATE':
        return Object.assign({},state, {
          sideBarState: action.sideBarState
       });

       default:
        return state;
    }
}

