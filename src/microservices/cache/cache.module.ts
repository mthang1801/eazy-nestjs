import { CacheModule, Global, Module } from '@nestjs/common';
import { CacheService } from './cache.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as redisStore from 'cache-manager-redis-store';
import { CacheRepository } from '../../repositories/cache.repository';

@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('redisHost'),
        port: +configService.get<number>('redisPort'),
        ttl: +configService.get<number>('redisTTL'),
        password: configService.get<string>('redisPass'),
      }),
    }),
  ],
  providers: [CacheService, CacheRepository],
  exports: [CacheService],
})
export class RedisCacheModule {}
