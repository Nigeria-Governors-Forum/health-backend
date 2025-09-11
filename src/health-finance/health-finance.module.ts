import { Module } from '@nestjs/common';
import { HealthFinanceService } from './health-finance.service';
import { HealthFinanceController } from './health-finance.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HealthFinanceController],
  providers: [HealthFinanceService],
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class HealthFinanceModule { }
