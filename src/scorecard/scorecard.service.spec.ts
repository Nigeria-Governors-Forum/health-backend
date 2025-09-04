import { Test, TestingModule } from '@nestjs/testing';
import { ScorecardService } from './scorecard.service';

describe('ScorecardService', () => {
  let service: ScorecardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScorecardService],
    }).compile();

    service = module.get<ScorecardService>(ScorecardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
