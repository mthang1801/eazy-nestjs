import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth.module';
import { UsersModule } from './users.module';
import { MailModule } from './mail.module';
import { BannerModule } from './banner.module';
import { OrderStatusModule } from './orderStatus.module';
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
import { AllExceptionsFilter } from '../../middlewares/allExeptionsFilter';
import { UserGroupsModule } from './usergroups.module';
import { CategoryModule } from './category.module';
import { ImageModule } from './image.module';
import { ShippingModule } from './shippings.module';
import { UserGroupLinksModule } from './usergroupLinks.module';
import { UserGroupPrivilegeModule } from './usergroupPrivilege.module';
import { OrdersModule } from './orders.module';
import { ProductsModule } from './products.module';
import { CustomerModule } from './customer.module';
import { ProductFeaturesModule } from './productFeatures.module';
import { QueueModule } from './queue.module';
import { StoreModule } from './store.module';
import { UserSystemModule } from './userSystem.module';
import { MulterModule } from '@nestjs/platform-express';
import { LocatorModule } from './locator.module';
import { StatusModule } from './status.module';
import { ProductGroupModule } from './productGroup.module';
import { UploadModule } from './upload.module';
import { CartModule } from './cart.module';
import { StickerModule } from './sticker.module';
import { PromotionAccessoryModule } from './promotionAccessory.module';
import { IndexModule } from './index.modules';
import { PromotionModule } from './promotion.module';
import { FlashSaleModule } from './flashSale.module';
import { CityModule } from './city.module';
import { DistrictModule } from './district.module';
import { WardModule } from './ward.module';
import { DashboardModule } from './dashboard.module';
import { ShippingFeeModule } from './shippingFee.module';
import { ReviewsCommentsModule } from './reviewsComment.module';
import { TradeinProgramModule } from './tradeinProgram.module';
import { TestModule } from './test.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      load: [appConfig, databaseConfig, authConfig, mailConfig],
    }),

    MulterModule.registerAsync({
      useFactory: () => ({
        dest: './uploads',
      }),
    }),
    DashboardModule,
    UploadModule,
    AuthModule,
    UsersModule,
    UserSystemModule,
    MailModule,
    DatabaseModule,
    LoggerModule,
    BannerModule,
    StringModule,
    ObjectModule,
    UserGroupsModule,
    UserGroupLinksModule,
    UserGroupPrivilegeModule,
    CategoryModule,
    OrderStatusModule,
    StatusModule,
    OrdersModule,
    PaymentModule,
    ImageModule,
    ShippingModule,
    ShippingFeeModule,
    ProductsModule,
    CustomerModule,
    ProductFeaturesModule,
    StoreModule,
    QueueModule,
    LocatorModule,
    ProductGroupModule,
    CartModule,
    StickerModule,
    PromotionAccessoryModule,
    IndexModule,
    PromotionModule,
    FlashSaleModule,
    CityModule,
    DistrictModule,
    WardModule,
    ReviewsCommentsModule,
    TradeinProgramModule,
    TestModule,
  ],
  providers: [
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule {}
