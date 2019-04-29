import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const changeSideBarState = (sideBarState) => {
  return {
      type: "SIDEBARUPDATE",
      sideBarState
  }
}
	