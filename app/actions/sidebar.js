import type { Action } from '../reducers/types';
/**
 * Adds highlight to annotations
 * @param  {Object} highlightData An object that contains color, text, id
 * @returns {{type: Action, highlightData: Object}}  HIGHLIGHT action
 */
export const addHighlight = (highlightData: Object) => {
  return {
      type: "HIGHLIGHT",
      highlightData
  }
}
/**
 * Adds comment to highlight
 * @param  {Object} commentData An object that takes a comment text and a id to associate to the correct highlight
 * @returns {{type: Action, commenthData: Object}} COMMENT action
 */
export const addComment = (commentData: Object) => {
  return {
      type: "COMMENT",
      commentData
  }
}
/**
 * Sends delete request
 * @param  {String} deleteId The id of the highlight that is to be deleted
 * @returns {{type: Action, deleteId: String}}  DELETE action
 */
export const deleteHighlights = (deleteId: String) => {
  return {
      type: "DELETE",
      deleteId
  }
}

/**
 * Tells which highlight id should be in view
 * @param  {String} id Id of the highlight that is to be veiwed/centered on the screen
 * @returns {{type: Action, id: String}}  VIEW action
 */
export const viewHighlight = (id: String) => {
  return {
      type: "VIEW",
      id
  }
}
/**
 * Switches boolean to hide all annotations on a page
 * @returns {type: Action}  HIDEHIGHLIGHTS action
 */
export const hideHighlights = () => {
  return {
      type: "HIDEHIGHLIGHTS"
    }
}

/**
 * Resets annotations list for new page
 * @returns {type: Action}  CLEAR action
 */
export const clearHighlights = () => {
  return {
      type: "CLEAR"
  }
}
