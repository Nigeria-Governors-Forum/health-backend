import { Module } from '@nestjs/common';
import { DemographyService } from './demography.service';
import { DemographyController } from './demography.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [DemographyController],
  providers: [DemographyService],
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class DemographyModule { }
