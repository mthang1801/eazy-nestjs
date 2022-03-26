import { Injectable, HttpException } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { CreateStickerDto } from '../dto/sticker/create-sticker.dto';
import { StickerEntity } from '../entities/sticker.entity';
import { StickerRepository } from '../repositories/sticker.repository';
import { convertToMySQLDateTime } from '../../utils/helper';
import * as moment from 'moment';
import { stickerFilterSearch } from 'src/utils/tableConditioner';
import { UpdateStickerDto } from '../dto/sticker/update-sticker.dto';
import { ProductStickerRepository } from '../repositories/productSticker.repository';
import { ProductStickerEntity } from '../entities/productSticker.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { CreateProductStickerDto } from '../dto/sticker/create-productSticker.dto';
import { productStickerJoiner } from 'src/utils/joinTable';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { UpdateProductStickerDto } from '../dto/sticker/update-productSticker.dto';

@Injectable()
export class StickerService {
  constructor(
    private stickerRepo: StickerRepository<StickerEntity>,
    private productStickerRepo: ProductStickerRepository<ProductStickerEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
  ) {}

  async create(data: CreateStickerDto) {
    const stickerData = {
      ...new StickerEntity(),
      ...this.stickerRepo.setData(data),
    };

    await this.stickerRepo.create(stickerData);
  }

  async getList(params) {
    let { page, limit, search, created_at, status } = params;

    let filterConditions = {};
    if (created_at) {
      filterConditions[`${Table.STICKER}.created_at`] =
        moment(created_at).format('YYYY-MM-DD');
    }
    if (status) {
      filterConditions[`${Table.STICKER}.status`] = status;
    }

    let stickersList = await this.stickerRepo.find({
      select: '*',
      where: stickerFilterSearch(search, filterConditions),
    });

    let count = await this.stickerRepo.find({
      select: `COUNT(DISTINCT(${Table.STICKER}.sticker_id)) as total`,
      where: stickerFilterSearch(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      stickers: stickersList,
    };
  }

  async get(sticker_id) {
    return this.stickerRepo.findById(sticker_id);
  }

  async update(sticker_id, data: UpdateStickerDto) {
    const sticker = await this.stickerRepo.findById(sticker_id);
    if (!sticker) {
      throw new HttpException('Không tìm thấy sticker', 404);
    }

    const stickerUpdated = {
      ...this.stickerRepo.setData(data),
      updated_at: convertToMySQLDateTime(),
    };
    await this.stickerRepo.update({ sticker_id }, stickerUpdated);
  }

  async createProductSticker(product_id, data: CreateProductStickerDto) {
    const product = await this.productRepo.findOne({ product_id });
    if (!product) {
      throw new HttpException('Không tìm thấy sp', 404);
    }
    if (data.product_stickers && data?.product_stickers?.length) {
      await this.productStickerRepo.delete({
        product_id,
      });
      for (let productStickerItem of data.product_stickers.reverse()) {
        let checkExist = await this.productStickerRepo.findOne({
          product_id,
          position_id: productStickerItem.position_id,
          sticker_id: productStickerItem.sticker_id,
        });

        if (checkExist) {
          continue;
        }
        const productStickerData = this.productStickerRepo.setData({
          ...productStickerItem,
          start_at: moment(productStickerItem.start_at).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          end_at: moment(productStickerItem.end_at).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          product_id,
        });

        await this.productStickerRepo.createSync({
          ...productStickerData,
        });
      }
    }
  }

  async getProductSticker(product_id) {
    const product = await this.productRepo.findOne({ product_id });
    if (!product) {
      throw new HttpException('Không tìm thấy sp', 404);
    }
    return this.productStickerRepo.find({
      select: '*',
      join: productStickerJoiner,
      where: {
        [`${Table.PRODUCT_STICKER}.product_id`]: product_id,
        [`${Table.STICKER}.status`]: 'A',
      },
    });
  }
}
