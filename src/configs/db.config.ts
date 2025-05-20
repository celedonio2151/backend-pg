import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { User } from 'src/router/user/entities/user.entity';
import { Role } from 'src/router/roles/entities/role.entity';
import { WaterMeter } from 'src/router/water-meters/entities/water-meter.entity';
import { BoardDirector } from 'src/router/board-directors/entities/board-director.entity';
import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';
import { Invoice } from 'src/router/invoices/entities/invoice.entity';
import { Billing } from 'src/router/billing/entities/billing.entity';

@Injectable()
export class TypeOrmConfigService implements TypeOrmOptionsFactory {
  constructor(private configService: ConfigService) {
    // console.log(configService.get('DB_HOST'));
    // console.log(configService.get('DB_PORT'));
    // console.log(configService.get('DB_USER'));
    // console.log(configService.get('DB_PASSWORD'));
    // console.log(configService.get('DB_NAME'));
  }
  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'mysql',
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      // username: 'root',
      username: this.configService.get('DB_USER'),
      password: this.configService.get('DB_PASSWORD'),
      database: this.configService.get('DB_NAME'),
      entities: [
        User,
        Role,
        WaterMeter,
        MeterReading,
        BoardDirector,
        Invoice,
        Billing,
      ],
      // migrations: [AdminCreateDefault1631646226711],
      synchronize: process.env.NODE_ENV !== 'production', // false
      migrationsRun: process.env.NODE_ENV !== 'production', // Ejecutar migraciones solo si NO estamos en producción
      logging: process.env.NODE_ENV === 'development', // Solo loguear en desarrollo
      logger: 'file',
    };
  }
}
