/**
 * Test application bootstrap.
 * Creates a NestJS app with mocked external services for E2E testing.
 */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppModule } from '../../src/app.module';
import { EmailService } from '../../src/email/email.service';
import { NotificationService } from '../../src/common/services/notification.service';
import { TranslationService } from '../../src/common/services/translation.service';
import { CurrencyService } from '../../src/common/services/currency.service';
import { PrismaService } from '../../src/prisma/prisma.service';
import {
    createMockEmailService,
    createMockNotificationService,
    createMockTranslationService,
    createMockCurrencyService,
} from './mocks';

export interface TestContext {
    app: INestApplication;
    prisma: PrismaService;
    jwtService: JwtService;
    mocks: {
        emailService: ReturnType<typeof createMockEmailService>;
        notificationService: ReturnType<typeof createMockNotificationService>;
        translationService: ReturnType<typeof createMockTranslationService>;
        currencyService: ReturnType<typeof createMockCurrencyService>;
    };
}

export async function createTestApp(): Promise<TestContext> {
    const mockEmail = createMockEmailService();
    const mockNotification = createMockNotificationService();
    const mockTranslation = createMockTranslationService();
    const mockCurrency = createMockCurrencyService();

    const moduleFixture: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
    })
        .overrideProvider(EmailService).useValue(mockEmail)
        .overrideProvider(NotificationService).useValue(mockNotification)
        .overrideProvider(TranslationService).useValue(mockTranslation)
        .overrideProvider(CurrencyService).useValue(mockCurrency)
        .compile();

    const app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();

    const prisma = moduleFixture.get<PrismaService>(PrismaService);
    const jwtService = moduleFixture.get<JwtService>(JwtService);

    return {
        app,
        prisma,
        jwtService,
        mocks: {
            emailService: mockEmail,
            notificationService: mockNotification,
            translationService: mockTranslation,
            currencyService: mockCurrency,
        },
    };
}

/**
 * Generate a valid JWT token for testing authenticated endpoints.
 */
export function getAuthToken(jwtService: JwtService, userId: string, email = 'test@example.com'): string {
    return jwtService.sign({ sub: userId, userId, email });
}

/**
 * Clean up test data from all RFQ-related tables.
 * Call between test suites for isolation.
 */
export async function cleanupTestData(prisma: PrismaService): Promise<void> {
    // Delete in order respecting foreign key constraints
    await prisma.sequenceExecution.deleteMany({});
    await prisma.offerPriceTier.deleteMany({});
    await prisma.offer.deleteMany({});
    await prisma.rfqRequest.deleteMany({});
    await prisma.contact.deleteMany({});
    await prisma.supplier.deleteMany({});
    await prisma.campaign.deleteMany({});
}
