import 'vanilla-cookieconsent/dist/cookieconsent.css';
import * as CookieConsent from 'vanilla-cookieconsent';

declare function gtag(...args: any[]): void;

export function initCookieConsent(lang: 'pl' | 'en') {
  CookieConsent.run({
    guiOptions: {
      consentModal: {
        layout: 'box inline',
        position: 'bottom right',
      },
      preferencesModal: {
        layout: 'box',
      },
    },
    categories: {
      necessary: {
        enabled: true,
        readOnly: true,
      },
      analytics: {
        autoClear: {
          cookies: [
            { name: /^_ga/ },
            { name: '_gid' },
          ],
        },
      },
      marketing: {
        autoClear: {
          cookies: [
            { name: '_gcl_au' },
            { name: /^_gcl_aw/ },
            { name: /^_gac_/ },
          ],
        },
      },
    },
    language: {
      default: lang,
      translations: {
        pl: {
          consentModal: {
            title: 'Korzystamy z cookies',
            description:
              'Używamy plików cookie do analizy ruchu oraz do celów marketingowych (remarketing). Możesz zarządzać swoimi preferencjami.',
            acceptAllBtn: 'Akceptuję wszystkie',
            acceptNecessaryBtn: 'Tylko niezbędne',
            showPreferencesBtn: 'Zarządzaj ustawieniami',
          },
          preferencesModal: {
            title: 'Ustawienia plików cookie',
            acceptAllBtn: 'Akceptuję wszystkie',
            acceptNecessaryBtn: 'Tylko niezbędne',
            savePreferencesBtn: 'Zapisz ustawienia',
            sections: [
              {
                title: 'Niezbędne pliki cookie',
                description:
                  'Te pliki cookie są wymagane do podstawowego działania aplikacji.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analityczne pliki cookie',
                description:
                  'Google Analytics — zbieramy anonimowe dane o ruchu, aby ulepszać aplikację.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Marketingowe pliki cookie',
                description:
                  'Google Ads — umożliwiają wyświetlanie spersonalizowanych reklam na podstawie Twojej aktywności.',
                linkedCategory: 'marketing',
              },
            ],
          },
        },
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use cookies for analytics and marketing purposes (remarketing). You can manage your preferences.',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Necessary only',
            showPreferencesBtn: 'Manage preferences',
          },
          preferencesModal: {
            title: 'Cookie preferences',
            acceptAllBtn: 'Accept all',
            acceptNecessaryBtn: 'Necessary only',
            savePreferencesBtn: 'Save preferences',
            sections: [
              {
                title: 'Necessary cookies',
                description:
                  'These cookies are required for basic application functionality.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analytics cookies',
                description:
                  'Google Analytics — we collect anonymous traffic data to improve the app.',
                linkedCategory: 'analytics',
              },
              {
                title: 'Marketing cookies',
                description:
                  'Google Ads — allow us to show personalized ads based on your activity.',
                linkedCategory: 'marketing',
              },
            ],
          },
        },
      },
    },
    onConsent: () => {
      const analyticsGranted = CookieConsent.acceptedCategory('analytics');
      const marketingGranted = CookieConsent.acceptedCategory('marketing');
      gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
        ad_storage: marketingGranted ? 'granted' : 'denied',
        ad_user_data: marketingGranted ? 'granted' : 'denied',
        ad_personalization: marketingGranted ? 'granted' : 'denied',
      });
    },
    onChange: () => {
      const analyticsGranted = CookieConsent.acceptedCategory('analytics');
      const marketingGranted = CookieConsent.acceptedCategory('marketing');
      gtag('consent', 'update', {
        analytics_storage: analyticsGranted ? 'granted' : 'denied',
        ad_storage: marketingGranted ? 'granted' : 'denied',
        ad_user_data: marketingGranted ? 'granted' : 'denied',
        ad_personalization: marketingGranted ? 'granted' : 'denied',
      });
    },
  });
}

export { CookieConsent };
