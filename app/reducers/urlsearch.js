// @flow
import type { Action } from './types';

const initialState = {
  activeUrl: "DEFAULT"
}

export default function urlsearch(state=initialState, action) {
    console.log("action for f ile path" + action.type);
    return Object.assign({},state, {
        activeUrl: action.type
    });
}