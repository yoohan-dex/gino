import { ReceiveObject } from './app';
import { useDeps } from 'react-simple-di';

import {
  compose,
  composeWithTracker,
  composeWithPromise,
  composeWithObservable,
  composeAll,
  disable,
} from 'react-komposer';

import App from './app';

export const createApp = (...args: any[]) => (new App(...args));

export {
  useDeps,
  compose,
  composeWithTracker,
  composeWithPromise,
  composeWithObservable,
  composeAll,
  disable,
};
