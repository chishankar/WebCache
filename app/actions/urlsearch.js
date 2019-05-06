import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types
/**
 * Actions to update active url in the store
 * @param  {String} activeUrl
 * @returns URLUPDATE action
 */
export const changeActiveUrl = (activeUrl: String) => {
  return {
      type: "URLUPDATE",
      activeUrl
  }
}
