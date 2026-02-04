// ors/react/performance/withProfiler.tsx
import React, { type ComponentType, type ContextType } from 'react';
import { getRandomNumber, windowOrs } from '@ors-sdk/web';
import { logReport } from '@ors-sdk/web';
import { BaseContext } from '../context/BaseContext';
const { Profiler, createElement, Component } = React;

// 不直接引入import React from 'react',避免打包时将React实例作为default引入，导致业务方react冲突，多版本问题

// 定义基础属性接口
interface WithProfilerProps {
  orsCompMark?: string; // 声明为可选属性
}
export function withProfiler<T extends WithProfilerProps>(WrappedComponent: ComponentType<T>, id?: string) {
  return class WithProfiler extends Component<T> {
    static contextType = BaseContext;
    declare context: ContextType<typeof BaseContext>;
    render() {
      const profilerId = id || WrappedComponent.displayName || WrappedComponent.name;
      const componentName = WrappedComponent.displayName || WrappedComponent.name;
      // id: string - 你传入 Profiler 组件的 id 属性值（这里是 profilerId）
      // phase: "mount" | "update" - 表示组件是首次挂载("mount")还是更新("update")
      // actualDuration: number - 本次更新实际渲染花费的时间（毫秒）
      // baseDuration:  number - 估计不使用 memoization 的情况下渲染整棵子树需要的时间（毫秒）
      // startTime: number - 本次更新开始渲染的时间戳（performance.now()）
      // commitTime:  number - 本次更新提交的时间戳（performance.now()）
      const onRender = (
        _id: string,
        phase: 'mount' | 'update' | 'nested-update', // 注意这里多了 "nested-update"
        _actualDuration: number,
        baseDuration: number,
        startTime: number,
        commitTime: number
      ) => {
        const base = this.context?.base;

        try {
          const info = base
            ? {
                ...base.getSessionInfo(),
                ...base.actionInfo(),
              }
            : {};
          const component = {
            id: getRandomNumber(32),
            rumType: 'ors_comp',
            name: componentName,
            mark: this.props.orsCompMark || '',
            status: phase,
            baseDuration,
            compStartTime: startTime,
            compEndTime: commitTime,
            ...windowOrs.orsDataInfo.userAttrsInfo,
            ...windowOrs.orsViewAttrs,
            ...info,
          };
          base && base.reportData([component]);
        } catch (error) {
          logReport('WithProfiler', error);
        }
      };

      return createElement(Profiler, { id: profilerId, onRender }, createElement(WrappedComponent, this.props));
    }
  };
}
