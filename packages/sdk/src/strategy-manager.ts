import { ReportStrategy } from './types';

export class StrategyManager {
  private endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Send data using the specified strategy.
   * @param data Data to send
   * @param strategy Reporting strategy (xhr, beacon, img)
   */
  public send(data: unknown, strategy: ReportStrategy = 'xhr') {
    const payload = JSON.stringify(data);

    switch (strategy) {
      case 'beacon':
        this.sendBeacon(payload);
        break;
      case 'img':
        this.sendImg(data);
        break;
      case 'xhr':
      default:
        this.sendXHR(payload);
        break;
    }
  }

  private sendBeacon(payload: string) {
    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon(this.endpoint, blob);
    } else {
      // Fallback to XHR if beacon is not supported
      this.sendXHR(payload);
    }
  }

  private sendXHR(payload: string) {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', this.endpoint, true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(payload);
  }

  private sendImg(data: unknown) {
    // Image beacon typically uses GET with query params
    // Note: This has length limitations
    const params = new URLSearchParams(data as Record<string, string>).toString();
    const img = new Image();
    img.src = `${this.endpoint}?${params}`;
  }
}
