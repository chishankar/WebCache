import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types
/**
 * Save requests for doc propogated to RenderText
 * @returns SAVE action
 */
export const SaveDoc = () => {
  return {
      type: "SAVE"
  }
}
/**
 * Updates last updated date in application state
 * @param  {Object} val
 * @returns UPDATESAVE action
 */
export const ChangeSave = (val: Object) => {
  return {
      type: "UPDATESAVE",
      val
  }
}
