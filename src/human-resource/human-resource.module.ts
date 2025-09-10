import { Module } from '@nestjs/common';
import { HumanResourceService } from './human-resource.service';
import { HumanResourceController } from './human-resource.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';

@Module({
  controllers: [HumanResourceController],
  providers: [HumanResourceService],
  imports: [PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
  ],
})
export class HumanResourceModule { }
