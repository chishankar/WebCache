import type { GetState, Dispatch } from '../reducers/types';

export const addHighlight = (highlightData) => {
  return {
      type: "HIGHLIGHT",
      highlightData
  }
}
