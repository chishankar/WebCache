import type { Action } from '../reducers/types'; //what to change in reducers/types
/**
 * Action to displays the search sidebar
 * @param  {Boolean} sideBarState Tells whether the search side bar should show or not
 * @returns {{type: Action, sideBarState: Boolean}}  SIDEBARUPDATE action
 */
export const changeSideBarState = (sideBarState: Boolean) => {
  return {
      type: "SIDEBARUPDATE",
      sideBarState
  }
}
