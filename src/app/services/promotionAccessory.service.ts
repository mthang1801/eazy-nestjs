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
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { SortBy } from '../../database/enums/sortBy.enum';

@Injectable()
export class PromotionAccessoryService {
  constructor(
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private productPromoAccessoryRepo: ProductPromotionAccessoryRepository<ProductPromotionAccessoryEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
  ) {}

  async create(data: CreatePromotionAccessoryDto) {
    const promotionAccessory = await this.promoAccessoryRepo.findOne({
      accessory_code: data.accessory_code,
    });
    if (promotionAccessory) {
      throw new HttpException(
        'Nhóm phụ kiện khuyến mãi đã tồn tại mã code',
        409,
      );
    }

    for (let productId of data.product_ids) {
      const product = await this.productRepo.findOne({
        product_id: productId,
      });
      if (!product) {
        throw new HttpException(
          `Sản phẩm có id ${productId} không tồn tại`,
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
      console.log(newProductPromotionAccessoryData);
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

    const productAccessoriesList = await this.productPromoAccessoryRepo.find({
      select: 'product_id',
      where: { accessory_id: promoAccessory['accessory_id'] },
    });

    promoAccessory['products'] = [];

    let productLists = await this.productRepo.find({
      select: '*',
      join: { [JoinTable.leftJoin]: productJoiner },
      where: {
        [`${Table.PRODUCTS}.product_id`]: productAccessoriesList.map(
          ({ product_id }) => product_id,
        ),
      },
    });

    promoAccessory['products'] = productLists;

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
      ...this.promoAccessoryRepo.setData(data),
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
      orderBy: [
        { field: `updated_at`, sortBy: SortBy.DESC },
        { field: `created_at`, sortBy: SortBy.DESC },
      ],
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

  async getByProductId(product_id) {
    const product = await this.productRepo.findOne({ product_id });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    const accessoriesProducts = await this.productPromoAccessoryRepo.find({
      select: '*',
      join: {
        [JoinTable.innerJoin]: {
          [Table.PROMOTION_ACCESSORY]: {
            fieldJoin: 'accessory_id',
            rootJoin: 'accessory_id',
          },
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id`,
          },
        },
      },
      where: {
        [`${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id`]: product_id,
      },
    });

    return accessoriesProducts;
  }
}
