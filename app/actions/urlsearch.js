import type { GetState, Dispatch } from '../reducers/types'; //what to change in reducers/types

export const changeActiveUrl = (activeUrl) => {
  console.log("dispatching: "+ activeUrl)
  return {
<<<<<<< HEAD
      type: "URLUPDATE",
      activeUrl
=======
      type: 'URL_UPDATE',
      activeUrl: activeUrl
>>>>>>> 3671a08563fd0594b6c41646adf5fb4befa11357
  }
}
