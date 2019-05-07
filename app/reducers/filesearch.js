// @flow
import type { Action } from './types';

const initialState = {
  searchData: JSON.stringify({results:[]}),
  search: ""
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

      case 'SEARCHTERM':
        return Object.assign({}, state, {
          search: action.searchTerm
        })

       default:
        return state;
    }
}

