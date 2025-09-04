import { Test, TestingModule } from '@nestjs/testing';
import { ScorecardController } from './scorecard.controller';
import { ScorecardService } from './scorecard.service';

describe('ScorecardController', () => {
  let controller: ScorecardController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScorecardController],
      providers: [ScorecardService],
    }).compile();

    controller = module.get<ScorecardController>(ScorecardController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
