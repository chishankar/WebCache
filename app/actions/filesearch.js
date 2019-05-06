import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

/**
 * Sends user search request
 * @param  {Object} searchData The results of user search
 * @returns {Action} SEARCHDATA action
 */
export const changeSearchData = (searchData: Object) => {
  return {
      type: "SEARCHDATA",
      searchData
  }
}
