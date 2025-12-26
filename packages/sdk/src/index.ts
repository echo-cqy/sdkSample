// SDK Core
export { Tracker } from './sdk/tracker';
export { EventManager } from './sdk/event-manager';
export { QueueManager } from './sdk/queue-manager';
export { StrategyManager } from './sdk/strategy-manager';
export { SchemaManager } from './sdk/schema-manager';
export type { SchemaConfig, EventDefinition } from './sdk/schema-manager';

// React Hooks & Provider
export { TrackerProvider, useTracker, usePageView, usePageStay, useExposure } from './sdk/react-hooks';

// UI Components
export { TrackedButton } from './components/trackedButton';
export { TrackedPage } from './components/trackedPage';
export { TrackedForm } from './components/trackedForm';

// Types
export * from './types';
