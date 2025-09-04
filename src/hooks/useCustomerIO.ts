import { useState, useCallback } from 'react';
import { CustomerData } from '@/lib/customerio';

interface UseCustomerIOReturn {
  updateCustomer: (email: string, data: CustomerData) => Promise<boolean>;
  trackEvent: (email: string, eventName: string, eventData?: any) => Promise<boolean>;
  isLoading: boolean;
  error: string | null;
}

export const useCustomerIO = (): UseCustomerIOReturn => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateCustomer = useCallback(async (email: string, data: CustomerData): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customerio', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, data })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to update customer');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Customer.io Update Error:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const trackEvent = useCallback(async (email: string, eventName: string, eventData: any = {}): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/customerio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, eventName, eventData })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to track event');
      }

      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Customer.io Event Tracking Error:', errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    updateCustomer,
    trackEvent,
    isLoading,
    error
  };
};
