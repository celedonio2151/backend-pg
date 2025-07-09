import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { ConfigService } from '@nestjs/config';
import { Config } from 'src/configs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.enableCors({
    origin: [Config().FRONTEND], // cambia esto según el dominio de tu frontend
    methods: 'GET,POST,PATCH, DELETE',
    credentials: true,
  });
  // app.use(compression()); // Comprimir respuestas
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  // ===============  SWAGGER DOC ===============
  const configDocument = new DocumentBuilder()
    .setTitle('Mosoj Llajta API Gestión de pagos por agua potable')
    .setDescription(
      'Documentacion del backend desarrollada en Nestjs y TypeORM para la gestion de pagos por agua potable',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, configDocument);
  SwaggerModule.setup('api/v1/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get('PORT');
  await app.listen(port ?? 4001, '0.0.0.0', () => {
    console.log(`Server is on http://127.0.0.1:${port}/api/v1`);
    console.log(`Server frontend is on http://127.0.0.1:${port}`);
    console.log(`Server frontend is on http://0.0.0.0:${port}`);
  });
}
bootstrap();
