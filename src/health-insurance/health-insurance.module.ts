import { Module } from '@nestjs/common';
import { HealthInsuranceService } from './health-insurance.service';
import { HealthInsuranceController } from './health-insurance.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HealthInsuranceController],
  providers: [HealthInsuranceService],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  exports: [HealthInsuranceService],
})
export class HealthInsuranceModule {}

