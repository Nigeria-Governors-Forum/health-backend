import { Module } from '@nestjs/common';
import { ThreatAssessmentService } from './threat-assessment.service';
import { ThreatAssessmentController } from './threat-assessment.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [ThreatAssessmentController],
  providers: [ThreatAssessmentService],
  imports: [
    PrismaModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  // exports: [ThreatAssessmentService],
})
export class ThreatAssessmentModule { }
