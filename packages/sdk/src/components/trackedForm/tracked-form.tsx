
import React from 'react';
import { useTracker } from '../../sdk/react-hooks';

interface TrackedFormProps extends React.FormHTMLAttributes<HTMLFormElement> {
  formId: string;
  children: React.ReactNode;
  // Optional: transform form data before tracking
  transformData?: (formData: FormData) => Record<string, any>;
}

/**
 * Encapsulated Form Component that automatically tracks submission.
 */
export const TrackedForm: React.FC<TrackedFormProps> = ({ 
  formId, 
  children, 
  onSubmit, 
  transformData,
  ...props 
}) => {
  const tracker = useTracker();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault(); // Prevent default reload usually
    
    // Harvest data
    const formData = new FormData(e.currentTarget);
    const dataObj: Record<string, any> = {};
    
    if (transformData) {
        Object.assign(dataObj, transformData(formData));
    } else {
        formData.forEach((value, key) => {
            // Simple serialization
            dataObj[key] = value.toString();
        });
    }

    // Auto track
    tracker.trackEvent('formSubmit', {
        formId: formId,
        formData: dataObj
    });

    // Call original onSubmit if provided
    if (onSubmit) {
      onSubmit(e);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      {...props}
    >
      {children}
    </form>
  );
};
