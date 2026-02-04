# @ors-sdk/vue

## 1.3.7-beta.5

### Patch Changes

- withScope
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.5

## 1.3.7-beta.4

### Patch Changes

- 还原 errorSubtype
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.4

## 1.3.7-beta.3

### Patch Changes

- fix: 浏览器 api 增加 errorType
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.3

## 1.3.7-beta.2

### Patch Changes

- 主动 message 类型修正
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.2

## 1.3.7-beta.1

### Patch Changes

- 增量集成&错误标签
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.1

## 1.3.7-beta.0

### Patch Changes

- 按需更新配置和集成，支持 react-router-v7
- Updated dependencies
  - @ors-sdk/web@1.3.7-beta.0

## 1.3.6

### Patch Changes

- 8de2a75: 分离&上报优化
- config 配置接口前采集数据也进行黑名单过滤上报
- 4b1ee07: fix: 会话失效重新 SamplingManager.init 修复
- Updated dependencies [8de2a75]
- Updated dependencies
- Updated dependencies [fb93b56]
- Updated dependencies [4b1ee07]
  - @ors-sdk/web@1.3.6

## 1.3.6-beta.2

### Patch Changes

- fix: 会话失效重新 SamplingManager.init 修复
- Updated dependencies
  - @ors-sdk/web@1.3.6-beta.2

## 1.3.6-beta.1

### Patch Changes

- 分离&上报优化
- Updated dependencies
  - @ors-sdk/web@1.3.6-beta.1

## 1.3.6-beta.0

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.6-beta.0

## 1.3.5

### Patch Changes

- 694f7df: 协议去掉 jsonstringify 限制
- e0bae2e: 事件加上状态
- 2fadb29: 避免采集 sdk 内部日志造成死循环
- b338367: 采集和上报分离
- b338367: 采集和上报分离
- caeec41: fix: 去掉 errorHandler 里面的 trycatch，如果同时接入 sentry 和 ors，回吞掉 sentry 的 errorhandler 错误
- a12415d: 浏览器 api 回调函数错误监控
- 077cf4c: 日志采集&dedupe&避免跨域
- 9e283a4: 修复时间 NaN 问题
- 7013c64: BrowserApiError 包装和上报分离，尽早包装
- d231ca6: errorHandler
- 浏览器 api 错误采集
- Updated dependencies [694f7df]
- Updated dependencies [e0bae2e]
- Updated dependencies [2fadb29]
- Updated dependencies [b338367]
- Updated dependencies [b338367]
- Updated dependencies [caeec41]
- Updated dependencies [a12415d]
- Updated dependencies [077cf4c]
- Updated dependencies [9e283a4]
- Updated dependencies [7013c64]
- Updated dependencies [d231ca6]
- Updated dependencies
  - @ors-sdk/web@1.3.5

## 1.3.5-beta.9

### Patch Changes

- 事件加上状态
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.9

## 1.3.5-beta.8

### Patch Changes

- 协议去掉 jsonstringify 限制
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.8

## 1.3.5-beta.7

### Patch Changes

- fix: 去掉 errorHandler 里面的 trycatch，如果同时接入 sentry 和 ors，回吞掉 sentry 的 errorhandler 错误
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.7

## 1.3.5-beta.6

### Patch Changes

- 采集和上报分离
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.6

## 1.3.5-beta.5

### Patch Changes

<<<<<<< HEAD

- # 修复时间 NaN 问题
- 采集和上报分离
  > > > > > > > feature-merge-v1.3.5
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.5

## 1.3.5-beta.4

### Patch Changes

- BrowserApiError 包装和上报分离，尽早包装
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.4

## 1.3.5-beta.3

### Patch Changes

- errorHandler
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.3

## 1.3.5-beta.2

### Patch Changes

- 避免采集 sdk 内部日志造成死循环
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.2

## 1.3.5-beta.1

### Patch Changes

- 日志采集&dedupe&避免跨域
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.1

