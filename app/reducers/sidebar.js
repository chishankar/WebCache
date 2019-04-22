import type { Action } from './types';

const initialState = {
    highlights: [],
    url: ""
}

export default function highlighter(state=initialState, action) {
  switch (action.type) {

    case 'HIGHLIGHT':
      let highlights = state.highlights;
      let newHighlightsList = highlights.concat([action.highlightData])
      return Object.assign({},state, {
          highlights: newHighlightsList
      });

    case 'COMMENT':
      console.log('FINISHED!!!')
      let newCommentList = state.highlights
      for (var i = 0; i < newCommentList.length; i++) {
        let highlight = newCommentList[i];
        if (highlight.id === action.commentData.id) {
          highlight.comment = action.commentData.text;
          return Object.assign({},state, {
            highlights: newCommentList
          });
        }
      }

    default:
      return state;
  }
}
