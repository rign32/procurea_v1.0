import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { ScrapingService } from '../../common/services/scraping.service';
import { GoogleSearchService } from '../../common/services/google-search.service';

interface ApolloPersonResult {
  id: string;
  first_name: string;
  last_name: string;
  name: string;
  title: string;
  email?: string;
  email_status?: string;
  linkedin_url?: string;
  seniority?: string;
  departments?: string[];
  organization?: {
    name: string;
    primary_domain: string;
  };
}

interface ApolloMatchResponse {
  person: ApolloPersonResult & {
    email: string;
    email_status: string;
  };
}

interface ScrapedEmail {
  email: string;
  name?: string;
  source: string;
}

/**
 * Contact Enrichment Agent — 5-level cascade fallback.
 *
 * Level 1: Apollo People Match (by apolloId) — verified emails
 * Level 2: Website scraping — extract emails from company website pages
 * Level 3: Google search — find emails via internet search
 * Level 4: Generic email pattern — info@domain, kontakt@domain
 * Level 5: Mark as unreachable
 */
@Injectable()
export class ApolloEnrichmentAgent {
  private readonly logger = new Logger(ApolloEnrichmentAgent.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://api.apollo.io';

  // Rate limiting: Apollo free plan allows ~50 req/min but be safe
  private lastRequestTime = 0;
  private readonly MIN_DELAY_MS = 1500;

  // Fetch timeout
  private readonly FETCH_TIMEOUT_MS = 30000;

  // Email regex
  private readonly EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g;

  // Emails to ignore
  private readonly EXCLUDED_PREFIXES = [
    'noreply', 'no-reply', 'donotreply', 'webmaster', 'postmaster',
    'mailer-daemon', 'cookie', 'privacy', 'gdpr', 'rodo',
    'abuse', 'support', 'newsletter', 'unsubscribe', 'wordpress',
    'admin@wordpress', 'woocommerce',
  ];

  // Preferred email prefixes (ordered by priority)
  private readonly PREFERRED_PREFIXES = [
    'sales', 'sprzedaz', 'handel', 'commercial',
    'info', 'kontakt', 'contact', 'biuro', 'office',
    'hello', 'enquiry', 'inquiry', 'anfrage',
  ];

  // Contact subpages to scrape
  private readonly CONTACT_PATHS = [
    '/contact', '/kontakt', '/about', '/impressum',
    '/about-us', '/o-nas', '/contact-us', '/kontakt-z-nami',
  ];

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly scraping: ScrapingService,
    private readonly googleSearch: GoogleSearchService,
  ) {
    this.apiKey = this.config.get<string>('APOLLO_API_KEY') || '';
  }

  /**
   * Normalize website or URL into a bare domain ("www.foo.com/path" → "foo.com").
   */
  private domainOf(urlOrHost: string | null | undefined): string | null {
    if (!urlOrHost) return null;
    try {
      const u = urlOrHost.startsWith('http') ? urlOrHost : `https://${urlOrHost}`;
      return new URL(u).hostname.replace(/^www\./, '').toLowerCase() || null;
    } catch {
      return null;
    }
  }

