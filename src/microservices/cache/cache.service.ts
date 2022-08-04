import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheRepository } from '../../repositories/cache.repository';
@Injectable()
export class CacheService {
  private requestPerOnce = 5;
  private readonly logger = new Logger(CacheService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly cacheRepo: CacheRepository,
  ) {}

  async get(key) {
    this.logger.log(`========== GET CACHE KEY [${key}] ==========`);
    return this.cache.get(key);
  }

  async getMany(keys: string[]) {
    this.logger.log(
      `========== GET CACHE MANY KEYS [${keys
        .map((key) => key)
        .join(',')}] ==========`,
    );
    let results = [];
    for (let key of keys) {
      let keyItem = await this.cache.get(key);
      results.push(keyItem);
    }
    return results;
  }

  async set(key, value) {
    this.logger.log(`========== CACHING KEY [${key}] ==========`);
    return this.cache.set(key, value);
  }

  async delete(key) {
    this.logger.log(`========== DELETE CACHED KEY [${key}] ==========`);
    return this.cache.del(key);
  }

  async saveCache(tableName, prefixCacheKey, cacheKey) {
    const cacheTable = await this.cacheRepo.findOne({
      table_name: tableName,
      prefix_cache_key: prefixCacheKey,
      cache_key: cacheKey,
    });

    if (!cacheTable) {
      await this.cacheRepo.createOne(
        {
          table_name: tableName,
          prefix_cache_key: prefixCacheKey,
          cache_key: cacheKey,
        },
        false,
      );
    }
  }

  async removeCache(tableName, prefixCacheKey = null, cacheKey = null) {
    if (cacheKey) {
      this.logger.error(`======= REMOVE CAHCE KEY [${cacheKey}]========`);
      await this.delete(cacheKey);
      await this.cacheRepo.delete({ cache_key: cacheKey });
      return;
    }
    if (prefixCacheKey && !tableName) {
      this.logger.error(`======= REMOVE PREFIX KEYS CACHE========`);
      const prefixCaches = await this.cacheRepo.findMany({
        prefix_cache_key: prefixCacheKey,
      });
      if (prefixCaches.length) {
        for (
          let i = 0;
          i < Math.ceil(prefixCaches.length / this.requestPerOnce);
          i++
        ) {
          await Promise.all(
            prefixCaches
              .slice(i * this.requestPerOnce, (i + 1) * this.requestPerOnce)
              .map(async (cache) => {
                if (!cache) return;
                await this.delete(cache.cache_key);
                return cache;
              }),
          );
        }

        await this.cacheRepo.delete({ prefix_cache_key: prefixCacheKey });
      }

      return;
    }
    if (!prefixCacheKey && tableName) {
      this.logger.error(
        `======= REMOVE KEYS CACHE IN TABLE [${tableName}]========`,
      );
      const cacheTables = await this.cacheRepo.findMany({
        table_name: tableName,
      });

      if (cacheTables.length) {
        for (
          let i = 0;
          i < Math.ceil(cacheTables.length / this.requestPerOnce);
          i++
        ) {
          await Promise.all(
            cacheTables
              .slice(i * this.requestPerOnce, (i + 1) * this.requestPerOnce)
              .map(async (cache) => {
                if (!cache) return;
                await this.delete(cache.cache_key);
                return cache;
              }),
          );
        }
      }
      await this.cacheRepo.delete({ table_name: tableName });
      return;
    }

    const caches = await this.cacheRepo.findMany({
      table_name: tableName,
      prefix_cache_key: prefixCacheKey,
    });
    if (caches.length) {
      for (let i = 0; i < Math.ceil(caches.length / this.requestPerOnce); i++) {
        await Promise.all(
          caches
            .slice(i * this.requestPerOnce, (i + 1) * this.requestPerOnce)
            .map(async (cache) => {
              if (!cache) return;
              await this.delete(cache.cache_key);
              await this.cacheRepo.delete({ cache_key: cache.cache_key });
              return cache;
            }),
        );
      }
    }
  }
}
