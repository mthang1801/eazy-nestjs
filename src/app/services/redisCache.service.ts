import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheEntity } from '../entities/cache.entity';
import { CacheRepository } from '../repositories/cache.repository';
import { prefixCacheKey } from '../../constants/cache';
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private cacheRepo: CacheRepository<CacheEntity>,
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
    });

    if (cacheTable) {
      await this.cacheRepo.update(
        { id: cacheTable.id },
        {
          table_name: tableName,
          prefix_cache_key: prefixCacheKey,
          cache_key: cacheKey,
        },
      );
    } else {
      await this.cacheRepo.create(
        {
          table_name: tableName,
          prefix_cache_key: prefixCacheKey,
          cache_key: cacheKey,
        },
        false,
      );
    }
  }

  async removeCache(tableName, prefixCacheKey = '', cacheKey = '') {
    if (cacheKey) {
      this.logger.error(`======= REMOVE CAHCE KEY [${cacheKey}]========`);
      return this.delete(cacheKey);
    }
    if (prefixCacheKey && !tableName) {
      this.logger.error(
        `======= REMOVE KEYS CACHE IN TABLE [${tableName}]========`,
      );
      const cacheTables = await this.cacheRepo.find({ table_name: tableName });
      for (let cache of cacheTables) {
        await this.delete(cache.cache_key);
      }
      return;
    }

    const caches = await this.cacheRepo.find({
      table_name: tableName,
      prefix_cache_key: prefixCacheKey,
    });

    for (let cache of caches) {
      await this.delete(cache.cache_key);
    }
  }

  async removeManyCachedTables(tables: string[] = []) {
    if (tables.length) {
      for (let table of tables) {
        await this.removeCache(table);
      }
    }
  }
  async removeManyCachedModule(prefix_cache_key: string[] | string = []) {
    if (typeof prefix_cache_key == 'string')
      prefix_cache_key = [prefix_cache_key];
    if (prefix_cache_key.length) {
      for (let prefixCacheKey of prefix_cache_key) {
        let prefixCacheKeyItem = await this.cacheRepo.findOne({
          prefix_cache_key: prefixCacheKey,
        });
        if (prefixCacheKeyItem) {
          await this.delete(prefixCacheKeyItem.cache_key);
        }
      }
    }
  }
}
