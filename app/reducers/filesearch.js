// @flow
import type { Action } from './types';

const initialState = {
  searchData: String
}
/**
 * Dispatch handlers for SEARCHDATA
 * @param  {Object} state State of filesearch.
 * @param  {Action} action Action type.
 */
export default function filesearch(state=initialState, action: Action) {
    switch(action.type){

      case 'SEARCHDATA':
        return Object.assign({},state, {
          searchData: action.searchData
       });

       default:
        return state;
    }
}

