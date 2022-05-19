import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheEntity } from '../entities/cache.entity';
import { CacheRepository } from '../repositories/cache.repository';
import { cacheModules } from '../../constants/cache';
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

  async saveCache(tableName, moduleName, cacheKey) {
    const cacheTable = await this.cacheRepo.findOne({
      table_name: tableName,
      module_name: moduleName,
    });

    if (cacheTable) {
      await this.cacheRepo.update(
        { id: cacheTable.id },
        {
          table_name: tableName,
          module_name: moduleName,
          cache_key: cacheKey,
        },
      );
    } else {
      await this.cacheRepo.create(
        {
          table_name: tableName,
          module_name: moduleName,
          cache_key: cacheKey,
        },
        false,
      );
    }
  }

  async removeCache(tableName, moduleName = '', cacheKey = '') {
    if (cacheKey) {
      this.logger.error(`======= REMOVE CAHCE KEY [${cacheKey}]========`);
      return this.delete(cacheKey);
    }
    if (moduleName && !tableName) {
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
      module_name: moduleName,
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
  async removeManyCachedModule(modules: string[] | string = []) {
    if (typeof modules == 'string') modules = [modules];
    if (modules.length) {
      for (let module of modules) {
        let moduleItem = await this.cacheRepo.findOne({ module_name: module });
        if (moduleItem) {
          await this.delete(moduleItem.cache_key);
        }
      }
    }
  }
}
