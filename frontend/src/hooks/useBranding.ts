import { useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { useQuery } from '@tanstack/react-query';
import organizationService from '@/services/organization.service';

/**
 * Converts a hex color (e.g. "#5E8C8F") to HSL CSS variable format (e.g. "183 22% 46%").
 * The CSS variables in index.css use HSL without the hsl() wrapper.
 */
function hexToHslValues(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) return null;

  const r = parseInt(result[1], 16) / 255;
  const g = parseInt(result[2], 16) / 255;
  const b = parseInt(result[3], 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
        break;
      case g:
        h = ((b - r) / d + 2) / 6;
        break;
      case b:
        h = ((r - g) / d + 4) / 6;
        break;
    }
  }

  const hDeg = Math.round(h * 360);
  const sPercent = Math.round(s * 100);
  const lPercent = Math.round(l * 100);

  return `${hDeg} ${sPercent}% ${lPercent}%`;
}

/**
 * Hook that applies organization branding (primary/accent colors) to CSS variables.
 * Should be called in AppLayout on mount. When no custom branding is set,
 * the default Procurea theme remains active.
 */
export function useBranding() {
  const { user } = useAuthStore();
  const orgId = user?.organizationId;

  const { data: org } = useQuery({
    queryKey: ['organization', orgId],
    queryFn: () => organizationService.get(orgId!),
    enabled: !!orgId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  useEffect(() => {
    const root = document.documentElement;

    if (org?.primaryColor) {
      const hsl = hexToHslValues(org.primaryColor);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
        root.style.setProperty('--sidebar-primary', hsl);
        root.style.setProperty('--sidebar-ring', hsl);
      }
    }

    if (org?.accentColor) {
      const hsl = hexToHslValues(org.accentColor);
      if (hsl) {
        root.style.setProperty('--accent', hsl);
        root.style.setProperty('--sidebar-accent', hsl);
      }
    }

    // Cleanup: reset to default when unmounting or when org changes
    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--sidebar-primary');
      root.style.removeProperty('--sidebar-ring');
      root.style.removeProperty('--accent');
      root.style.removeProperty('--sidebar-accent');
    };
  }, [org?.primaryColor, org?.accentColor]);

  return {
    logoUrl: org?.logoUrl || null,
    primaryColor: org?.primaryColor || null,
    accentColor: org?.accentColor || null,
    orgName: org?.name || null,
  };
}

/**
 * Apply branding CSS variables from portal organization data (no auth needed).
 * Used in SupplierPortalPage where org data comes from the offer response.
 */
export function usePortalBranding(organization: {
  primaryColor?: string | null;
  accentColor?: string | null;
} | null | undefined) {
  useEffect(() => {
    const root = document.documentElement;

    if (organization?.primaryColor) {
      const hsl = hexToHslValues(organization.primaryColor);
      if (hsl) {
        root.style.setProperty('--primary', hsl);
        root.style.setProperty('--ring', hsl);
      }
    }

    if (organization?.accentColor) {
      const hsl = hexToHslValues(organization.accentColor);
      if (hsl) {
        root.style.setProperty('--accent', hsl);
      }
    }

    return () => {
      root.style.removeProperty('--primary');
      root.style.removeProperty('--ring');
      root.style.removeProperty('--accent');
    };
  }, [organization?.primaryColor, organization?.accentColor]);
}
