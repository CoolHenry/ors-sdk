# sdk 介绍

前端 web-sdk 监控

# sdk 接入指南

## npm 包方式（ES Module）

pnpm install @ors-sdk/web -S  
 在 main.ts 中引入导入 sdk  
 import { createApp } from 'vue'  
 import ORS from '@ors-sdk/web'  
 const app = createApp(App)  
 ORS.initObserve({  
 name: ORS, // 项目名称 必填  
 version: '1.0.0', // 项目版本 必填  
 projectId: 13100002, // 项目 Id, 有项目自动生成 必填  
 env:TEST, // 采集的环境 必填  
 reportUrl: 'https://ors.msxf.com/collector/v1/traces/rum' // 如果在生产环境采集非生产环境，则这个地址一定要写  
 },app)

## CDN 方式接入(UMD)

在 index.html 中引入 cdn 地址

  <script src="http://static.msxf.test/ors-sdk/1.0.9/index-1.0.9.js"></script>

在 main.ts 中初始化的方法  
 window.\_ors.initObserve({  
 name: 'ORS', // 项目名称 必填  
 version: '1.0.0', // 项目版本 必填  
 projectId:13100002, // 项目 Id,由项目自动生成 必填  
 env:'PROD' //项目环境，如果生产环境采集生产环境，则不需要写 reportUrl 必填  
 },app)

## 详细接入流程参考文档

https://weikezhijia.feishu.cn/docx/Qo3rdnmaeos5pfxkVcvcBfuxnes

# sdk 版本说明

## v1.1.3

- 初始化调整 getBridgeData 方法位置，打通 APP 和 web 端数据
- 获取 view 数据时，优化取 url 值逻辑，避免取不到值场景
- 配置管理-黑名单设置匹配规则问题
- 优化 ts 和 eslint 不规范问题
- 初始化接入参数去掉 env 标识，增加 server 字段决定上报平台环境
- 支持镜花缘环境自定义设置上报地址

## v1.1.2

- 兼容处理 webpack4 尝试从 commonjs 模块中提取命名导出，但 react16.x 没有真正的命名导出所以，会导致无法解析 import { createElement }
- 增加 prepublishOnly": "ln -sf lib/react react，构建前建立软连接，files 增加 react 文件，以兼容 webpack4 解析器不识别包文件 exports 方式导入,多加 lib 路径引入问题
- 事件采集开始时间计算方式有误 actionStartTime: highTime(performance.timing.navigationStart + event.timeStamp),
- lib 产物输出 esm 格式替换 mjs 格式来兼容部分构建工具不支持 mjs 解析，同时输出 umd 格式
- whiteScreen 检测获取 dom 节点 getSelector 方法增加获取元素 className 可选链判断
- 上报策略去掉 localstorage 存储能力，改用文档卸载前使用 sendBeacon 方式传输兜底
- actionStartTime 计算方式调整为 performance.timing.navigationStart + event.timeStamp
- 修复上报时多个点击事件开始时间相同的问题
- 修复 401 错误状态码也上报 200 问题
- 增加 userAgent 上报
- sdk 构建文件中增加 d.ts 类型文件输出

## v1.1.1

- 适配 React 应用场景监测，将项目架构调整为分包模式
- 适配 React 应用场景监测，添加错误边界 ErrorBoundary
- 适配 React 应用场景监测，添加组件性能监控 Profile
- 修复 performance.getEntriesByName 兼容问题
- 修复 performance.getEntriesByType 兼容问题
- 修复 sessionInfo.storedSessionId 取值为 undefined 问题
- 修复 document.elementsFromPoint 兼容问题
- IndexDB 存储优化,解决 localstorage 缓存爆栈问题

## v1.1.0

- 修复第一次进入页面或者刷新的时候会产生 2 个 pv 的问题
- 添加日志主动错误上报的方法
- 调整资源延时的时间
- 调整优化完资源采集
- 若干优化

## v1.0.9

