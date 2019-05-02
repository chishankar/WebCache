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

export const viewHighlight = (id) => {
  return {
      type: "VIEW",
      id
  }
}

export const hideHighlights = () => {
  return {
      type: "HIDEHIGHLIGHTS"
    }
}

export const clearHighlights = () => {
  return {
      type: "CLEAR"
  }
}
