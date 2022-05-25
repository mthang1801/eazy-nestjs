import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheEntity } from '../entities/cache.entity';
import { CacheRepository } from '../repositories/cache.repository';
import { removeVietnameseTones, convertToSlug } from '../../utils/helper';
import {
  prefixCacheKey,
  cacheKeys,
  cacheTables,
} from '../../utils/cache.utils';
import {
  convertIntoQueryParams,
  convertQueryParamsIntoCachedString,
} from '../../utils/helper';
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
      cache_key: cacheKey,
    });

    if (!cacheTable) {
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

  async removeCache(tableName, prefixCacheKey = null, cacheKey = null) {
    if (cacheKey) {
      this.logger.error(`======= REMOVE CAHCE KEY [${cacheKey}]========`);
      await this.delete(cacheKey);
      await this.cacheRepo.delete({ cache_key: cacheKey });
      return;
    }
    if (prefixCacheKey && !tableName) {
      this.logger.error(`======= REMOVE PREFIX KEYS CACHE========`);
      const prefixCaches = await this.cacheRepo.find({
        prefix_cache_key: prefixCacheKey,
      });
      if (prefixCaches.length) {
        for (let cache of prefixCaches) {
          await this.delete(cache.cache_key);
        }
      }
      await this.cacheRepo.delete({ prefix_cache_key: prefixCacheKey });
      return;
    }
    if (!prefixCacheKey && tableName) {
      this.logger.error(
        `======= REMOVE KEYS CACHE IN TABLE [${tableName}]========`,
      );
      const cacheTables = await this.cacheRepo.find({ table_name: tableName });
      if (cacheTables.length) {
        for (let cache of cacheTables) {
          await this.delete(cache.cache_key);
        }
      }
      await this.cacheRepo.delete({ table_name: tableName });
      return;
    }

    const caches = await this.cacheRepo.find({
      table_name: tableName,
      prefix_cache_key: prefixCacheKey,
    });
    if (caches.length) {
      for (let cache of caches) {
        await this.delete(cache.cache_key);
        await this.cacheRepo.delete({ cache_key: cache.cache_key });
      }
    }
  }

  async removeManyCachedTables(tables: string[] = []) {
    if (tables.length) {
      for (let table of tables) {
        await this.removeCache(table);
      }
    }
  }

  async removeManyPrefixCachesKey(prefix_cache_key: string | string[] = []) {
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

  async getProductCacheById(product_id) {
    let productCacheKey = cacheKeys.product(product_id);
    let productCacheResult = await this.get(productCacheKey);
    return productCacheResult;
  }

  async setProductCacheById(product_id, data) {
    let productCacheKey = cacheKeys.product(product_id);
    await this.set(productCacheKey, data);
    await this.saveCache(
      cacheTables.product,
      prefixCacheKey.productId(product_id),
      productCacheKey,
    );
  }

  async getProductCacheList(params) {
    let productCacheListKey = cacheKeys.products(
      convertQueryParamsIntoCachedString(params),
    );
    let productCacheResult = await this.get(productCacheListKey);
    return productCacheResult;
  }

  async setProductCacheList(params, data) {
    let productCacheListKey = cacheKeys.products(
      convertQueryParamsIntoCachedString(params),
    );
    await this.set(productCacheListKey, data);
    await this.saveCache(
      cacheTables.product,
      prefixCacheKey.products,
      productCacheListKey,
    );
  }

  async getCategoriesList(params) {
    let categoriesListKey = cacheKeys.categories(
      convertQueryParamsIntoCachedString(params),
    );
    return this.get(categoriesListKey);
  }

  async setCategoriesList(params, data) {
    let categoriesListKey = cacheKeys.categories(
      convertQueryParamsIntoCachedString(params),
    );
    await this.set(categoriesListKey, data);
    await this.saveCache(
      cacheTables.category,
      prefixCacheKey.categories,
      categoriesListKey,
    );
  }

  async getCategoryById(category_id, params) {
    let queryParameters = `${category_id}${convertQueryParamsIntoCachedString(
      params,
    )}`;
    let categoryCacheKey = cacheKeys.category(queryParameters);
    return this.get(categoryCacheKey);
  }

  async setCategoryById(category_id, params, data) {
    let queryParameters = `${category_id}${convertQueryParamsIntoCachedString(
      params,
    )}`;
    let categoryCacheKey = cacheKeys.category(queryParameters);
    await this.set(categoryCacheKey, data);
    await this.saveCache(
      cacheTables.category,
      prefixCacheKey.categoryId(category_id),
      categoryCacheKey,
    );
  }

  async removeCartByUserId(user_id) {
    let cartCacheKey = cacheKeys.cart(user_id);
    await this.delete(cartCacheKey);
  }

  async setCartByUserId(user_id, data) {
    let cartCacheKey = cacheKeys.cart(user_id);
    await this.set(cartCacheKey, data);
    await this.saveCache(cacheTables.cart, prefixCacheKey.cart, cartCacheKey);
  }

  async getCartByUserId(user_id) {
    let cartCacheKey = cacheKeys.cart(user_id);
    return this.get(cartCacheKey);
  }

  async getSearchProducts(q) {
    let searchCacheKey = cacheKeys.search(convertToSlug(q));
    return this.get(searchCacheKey);
  }

  async setSearchProducts(q, data) {
    let searchCacheKey = cacheKeys.search(convertToSlug(q));
    await this.set(searchCacheKey, data);
    await this.saveCache(
      cacheTables.search,
      prefixCacheKey.search,
      searchCacheKey,
    );
  }

  async getBanners(params) {
    let bannersCacheKey = cacheKeys.banners(
      convertQueryParamsIntoCachedString(params),
    );
    return this.get(bannersCacheKey);
  }

  async setBanners(params, data) {
    let bannersCacheKey = cacheKeys.banners(
      convertQueryParamsIntoCachedString(params),
    );
    await this.set(bannersCacheKey, data);
    await this.saveCache(
      cacheTables.banner,
      prefixCacheKey.banners,
      bannersCacheKey,
    );
  }

  async getFlashSaleWebsite() {
    let flashSaleWebCacheKey = cacheKeys.flashSaleWebsite;
    return this.get(flashSaleWebCacheKey);
  }

  async setFlashSaleWebSite(data) {
    let flashSaleWebCacheKey = cacheKeys.flashSaleWebsite;
    await this.set(flashSaleWebCacheKey, data);
    await this.saveCache(
      cacheTables.flashSale,
      prefixCacheKey.flashSale,
      flashSaleWebCacheKey,
    );
  }

  async removeAllCachedBanners() {
    let bannersCache = await this.cacheRepo.find({
      table_name: cacheTables.banner,
    });
    if (bannersCache) {
      for (let bannerCacheItem of bannersCache) {
        await this.delete(bannerCacheItem.cache_key);
        await this.cacheRepo.delete({ table_name: cacheTables.banner });
      }
    }
  }

  async removeCachedCategoriesList() {
    let prefixCategoriesKey = prefixCacheKey.categories;
    await this.removeCache(null, prefixCategoriesKey);
    await this.cacheRepo.delete({ prefix_cache_key: prefixCategoriesKey });
  }

  async removeCachedCategoryAfterUpdating(category_id) {
    let categoryCacheKey = cacheKeys.category(category_id);
    await this.delete(categoryCacheKey);
    await this.cacheRepo.delete({ cache_key: categoryCacheKey });
  }

  async removeCategoryById(category_id) {
    let categoryByIdPrefix = prefixCacheKey.categoryId(category_id);
    await this.removeCache(null, categoryByIdPrefix);
    await this.cacheRepo.delete({ prefix_cache_key: categoryByIdPrefix });
  }

  async removeCategriesList() {
    let categoryPrefixKey = prefixCacheKey.categories;
    await this.removeCache(null, categoryPrefixKey);
    await this.cacheRepo.delete({ prefix_cache_key: categoryPrefixKey });
    let categoryLevelPrefixKey = prefixCacheKey.categoriesLevel;
    await this.removeCache(null, categoryLevelPrefixKey);
    await this.cacheRepo.delete({ prefix_cache_key: categoryLevelPrefixKey });
  }

  async removeCachedProductById(product_id) {
    let productCacheKey = cacheKeys.product(product_id);
    await this.delete(productCacheKey);
    await this.cacheRepo.delete({ cache_key: productCacheKey });
  }

  async removeCachedFlashSale() {
    let flashsaleCacheTableName = cacheTables.flashSale;
    await this.removeCache(flashsaleCacheTableName);
    await this.cacheRepo.delete({ table_name: flashsaleCacheTableName });
  }
}
