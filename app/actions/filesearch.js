import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const changeSearchData = (searchData) => {
  return {
      type: "SEARCHDATA",
      searchData
  }
}
