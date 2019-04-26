// @flow
import type { Action } from './types';

const initialState = {
  searchTerms: ""
}

export default function filesearch(state=initialState, action) {
    switch(action.type){

      case 'SEARCHTERMS':
        return Object.assign({},state, {
          searchTerms: action.searchTerms
       });

       default:
        return state;
    }
}

