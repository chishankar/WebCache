import type { Action } from './types';

const initialState = {
  sidebar : {
    highlights: [],
    url: ""
  }
}

export default function highlighter(state=initialState, action) {
  switch (action.type) {

    case 'HIGHLIGHT':
      console.log("Client has highlighted");
      return Object.assign({},state, {
          sidebar: "red"
      });

    default:
      return state;
  }
}
