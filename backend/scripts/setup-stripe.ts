/**
 * Setup Stripe products, prices, and tax rates for Procurea.
 * Run once: npx dotenv -e .env.local -- npx ts-node scripts/setup-stripe.ts
 * Idempotent — safe to run multiple times.
 */
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});

async function setup() {
    console.log('Setting up Stripe for Procurea...\n');

    // 1. Create or find 23% Polish VAT tax rate
    const taxRates = await stripe.taxRates.list({ limit: 100 });
    let vatRate = taxRates.data.find(tr => tr.percentage === 23 && tr.country === 'PL' && tr.active);
    if (!vatRate) {
        vatRate = await stripe.taxRates.create({
            display_name: 'VAT',
            description: 'Polski VAT 23%',
            percentage: 23,
            country: 'PL',
            inclusive: false,
            jurisdiction: 'PL',
        });
        console.log('Created VAT tax rate:', vatRate.id);
    } else {
        console.log('VAT tax rate already exists:', vatRate.id);
    }

    // 2. Create subscription product + prices (599 PLN/month + $399 USD/month)
    const products = await stripe.products.list({ limit: 100 });
    let subProduct = products.data.find(p => p.metadata?.type === 'unlimited_subscription' && p.active);

    if (!subProduct) {
        subProduct = await stripe.products.create({
            name: 'Procurea — Bez limitu',
            description: 'Nieograniczone wyszukiwania dostawców co miesiąc / Unlimited supplier searches every month',
            metadata: { type: 'unlimited_subscription' },
        });
        console.log('Created subscription product:', subProduct.id);
    } else {
        console.log('Subscription product already exists:', subProduct.id);
    }

    // Check if PLN monthly price exists (599 PLN)
    const prices = await stripe.prices.list({ product: subProduct.id, limit: 20 });
    let subPricePln = prices.data.find(p =>
        p.unit_amount === 59900 &&
        p.currency === 'pln' &&
        p.recurring?.interval === 'month' &&
        p.active
    );

    if (!subPricePln) {
        subPricePln = await stripe.prices.create({
            product: subProduct.id,
            unit_amount: 59900, // 599 PLN in grosze
            currency: 'pln',
            recurring: { interval: 'month' },
        });
        console.log('Created PLN subscription price:', subPricePln.id);
    } else {
        console.log('PLN subscription price already exists:', subPricePln.id);
    }

    // Check if USD monthly price exists ($399)
    let subPriceUsd = prices.data.find(p =>
        p.unit_amount === 39900 &&
        p.currency === 'usd' &&
        p.recurring?.interval === 'month' &&
        p.active
    );

    if (!subPriceUsd) {
        subPriceUsd = await stripe.prices.create({
            product: subProduct.id,
            unit_amount: 39900, // $399 in cents
            currency: 'usd',
            recurring: { interval: 'month' },
        });
        console.log('Created USD subscription price:', subPriceUsd.id);
    } else {
        console.log('USD subscription price already exists:', subPriceUsd.id);
    }

    // 3. Configure Stripe account settings for Polish invoices
    try {
        await stripe.accounts.update('', {
            settings: {
                payments: {
                    statement_descriptor: 'PROCUREA',
                },
            },
        } as any);
        console.log('Updated account settings');
    } catch (e) {
        console.log('Could not update account settings (expected in test mode)');
    }

    console.log('\n========================================');
    console.log('  ADD THESE TO .env.local:');
    console.log('========================================');
    console.log(`STRIPE_VAT_TAX_RATE_ID=${vatRate.id}`);
    console.log(`STRIPE_UNLIMITED_PRICE_ID=${subPricePln.id}`);
    console.log(`STRIPE_UNLIMITED_PRICE_ID_USD=${subPriceUsd.id}`);
    console.log('========================================\n');
    console.log('Next steps:');
    console.log('1. Copy the values above to backend/.env.local');
    console.log('2. Run: stripe listen --forward-to localhost:3010/billing/webhook');
    console.log('3. Copy the webhook secret (whsec_xxx) to STRIPE_WEBHOOK_SECRET in .env.local');
}

setup().catch(err => {
    console.error('Setup failed:', err.message);
    process.exit(1);
});
