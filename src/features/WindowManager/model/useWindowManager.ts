import { useContext } from 'react';
import { WindowManagerContext, type WindowManagerApi } from './context';

export const useWindowManager = (): WindowManagerApi => {
  const api = useContext(WindowManagerContext);
  if (!api) {
    throw new Error(
      'useWindowManager must be used inside WindowManagerProvider'
    );
  }
  return api;
};
