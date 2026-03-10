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

// Auth funnel
export const analytics = {
  // Login / registration
  loginPageView: () => trackEvent('login_page_view'),
  methodSelected: (method: 'google' | 'microsoft' | 'email') =>
    trackEvent('auth_method_selected', { method }),
  emailSubmitted: () => trackEvent('auth_email_submitted'),
  codeSent: () => trackEvent('auth_code_sent'),
  codeVerified: () => trackEvent('auth_code_verified'),
  codeFailed: (error: string) => trackEvent('auth_code_failed', { error }),
  phoneStarted: () => trackEvent('auth_phone_started'),
  phoneOtpSent: () => trackEvent('auth_phone_otp_sent'),
  phoneVerified: () => trackEvent('auth_phone_verified'),
  phoneFailed: (error: string) => trackEvent('auth_phone_failed', { error }),
  oauthCallback: (success: boolean) => trackEvent('auth_oauth_callback', { success }),
  registrationCancelled: () => trackEvent('auth_registration_cancelled'),

  // Onboarding
  onboardingStepView: (step: number) => trackEvent('onboarding_step_view', { step }),
  onboardingStepComplete: (step: number) => trackEvent('onboarding_step_complete', { step }),
  onboardingCompleted: () => trackEvent('onboarding_completed'),
  onboardingFailed: (error: string) => trackEvent('onboarding_failed', { error }),

  // App engagement
  dashboardView: () => trackEvent('dashboard_view'),
  dashboardCtaClick: () => trackEvent('dashboard_cta_click'),
  campaignWizardStart: () => trackEvent('campaign_wizard_start'),
  campaignWizardStep: (step: number) => trackEvent('campaign_wizard_step', { step }),
  campaignCreated: (region?: string) => trackEvent('campaign_created', { region }),
  campaignWizardAbandoned: (lastStep: number) =>
    trackEvent('campaign_wizard_abandoned', { last_step: lastStep }),
  campaignDetailView: () => trackEvent('campaign_detail_view'),
  campaignStopped: () => trackEvent('campaign_stopped'),
  suppliersAccepted: () => trackEvent('suppliers_accepted'),
  exportCsv: () => trackEvent('export_csv'),
  exportPowerpoint: () => trackEvent('export_powerpoint'),
  supplierListView: () => trackEvent('supplier_list_view'),
  settingsView: () => trackEvent('settings_view'),
  navClick: (destination: string) => trackEvent('nav_click', { destination }),
};

// Hesitation tracker — detects idle time on a page
export function startHesitationTracker(pageName: string, thresholdMs = 30000) {
  let timer: ReturnType<typeof setTimeout>;
  let fired = false;

  const reset = () => {
    if (fired) return;
    clearTimeout(timer);
    timer = setTimeout(() => {
      fired = true;
      trackEvent('user_hesitation', {
        page: pageName,
        idle_seconds: Math.round(thresholdMs / 1000),
      });
    }, thresholdMs);
  };

  const events = ['click', 'keydown', 'scroll', 'touchstart'];
  events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
  reset();

  return () => {
    clearTimeout(timer);
    events.forEach((e) => window.removeEventListener(e, reset));
  };
}
