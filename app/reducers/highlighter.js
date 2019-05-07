// @flow
import type { Action } from './types';

const initialState = {
  color: "DEFAULT"
}

export default function highlighter(state=initialState, action) {
  switch (action.type) {

    case 'RED':
      return Object.assign({},state, {
          color: "red"
      });

    case 'GREEN':
      return Object.assign({},state, {
          color: "green"
      });

    case 'BLUE':
      return Object.assign({},state, {
          color: "blue"
      });

    case 'YELLOW':
      return Object.assign({},state, {
          color: "yellow"
      });

    case 'PURPLE':
      return Object.assign({},state, {
          color: "purple"
      });

    case 'DEFAULT':
      return Object.assign({},state, {
          color: "DEFAULT"
      });

    default:
      return state;
  }
}