- 新增组件性能功能
  错误对应到相应的组件
  使用示例:
  window.\_ors.initObserve({
  name: 'ORS',
  version: '1.0.1',
  projectId: 13100067,
  env:'TEST',
  plugins:{
  componentMonitor: true // 使用这个功能的话，需要将这个字段置为 true
  },
  frameInfo:{
  frameType: 'vue', // 框架类型
  frameVersion:3, // 框架版本，当前的是 vue3 的版本，vue2 的版本，这个地方就写个 2
  instance: app, // 实例 vue2 的是 vue, vue3 的是 app
  curCompInstance: getCurrentInstance // vue2 的话不用传，默认用的 this，vue3 需要单独导出 import { getCurrentInstance } from 'vue'
  }
  })
  并且需要给对应的组件设置属性 orsCompMonitor='true'
  过滤 Alipay 内核的浏览器上报
  资源上报过滤 chrome 51 版本的资源上报

## v1.0.8

- 新增白屏检测功能  
  使用示例:  
  window.\_ors.initObserve({  
   name: 'ORS',  
   version: '1.0.1',  
   projectId: 13100067,  
   env:'TEST',  
   plugins:{  
   blankScreen:{  
   autoDetect:true,  
   rootSelector:['#app'], // 根元素选择器  
   }  
   },  
  },app)
- 新增监控自毁机制，如果采集到自身 trycatch 错误出错三次，将会自动销毁采集监控，降低对业务的影响

## v1.0.7

- 新增用户会话采样开关以及采样率配置  
   控制 view resource action 的采样  
   eg: 用户会话采样关闭,view resource action 的采集器均不初始化  
   采样开启,view resource action 的采集器按照采样率进行初始化
- 新增网络请求采样开关以及采样率配置  
   网络请求采样率受用户会话影响，用户会话采样为第一优先级，用户会话开启，网络请求采样才会生效  
   网络请求采样分为正常网络请求配置与错误网络请求配置，根据不同的配置进行采样
- 新增 JS 错误采样率开关  
   是否采集 JS 错误的开关
- 新增长任务采样率开关  
   是否采集长任务的开关
- 新增 trace 前后端打通功能以及采样开关、采样率  
  trace 采样受用户会话和 resource 的采样影响  
  为每一个网络请求的 header 头加上 X-ORS-TxId  
  X-ORS-TxId 是否添加到 header 头上受采样开关以及采样率的影响
- 新增 sdk 错误日志上报
- 新增用户配置项  
  请求的 body 体是否采集，默认为采集，可手动配置关闭  
  vueConsoleError 是否在控制台输出,默认关闭可手动打开
- 优化多个相同请求时，只取第一个请求的性能数据
- 优化错误信息为空的时候，默认展示:未采集到错误信息
- 优化错误堆栈信息为空的时候，默认展示:未采集到错误堆栈信息

## v1.0.6

- 区分网络和静态资源  
  resource.netType:api(接口请求)、 static(静态)
- 网络请求的 body 体  
   resource.body
- 新增采集公共指标  
  custom.tags：自定义标签字段
- 新增页面采集指标  
  view.loadProcess: 页面加载过程 (unload、redirect、appCache、dns、tcp、request、response、processing、onload)  
  view.request.duration: 页面请求用时  
  view.response.duration: 响应用时  
  view.dns.duration：页面 DNS 时间  
  view.ssl.duration: 页面 ssl 时间  
  view.tcp.duration: 页面 TCP 时间

## v1.0.5

- 修改上报 URL 规则  
   优先以初始化 sdk 传入的 reportUrl  
   其次根据初始化 sdk 传入的 env，传入的 PROD,则用生产的上报地址，PREPROD,则用准生产的上报地址，其它的用测试环境的上报地址  
   最后使用默认的环境变量打包生成的上报地址
- 修改采样率的环境配置地址优先按照 env 进行区分
- 增加 npm 包方式发布
- 编译文件添加后缀名

## v1.0.4

- 修改上报策略
- 错误立即上报
- 大于或等于 50 条立即上报
- 闲时 1s 上报
- 兼容 load 之后加载无初始化 observer 类的场景

## v1.0.3

- 新增 hybrid 场景下：新增 instanceId createTime 字段
- 新增自定义上报接口
- 新增采样率

## v1.0.2

- 全局变量名 window.ors 替换为 window.\_ors
- 所有采集上新增 action.id

## v1.0.1

- APP 与 H5 打通数据交互
- 新增重定向耗时时间的采集 redictTime

## v1.0.0

- 网络属性、
- 系统版本、
- web 性能的采集、
- resource 的采集、
- error 的采集、
- Long Task 的采集、
- action 的采集
- FMP 的指标

https://weikezhijia.feishu.cn/docx/U312dCNjwonoo9x3KsfcXSGunwb