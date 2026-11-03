import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

export type AppRoutePath =
  | '/'
  | '/lernen'
  | '/depot'
  | '/rechner'
  | '/mehr'
  | '/grundlagen'
  | '/zinseszins'
  | '/anlageklassen'
  | '/kindergeld'
  | '/altersvorsorgedepot'
  | '/staat'
  | '/taschengeld';

interface RouterContextValue {
  path: string;
  navigate: (to: string, options?: { replace?: boolean }) => void;
}

const RouterContext = createContext<RouterContextValue>({
  path: '/',
  navigate: () => {},
});

function getConfiguredBase(): string {
  const rawBase =
    typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
      ? import.meta.env.BASE_URL
      : '/';
  if (!rawBase || rawBase === '/') return '';
  return rawBase.endsWith('/') ? rawBase.slice(0, -1) : rawBase;
}

export function normalizeAppPath(rawPath: string, basePrefix = ''): string {
  if (!rawPath) return '/';
  let cleaned = rawPath.trim();

  // Strip base path prefix when deployed under a subdirectory (e.g. GitHub Pages /repo-name)
  if (basePrefix && cleaned.startsWith(basePrefix)) {
    cleaned = cleaned.slice(basePrefix.length) || '/';
  }

  // Strip query string or hash if present
  const qIndex = cleaned.indexOf('?');
  if (qIndex !== -1) cleaned = cleaned.slice(0, qIndex);
  const hIndex = cleaned.indexOf('#');
  if (hIndex !== -1) cleaned = cleaned.slice(0, hIndex);

  if (!cleaned.startsWith('/')) {
    cleaned = `/${cleaned}`;
  }
  if (cleaned.length > 1 && cleaned.endsWith('/')) {
    cleaned = cleaned.slice(0, -1);
  }
  // Map /altersvorsorge alias to /altersvorsorgedepot
  if (cleaned === '/altersvorsorge') {
    return '/altersvorsorgedepot';
  }
  return cleaned || '/';
}

function resolveInitialBrowserPath(): string {
  if (typeof window === 'undefined') return '/';
  const basePrefix = getConfiguredBase();

  // Check if 404.html redirected with ?route=/...
  const params = new URLSearchParams(window.location.search);
  const redirectedRoute = params.get('route');
  if (redirectedRoute) {
    const normalized = normalizeAppPath(redirectedRoute, basePrefix);
    const targetBrowserUrl = `${basePrefix}${normalized === '/' ? '/' : normalized}`;
    try {
      window.history.replaceState(null, '', targetBrowserUrl);
    } catch {
      // Ignore history API restrictions in embedded environments
    }
    return normalized;
  }

  // Also support hash-based fallback links (e.g. #/rechner) for file:// or static preview
  if (window.location.hash.startsWith('#/')) {
    return normalizeAppPath(window.location.hash.slice(1), basePrefix);
  }

  return normalizeAppPath(window.location.pathname, basePrefix);
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [path, setPath] = useState<string>(() => resolveInitialBrowserPath());

  useEffect(() => {
    const onPopState = () => {
      setPath(resolveInitialBrowserPath());
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((to: string, options?: { replace?: boolean }) => {
    const basePrefix = getConfiguredBase();
    const normalized = normalizeAppPath(to, basePrefix);
    const browserUrl = `${basePrefix}${normalized === '/' ? '/' : normalized}`;

    try {
      if (options?.replace) {
        window.history.replaceState(null, '', browserUrl);
      } else {
        window.history.pushState(null, '', browserUrl);
      }
    } catch {
      // Fallback if history.pushState is restricted
    }

    setPath(normalized);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, []);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export function useAppRouter() {
  return useContext(RouterContext);
}

export function AppLink({
  to,
  children,
  className = '',
  ariaLabel,
  onClick,
  ...rest
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & {
  to: string;
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
  onClick?: () => void;
}) {
  const { navigate } = useAppRouter();
  const basePrefix = getConfiguredBase();
  const normalized = normalizeAppPath(to, basePrefix);
  const href = `${basePrefix}${normalized === '/' ? '/' : normalized}`;

  const handleClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.altKey ||
      event.ctrlKey ||
      event.shiftKey
    ) {
      return;
    }
    event.preventDefault();
    onClick?.();
    navigate(normalized);
  };

  return (
    <a
      {...rest}
      href={href}
      onClick={handleClick}
      className={className}
      aria-label={ariaLabel ?? rest['aria-label']}
    >
      {children}
    </a>
  );
}