## 1.3.5-beta.0

### Patch Changes

- 浏览器 api 回调函数错误监控
- Updated dependencies
  - @ors-sdk/web@1.3.5-beta.0

## 1.3.4

### Patch Changes

- 9b052e8: 配置请求增加浏览器信息
- 5ecb3e9: 上报协议改为 json，并加入 gzip 压缩请求体
- 737041b: featureFlags 中的配置改为驼峰命名
- Updated dependencies [9b052e8]
- Updated dependencies [0661e9b]
- Updated dependencies [2ccf8f1]
- Updated dependencies [5ecb3e9]
- Updated dependencies [737041b]
- Updated dependencies
  - @ors-sdk/web@2.0.0

## 1.3.4-beta.4

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.4-beta.4

## 1.3.4-beta.3

### Patch Changes

- featureFlags 中的配置改为驼峰命名
- Updated dependencies
  - @ors-sdk/web@1.3.4-beta.3

## 1.3.4-beta.2

### Patch Changes

- 配置请求增加浏览器信息
- Updated dependencies
  - @ors-sdk/web@1.3.4-beta.2

## 1.3.4-beta.1

### Patch Changes

- 上报协议改为 json，并加入 gzip 压缩请求体
- Updated dependencies
  - @ors-sdk/web@1.3.4-beta.1

## 1.3.4-beta.0

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.4-beta.0

## 1.3.3

### Patch Changes

- 3dd4559: 上报前去重合并多个重复 view 数据
- 851ba12: 长任务优化&指标优化
- 1f912fa: 对标 sentry 采集 lcp，cls&performance&request
- 2c4fba8: 长任务优化&console 避免序列化超大对象
- 99cfc54: retry-after
- 4303b46: request 劫持即上报
- 9b304d8: 指标采集变更，sdk 去掉指标聚合改为原子指标上报
- 0a7cae7: 长任务优化&any 隐式类型修复
- 0b3290d: fix: 将 view 时间和资源上报时间按统一标准起点计算&初始化不执行路由 change 事件
- 1.3.3
- Updated dependencies [3dd4559]
- Updated dependencies [851ba12]
- Updated dependencies [1f912fa]
- Updated dependencies [bbe8024]
- Updated dependencies [2c4fba8]
- Updated dependencies [99cfc54]
- Updated dependencies [4303b46]
- Updated dependencies [900ac26]
- Updated dependencies [9b304d8]
- Updated dependencies [0a7cae7]
- Updated dependencies [0b3290d]
- Updated dependencies
  - @ors-sdk/web@1.3.3

## 1.3.3-beta.10

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.10

## 1.3.3-beta.9

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.9

## 1.3.3-beta.8

### Patch Changes

- fix: 将 view 时间和资源上报时间按统一标准起点计算&初始化不执行路由 change 事件
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.8

## 1.3.3-beta.7

### Patch Changes

- request 劫持即上报
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.7

## 1.3.3-beta.6

### Patch Changes

- retry-after
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.6

## 1.3.3-beta.5

### Patch Changes

- 上报前去重合并多个重复 view 数据
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.5

## 1.3.3-beta.4

### Patch Changes

- 对标 sentry 采集 lcp，cls&performance&request
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.4

## 1.3.3-beta.3

### Patch Changes

- 长任务优化&指标优化
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.3

## 1.3.3-beta.2

### Patch Changes

- 长任务优化&console 避免序列化超大对象
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.2

## 1.3.3-beta.1

### Patch Changes

- 长任务优化&any 隐式类型修复
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.1

## 1.3.3-beta.0

### Patch Changes

- 指标采集变更，sdk 去掉指标聚合改为原子指标上报
- Updated dependencies
  - @ors-sdk/web@1.3.3-beta.0

## 1.3.2

### Patch Changes

