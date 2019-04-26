import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const changeSearchTerms = (searchTerms) => {
  return {
      type: "SEARCHTERMS",
      searchTerms
  }
}
