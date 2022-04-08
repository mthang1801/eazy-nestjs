import { Injectable, HttpException } from '@nestjs/common';
import { Table } from 'src/database/enums';
import { CreateStickerDto } from '../dto/sticker/create-sticker.dto';
import { StickerEntity } from '../entities/sticker.entity';
import { StickerRepository } from '../repositories/sticker.repository';
import { formatStandardTimeStamp } from '../../utils/helper';
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
    let { page, limit, search, created_at, sticker_status } = params;

    let filterConditions = {};
    if (created_at) {
      filterConditions[`${Table.STICKER}.created_at`] =
        moment(created_at).format('YYYY-MM-DD');
    }
    if (sticker_status) {
      filterConditions[`${Table.STICKER}.sticker_status`] = sticker_status;
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
      updated_at: formatStandardTimeStamp(),
    };
    await this.stickerRepo.update({ sticker_id }, stickerUpdated);
  }

  async createProductSticker(data: CreateProductStickerDto) {
    for (let productId of data.product_ids) {
      const product = await this.productRepo.findById(productId);
      if (!product) {
        continue;
      }
      await this.productStickerRepo.delete({ product_id: productId });
      for (let productSticker of data.product_stickers) {
        const productStickerData = {
          ...new ProductStickerEntity(),
          ...this.productStickerRepo.setData(productSticker),
          start_at: moment(productSticker.start_at).format(
            'YYYY-MM-DD HH:mm:ss',
          ),
          end_at: moment(productSticker.end_at).format('YYYY-MM-DD HH:mm:ss'),
          product_id: productId,
        };

        await this.productStickerRepo.createSync(productStickerData);
      }
    }
  }

  async getProductSticker(product_id) {
    const productStickers = await this.productStickerRepo.find({
      select: '*',
      join: productStickerJoiner,
      where: { [`${Table.PRODUCT_STICKER}.product_id`]: product_id },
    });

    return productStickers;
  }
}
