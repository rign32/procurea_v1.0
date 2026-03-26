declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

export function trackEvent(name: string, params?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}

export function trackCtaClick(location: string) {
  trackEvent('cta_click', { cta_location: location });
}

export function trackSectionView(sectionId: string) {
  trackEvent('section_view', { section_id: sectionId });
}

// Tracks visibility of all sections with data-track-section attribute
const trackedSections = new Set<string>();

export function initSectionTracking() {
  if (typeof window === 'undefined') return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const id = (entry.target as HTMLElement).dataset.trackSection;
          if (id && !trackedSections.has(id)) {
            trackedSections.add(id);
            trackSectionView(id);
          }
        }
      });
    },
    { threshold: 0.3 }
  );

  // Observe after DOM is ready
  requestAnimationFrame(() => {
    document.querySelectorAll('[data-track-section]').forEach((el) => {
      observer.observe(el);
    });
  });

  return () => observer.disconnect();
}

// Scroll depth milestones
export function initScrollDepthTracking() {
  if (typeof window === 'undefined') return;

  const milestones = [25, 50, 75, 90];
  const fired = new Set<number>();

  const handler = () => {
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (docHeight <= 0) return;
    const scrollPct = Math.round((window.scrollY / docHeight) * 100);
    milestones.forEach((m) => {
      if (scrollPct >= m && !fired.has(m)) {
        fired.add(m);
        trackEvent('scroll_depth', { percent: m });
      }
    });
  };

  window.addEventListener('scroll', handler, { passive: true });
  return () => window.removeEventListener('scroll', handler);
}
