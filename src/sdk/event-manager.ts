import { BaseEvent } from '../types';

export class EventManager {
  // Enrich base info for every event
  private getBaseInfo(): Partial<BaseEvent> {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
    };
  }

  /**
   * Factory method to create an event with base info.
   * @param eventName Name of the event
   * @param params Event parameters
   * @returns Enriched event object
   */
  public createEvent(
    eventName: string,
    params: Record<string, unknown>
  ): BaseEvent {
    return {
      eventName: eventName,
      ...this.getBaseInfo(),
      ...params,
    } as BaseEvent;
  }
}
