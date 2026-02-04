# @ors-sdk/web

## 1.3.7-beta.5

### Patch Changes

- withScope

## 1.3.7-beta.4

### Patch Changes

- 还原 errorSubtype

## 1.3.7-beta.3

### Patch Changes

- fix: 浏览器 api 增加 errorType

## 1.3.7-beta.2

### Patch Changes

- 主动 message 类型修正

## 1.3.7-beta.1

### Patch Changes

- 增量集成&错误标签

## 1.3.7-beta.0

### Patch Changes

- 按需更新配置和集成，支持 react-router-v7

## 1.3.6

### Patch Changes

- 8de2a75: 分离&上报优化
- config 配置接口前采集数据也进行黑名单过滤上报
- fb93b56: fix: 子应用错误上报到主应用
- 4b1ee07: fix: 会话失效重新 SamplingManager.init 修复

## 1.3.6-beta.2

### Patch Changes

- fix: 会话失效重新 SamplingManager.init 修复

## 1.3.6-beta.1

### Patch Changes

- 分离&上报优化

## 1.3.6-beta.0

### Patch Changes

- fix: 子应用错误上报到主应用

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

## 1.3.5-beta.9

### Patch Changes

- 事件加上状态

## 1.3.5-beta.8

### Patch Changes

- 协议去掉 jsonstringify 限制

## 1.3.5-beta.7

### Patch Changes

- fix: 去掉 errorHandler 里面的 trycatch，如果同时接入 sentry 和 ors，回吞掉 sentry 的 errorhandler 错误

## 1.3.5-beta.6

### Patch Changes

- 采集和上报分离

## 1.3.5-beta.5

### Patch Changes

<<<<<<< HEAD

- # 修复时间 NaN 问题
- 采集和上报分离
  > > > > > > > feature-merge-v1.3.5

## 1.3.5-beta.4

### Patch Changes

- BrowserApiError 包装和上报分离，尽早包装

## 1.3.5-beta.3

### Patch Changes

- errorHandler

## 1.3.5-beta.2

### Patch Changes

- 避免采集 sdk 内部日志造成死循环

## 1.3.5-beta.1

### Patch Changes

- 日志采集&dedupe&避免跨域

## 1.3.5-beta.0

### Patch Changes

- 浏览器 api 回调函数错误监控

## 1.3.4

### Patch Changes

- 9b052e8: 配置请求增加浏览器信息
- 0661e9b: 发起 xhr 调整为非单例模式，修复微前端下的 projectId 分发失败的问题
- 2ccf8f1: viewEndTime 更新采用与开始时间统一标准 getC
- 5ecb3e9: 上报协议改为 json，并加入 gzip 压缩请求体
- 737041b: featureFlags 中的配置改为驼峰命名

## 1.3.4-beta.4

### Patch Changes

- viewEndTime 更新采用与开始时间统一标准 getC

## 1.3.4-beta.3

### Patch Changes

- featureFlags 中的配置改为驼峰命名

## 1.3.4-beta.2

### Patch Changes

- 配置请求增加浏览器信息

## 1.3.4-beta.1

### Patch Changes

- 上报协议改为 json，并加入 gzip 压缩请求体

## 1.3.4-beta.0

### Patch Changes

- 发起 xhr 调整为非单例模式，修复微前端下的 projectId 分发失败的问题

## 1.3.3

### Patch Changes

- 3dd4559: 上报前去重合并多个重复 view 数据
- 851ba12: 长任务优化&指标优化
- 1f912fa: 对标 sentry 采集 lcp，cls&performance&request
- bbe8024: sessionStartTime 取整
- 2c4fba8: 长任务优化&console 避免序列化超大对象
- 99cfc54: retry-after
- 4303b46: request 劫持即上报
- 900ac26: fix: 初始化 firstLoad 标识在 domload 后延迟 2s 置为 false
- 9b304d8: 指标采集变更，sdk 去掉指标聚合改为原子指标上报
- 0a7cae7: 长任务优化&any 隐式类型修复
- 0b3290d: fix: 将 view 时间和资源上报时间按统一标准起点计算&初始化不执行路由 change 事件
- 1.3.3

## 1.3.3-beta.10

### Patch Changes

- sessionStartTime 取整

## 1.3.3-beta.9

### Patch Changes

- fix: 初始化 firstLoad 标识在 domload 后延迟 2s 置为 false

## 1.3.3-beta.8

### Patch Changes

- fix: 将 view 时间和资源上报时间按统一标准起点计算&初始化不执行路由 change 事件

## 1.3.3-beta.7

### Patch Changes

- request 劫持即上报

## 1.3.3-beta.6

### Patch Changes

- retry-after

## 1.3.3-beta.5

### Patch Changes

- 上报前去重合并多个重复 view 数据

## 1.3.3-beta.4

### Patch Changes

- 对标 sentry 采集 lcp，cls&performance&request

## 1.3.3-beta.3

### Patch Changes

- 长任务优化&指标优化

## 1.3.3-beta.2

### Patch Changes

- 长任务优化&console 避免序列化超大对象

