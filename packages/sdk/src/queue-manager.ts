import { BaseEvent } from './types';
import { StrategyManager } from './strategy-manager';

export class QueueManager {
  private queue: BaseEvent[] = [];
  private strategyManager: StrategyManager;
  private batchSize: number;
  private timer: number | null = null;
  private interval: number;

  constructor(strategyManager: StrategyManager, batchSize: number = 5, interval: number = 2000) {
    this.strategyManager = strategyManager;
    this.batchSize = batchSize;
    this.interval = interval;
  }

  /**
   * Add an event to the queue.
   * @param event Event to track
   * @param immediate Whether to send immediately
   */
  public addEvent(event: BaseEvent, immediate: boolean = false) {
    if (immediate) {
      this.strategyManager.send([event], 'xhr');
      return;
    }

    this.queue.push(event);

    if (this.queue.length >= this.batchSize) {
      this.flush();
    } else if (!this.timer) {
      // Start a timer if not already running
      this.timer = window.setTimeout(() => {
        this.flush();
      }, this.interval);
    }
  }

  /**
   * Flush the current queue via XHR.
   */
  public flush() {
    if (this.queue.length === 0) return;

    const eventsToSend = [...this.queue];
    this.queue = [];
    
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    // Use beacon for flush during unload usually, but here we default to XHR for normal batch
    // We can expose a method to force beacon for unload
    this.strategyManager.send(eventsToSend, 'xhr');
  }

  public flushOnUnload() {
    if (this.queue.length === 0) return;
    this.strategyManager.send(this.queue, 'beacon');
    this.queue = [];
  }
}
