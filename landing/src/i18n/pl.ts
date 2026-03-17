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
    description: 'Narzędzie AI do sourcingu, które automatycznie wyszukuje, kwalifikuje i wzbogaca dane dostawców w 26 językach. Stworzone dla działów zakupów w przemyśle.',
  },
  nav: {
    howItWorks: 'Jak to działa',
    features: 'Co zyskujesz',
    audience: 'Dla kogo',
    faq: 'FAQ',
    login: 'Zaloguj się',
    cta: 'Testuj za darmo',
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
    badge: 'Narzędzie AI do sourcingu · Darmowy dostęp w beta',
    headlinePart1: 'Automatyzacja sourcingu',
    headlineHighlight: 'napędzana AI',
    headlinePart2: ' dla zespołów zakupowych',
    subheadline: 'Procurea uruchamia agentów AI, którzy wyszukują, kwalifikują i wzbogacają dane dostawców w 26 językach — zamieniając tygodnie ręcznego sourcingu w minuty. Testuj za darmo w ramach programu beta.',
    ctaPrimary: 'Dołącz do beta testów',
    ctaSecondary: 'Obejrzyj demo',
    trustFreeAccess: 'Pełny dostęp za darmo',
    trustNoCreditCard: 'Bez karty kredytowej',
    trustBeta: 'Zamknięte beta testy',
    stats: [
      { value: '5', label: 'agentów AI' },
      { value: '26', label: 'języków' },
      { value: '5-10', label: 'min na sourcing' },
    ],
    sidebar: {
      dashboard: 'Dashboard',
      campaigns: 'Kampanie',
      suppliers: 'Dostawcy',
      registry: 'Rejestr',
      settings: 'Ustawienia',
    },
    mockup: {
      campaignTitle: 'Granulat polietylenu',
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
      { name: 'SABIC', location: 'Niemcy · Gelsenkirchen', spec: 'Produkcja granulatu polietylenu' },
      { name: 'Dreyplas GmbH', location: 'Niemcy · Meerbusch', spec: 'Tworzywa sztuczne i granulaty' },
      { name: 'SL Recycling GmbH', location: 'Niemcy · Löhne', spec: 'Recycling of metal scrap' },
    ],
    browserUrl: 'app.procurea.pl',
  },
  problem: {
    heading: 'Ręczne wyszukiwanie dostawców',
    headingSub: 'kosztuje Cię czas i pieniądze',
    description: 'Tradycyjny sourcing w firmach produkcyjnych to tygodnie przeszukiwania internetu, setki emaili i arkusze kalkulacyjne pełne nieaktualnych danych.',
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
        description: 'Wyszukiwanie dostawców na rynkach zagranicznych wymaga języków lokalnych. Bez tego omijasz najlepszych producentów z Europy i świata.',
        stat: '26',
        statLabel: 'języków rynków dostawców',
      },
    ],
  },
  howItWorks: {
    sectionLabel: 'Jak to działa',
    heading: 'Od zapytania do listy dostawców',
    headingSub: 'w 5 prostych krokach',
    description: 'Cały proces jest w pełni automatyczny. Ty definiujesz potrzeby — AI robi resztę.',
    stepPrefix: 'KROK',
    steps: [
      { title: 'Opisz czego szukasz', description: 'Wprowadź nazwę produktu, specyfikacje techniczne i wymagania. Intuicyjny kreator przeprowadzi Cię krok po kroku.' },
      { title: 'AI tworzy strategię', description: 'Agent Strategii analizuje wymagania i tworzy zapytania w wielu językach, dopasowane do specyfiki rynków.' },
      { title: 'Skanowanie internetu', description: 'Agent Eksploracji przeszukuje internet, identyfikuje producentów i ocenia ich możliwości.' },
      { title: 'Wzbogacanie danych', description: 'System automatycznie znajduje emaile, telefony i dane decyzyjne dla każdego dostawcy.' },
      { title: 'Gotowa lista', description: 'Zweryfikowana lista dostawców z ocenami AI, danymi kontaktowymi i certyfikatami. Gotowa do wykorzystania.' },
    ],
    summaryPart1: 'Cały proces',
    summaryPart2: ' trwa średnio ',
    summaryHighlight: '5–10 minut',
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
        description: 'Wieloetapowy agent AI przeszukuje internet w 26 językach, identyfikuje producentów i weryfikuje ich możliwości produkcyjne.',
        highlight: '5 agentów AI pracujących równolegle',
      },
      {
        title: 'Baza dostawców',
        description: 'Centralny rejestr dostawców z ocenami AI, danymi kontaktowymi, certyfikatami i informacjami o możliwościach produkcyjnych.',
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
    headingSub: 'dla Twojego zespołu zakupów',
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
    heading: 'Stworzone dla zespołów zakupowych',
    headingSub: 'w firmach produkcyjnych',
    personas: [
      {
        title: 'Dyrektorzy zakupów',
        description: 'Strategiczny przegląd procesu sourcingu. Raporty, metryki i pełna kontrola nad bazą dostawców w jednym miejscu.',
        tags: ['Strategia', 'Raporty', 'Kontrola'],
      },
      {
        title: 'Kierownicy zaopatrzenia',
        description: 'Zarządzanie kampaniami sourcingowymi. Szybkie znajdowanie i porównywanie dostawców.',
        tags: ['Kampanie', 'Analiza', 'Negocjacje'],
      },
      {
        title: 'Specjaliści zakupów',
        description: 'Szybkie wyszukiwanie dostawców bez ręcznego przeszukiwania internetu. AI wykonuje ciężką pracę za Ciebie.',
        tags: ['Wyszukiwanie', 'Kontakty', 'Automatyzacja'],
      },
    ],
    industriesLabel: 'Idealnie dla branż:',
    industries: ['Automotive', 'Elektronika', 'Obróbka metali', 'Tworzywa sztuczne', 'Opakowania', 'Maszyny i urządzenia', 'Chemikalia', 'Komponenty elektryczne'],
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
        answer: 'Procurea wykorzystuje wieloetapowy system agentów AI. Agent strategii generuje zapytania w wielu językach dopasowane do Twoich wymagań. Agent eksploracji przeszukuje internet i identyfikuje producentów. Agent analizy ocenia ich możliwości, a agent wzbogacania automatycznie znajduje dane kontaktowe. Cały proces trwa minuty, nie tygodnie.',
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
    description: 'Załóż darmowe konto, opisz czego szukasz i pozwól agentom AI znaleźć dostawców za Ciebie. Beta testy — pełny dostęp bez opłat.',
    ctaPrimary: 'Dołącz do beta testów',
    ctaEmail: 'Napisz do nas',
    contactEmail: 'kontakt@procurea.pl',
    trustPoints: [
      'Pełny dostęp za darmo',
      'Bez karty kredytowej',
      'Platforma AI do automatyzacji sourcingu',
    ],
  },
  footer: {
    brand: 'Automatyzacja AI sourcingu dla zespołów zakupowych. Obecnie w programie wczesnego dostępu.',
    product: 'Produkt',
    company: 'Firma',
    legal: 'Prawne',
    productLinks: [
      { label: 'Co zyskujesz', href: '#co-zyskujesz' },
      { label: 'Jak to działa', href: '#jak-to-dziala' },
      { label: 'Dla kogo', href: '#dla-kogo' },
      { label: 'FAQ', href: '#faq' },
    ],
    companyLinks: [
      { label: 'kontakt@procurea.pl', href: 'mailto:kontakt@procurea.pl' },
      { label: '+48 536 067 316', href: 'tel:+48536067316' },
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
