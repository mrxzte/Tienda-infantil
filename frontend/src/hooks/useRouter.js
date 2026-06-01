import { useState, useEffect, useCallback } from 'react';

// Evento custom para sincronizar entre instancias del hook
const ROUTE_CHANGE_EVENT = 'routechange';

export function useRouter() {
  const [path, setPath] = useState(window.location.pathname);
  const [search, setSearch] = useState(window.location.search);

  useEffect(() => {
    const onLocationChange = () => {
      setPath(window.location.pathname);
      setSearch(window.location.search);
    };

    window.addEventListener('popstate', onLocationChange);
    window.addEventListener(ROUTE_CHANGE_EVENT, onLocationChange);
    
    return () => {
      window.removeEventListener('popstate', onLocationChange);
      window.removeEventListener(ROUTE_CHANGE_EVENT, onLocationChange);
    };
  }, []);

  const navigate = useCallback((to) => {
    window.history.pushState(null, '', to);
    // Disparar evento custom para que TODAS las instancias del hook se actualicen
    window.dispatchEvent(new Event(ROUTE_CHANGE_EVENT));
  }, []);

  const matches = useCallback(
    (pattern) => {
      const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
      return regex.test(path);
    },
    [path]
  );

  const getParam = useCallback(
    (pattern, paramName) => {
      const paramNames = (pattern.match(/:[^/]+/g) || []).map((p) => p.slice(1));
      const regex = new RegExp(`^${pattern.replace(/:[^/]+/g, '([^/]+)')}$`);
      const match = path.match(regex);
      if (match) {
        const index = paramNames.indexOf(paramName);
        return match[index + 1];
      }
      return null;
    },
    [path]
  );

  const getQueryParam = useCallback(
    (name) => {
      const params = new URLSearchParams(search);
      return params.get(name);
    },
    [search]
  );

  return { path, navigate, matches, getParam, getQueryParam, search };
}
