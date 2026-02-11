import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RedisService } from './redis.service';

describe('RedisService', () => {
    let service: RedisService;
    let mockRedisClient: any;

    beforeEach(async () => {
        mockRedisClient = {
            get: jest.fn(),
            set: jest.fn(),
            setex: jest.fn(),
            del: jest.fn(),
            quit: jest.fn(),
        };

        const module: TestingModule = await Test.createTestingModule({
            providers: [
                RedisService,
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn((key: string) => {
                            // Return null to disable Redis in tests
                            if (key === 'REDIS_URL') return null;
                            return null;
                        }),
                    },
                },
            ],
        }).compile();

        service = module.get<RedisService>(RedisService);
        // Inject mock client
        (service as any).client = mockRedisClient;
        (service as any).isEnabled = true;
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('Magic Code Storage', () => {
        describe('setMagicCode', () => {
            it('should store magic code with TTL', async () => {
                mockRedisClient.setex.mockResolvedValue('OK');

                await service.setMagicCode('test@example.com', '123456', 'user-123', 600);

                expect(mockRedisClient.setex).toHaveBeenCalledWith(
                    'auth:magic:test@example.com',
                    600,
                    expect.stringContaining('"code":"123456"')
                );
            });

            it('should lowercase email for key', async () => {
                mockRedisClient.setex.mockResolvedValue('OK');

                await service.setMagicCode('Test@EXAMPLE.com', '123456', 'user-123', 600);

                expect(mockRedisClient.setex).toHaveBeenCalledWith(
                    'auth:magic:test@example.com',
                    600,
                    expect.any(String)
                );
            });
        });

        describe('verifyAndDeleteMagicCode', () => {
            it('should return userId when code matches', async () => {
                const storedData = JSON.stringify({
                    code: '123456',
                    userId: 'user-123',
                    createdAt: Date.now()
                });
                mockRedisClient.get.mockResolvedValue(storedData);
                mockRedisClient.del.mockResolvedValue(1);

                const result = await service.verifyAndDeleteMagicCode('test@example.com', '123456');

                expect(result).toBe('user-123');
                expect(mockRedisClient.del).toHaveBeenCalledWith('auth:magic:test@example.com');
            });

            it('should return null when code does not match', async () => {
                const storedData = JSON.stringify({
                    code: '123456',
                    userId: 'user-123',
                    createdAt: Date.now()
                });
                mockRedisClient.get.mockResolvedValue(storedData);

                const result = await service.verifyAndDeleteMagicCode('test@example.com', '000000');

                expect(result).toBeNull();
                expect(mockRedisClient.del).not.toHaveBeenCalled();
            });

            it('should return null when no code exists', async () => {
                mockRedisClient.get.mockResolvedValue(null);

                const result = await service.verifyAndDeleteMagicCode('test@example.com', '123456');

                expect(result).toBeNull();
            });
        });
    });

    describe('Exchange Token Storage', () => {
        describe('setExchangeToken', () => {
            it('should store exchange token with 30s TTL', async () => {
                mockRedisClient.setex.mockResolvedValue('OK');

                await service.setExchangeToken('token-abc123', 'user-123');

                expect(mockRedisClient.setex).toHaveBeenCalledWith(
                    'auth:exchange:token-abc123',
                    30,
                    'user-123'
                );
            });
        });

        describe('getAndDeleteExchangeToken', () => {
            it('should return userId and delete token when valid', async () => {
                mockRedisClient.get.mockResolvedValue('user-123');
                mockRedisClient.del.mockResolvedValue(1);

                const result = await service.getAndDeleteExchangeToken('token-abc123');

                expect(result).toBe('user-123');
                expect(mockRedisClient.del).toHaveBeenCalledWith('auth:exchange:token-abc123');
            });

            it('should return null when token not found', async () => {
                mockRedisClient.get.mockResolvedValue(null);

                const result = await service.getAndDeleteExchangeToken('invalid-token');

                expect(result).toBeNull();
            });
        });
    });

    describe('OAuth State Storage', () => {
        describe('setOAuthState', () => {
            it('should store OAuth state with 10min TTL (default)', async () => {
                mockRedisClient.setex.mockResolvedValue('OK');
                const stateData = { authMode: 'login', origin: 'app' };

                await service.setOAuthState('state-123', stateData);

                expect(mockRedisClient.setex).toHaveBeenCalledWith(
                    'oauth:state:state-123',
                    600, // Default TTL is 10 minutes
                    JSON.stringify(stateData)
                );
            });
        });

        describe('getAndDeleteOAuthState', () => {
            it('should return state data and delete when valid', async () => {
                const stateData = { authMode: 'login', origin: 'app' };
                mockRedisClient.get.mockResolvedValue(JSON.stringify(stateData));
                mockRedisClient.del.mockResolvedValue(1);

                const result = await service.getAndDeleteOAuthState('state-123');

                expect(result).toEqual(stateData);
                expect(mockRedisClient.del).toHaveBeenCalledWith('oauth:state:state-123');
            });

            it('should return null when state not found', async () => {
                mockRedisClient.get.mockResolvedValue(null);

                const result = await service.getAndDeleteOAuthState('invalid-state');

                expect(result).toBeNull();
            });
        });
    });

    describe('Disabled Mode', () => {
        beforeEach(() => {
            (service as any).isEnabled = false;
            (service as any).client = null;
        });

        it('should gracefully handle setMagicCode when disabled', async () => {
            await expect(service.setMagicCode('test@example.com', '123456', 'user-123', 600))
                .resolves.not.toThrow();
        });

        it('should return null for verifyAndDeleteMagicCode when disabled', async () => {
            const result = await service.verifyAndDeleteMagicCode('test@example.com', '123456');
            expect(result).toBeNull();
        });

        it('should return null for getAndDeleteExchangeToken when disabled', async () => {
            const result = await service.getAndDeleteExchangeToken('token');
            expect(result).toBeNull();
        });
    });
});
