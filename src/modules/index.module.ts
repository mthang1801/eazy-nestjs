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
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RpcModule } from '../microservices/rabbitMQ/rpc/rpc.module';
import { NamedConnectionModule } from '../microservices/rabbitMQ/rpc-named-connection/named-connection.module';
import { AuthenticationModule } from './auth.module';
import { UserModule } from './user.module';
import { UploadModule } from './upload.module';
import { RedisCacheModule } from '../microservices/cache/cache.module';
import { ElasticSearchModule } from '../microservices/elasticSearch/search.module';
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
    EventEmitterModule.forRoot({
      // set this to `true` to use wildcards
      wildcard: false,
      // the delimiter used to segment namespaces
      delimiter: '.',
      // set this to `true` if you want to emit the newListener event
      newListener: false,
      // set this to `true` if you want to emit the removeListener event
      removeListener: false,
      // the maximum amount of listeners that can be assigned to an event
      maxListeners: 10,
      // show event name in memory leak message when more than maximum amount of listeners is assigned
      verboseMemoryLeak: false,
      // disable throwing uncaughtException if an error event is emitted and it has no listeners
      ignoreErrors: false,
    }),
    UploadModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisCacheModule,
    ElasticSearchModule,
    RpcModule,
    NamedConnectionModule,
    AuthenticationModule,
    UserModule,
  ],
  providers: [String, Object],
})
export class AppModule {}
