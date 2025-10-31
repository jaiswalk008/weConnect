import { useState, useCallback } from 'react';
import axiosInstance from '@/utils/axiosInstance';

interface UseFetchState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

interface UseFetchReturn<T> extends UseFetchState<T> {
  fetchData: (_url: string) => Promise<void>;
  reset: () => void;
}

export function useFetch<T = any>(): UseFetchReturn<T> {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    loading: false,
    error: null,
  });

  const fetchData = useCallback(async (url: string) => {
    setState({ data: null, loading: true, error: null });

    try {
      const response = await axiosInstance.get(url);
      setState({ data: response.data, loading: false, error: null });
    } catch (error: any) {
      setState({
        data: null,
        loading: false,
        error: error.response?.data?.message || 'Failed to fetch data',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return {
    ...state,
    fetchData,
    reset,
  };
}
