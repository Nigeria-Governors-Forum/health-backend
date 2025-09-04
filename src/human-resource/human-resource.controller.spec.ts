import { Test, TestingModule } from '@nestjs/testing';
import { HumanResourceController } from './human-resource.controller';
import { HumanResourceService } from './human-resource.service';

describe('HumanResourceController', () => {
  let controller: HumanResourceController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HumanResourceController],
      providers: [HumanResourceService],
    }).compile();

    controller = module.get<HumanResourceController>(HumanResourceController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
