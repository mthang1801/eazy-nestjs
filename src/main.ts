import 'dotenv/config';

import { RequestMethod, ValidationPipe, VersioningType } from '@nestjs/common';
import {
  ExpressAdapter,
  NestExpressApplication,
} from '@nestjs/platform-express';
import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import * as hbs from 'hbs';
import { ConfigService } from '@nestjs/config';
import { ValidationConfig } from './config/validation.config';
import * as compression from 'compression';
import * as requestIp from 'request-ip';
import { AppModule } from './modules/index.module';
import {
  i18nValidationErrorFactory,
  I18nValidationExceptionFilter,
} from 'nestjs-i18n';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));
  app.useGlobalFilters(
    new I18nValidationExceptionFilter({
      detailedErrors: false, //Show details error
    }),
  );

  app.use(require('helmet')());
  app.use(compression());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  app.setGlobalPrefix(configService.get<string>('apiPrefix'), {
    exclude: configService.get<any>('exludeGlobalPrefix'),
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: configService.get<string[]>('enableVersioning'),
  });

  app.enableShutdownHooks();
  app.use(requestIp.mw());

  const PORT = configService.get<number>('port');

  app.enableCors();

  await app.listen(PORT, async () =>
    console.log(`Application is running on: ${await app.getUrl()}`),
  );
}
bootstrap();
