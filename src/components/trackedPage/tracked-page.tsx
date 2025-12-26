
import React from 'react';
import { usePageView } from '../../sdk/react-hooks';

interface TrackedPageProps {
  pageTitle?: string;
  children: React.ReactNode;
}

/**
 * Component Wrapper that automatically tracks page view on mount.
 */
export const TrackedPage: React.FC<TrackedPageProps> = ({ pageTitle, children }) => {
  usePageView(pageTitle);
  return <>{children}</>;
};
