import type { Action } from './types';

const initialState = {
    highlights: [],
    url: "",
    delete: ""
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
      let newCommentList = state.highlights;
      for (var i = 0; i < newCommentList.length; i++) {
        let highlight = newCommentList[i];
        if (highlight.id == action.commentData.id) {
          newCommentList[i].comment = action.commentData.comment;
          return Object.assign({},state, {
            highlights: newCommentList
          });
        }
      }

    case 'DELETE':
      const newHighlightList = state.highlights.filter(highlight => highlight.id !== action.deleteId);

      return Object.assign({},state,{
        delete: action.deleteId,
        highlights: newHighlightList
      });

    case 'CLEAR':
      return Object.assign({}, state, {highlights: []});

    default:
      return state;
  }
}
