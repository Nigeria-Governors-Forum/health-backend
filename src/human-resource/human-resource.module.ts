import { Module } from '@nestjs/common';
import { HumanResourceService } from './human-resource.service';
import { HumanResourceController } from './human-resource.controller';

@Module({
  controllers: [HumanResourceController],
  providers: [HumanResourceService],
})
export class HumanResourceModule {}
