import { useEffect, useRef } from "react";

/**
 * Calls `callback` after `delay` ms of inactivity.
 * Resets timer on every `deps` change.
 */
export function useDebounce(callback: () => void, delay: number, deps: any[]) {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(callback, delay);
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, deps);
}
