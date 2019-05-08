// @flow
import type { GetState, Dispatch } from '../reducers/types';
/**
 * Changes to red color
 * @returns RED action
 */
export const changeRed = () => {
  return {
      type: "RED"
  }
}
/**
 * Changes to green color
 * @returns GREEN action
 */
export const changeGreen = () => {
  return {
      type: "GREEN"
  }
}
/**
 * Changes to blue color
 * @returns BLUE action
 */
export const changeBlue = () => {
  return {
      type: "BLUE"
  }
}
/**
 * Changes to yellow color
 * @returns YELLOW action
 */
export const changeYellow = () => {
  return {
      type: "YELLOW"
  }
}
/**
 * Changes to purple color
 * @returns PURPLE action
 */
export const changePurple = () => {
  return {
      type: "PURPLE"
  }
}
/**
 * Changes to default color (clear)
 * @returns DEFAULT action
 */
export const changeDefault = () => {
  return {
      type: "DEFAULT"
  }
}
