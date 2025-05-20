import { Module } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from 'src/app.module';
import { DataSource } from 'typeorm';
import { Role } from 'src/router/roles/entities/role.entity';
import { User } from 'src/router/user/entities/user.entity';
import { WaterMeter } from 'src/router/water-meters/entities/water-meter.entity';
import { MeterReading } from 'src/router/meter-readings/entities/meter-reading.entity';
import { faker } from '@faker-js/faker';

@Module({})
export class SeedersModule {
  async onModuleInit() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const dataSource = app.get(DataSource);

    console.log('🌱 Seeding base de datos...');

    // Crear roles
    // const userRole = dataSource.manager.create(Role, { name: 'USER' });
    // await dataSource.manager.save(userRole);
    const userRole = {
      name: 'USER',
      description: 'Usuario normal',
    };

    // Utilidad para calcular balance
    const calcularBalance = (cubicMeters: number): number => {
      if (cubicMeters <= 6) return 20;
      if (cubicMeters <= 10) return 20 + 6 * (cubicMeters - 6);
      if (cubicMeters <= 30) return 44 + 14 * (cubicMeters - 10);
      return 324 + 20 * (cubicMeters - 30); // Ejemplo para más de 30 m³
    };

    // Fechas de lectura desde enero 2023 hasta mayo 2025
    const generarFechasMensuales = (): Date[] => {
      const fechas: Date[] = [];
      const start = new Date('2023-01-20');
      const end = new Date('2025-05-20');
      let current = new Date(start);
      while (current <= end) {
        fechas.push(new Date(current));
        current.setMonth(current.getMonth() + 1);
      }
      return fechas;
    };

    const fechasLectura = generarFechasMensuales();

    for (let i = 0; i < 100; i++) {
      // Crear usuario
      const user = dataSource.manager.create(User, {
        name: faker.person.firstName(),
        surname: faker.person.lastName(),
        ci: faker.number.int({ min: 100000, max: 999999999 }),
        phoneNumber: faker.phone.number(),
        status: true,
        email: faker.internet.email(),
        roles: [userRole],
      });
      await dataSource.manager.save(user);

      // Crear medidor
      const waterMeter = dataSource.manager.create(WaterMeter, {
        ci: user.ci,
        meter_number: faker.number.int({ min: 100000, max: 99999999 }),
        name: user.name,
        surname: user.surname,
      });
      await dataSource.manager.save(waterMeter);

      // Crear lecturas mensuales
      let valorAnterior = 0;
      const lecturas: MeterReading[] = [];

      for (const fecha of fechasLectura) {
        const incremento = faker.number.int({ min: 0, max: 15 }); // metros cúbicos consumidos
        const valorActual = valorAnterior + incremento;

        const lectura = dataSource.manager.create(MeterReading, {
          date: fecha,
          beforeMonth: {
            date: fecha,
            value: valorAnterior,
          },
          lastMonth: {
            date: fecha,
            value: valorActual,
          },
          cubicMeters: incremento,
          description: faker.lorem.sentence(),
          balance: calcularBalance(incremento),
          waterMeter: waterMeter,
        });

        lecturas.push(lectura);
        valorAnterior = valorActual;
      }

      await dataSource.manager.save(lecturas);

      if ((i + 1) % 10 === 0) {
        console.log(`✅ ${i + 1} usuarios generados con lecturas`);
      }
    }

    console.log('✅ Seeding completado con éxito');
    await app.close();
  }
}
