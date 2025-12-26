// Simulate IDL/JSON Config
export const EventSchema = {
    pageView: {
        priority: 'low',
        params: ['pageTitle', 'referrer']
    },
    pageStay: {
        priority: 'low',
        params: ['duration', 'scrollDepth']
    },
    exposure: {
        priority: 'low',
        params: ['componentId', 'componentName', 'duration']
    },
    buttonClick: {
        priority: 'medium',
        params: ['buttonId', 'buttonText', 'pageUrl', 'extra']
    },
    formSubmit: {
        priority: 'medium',
        params: ['formId', 'formData']
    },
    purchase: {
        priority: 'high', // Critical event
        params: ['orderId', 'amount', 'currency', 'items']
    },
    performance: {
        priority: 'low',
        params: ['fcp', 'lcp', 'ttfb']
    },
    error: {
        priority: 'high',
        params: ['message', 'stack', 'filename', 'lineno', 'colno']
    }
} as const;

// --- TS Type Generation from Schema ---

// Helper to map schema param names to types (In a real scenario, this mapping would be more complex or code-generated)
// Here we manually map for TS safety demonstration, but the runtime check uses the Schema object.
export interface ParamTypeMap {
    pageTitle: string;
    referrer: string;
    duration: number;
    scrollDepth: number;
    componentId: string;
    componentName: string;
    buttonId?: string;
    buttonText?: string;
    extra?: Record<string, any>;
    formId?: string;
    formData?: Record<string, any>;
    pageUrl: string;
    orderId: string;
    amount: number;
    currency: string;
    items: string[];
    fcp: number;
    lcp: number;
    ttfb: number;
    message: string;
    stack?: string;
    filename?: string;
    lineno?: number;
    colno?: number;
}

// Derive EventMap from Schema Keys
export type EventNames = keyof typeof EventSchema;

// Construct EventMap dynamically
export type EventMap = {
    [K in EventNames]: {
        [P in typeof EventSchema[K]['params'][number]]: P extends keyof ParamTypeMap ? ParamTypeMap[P] : unknown
    }
}

// Base Event Structure
export interface BaseEvent {
  eventName: string;
  timestamp: number;
  url: string;
  userAgent: string;
  [key: string]: unknown;
}

// Strategy Type
export type ReportStrategy = 'beacon' | 'xhr' | 'img';