## 1.3.3-beta.1

### Patch Changes

- 长任务优化&any 隐式类型修复

## 1.3.3-beta.0

### Patch Changes

- 指标采集变更，sdk 去掉指标聚合改为原子指标上报

## 1.3.2

### Patch Changes

- 84a8b8f: 修复 resource 默认采样率不命中问题
- fac39ff: 修复请求上报如果有忽略项，匹配不正确的问题
- 1.3.2 版本
- d1a74a1: vue 路由聚合按具名路由 name 优先取值
- 2a4faef: 1.fetch 优化

  2.增加 http 协议版本号

  3.去掉 body 采集

  4.为了兼容 react-router-v5 路由中的各种特殊配置，降级 path-to-regex 到 4 版本一下（官方文档有提及

  5.页面隐藏加载时，不上报异常的 fp 和 fcp 数据

  6.增加 beforeSend 配置，业务方可以自定义过滤数据上报

  7.捕获 Promise.reject 的字符串消息时，不再将字符串作为堆栈信息传入后端

  8.去除 error 对象中消息为空时采用'未采集到错误信息'兜底上报；去除 error 对象中的堆栈数据为空时采用'未采集到错误堆栈信息'兜底上报

- 1.3.2

## 1.3.2-beta.4

### Patch Changes

- 1.3.2 版本

## 1.3.2-beta.3

### Patch Changes

- vue 路由聚合按具名路由 name 优先取值

## 1.3.2-beta.1

### Patch Changes

- 修复 resource 默认采样率不命中问题

## 1.3.1

### Patch Changes

- f778f31: 优化 perfromance 指标 fp，fcp 监听取值
- fp,fcp 指标 observer 监听，多例模式监听，v6
- 12d2a6c: fp fcp 监听取值
- a2b5f0c: 修复微前端集成中错误堆栈获取失败的问题
- fp,fcp 指标采集 observer,多例模式监听，v6z

## 1.3.1-beta.3

### Patch Changes

- fp,fcp 指标采集 observer,多例模式监听，v6z

## 1.3.0

### Minor Changes

- b8a7126: 增加微前端框架能力的支持

### Patch Changes

- 6b2af21: 优化 vue 框架的路由匹配规则，优化微应用集成时全局变量同步
- fb0b4a6: 规范 log 日志输出
- 80caaf1: error 如果没有文件名，则增加堆栈的解析
- e78a0c5: 优化导出方式
- b0d6eab: 动态更新 view 相关的信息
- 8314caa: 处理路由跳转时的加载时长 duration
- 微前端支持&问题修复
- 9dd8373: 优化类型提示，增加 react 路由集成传入数据合法性校验
- 2ce70a9: error 对象文件名优先取堆栈解析的文件名
- 190d5ba: 优化初始化微应用集成的逻辑，增加 windowOrs 的挂载点
- 4b930ab: observeVitals 方法判断对象 key 是否存在 options.name,应该改为变量
- 36e0db0: 优化 vue 错误监听，修复路由集成的问题
- a00ba76: performance 采集与 view 采集解耦，放到 init 中
- adb8899: 优化 vue 路由集成的匹配规则逻辑
- 429e937: 优化加载子应用集成时，手动更新 viewName 的逻辑判断

## 1.3.0-beta.13

### Patch Changes

- observeVitals 方法判断对象 key 是否存在 options.name,应该改为变量

## 1.3.0-beta.12

### Patch Changes

- 处理路由跳转时的加载时长 duration

## 1.3.0-beta.9

### Patch Changes

- 规范 log 日志输出

## 1.3.0-beta.8

### Patch Changes

- performance 采集与 view 采集解耦，放到 init 中

## 1.2.2

### Patch Changes

- initMonitor 中监听 view 采集事件，避免 onload 事件不触发

## 1.2.1

### Patch Changes

- 错误过滤&稳定性问题修复
- d19dac7: 过滤错误增加正则匹配

## 1.2.1-beta.0

### Patch Changes

- 过滤错误增加正则匹配

## 1.2.0-beta.3

### Minor Changes

- 2fbbe61: 修复若干业务问题&vue 分包
- 61b506d: 使用 iife 方式在构建时才将所有方法挂载在全局 window

### Patch Changes

- 1093cdc: view 监听路由事件时延迟绑定事件，以便获取
- 221c8ea: 路由聚合功能
- 02e3839: 修复业务若干问题
- d7af5a5: cls 取值换算&beforeEach next 调整位置
- d7af5a5: 去掉 frompoint polufill 和若干优化
- eb94a60: 监听路由默认取值 document.title
- 2fbbe61: 修复若干业务问题&vue 分包
- c4606ef: 解决 vue 项目初始化刷新页面采集不到 router 信息问题

## 1.1.4

- 解决 vue 项目初始化刷新页面采集不到 router 信息问题
- view 监听路由事件时延迟绑定事件，以便获取
- 监听路由默认取值 document.title
- cls 取值换算&beforeEach next 调整位置
- 去掉 frompoint polufill 和若干优化
- 路由聚合功能