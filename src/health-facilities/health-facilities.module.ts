import { Module } from '@nestjs/common';
import { HealthFacilitiesService } from './health-facilities.service';
import { HealthFacilitiesController } from './health-facilities.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HealthFacilitiesController],
  providers: [HealthFacilitiesService],
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class HealthFacilitiesModule { }