  /**
   * Respect Apollo rate limit (shared across all endpoints in this agent).
   */
  private async throttleApollo(): Promise<void> {
    const elapsed = Date.now() - this.lastRequestTime;
    if (elapsed < this.MIN_DELAY_MS) {
      await new Promise((r) => setTimeout(r, this.MIN_DELAY_MS - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Apollo Organization Enrichment — cross-checks employee count, industry,
   * founded year, LinkedIn etc. against the supplier's website. Used to:
   *  - lift Supplier.metadata.apollo for UI badges,
   *  - flag mismatches (website says "50-200 employees", Apollo says "10").
   *
   * Returns null on any error (caller treats as "no enrichment available").
   */
  async enrichOrganization(websiteOrDomain: string): Promise<{
    name?: string;
    domain?: string;
    industry?: string;
    estimatedEmployees?: number;
    foundedYear?: number;
    linkedinUrl?: string;
    annualRevenue?: number;
    publicCompany?: boolean;
    city?: string;
    country?: string;
  } | null> {
    if (!this.apiKey) return null;
    const domain = this.domainOf(websiteOrDomain);
    if (!domain) return null;

    await this.throttleApollo();

    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);

      const response = await fetch(
        `${this.baseUrl}/api/v1/organizations/enrich?domain=${encodeURIComponent(domain)}`,
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            Accept: 'application/json',
          },
          signal: controller.signal,
        },
      );
      clearTimeout(timeout);

      if (!response.ok) {
        if (response.status === 422 || response.status === 404) {
          return null; // Unknown domain — not an error worth logging.
        }
        this.logger.warn(`Apollo enrichOrganization ${domain}: HTTP ${response.status}`);
        return null;
      }

      const data = await response.json();
      const org = data?.organization ?? data;
      if (!org || typeof org !== 'object') return null;

      return {
        name: org.name || undefined,
        domain: org.primary_domain || domain,
        industry: org.industry || undefined,
        estimatedEmployees:
          typeof org.estimated_num_employees === 'number'
            ? org.estimated_num_employees
            : undefined,
        foundedYear:
          typeof org.founded_year === 'number' ? org.founded_year : undefined,
        linkedinUrl: org.linkedin_url || undefined,
        annualRevenue:
          typeof org.annual_revenue === 'number' ? org.annual_revenue : undefined,
        publicCompany: typeof org.publicly_traded_symbol === 'string' ? true : undefined,
        city: org.city || undefined,
        country: org.country || undefined,
      };
    } catch (err: any) {
      this.logger.debug(`Apollo enrichOrganization ${domain} failed: ${err.message}`);
      return null;
    }
  }

  /**
   * Main entry point: enrich contacts for all suppliers in a campaign.
   * Uses 5-level cascade fallback to maximize contact coverage.
   */
  async enrichCampaign(
    campaignId: string,
    progressCallback?: (current: number, total: number, supplierName: string, level?: string, email?: string) => void,
  ): Promise<{ found: number; notFound: number; errors: number }> {
    const stats = { found: 0, notFound: 0, errors: 0 };

    try {
      // Get all suppliers with their existing contacts
      const suppliers = await this.prisma.supplier.findMany({
        where: {
          campaignId,
          deletedAt: null,
        },
        select: {
          id: true,
          name: true,
          website: true,
          url: true,
          contacts: {
            select: {
              id: true,
              apolloId: true,
              email: true,
              emailStatus: true,
            },
          },
        },
      });

      this.logger.log(`Contact enrichment starting for campaign ${campaignId}: ${suppliers.length} suppliers`);

      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { apolloEnrichmentStatus: 'running' },
      });

