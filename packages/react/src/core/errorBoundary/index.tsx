// sdk/react/ErrorBaseContext.tsx
import React, { type ReactNode, type FC } from 'react';
// import Base from '@/collect/base';
import { ErrorBase } from '@ors-sdk/web';
import { generateOrGetSessionId } from '@ors-sdk/web';
import type { SessionParams } from '@ors-sdk/web';
const { createElement, createContext } = React;

export interface ErrorBaseProviderProps {
  config: SessionParams;
  children: ReactNode;
}

export interface BaseContextProps {
  base: ErrorBase;
}

export const ErrorBaseContext = createContext<BaseContextProps | null>(null);

export const ErrorBaseProvider: FC<ErrorBaseProviderProps> = ({ config, children }) => {
  const info = generateOrGetSessionId();
  // 参数校验
  const sessionParams: SessionParams = {
    ...config,
    sessionInfo: info,
  };
  const base = new ErrorBase(sessionParams);
  return createElement(ErrorBaseContext.Provider, { value: { base } }, children);
};
