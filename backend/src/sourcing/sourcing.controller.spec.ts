import { Test, TestingModule } from '@nestjs/testing';
import { SourcingController } from './sourcing.controller';

describe('SourcingController', () => {
  let controller: SourcingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourcingController],
    }).compile();

    controller = module.get<SourcingController>(SourcingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