      for (let i = 0; i < suppliers.length; i++) {
        const supplier = suppliers[i];
        const supplierName = supplier.name || 'Unknown';
        const supplierUrl = supplier.website || supplier.url;

        const emitProgress = (level?: string, email?: string) => {
          if (progressCallback) progressCallback(i + 1, suppliers.length, supplierName, level, email);
        };

        try {
          // Check if supplier already has a contact WITH email
          const contactWithEmail = supplier.contacts?.find(c => c.email && c.emailStatus !== 'not_found' && c.emailStatus !== 'unreachable');
          if (contactWithEmail) {
            this.logger.log(`[${i + 1}/${suppliers.length}] ${supplierName} already has contact with email — skip`);
            emitProgress('L1_apollo', contactWithEmail.email || undefined);
            stats.found++;
            continue;
          }

          // === LEVEL 1: Apollo People Search by domain + People Match ===
          const l1Domain = this.extractDomain(supplierUrl);
          if (l1Domain && this.apiKey) {
            emitProgress('L1_apollo');
            this.logger.log(`[${i + 1}/${suppliers.length}] L1 Apollo People Search: ${supplierName} (${l1Domain})`);

            try {
              // Try with sales titles first, then fallback to any person
              let people = await this.searchPeopleByDomain(l1Domain, true);
              if (people.length === 0) {
                this.logger.log(`[L1] No sales-titled people, retrying without title filter for ${supplierName}`);
                people = await this.searchPeopleByDomain(l1Domain, false);
              }

              if (people.length > 0) {
                // Try People Match on best candidate to get verified email
                const enriched = await this.enrichPerson(people[0]);

                if (enriched?.email) {
                  await this.upsertContact(supplier.id, enriched);
                  this.logger.log(`[L1] Found via search+match: ${enriched.name} <${enriched.email}> at ${supplierName}`);
                  emitProgress('L1_apollo', enriched.email);
                  stats.found++;
                  continue;
                }

                // No email from Match, but store person info (name, title, linkedin)
                const bestPerson = people[0];
                if (bestPerson.name || bestPerson.first_name) {
                  await this.upsertContact(supplier.id, {
                    ...bestPerson,
                    email: undefined as any,
                    email_status: 'unverified',
                  });
                  this.logger.log(`[L1] Stored contact info (no email): ${bestPerson.name || bestPerson.first_name} at ${supplierName}`);
                }
              }
              this.logger.log(`[L1] No verified email from Apollo for ${supplierName} — falling through`);
            } catch (err) {
              this.logger.warn(`[L1] Apollo search error for ${supplierName}: ${err.message} — falling through`);
            }
          }

          // === LEVEL 2: Website scraping ===
          if (supplierUrl) {
            emitProgress('L2_website');
            this.logger.log(`[${i + 1}/${suppliers.length}] L2 Website scrape: ${supplierName} (${supplierUrl})`);
            const scraped = await this.scrapeForEmail(supplierUrl);

            if (scraped) {
              await this.createScrapedContact(supplier.id, scraped, 'website_scraped');
              this.logger.log(`[L2] Found: ${scraped.email} at ${supplierName} (source: ${scraped.source})`);
              emitProgress('L2_website', scraped.email);
              stats.found++;
              continue;
            }
            this.logger.log(`[L2] No email found on website for ${supplierName}`);
          }

          // === LEVEL 3: Google search ===
          if (supplierUrl) {
            emitProgress('L3_google');
            this.logger.log(`[${i + 1}/${suppliers.length}] L3 Google search: ${supplierName}`);
            const searched = await this.searchForEmail(supplierName, supplierUrl);

            if (searched) {
              await this.createScrapedContact(supplier.id, searched, 'web_searched');
              this.logger.log(`[L3] Found: ${searched.email} at ${supplierName} (source: ${searched.source})`);
              emitProgress('L3_google', searched.email);
              stats.found++;
              continue;
            }
            this.logger.log(`[L3] No email found via Google for ${supplierName}`);
          }

          // === LEVEL 4: Generic email pattern ===
          const domain = this.extractDomain(supplierUrl);
          if (domain) {
            const genericEmail = `info@${domain}`;
            this.logger.log(`[${i + 1}/${suppliers.length}] L4 Generic pattern: ${genericEmail}`);
            await this.createScrapedContact(supplier.id, {
              email: genericEmail,
              source: 'generic_pattern',
            }, 'guessed');
            emitProgress('L4_generic', genericEmail);
            stats.found++;
            continue;
          }

          // === LEVEL 5: Unreachable ===
          this.logger.log(`[${i + 1}/${suppliers.length}] L5 No email source for ${supplierName} — unreachable`);
          await this.createUnreachableContact(supplier.id);
          emitProgress('L5_unreachable');
          stats.notFound++;

        } catch (error) {
          this.logger.error(`Error enriching ${supplierName}: ${error.message}`);
          await this.createUnreachableContact(supplier.id).catch(() => {});
          stats.errors++;
        }
      }

