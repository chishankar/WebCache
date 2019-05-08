// @flow
import type { Action } from './types';

const initialState = {
  searchData: JSON.stringify({results:[]}),
  search: ""
}

export default function filesearch(state=initialState, action) {
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

