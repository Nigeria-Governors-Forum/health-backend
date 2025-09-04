import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UserModule } from './user/user.module';
import { APP_GUARD } from '@nestjs/core';
import { RolesGuard } from './user/roles.guard';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtAuthGuard } from './user/jwt-auth.guard';
import { DashboardModule } from './dashboard/dashboard.module';
import { DemographyModule } from './demography/demography.module';
import { HealthFinanceModule } from './health-finance/health-finance.module';
import { ZonalHealthFinanceModule } from './zonal-health-finance/zonal-health-finance.module';
import { HumanResourceModule } from './human-resource/human-resource.module';
import { HealthFacilitiesModule } from './health-facilities/health-facilities.module';
import { ZonalHealthFacilitiesModule } from './zonal-health-facilities/zonal-health-facilities.module';
import { ScorecardModule } from './scorecard/scorecard.module';

@Module({
  imports: [
    PrismaModule,
    UserModule,
    JwtModule,
    PassportModule,
    DashboardModule,
    DemographyModule,
    HealthFinanceModule,
    ZonalHealthFinanceModule,
    HumanResourceModule,
    HealthFacilitiesModule,
    ZonalHealthFacilitiesModule,
    ScorecardModule
  ],
  controllers: [AppController],
  providers: [AppService,
    // JwtService,
    // {
    //   provide: APP_GUARD,
    //   useClass: JwtAuthGuard,
    // },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    }],
})
export class AppModule { }
