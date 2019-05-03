// @flow
import type { Action } from './types';

const initialState = {
  notifications: []
}

function generateRandomId() {

  return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2, 10);

}

function buildNotification (message){
  return {
    message: message,
    id: generateRandomId()
  }
}

export default function notificationRender(state=initialState, action) {
    switch(action.type){

      case 'ADDNOTIFICATION':
        let currNotifications = state.notifications;
        let newNotList = currNotifications.concat([buildNotification(action.notificationMessage)])

        return Object.assign({},state, {
          notifications: newNotList
         });

      case 'REMOVENOTIFICATION':
          const newNotification = state.notifications.filter(note => note.id != action.notificationId);

          return Object.assign({},state, {
            notifications: newNotification
          });

       default:
        return state;
    }
}

