import { useEffect, useState, useCallback } from 'react';

export function useRouter() {
  const getPath = () => {
    const hash = window.location.hash.slice(1);
    return hash || '/';
  };

  const [path, setPath] = useState(getPath);

  useEffect(() => {
    const handler = () => setPath(getPath());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  const navigate = useCallback((newPath: string) => {
    window.location.hash = newPath;
  }, []);

  const getParam = (segment: number) => {
    return path.split('/')[segment] || null;
  };

  const matches = (pattern: string) => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    if (patternParts.length !== pathParts.length) return false;
    return patternParts.every((p, i) => p.startsWith(':') || p === pathParts[i]);
  };

  const extractParam = (pattern: string, param: string) => {
    const patternParts = pattern.split('/');
    const pathParts = path.split('/');
    const idx = patternParts.findIndex(p => p === `:${param}`);
    return idx >= 0 ? pathParts[idx] : null;
  };

  return { path, navigate, getParam, matches, extractParam };
}
