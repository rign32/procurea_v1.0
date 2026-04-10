export interface ChangelogEntry {
  version: string;
  date: string;
  title: { pl: string; en: string };
  items: { pl: string; en: string }[];
}

export const changelog: ChangelogEntry[] = [
  {
    version: '1.1.0',
    date: '2026-04-10',
    title: { pl: 'Nowe funkcje', en: 'New features' },
    items: [
      { pl: 'Bulk actions — zaznaczanie wielu dostawców jednocześnie', en: 'Bulk actions — select multiple suppliers at once' },
      { pl: 'Komentarze i dyskusje przy kampaniach i dostawcach', en: 'Comments and discussions on campaigns and suppliers' },
      { pl: 'Portal dostawcy — załączniki do ofert', en: 'Supplier portal — file attachments for offers' },
      { pl: 'Counter-offer — negocjacja warunków z dostawcami', en: 'Counter-offer — negotiate terms with suppliers' },
      { pl: 'Dashboard analityczny z wykresami', en: 'Analytics dashboard with charts' },
      { pl: 'Widget feedbacku — zgłaszaj błędy z aplikacji', en: 'Feedback widget — report bugs from the app' },
      { pl: 'Wyszukiwanie w wynikach kampanii', en: 'Search within campaign results' },
      { pl: 'Wznowienie formularza kampanii po przypadkowej nawigacji', en: 'Resume campaign form after accidental navigation' },
    ],
  },
];
