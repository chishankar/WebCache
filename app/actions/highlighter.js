// @flow
import type { Action } from '../reducers/types';
/**
 * Changes to red color
 * @returns {Action}  RED action
 */
export const changeRed = () => {
  return {
      type: "RED"
  }
}
/**
 * Changes to green color
 * @returns {Action}  GREEN action
 */
export const changeGreen = () => {
  return {
      type: "GREEN"
  }
}
/**
 * Changes to blue color
 * @returns {Action}  BLUE action
 */
export const changeBlue = () => {
  return {
      type: "BLUE"
  }
}
/**
 * Changes to yellow color
 * @returns {Action}  YELLOW action
 */
export const changeYellow = () => {
  return {
      type: "YELLOW"
  }
}
/**
 * Changes to purple color
 * @returns {Action}  PURPLE action
 */
export const changePurple = () => {
  return {
      type: "PURPLE"
  }
}
/**
 * Changes to default color (clear)
 * @returns {Action}  DEFAULT action
 */
export const changeDefault = () => {
  return {
      type: "DEFAULT"
  }
}
