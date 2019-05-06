import type { Dispatch as ReduxDispatch, Store as ReduxStore, Object } from 'redux';

export type counterStateType = {
  +counter: number
};

/**
 * @type {Action}
 */
export type Action = {
  +type: string
};

/**
 * @type {Props}
 */
export type Props = {
  +type: Object
}

export type GetState = () => counterStateType;

export type Dispatch = ReduxDispatch<Action>;

/**
 * @type {Store}
 */
export type Store = ReduxStore<GetState, Action>;
