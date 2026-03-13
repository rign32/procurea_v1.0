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
    },
    language: {
      default: lang,
      translations: {
        pl: {
          consentModal: {
            title: 'Korzystamy z cookies',
            description:
              'Używamy plików cookie do analizy ruchu na stronie (Google Analytics). Możesz zaakceptować lub odrzucić cookies analityczne.',
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
                  'Te pliki cookie są wymagane do podstawowego działania strony.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analityczne pliki cookie',
                description:
                  'Google Analytics — zbieramy anonimowe dane o ruchu na stronie, aby ją ulepszać.',
                linkedCategory: 'analytics',
              },
            ],
          },
        },
        en: {
          consentModal: {
            title: 'We use cookies',
            description:
              'We use cookies for website analytics (Google Analytics). You can accept or reject analytics cookies.',
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
                  'These cookies are required for basic site functionality.',
                linkedCategory: 'necessary',
              },
              {
                title: 'Analytics cookies',
                description:
                  'Google Analytics — we collect anonymous traffic data to improve the site.',
                linkedCategory: 'analytics',
              },
            ],
          },
        },
      },
    },
    onConsent: () => {
      if (CookieConsent.acceptedCategory('analytics')) {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      }
    },
    onChange: () => {
      if (CookieConsent.acceptedCategory('analytics')) {
        gtag('consent', 'update', {
          analytics_storage: 'granted',
        });
      } else {
        gtag('consent', 'update', {
          analytics_storage: 'denied',
        });
      }
    },
  });
}

export { CookieConsent };
