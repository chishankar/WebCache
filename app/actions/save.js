import type { Action } from '../reducers/types'; //what to change in reducers/types
/**
 * Save requests for doc propogated to RenderText
 * @returns {type: Action}  SAVE action
 */
export const SaveDoc = () => {
  return {
      type: "SAVE"
  }
}
/**
 * Updates last updated date in application state
 * @param  {Object} val A new value to set the last update date value to
 * @returns {{type: Action, val: Object}} Update save to last update date
 */
export const ChangeSave = (val: Object) => {
  return {
      type: "UPDATESAVE",
      val
  }
}
