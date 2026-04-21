import { useEffect, useState } from 'react';
import { MobileRedirectPage } from './MobileRedirectPage';

/** Below this viewport width the app shell breaks at important surfaces
 * (sidebar collapses, comparison table scrolls awkwardly, wizard steps
 * don't fit). Treat anything narrower as "mobile/tablet-portrait". */
const DESKTOP_MIN_WIDTH = 1024;
const OVERRIDE_KEY = 'procurea_mobile_override';

function isNarrow(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`).matches;
}

function loadOverride(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return localStorage.getItem(OVERRIDE_KEY) === '1';
  } catch {
    return false;
  }
}

/**
 * Wrap routes that are desktop-first. If the viewport is narrower than
 * DESKTOP_MIN_WIDTH and the user hasn't chosen to override, render the
 * redirect page instead of the real children. The override persists so
 * users who dismissed it once won't be nagged again.
 */
export function MobileGuard({ children }: { children: React.ReactNode }) {
  const [narrow, setNarrow] = useState<boolean>(() => isNarrow());
  const [overridden, setOverridden] = useState<boolean>(() => loadOverride());

  useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${DESKTOP_MIN_WIDTH - 1}px)`);
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const handleOverride = () => {
    try {
      localStorage.setItem(OVERRIDE_KEY, '1');
    } catch {
      // Safari private mode / quota — keep in-memory override alive for this session.
    }
    setOverridden(true);
  };

  if (narrow && !overridden) {
    return <MobileRedirectPage onOverride={handleOverride} />;
  }
  return <>{children}</>;
}
