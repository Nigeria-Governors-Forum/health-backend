import { Test, TestingModule } from '@nestjs/testing';
import { HumanResourceService } from './human-resource.service';

describe('HumanResourceService', () => {
  let service: HumanResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [HumanResourceService],
    }).compile();

    service = module.get<HumanResourceService>(HumanResourceService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
