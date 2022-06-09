import 'dotenv/config';

import { ValidationPipe } from '@nestjs/common';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app/modules/app.module';
import { join } from 'path';
import * as hbs from 'hbs';
import { ConfigService } from '@nestjs/config';
import { ValidationConfig } from './config/validation.config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import * as requestIp from 'request-ip';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  app.enableShutdownHooks();
  app.use(requestIp.mw());

  const PORT = configService.get<number>('port');

  app.enableCors();

  await app.listen(PORT, async () =>
    console.log(`Application is running on: ${await app.getUrl()}`),
  );
}
bootstrap();
