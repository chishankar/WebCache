import type { Action } from './types';

const initialState = {
    highlights: [],
    url: ""
}

export default function highlighter(state=initialState, action) {
  switch (action.type) {

    case 'HIGHLIGHT':
      const highlights = state.highlights;
      const newHighlightsList = highlights.concat([action.highlightData])
      return Object.assign({},state, {
          highlights: newHighlightsList
      });

    default:
      return state;
  }
}
