import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
@Injectable()
export class RedisCacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get(key) {
    return this.cache.get(key);
  }

  async getMany(keys: string[]) {
    let results = keys.map((key) => this.cache.get(key));
    return Promise.all(results);
  }

  async set(key, value) {
    return this.cache.set(key, value);
  }

  async delete(key) {
    return this.cache.del(key);
  }
}
