# sdk-sample

[![npm version](https://img.shields.io/npm/v/sdk-sample.svg)](https://www.npmjs.com/package/sdk-sample)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)

一个轻量级、高性能的前端埋点/追踪 SDK。支持自动与手动埋点、动态事件协议（IDL/JSON）、多种上报策略（XHR/Beacon/Image），并提供开箱即用的 React Hooks 与 UI 组件封装。

## 特性

- 🚀 **轻量高效**：基于原生 JS 实现核心逻辑，无冗余依赖。
- 📦 **React 集成**：提供 `TrackerProvider`、Hooks (`usePageView`, `useExposure` 等) 与高阶组件。
- 🛡 **类型安全**：完全 TypeScript 编写，支持事件参数类型推导。
- ⚡ **智能上报**：支持批量发送、离线缓存、高优先级事件立即上报。
- 🔌 **动态协议**：支持运行时加载远程事件定义 (JSON Schema)，动态扩展业务事件。
- 👁 **自动采集**：开箱即用的 PV、点击、错误、性能指标自动采集。

## 安装

使用 npm 或 yarn 安装：

```bash
npm install sdk-sample react react-dom
# 或者
yarn add sdk-sample react react-dom
```

> **注意**：本 SDK 依赖 React 18+ 环境。

## 快速开始

### 1. 初始化 Provider

在应用的根组件中包裹 `TrackerProvider` 并配置上报端点：

```tsx
import { TrackerProvider } from 'sdk-sample';

function App() {
  return (
    <TrackerProvider config={{ 
      endpoint: 'https://api.your-domain.com/track', // 上报接口地址
      autoTrack: true,                               // 开启全自动埋点
      debug: process.env.NODE_ENV === 'development'  // 开发模式下开启调试日志
    }}>
      <YourAppContent />
    </TrackerProvider>
  );
}
```

### 2. 使用 Hooks 埋点

在组件中通过 Hooks 轻松上报事件：

```tsx
import { useTracker, usePageView, useExposure } from 'sdk-sample';

const ProductCard = ({ product }) => {
  // 1. 自动上报组件曝光（进入视口开始计时，离开视口或卸载时上报）
  const cardRef = useExposure(product.id, 'ProductCard');

  // 2. 获取 tracker 实例进行手动上报
  const tracker = useTracker();

  const handleBuy = () => {
    // 3. 上报高优先级事件（第三个参数 true 表示立即发送）
    tracker.trackEvent('purchase', {
      orderId: 'ORD-123',
      amount: 99.9,
      currency: 'USD',
      items: [product.id]
    }, true);
  };

  return (
    <div ref={cardRef}>
      <h3>{product.name}</h3>
      <button onClick={handleBuy}>Buy Now</button>
    </div>
  );
};
```

## API 文档

### React Hooks

| Hook | 说明 | 参数 |
|------|------|------|
| `useTracker()` | 获取 Tracker 实例 | - |
| `usePageView(title?)` | 组件挂载时上报 PV | `title`: 页面标题（可选） |
| `usePageStay()` | 组件卸载时上报页面停留时长与滚动深度 | - |
| `useExposure(id, name)` | 元素曝光监测 | `id`: 唯一标识, `name`: 组件名称 |

### UI 组件

SDK 提供了几个封装好的组件，用于简化常见的埋点场景：

```tsx
import { TrackedButton, TrackedPage } from 'sdk-sample';

// 自动上报 PV
<TrackedPage pageTitle="Home Page">
  {/* 点击自动上报 buttonClick 事件 */}
  <TrackedButton 
    buttonName="Submit Order" 
    eventId="btn_submit_01"
    extraParams={{ source: 'header' }}
  >
    Submit
  </TrackedButton>
</TrackedPage>
```

### 动态事件协议 (Schema)

支持从服务端加载事件定义，实现动态校验与扩展：

```ts
const tracker = useTracker();

// 加载远程配置
tracker.loadSchema({
  version: '2.0.0',
  events: {
    custom_promo_click: {
      priority: 'high',
      params: { promoId: { type: 'string' } }
    }
  }
});

// 使用动态定义的事件
tracker.trackEvent('custom_promo_click', { promoId: 'SUMMER_SALE' });
```

## 配置项

`TrackerProvider` 接受的 `config` 对象属性：

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `endpoint` | `string` | (必填) | 接收埋点数据的后端 API 地址 |
| `autoTrack` | `boolean` | `false` | 是否自动采集 PV、点击、错误、性能数据 |
| `debug` | `boolean` | `false` | 调试模式，开启后会在控制台打印日志并抛出校验错误 |

## 目录结构

详细的 Monorepo 结构说明请参考 DeepWiki 文档：[Monorepo Structure | echo-cqy/sdkSample | DeepWiki](https://deepwiki.com/echo-cqy/sdkSample/1.1-monorepo-structure)

```text
sdk-sample/
├── dist/                  # 打包产物 (ESM/UMD/Types)
├── src/
│   ├── components/        # UI 组件 (TrackedButton 等)
│   ├── sdk/               # 核心逻辑 (Tracker, Queue, Strategy)
│   ├── types/             # 类型定义
│   └── index.ts           # 入口文件
└── package.json
```

## License

MIT © [Your Name/Organization]
