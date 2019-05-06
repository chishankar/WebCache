import type { Action } from '../reducers/types'; //what to change in reducers/types
/**
 * Action to displays the search sidebar
 * @param  {Boolean} sideBarState Tells whether the search side bar should show or not
 * @returns {Action}  SIDEBARUPDATE action
 */
export const changeSideBarState = (sideBarState: Boolean) => {
  return {
      type: "SIDEBARUPDATE",
      sideBarState
  }
}
