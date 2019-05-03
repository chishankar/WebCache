import type { Action } from './types';

const initialState = {
  mostRecentUpdate: ""
}

function getDateTime (){
  var currentdate = new Date();
  return currentdate.getDate() + "/"
                  + (currentdate.getMonth())  + "/"
                  + currentdate.getFullYear() + " at "
                  + currentdate.getHours() + ":"
                  + currentdate.getMinutes() + ":"
                  + currentdate.getSeconds();
}

export default function save(state=initialState, action) {
    switch(action.type){

      case 'SAVE':
        return Object.assign({},state, {
          mostRecentUpdate: getDateTime()
        });

       default:
        return state;
    }
}

