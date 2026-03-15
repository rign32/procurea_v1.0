import type { LandingTranslations } from './pl';

export const EN: LandingTranslations = {
  meta: {
    lang: 'en',
    title: 'Procurea — AI-Powered Supplier Discovery',
    description: 'An AI tool that automatically finds, analyzes, and verifies suppliers across global markets.',
  },
  nav: {
    howItWorks: 'How it works',
    features: 'Features',
    audience: 'Who it\'s for',
    faq: 'FAQ',
    login: 'Sign in',
    cta: 'Try for free',
    openMenu: 'Open menu',
    closeMenu: 'Close menu',
  },
  sectionIds: {
    howItWorks: 'how-it-works',
    features: 'features',
    audience: 'who-its-for',
    betaSignup: 'join-beta',
    faq: 'faq',
  },
  hero: {
    badge: 'AI-Powered Tool · Free Beta Access',
    headlinePart1: 'AI scans the internet',
    headlineHighlight: 'for you',
    headlinePart2: ' and finds suppliers',
    subheadline: 'Procurea is an AI-powered tool that automatically discovers, analyzes, and verifies suppliers across global markets. Try it free during our beta program.',
    ctaPrimary: 'Join the beta',
    ctaSecondary: 'See how it works',
    trustFreeAccess: 'Full access for free',
    trustNoCreditCard: 'No credit card required',
    trustBeta: 'Closed beta program',
    stats: [
      { value: '5', label: 'AI agents' },
      { value: '26', label: 'languages' },
      { value: '5-10', label: 'min per sourcing' },
    ],
    sidebar: {
      dashboard: 'Dashboard',
      campaigns: 'Campaigns',
      suppliers: 'Suppliers',
      registry: 'Registry',
      settings: 'Settings',
    },
    mockup: {
      campaignTitle: 'Polyethylene granules',
      statusInProgress: 'In progress',
      createdAt: 'Created: Feb 18, 2026',
      region: 'European Union',
      agents: [
        { name: 'Strategy', desc: 'Generating search queries' },
        { name: 'Scanning', desc: 'Searching the internet' },
        { name: 'Analysis', desc: 'Evaluating suppliers' },
        { name: 'Enrichment', desc: 'Contact data' },
      ],
      progressLabel: 'Collecting data in progress',
      statsLabel: 'Statistics',
      suppliersFound: 'Suppliers found:',
      duration: 'Duration:',
      suppliersLive: 'Suppliers (live)',
      suppliersCount: '(3 suppliers)',
    },
    mockSuppliers: [
      { name: 'SABIC', location: 'Germany · Gelsenkirchen', spec: 'Polyethylene granule production' },
      { name: 'Dreyplas GmbH', location: 'Germany · Meerbusch', spec: 'Plastics and granules' },
      { name: 'SL Recycling GmbH', location: 'Germany · Löhne', spec: 'Recycling of metal scrap' },
    ],
    browserUrl: 'app.procurea.io',
  },
  problem: {
    heading: 'Manual supplier sourcing',
    headingSub: 'costs you time and money',
    description: 'Traditional sourcing in manufacturing companies means weeks of internet searching, hundreds of emails, and spreadsheets full of outdated data.',
    painPoints: [
      {
        title: '30 hours per single sourcing',
        description: 'The average sourcing process takes 30 hours of work. Manually searching the internet, verifying companies, collecting contacts, and sending inquiries eats up your team\'s valuable time.',
        stat: '30h',
        statLabel: 'average time per single sourcing',
      },
      {
        title: 'Outdated data',
        description: 'Contact data quickly becomes outdated. Incorrect emails, old phone numbers, and stale information generate frustration and wasted effort.',
        stat: '40%',
        statLabel: 'of data becomes outdated annually',
      },
      {
        title: 'Language barrier',
        description: 'Searching for suppliers in foreign markets requires local languages. Without this, you miss the best manufacturers from Europe and beyond.',
        stat: '26',
        statLabel: 'languages of supplier markets',
      },
    ],
  },
  howItWorks: {
    sectionLabel: 'How it works',
    heading: 'From inquiry to supplier list',
    headingSub: 'in 5 simple steps',
    description: 'The entire process is fully automated. You define your needs — AI does the rest.',
    stepPrefix: 'STEP',
    steps: [
      { title: 'Describe what you need', description: 'Enter the product name, technical specifications, and requirements. An intuitive wizard guides you step by step.' },
      { title: 'AI creates a strategy', description: 'The Strategy Agent analyzes your requirements and generates queries in multiple languages, tailored to market specifics.' },
      { title: 'Internet scanning', description: 'The Exploration Agent searches the internet, identifies manufacturers, and evaluates their capabilities.' },
      { title: 'Data enrichment', description: 'The system automatically finds emails, phone numbers, and decision-maker data for each supplier.' },
      { title: 'Ready-made list', description: 'A verified supplier list with AI scores, contact data, and certifications. Ready to use.' },
    ],
    summaryPart1: 'The entire process',
    summaryPart2: ' takes on average ',
    summaryHighlight: '5–10 minutes',
  },
  demo: {
    sectionLabel: 'Demo',
    heading: 'See it in action',
    headingSub: 'Watch the demo',
    description: 'Watch a short demo to see how Procurea finds and analyzes suppliers in minutes.',
  },
  features: {
    sectionLabel: 'Beta program',
    heading: 'What you get in the beta',
    headingSub: 'Full access to AI-powered search — for free',
    description: 'As a beta tester, you get full access to an AI tool that replaces weeks of manual supplier searching.',
    featuredLabel: 'Key feature',
    items: [
      {
        title: 'AI-Powered Search',
        description: 'A multi-stage AI agent searches the internet in 26 languages, identifies manufacturers, and verifies their production capabilities.',
        highlight: '5 AI agents working in parallel',
      },
      {
        title: 'Supplier Database',
        description: 'A central supplier registry with AI scores, contact data, certifications, and production capability information.',
      },
      {
        title: 'Live Monitoring',
        description: 'Track your sourcing campaign progress in real time. Instant updates when new suppliers are found.',
      },
    ],
    testerExpectationsTitle: 'What we expect from testers?',
    testerExpectations: [
      'Run at least 2–3 sourcing processes on real inquiries',
      'Share your feedback — what works, what doesn\'t, what\'s missing',
      'Spend 15 minutes on a short survey after testing',
    ],
  },
  benefits: {
    sectionLabel: 'Results',
    heading: 'Measurable results',
    headingSub: 'for your procurement team',
    metrics: [
      { label: 'Faster than manual' },
      { label: 'Cheaper offers on average' },
      { label: 'Search languages' },
      { label: 'More suppliers' },
    ],
    cards: [
      {
        title: 'More quotes = better price',
        description: 'You reach suppliers you would never find manually. Greater reach and automatic data enrichment mean a larger supplier base and stronger negotiating position — 6% lower prices on average.',
      },
      {
        title: '30 hours → 1 hour',
        description: 'A process that takes a specialist 30 hours, Procurea completes in under an hour. Your team focuses on negotiations and relationship building instead of manual searching.',
      },
    ],
  },
  audience: {
    sectionLabel: 'Who it\'s for',
    heading: 'Built for procurement teams',
    headingSub: 'in manufacturing companies',
    personas: [
      {
        title: 'Procurement Directors',
        description: 'Strategic overview of the sourcing process. Reports, metrics, and full control over the supplier base in one place.',
        tags: ['Strategy', 'Reports', 'Control'],
      },
      {
        title: 'Supply Chain Managers',
        description: 'Manage sourcing campaigns. Quickly find and compare suppliers.',
        tags: ['Campaigns', 'Analysis', 'Negotiations'],
      },
      {
        title: 'Procurement Specialists',
        description: 'Fast supplier discovery without manually searching the internet. AI does the heavy lifting for you.',
        tags: ['Search', 'Contacts', 'Automation'],
      },
    ],
    industriesLabel: 'Ideal for industries:',
    industries: ['Automotive', 'Electronics', 'Metalworking', 'Plastics', 'Packaging', 'Machinery & Equipment', 'Chemicals', 'Electrical Components'],
  },
  betaSignup: {
    sectionLabel: 'Join the beta',
    heading: 'Join the closed',
    headingHighlight: 'beta program',
    description: 'Full access. For free. No obligations.',
    benefits: [
      {
        title: 'Full access to AI sourcing',
        description: 'No limits on the number of processes during the beta program. Search in 26 languages, contact data, AI scores.',
      },
      {
        title: 'Priority in product development',
        description: 'Your feedback directly shapes the direction of the tool. We\'re building Procurea together with our users.',
      },
      {
        title: 'Free credits after beta',
        description: 'After the beta program ends, you\'ll receive free credits to start with the full product as a thank you.',
      },
    ],
    cta: 'Create a free account',
    trustPoints: [
      'Registration takes 30 seconds',
      'Sign in with Google or Microsoft',
      'Data stored in European cloud',
    ],
  },
  faq: {
    heading: 'Frequently asked questions',
    description: 'Everything you need to know about the Procurea beta program',
    items: [
      {
        question: 'How does AI-powered search work?',
        answer: 'Procurea uses a multi-stage AI agent system. The Strategy Agent generates search queries in multiple languages tailored to your requirements. The Exploration Agent searches the internet and identifies manufacturers. The Analysis Agent evaluates their capabilities, and the Enrichment Agent automatically finds contact data. The entire process takes minutes, not weeks.',
      },
      {
        question: 'Which regions are supported?',
        answer: 'You can search for suppliers locally, across the European Union, or globally. The system generates queries in 26 languages, including German, Czech, Italian, but also Japanese, Korean, Chinese, Turkish, and Hindi — reaching suppliers you wouldn\'t find with standard searches.',
      },
      {
        question: 'What exactly is available in the beta?',
        answer: 'During the beta, you have full access to the AI supplier search engine, including multi-stage search in 26 languages, automatic contact data enrichment, supplier database, and live monitoring. Features like RFQs and email sequences are in development and will appear in the full product.',
      },
      {
        question: 'How long does the beta last?',
        answer: 'We plan the beta for a period of 2–3 months. During this time, we collect feedback and improve the tool. After the beta ends, you\'ll receive free credits to start with the full product.',
      },
      {
        question: 'Is my data secure?',
        answer: 'Yes. We use Google Cloud infrastructure (europe-west1 region), encryption of data in transit and at rest, and OAuth 2.0 authentication via Google and Microsoft. Your data never leaves European infrastructure.',
      },
      {
        question: 'Do I have to pay after the beta ends?',
        answer: 'No. Participation in the beta is completely free and comes with no obligation to purchase. After the beta, you\'ll receive free credits as a thank you. Continued use of the platform is optional.',
      },
    ],
  },
  cta: {
    headingPart1: 'Try AI sourcing',
    headingHighlight: 'on your own inquiry',
    description: 'Create a free account, describe what you need, and let AI agents find suppliers for you. Beta program — full access at no cost.',
    ctaPrimary: 'Join the beta program',
    ctaEmail: 'Contact us',
    contactEmail: 'hello@procurea.io',
    trustPoints: [
      'Full access for free',
      'No credit card required',
      'AI-powered sourcing tool',
    ],
  },
  footer: {
    brand: 'AI-powered supplier discovery tool. Currently in beta.',
    product: 'Product',
    company: 'Company',
    legal: 'Legal',
    productLinks: [
      { label: 'Features', href: '#features' },
      { label: 'How it works', href: '#how-it-works' },
      { label: 'Who it\'s for', href: '#who-its-for' },
      { label: 'FAQ', href: '#faq' },
    ],
    companyLinks: [
      { label: 'hello@procurea.io', href: 'mailto:hello@procurea.io' },
      { label: '+48 536 067 316', href: 'tel:+48536067316' },
    ],
    legalLinks: [
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'GDPR', to: '/gdpr' },
    ],
    cookieSettings: 'Cookie Settings',
    copyright: 'Procurea sp. z o.o. All rights reserved.',
  },
  legal: {
    backToHome: 'Back to homepage',
    lastUpdatedPrefix: 'Last updated:',
  },
} as const;
