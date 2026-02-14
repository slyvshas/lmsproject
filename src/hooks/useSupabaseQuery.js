// ============================================================================
// useSupabaseQuery Hook
// ============================================================================
// Custom hook for executing Supabase queries with built-in loading 
// and error state management.

import { useState, useEffect } from 'react';
import supabase from '../config/supabase';

/**
 * Execute a Supabase query with automatic loading and error handling
 * @param {Function} query - Async function that returns Supabase query
 * @param {any} dependencies - Array of dependencies to refetch when changed
 */
export const useSupabaseQuery = (query, dependencies = []) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const result = await query();
        if (isMounted) {
          // If result is an object with data property, extract it
          // Otherwise use the result as-is
          setData(result?.data !== undefined ? result.data : result);
          if (result?.error) {
            setError(result.error);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false;
    };
  }, dependencies);

  const refetch = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await query();
      // If result is an object with data property, extract it
      // Otherwise use the result as-is
      setData(result?.data !== undefined ? result.data : result);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { data, isLoading, error, refetch };
};

export default useSupabaseQuery;
