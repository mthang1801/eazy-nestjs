import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  queueConfig,
  uploadConfig,
  redisConfig,
  searchConfig,
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
      ],
    }),
    UploadModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisCacheModule,
    ElasticSearchModule,
    RpcModule,
    NamedConnectionModule,
    AuthenticationModule,
    ExampleModule,
  ],
  providers: [String, Object],
})
export class AppModule {}
