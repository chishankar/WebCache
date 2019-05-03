// @flow
import type { Action } from './types';

const initialState = {
  searchData: JSON.stringify({results:[]})
}

export default function filesearch(state=initialState, action) {
    switch(action.type){

      case 'SEARCHDATA':
        return Object.assign({},state, {
          searchData: action.searchData
       });

       default:
        return state;
    }
}

