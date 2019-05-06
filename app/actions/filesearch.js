import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

/**
 * Sends user search request
 * @param  {Object} searchData
 * @returns SEARCHDATA action
 */
export const changeSearchData = (searchData: Object) => {
  return {
      type: "SEARCHDATA",
      searchData
  }
}
