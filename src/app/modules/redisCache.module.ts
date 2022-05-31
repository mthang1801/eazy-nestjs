import { CacheModule, Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from '../services/redisCache.service';
import { CacheRepository } from '../repositories/cache.repository';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { FlashSaleRepository } from '../repositories/flashSale.repository';
import { BannerRepository } from '../repositories/banner.repository';
import { FlashSaleDetailRepository } from '../repositories/flashSaleDetail.repository';
import { FlashSaleProductRepository } from '../repositories/flashSaleProduct.repository';
import { CartRepository } from '../repositories/cart.repository';
import { CartItemRepository } from '../repositories/cartItem.repository';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('redisHost'),
        port: configService.get<number>('redisPort'),
        ttl: +configService.get<number>('redisTTL'),
        db: 5,
        password: configService.get<string>('redisPass'),
      }),
    }),
  ],
  providers: [
    RedisCacheService,
    CacheRepository,
    ProductsCategoriesRepository,
    FlashSaleRepository,
    BannerRepository,
    FlashSaleDetailRepository,
    FlashSaleProductRepository,
    CartRepository,
    CartItemRepository,
  ],
  exports: [RedisCacheService, CacheRepository],
})
export class RedisCacheModule {}
