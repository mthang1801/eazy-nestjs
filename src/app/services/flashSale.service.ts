import { Injectable, HttpException } from '@nestjs/common';
import { flashSaleProductJoiner } from 'src/utils/joinTable';
import { CreateFlashSaleDto } from '../dto/flashSale/create-flashSale.dto';

import { FlashSaleEntity } from '../entities/flashSale.entity';
import { FlashSaleDetailEntity } from '../entities/flashSaleDetail.entity';
import { FlashSaleProductEntity } from '../entities/flashSaleProduct.entity';
import { ProductsEntity } from '../entities/products.entity';
import { ProductStickerEntity } from '../entities/productSticker.entity';
import { FlashSaleRepository } from '../repositories/flashSale.repository';
import { FlashSaleDetailRepository } from '../repositories/flashSaleDetail.repository';
import { FlashSaleProductRepository } from '../repositories/flashSaleProduct.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductStickerRepository } from '../repositories/productSticker.repository';
import { productStickerJoiner } from '../../utils/joinTable';
import { flashSaleSearchFilter } from '../../utils/tableConditioner';
import { Table } from 'src/database/enums';
import { MoreThanOrEqual } from 'src/database/operators/operators';
import { UpdateFlashSaleDto } from '../dto/flashSale/update-flashSale.dto';
import {
  LessThan,
  MoreThan,
  LessThanOrEqual,
} from '../../database/operators/operators';
import { sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { getDetailProductsListSelectorFE } from '../../utils/tableSelector';
import { formatStandardTimeStamp } from '../../utils/helper';
import { ReviewRepository } from '../repositories/review.repository';
import { ReviewEntity } from '../entities/review.entity';
import {
  cacheKeys,
  cacheTables,
  prefixCacheKey,
} from '../../utils/cache.utils';
import { RedisCacheService } from './redisCache.service';
import * as _ from 'lodash';

@Injectable()
export class FlashSalesService {
  constructor(
    private flashSaleRepo: FlashSaleRepository<FlashSaleEntity>,
    private flashSaleDetailRepo: FlashSaleDetailRepository<FlashSaleDetailEntity>,
    private flashSaleProductRepo: FlashSaleProductRepository<FlashSaleProductEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productStickerRepo: ProductStickerRepository<ProductStickerEntity>,
    private reviewRepo: ReviewRepository<ReviewEntity>,
    private cache: RedisCacheService,
  ) {}

  async CMScreate(data: CreateFlashSaleDto, user) {
    const newFlashSaleData = {
      ...new FlashSaleEntity(),
      ...this.flashSaleRepo.setData(data),
      created_by: user.user_id,
      updated_by: user.user_id,
    };
    const newFlashSale = await this.flashSaleRepo.create(newFlashSaleData);

    if (data.status === 'A') {
      const startDate = formatStandardTimeStamp(
        newFlashSale['start_at'],
      ).toString();
      const endDate = formatStandardTimeStamp(
        newFlashSale['end_at'],
      ).toString();

      await this.flashSaleRepo.update(
        {
          start_at: MoreThanOrEqual(startDate),
          end_at: LessThanOrEqual(endDate),
        },
        { status: 'D' },
      );

      await this.flashSaleRepo.update(
        {
          end_at: LessThanOrEqual(formatStandardTimeStamp()),
        },
        { status: 'D' },
      );

      await this.flashSaleRepo.update(
        { flash_sale_id: newFlashSale.flash_sale_id },
        { status: 'A' },
      );
    }

    for (let flashSaleDetailItem of data.flash_sale_details) {
      const newFlashSaleDetailItem = {
        ...new FlashSaleDetailEntity(),
        ...this.flashSaleDetailRepo.setData(flashSaleDetailItem),
        flash_sale_id: newFlashSale.flash_sale_id,
      };
      const newFlashSaleDetail = await this.flashSaleDetailRepo.create(
        newFlashSaleDetailItem,
      );

      for (let flashSaleProductItem of flashSaleDetailItem.flash_sale_products) {
        const newFlashSaleProductData = {
          ...new FlashSaleProductEntity(),
          ...this.flashSaleProductRepo.setData(flashSaleProductItem),
          detail_id: newFlashSaleDetail.detail_id,
        };
        await this.flashSaleProductRepo.create(newFlashSaleProductData, false);
      }
    }
  }

  async FEget() {
    let flashSaleCacheResult = await this.cache.getFlashSaleWebsite();

    if (flashSaleCacheResult) {
      return flashSaleCacheResult;
    }

    let flashSale = await this.flashSaleRepo.findOne({
      status: 'A',
      end_at: MoreThanOrEqual(formatStandardTimeStamp()),
    });

    if (!flashSale) {
      return;
    }

    let flashSaleDetails = await this.flashSaleDetailRepo.find({
      select: '*',
      where: { flash_sale_id: flashSale.flash_sale_id, detail_status: 'A' },
    });

    if (flashSaleDetails.length) {
      for (let flashSaleDetailItem of flashSaleDetails) {
        if (flashSaleDetailItem.detail_status == 'D') {
          continue;
        }
        let flashSaleProducts = await this.flashSaleProductRepo.find({
          select: [
            ...getDetailProductsListSelectorFE,
            `${Table.FLASH_SALE_PRODUCTS}.position`,
          ],
          join: flashSaleProductJoiner,
          where: {
            detail_id: flashSaleDetailItem['detail_id'],
            flash_sale_product_status: 'A',
          },
          orderBy: [
            {
              field: `${Table.FLASH_SALE_PRODUCTS}.position`,
              sortBy: SortBy.ASC,
            },
          ],
        });

        if (flashSaleProducts.length) {
          for (let flashSaleProductItem of flashSaleProducts) {
            const flashSaleProductStickers = await this.productStickerRepo.find(
              {
                select: '*',
                join: productStickerJoiner,
                where: { product_id: flashSaleProductItem['product_id'] },
              },
            );
            flashSaleProductItem['stickers'] = flashSaleProductStickers;

            const flashSaleReview = await this.reviewRepo.findOne({
              product_id: flashSaleProductItem['product_id'],
            });
            flashSaleProductItem['ratings'] = flashSaleReview;
          }
        }
        flashSaleDetailItem['flash_sale_products'] = flashSaleProducts;
        flashSale['flash_sale_details'] = flashSale['flash_sale_details']
          ? [...flashSale['flash_sale_details'], flashSaleDetailItem]
          : [flashSaleDetailItem];
      }
    }
    await this.cache.setFlashSaleWebSite(flashSale);
    return flashSale;
  }

  async CMSget(flash_sale_id) {
    let flashSaleCacheKey = cacheKeys.flashSale(flash_sale_id);
    let flashSaleCacheResult = await this.cache.get(flashSaleCacheKey);
    // if (flashSaleCacheResult) {
    //   return flashSaleCacheResult;
    // }

    let flashSale = await this.flashSaleRepo.findOne({ flash_sale_id });
    if (!flashSale) {
      throw new HttpException('Không tìm thấy FlashSale', 404);
    }

    let flashSaleDetails = await this.flashSaleDetailRepo.find({
      select: '*',
      where: { flash_sale_id },
    });

    if (flashSaleDetails.length) {
      for (let flashSaleDetailItem of flashSaleDetails) {
        let flashSaleProducts = await this.flashSaleProductRepo.find({
          select: `*, ${Table.FLASH_SALE_PRODUCTS}.*`,
          join: flashSaleProductJoiner,
          where: { detail_id: flashSaleDetailItem['detail_id'] },
          orderBy: [
            {
              field: `${Table.FLASH_SALE_PRODUCTS}.position`,
              sortBy: SortBy.ASC,
            },
          ],
        });

        if (flashSaleProducts.length) {
          for (let flashSaleProductItem of flashSaleProducts) {
            console.log(flashSaleProductItem);
            const flashSaleProductStickers = await this.productStickerRepo.find(
              {
                select: '*',
                join: productStickerJoiner,
                where: { product_id: flashSaleProductItem['product_id'] },
              },
            );
            flashSaleProductItem['stickers'] = flashSaleProductStickers;
          }
        }

        flashSaleProducts = _.uniqBy(flashSaleProducts, 'product_id');
        flashSaleDetailItem['flash_sale_products'] = flashSaleProducts;
        flashSale['flash_sale_details'] = flashSale['flash_sale_details']
          ? [...flashSale['flash_sale_details'], flashSaleDetailItem]
          : [flashSaleDetailItem];
      }
    }

    return flashSale;
  }

  async getList(params) {
    let { page, limit, search, status, activity_status, flash_type } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterConditions = {};

    if (status) {
      filterConditions[`${Table.FLASH_SALES}.status`] = status;
    }

    switch (+activity_status) {
      case 1:
        filterConditions[`${Table.FLASH_SALES}.start_at`] = MoreThan(
          formatStandardTimeStamp(new Date()),
        );
        filterConditions[`${Table.FLASH_SALES}.status`] = 'A';
        break;
      case 2:
        filterConditions[`${Table.FLASH_SALES}.start_at`] = LessThan(
          formatStandardTimeStamp(new Date()),
        );
        filterConditions[`${Table.FLASH_SALES}.end_at`] = MoreThan(
          formatStandardTimeStamp(new Date()),
        );
        filterConditions[`${Table.FLASH_SALES}.status`] = 'A';
        break;
      case 3:
        filterConditions[`${Table.FLASH_SALES}.end_at`] = LessThan(
          formatStandardTimeStamp(new Date()),
        );
        filterConditions[`${Table.FLASH_SALES}.status`] = 'A';
        break;
      case 4:
        filterConditions[`${Table.FLASH_SALES}.status`] = 'D';
        break;
    }

    if (flash_type) {
      filterConditions[`${Table.FLASH_SALES}.flash_type`] = flash_type;
    }

    const flashSalesList = await this.flashSaleRepo.find({
      select: '*',
      orderBy: [
        { field: `${Table.FLASH_SALES}.updated_at`, sortBy: SortBy.DESC },
      ],
      where: flashSaleSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    const count = await this.flashSaleRepo.find({
      select: `COUNT(${Table.FLASH_SALES}.flash_sale_id) as total`,
      where: flashSaleSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      flashSalesList,
    };
  }

  async update(flash_sale_id: number, data: UpdateFlashSaleDto, user) {
    const flashSale = await this.flashSaleRepo.findOne({ flash_sale_id });
    if (!flashSale) {
      throw new HttpException('Không tìm thấy flash sale', 404);
    }

    const flashSaleData = {
      ...this.flashSaleRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
      updated_by: user.user_id,
    };

    if (data.status === 'A') {
      const startDate = formatStandardTimeStamp(
        flashSale['start_at'],
      ).toString();
      const endDate = formatStandardTimeStamp(flashSale['end_at']).toString();

      await this.flashSaleRepo.update(
        {
          start_at: MoreThanOrEqual(startDate),
          end_at: LessThanOrEqual(endDate),
        },
        { status: 'D' },
      );

      await this.flashSaleRepo.update(
        {
          end_at: LessThanOrEqual(formatStandardTimeStamp()),
        },
        { status: 'D' },
      );
    }
    await this.flashSaleRepo.update({ flash_sale_id }, flashSaleData);
    //Only update status will return immediately
    if (Object.entries(data).length == 1 && data.status) {
      return;
    }

    const oldFlashSalesDetails = await this.flashSaleDetailRepo.find({
      select: '*',
      where: { flash_sale_id },
    });
    if (oldFlashSalesDetails.length) {
      for (let oldFlashSaleDetail of oldFlashSalesDetails) {
        await this.flashSaleDetailRepo.delete({
          detail_id: oldFlashSaleDetail.detail_id,
        });
        await this.flashSaleProductRepo.delete({
          detail_id: oldFlashSaleDetail.detail_id,
        });
        let oldAppliedProducts = await this.flashSaleProductRepo.find({
          detail_id: oldFlashSaleDetail.detail_id,
        });
        if (oldAppliedProducts.length) {
          for (let product of oldAppliedProducts) {
            await this.cache.removeRelatedServicesWithCachedProduct(
              product.product_id,
            );
          }
        }
      }
    }

    if (data.flash_sale_details && data.flash_sale_details.length) {
      for (let flashSaleDetailItem of data.flash_sale_details) {
        const newFlashSaleDetailItem = {
          ...new FlashSaleDetailEntity(),
          ...this.flashSaleDetailRepo.setData(flashSaleDetailItem),
          flash_sale_id,
        };
        const newFlashSaleDetail = await this.flashSaleDetailRepo.create(
          newFlashSaleDetailItem,
        );

        for (let flashSaleProductItem of flashSaleDetailItem.flash_sale_products) {
          const newFlashSaleProductData = {
            ...new FlashSaleProductEntity(),
            ...this.flashSaleProductRepo.setData(flashSaleProductItem),
            detail_id: newFlashSaleDetail.detail_id,
          };
          await this.flashSaleProductRepo.create(
            newFlashSaleProductData,
            false,
          );
          await this.cache.removeRelatedServicesWithCachedProduct(
            flashSaleProductItem.product_id,
          );
        }
      }
    }
  }
}
