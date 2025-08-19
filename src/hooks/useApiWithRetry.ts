// src/hooks/useApiWithRetry.ts
import { useState, useEffect, useCallback } from 'react';

interface UseApiWithRetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
}

export const useApiWithRetry = <T>(
  apiCall: () => Promise<T>,
  dependencies: any[] = [],
  options: UseApiWithRetryOptions = {}
) => {
  const {
    maxRetries = 5,
    initialDelay = 1000,
    maxDelay = 8000
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [retryCount, setRetryCount] = useState(0);

  const fetchData = useCallback(async (isRetry = false) => {
    try {
      if (!isRetry) {
        setLoading(true);
      }
      setError('');
      
      const result = await apiCall();
      setData(result);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('API call failed:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'Ett oväntat fel uppstod';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  const retry = useCallback(() => {
    if (retryCount >= maxRetries) {
      setError('Maximalt antal försök uppnått. Försök igen senare.');
      return;
    }

    const newRetryCount = retryCount + 1;
    setRetryCount(newRetryCount);
    
    // Exponential backoff with max delay
    const delay = Math.min(initialDelay * Math.pow(2, newRetryCount - 1), maxDelay);
    
    setTimeout(() => {
      fetchData(true);
    }, delay);
  }, [retryCount, maxRetries, initialDelay, maxDelay, fetchData]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return {
    data,
    loading,
    error,
    retryCount,
    maxRetries,
    retry,
    refetch: () => fetchData(true)
  };
};