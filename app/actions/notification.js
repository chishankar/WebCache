import type { Action} from '../reducers/types';


/**
 * Creates a notification
 * @param  {String} notificationMessage The message that the notification should have
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
 * @param  {String} notificationId The id of the notification
 * @returns {Action}  REMOVENOTIFICATION
 */
export const removeNotification = (notificationId: String) => {
  return {
      type: "REMOVENOTIFICATION",
      notificationId
  }
}