- 84a8b8f: 修复 resource 默认采样率不命中问题
- 1.3.2 版本
- d1a74a1: vue 路由聚合按具名路由 name 优先取值
- 1.3.2
- Updated dependencies [84a8b8f]
- Updated dependencies [fac39ff]
- Updated dependencies
- Updated dependencies [d1a74a1]
- Updated dependencies [2a4faef]
- Updated dependencies
  - @ors-sdk/web@1.3.2

## 1.3.2-beta.4

### Patch Changes

- 1.3.2 版本
- Updated dependencies
  - @ors-sdk/web@1.3.2-beta.4

## 1.3.2-beta.3

### Patch Changes

- vue 路由聚合按具名路由 name 优先取值
- Updated dependencies
  - @ors-sdk/web@1.3.2-beta.3

## 1.3.2-beta.1

### Patch Changes

- 修复 resource 默认采样率不命中问题
- Updated dependencies
  - @ors-sdk/web@1.3.2-beta.1

## 1.3.1

### Patch Changes

- fp,fcp 指标 observer 监听，多例模式监听，v6
- fp,fcp 指标采集 observer,多例模式监听，v6z
- Updated dependencies [f778f31]
- Updated dependencies
- Updated dependencies [12d2a6c]
- Updated dependencies [a2b5f0c]
- Updated dependencies
  - @ors-sdk/web@1.3.1

## 1.3.1-beta.3

### Patch Changes

- fp,fcp 指标采集 observer,多例模式监听，v6z
- Updated dependencies
  - @ors-sdk/web@1.3.1-beta.3

## 1.3.0

### Minor Changes

- b8a7126: 增加微前端框架能力的支持

### Patch Changes

- 6b2af21: 优化 vue 框架的路由匹配规则，优化微应用集成时全局变量同步
- 80caaf1: error 如果没有文件名，则增加堆栈的解析
- b0d6eab: 动态更新 view 相关的信息
- 微前端支持&问题修复
- 9dd8373: 优化类型提示，增加 react 路由集成传入数据合法性校验
- 2ce70a9: error 对象文件名优先取堆栈解析的文件名
- 190d5ba: 优化初始化微应用集成的逻辑，增加 windowOrs 的挂载点
- 36e0db0: 优化 vue 错误监听，修复路由集成的问题
- a00ba76: performance 采集与 view 采集解耦，放到 init 中
- adb8899: 优化 vue 路由集成的匹配规则逻辑
- 429e937: 优化加载子应用集成时，手动更新 viewName 的逻辑判断
- Updated dependencies [6b2af21]
- Updated dependencies [fb0b4a6]
- Updated dependencies [b8a7126]
- Updated dependencies [80caaf1]
- Updated dependencies [e78a0c5]
- Updated dependencies [b0d6eab]
- Updated dependencies [8314caa]
- Updated dependencies
- Updated dependencies [9dd8373]
- Updated dependencies [2ce70a9]
- Updated dependencies [190d5ba]
- Updated dependencies [4b930ab]
- Updated dependencies [36e0db0]
- Updated dependencies [a00ba76]
- Updated dependencies [adb8899]
- Updated dependencies [429e937]
  - @ors-sdk/web@1.3.0

## 1.3.0-beta.13

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.0-beta.13

## 1.3.0-beta.12

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.0-beta.12

## 1.3.0-beta.9

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.3.0-beta.9

## 1.3.0-beta.8

### Patch Changes

- performance 采集与 view 采集解耦，放到 init 中
- Updated dependencies
  - @ors-sdk/web@1.3.0-beta.8

## 1.2.2

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.2.2

## 1.2.1

### Patch Changes

- 错误过滤&稳定性问题修复
- Updated dependencies
- Updated dependencies [d19dac7]
  - @ors-sdk/web@1.2.1

## 1.2.1-beta.0

### Patch Changes

- Updated dependencies
  - @ors-sdk/web@1.2.1-beta.0

## 1.2.0-beta.3

- 2fbbe61: 修复若干业务问题&vue 分包