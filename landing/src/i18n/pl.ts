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
    product: 'Produkt',
    company: 'Firma',
    howItWorks: 'Jak to działa',
    features: 'Funkcje',
    audience: 'Dla kogo',
    integrations: 'Integracje',
    pricing: 'Cennik',
    faq: 'FAQ',
    login: 'Zaloguj się',
    cta: 'Umów demo',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    allFeatures: 'Wszystkie funkcje',
    allIndustries: 'Wszystkie branże',
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
    badge: 'AI-native platforma procurement',
    savingsPill: '',
    headlinePart1: 'Agentyczna AI',
    headlineHighlight: 'w zakupach',
    headlinePart2: '.',
    subheadline: 'Dwa moduły: AI Sourcing wyszukuje dostawców w 26 językach, a AI Procurement wysyła RFQ, zbiera oferty przez portal dostawcy i porównuje — wszystko zautomatyzowane.',
    ctaPrimary: 'Umów demo',
    ctaSecondary: 'Zobacz cennik',
    trustFreeAccess: '10 darmowych kredytów',
    trustNoCreditCard: 'Bez karty',
    trustBeta: 'Integruje się z Twoim ERP',
    stats: [
      { value: '2-3 min', label: 'pierwsze wyniki' },
      { value: 'do 200', label: 'dostawców na liście' },
      { value: '26', label: 'języków wyszukiwania' },
    ],
    sidebar: {
      dashboard: 'Dashboard',
      campaigns: 'Kampanie',
      rfqs: 'RFQ',
      suppliers: 'Dostawcy',
      blacklist: 'Blacklista',
      contracts: 'Kontrakty',
      approvals: 'Zatwierdzenia',
      workspaces: 'Zespoły',
      documents: 'Dokumenty',
      sequences: 'Sekwencje',
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
      suppliersCount: '(183 dostawców)',
    },
    mockSuppliers: [
      { name: 'EcoPack GmbH', location: 'Niemcy · Hamburg', spec: 'Opakowania biodegradowalne i kompostowalne' },
      { name: 'GreenBox Polska', location: 'Polska · Poznań', spec: 'Opakowania z surowców wtórnych' },
      { name: 'BioWrap BV', location: 'Holandia · Rotterdam', spec: 'Folie i opakowania ekologiczne' },
      { name: 'Cartone Italia', location: 'Włochy · Milano', spec: 'Karton kompostowalny FSC' },
      { name: 'Emballage Vert', location: 'Francja · Lyon', spec: 'Opakowania FSC z recyklingu' },
      { name: 'EkoPak Praha', location: 'Czechy · Praga', spec: 'Torby biodegradowalne' },
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
      { label: 'Szybciej niż ręcznie', sublabel: '' },
      { label: 'średnie oszczędności na zapytaniu', sublabel: 'zakres 3–6% w zależności od kategorii' },
      { label: 'Języków wyszukiwania', sublabel: '' },
      { label: 'Więcej dostawców', sublabel: '' },
    ],
    cards: [
      {
        title: 'Więcej ofert = lepsza cena',
        description: 'Docierasz do dostawców, do których normalnie byś nie trafił. Większy zasięg i automatyczne wzbogacanie danych oznaczają większą bazę dostawców i lepszą pozycję negocjacyjną — średnio 4,6% niższe ceny.',
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
  homeTrustBar: {
    heading: 'Zaufały nam zespoły procurement z 8+ branż',
    industries: {
      manufacturing: 'Produkcja',
      events: 'Eventy',
      construction: 'Budownictwo',
      retail: 'Retail & E-com',
      healthcare: 'Ochrona zdrowia',
      logistics: 'Logistyka',
      horeca: 'HoReCa',
      mro: 'MRO',
    },
  },
  moduleOverview: {
    sectionLabel: 'WYBIERZ SWÓJ MODUŁ',
    heading: 'Płać tylko za to co uruchamiasz',
    subheading:
      'Model credit-based, pay-as-you-go. Zacznij za darmo od AI Sourcing, dodaj Procurement gdy jesteś gotowy, lub weź Bundle z oszczędnością 15%.',
    bestValueLink: 'Zobacz więcej',
    modules: [
      {
        iconName: 'search',
        title: 'AI Sourcing',
        tagline: 'Znajdź 50–250 dostawców w 20 minut',
        price: 'Od $89 / 10 kredytów',
        linkLabel: 'Zobacz więcej',
        href: '/cennik?product=sourcing',
        highlight: false,
      },
      {
        iconName: 'workflow',
        title: 'AI Procurement',
        tagline: 'Pełen workflow RFQ, wspierany przez AI',
        price: 'Od $349 / 10 kredytów',
        linkLabel: 'Zobacz więcej',
        href: '/cennik?product=procurement',
        highlight: false,
      },
      {
        iconName: 'layers',
        title: 'Bundle',
        tagline: 'End-to-end, oszczędzasz 15%',
        price: 'Od $399 / 10 kredytów',
        linkLabel: 'Best value',
        href: '/cennik?product=bundle',
        highlight: true,
      },
      {
        iconName: 'sparkles',
        title: 'Enterprise Custom',
        tagline: 'Unlimited, dedykowana instancja, custom ERP',
        price: 'Od $25k / rok',
        linkLabel: 'Umów demo',
        href: '/kontakt?interest=enterprise_custom',
        highlight: false,
      },
    ],
  },
  testimonial: {
    quote:
      'Procurea zastąpiło 3 narzędzia SaaS i skróciło nasze kampanie sourcingowe z 6 tygodni do 2 dni. Multilingual outreach to game-changer dla dywersyfikacji poza Chiny.',
    authorRole: 'Procurement Lead',
    authorContext: 'Europejski producent · Early access beta',
    authorInitials: 'PL',
  },
  homeFaq: {
    sectionLabel: 'CZĘSTE PYTANIA',
    heading: 'Pytania które dostajemy',
    items: [
      {
        q: 'Jak AI Sourcing znajduje dostawców?',
        a: 'AI Sourcing łączy wyszukiwanie w Google (Serper.dev) z oceną Gemini 2.0 Flash. Opisujesz czego szukasz językiem naturalnym — np. „producenci części CNC z aluminium w Europie z certyfikacją ISO 9001" — a nasz pipeline generuje strategię wyszukiwania w 26 językach, scrapuje i weryfikuje strony dostawców, waliduje dopasowanie, i zwraca 50–250 zakwalifikowanych firm z danymi kontaktowymi w 20 minut. Nie potrzebujesz frazy kluczowej ani znajomości rynków zagranicznych — AI dobiera kraje i queries za Ciebie.',
      },
      {
        q: 'Czym różni się AI Sourcing od AI Procurement?',
        a: 'AI Sourcing to moduł wyszukiwania i kwalifikacji — znajduje dostawców i buduje Twoją bazę. AI Procurement to pełny workflow operacyjny: RFQ do dostawców, zbieranie ofert przez Supplier Portal, porównywarka ofert z AI Insights, auto follow-upy i komunikacja wielojęzyczna. Możesz używać AI Sourcing standalone (jeśli masz własny ERP do reszty), AI Procurement standalone (jeśli bazę już masz), albo Bundle dla pełnego end-to-end. Cennik i detale: /cennik.',
      },
      {
        q: 'Jak działają kredyty?',
        a: '1 kredyt = 1 kampania sourcingowa (AI Sourcing) lub 1 cykl RFQ (AI Procurement). Kredyty kupujesz w pakietach od 10 w górę, ważne 12 miesięcy, bez subskrypcji. Nie wykorzystane przepadają dopiero po roku. Dodatkowo każde konto startuje z 3 darmowymi kredytami sourcingu — bez karty, bez trialu czasowego. Kupujesz tyle kredytów ile realnie zużyjesz, bez narzutów za nieużywany seat fee.',
      },
      {
        q: 'Z jakimi systemami ERP/CRM się integrujecie?',
        a: 'Natywnie: SAP S/4HANA, Oracle NetSuite, Oracle Fusion Cloud, Microsoft Dynamics 365 Business Central, Microsoft Dynamics 365 F&O, Salesforce. Dodatkowo przez Merge.dev pokrywamy 100+ systemów księgowych, ERP i CRM (QuickBooks, Xero, Sage, HubSpot, Pipedrive, Zoho itd.). Pełna lista: /integracje. Integracja synchronizuje dostawców, PO, faktury i master data — dwukierunkowo, bez ręcznego exportu CSV.',
      },
      {
        q: 'Jak szybkie jest wdrożenie?',
        a: 'Self-serve (Sourcing, Procurement, Bundle): rejestracja → pierwsza kampania w 5 minut, bez onboardingu. Enterprise Custom: dedykowany wdrożeniowiec, typowy SOW 4–8 tygodni obejmuje integrację ERP, konfigurację workflow, mapowanie kategorii, szkolenie zespołu i migrację istniejącej bazy dostawców. Dla większości klientów SMB pierwsza realna kampania z outreach do dostawców działa tego samego dnia.',
      },
      {
        q: 'Czy jest darmowy trial?',
        a: 'Tak. Każde nowe konto dostaje 3 darmowe kredyty AI Sourcing — wystarczą do przetestowania 3 pełnych kampanii (50–250 dostawców każda). Bez karty kredytowej, bez automatycznego przedłużenia, bez limitu czasowego. Po wyczerpaniu kupujesz pakiety od 10 kredytów. AI Procurement i Bundle nie mają free trial — start od $349 / $399, ale można umówić demo: /kontakt.',
      },
      {
        q: 'Gdzie przechowywane są moje dane?',
        a: 'Google Cloud Platform, region europe-central2 (Warszawa). Dane klientów są izolowane per-organizacja w PostgreSQL. Szyfrowanie at-rest (AES-256) i in-transit (TLS 1.3). Zgodność: RODO/GDPR, ISO 27001 (w procesie certyfikacji). Nie używamy Twoich danych do trenowania modeli AI. Pełna polityka: /polityka-prywatnosci oraz /rodo. Enterprise Custom — możliwość dedykowanej instancji w wybranym regionie GCP.',
      },
      {
        q: 'Które branże działają najlepiej?',
        a: 'Procurea jest industry-agnostic — pracujemy z produkcją (CNC, OEM, komponenty), eventami (AV, catering, decor), budownictwem (materiały, prefabrykaty, subkontraktorzy), retail/e-com (private label, packaging), HoReCa, ochroną zdrowia (medical supplies, lab equipment), logistyką i MRO. Pełne opisy i case-studies: /dla-kogo. Im bardziej fragmentowana dostawcza baza i międzynarodowy scope, tym większa oszczędność czasu — AI Sourcing przekłada 6 tygodni researchu na 20 minut.',
      },
      {
        q: 'Co jeśli mojego ERP nie ma na liście?',
        a: 'Dwie ścieżki. (1) Jeśli Twój system jest w katalogu Merge.dev (100+ systemów) — integracja działa out-of-the-box bez dodatkowego kodu, aktywujemy w ramach standardowego planu Procurement lub Bundle. (2) Jeśli system jest niszowy lub on-prem — Enterprise Custom buduje dedykowany adapter (REST/SOAP/file-based) w ramach SOW, typowo 2–4 tygodnie. Umów rozmowę techniczną: /kontakt.',
      },
      {
        q: 'Kiedy wybrać Enterprise Custom?',
        a: 'Enterprise Custom ma sens gdy: (a) robisz 500+ kampanii sourcingowych rocznie (wtedy unlimited taniej niż kredyty), (b) potrzebujesz custom ERP adapter którego nie ma Merge.dev, (c) wymagasz dedykowanej instancji (izolowana baza, własny VPC), (d) masz ścisłe wymagania compliance (ISO 27001 audit, DPA z regionalnym residency), (e) chcesz SSO/SAML, custom SLA i dedykowanego CSM. Cena od $25k/rok, typowe kontrakty $40–120k. Umów demo: /kontakt.',
      },
    ],
  },
  calculator: {
    title: 'Oblicz swoje oszczędności w zakupach',
    subtitle: 'W oparciu o średnio 4,6% oszczędności w naszych kampaniach pilotażowych',
    inputLabel: 'Roczny budżet zakupowy',
    annualSavings: 'Oszczędności rocznie',
    monthlySavings: 'Oszczędności miesięcznie',
    grossSavings: 'Oszczędności brutto',
    procureaCost: 'Koszt Procurea',
    netSavings: 'Oszczędności netto',
    costBasis: 'Koszt szacowany na bazie planu Bundle ($39.9/kredyt)',
    roiLabel: 'Zwrot z planu Bundle',
    roiSuffix: 'dni',
    roiNotReached: '—',
    cta: 'Zacznij oszczędzać',
    pricingTitle: 'Zobacz jak Procurea zwróci się w kilka tygodni',
    pricingSubtitle: 'Suwak: Twój roczny budżet zakupowy. Wynik: oszczędności i czas zwrotu planu Bundle ($899/mies).',
  },
  pricing: {
    creditPacks: {
      title: 'Pakiety kredytów',
      subtitle: 'Kupuj hurtowo — im większy pakiet, tym niższa cena za kredyt',
      helper: '1 kredyt = 1 kampania. Kredyty nigdy nie wygasają. Kupuj teraz, używaj kiedy chcesz.',
      tiers: [
        { name: 'Starter', credits: '10 kredytów', badge: '' },
        { name: 'Growth', credits: '25 kredytów', badge: 'Najpopularniejsze' },
        { name: 'Scale', credits: '50 kredytów', badge: '' },
      ],
      productLabels: { sourcing: 'AI Sourcing', procurement: 'AI Procurement', bundle: 'Bundle' },
    },
    compare: {
      title: 'Porównaj plany',
      subtitle: 'Pełne zestawienie funkcji każdego planu',
      plans: { sourcing: 'AI Sourcing', procurement: 'AI Procurement', bundle: 'Bundle', enterprise: 'Enterprise' },
      groups: [
        {
          name: 'Sourcing',
          rows: [
            { label: 'Dostawców na kampanię', sourcing: '50–250', procurement: '—', bundle: '50–250', enterprise: 'Bez limitu' },
            { label: 'Języków wyszukiwania', sourcing: '26', procurement: '—', bundle: '26', enterprise: '26' },
            { label: 'Krajów (EU / Global)', sourcing: '✓', procurement: '—', bundle: '✓', enterprise: '✓' },
            { label: 'Enrichment kontaktów', sourcing: 'Podstawowy', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Manual review dostawców', sourcing: '—', procurement: '—', bundle: '✓', enterprise: '✓' },
          ],
        },
        {
          name: 'Procurement',
          rows: [
            { label: 'Szablony RFQ', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: 'Custom' },
            { label: 'Supplier Portal', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: 'White-label' },
            { label: 'Komunikacja z dostawcami', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Porównanie ofert', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Raporty AI Insights', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
          ],
        },
        {
          name: 'Integracje',
          rows: [
            { label: 'ERP (Merge.dev, 100+ systemów)', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: 'Custom adapter' },
            { label: 'CRM (HubSpot, Salesforce, Pipedrive)', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Email (Gmail, Outlook)', sourcing: '✓', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Webhooks', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Public API', sourcing: '—', procurement: '—', bundle: '—', enterprise: '✓' },
          ],
        },
        {
          name: 'Wsparcie',
          rows: [
            { label: 'Wsparcie email', sourcing: '✓', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Wsparcie priorytetowe', sourcing: '—', procurement: '✓', bundle: '✓', enterprise: '✓' },
            { label: 'Dedykowany CSM', sourcing: '—', procurement: '—', bundle: '—', enterprise: '✓' },
            { label: 'SLA', sourcing: '—', procurement: '—', bundle: '—', enterprise: 'Custom' },
            { label: 'Custom onboarding', sourcing: '—', procurement: '—', bundle: '—', enterprise: '✓' },
          ],
        },
      ],
    },
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
  featuresSneakPeek: {
    sectionLabel: 'FUNKCJE',
    title: 'Wszystko czego potrzebuje Twój zespół zakupowy',
    subtitle: 'Od wyszukiwania dostawców po porównanie ofert — w jednej platformie.',
    cta: 'Zobacz wszystkie funkcje',
  },
  homeFeatures: {
    'ai-sourcing': {
      sectionLabel: 'AI SOURCING',
      title: 'Znajdź 250 dostawców w 20 minut',
      subtitle: 'Opisz czego potrzebujesz zwykłym językiem. Pipeline 4 agentów AI przeszukuje internet w 26 językach, weryfikuje dane rejestrowe i dostarcza gotową listę dostawców — zanim zdążysz wypić kawę.',
      bullets: [
        '50–250 zweryfikowanych dostawców na kampanię',
        'Wyszukiwanie w 26 językach EU + global',
        'Eksport do Excela jednym kliknięciem',
      ],
    },
    'email-outreach': {
      sectionLabel: 'EMAIL OUTREACH',
      title: 'RFQ do 200 dostawców, jednym kliknięciem',
      subtitle: 'Masowa wysyłka zapytań, lokalizowana pod kraj dostawcy. Śledź dostarczenia, otwarcia i odpowiedzi w czasie rzeczywistym. Automatyczne sekwencje follow-up wbudowane.',
      bullets: [
        'Lokalizacja per kraj (26 języków)',
        'Automatyczny follow-up (+3d, +7d, +14d)',
        'Śledzenie dostarczeń w czasie rzeczywistym',
      ],
    },
    'supplier-portal': {
      sectionLabel: 'SUPPLIER PORTAL',
      title: 'Magic-link oferty, bez logowania',
      subtitle: 'Dostawcy składają ustrukturyzowane oferty przez spersonalizowany link. Bez zakładania konta. Progi cenowe, MOQ, załączniki — wszystko w jednym standardowym formacie.',
      bullets: [
        'Magic link, ważność 30 dni',
        'UI dostawcy automatycznie tłumaczone',
        'Mobile-responsive (40% ofert z telefonu)',
      ],
    },
    'offer-comparison': {
      sectionLabel: 'PORÓWNYWARKA OFERT',
      title: 'Koniec porównywania w Excelu',
      subtitle: 'Oferty obok siebie z rankingiem. Kryteria ważone (cena, lead time, certyfikaty). Eksport PDF / PPTX jednym kliknięciem — gotowy dla zarządu lub komitetu przetargowego.',
      bullets: [
        'Ranking ważony według Twoich priorytetów',
        'Porównanie cen przy progach ilościowych',
        'Eksport PDF / PPTX gotowy dla zarządu',
      ],
    },
    'ai-insights': {
      sectionLabel: 'AI INSIGHTS',
      title: 'Raporty procurement, które same się piszą',
      subtitle: 'Gemini analizuje każdą kampanię: breakdown wydatków, ryzyko koncentracji dostawców, potencjał negocjacyjny. Gotowy PDF / PPTX dla CFO.',
      bullets: [
        'Analiza Gemini 2.0 Flash per kampania',
        'Scoring koncentracji dostawców i ryzyka łańcucha',
        'Identyfikacja dźwigni negocjacyjnej',
      ],
    },
  },
  integrationsSearch: {
    placeholder: 'Sprawdź czy integrujemy z Twoim ERP...',
    noResults: 'Nie znaleźliśmy gotowej integracji. Skontaktuj się z nami — zbudujemy adapter przez Merge.dev lub natywnie.',
    requestTitle: 'Twój system?',
    requestSubtitle: 'Zbudujemy adapter dla Twojego ERP.',
    requestCta: 'Porozmawiaj z nami',
  },
} as const;
