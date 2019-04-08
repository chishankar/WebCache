import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const changeActiveUrl = (activeUrl) => {
  return {
      type: 'URL_UPDATE',
      activeUrl: activeUrl
  }
}