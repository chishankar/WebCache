import type { GetState, Dispatch } from '../reducers/types';


/**
 * Creates a notification
 * @param  {String} notificationMessage
 * @returns {Action}  ADDNOTIFICATION
 */
export const addNotification = (notificationMessage: String) => {
  return {
      type: "ADDNOTIFICATION",
      notificationMessage
  }
}
/**
 * Deletes the notification
 * @param  {String} notificationId
 * @returns {Action}  REMOVENOTIFICATION
 */
export const removeNotification = (notificationId: String) => {
  return {
      type: "REMOVENOTIFICATION",
      notificationId
  }
}

