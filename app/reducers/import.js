// @flow
import type { Action } from './types';

const initialState = {
  importState: false
}

export default function sidebarstate(state=initialState, action) {
    switch(action.type){

      case 'IMPORTUPDATE':
        return Object.assign({},state, {
          importState: !state.importState
       });

       default:
        return state;
    }
}
