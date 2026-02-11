import { Test, TestingModule } from '@nestjs/testing';
import { SourcingService } from './sourcing.service';

describe('SourcingService', () => {
  let service: SourcingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SourcingService],
    }).compile();

    service = module.get<SourcingService>(SourcingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
