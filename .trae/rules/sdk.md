---
alwaysApply: false
---
前端埋点项目规则
1. 文件与目录命名

文件名统一使用 kebab-case（小写 + 连字符），如：tracked-button.tsx

目录名统一使用 camelCase，如：components/trackedButton/

组件文件统一以组件名命名，index.tsx 用于导出组件

类型文件统一放在 types/ 目录，eventMap.ts、trackerConfig.ts 等

2. 类型与 TS 规范

禁止使用 any，统一使用 unknown + 类型断言，或严格定义接口

所有埋点事件必须定义在 EventMap 中

trackEvent<K extends keyof EventMap>(event: K, params: EventMap[K]) 必须保证 event 与 params 一一对应

枚举类型或常量字段必须在 TS 静态检查阶段发现错误

所有公共函数、组件和参数必须明确类型声明

3. 组件封装规范

复用组件必须封装好埋点逻辑，如：

TrackedButton：按钮点击自动上报事件

TrackedForm：表单提交自动上报事件

页面或 hook 自动上报 PV/UV

业务侧调用组件时不允许手动写埋点逻辑，减少重复

封装组件需支持事件参数传入，但必须符合 EventMap 类型约束

4. SDK 与上报规则

支持队列管理：

批量上报间隔默认 5 秒

关键事件立即上报

上报接口需封装为统一方法，业务调用时只需传入 trackEvent

运行时参数不匹配时 console.warn，保证 TS 静态类型检查为主

SDK 尽量支持动态配置事件定义，避免每次新增事件都发布新版本

5. 代码规范

使用 ESLint + Prettier，统一代码风格

避免硬编码 URL、事件名、字段名

函数长度不超过 50 行，保持单一职责

异常与错误统一处理，并记录到 console 或日志服务

6. 测试规范

核心 SDK 功能必须覆盖单元测试

trackEvent 类型约束测试

队列批量上报逻辑

关键事件立即上报

组件封装需提供 可触发事件的单元测试

使用 Mock API 模拟上报，保证开发阶段可验证埋点

7. 文档与示例

所有事件必须在 README.md 或文档中定义：事件名、参数、描述、触发时机

提供业务示例页面，演示按钮点击、页面 PV、表单提交自动上报

8. 其他工程化要求

所有工具函数和 SDK 方法必须有 JSDoc 注释

所有网络请求/上报应支持 可替换的 Mock

所有日期、时间统一使用 UTC

不允许在业务层直接依赖第三方埋点库，如：Google Analytics、Facebook Pixel 等

所有埋点逻辑必须在 SDK 中实现，业务层仅调用 SDK 方法