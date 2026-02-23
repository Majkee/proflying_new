"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { logger } from "@/lib/utils/logger";

interface UseSupabaseQueryOptions {
  enabled?: boolean;
}

interface UseSupabaseQueryResult<T> {
  data: T;
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSupabaseQuery<T>(
  queryFn: (signal: AbortSignal) => Promise<T>,
  deps: unknown[],
  initialData: T,
  options?: UseSupabaseQueryOptions
): UseSupabaseQueryResult<T> {
  const [data, setData] = useState<T>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(async () => {
    if (!enabled) {
      setData(initialData);
      setLoading(false);
      return;
    }

    // Cancel previous request
    abortControllerRef.current?.abort();
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const result = await queryFn(controller.signal);
      if (!controller.signal.aborted && mountedRef.current) {
        setData(result);
      }
    } catch (err) {
      if (!controller.signal.aborted && mountedRef.current) {
        const wrappedError = err instanceof Error ? err : new Error("Wystapil blad podczas ladowania danych");
        logger.error("Query failed", wrappedError);
        setError(wrappedError);
      }
    } finally {
      if (!controller.signal.aborted && mountedRef.current) {
        setLoading(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    mountedRef.current = true;
    fetchData();

    return () => {
      mountedRef.current = false;
      abortControllerRef.current?.abort();
    };
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}
