import type { Action } from '../reducers/types'; //what to change in reducers/types

/**
 * Sends user search request
 * @param  {Object} searchData The results of user search
 * @returns {{type: Action, searchData: Object}} Results from search
 */
export const changeSearchData = (searchData: Object) => {
  return {
      type: "SEARCHDATA",
      searchData
  }
}

/**
 * Sends user search request
 * @param  {Object} searchTerm
 * @returns SEARCHTERM action
 */
export const updateSearchTerm = (searchTerm: String) => {
  return {
      type: "SEARCHTERM",
      searchTerm
  }
}
