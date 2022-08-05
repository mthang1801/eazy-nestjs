import 'dotenv/config';

import { ValidationPipe, VersioningType } from '@nestjs/common';
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
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ISwaggerDocumentOptions } from 'src/interfaces/swaggerDocument.interface';
import { IExpressSwaggerCustomOptions } from 'src/interfaces/swaggerCustom.interface';
import { ICat, IDog } from './enums/pet.enum';
import { ApiPaginatedResponse } from './swagger/apiPaginatedResponse.swagger';
import { extraModels } from './swagger/extraModels';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );

  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));

  app.use(require('helmet')());
  app.use(compression());

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: ['2', '1'],
  });

  app.enableShutdownHooks();
  app.use(requestIp.mw());

  const swaggerConfig = new DocumentBuilder()
    .setTitle('NestJS Source Configure')
    .setDescription(
      'NestJS Prodject Configure With Features as MySQL, File Upload, Error Logs, Schedule, Redis, Websocket, Swagger, Elastich Search, RabbitMQ',
    )
    .setContact('MVT', 'https://mvt-blog.com', 'mthang1801@gmail.com')
    .setVersion('1.0')
    .build();

  const swaggerDocumentOptions: ISwaggerDocumentOptions = {
    operationIdFactory: (cnotrollerKey: string, methodKey: string) => methodKey,
    extraModels,
  };
  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerDocumentOptions,
  );

  const swaggerCustomOptions: IExpressSwaggerCustomOptions = {
    explorer: true,
    url: 'https://github.com/mthang1801/nestjs-resource-configure',
  };
  SwaggerModule.setup('v1/documents/api', app, document, swaggerCustomOptions);

  const PORT = configService.get<number>('port');

  app.enableCors();

  await app.listen(PORT, async () =>
    console.log(`Application is running on: ${await app.getUrl()}`),
  );
}
bootstrap();
