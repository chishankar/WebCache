import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types
/**
 * Action to displays the search sidebar
 * @param  {Boolean} sideBarState
 * @returns {Action}  SIDEBARUPDATE action
 */
export const changeSideBarState = (sideBarState: Boolean) => {
  return {
      type: "SIDEBARUPDATE",
      sideBarState
  }
}
