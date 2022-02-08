import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { MailModule } from './mail.module';
import { BannerModule } from './banner.module';
import { OrderStatusModule } from './order_status.module';
import { PaymentModule } from './payment.module';
import { DatabaseModule } from '../../database/database.module';
import {
  appConfig,
  databaseConfig,
  authConfig,
  mailConfig,
} from '../../config/index.config';
import { LoggerModule } from '../../logger/logger.module';
import { StringModule } from './string.module';
import { ObjectModule } from './object.module';
import { APP_FILTER } from '@nestjs/core';
import { AllExceptionsFilter } from '../helpers/exeptions/allExeptionsFilter';
import { UserGroupsModule } from './user_groups.module';
import { CategoryModule } from './category.module';
import { ImageModule } from './image.module';
import { ShippingModule } from './shippings.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, authConfig, mailConfig],
    }),
    AuthModule,
    UsersModule,
    MailModule,
    DatabaseModule,
    LoggerModule,
    BannerModule,
    StringModule,
    ObjectModule,
    UserGroupsModule,
    CategoryModule,
    OrderStatusModule,
    PaymentModule,
    ImageModule,
    ShippingModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
