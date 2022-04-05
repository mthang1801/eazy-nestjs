import { Injectable, HttpException } from '@nestjs/common';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { ProductPromotionAccessoryEntity } from '../entities/productPromotionAccessory.entity';
import { CreatePromotionAccessoryDto } from '../dto/promotionAccessories/create-promotionAccessory.dto';
import {
  productLeftJoiner,
  productPromotionAccessoryJoiner,
} from 'src/utils/joinTable';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdatePromotionAccessoryDto } from '../dto/promotionAccessories/update-promotionAccessory.dto';
import { convertToMySQLDateTime } from '../../utils/helper';
import { promotionAccessoriesSearchFilter } from 'src/utils/tableConditioner';
import { Table } from 'src/database/enums';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import * as moment from 'moment';
import { getProductAccessorySelector } from 'src/utils/tableSelector';
import { itgConvertGiftAccessoriesFromAppcore } from '../../utils/integrateFunctions';

@Injectable()
export class PromotionAccessoryService {
  constructor(
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private productPromoAccessoryRepo: ProductPromotionAccessoryRepository<ProductPromotionAccessoryEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
  ) {}

  async create(data: CreatePromotionAccessoryDto, user) {
    const promotionAccessory = await this.promoAccessoryRepo.findOne({
      accessory_code: data.accessory_code,
    });
    if (promotionAccessory) {
      throw new HttpException(
        'Nhóm phụ kiện khuyến mãi đã tồn tại mã code',
        409,
      );
    }

    if (data.products) {
      for (let productItem of data.products) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
        });
        if (!product) {
          throw new HttpException(
            `Sản phẩm có id ${productItem.product_id} tồn tại`,
            404,
          );
        }
        if (
          productItem.promotion_price < 0 ||
          productItem.promotion_price > product['price']
        ) {
          throw new HttpException(
            `Giá ưu đãi của id : ${product.product_id} ${productItem.promotion_price} không phù hợp, không được lớn hơn giá gốc `,
            400,
          );
        }
        if (productItem.sale_price_from > productItem.sale_price_to) {
          throw new HttpException(
            `Giá áp dụng bảo hành của ${product.product_id} từ ${productItem.sale_price_from} - ${productItem.sale_price_from} không phù hợp `,
            400,
          );
        }
      }
    }

    if (data.display_at) {
      data.display_at = moment(data.display_at).format('YYYY-MM-DD HH:mm:ss');
    }

    const newPromotionAccessoryData = {
      ...new PromotionAccessoryEntity(),
      ...this.promoAccessoryRepo.setData(data),
      created_by: user.user_id,
      updated_by: user.user_id,
    };

    const newPromotionAccessory = await this.promoAccessoryRepo.create(
      newPromotionAccessoryData,
    );

    if (data.products) {
      for (let productItem of data.products) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
        });

        const newProductData = {
          ...new ProductPromotionAccessoryEntity(),
          ...this.productPromoAccessoryRepo.setData(productItem),
          sale_price: product['price'],
          created_by: user.user_id,
          updated_by: user.user_id,
          accessory_id: newPromotionAccessory.accessory_id,
        };
        await this.productPromoAccessoryRepo.createSync(newProductData);
      }
    }
  }

  async get(accessory_id: number) {
    const promoAccessory = await this.promoAccessoryRepo.findOne({
      accessory_id,
    });
    if (!promoAccessory) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    if (promoAccessory['display_at']) {
      promoAccessory['display_at'] = moment(
        promoAccessory['display_at'],
      ).format('YYYY-MM-DD HH:mm:ss');
    }

    promoAccessory['products'] = [];

    let productLists = await this.productRepo.find({
      select: getProductAccessorySelector,
      join: productPromotionAccessoryJoiner,
      where: {
        [`${Table.PRODUCT_PROMOTION_ACCESSORY}.accessory_id`]: accessory_id,
      },
    });

    promoAccessory['products'] = productLists;

    return promoAccessory;
  }

  async update(accessory_id: number, data: UpdatePromotionAccessoryDto, user) {
    const promoAccessory = await this.promoAccessoryRepo.findById(accessory_id);
    if (!promoAccessory) {
      throw new HttpException(
        'Không tìm thấy nhóm SP phụ kiện khuyến mãi',
        404,
      );
    }

    if (data.products) {
      for (let productItem of data.products) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
        });
        if (!product) {
          throw new HttpException(
            `Sản phẩm có id ${productItem.product_id} tồn tại`,
            404,
          );
        }
        if (
          productItem.promotion_price < 0 ||
          productItem.promotion_price > product['price']
        ) {
          throw new HttpException(
            `Giá ưu đãi của id : ${product.product_id} ${productItem.promotion_price} không phù hợp, không được lớn hơn giá gốc `,
            400,
          );
        }
        if (productItem.sale_price_from > productItem.sale_price_to) {
          throw new HttpException(
            `Giá áp dụng bảo hành của ${product.product_id} từ ${productItem.sale_price_from} - ${productItem.sale_price_from} không phù hợp `,
            400,
          );
        }
      }
    }

    const updatePromoAccessoryData = {
      ...this.promoAccessoryRepo.setData(data),
      updated_at: convertToMySQLDateTime(),
      updated_by: user.user_id,
    };

    await this.promoAccessoryRepo.update(
      { accessory_id },
      updatePromoAccessoryData,
    );

    if (data.display_at) {
      data.display_at = moment(data.display_at).format('YYYY-MM-DD HH:mm:ss');
    }

    if (data.products && data.products.length) {
      await this.productPromoAccessoryRepo.delete({ accessory_id });
      for (let productItem of data.products) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
        });

        const newProductData = {
          ...new ProductPromotionAccessoryEntity(),
          ...this.productPromoAccessoryRepo.setData(productItem),
          sale_price: product['price'],
          created_by: user.user_id,
          updated_by: user.user_id,
          accessory_id: accessory_id,
        };
        await this.productPromoAccessoryRepo.createSync(newProductData);
      }
    }
  }

  async getList(params) {
    let { page, limit, search, accessory_type } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;
    let filterConditions = {};

    if (accessory_type) {
      filterConditions[`${Table.PROMOTION_ACCESSORY}.accessory_type`] =
        accessory_type;
    }
    const accessoriesList = await this.promoAccessoryRepo.find({
      select: '*',

      orderBy: [{ field: `updated_at`, sortBy: SortBy.DESC }],
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
        select: `COUNT(${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id) as total `,
        where: { accessory_id: accessoryItem.accessory_id },
      });
      accessoryItem['display_at'] = moment(accessoryItem['display_at']).format(
        'YYYY-DD-MM HH:mm:ss',
      );
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

  async itgCreate(data) {
    const convertedData = itgConvertGiftAccessoriesFromAppcore(data);
    const accessory = await this.promoAccessoryRepo.findOne({
      app_core_id: convertedData['app_core_id'],
    });
    if (accessory) {
      return;
    }

    const accessoryData = {
      ...new PromotionAccessoryEntity(),
      ...this.promoAccessoryRepo.setData(convertedData),
    };
    const newAccessory = await this.promoAccessoryRepo.create(accessoryData);

    if (
      convertedData['accessory_items'] &&
      Array.isArray(convertedData['accessory_items']) &&
      convertedData['accessory_items'].length
    ) {
      for (let accessoryItem of convertedData['accessory_items']) {
        let product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { product_appcore_id: accessoryItem['product_appcore_id'] },
        });
        let newAccessoryItemData = {
          ...new ProductPromotionAccessoryEntity(),
          ...this.productPromoAccessoryRepo.setData(accessoryItem),
          accessory_id: newAccessory['accessory_id'],
          product_id: product['product_id'] || 0,
          sale_price: product['price'] || 0,
        };
        await this.productPromoAccessoryRepo.createSync(newAccessoryItemData);
      }
    }

    if (
      convertedData['accessory_applied_products'] &&
      Array.isArray(convertedData['accessory_applied_products']) &&
      convertedData['accessory_applied_products'].length
    ) {
      for (let appliedProductItem of convertedData[
        'accessory_applied_products'
      ]) {
        let product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: {
            product_appcore_id: appliedProductItem['product_appcore_id'],
          },
        });
        if (product) {
          await this.productRepo.update(
            { product_id: product['product_id'] },
            { promotion_accessory_id: newAccessory['accessory_id'] },
          );
        }
      }
    }
  }
}
