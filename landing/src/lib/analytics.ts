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
