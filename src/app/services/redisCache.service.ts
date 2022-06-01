import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { CacheEntity } from '../entities/cache.entity';
import { CacheRepository } from '../repositories/cache.repository';
import { removeVietnameseTones, convertToSlug } from '../../utils/helper';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import {
  prefixCacheKey,
  cacheKeys,
  cacheTables,
} from '../../utils/cache.utils';
import {
  convertIntoQueryParams,
  convertQueryParamsIntoCachedString,
} from '../../utils/helper';
import { ProductsCategoriesEntity } from '../entities/productsCategories.entity';
import { BannerRepository } from '../repositories/banner.repository';
import { BannerEntity } from '../entities/banner.entity';
import { FlashSaleDetailRepository } from '../repositories/flashSaleDetail.repository';
import { FlashSaleDetailEntity } from '../entities/flashSaleDetail.entity';
import { FlashSaleProductRepository } from '../repositories/flashSaleProduct.repository';
import { FlashSaleProductEntity } from '../entities/flashSaleProduct.entity';
import {
  flashSaleProductJoiner,
  flashSaleProductCacheJoiner,
} from '../../utils/joinTable';
import { Table } from 'src/database/enums';
import { CartRepository } from '../repositories/cart.repository';
import { CartEntity } from '../entities/cart.entity';
import { CartItemRepository } from '../repositories/cartItem.repository';
import { CartItemEntity } from '../entities/cartItem.entity';
import { cartItemCacheJoiner } from '../../utils/joinTable';
@Injectable()
export class RedisCacheService {
  private readonly logger = new Logger(RedisCacheService.name);
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private cacheRepo: CacheRepository<CacheEntity>,
    private productCategoryRepo: ProductsCategoriesRepository<ProductsCategoriesEntity>,
    private bannerRepo: BannerRepository<BannerEntity>,
    private flashSaleDetailRepo: FlashSaleDetailRepository<FlashSaleDetailEntity>,
    private flashSaleProductRepo: FlashSaleProductRepository<FlashSaleProductEntity>,
    private cartRepo: CartRepository<CartEntity>,
    private cartItemRepo: CartItemRepository<CartItemEntity>,
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
        await this.cacheRepo.delete({ prefix_cache_key: prefixCacheKey });
      }

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

  async removeProductCacheList(params) {
    let productCacheListKey = cacheKeys.products(
      convertQueryParamsIntoCachedString(params),
    );
    await this.removeCache(
      cacheKeys.product,
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

  async removeCategriesList() {
    let categoryPrefixKey = prefixCacheKey.categories;
    await this.removeCache(null, categoryPrefixKey);
    await this.cacheRepo.delete({ prefix_cache_key: categoryPrefixKey });
    let categoryLevelPrefixKey = prefixCacheKey.categoriesLevel;
    await this.removeCache(null, categoryLevelPrefixKey);
    await this.cacheRepo.delete({ prefix_cache_key: categoryLevelPrefixKey });
  }

  async getCategoryById(category_id) {
    let categoryCacheKey = cacheKeys.category(category_id);
    return this.get(categoryCacheKey);
  }

  async setCategoryById(category_id, data) {
    let categoryCacheKey = cacheKeys.category(category_id);
    await this.set(categoryCacheKey, data);
    await this.saveCache(
      cacheTables.category,
      prefixCacheKey.categoryId(category_id),
      categoryCacheKey,
    );
  }

  async removeCartByCartItemId(cartItemId) {
    let cartItem = await this.cartItemRepo.findOne({
      select: '*',
      join: cartItemCacheJoiner,
      where: { [`${Table.CART_ITEMS}.cart_item_id`]: cartItemId },
    });
    await this.cartItemRepo.delete({ cart_item_id: cartItemId }, true);

    if (cartItem && cartItem.user_id) {
      await this.removeCartByUserId(cartItem.user_id);
    }
  }

  async removeCacheCartByProductId(product_id) {
    let cartItems = await this.cartItemRepo.find({
      select: '*',
      join: cartItemCacheJoiner,
      where: { [`${Table.CART_ITEMS}.product_id`]: product_id },
    });

    if (cartItems.length) {
      for (let cartItem of cartItems) {
        if (cartItem?.user_id) {
          await this.removeCartByUserId(cartItem?.user_id);
        }
      }
    }
  }

  async setCartByUserId(user_id, data) {
    await this.removeCartByUserId(user_id);
    let cartCacheKey = cacheKeys.cartByUserId(user_id);
    await this.set(cartCacheKey, data);
    await this.saveCache(cacheTables.cart, prefixCacheKey.cart, cartCacheKey);
  }

  async removeCartByUserId(user_id) {
    let cartCacheKey = cacheKeys.cartByUserId(user_id);
    await this.delete(cartCacheKey);
    await this.cacheRepo.delete({ cache_key: cartCacheKey });
  }

  async getCartByUserId(user_id) {
    let cartCacheKey = cacheKeys.cartByUserId(user_id);
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
    // remove products
    let productCategories = await this.productCategoryRepo.find({
      category_id,
    });
    if (productCategories.length) {
      for (let productCategoryItem of productCategories) {
        if (productCategoryItem.product_id) {
          await this.removeRelatedServicesWithCachedProduct(
            productCategoryItem.product_id,
          );
        }
      }
    }
  }

  async removeCategoryById(category_id) {
    let categoryByIdPrefix = prefixCacheKey.categoryId(category_id);
    await this.removeCache(null, categoryByIdPrefix);
    await this.cacheRepo.delete({ prefix_cache_key: categoryByIdPrefix });
  }

  async removeCachedProductById(product_id) {
    let productCacheKey = cacheKeys.product(product_id);
    await this.removeCache(null, null, productCacheKey);
    await this.delete(productCacheKey);
    await this.cacheRepo.delete({ cache_key: productCacheKey });
  }

  async removeCachedFlashSale() {
    let FLASHSALECacheTableName = cacheTables.flashSale;
    await this.removeCache(FLASHSALECacheTableName);
    await this.removeCacheAllPages();
  }

  async removeRelatedServicesWithCachedProduct(productId) {
    await this.removeCachedProductById(productId);
    let categories = await this.productCategoryRepo.find({
      product_id: productId,
    });
    if (categories) {
      for (let category of categories) {
        await this.removeCategoryById(category.category_id);
      }
    }
    await this.removeCachedFlashSale();

    await this.removeCacheCartByProductId(productId);

    await this.removeCacheAllPages();
  }

  async getPage(pageId) {
    const pageCacheKey = cacheKeys.page(pageId);
    return this.get(pageCacheKey);
  }

  async setPage(pageId, data) {
    const pageCacheKey = cacheKeys.page(pageId);
    await this.set(pageCacheKey, data);
    await this.saveCache(
      cacheTables.page,
      prefixCacheKey.pageId(pageId),
      pageCacheKey,
    );
  }

  async removePageById(pageId) {
    const pageCacheKey = cacheKeys.page(pageId);
    await this.removeCache(null, null, pageCacheKey);
  }

  async getCachePageById(page_id) {
    const pageCacheKey = cacheKeys.page(page_id);
    return this.get(pageCacheKey);
  }

  async setCachePageById(page_id, data) {
    const pageCacheKey = cacheKeys.page(page_id);
    await this.set(pageCacheKey, data);
    await this.saveCache(
      cacheTables.page,
      prefixCacheKey.pageId(page_id),
      pageCacheKey,
    );
  }

  async removeCachePageById(page_id) {
    const pageCacheKey = cacheKeys.page(page_id);
    await this.removeCache(
      cacheTables.page,
      prefixCacheKey.pageId(page_id),
      pageCacheKey,
    );
  }

  async removeCacheAllPages() {
    await this.removeCache(cacheTables.page);
  }
}
