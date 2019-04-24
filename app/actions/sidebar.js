import type { GetState, Dispatch } from '../reducers/types';

export const addHighlight = (highlightData) => {
  return {
      type: "HIGHLIGHT",
      highlightData
  }
}

export const addComment = (commentData) => {
  return {
      type: "COMMENT",
      commentData
  }
}

export const deleteHighlights = (deleteId) => {
  return {
      type: "DELETE",
      deleteId
  }
}

export const hideHighlights = () => {
  return {
      type: "HIDEHIGHLIGHTS"
    }
}

