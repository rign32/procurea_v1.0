import type { LandingTranslations } from './pl';

export const EN: LandingTranslations = {
  meta: {
    lang: 'en',
    title: 'Procurea — AI Sourcing Automation for Procurement Teams',
    description: 'AI-powered sourcing tool that automatically discovers, qualifies, and enriches suppliers across 26 languages. Built for procurement teams in manufacturing.',
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
    demo: 'demo',
  },
  hero: {
    badge: 'AI Sourcing Tool · Free Beta Access',
    headlinePart1: 'AI-powered sourcing',
    headlineHighlight: 'automation',
    headlinePart2: ' for procurement teams',
    subheadline: 'Procurea deploys AI agents that scout, qualify, and enrich suppliers across 26 languages — turning weeks of manual sourcing into minutes. Try it free during our beta program.',
    ctaPrimary: 'Join the beta',
    ctaSecondary: 'Watch Demo',
    trustFreeAccess: 'Full access for free',
    trustNoCreditCard: 'No credit card required',
    trustBeta: 'Early access program',
    stats: [
      { value: '5', label: 'AI sourcing agents' },
      { value: '26', label: 'search languages' },
      { value: '5-10', label: 'min per sourcing run' },
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
    heading: 'Traditional supplier scouting',
    headingSub: 'drains your procurement team',
    description: 'Manual sourcing in manufacturing still means weeks of Googling, hundreds of cold emails, and spreadsheets full of outdated contacts — while better suppliers go undiscovered.',
    painPoints: [
      {
        title: '30 hours per sourcing project',
        description: 'The average sourcing project takes 30 hours of work. Manually searching the internet, verifying companies, collecting contacts, and sending inquiries eats up your procurement team\'s valuable time.',
        stat: '30h',
        statLabel: 'average time per sourcing project',
      },
      {
        title: 'Decaying supplier data',
        description: 'Supplier contact data decays fast. Incorrect emails, old phone numbers, and stale information generate frustration and wasted effort.',
        stat: '40%',
        statLabel: 'of data becomes outdated annually',
      },
      {
        title: 'Language barrier',
        description: 'Searching for suppliers in foreign markets requires local languages. Without this, you miss qualified manufacturers across Europe and global markets.',
        stat: '26',
        statLabel: 'languages of supplier markets',
      },
    ],
  },
  howItWorks: {
    sectionLabel: 'How it works',
    heading: 'From sourcing brief to qualified suppliers',
    headingSub: 'in 5 automated steps',
    description: 'Define your requirements once — five AI agents handle strategy, scouting, qualification, and contact enrichment.',
    stepPrefix: 'STEP',
    steps: [
      { title: 'Define your sourcing brief', description: 'Enter the product name, technical specifications, and requirements. An intuitive wizard guides you step by step.' },
      { title: 'AI creates a strategy', description: 'The Strategy Agent analyzes your requirements and generates queries in multiple languages, tailored to market specifics.' },
      { title: 'Global supplier scouting', description: 'The Exploration Agent searches the internet, identifies manufacturers, and evaluates their production capabilities.' },
      { title: 'Contact enrichment', description: 'The system automatically finds emails, phone numbers, and key decision-maker contacts for each supplier.' },
      { title: 'Qualified supplier shortlist', description: 'A qualified supplier shortlist with AI relevance scores, verified contacts, and certifications — ready for RFQ.' },
    ],
    summaryPart1: 'The entire process',
    summaryPart2: ' takes on average ',
    summaryHighlight: '5–10 minutes',
  },
  demo: {
    sectionLabel: 'Demo',
    heading: 'See AI sourcing in action',
    headingSub: 'Watch the demo',
    description: 'Watch a 3-minute demo to see how Procurea scouts and qualifies suppliers across global markets.',
  },
  features: {
    sectionLabel: 'Beta program',
    heading: 'What you get in the beta',
    headingSub: 'Full AI sourcing platform — free during early access',
    description: 'As an early access user, you get the complete AI sourcing toolkit that replaces weeks of manual supplier scouting.',
    featuredLabel: 'Key feature',
    items: [
      {
        title: 'AI Supplier Scouting',
        description: 'Five specialized AI agents scout suppliers across 26 languages, identify qualified manufacturers, and verify their production capabilities.',
        highlight: '5 AI agents running your sourcing in parallel',
      },
      {
        title: 'Supplier Intelligence Hub',
        description: 'A centralized supplier registry with AI relevance scores, enriched contacts, certifications, and production capability profiles.',
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
    heading: 'Measurable procurement impact',
    headingSub: 'from day one',
    metrics: [
      { label: 'Faster than manual' },
      { label: 'Cheaper offers on average' },
      { label: 'Search languages' },
      { label: 'More suppliers' },
    ],
    cards: [
      {
        title: 'Wider supplier base = stronger negotiations',
        description: 'You reach qualified suppliers your team would never find manually. Greater reach and automatic contact enrichment mean a larger supplier base and stronger negotiating position — 6% lower prices on average.',
      },
      {
        title: '30 hours → 1 hour',
        description: 'A process that takes a specialist 30 hours, Procurea completes in under an hour. Your procurement team focuses on negotiations and supplier relationships instead of manual scouting.',
      },
    ],
  },
  audience: {
    sectionLabel: 'Who it\'s for',
    heading: 'Purpose-built for procurement',
    headingSub: 'in manufacturing companies',
    personas: [
      {
        title: 'Procurement Directors',
        description: 'Strategic overview of the sourcing process. Reports, metrics, and full control over the supplier base in one place.',
        tags: ['Sourcing strategy', 'Spend visibility', 'Supplier control'],
      },
      {
        title: 'Supply Chain Managers',
        description: 'Run AI sourcing campaigns. Quickly discover and compare qualified suppliers.',
        tags: ['Sourcing campaigns', 'Supplier analysis', 'Negotiations'],
      },
      {
        title: 'Procurement Specialists',
        description: 'Automated supplier scouting without hours of manual research. AI agents handle the heavy lifting.',
        tags: ['AI scouting', 'Contact enrichment', 'Automation'],
      },
    ],
    industriesLabel: 'Ideal for industries:',
    industries: ['Automotive', 'Electronics', 'Metalworking', 'Plastics', 'Packaging', 'Machinery & Equipment', 'Chemicals', 'Electrical Components'],
  },
  betaSignup: {
    sectionLabel: 'Join the beta',
    heading: 'Join the',
    headingHighlight: 'early access program',
    description: 'Full access. For free. No obligations.',
    benefits: [
      {
        title: 'Full access to AI sourcing',
        description: 'No limits on sourcing campaigns during the early access period. Search in 26 languages, contact data, AI scores.',
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
    description: 'Everything you need to know about Procurea early access',
    items: [
      {
        question: 'How does AI-powered search work?',
        answer: 'Procurea uses a multi-stage AI agent system. The Strategy Agent generates search queries in multiple languages tailored to your requirements. The Exploration Agent searches the internet and identifies manufacturers. The Analysis Agent evaluates their capabilities, and the Enrichment Agent automatically finds contact data. The entire sourcing process takes minutes, not weeks.',
      },
      {
        question: 'Which regions are supported?',
        answer: 'You can search for suppliers locally, across the European Union, or globally. The system generates queries in 26 languages, including German, Czech, Italian, but also Japanese, Korean, Chinese, Turkish, and Hindi — reaching suppliers you wouldn\'t find with standard searches.',
      },
      {
        question: 'What exactly is available in the beta?',
        answer: 'During the beta, you have full access to the AI sourcing platform, including multi-stage search in 26 languages, automatic contact data enrichment, supplier database, and live monitoring. Features like RFQs and email sequences are in development and will appear in the full product.',
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
    headingPart1: 'Run AI sourcing',
    headingHighlight: 'on your next RFQ',
    description: 'Create a free account, define your sourcing brief, and let five AI agents scout and qualify suppliers for you. Early access — full platform at no cost.',
    ctaPrimary: 'Join the beta program',
    ctaEmail: 'Contact us',
    contactEmail: 'hello@procurea.io',
    trustPoints: [
      'Full access for free',
      'No credit card required',
      'AI sourcing automation platform',
    ],
  },
  footer: {
    brand: 'AI sourcing automation for procurement teams. Currently in early access.',
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
