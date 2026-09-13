import { useEffect, useState } from 'react';
import { getCachedContent, setCachedContent } from '../lib/contentStore';

// Reads a content entry from the shared store, or loads it once on mount.
// Returns { status: 'loading' | 'success' | 'error', data, error }.
export function usePageData(key, loader) {
  const cached = getCachedContent(key);
  const [state, setState] = useState(cached ?? { status: 'loading' });

  useEffect(() => {
    const existing = getCachedContent(key);
    if (existing) {
      setState(existing);
      return undefined;
    }
    let active = true;
    setState({ status: 'loading' });
    Promise.resolve()
      .then(loader)
      .then((data) => {
        const entry = { status: 'success', data };
        setCachedContent(key, entry);
        if (active) setState(entry);
      })
      .catch((error) => {
        if (active) setState({ status: 'error', error });
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return state;
}
