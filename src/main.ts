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

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
    new ExpressAdapter(),
  );
  const configService = app.get(ConfigService);

  app.useGlobalPipes(new ValidationPipe(ValidationConfig));
  app.setGlobalPrefix(configService.get<string>('apiPrefix'));

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');
  hbs.registerPartials(join(__dirname, '..', '/views/partials'));

  app.enableShutdownHooks();

  const PORT = configService.get<number>('port');

  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
    next();
  });

  // app.enableCors({
  //   allowedHeaders:"*",
  //   origin: "*"
  // });

  var whitelist = [
    'http://localhost:3000',
    'https://ddvdev.ntlogistics.vn/',
    'https://ddvcmsdev.ntlogistics.vn/',
    'http://localhost:5000',
    'http://[::1]:5000',
    'http://127.0.0.1:5000',
  ];
  app.enableCors({
    origin: function (origin, callback) {
      console.log(origin);
      if (whitelist.indexOf(origin) !== -1 || !origin) {
        console.log('allowed cors for:', origin);
        callback(null, true);
      } else {
        console.log('blocked cors for:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders:
      'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept, Observe',
    methods: 'GET,PUT,POST,DELETE,UPDATE,OPTIONS,PATCH',
    credentials: true,
  });

  await app.listen(PORT, async () =>
    console.log(`Application is running on: ${await app.getUrl()}`),
  );
}
bootstrap();
