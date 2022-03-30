import { Injectable, HttpException } from '@nestjs/common';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { ProductPromotionAccessoryEntity } from '../entities/productPromotionAccessory.entity';
import { CreatePromotionAccessoryDto } from '../dto/promotionAccessories/create-promotionAccessory.dto';
import { productJoiner } from 'src/utils/joinTable';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdatePromotionAccessoryDto } from '../dto/promotionAccessories/update-promotionAccessory.dto';
import { convertToMySQLDateTime } from '../../utils/helper';
import { promotionAccessoriesSearchFilter } from 'src/utils/tableConditioner';
import { Table } from 'src/database/enums';

@Injectable()
export class PromotionAccessoryService {
  constructor(
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private productPromoAccessoryRepo: ProductPromotionAccessoryRepository<ProductPromotionAccessoryEntity>,
  ) {}

  async create(data: CreatePromotionAccessoryDto) {
    const promotionAccessory = await this.productPromoAccessoryRepo.findOne({
      accessory_code: data.accessory_code,
    });
    if (promotionAccessory) {
      throw new HttpException(
        'Nhóm phụ kiện khuyến mãi đã tồn tại mã code',
        409,
      );
    }

    for (let productId of data.product_ids) {
      const product = await this.productPromoAccessoryRepo.findById(productId);
      if (!product) {
        throw new HttpException(
          `Sản phẩm có id ${product['product_id']} không tồn tại`,
          404,
        );
      }
    }

    const newPromotionAccessoryData = {
      ...new PromotionAccessoryEntity(),
      ...this.promoAccessoryRepo.setData(data),
    };
    const newPromotionAccessory = await this.promoAccessoryRepo.create(
      newPromotionAccessoryData,
    );

    for (let productId of data.product_ids) {
      const newProductPromotionAccessoryData = {
        ...new ProductPromotionAccessoryEntity(),
        accessory_id: newPromotionAccessory.accessory_id,
        product_id: productId,
      };
      await this.productPromoAccessoryRepo.createSync(
        newProductPromotionAccessoryData,
      );
    }
  }

  async get(accessory_id: number) {
    const promoAccessory = await this.promoAccessoryRepo.findById(accessory_id);
    if (!promoAccessory) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    let productAccessoriesList = await this.productPromoAccessoryRepo.find({
      select: '*',
      join: { [JoinTable.leftJoin]: productJoiner },
      where: { accessory_id },
    });

    promoAccessory['products'] = productAccessoriesList;

    return promoAccessory;
  }

  async update(accessory_id: number, data: UpdatePromotionAccessoryDto) {
    const promoAccessory = await this.promoAccessoryRepo.findById(accessory_id);
    if (!promoAccessory) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    const updatePromoAccessoryData = {
      ...this.promoAccessoryRepo.setData(accessory_id),
      updated_at: convertToMySQLDateTime(),
    };

    await this.promoAccessoryRepo.update(
      { accessory_id },
      updatePromoAccessoryData,
    );

    await this.productPromoAccessoryRepo.delete({ accessory_id });
    for (let productId of data.product_ids) {
      const newProductPromotionAccessoryData = {
        ...new ProductPromotionAccessoryEntity(),
        accessory_id: accessory_id,
        product_id: productId,
      };
      await this.productPromoAccessoryRepo.createSync(
        newProductPromotionAccessoryData,
      );
    }
  }

  async getList(params) {
    let { page, limit, search } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;
    let filterConditions = {};
    const accessoriesList = await this.promoAccessoryRepo.find({
      select: '*',
      where: promotionAccessoriesSearchFilter(search, filterConditions),
      skip,
      limit,
    });
    const count = await this.promoAccessoryRepo.find({
      select: `COUNT(DISTINCT(${Table.PROMOTION_ACCESSORY}.accessory_id)) as total`,
      where: promotionAccessoriesSearchFilter(search, filterConditions),
    });

    for (let accessoryItem of accessoriesList) {
      const productsCount = await this.productPromoAccessoryRepo.find({
        select: `COUNT(DISTINCT(${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id)) as total `,
        where: { accessory_id: accessoryItem.accessoryId },
      });
      accessoryItem['productAmount'] = productsCount[0].total;
    }
    return {
      accessories: accessoriesList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
    };
  }
}