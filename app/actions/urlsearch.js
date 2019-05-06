import type { Action } from '../reducers/types'; //what to change in reducers/types
/**
 * Actions to update active url in the store
 * @param  {String} activeUrl The url to download/scrape or the url that is currently displaying in the iframe window
 * @returns {Action}  URLUPDATE action
 */
export const changeActiveUrl = (activeUrl: String) => {
  return {
      type: "URLUPDATE",
      activeUrl
  }
}
