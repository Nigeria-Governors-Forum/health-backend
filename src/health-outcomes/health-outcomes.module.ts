import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';
import { HealthOutcomesController } from './health-outcomes.controller';
import { HealthOutcomesService } from './health-outcomes.service';

@Module({
  controllers: [HealthOutcomesController],
  providers: [HealthOutcomesService],
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class HealthOutcomesModule {}
