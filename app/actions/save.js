import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const SaveDoc = () => {
  return {
      type: "SAVE"
  }
}

export const ChangeSave = (val) => {
  return {
      type: "UPDATESAVE",
      val
  }
}