      // Mark campaign as completed
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { apolloEnrichmentStatus: 'completed' },
      });

      this.logger.log(
        `Contact enrichment complete for ${campaignId}: ${stats.found} found, ${stats.notFound} not found, ${stats.errors} errors`,
      );

      return stats;
    } catch (error) {
      this.logger.error(`Contact enrichment failed for ${campaignId}: ${error.message}`);
      await this.prisma.campaign.update({
        where: { id: campaignId },
        data: { apolloEnrichmentStatus: 'failed' },
      });
      throw error;
    }
  }

  // ─── LEVEL 1: Apollo People Search + People Match ─────────────

  /**
   * Search Apollo for people at a given company domain.
   * First tries with sales-relevant titles, then falls back to any person.
   */
  private async searchPeopleByDomain(domain: string, withTitles = true): Promise<ApolloPersonResult[]> {
    await this.rateLimit();

    const body: Record<string, any> = {
      q_organization_domains_list: [domain],
      page: 1,
      per_page: 3,
    };

    if (withTitles) {
      body.person_titles = [
        'sales', 'handlowiec', 'sprzedaż', 'key account',
        'business development', 'account manager', 'commercial',
        'dyrektor handlowy', 'sales manager', 'head of sales',
        'owner', 'ceo', 'managing director', 'prezes', 'właściciel',
        'director', 'manager', 'founder', 'partner', 'geschäftsführer',
      ];
    }

    this.logger.log(`Apollo search: domain=${domain}, withTitles=${withTitles}, apiKey=${this.apiKey ? 'present' : 'MISSING'}`);

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/v1/mixed_people/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.warn(`Apollo people search failed (${response.status}): ${text}`);
        return [];
      }

      const data = await response.json();
      const people: ApolloPersonResult[] = data.people || [];
      this.logger.log(`Apollo search response: domain=${domain}, people=${people.length}, total=${data.pagination?.total_entries || 0}`);
      if (people.length > 0) {
        this.logger.log(`  First result: ${people[0].first_name} ${people[0].last_name} — ${people[0].title || 'no title'}`);
      }
      return people;
    } catch (error) {
      this.logger.warn(`Apollo people search request failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Enrich a single person via Apollo People Match to get verified email.
   */
  private async enrichPerson(person: ApolloPersonResult): Promise<ApolloPersonResult | null> {
    await this.rateLimit();

    const body: Record<string, any> = {
      reveal_personal_emails: false,
      reveal_phone_number: false,
    };

    if (person.id) {
      body.id = person.id;
    } else if (person.email) {
      body.email = person.email;
    } else if (person.linkedin_url) {
      body.linkedin_url = person.linkedin_url;
    } else {
      body.first_name = person.first_name;
      body.last_name = person.last_name;
      body.organization_name = person.organization?.name;
    }

    try {
      const response = await this.fetchWithTimeout(`${this.baseUrl}/v1/people/match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const text = await response.text();
        this.logger.error(`Apollo match failed (${response.status}): ${text}`);
        return null;
      }

      const data: ApolloMatchResponse = await response.json();
      const matched = data.person || null;
      this.logger.log(`Apollo match result: ${matched ? `${matched.first_name} ${matched.last_name} <${matched.email || 'no email'}> status=${matched.email_status}` : 'no match'}`);
      return matched;
    } catch (error) {
      this.logger.error(`Apollo match request failed: ${error.message}`);
      return null;
    }
  }

  // ─── LEVEL 2: Website Scraping ─────────────────────────────────

  /**
   * Scrape company website (homepage + contact subpages) for emails.
   */
  private async scrapeForEmail(websiteUrl: string): Promise<ScrapedEmail | null> {
    const domain = this.extractDomain(websiteUrl);
    if (!domain) return null;

    // Collect emails from all pages
    const allEmails: { email: string; source: string }[] = [];

    // 1. Scrape homepage
    try {
      const homepageContent = await this.scraping.fetchContent(websiteUrl);
      if (homepageContent && !homepageContent.startsWith('Error')) {
        const emails = this.extractEmailsFromText(homepageContent, domain);
        emails.forEach(e => allEmails.push({ email: e, source: 'homepage' }));
      }
    } catch (err) {
      this.logger.debug(`Failed to scrape homepage ${websiteUrl}: ${err.message}`);
    }

    // 2. Scrape contact subpages
    const baseUrl = this.normalizeUrl(websiteUrl);
    for (const path of this.CONTACT_PATHS) {
      if (allEmails.length > 0) break; // Already found emails, skip remaining pages
      try {
        const pageUrl = `${baseUrl}${path}`;
        const content = await this.scraping.fetchContent(pageUrl);
        if (content && !content.startsWith('Error') && content.length > 100) {
          const emails = this.extractEmailsFromText(content, domain);
          emails.forEach(e => allEmails.push({ email: e, source: `page:${path}` }));
        }
      } catch {
        // Subpage doesn't exist — normal
      }
    }

    if (allEmails.length === 0) return null;

    // Pick best email by priority
    const best = this.pickBestEmail(allEmails.map(e => e.email));
    const bestEntry = allEmails.find(e => e.email === best) || allEmails[0];
    return { email: bestEntry.email, source: bestEntry.source };
  }

  // ─── LEVEL 3: Google Search ────────────────────────────────────

  /**
   * Search Google for company email addresses.
   */
  private async searchForEmail(companyName: string, websiteUrl: string): Promise<ScrapedEmail | null> {
    const domain = this.extractDomain(websiteUrl);
    if (!domain) return null;

    // Try different search queries
    const queries = [
      `"${domain}" email kontakt`,
      `"${companyName}" email contact`,
    ];

    for (const query of queries) {
      try {
        const results = await this.googleSearch.searchExtended(query, { num: 5 });
        if (!results || results.length === 0) continue;

        // Extract emails from snippets first (free — no scraping needed)
        const snippetEmails: string[] = [];
        for (const r of results) {
          if (r.snippet) {
            const emails = this.extractEmailsFromText(r.snippet, domain);
            snippetEmails.push(...emails);
          }
        }

        if (snippetEmails.length > 0) {
          const best = this.pickBestEmail(snippetEmails);
          return { email: best, source: `google_snippet` };
        }

        // Scrape top 3 results for emails
        for (const r of results.slice(0, 3)) {
          // Skip scraping the company's own website (already done in L2)
          if (r.link.includes(domain)) continue;

          try {
            const content = await this.scraping.fetchContent(r.link);
            if (content && !content.startsWith('Error')) {
              const emails = this.extractEmailsFromText(content, domain);
              if (emails.length > 0) {
                const best = this.pickBestEmail(emails);
                return { email: best, source: `google:${r.link}` };
              }
            }
          } catch {
            // Skip failed page
          }
        }
      } catch (err) {
        this.logger.debug(`Google search failed for "${query}": ${err.message}`);
      }
    }

    return null;
  }

  // ─── Email Extraction Helpers ──────────────────────────────────

  /**
   * Extract valid emails from text, filtered to the company domain.
   */
  private extractEmailsFromText(text: string, companyDomain: string): string[] {
    const matches = text.match(this.EMAIL_REGEX) || [];

    return [...new Set(
      matches
        .map(e => e.toLowerCase().trim())
        // Must be from the company's domain
        .filter(e => e.endsWith(`@${companyDomain}`))
        // Exclude system/generic emails
        .filter(e => {
          const prefix = e.split('@')[0];
          return !this.EXCLUDED_PREFIXES.some(ex => prefix.startsWith(ex));
        })
        // Exclude image/file-like matches (e.g., image@2x.png captured by regex)
        .filter(e => !e.match(/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i))
    )];
  }

  /**
   * Pick the best email from a list based on prefix priority.
   */
  private pickBestEmail(emails: string[]): string {
    if (emails.length === 0) return '';
    if (emails.length === 1) return emails[0];

    // Score by preferred prefix order
    let bestScore = Infinity;
    let bestEmail = emails[0];

    for (const email of emails) {
      const prefix = email.split('@')[0];
      const idx = this.PREFERRED_PREFIXES.findIndex(p => prefix.startsWith(p));
      const score = idx >= 0 ? idx : this.PREFERRED_PREFIXES.length;

      if (score < bestScore) {
        bestScore = score;
        bestEmail = email;
      }
    }

    return bestEmail;
  }

  // ─── DB Operations ─────────────────────────────────────────────

  /**
   * Create or update a Contact from Apollo data
   */
  private async upsertContact(supplierId: string, person: ApolloPersonResult): Promise<void> {
    // Delete any existing not_found/unreachable placeholder
    await this.prisma.contact.deleteMany({
      where: {
        supplierId,
        emailStatus: { in: ['not_found', 'unreachable'] },
      },
    });

    const existing = await this.prisma.contact.findFirst({
      where: {
        supplierId,
        apolloId: person.id,
      },
    });

    const contactData = {
      name: person.name || `${person.first_name} ${person.last_name}`,
      role: person.title || null,
      email: person.email || null,
      apolloId: person.id || null,
      linkedinUrl: person.linkedin_url || null,
      department: person.departments?.[0] || null,
      seniority: person.seniority || null,
      emailStatus: person.email_status || 'unverified',
      enrichedAt: new Date(),
    };

    if (existing) {
      await this.prisma.contact.update({
        where: { id: existing.id },
        data: contactData,
      });
    } else {
      await this.prisma.contact.create({
        data: {
          supplierId,
          ...contactData,
        },
      });
    }
  }

  /**
   * Create contact from scraped/searched email
   */
  private async createScrapedContact(
    supplierId: string,
    scraped: ScrapedEmail,
    emailStatus: string,
  ): Promise<void> {
    // Delete any existing not_found/unreachable placeholder
    await this.prisma.contact.deleteMany({
      where: {
        supplierId,
        emailStatus: { in: ['not_found', 'unreachable'] },
      },
    });

    await this.prisma.contact.create({
      data: {
        supplierId,
        name: scraped.name || null,
        email: scraped.email,
        emailStatus,
        enrichedAt: new Date(),
      },
    });
  }

  /**
   * Create placeholder for unreachable supplier
   */
  private async createUnreachableContact(supplierId: string): Promise<void> {
    const existing = await this.prisma.contact.findFirst({
      where: {
        supplierId,
        emailStatus: { in: ['not_found', 'unreachable'] },
      },
    });

    if (existing) {
      await this.prisma.contact.update({
        where: { id: existing.id },
        data: { emailStatus: 'unreachable', enrichedAt: new Date() },
      });
      return;
    }

    await this.prisma.contact.create({
      data: {
        supplierId,
        emailStatus: 'unreachable',
        enrichedAt: new Date(),
      },
    });
  }

  // ─── URL Helpers ───────────────────────────────────────────────

  private extractDomain(url: string | null | undefined): string | null {
    if (!url) return null;
    try {
      const hostname = new URL(url).hostname;
      return hostname.replace(/^www\./, '');
    } catch {
      return null;
    }
  }

  private normalizeUrl(url: string): string {
    try {
      const u = new URL(url);
      return `${u.protocol}//${u.hostname}`;
    } catch {
      return url;
    }
  }

  // ─── Network Helpers ───────────────────────────────────────────

  private async fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.FETCH_TIMEOUT_MS);
    try {
      const response = await fetch(url, { ...options, signal: controller.signal });
      return response;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async rateLimit(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.MIN_DELAY_MS) {
      const waitTime = this.MIN_DELAY_MS - elapsed;
      this.logger.debug(`Rate limiting: waiting ${waitTime}ms`);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
    }
    this.lastRequestTime = Date.now();
  }
}
