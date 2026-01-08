import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

import { ConfigService } from '@nestjs/config';
import { Config } from 'src/configs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: true });
  app.use(helmet());
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
    .setTitle('Mosoj Llajta API - Gestión de Agua Potable')
    .setDescription(
      `
      API REST para la gestión de pagos por agua potable.
      
      ## Autenticación
      La mayoría de endpoints requieren autenticación JWT. 
      Use el endpoint /auth/admin/signin para obtener tokens.
      
      ## Rate Limiting
      Los endpoints tienen límite de 100 requests por minuto.
    `,
    )
    .setVersion('1.0.0')
    .setContact('Soporte', 'mailto:soporte@mosojllajta.com', '')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Ingrese el token JWT sin el prefijo "Bearer"',
    })
    .addTag('Authentication', 'Endpoints de autenticación y autorización')
    .addTag('User', 'Gestión de usuarios del sistema')
    .addTag('Facturas (Recibos de agua)', 'Generación y gestión de facturas')
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
