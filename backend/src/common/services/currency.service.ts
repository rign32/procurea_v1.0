import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';

interface NbpRate {
  currency: string; // Full name, e.g., "dolar amerykański"
  code: string; // ISO 4217 code, e.g., "USD"
  mid: number; // Exchange rate vs PLN
}

interface NbpApiResponse {
  table: string; // "A"
  no: string; // Table number, e.g., "045/A/NBP/2026"
  effectiveDate: string; // ISO date string, e.g., "2026-03-03"
  rates: NbpRate[];
}

@Injectable()
export class CurrencyService {
  private readonly logger = new Logger(CurrencyService.name);
  private readonly NBP_API_URL = 'https://api.nbp.pl/api/exchangerates/tables/A/?format=json';
  private readonly MAX_RETRIES = 3;
  private readonly REQUEST_TIMEOUT_MS = 10000;

  // In-memory cache for fast lookups
  private ratesCache: Map<string, number> | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Convert amount from one currency to another
   * @param amount - Amount to convert
   * @param fromCurrency - Source currency code (e.g., "EUR")
   * @param toCurrency - Target currency code (e.g., "PLN")
   * @returns Converted amount, or null if conversion impossible
   */
  async convert(
    amount: number,
    fromCurrency: string,
    toCurrency: string,
  ): Promise<number | null> {
    // Same currency - no conversion needed
    if (fromCurrency === toCurrency) {
      return amount;
    }

    // Get exchange rates
    const rates = await this.getLatestRates();

    // PLN is the base currency in NBP - rate is always 1
    const fromRate = fromCurrency === 'PLN' ? 1 : rates.get(fromCurrency);
    const toRate = toCurrency === 'PLN' ? 1 : rates.get(toCurrency);

    // Check if we have both rates
    if (fromRate == null || toRate == null) {
      this.logger.warn(`Missing exchange rate for ${fromCurrency} or ${toCurrency}`);
      return null;
    }

    // Cross-conversion via PLN
    // Example: 100 USD → EUR = (100 × USD_to_PLN) ÷ EUR_to_PLN
    return (amount * fromRate) / toRate;
  }

  /**
   * Get latest exchange rates from cache or database
   * @returns Map of currency code → rate to PLN
   */
  async getLatestRates(): Promise<Map<string, number>> {
    const now = Date.now();

    // Return cached rates if fresh
    if (this.ratesCache && (now - this.cacheTimestamp) < this.CACHE_TTL_MS) {
      return this.ratesCache;
    }

    // Fetch from database
    const rates = await this.getLatestRatesFromDb();

    if (rates.length === 0) {
      // First run - fetch immediately
      this.logger.log('No exchange rates in database, fetching from NBP...');
      await this.fetchAndStoreRates();
      return this.getLatestRates(); // Recursive call
    }

    // Check staleness
    const latestDate = rates[0].effectiveDate;
    const ageInDays = (now - latestDate.getTime()) / (1000 * 60 * 60 * 24);

    if (ageInDays > 3) {
      this.logger.warn(`Currency rates are ${ageInDays.toFixed(1)} days old (last: ${latestDate.toISOString().split('T')[0]})`);
    }

    // Convert to Map for fast lookups
    this.ratesCache = new Map(rates.map(r => [r.currencyCode, r.rateToPln]));
    this.cacheTimestamp = now;

    return this.ratesCache;
  }

  /**
   * Fetch fresh rates from NBP API and store in database
   * Called by cron job daily
   */
  async fetchAndStoreRates(): Promise<void> {
    try {
      this.logger.log('Fetching exchange rates from NBP API...');
      const nbpData = await this.fetchRatesFromNBP();

      await this.storeRates(
        nbpData.rates,
        new Date(nbpData.effectiveDate),
        nbpData.no,
      );

      // Invalidate cache
      this.ratesCache = null;

      this.logger.log(`Successfully stored ${nbpData.rates.length} exchange rates for ${nbpData.effectiveDate}`);
    } catch (error) {
      this.logger.error(`Failed to fetch and store exchange rates: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Cron job: Fetch rates daily at 14:15 CET
   * NBP publishes new rates around 14:00 CET on business days
   */
  @Cron('15 14 * * 1-5', { timeZone: 'Europe/Warsaw' })
  async scheduledRateUpdate() {
    this.logger.log('Starting scheduled currency rate update...');
    try {
      await this.fetchAndStoreRates();
      this.logger.log('Currency rates updated successfully');
    } catch (error) {
      this.logger.error('Failed to update currency rates:', error);
      // Don't throw - gracefully degrade to existing rates
    }
  }

  /**
   * Get exchange rate for specific currency vs PLN
   * @param currencyCode - Currency code (e.g., "USD")
   * @returns Rate to PLN, or null if not found
   */
  async getRateToPln(currencyCode: string): Promise<number | null> {
    if (currencyCode === 'PLN') {
      return 1;
    }

    const rates = await this.getLatestRates();
    return rates.get(currencyCode) ?? null;
  }

  /**
   * Fetch rates from NBP API with retry logic
   * @private
   */
  private async fetchRatesFromNBP(): Promise<NbpApiResponse> {
    let lastError: any;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.REQUEST_TIMEOUT_MS);

        const response = await fetch(this.NBP_API_URL, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`NBP API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        return data[0]; // NBP returns array with single table
      } catch (error) {
        lastError = error;
        this.logger.warn(`NBP API attempt ${attempt}/${this.MAX_RETRIES} failed: ${error.message}`);

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: 1s, 2s, 4s
          const delayMs = 1000 * Math.pow(2, attempt - 1);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    throw new Error(`NBP API failed after ${this.MAX_RETRIES} attempts: ${lastError.message}`);
  }

  /**
   * Store rates in database
   * @private
   */
  private async storeRates(
    rates: NbpRate[],
    effectiveDate: Date,
    tableNumber: string,
  ): Promise<void> {
    // Use upsert to handle duplicates (e.g., if cron runs twice)
    for (const rate of rates) {
      await this.prisma.currencyExchangeRate.upsert({
        where: {
          currencyCode_effectiveDate: {
            currencyCode: rate.code,
            effectiveDate,
          },
        },
        update: {
          rateToPln: rate.mid,
          currencyName: rate.currency,
          tableNumber,
        },
        create: {
          currencyCode: rate.code,
          currencyName: rate.currency,
          rateToPln: rate.mid,
          effectiveDate,
          tableNumber,
        },
      });
    }
  }

  /**
   * Get latest rates from database (most recent per currency)
   * @private
   */
  private async getLatestRatesFromDb() {
    // Get the most recent effectiveDate first
    const latestRecord = await this.prisma.currencyExchangeRate.findFirst({
      orderBy: { effectiveDate: 'desc' },
      select: { effectiveDate: true },
    });

    if (!latestRecord) {
      return [];
    }

    // Get all rates for that date
    return this.prisma.currencyExchangeRate.findMany({
      where: { effectiveDate: latestRecord.effectiveDate },
      orderBy: { currencyCode: 'asc' },
    });
  }
}
