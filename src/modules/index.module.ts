import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  queueConfig,
  uploadConfig,
  redisConfig,
  searchConfig,
  mailConfig,
  swaggerConfig,
} from '../config/index.config';
import { DatabaseModule } from '../database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RpcModule } from '../microservices/rabbitMQ/rpc/rpc.module';
import { NamedConnectionModule } from '../microservices/rabbitMQ/rpc-named-connection/named-connection.module';
import { AuthenticationModule } from './auth.module';
import { UploadModule } from './upload.module';
import { RedisCacheModule } from '../microservices/cache/cache.module';
import { ElasticSearchModule } from '../microservices/elasticSearch/search.module';
import { ExampleModule } from './example.module';
import { ScheduleService } from '../microservices/schedule/schedule.service';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import { join } from 'path';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from 'src/filters/all-exception.filter';
import { LogModule } from 'src/log/log.module';
import { MailModule } from './mail.module';
import { HomeController } from '../controllers/common/home.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [
        appConfig,
        databaseConfig,
        queueConfig,
        uploadConfig,
        redisConfig,
        searchConfig,
        mailConfig,
        swaggerConfig,
      ],
    }),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'public'),
      serveRoot: '',
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: join(__dirname, '..', '/i18n/'),
        watch: true,
      },

      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    UploadModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisCacheModule,
    MailModule,
    ElasticSearchModule,
    RpcModule,
    NamedConnectionModule,
    LogModule,
    AuthenticationModule,
    ExampleModule,
  ],
  providers: [
    String,
    Object,
    ScheduleService,
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
  controllers: [HomeController],
})
export class AppModule {}
