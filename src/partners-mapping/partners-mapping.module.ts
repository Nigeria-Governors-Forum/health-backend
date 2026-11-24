import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PartnersMappingController } from './partners-mapping.controller';
import { PartnersMappingService } from './partners-mapping.service';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
  controllers: [PartnersMappingController],
  providers: [PartnersMappingService],
  exports: [PartnersMappingService],
})
export class PartnersMappingModule {}
