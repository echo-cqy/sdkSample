import React, { createContext, useContext, useEffect, useRef } from 'react';
import { Tracker } from './tracker';

const TrackerContext = createContext<Tracker | null>(null);

interface TrackerProviderProps {
  config: {
    endpoint: string;
    autoTrack?: boolean;
    debug?: boolean;
  };
  children: React.ReactNode;
}

export const TrackerProvider: React.FC<TrackerProviderProps> = ({ config, children }) => {
  const trackerRef = useRef<Tracker | null>(null);

  if (!trackerRef.current) {
    trackerRef.current = new Tracker(config);
  }

  return (
    <TrackerContext.Provider value={trackerRef.current}>
      {children}
    </TrackerContext.Provider>
  );
};

/**
 * Hook to access the Tracker instance.
 * @returns Tracker instance
 * @throws Error if used outside TrackerProvider
 */
export const useTracker = () => {
  const tracker = useContext(TrackerContext);
  if (!tracker) {
    throw new Error('useTracker must be used within a TrackerProvider');
  }
  return tracker;
};

/**
 * Hook to automatically track page view on mount.
 * @param pageTitle Optional page title override
 */
export const usePageView = (pageTitle?: string) => {
    const tracker = useTracker();
    
    useEffect(() => {
        tracker.trackEvent('pageView', {
            pageTitle: pageTitle || document.title,
            referrer: document.referrer
        });
    }, [tracker, pageTitle]);
};

/**
 * Hook to track how long the user stays on the page/component.
 * Tracks 'pageStay' event on unmount with duration and scroll depth.
 */
export const usePageStay = () => {
    const tracker = useTracker();
    const startTime = useRef(Date.now());
    
    useEffect(() => {
        startTime.current = Date.now();
        
        return () => {
            const duration = Date.now() - startTime.current;
            const scrollDepth = Math.round((window.scrollY + window.innerHeight) / document.body.scrollHeight * 100);
            
            tracker.trackEvent('pageStay', {
                duration,
                scrollDepth
            });
        };
    }, [tracker]);
};

/**
 * Hook to track element exposure (visibility).
 * Tracks 'exposure' event when element becomes hidden after being visible.
 * @param elementId Unique ID for the element
 * @param componentName Human-readable name
 * @returns Ref to attach to the element
 */
export const useExposure = (elementId: string, componentName: string) => {
    const tracker = useTracker();
    const ref = useRef<HTMLDivElement>(null);
    const startTimeRef = useRef<number | null>(null);

    useEffect(() => {
        const element = ref.current;
        if (!element) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Start timer
                    startTimeRef.current = Date.now();
                } else {
                    // End timer and send event if it was started
                    if (startTimeRef.current) {
                        const duration = Date.now() - startTimeRef.current;
                        tracker.trackEvent('exposure', {
                            componentId: elementId,
                            componentName: componentName,
                            duration
                        });
                        startTimeRef.current = null;
                    }
                }
            });
        }, { threshold: 0.5 }); // 50% visible

        observer.observe(element);

        return () => {
            observer.disconnect();
            // Handle unmount while visible
            if (startTimeRef.current) {
                const duration = Date.now() - startTimeRef.current;
                tracker.trackEvent('exposure', {
                    componentId: elementId,
                    componentName: componentName,
                    duration
                });
            }
        };
    }, [tracker, elementId, componentName]);

    return ref;
};
