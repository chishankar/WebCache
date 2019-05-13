import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types
/**
 * Action to tell us if we need to re-render the file navigator if a import occurs
 * @returns IMPORTUPDATE action
 */
export const importChange = () => {
  return {
      type: "IMPORTUPDATE"
  }
}
