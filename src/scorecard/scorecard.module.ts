import { Module } from '@nestjs/common';
import { ScorecardService } from './scorecard.service';
import { ScorecardController } from './scorecard.controller';

@Module({
  controllers: [ScorecardController],
  providers: [ScorecardService],
})
export class ScorecardModule {}
