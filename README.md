# ORS-SDK 项目总览

本项目开发需要配置`node22` + `pnpm@10` 环境，整体使用`monorepo`架构进行开发，子包在`packages`目录下：

`core`：web 端的整体逻辑
`react`：基于 web 端扩展，支持`react`中的组件

## 本地开发

执行 `pnpm run example:dev` 可以打开 web 网页进行本地调试

## 发布流程

### 常规发布

1. 执行 `pnpm run changeset`，交互式生成`changelog`，并且指定当前更新是`patch`、`minor`、`major`，此步骤完成后会在`.changeset`目录下，生成更新内容的`markdown`文档（此文档可以修改）， 注意：此命令可以多次执行。

2. 执行`pnpm run version`，消费`.changeset`目录下所有的`markdown`日志文档，并自动此次改动相关包的版本号以及`changelog`日志。

3. 根据`git`修改记录，核对版本号、改动日志是否符合预期，如果不符合可以直接修改对应文件。

4. 执行`pnpm run release`进行发布

### 预发布版本

> 预发布版本包括 `alpha`、`beta`、`rc`等版本，此处我们以发布`beta`版本为例

1. 执行`pnpm changeset pre enter beta`，进入预发布模式。

2. 执行常规发布流程

3. 如果预发布版本没问题，执行`pnpm changeset pre exit`退出预发布模式