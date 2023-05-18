import { ValidationPipe } from '@nestjs/common';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('API Estag.io')
    .setDescription(
      'API for "Estag.io" mobile app',
    )
    .setVersion('1.0')
    .addTag('auth')
    .addTag('opportunities')
    .addTag('processSteps')
    .addTag('internships')
    .addTag('reviews')
    .addBearerAuth()
    .build();
  const options: SwaggerDocumentOptions = {
    operationIdFactory: (
      controllerKey: string,
      methodKey: string,
    ) => methodKey,
  };
  const document = SwaggerModule.createDocument(
    app,
    config,
    options,
  );
  SwaggerModule.setup('api', app, document);

  await app.listen(3333);
  console.log('API running on port 3333');
}
bootstrap();
