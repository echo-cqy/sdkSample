import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Tracker } from '../tracker';

// Mock XHR methods
const openMock = vi.fn();
const setRequestHeaderMock = vi.fn();
const sendMock = vi.fn();

// Mock XHR Class
class MockXHR {
    open = openMock;
    setRequestHeader = setRequestHeaderMock;
    send = sendMock;
}

// Stub global XMLHttpRequest
vi.stubGlobal('XMLHttpRequest', MockXHR);

describe('Tracker SDK', () => {
    let tracker: Tracker;

    beforeEach(() => {
        vi.clearAllMocks();
        
        tracker = new Tracker({ endpoint: '/api/test', autoTrack: false, debug: true });
    });

    it('should initialize correctly', () => {
        expect(tracker).toBeDefined();
    });

    it('should track an event and queue it (delayed send)', () => {
        vi.useFakeTimers();
        tracker.trackEvent('pageView', { pageTitle: 'Test', referrer: '' });
        
        // Should not send immediately (batch size 5, interval 2s)
        expect(sendMock).not.toHaveBeenCalled();
        
        // Fast forward time
        vi.advanceTimersByTime(2500);
        
        expect(sendMock).toHaveBeenCalled();
        const payload = JSON.parse(sendMock.mock.calls[0][0]);
        expect(payload).toHaveLength(1);
        expect(payload[0].eventName).toBe('pageView');
        
        vi.useRealTimers();
    });

    it('should send high priority events immediately', () => {
        tracker.trackEvent('purchase', { 
            orderId: '123', 
            amount: 100, 
            currency: 'USD', 
            items: [] 
        });
        
        expect(sendMock).toHaveBeenCalled();
        const payload = JSON.parse(sendMock.mock.calls[0][0]);
        expect(payload[0].eventName).toBe('purchase');
    });

    it('should batch events', () => {
        vi.useFakeTimers();
        // Send 5 events (batch size)
        for (let i = 0; i < 5; i++) {
            tracker.trackEvent('pageView', { pageTitle: `Page ${i}`, referrer: '' });
        }

        // Should flush immediately upon hitting batch size
        expect(sendMock).toHaveBeenCalled();
        const payload = JSON.parse(sendMock.mock.calls[0][0]);
        expect(payload).toHaveLength(5);
        expect(payload[4].pageTitle).toBe('Page 4');
        
        vi.useRealTimers();
    });

    it('should validate events against schema (throw in debug mode)', () => {
        // Test Type Mismatch
        // @ts-ignore
        expect(() => tracker.trackEvent('pageView', { pageTitle: 123 })).toThrow(/Validation Fail/);
        
        // Test Required Param (Load custom schema)
        tracker.loadSchema({
            version: '1.0.1',
            events: {
                testEvent: {
                    priority: 'low',
                    params: {
                        requiredField: { type: 'string', required: true }
                    }
                }
            }
        });

        // Should throw for missing required param
        expect(() => tracker.trackEvent('testEvent', { })).toThrow(/Missing required parameter/);

        // Should pass with valid param
        expect(() => tracker.trackEvent('testEvent', { requiredField: 'ok' })).not.toThrow();
    });
});
