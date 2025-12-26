# sdk-sample

一个轻量的前端埋点/追踪 SDK，支持自动与手动埋点、动态事件协议（IDL/JSON）、三种上报策略（`xhr`/`beacon`/`img`），并提供 React Hooks 与基础 UI 组件封装，便于快速集成到业务应用。

## 安装

```bash
npm i sdk-sample react react-dom
# 或使用组织 scope（若你以组织发布）：
# npm i @your-scope/sdk-sample
```

> 该包声明了 `peerDependencies`，需要在业务侧安装 `react` 与 `react-dom` (^18)。

## 快速开始

在应用根部包裹 Provider，配置服务端上报地址与行为：

```tsx
import { TrackerProvider } from 'sdk-sample';

<TrackerProvider config={{ 
  endpoint: '/api/track',   // 你的接收接口
  autoTrack: true,          // 自动埋点（PV/点击/错误/性能）
  debug: false              // 生产建议关闭（安全模式，错误仅告警）
}}>
  <App />
</TrackerProvider>
```

获取追踪实例并手动埋点：

```tsx
import { useTracker } from 'sdk-sample';

const tracker = useTracker();

// 页面曝光
tracker.trackEvent('pageView', { pageTitle: 'Home', referrer: document.referrer });

// 业务事件（高优先级可立即发送）
tracker.trackEvent('purchase', { orderId: '123', amount: 199, currency: 'USD', items: [] }, true);
```

## React Hooks

- `useTracker()`：获取 `Tracker` 实例（需在 `TrackerProvider` 内使用）
- `usePageView(pageTitle?)`：组件挂载时上报 `pageView`
- `usePageStay()`：组件卸载时上报停留时长与滚动深度（`pageStay`）
- `useExposure(elementId, componentName)`：返回 `ref`，元素可视时计时，离开或卸载时上报 `exposure`

示例：

```tsx
import { usePageView, usePageStay, useExposure } from 'sdk-sample';

const Page = () => {
  usePageView('Home');
  usePageStay();
  const bannerRef = useExposure('promo-001', 'Home Banner');
  return <div ref={bannerRef}>Banner</div>;
};
```

## UI 组件

- `TrackedPage`：挂载时自动 `pageView`
- `TrackedButton`：点击自动 `buttonClick`
- `TrackedForm`：提交自动 `formSubmit`

示例：

```tsx
import { TrackedPage, TrackedButton, TrackedForm } from 'sdk-sample';

<TrackedPage pageTitle="Product">
  <TrackedButton buttonName="Add to Cart" eventId="btn-add-cart">Add</TrackedButton>
  <TrackedForm formId="subscribe" onSubmit={() => alert('OK')}>
    <input name="email" type="email" required />
    <button type="submit">Submit</button>
  </TrackedForm>
</TrackedPage>
```

## 动态事件协议（Schema）

支持在运行时加载远端事件协议，用于参数校验与类型安全：

```ts
import { useTracker } from 'sdk-sample';

const tracker = useTracker();

tracker.loadSchema({
  version: '1.1.0',
  events: {
    dynamic_promo_click: {
      priority: 'high',
      params: { promoId: { type: 'string' }, location: { type: 'string' } }
    }
  }
});

// 加载后即可上报动态事件
tracker.trackEvent('dynamic_promo_click', { promoId: '001', location: 'home-banner' });
```

## 类型与事件

- 已内置常见事件：`pageView`、`pageStay`、`exposure`、`buttonClick`、`formSubmit`、`purchase`、`performance`、`error`
- 强类型事件映射：`EventMap`（从 `EventSchema` 推导），示例：

```ts
import type { EventMap } from 'sdk-sample';
const pvParams: EventMap['pageView'] = { pageTitle: 'Home', referrer: '' };
```

## 上报策略与队列

- 策略：`xhr`（默认）、`beacon`、`img`
- 队列：批量发送，达到一定数量或间隔触发；高优先级事件（如 `purchase`）立即发送

> 服务端建议支持 `POST application/json`，接收批量数组数据（每条包含 `eventName`、`timestamp`、`url`、`userAgent` 及事件参数）。

## 配置

`TrackerProvider` 的 `config`：

- `endpoint: string`：数据上报地址
- `autoTrack?: boolean`：是否开启自动埋点（PV/点击/错误/性能）
- `debug?: boolean`：调试模式，`true` 时错误抛出；`false`（生产）仅警告

## 构建与入口

- ESM：`dist/sdk-sample.js`
- UMD（CommonJS require）：`dist/sdk-sample.umd.cjs`
- 类型声明：`dist/index.d.ts`（包含全部导出）
- `package.json` 已配置 `exports`、`main`、`module` 与 `types`

## 版本与兼容性

- 运行环境：现代浏览器（支持 `IntersectionObserver` 优化曝光；老环境可自行 polyfill）
- React：`^18`

## 目录说明（仓库内）

- SDK 源码：`src/sdk`（核心逻辑与 Hooks）
- 组件封装：`src/components`
- 对外入口：`src/index.ts`（统一导出）
- 构建产物：`dist`（发布内容）

## License

按你发布时选用的许可证为准（如未设置，建议添加合适的开源许可证）。

