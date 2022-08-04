import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import {
  appConfig,
  databaseConfig,
  queueConfig,
  uploadConfig,
  redisConfig,
} from '../config/index.config';
import { DatabaseModule } from '../database/database.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RpcModule } from '../microservices/rabbitMQ/rpc/rpc.module';
import { NamedConnectionModule } from '../microservices/rabbitMQ/rpc-named-connection/named-connection.module';
import { AuthenticationModule } from './auth.module';
import { UserModule } from './user.module';
import { UploadModule } from './upload.module';
import { RedisCacheModule } from '../microservices/cache/cache.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, queueConfig, uploadConfig, redisConfig],
    }),
    UploadModule,
    ScheduleModule.forRoot(),
    DatabaseModule,
    RedisCacheModule,
    RpcModule,
    NamedConnectionModule,
    AuthenticationModule,
    UserModule,
  ],
  providers: [String, Object],
})
export class AppModule {}
