import { Module } from '@nestjs/common';
import { ScorecardService } from './scorecard.service';
import { ScorecardController } from './scorecard.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [ScorecardController],
  providers: [ScorecardService],
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class ScorecardModule { }
