// SDK Core
export { Tracker } from './tracker';
export { EventManager } from './event-manager';
export { QueueManager } from './queue-manager';
export { StrategyManager } from './strategy-manager';
export { SchemaManager } from './schema-manager';
export type { SchemaConfig, EventDefinition } from './schema-manager';

// React Hooks & Provider
export { TrackerProvider, useTracker, usePageView, usePageStay, useExposure } from './react-hooks';

// UI Components
export { TrackedButton } from './components/trackedButton';
export { TrackedPage } from './components/trackedPage';
export { TrackedForm } from './components/trackedForm';

// Types
export * from './types';
