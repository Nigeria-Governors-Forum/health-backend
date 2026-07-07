import { Module } from '@nestjs/common';
import { ServiceCoverageService } from './service-coverage.service';
import { ServiceCoverageController } from './service-coverage.controller';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ServiceCoverageController],
  providers: [ServiceCoverageService],
})
export class ServiceCoverageModule {}
