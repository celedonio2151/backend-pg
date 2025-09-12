import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';

import { APP_GUARD } from '@nestjs/core';
import { Config } from 'src/configs/config';
import { TypeOrmConfigService } from 'src/configs/db.config';
import { envValidationSchema } from 'src/configs/env.validation.joi';
import { AuthModule } from 'src/router/auth/auth.module';
import { BillingModule } from 'src/router/billing/billing.module';
import { BoardDirectorsModule } from 'src/router/board-directors/board-directors.module';
import { InvoicesModule } from 'src/router/invoices/invoices.module';
import { MeterReadingsModule } from 'src/router/meter-readings/meter-readings.module';
import { UserModule } from 'src/router/user/user.module';
import { WaterMetersModule } from 'src/router/water-meters/water-meters.module';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { BankModule } from './router/bank/bank.module';
import { PrinterModule } from './router/printer/printer.module';
import { ReportModule } from './router/report/report.module';
import { InvoiceTableModule } from './router/invoice-table/invoice-table.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [Config],
      validationSchema: envValidationSchema,
    }),
    TypeOrmModule.forRootAsync({ useClass: TypeOrmConfigService }),
    AuthModule,
    UserModule,
    WaterMetersModule,
    MeterReadingsModule,
    BillingModule,
    InvoicesModule,
    BoardDirectorsModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
    }),
    PrinterModule,
    ReportModule,
    BankModule,
    InvoiceTableModule,
    // SeedersModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
