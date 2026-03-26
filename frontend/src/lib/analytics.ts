declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: unknown[];
  }
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, params);
  }
}

// ── User identification & properties ──

interface IdentityUser {
  id: string;
  plan?: string;
  hasOrganization?: boolean;
  organization?: { id: string };
  trialCreditsUsed?: boolean;
  orgPlan?: string;
}

export function setUserIdentity(user: IdentityUser) {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('config', import.meta.env.VITE_GA_ID, {
    user_id: user.id,
    send_page_view: false,
  });
  window.gtag('set', 'user_properties', {
    plan_type: user.plan || 'none',
    has_organization: String(!!user.hasOrganization || !!user.organization),
    trial_used: String(!!user.trialCreditsUsed),
    org_plan: user.orgPlan || 'none',
    language_version: import.meta.env.VITE_LANGUAGE || 'pl',
  });
}

export function clearUserIdentity() {
  if (typeof window === 'undefined' || !window.gtag) return;
  window.gtag('set', 'user_properties', {
    plan_type: null,
    has_organization: null,
    trial_used: null,
    org_plan: null,
  });
}

// ── UTM attribution (landing → app) ──

export function captureUtmParams() {
  const params = new URLSearchParams(window.location.search);
  const utmKeys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
  const utmData: Record<string, string> = {};
  utmKeys.forEach((key) => {
    const val = params.get(key);
    if (val) utmData[key] = val;
  });
  if (Object.keys(utmData).length > 0) {
    sessionStorage.setItem('procurea_utm', JSON.stringify(utmData));
    trackEvent('landing_attribution', utmData);
  }
}

export function getStoredUtm(): Record<string, string> | null {
  try {
    const raw = sessionStorage.getItem('procurea_utm');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Auth funnel ──

export const analytics = {
  // Login / registration
  loginPageView: () => trackEvent('login_page_view'),
  methodSelected: (method: 'google' | 'microsoft' | 'email') =>
    trackEvent('auth_method_selected', { method }),
  emailSubmitted: () => trackEvent('auth_email_submitted'),
  codeSent: () => trackEvent('auth_code_sent'),
  codeVerified: () => {
    const utm = getStoredUtm();
    trackEvent('auth_code_verified', { ...utm });
  },
  codeFailed: (error: string) => trackEvent('auth_code_failed', { error }),
  phoneStarted: () => trackEvent('auth_phone_started'),
  phoneOtpSent: () => trackEvent('auth_phone_otp_sent'),
  phoneVerified: () => {
    const utm = getStoredUtm();
    trackEvent('auth_phone_verified', { ...utm });
  },
  phoneFailed: (error: string) => trackEvent('auth_phone_failed', { error }),
  oauthCallback: (success: boolean) => {
    const utm = success ? getStoredUtm() : null;
    trackEvent('auth_oauth_callback', { success, ...utm });
  },
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

  // Pipeline results
  campaignCompleted: (supplierCount: number) =>
    trackEvent('campaign_completed', { supplier_count: supplierCount }),

  // API errors (non-auth)
  apiError: (endpoint: string, status: number) =>
    trackEvent('api_error', { endpoint, status_code: status }),

  // Feature discovery
  featureDiscovery: (feature: string) => trackEvent('feature_discovery', { feature }),

  // Billing / conversion
  billingPageView: () => trackEvent('billing_page_view'),
  billingModalOpen: () => trackEvent('billing_modal_open'),
  planClicked: (planId: string) => trackEvent('plan_clicked', { plan_id: planId }),
  checkoutStarted: (planId: string) => trackEvent('checkout_started', { plan_id: planId }),
};

// ── Enhanced ecommerce ──

const GA_CURRENCY = (import.meta.env.VITE_LANGUAGE || 'pl') === 'en' ? 'USD' : 'PLN';

export const ecommerce = {
  viewItem: (packId: string, price: number, name: string) =>
    trackEvent('view_item', {
      currency: GA_CURRENCY,
      value: price,
      items: [{ item_id: packId, item_name: name, price, quantity: 1 }],
    }),

  beginCheckout: (packId: string, price: number, name: string) => {
    sessionStorage.setItem(
      'pending_checkout',
      JSON.stringify({ packId, price, name }),
    );
    trackEvent('begin_checkout', {
      currency: GA_CURRENCY,
      value: price,
      items: [{ item_id: packId, item_name: name, price, quantity: 1 }],
    });
  },

  purchase: (transactionId: string, packId: string, price: number, name: string) =>
    trackEvent('purchase', {
      transaction_id: transactionId,
      currency: GA_CURRENCY,
      value: price,
      items: [{ item_id: packId, item_name: name, price, quantity: 1 }],
    }),

  completePendingPurchase: (transactionId: string) => {
    try {
      const raw = sessionStorage.getItem('pending_checkout');
      if (!raw) return;
      const { packId, price, name } = JSON.parse(raw);
      ecommerce.purchase(transactionId, packId, price, name);
      sessionStorage.removeItem('pending_checkout');
    } catch {
      // ignore
    }
  },
};

// ── Hesitation tracker — detects idle time on a page ──

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

// ── Time-to-action tracker ──

export function trackTimeToAction(pageName: string, actionName: string) {
  const startTime = Date.now();
  return () => {
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    trackEvent('time_to_action', { page: pageName, action: actionName, seconds: elapsed });
  };
}
