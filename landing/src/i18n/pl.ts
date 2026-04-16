type DeepString<T> = T extends readonly (infer U)[]
  ? DeepString<U>[]
  : T extends object
    ? { [K in keyof T]: DeepString<T[K]> }
    : T extends string
      ? string
      : T;

export type LandingTranslations = DeepString<typeof PL>;

export const PL = {
  meta: {
    lang: 'pl',
    title: 'Procurea — Automatyzacja AI sourcingu dla zespołów zakupowych',
    description: 'Narzędzie AI do sourcingu dostawców. Pierwsze wyniki w 2-3 minuty, pełna lista w 20 minut. Dla każdej branży, w 26 językach.',
  },
  nav: {
    howItWorks: 'Jak to działa',
    features: 'Funkcje',
    audience: 'Dla kogo',
    integrations: 'Integracje',
    pricing: 'Cennik',
    faq: 'FAQ',
    login: 'Zaloguj się',
    cta: 'Rozpocznij za darmo',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
  },
  sectionIds: {
    howItWorks: 'jak-to-dziala',
    features: 'co-zyskujesz',
    audience: 'dla-kogo',
    betaSignup: 'dolacz',
    faq: 'faq',
    demo: 'demo',
  },
  hero: {
    badge: 'AI-native procurement platform',
    headlinePart1: 'Procurement',
    headlineHighlight: 'napędzany AI',
    headlinePart2: ' — od sourcingu po kontrakt',
    subheadline: 'Znajduj dostawców, wysyłaj RFQ, zbieraj oferty, porównuj i negocjuj — wszystko w jednej platformie AI-native. 50–250 zweryfikowanych dostawców w 20 minut, RFQ w 26 językach, supplier portal bez logowania.',
    ctaPrimary: 'Rozpocznij za darmo',
    ctaSecondary: 'Zobacz cennik',
    trustFreeAccess: '10 darmowych kredytów',
    trustNoCreditCard: 'Bez karty kredytowej',
    trustBeta: 'Integruje się z Twoim ERP',
    stats: [
      { value: '2-3 min', label: 'pierwsze wyniki' },
      { value: 'do 200', label: 'dostawców na liście' },
      { value: '26', label: 'języków wyszukiwania' },
    ],
    sidebar: {
      dashboard: 'Dashboard',
      campaigns: 'Kampanie',
      suppliers: 'Dostawcy',
      registry: 'Rejestr',
      settings: 'Ustawienia',
    },
    mockup: {
      campaignTitle: 'Opakowania ekologiczne',
      statusInProgress: 'W toku',
      createdAt: 'Utworzono: 18.02.2026',
      region: 'Unia Europejska',
      agents: [
        { name: 'Strategia', desc: 'Generowanie zapytań wyszukiwania' },
        { name: 'Skanowanie', desc: 'Przeszukiwanie internetu' },
        { name: 'Analiza', desc: 'Ocena dostawców' },
        { name: 'Wzbogacanie', desc: 'Dane kontaktowe' },
      ],
      progressLabel: 'Zbieranie danych w toku',
      statsLabel: 'Statystyki',
      suppliersFound: 'Znalezionych dostawców:',
      duration: 'Czas trwania:',
      suppliersLive: 'Dostawcy (na żywo)',
      suppliersCount: '(3 dostawców)',
    },
    mockSuppliers: [
      { name: 'EcoPack GmbH', location: 'Niemcy · Hamburg', spec: 'Opakowania biodegradowalne i kompostowalne' },
      { name: 'GreenBox Polska', location: 'Polska · Poznań', spec: 'Opakowania z surowców wtórnych' },
      { name: 'BioWrap BV', location: 'Holandia · Rotterdam', spec: 'Folie i opakowania ekologiczne' },
    ],
    browserUrl: 'app.procurea.pl',
  },
  problem: {
    heading: 'Ręczne wyszukiwanie dostawców',
    headingSub: 'kosztuje Cię czas i pieniądze',
    description: 'Tradycyjny sourcing to tygodnie przeszukiwania internetu, setki emaili i arkusze kalkulacyjne pełne nieaktualnych danych.',
    painPoints: [
      {
        title: '30 godzin na jeden sourcing',
        description: 'Średni proces sourcingu zajmuje 30 godzin pracy. Ręczne przeszukiwanie internetu, weryfikacja firm, zbieranie kontaktów i wysyłanie zapytań pochłania cenny czas zespołu.',
        stat: '30h',
        statLabel: 'średni czas jednego sourcingu',
      },
      {
        title: 'Nieaktualne dane',
        description: 'Dane kontaktowe szybko tracą aktualność. Nieprawidłowe emaile, stare numery telefonów i przestarzałe informacje generują frustrację i straconą pracę.',
        stat: '40%',
        statLabel: 'danych traci aktualność rocznie',
      },
      {
        title: 'Bariera językowa',
        description: 'Wyszukiwanie dostawców na rynkach zagranicznych wymaga języków lokalnych. Bez tego omijasz najlepszych dostawców z Europy i świata.',
        stat: '26',
        statLabel: 'języków rynków dostawców',
      },
    ],
  },
  howItWorks: {
    sectionLabel: 'Jak to działa',
    heading: 'Od zapytania do listy dostawców',
    headingSub: 'w 3 prostych krokach',
    description: 'Opisz czego szukasz — AI zrobi resztę. Bez ręcznego googlowania, bez arkuszy kalkulacyjnych.',
    stepPrefix: 'KROK',
    steps: [
      { title: 'Opisz czego szukasz', description: 'Wpisz kategorię produktu lub usługi, specyfikację i region. Intuicyjny kreator przeprowadzi Cię krok po kroku.' },
      { title: 'Pierwsze wyniki w 2–3 minuty', description: 'AI przeszukuje internet w 26 językach, identyfikuje dostawców i weryfikuje ich profil. Pierwsze firmy pojawiają się niemal natychmiast.' },
      { title: 'Pełna lista w 20 minut', description: 'Zweryfikowani dostawcy z danymi kontaktowymi, ocenami AI i certyfikatami. Od 20 do 200 firm, zależnie od kategorii.' },
    ],
    summaryPart1: 'Pełna lista dostawców',
    summaryPart2: ' gotowa w max ',
    summaryHighlight: '20 minut',
  },
  demo: {
    sectionLabel: 'Demo',
    heading: 'Zobacz jak to działa',
    headingSub: 'w praktyce',
    description: 'Obejrzyj krótkie demo i przekonaj się, jak Procurea znajduje dostawców w kilka minut.',
  },
  features: {
    sectionLabel: 'Beta testy',
    heading: 'Co zyskujesz w beta testach',
    headingSub: 'Pełny dostęp do wyszukiwarki AI — za darmo',
    description: 'Jako beta tester otrzymujesz pełny dostęp do narzędzia AI, które zastępuje tygodnie ręcznego wyszukiwania dostawców.',
    featuredLabel: 'Kluczowa funkcja',
    items: [
      {
        title: 'Wyszukiwanie AI',
        description: 'Wieloetapowy agent AI przeszukuje internet w 26 językach, identyfikuje dostawców i weryfikuje ich możliwości.',
        highlight: 'Pierwsze wyniki w 2–3 minuty',
      },
      {
        title: 'Baza dostawców',
        description: 'Centralny rejestr dostawców z ocenami AI, danymi kontaktowymi, certyfikatami i profilami firm.',
      },
      {
        title: 'Monitoring na żywo',
        description: 'Śledź postęp kampanii sourcingowej w czasie rzeczywistym. Natychmiastowe aktualizacje o nowych dostawcach.',
      },
    ],
    testerExpectationsTitle: 'Co oczekujemy od testerów?',
    testerExpectations: [
      'Przeprowadź minimum 2–3 procesy sourcingu na rzeczywistych zapytaniach',
      'Podziel się opinią — co działa, co nie, czego brakuje',
      'Poświęć 15 minut na krótką ankietę po zakończeniu testów',
    ],
  },
  benefits: {
    sectionLabel: 'Rezultaty',
    heading: 'Mierzalne rezultaty',
    headingSub: 'dla Twojego zespołu',
    metrics: [
      { label: 'Szybciej niż ręcznie' },
      { label: 'Tańsze oferty średnio' },
      { label: 'Języków wyszukiwania' },
      { label: 'Więcej dostawców' },
    ],
    cards: [
      {
        title: 'Więcej ofert = lepsza cena',
        description: 'Docierasz do dostawców, do których normalnie byś nie trafił. Większy zasięg i automatyczne wzbogacanie danych oznaczają większą bazę dostawców i lepszą pozycję negocjacyjną — średnio 6% niższe ceny.',
      },
      {
        title: '30 godzin → 1 godzina',
        description: 'Proces, który zajmuje 30 godzin pracy specjalisty, Procurea wykonuje w niecałą godzinę. Twój zespół skupia się na negocjacjach i budowaniu relacji zamiast na ręcznym wyszukiwaniu.',
      },
    ],
  },
  audience: {
    sectionLabel: 'Dla kogo',
    heading: 'Dla każdego, kto szuka dostawców',
    headingSub: 'szybko i na skalę',
    personas: [
      {
        title: 'Dyrektorzy zakupów',
        description: 'Strategiczny nadzór nad sourcingiem. Raporty, metryki i optymalizacja bazy dostawców w jednym narzędziu.',
        tags: ['Strategia', 'Raporty', 'Kontrola'],
      },
      {
        title: 'Kierownicy zaopatrzenia',
        description: 'Kampanie sourcingowe w każdej kategorii. Szybkie znajdowanie i porównywanie dostawców z dowolnej branży.',
        tags: ['Kampanie', 'Analiza', 'Negocjacje'],
      },
      {
        title: 'Specjaliści ds. zakupów',
        description: 'Automatyczne wyszukiwanie dostawców bez googlowania. AI przeszukuje internet w 26 językach za Ciebie.',
        tags: ['Wyszukiwanie', 'Kontakty', 'Automatyzacja'],
      },
      {
        title: 'Dyrektorzy i zarząd',
        description: 'Potrzebujesz listy dostawców na zaraz? Wchodzisz na nowy rynek? Szukasz alternatyw? Wpisz czego potrzebujesz — lista gotowa w 20 minut.',
        tags: ['Szybkie decyzje', 'Nowe rynki', 'Dywersyfikacja'],
      },
    ],
    industriesLabel: 'Działa w każdej branży:',
    industries: ['IT & Software', 'Ochrona zdrowia', 'Energetyka', 'Logistyka', 'Budownictwo', 'FMCG & Food', 'Usługi finansowe', 'Przemysł'],
  },
  betaSignup: {
    sectionLabel: 'Dołącz do beta',
    heading: 'Dołącz do zamkniętych',
    headingHighlight: 'beta testów',
    description: 'Pełny dostęp. Za darmo. Bez zobowiązań.',
    benefits: [
      {
        title: 'Pełny dostęp do AI sourcingu',
        description: 'Bez limitów na liczbę procesów w czasie trwania beta testów. Wyszukiwanie w 26 językach, dane kontaktowe, oceny AI.',
      },
      {
        title: 'Pierwszeństwo w rozwoju produktu',
        description: 'Twoje opinie bezpośrednio wpłyną na kierunek rozwoju narzędzia. Budujemy Procurea razem z użytkownikami.',
      },
      {
        title: 'Darmowe kredyty po beta',
        description: 'Po zakończeniu beta testów otrzymasz darmowe kredyty na start w pełnej wersji produktu jako podziękowanie.',
      },
    ],
    cta: 'Załóż darmowe konto',
    trustPoints: [
      'Rejestracja zajmuje 30 sekund',
      'Logowanie przez Google lub Microsoft',
      'Dane w europejskiej chmurze',
    ],
  },
  faq: {
    heading: 'Często zadawane pytania',
    description: 'Wszystko co musisz wiedzieć o beta testach Procurea',
    items: [
      {
        question: 'Jak działa wyszukiwanie AI?',
        answer: 'Procurea wykorzystuje wieloetapowy system agentów AI. Agent strategii generuje zapytania w wielu językach dopasowane do Twoich wymagań. Agent eksploracji przeszukuje internet i identyfikuje dostawców. Agent analizy ocenia ich możliwości, a agent wzbogacania automatycznie znajduje dane kontaktowe. Pierwsze wyniki pojawiają się po 2–3 minutach, pełna lista jest gotowa w max 20 minut.',
      },
      {
        question: 'Jakie regiony są obsługiwane?',
        answer: 'Możesz wyszukiwać dostawców w Polsce, całej Unii Europejskiej lub globalnie. System generuje zapytania w 26 językach, w tym niemieckim, czeskim, włoskim, ale też japońskim, koreańskim, chińskim, tureckim czy hindi — dzięki czemu dociera do dostawców, których nie znajdziesz standardowym wyszukiwaniem.',
      },
      {
        question: 'Co dokładnie jest dostępne w beta testach?',
        answer: 'W ramach beta testów masz pełny dostęp do wyszukiwarki AI dostawców, włącznie z wieloetapowym wyszukiwaniem w 26 językach, automatycznym wzbogacaniem danych kontaktowych, bazą dostawców i monitoringiem na żywo. Funkcje takie jak zapytania ofertowe i sekwencje email są w fazie rozwoju i pojawią się w pełnej wersji produktu.',
      },
      {
        question: 'Jak długo trwają beta testy?',
        answer: 'Beta testy planujemy na okres 2–3 miesięcy. W tym czasie zbieramy opinie i udoskonalamy narzędzie. Po zakończeniu beta testów otrzymasz darmowe kredyty na start w pełnej wersji produktu.',
      },
      {
        question: 'Czy moje dane są bezpieczne?',
        answer: 'Tak. Korzystamy z infrastruktury Google Cloud (region europa-west1), szyfrowania danych w transmisji i spoczynku oraz uwierzytelniania OAuth 2.0 przez Google i Microsoft. Twoje dane nigdy nie opuszczają infrastruktury europejskiej.',
      },
      {
        question: 'Czy muszę coś płacić po zakończeniu beta?',
        answer: 'Nie. Udział w beta testach jest całkowicie darmowy i nie zobowiązuje do zakupu. Po zakończeniu beta otrzymasz darmowe kredyty jako podziękowanie. Dalsze korzystanie z platformy będzie opcjonalne.',
      },
    ],
  },
  cta: {
    headingPart1: 'Wypróbuj AI sourcing',
    headingHighlight: 'na swoim zapytaniu',
    description: 'Załóż darmowe konto, opisz czego szukasz — zweryfikowana lista dostawców będzie gotowa w kilka minut. Beta testy — pełny dostęp bez opłat.',
    ctaPrimary: 'Dołącz do beta testów',
    ctaEmail: 'Napisz do nas',
    contactEmail: 'r.ignaczak1@gmail.com',
    trustPoints: [
      'Pełny dostęp za darmo',
      'Bez karty kredytowej',
      'Platforma AI do automatyzacji sourcingu',
    ],
  },
  footer: {
    brand: 'Automatyzacja zaopatrzenia dla globalnych zespołów. AI Sourcing + pełen workflow procurement.',
    product: 'Produkt',
    industries: 'Dla kogo',
    integrationsCompany: 'Integracje & Firma',
    legal: 'Prawne',
    productLinks: [
      { label: 'AI Sourcing', to: '/funkcje/ai-sourcing' },
      { label: 'Email Outreach', to: '/funkcje/outreach-mailowy' },
      { label: 'Supplier Portal', to: '/funkcje/supplier-portal' },
      { label: 'Porównywarka ofert', to: '/funkcje/porownywarka-ofert' },
      { label: 'Wszystkie funkcje →', to: '/funkcje' },
    ],
    industryLinks: [
      { label: 'Produkcja', to: '/dla-kogo/produkcja' },
      { label: 'Eventy', to: '/dla-kogo/eventy' },
      { label: 'Budownictwo', to: '/dla-kogo/budownictwo' },
      { label: 'Retail & E-commerce', to: '/dla-kogo/retail-ecommerce' },
      { label: 'Wszystkie branże →', to: '/dla-kogo' },
    ],
    companyLinks: [
      { label: 'Integracje (SAP, Oracle, Dynamics)', to: '/integracje' },
      { label: 'Cennik', to: '/cennik' },
      { label: 'O nas', to: '/o-nas' },
      { label: 'Kontakt', to: '/kontakt' },
      { label: 'r.ignaczak1@gmail.com', external: 'mailto:r.ignaczak1@gmail.com' },
    ],
    legalLinks: [
      { label: 'Regulamin', to: '/regulamin' },
      { label: 'Polityka prywatności', to: '/polityka-prywatnosci' },
      { label: 'RODO', to: '/rodo' },
    ],
    cookieSettings: 'Ustawienia cookies',
    copyright: 'Procurea sp. z o.o. Wszelkie prawa zastrzeżone.',
  },
  legal: {
    backToHome: 'Powrót do strony głównej',
    lastUpdatedPrefix: 'Ostatnia aktualizacja:',
  },
} as const;
