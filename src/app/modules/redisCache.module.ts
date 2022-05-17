import { CacheModule, Module, Global } from '@nestjs/common';
import { ConfigService, ConfigModule } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { RedisCacheService } from '../services/redisCache.service';
import { CacheRepository } from '../repositories/cache.repository';

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
        password: configService.get<string>('redisPass'),
      }),
    }),
  ],
  providers: [RedisCacheService, CacheRepository],
  exports: [RedisCacheService, CacheRepository],
})
export class RedisCacheModule {}
