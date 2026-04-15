// frontend/src/hooks/useApi.js

import { useState, useEffect, useCallback } from "react";

/**
 * Generic data fetching hook.
 * 
 * Usage:
 *   const { data, loading, error, refetch } = useApi(subjectAPI.getAll);
 */
const useApi = (apiFn, params = null, deps = []) => {
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState(null);

  const fetch = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = params ? await apiFn(params) : await apiFn();
      setData(result.data ?? result);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, deps);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { data, loading, error, refetch: fetch };
};

export default useApi;