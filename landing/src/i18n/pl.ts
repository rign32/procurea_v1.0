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
    cta: 'Zacznij za darmo',
    openMenu: 'Otwórz menu',
    closeMenu: 'Zamknij menu',
    allFeatures: 'Wszystkie funkcje',
    allIndustries: 'Wszystkie branże',
  },
  sectionIds: {
    howItWorks: 'jak-to-dziala',
    features: 'co-zyskujesz',
    audience: 'dla-kogo',
    betaSignup: 'zacznij',
    faq: 'faq',
    demo: 'demo',
  },
  hero: {
    badge: 'AI-native platforma procurement',
    savingsPill: '',
    headlinePart1: 'Agentyczna AI',
    headlineHighlight: 'w zakupach',
    headlinePart2: '.',
    subheadline: 'Opisz czego szukasz — AI dostarczy listę zweryfikowanych dostawców z danymi kontaktowymi w 20 minut. Potem wyślij RFQ, zbierz oferty i porównaj — bez ręcznej pracy.',
    ctaPrimary: 'Zacznij za darmo',
    ctaSecondary: 'Obejrzyj demo',
    ctaPricingLink: 'Zobacz cennik',
    trustFreeAccess: '10 darmowych kredytów',
    trustNoCreditCard: 'Bez karty',
    trustBeta: 'Integruje się z Twoim ERP',
    stats: [
      { value: '2-3 min', label: 'pierwsze wyniki' },
      { value: 'do 250', label: 'dostawców na kampanię' },
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
    description: 'Nie mamy bazy dostawców. Dla każdego zapytania AI układa nową strategię, przeszukuje Google w natywnych językach i sama weryfikuje, kto jest producentem, a kto nie.',
    stepPrefix: 'KROK',
    steps: [
      { title: 'Opisz czego szukasz', description: 'Wpisz kategorię, specyfikację i region. Na tej podstawie Agent Strategii generuje zestaw zapytań wyszukiwania — nic nie jest pobierane z predefiniowanej bazy firm.' },
      { title: 'AI przeszukuje Google na żywo', description: 'Strategia tłumaczy zapytania na 26 języków i uruchamia je w Google przez API, w czasie rzeczywistym — dokładnie tak, jak zrobiłby to Twój zespół, tylko szybciej i wielojęzycznie.' },
      { title: 'Drugi agent ocenia każdą firmę', description: 'Osobny agent AI wchodzi na każdą stronę i sprawdza: czy firma istnieje, czy to producent, dystrybutor czy coś spoza tematu. Na koniec dostajesz listę zweryfikowanych dostawców dopasowanych do Twojego zapytania.' },
    ],
    summaryPart1: 'Pełna lista dostawców',
    summaryPart2: ' gotowa w max ',
    summaryHighlight: '20 minut',
    transparencyBadge: 'Data agnostic',
    transparencyText: 'Bez bazy rekomendowanych firm — AI przeszukuje internet za Ciebie, w czasie rzeczywistym.',
  },
  demo: {
    sectionLabel: 'Demo',
    heading: 'Zobacz jak to działa',
    headingSub: 'w praktyce',
    description: 'Obejrzyj krótkie demo i przekonaj się, jak Procurea znajduje dostawców w kilka minut.',
  },
  features: {
    sectionLabel: 'Platforma',
    heading: 'Co zyskujesz',
    headingSub: 'z Procurea',
    description: 'Narzędzie AI, które zastępuje tygodnie ręcznego wyszukiwania dostawców. 10 darmowych kredytów na start — bez karty kredytowej.',
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
    testerExpectationsTitle: 'Jak zacząć?',
    testerExpectations: [
      'Załóż konto — zajmuje 30 sekund, logowanie przez Google lub Microsoft',
      'Uruchom pierwszą kampanię — opisz czego szukasz, AI zrobi resztę',
      'Przeglądaj wyniki i eksportuj listę dostawców do Excela',
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
    sectionLabel: 'Zacznij za darmo',
    heading: 'Zacznij z',
    headingHighlight: '10 darmowymi kredytami',
    description: 'Pełny dostęp do AI Sourcing. Bez karty kredytowej. Bez zobowiązań.',
    benefits: [
      {
        title: '10 darmowych kredytów na start',
        description: '10 pełnych kampanii sourcingowych za darmo. Wyszukiwanie w 26 językach, dane kontaktowe, oceny AI.',
      },
      {
        title: 'Wyniki w 20 minut, nie w 6 tygodniach',
        description: 'Uruchom kampanię i obserwuj jak AI znajduje 50–250 dostawców. Eksportuj do Excela jednym kliknięciem.',
      },
      {
        title: 'Płać tylko gdy potrzebujesz więcej',
        description: 'Po wykorzystaniu darmowych kredytów doładowujesz od $89 za 10 kampanii. Bez subskrypcji, bez automatycznych odnowień.',
      },
    ],
    cta: 'Zacznij za darmo',
    trustPoints: [
      'Rejestracja zajmuje 30 sekund',
      'Logowanie przez Google lub Microsoft',
      'Dane w europejskiej chmurze',
    ],
  },
  faq: {
    heading: 'Często zadawane pytania',
    description: 'Wszystko co musisz wiedzieć o Procurea',
    items: [
      {
        question: 'Jak działa wyszukiwanie AI?',
        answer: 'Procurea jest data agnostic — nie mamy bazy dostawców ani listy „rekomendowanych" firm. Dla każdego zapytania Agent Strategii generuje zestaw zapytań w 26 językach, dopasowany do Twoich wymagań. Te zapytania trafiają do Google Search API w czasie rzeczywistym. Osobny agent otwiera każdą stronę i ocenia, czy firma istnieje, czy to producent, dystrybutor, czy strona spoza tematu. Agent wzbogacania dobiera dane kontaktowe. Pierwsze wyniki pojawiają się po 2–3 minutach, pełna lista jest gotowa w max 20 minut — bez predefiniowanych list, bez uprzedzeń.',
      },
      {
        question: 'Jakie regiony są obsługiwane?',
        answer: 'Możesz wyszukiwać dostawców w Polsce, całej Unii Europejskiej lub globalnie. System generuje zapytania w 26 językach, w tym niemieckim, czeskim, włoskim, ale też japońskim, koreańskim, chińskim, tureckim czy hindi — dzięki czemu dociera do dostawców, których nie znajdziesz standardowym wyszukiwaniem.',
      },
      {
        question: 'Ile kosztuje Procurea?',
        answer: 'AI Sourcing zaczyna się od $89 za 10 kredytów (1 kredyt = 1 kampania). Każde nowe konto dostaje 10 darmowych kredytów — bez karty kredytowej. AI Procurement od $349 / 10 kredytów. Bundle (oba moduły) od $399 / 10 kredytów z 15% oszczędnością. Kredyty nigdy nie wygasają. Pełny cennik: /cennik.',
      },
      {
        question: 'Czy jest darmowy trial?',
        answer: 'Tak. Każde nowe konto dostaje 10 darmowych kredytów AI Sourcing — wystarczą na 10 pełnych kampanii (50–250 dostawców każda). Bez karty kredytowej, bez limitu czasowego, bez automatycznych odnowień. Po wyczerpaniu doładowujesz od $89 za 10 kredytów.',
      },
      {
        question: 'Czy moje dane są bezpieczne?',
        answer: 'Tak. Korzystamy z infrastruktury Google Cloud w UE, szyfrowania danych w transmisji i spoczynku oraz uwierzytelniania OAuth 2.0 przez Google i Microsoft. Twoje dane nigdy nie opuszczają infrastruktury europejskiej. Pełna polityka: /polityka-prywatnosci.',
      },
      {
        question: 'Jak szybko mogę zacząć?',
        answer: 'Rejestracja zajmuje 30 sekund (Google lub Microsoft). Pierwszą kampanię sourcingową uruchamiasz w 5 minut — bez onboardingu, bez konfiguracji. Opisz czego szukasz, a AI zrobi resztę.',
      },
    ],
  },
  cta: {
    headingPart1: 'Zacznij automatyzować',
    headingHighlight: 'procurement z AI',
    description: '10 darmowych kredytów na start. Bez karty, bez zobowiązań.',
    ctaPrimary: 'Zacznij za darmo',
    ctaEmail: 'Napisz do nas',
    contactEmail: 'r.ignaczak1@gmail.com',
    trustPoints: [
      'Pełny dostęp za darmo',
      'Bez karty kredytowej',
      'Platforma AI do automatyzacji sourcingu',
    ],
  },
  homeTrustBar: {
    heading: 'Wspieramy zespoły procurement w 8+ branżach',
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
      'Spędzaliśmy 6 tygodni na sourcingu dostawców opakowań w Europie. Procurea dostarczyła 180 zweryfikowanych vendorów w 20 minut. Wielojęzyczny outreach pozwolił nam dotrzeć na rynki, na których wcześniej nie byliśmy obecni.',
    authorRole: 'Senior Procurement Manager',
    authorContext: 'NordPack Industries · Producent opakowań',
    authorInitials: 'MK',
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
        a: 'AI Sourcing to moduł bazowy — wyszukuje i kwalifikuje dostawców, działa samodzielnie. AI Procurement to rozszerzenie: RFQ do dostawców, zbieranie ofert przez Supplier Portal, porównywarka ofert z AI Insights, auto follow-upy i komunikacja wielojęzyczna. AI Procurement wymaga AI Sourcing — każda kampania Procurement bazuje na kampanii Sourcing. Możesz używać samego AI Sourcing (jeśli masz własny ERP do reszty), albo dodać AI Procurement gdy potrzebujesz pełnego workflow RFQ. Bundle zawiera oba z 15% rabatem. Cennik i detale: /cennik.',
      },
      {
        q: 'Jak działają kredyty?',
        a: '1 kredyt = 1 kampania sourcingowa (AI Sourcing) lub 1 cykl RFQ (AI Procurement). Kredyty kupujesz w pakietach od 10 w górę, bez subskrypcji. Kredyty nigdy nie wygasają. Każde nowe konto startuje z 10 darmowymi kredytami sourcingu — bez karty, bez trialu czasowego. Kupujesz tyle kredytów ile realnie zużyjesz, bez narzutów za nieużywany seat fee.',
      },
      {
        q: 'Z jakimi systemami ERP/CRM się integrujecie?',
        a: 'Natywnie: SAP S/4HANA, Oracle NetSuite, Oracle Fusion Cloud, Microsoft Dynamics 365 Business Central, Microsoft Dynamics 365 F&O, Salesforce. Dodatkowo nasz katalog pokrywa 100+ systemów księgowych, ERP i CRM (QuickBooks, Xero, Sage, HubSpot, Pipedrive, Zoho itd.). Pełna lista: /integracje. Integracja synchronizuje dostawców, PO, faktury i master data — dwukierunkowo, bez ręcznego exportu CSV.',
      },
      {
        q: 'Jak szybkie jest wdrożenie?',
        a: 'Self-serve (Sourcing, Procurement, Bundle): rejestracja → pierwsza kampania w 5 minut, bez onboardingu. Enterprise Custom: dedykowany wdrożeniowiec, typowy SOW 4–8 tygodni obejmuje integrację ERP, konfigurację workflow, mapowanie kategorii, szkolenie zespołu i migrację istniejącej bazy dostawców. Dla większości klientów SMB pierwsza realna kampania z outreach do dostawców działa tego samego dnia.',
      },
      {
        q: 'Czy jest darmowy trial?',
        a: 'Tak. Każde nowe konto dostaje 10 darmowych kredytów AI Sourcing — wystarczą na 10 pełnych kampanii (50–250 dostawców każda). Bez karty kredytowej, bez automatycznego przedłużenia, bez limitu czasowego. Po wyczerpaniu kupujesz pakiety od 10 kredytów. AI Procurement i Bundle nie mają free trial — start od $349 / $399, ale można umówić demo: /kontakt.',
      },
      {
        q: 'Gdzie przechowywane są moje dane?',
        a: 'Google Cloud Platform, region europe-west1 (Belgia, UE). Dane klientów są izolowane per-organizacja w PostgreSQL. Szyfrowanie at-rest (AES-256) i in-transit (TLS 1.3). Zgodność: RODO/GDPR, ISO 27001 (w procesie certyfikacji). Nie używamy Twoich danych do trenowania modeli AI. Pełna polityka: /polityka-prywatnosci oraz /rodo. Enterprise Custom — możliwość dedykowanej instancji w wybranym regionie GCP.',
      },
      {
        q: 'Które branże działają najlepiej?',
        a: 'Procurea jest industry-agnostic — pracujemy z produkcją (CNC, OEM, komponenty), eventami (AV, catering, decor), budownictwem (materiały, prefabrykaty, subkontraktorzy), retail/e-com (private label, packaging), HoReCa, ochroną zdrowia (medical supplies, lab equipment), logistyką i MRO. Pełne opisy i case-studies: /dla-kogo. Im bardziej fragmentowana dostawcza baza i międzynarodowy scope, tym większa oszczędność czasu — AI Sourcing przekłada 6 tygodni researchu na 20 minut.',
      },
      {
        q: 'Co jeśli mojego ERP nie ma na liście?',
        a: 'Dwie ścieżki. (1) Jeśli Twój system jest w naszym katalogu 100+ systemów — integracja działa out-of-the-box bez dodatkowego kodu, aktywujemy w ramach standardowego planu Procurement lub Bundle. (2) Jeśli system jest niszowy lub on-prem — Enterprise Custom buduje dedykowany adapter (REST/SOAP/file-based) w ramach SOW, typowo 2–4 tygodnie. Umów rozmowę techniczną: /kontakt.',
      },
      {
        q: 'Kiedy wybrać Enterprise Custom?',
        a: 'Enterprise Custom ma sens gdy: (a) robisz 500+ kampanii sourcingowych rocznie (wtedy unlimited taniej niż kredyty), (b) potrzebujesz custom ERP adapter którego nie ma w naszym standardowym katalogu, (c) wymagasz dedykowanej instancji (izolowana baza, własny VPC), (d) masz ścisłe wymagania compliance (ISO 27001 audit, DPA z regionalnym residency), (e) chcesz SSO/SAML, custom SLA i dedykowanego CSM. Cena od $25k/rok, typowe kontrakty $40–120k. Umów demo: /kontakt.',
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
    pricingSubtitle: 'Suwak: Twój roczny budżet zakupowy. Wynik: oszczędności i czas zwrotu planu Bundle (od $399 / 10 kredytów).',
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
      { label: 'Partnerzy', to: '/partnerzy' },
      { label: 'Status', external: 'https://stats.uptimerobot.com/procurea' },
    ],
    legalLinks: [
      { label: 'Regulamin', to: '/regulamin' },
      { label: 'Polityka prywatności', to: '/polityka-prywatnosci' },
      { label: 'RODO', to: '/rodo' },
      { label: 'Bezpieczeństwo', to: '/bezpieczenstwo' },
      { label: 'Zgodność', to: '/zgodnosc' },
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
    noResults: 'Nie znaleźliśmy gotowej integracji. Skontaktuj się z nami — zbudujemy adapter.',
    requestTitle: 'Twój system?',
    requestSubtitle: 'Zbudujemy adapter dla Twojego ERP.',
    requestCta: 'Porozmawiaj z nami',
  },
} as const;
