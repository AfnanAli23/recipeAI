import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import helmet from 'helmet';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 1) Helmet sets safe HTTP headers (no sniffing, no framing, HSTS ...).
  app.use(helmet());

  // 2) CORS: only OUR frontend's origin may call this API from a browser.
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  // 3) Validation: every incoming body is checked against its DTO class.
  //    whitelist            -> silently strips properties the DTO doesn't declare
  //    forbidNonWhitelisted -> ...or rejects the request instead (stricter)
  //    transform            -> converts plain JSON into DTO instances
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 4000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}`);
}

void bootstrap();
