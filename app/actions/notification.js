import type { Action} from '../reducers/types';


/**
 * Creates a notification
 * @param  {String} notificationMessage The message that the notification should have
 * @returns {{type: Action, notificationMessage: String}} Notification message
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
 * @returns {{type: Action, notificationId: String}} Notification id
 */
export const removeNotification = (notificationId: String) => {
  return {
      type: "REMOVENOTIFICATION",
      notificationId
  }
}

