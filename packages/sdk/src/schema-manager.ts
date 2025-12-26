
export type ParamType = 'string' | 'number' | 'boolean' | 'array' | 'object';

export interface ParamSchema {
  type: ParamType;
  required?: boolean;
  description?: string;
}

export interface EventDefinition {
  priority: 'high' | 'medium' | 'low';
  params: Record<string, ParamSchema>;
  description?: string;
}

export interface SchemaConfig {
  version: string;
  events: Record<string, EventDefinition>;
}

export const DEFAULT_SCHEMA: SchemaConfig = {
  version: '1.0.0',
  events: {
    pageView: { priority: 'low', params: { pageTitle: { type: 'string' }, referrer: { type: 'string' } } },
    pageStay: { priority: 'low', params: { duration: { type: 'number' }, scrollDepth: { type: 'number' } } },
    exposure: { priority: 'low', params: { componentId: { type: 'string' }, componentName: { type: 'string' }, duration: { type: 'number' } } },
    buttonClick: { priority: 'medium', params: { buttonId: { type: 'string' }, buttonText: { type: 'string' }, pageUrl: { type: 'string' }, extra: { type: 'object' } } },
    formSubmit: { priority: 'medium', params: { formId: { type: 'string' }, formData: { type: 'object' } } },
    purchase: { priority: 'high', params: { orderId: { type: 'string' }, amount: { type: 'number' }, currency: { type: 'string' }, items: { type: 'array' } } },
    performance: { priority: 'low', params: { fcp: { type: 'number' }, lcp: { type: 'number' }, ttfb: { type: 'number' } } },
    error: { priority: 'high', params: { message: { type: 'string' }, stack: { type: 'string' }, filename: { type: 'string' }, lineno: { type: 'number' }, colno: { type: 'number' } } }
  }
};

export class SchemaManager {
  private schema: SchemaConfig = DEFAULT_SCHEMA;

  constructor(initialConfig?: SchemaConfig) {
    if (initialConfig) {
      this.loadConfig(initialConfig);
    }
  }

  public loadConfig(config: SchemaConfig) {
    console.log(`[SchemaManager] Loading config version ${config.version}`);
    this.schema = {
        version: config.version,
        events: { ...this.schema.events, ...config.events }
    };
  }

  /**
   * Validate event parameters against the schema.
   * @param eventName Name of the event
   * @param params Event parameters
   * @returns Validation result
   */
  public validate(eventName: string, params: Record<string, unknown> = {}): { valid: boolean; errors: string[] } {
    const definition = this.schema.events[eventName];
    
    if (!definition) {
      return { valid: false, errors: [`Event '${eventName}' is not defined in the schema.`] };
    }

    const errors: string[] = [];

    // Check required params
    for (const [key, paramSchema] of Object.entries(definition.params)) {
      const value = params[key];
      if (paramSchema.required && (value === undefined || value === null)) {
        errors.push(`Missing required parameter: '${key}'`);
        continue;
      }

      if (value !== undefined) {
        const actualType = this.getType(value);
        if (actualType !== paramSchema.type && paramSchema.type !== 'object') { 
             // Special case: actualType 'array' is also an 'object' in JS, but our getType distinguishes them.
             errors.push(`Parameter '${key}' expected type '${paramSchema.type}' but got '${actualType}'`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  public getEventPriority(eventName: string): 'high' | 'medium' | 'low' {
    return this.schema.events[eventName]?.priority || 'low';
  }

  private getType(value: unknown): ParamType {
    if (Array.isArray(value)) return 'array';
    return typeof value as ParamType;
  }
}
