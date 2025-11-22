// frontend/src/core/hooks/ui/useDebounce.ts
import { useState, useEffect } from 'react';
import { DEBOUNCE_DELAY } from '@/core/config/app.config';

export function useDebounce<T>(value: T, delay: number = DEBOUNCE_DELAY): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}