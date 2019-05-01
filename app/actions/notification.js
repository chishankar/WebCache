import type { GetState, Dispatch } from '../reducers/types';



export const addNotification = (notificationMessage) => {
  return {
      type: "ADDNOTIFICATION",
      notificationMessage
  }
}

export const removeNotification = (notificationId) => {
  return {
      type: "REMOVENOTIFICATION",
      notificationId
  }
}

