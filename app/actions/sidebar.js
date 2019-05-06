import type { GetState, Dispatch } from '../reducers/types';
/**
 * Adds highlight to annotations
 * @param  {Object} highlightData
 * @returns {Action}  HIGHLIGHT action
 */
export const addHighlight = (highlightData: Object) => {
  return {
      type: "HIGHLIGHT",
      highlightData
  }
}
/**
 * Adds comment to highlight
 * @param  {Object} commentData
 * @returns {Action}  COMMENT action
 */
export const addComment = (commentData: Object) => {
  return {
      type: "COMMENT",
      commentData
  }
}
/**
 * Sends delete request
 * @param  {String} deleteId
 * @returns {Action}  DELETE action
 */
export const deleteHighlights = (deleteId: String) => {
  return {
      type: "DELETE",
      deleteId
  }
}

/**
 * Tells which highlight id should be in view
 * @param  {String} id
 * @returns {Action}  VIEW action
 */
export const viewHighlight = (id: String) => {
  return {
      type: "VIEW",
      id
  }
}
/**
 * Switches boolean to hide all annotations on a page
 * @returns {Action}  HIDEHIGHLIGHTS action
 */
export const hideHighlights = () => {
  return {
      type: "HIDEHIGHLIGHTS"
    }
}

/**
 * Resets annotations list for new page
 * @returns {Action}  CLEAR action
 */
export const clearHighlights = () => {
  return {
      type: "CLEAR"
  }
}
