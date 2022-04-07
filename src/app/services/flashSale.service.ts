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
import { MoreThanOrEqual } from 'src/database/find-options/operators';
import { UpdateFlashSaleDto } from '../dto/flashSale/update-flashSale.dto';
import { LessThan } from '../../database/find-options/operators';
import { sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';
import { getDetailProductsListSelectorFE } from '../../utils/tableSelector';
import {
  convertToMySQLDateTime,
  formatStandardTimeStamp,
} from '../../utils/helper';

@Injectable()
export class FlashSalesService {
  constructor(
    private flashSaleRepo: FlashSaleRepository<FlashSaleEntity>,
    private flashSaleDetailRepo: FlashSaleDetailRepository<FlashSaleDetailEntity>,
    private flashSaleProductRepo: FlashSaleProductRepository<FlashSaleProductEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productStickerRepo: ProductStickerRepository<ProductStickerEntity>,
  ) {}

  async CMScreate(data: CreateFlashSaleDto, user) {
    const newFlashSaleData = {
      ...new FlashSaleEntity(),
      ...this.flashSaleRepo.setData(data),
      created_by: user.user_id,
      updated_by: user.user_id,
    };
    const newFlashSale = await this.flashSaleRepo.create(newFlashSaleData);

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
        await this.flashSaleProductRepo.createSync(newFlashSaleProductData);
      }
    }
  }

  async FEget(flash_sale_id) {
    let flashSale = await this.flashSaleRepo.findOne({ flash_sale_id });

    if (!flashSale) {
      throw new HttpException('Không tìm thấy FlashSale', 404);
    }

    if (flashSale.status == 'D') {
      throw new HttpException('Flash sale đã bị ẩn.', 400);
    }

    if (
      flashSale.status == 'E' ||
      (flashSale.end_at && new Date(flashSale.end_at).getTime() < Date.now())
    ) {
      throw new HttpException('Flash Sale đã hết hiệu lực', 400);
    }

    let flashSaleDetails = await this.flashSaleDetailRepo.find({
      select: '*',
      where: { flash_sale_id },
    });

    if (flashSaleDetails.length) {
      for (let flashSaleDetailItem of flashSaleDetails) {
        if (flashSaleDetailItem.detail_status == 'D') {
          continue;
        }
        let flashSaleProducts = await this.flashSaleProductRepo.find({
          select: getDetailProductsListSelectorFE,
          join: flashSaleProductJoiner,
          orderBy: [
            {
              field: `${Table.FLASH_SALE_PRODUCTS}.position`,
              sortBy: SortBy.ASC,
            },
          ],
          where: { detail_id: flashSaleDetailItem['detail_id'] },
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
          }
        }
        flashSaleDetailItem['flash_sale_products'] = flashSaleProducts;
        flashSale['flash_sale_details'] = flashSale['flash_sale_details']
          ? [...flashSale['flash_sale_details'], flashSaleDetailItem]
          : [flashSaleDetailItem];
      }
    }

    return flashSale;
  }
  async CMSget(flash_sale_id) {
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
          select: '*',
          join: flashSaleProductJoiner,
          where: { detail_id: flashSaleDetailItem['detail_id'] },
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
          }
        }
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
        filterConditions[`${Table.FLASH_SALES}.start_at`] = LessThan(
          formatStandardTimeStamp(new Date()),
        );
        break;
      case 2:
        filterConditions[`${Table.FLASH_SALES}.start_at`] = MoreThanOrEqual(
          formatStandardTimeStamp(new Date()),
        );
        filterConditions[`${Table.FLASH_SALES}.status`] = 'A';
        break;
      case 3:
        filterConditions[`${Table.FLASH_SALES}.end_at`] = MoreThanOrEqual(
          formatStandardTimeStamp(new Date()),
        );
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
      updated_at: convertToMySQLDateTime(),
      updated_by: user.user_id,
    };

    console.log(flashSaleData);
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
          await this.flashSaleProductRepo.createSync(newFlashSaleProductData);
        }
      }
    }
  }
}
