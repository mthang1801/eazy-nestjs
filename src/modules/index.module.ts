import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { appConfig, databaseConfig, queueConfig } from '../config/index.config';
import { DatabaseModule } from '../database/database.module';
import { UserRepository } from '../repositories/user.repository';
import { OrderRepository } from '../repositories/order.repository';
import { ScheduleModule } from '@nestjs/schedule';
import { RpcModulle } from '../microservices/rabbitMQ/rpc/rpc.module';
import { NamedConnectionModule } from '../microservices/rabbitMQ/rpc-named-connection/named-connection.module';
import { AuthenticationModule } from './auth.module';
import { UserModule } from './user.module';
import uploadConfig from 'src/config/upload.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, queueConfig, uploadConfig],
    }),
    ScheduleModule.forRoot(),
    DatabaseModule,
    RpcModulle,
    NamedConnectionModule,
    AuthenticationModule,
    UserModule,
  ],
  providers: [UserRepository, OrderRepository, String],
})
export class AppModule {}
