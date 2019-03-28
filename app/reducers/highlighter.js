// @flow
import type { Action } from './types';

const initialState = {
  color: "DEFAULT"
}

export default function highlighter(state=initialState, action) {
  switch (action.type) {

    case 'RED':
      console.log("Highlighter: Red")
      return Object.assign({},state, {
          color: "red"
      });

    case 'GREEN':
      console.log("Highlighter: Green")
      return Object.assign({},state, {
          color: "green"
      });

    case 'BLUE':
      console.log("Highlighter: Blue")
      return Object.assign({},state, {
          color: "blue"
      });

    case 'YELLOW':
      console.log("Highlighter: Yellow")
      return Object.assign({},state, {
          color: "yellow"
      });

    case 'PURPLE':
      console.log("Highlighter: Purple")
      return Object.assign({},state, {
          color: "purple"
      });

    default:
      return state;
  }
}
