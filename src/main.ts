import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT: number = parseInt(process.env.PORT) || 3000;
  const app = await NestFactory.create(AppModule);
  const config = new DocumentBuilder()
    .setTitle('The Mind')
    .setDescription('The Mind API description')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
}
bootstrap();
