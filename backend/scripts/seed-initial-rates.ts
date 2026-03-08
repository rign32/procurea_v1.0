import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInitialRates() {
  console.log('Fetching exchange rates from NBP API...');

  try {
    // Fetch today's rates from NBP
    const response = await fetch('https://api.nbp.pl/api/exchangerates/tables/A/?format=json');

    if (!response.ok) {
      throw new Error(`NBP API returned ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const [table] = data;

    if (!table || !table.rates) {
      throw new Error('Invalid response from NBP API');
    }

    console.log(`Processing ${table.rates.length} exchange rates for ${table.effectiveDate}...`);

    // Store rates in database
    let stored = 0;
    for (const rate of table.rates) {
      await prisma.currencyExchangeRate.upsert({
        where: {
          currencyCode_effectiveDate: {
            currencyCode: rate.code,
            effectiveDate: new Date(table.effectiveDate),
          },
        },
        update: {
          rateToPln: rate.mid,
          currencyName: rate.currency,
          tableNumber: table.no,
        },
        create: {
          currencyCode: rate.code,
          currencyName: rate.currency,
          rateToPln: rate.mid,
          effectiveDate: new Date(table.effectiveDate),
          tableNumber: table.no,
        },
      });
      stored++;
    }

    console.log(`✓ Successfully seeded ${stored} exchange rates for ${table.effectiveDate}`);
    console.log(`  Table: ${table.no}`);
    console.log(`  Sample rates:`);
    console.log(`    1 USD = ${table.rates.find((r: any) => r.code === 'USD')?.mid || 'N/A'} PLN`);
    console.log(`    1 EUR = ${table.rates.find((r: any) => r.code === 'EUR')?.mid || 'N/A'} PLN`);
    console.log(`    1 GBP = ${table.rates.find((r: any) => r.code === 'GBP')?.mid || 'N/A'} PLN`);
  } catch (error) {
    console.error('Failed to seed exchange rates:', error);
    throw error;
  }
}

seedInitialRates()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
