// sdk/react/BaseContext.tsx
import React, { type ReactNode, type FC } from 'react';
import { Base } from '@ors-sdk/web';
import { generateOrGetSessionId } from '@ors-sdk/web';
import type { SessionParams } from '@ors-sdk/web';
const { createElement, createContext } = React;

export interface BaseProviderProps {
  config: SessionParams;
  children: ReactNode;
}

export interface BaseContextProps {
  base: Base;
}

export const BaseContext = createContext<BaseContextProps | null>(null);

export const BaseProvider: FC<BaseProviderProps> = ({ config, children }) => {
  const info = generateOrGetSessionId();
  // 参数校验
  const sessionParams: SessionParams = {
    ...config,
    sessionInfo: info,
  };
  const base = new Base(sessionParams);
  return createElement(BaseContext.Provider, { value: { base } }, children);
};
