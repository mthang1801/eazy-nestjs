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
import {
  DocumentBuilder,
  SwaggerCustomOptions,
  SwaggerDocumentOptions,
  SwaggerModule,
} from '@nestjs/swagger';
import { includes } from './swagger/includes';
import { extraModels } from './swagger/extraModels';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  const config = app.get(ConfigService);

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

  app.setGlobalPrefix(config.get<string>('apiPrefix'), {
    exclude: config.get<any>('exludeGlobalPrefix'),
  });

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: config.get<string[]>('enableVersioning'),
  });

  app.enableShutdownHooks();
  app.use(requestIp.mw());

  const swaggerConfig = new DocumentBuilder()
    .setTitle(config.get<string>('swaggerTitle'))
    .setDescription(config.get<string>('swaggerDescription'))
    .setContact(
      config.get<string>('swaggerContactName'),
      config.get<string>('swaggerContactUrl'),
      config.get<string>('swaggerContactEmail'),
    )
    .setVersion(config.get<string>('swaggerVersion'))
    .setLicense(
      config.get<string>('swaggerLicenseName'),
      config.get<string>('swaggerLicenseUrl'),
    )
    .addTag(config.get<string>('swaggerTag'))
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (controllerKey: string, methodKey: string) => methodKey,
    ignoreGlobalPrefix: false,
    include: includes,
    extraModels: extraModels,
  };

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerOptions,
  );

  SwaggerModule.setup('api/v1/docs', app, document, {
    explorer: true,
    customCssUrl: join('..', '..', 'swagger-ui', 'swagger-material.css'),
  });

  const PORT = config.get<number>('port');

  app.enableCors();

  await app.listen(PORT, async () =>
    console.log(`Application is running on: ${await app.getUrl()}`),
  );
}
bootstrap();
