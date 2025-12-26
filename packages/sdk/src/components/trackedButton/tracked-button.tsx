import React from 'react';
import { useTracker } from '../../react-hooks';

interface TrackedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  eventId?: string; // Optional custom event ID
  buttonName: string; // Business name
  extraParams?: Record<string, any>; // Context
  children: React.ReactNode;
}

/**
 * Encapsulated Button Component that automatically tracks clicks.
 * Uses the `useTracker` hook to send events directly.
 */
export const TrackedButton: React.FC<TrackedButtonProps> = ({ 
  eventId, 
  buttonName, 
  extraParams, 
  children, 
  onClick, 
  ...props 
}) => {
  const tracker = useTracker();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Auto track
    tracker.trackEvent('buttonClick', {
        buttonId: eventId || props.id || 'unknown-btn',
        buttonText: buttonName,
        pageUrl: window.location.href,
        extra: extraParams
    });

    // Call original onClick if provided
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <button
      onClick={handleClick}
      {...props}
    >
      {children}
    </button>
  );
};
