import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const SaveDoc = (activeUrl) => {
  return {
      type: "SAVE"
  }
}
