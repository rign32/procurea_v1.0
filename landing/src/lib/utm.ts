export function appendUtm(baseUrl: string, ctaName: string): string {
  try {
    const url = new URL(baseUrl);
    url.searchParams.set('utm_source', 'landing');
    url.searchParams.set('utm_medium', 'cta');
    url.searchParams.set('utm_campaign', ctaName);
    return url.toString();
  } catch {
    return baseUrl;
  }
}
