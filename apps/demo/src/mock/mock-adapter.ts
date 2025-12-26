// Simple Mock Adapter to intercept XHR and Beacon requests
// In a real project, use MSW or similar libraries

type LogCallback = (data: any) => void;
let logCallback: LogCallback | null = null;

export const setMockLogCallback = (cb: LogCallback) => {
  logCallback = cb;
};

export const initMockAdapter = () => {
  const originalXHR = window.XMLHttpRequest;
  const originalSendBeacon = window.navigator.sendBeacon;

  // Mock XMLHttpRequest
  class MockXHR extends originalXHR {
    private url: string = '';
    // private requestBody: any = null; // Removed unused variable

    open(method: string, url: string, ...args: any[]) {
      this.url = url;
      // @ts-ignore
      super.open(method, url, ...args);
    }

    send(body?: any) {
      if (this.url.includes('/api/track')) {
        console.log('[Mock API] XHR Received:', body);
        
        // Notify UI
        if (logCallback) {
            logCallback({
                type: 'XHR',
                timestamp: new Date().toISOString(),
                payload: JSON.parse(body as string)
            });
        }

        // Simulate successful response
        Object.defineProperty(this, 'status', { value: 200 });
        Object.defineProperty(this, 'readyState', { value: 4 });
        Object.defineProperty(this, 'responseText', { value: '{"success": true}' });
        
        // Trigger onload
        this.dispatchEvent(new Event('load'));
      } else {
        super.send(body);
      }
    }
  }

  // @ts-ignore
  window.XMLHttpRequest = MockXHR;

  // Mock sendBeacon
  window.navigator.sendBeacon = (url: string | URL, data?: BodyInit | null) => {
    if (url.toString().includes('/api/track')) {
        let payload: any;
        if (data instanceof Blob) {
            // Need to read blob (async) but sendBeacon is sync-ish logic
            // For mock demo, we just say we got it. 
            // In real debugging, reading Blob is async.
            // We'll just log "Blob Data"
            payload = "Blob Data (Batch on Unload)";
            
            // Try to read it for console if possible (just for demo purposes)
            data.text().then(text => {
                console.log('[Mock API] Beacon Received:', text);
                 if (logCallback) {
                    logCallback({
                        type: 'Beacon',
                        timestamp: new Date().toISOString(),
                        payload: JSON.parse(text)
                    });
                }
            });
        } else {
            payload = data;
             console.log('[Mock API] Beacon Received:', payload);
             if (logCallback) {
                logCallback({
                    type: 'Beacon',
                    timestamp: new Date().toISOString(),
                    payload: payload
                });
            }
        }
        return true;
    }
    return originalSendBeacon.call(window.navigator, url, data);
  };

  console.log('[Mock API] Initialized. Intercepting /api/track');
};
