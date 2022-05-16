import { Injectable, HttpException } from '@nestjs/common';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { PromotionAccessoryDetailRepository } from '../repositories/promotionAccessoryDetail.repository';
import { PromotionAccessoryDetailEntity } from '../entities/promotionAccessoryDetail.entity';
import { CreatePromotionAccessoryDto } from '../dto/promotionAccessories/create-promotionAccessory.dto';
import {
  productLeftJoiner,
  productPromotionAccessoryJoiner,
} from 'src/utils/joinTable';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { UpdatePromotionAccessoryDto } from '../dto/promotionAccessories/update-promotionAccessory.dto';
import { formatStandardTimeStamp } from '../../utils/helper';
import { promotionAccessoriesSearchFilter } from 'src/utils/tableConditioner';
import { Table } from 'src/database/enums';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { SortBy } from '../../database/enums/sortBy.enum';
import * as moment from 'moment';
import { getProductAccessorySelector } from 'src/utils/tableSelector';
import { itgConvertGiftAccessoriesFromAppcore } from '../../utils/integrateFunctions';
import { getProductsListByAccessoryIdSearchFilter } from '../../utils/tableConditioner';
import { UpdateProductPromotionAccessoryDto } from '../dto/promotionAccessories/update-productPromotionAccessory.dto';
import { productPromotionAccessorytLeftJoiner } from '../../utils/joinTable';
import { In } from '../../database/operators/operators';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import {
  getProductsListSelectorBE,
  getDetailProductsListSelectorFE,
} from '../../utils/tableSelector';
import { ProductPricesEntity } from '../entities/productPrices.entity';

@Injectable()
export class PromotionAccessoryService {
  constructor(
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private promoAccessoryDetailRepo: PromotionAccessoryDetailRepository<PromotionAccessoryDetailEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
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
          ...new PromotionAccessoryDetailEntity(),
          ...this.promoAccessoryDetailRepo.setData(productItem),
          sale_price: product['price'],
          created_by: user.user_id,
          updated_by: user.user_id,
          accessory_id: newPromotionAccessory.accessory_id,
        };
        await this.promoAccessoryDetailRepo.create(newProductData, false);
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

    promoAccessory['display_at'] = formatStandardTimeStamp(
      promoAccessory['display_at'],
    );
    promoAccessory['end_at'] = formatStandardTimeStamp(
      promoAccessory['end_at'],
    );
    promoAccessory['created_at'] = formatStandardTimeStamp(
      promoAccessory['created_at'],
    );
    promoAccessory['updated_at'] = formatStandardTimeStamp(
      promoAccessory['updated_at'],
    );

    promoAccessory['products'] = [];

    let productLists = await this.productRepo.find({
      select: getProductAccessorySelector,
      join: productPromotionAccessoryJoiner,
      where: {
        [`${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.accessory_id`]:
          accessory_id,
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
      updated_at: formatStandardTimeStamp(),
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
      await this.promoAccessoryDetailRepo.delete({ accessory_id });
      for (let productItem of data.products) {
        const product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
        });

        const newProductData = {
          ...new PromotionAccessoryDetailEntity(),
          ...this.promoAccessoryDetailRepo.setData(productItem),
          sale_price: product['price'],
          created_by: user.user_id,
          updated_by: user.user_id,
          accessory_id: accessory_id,
        };
        await this.promoAccessoryDetailRepo.create(newProductData, false);
      }
    }

    let accessoryType = promoAccessory['accessory_type'];
    let productFieldNameByAccessory = '';
    switch (+accessoryType) {
      case 1:
        productFieldNameByAccessory = 'promotion_accessory_id';
        break;
      case 2:
        productFieldNameByAccessory = 'free_accessory_id';
        break;
      case 3:
        productFieldNameByAccessory = 'warranty_package_id';
        break;
    }
    await this.productRepo.update(
      { [productFieldNameByAccessory]: accessory_id },
      { [productFieldNameByAccessory]: 0 },
    );
    if (data.applied_products && data.applied_products.length) {
      for (let productId of data.applied_products) {
        await this.productRepo.update(
          { product_id: productId },
          { [productFieldNameByAccessory]: accessory_id },
        );
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
      const productsCount = await this.promoAccessoryDetailRepo.find({
        select: `COUNT(${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.product_id) as total `,
        where: { accessory_id: accessoryItem.accessory_id },
      });
      accessoryItem['display_at'] = moment(accessoryItem['display_at']).format(
        'YYYY-DD-MM HH:mm:ss',
      );
      accessoryItem['end_at'] = moment(accessoryItem['end_at']).format(
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

    const accessoriesProducts = await this.promoAccessoryDetailRepo.find({
      select: '*',
      join: {
        [JoinTable.innerJoin]: {
          [Table.PROMOTION_ACCESSORY]: {
            fieldJoin: 'accessory_id',
            rootJoin: 'accessory_id',
          },
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.product_id`,
          },
        },
      },
      where: {
        [`${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.product_id`]: product_id,
      },
    });

    return accessoriesProducts;
  }

  async itgCreate(data, type) {
    const convertedData = itgConvertGiftAccessoriesFromAppcore(data, type);
    const accessory = await this.promoAccessoryRepo.findOne({
      app_core_id: convertedData['app_core_id'],
    });
    if (accessory) {
      return this.itgUpdate(convertedData['app_core_id'], data, type);
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
        // Tạm thời ignore SP chưa tồn tại
        if (product) {
          let newAccessoryItemData = {
            ...new PromotionAccessoryDetailEntity(),
            ...this.promoAccessoryDetailRepo.setData(accessoryItem),
            accessory_id: newAccessory['accessory_id'],
            product_id: product['product_id'] || 0,
            sale_price: product['price'] || 0,
          };

          if (type == 4 && accessoryItem['promotion_price']) {
            const productPriceData = {
              promotion_price: accessoryItem['promotion_price'],
              promotion_discount: accessoryItem['promotion_discount'] || 0,
              promotion_discount_type:
                accessoryItem['promotion_discount_type'] || 0,
              promotion_start_at: newAccessory['display_at'],
              promotion_end_at: newAccessory['end_at'],
            };
            await this.productPriceRepo.update(
              { product_id: product.product_id },
              productPriceData,
            );
          }

          await this.promoAccessoryDetailRepo.create(
            newAccessoryItemData,
            false,
          );
        }
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
          let updatedData = {};
          switch (type) {
            case 1:
              updatedData = {
                promotion_accessory_id: newAccessory['accessory_id'],
              };
              break;
            case 2:
              updatedData = {
                free_accessory_id: newAccessory['accessory_id'],
              };
              break;
            case 3:
              updatedData = {
                warranty_package_id: newAccessory['accessory_id'],
              };
              break;
          }

          await this.productRepo.update(
            { product_id: product['product_id'] },
            updatedData,
          );
        }
      }
    }
  }

  async getProductsListByAccessoryId(accessory_id: number, params) {
    let accessory = await this.promoAccessoryRepo.findOne({ accessory_id });
    if (!accessory) {
      throw new HttpException('Không tìm thấy.', 404);
    }

    let { category_id } = params;
    let { page, limit, search } = params;
    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    // filterCondition[`${Table.PRODUCT_PROMOTION_ACCESSOR_DETAIL}.accessory_id`] =
    //   accessory_id;

    if (category_id) {
      filterCondition[`${Table.PRODUCTS_CATEGORIES}.category_id`] =
        category_id.split(',').length > 1
          ? In(category_id.split(','))
          : category_id;
    }
    console.log(filterCondition);

    switch (+accessory.accessory_type) {
      case 1:
        filterCondition[`${Table.PRODUCTS}.promotion_accessory_id`] =
          accessory_id;
        break;
      case 2:
        filterCondition[`${Table.PRODUCTS}.free_accessory_id`] = accessory_id;
        break;
      case 3:
        filterCondition[`${Table.PRODUCTS}.warranty_package_id`] = accessory_id;
        break;
    }

    console.log(filterCondition);

    const productsList = await this.productRepo.find({
      select: getProductAccessorySelector,
      join: productLeftJoiner,
      where: getProductsListByAccessoryIdSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    let count = await this.productRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productLeftJoiner,
      where: getProductsListByAccessoryIdSearchFilter(search, filterCondition),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      products: productsList,
    };
  }

  async itgUpdate(app_core_id: string, data, type: number) {
    data['app_core_id'] = app_core_id;
    let convertedData = itgConvertGiftAccessoriesFromAppcore(data, type);
    let accessory = await this.promoAccessoryRepo.findOne({ app_core_id });
    if (!accessory) {
      return this.itgCreate(data, type);
    }

    // await this.itgCheckConstraint(convertedData);

    const accessoryData = {
      ...this.promoAccessoryRepo.setData(convertedData),
      updated_at: formatStandardTimeStamp(),
    };

    await this.promoAccessoryRepo.update(
      { accessory_id: accessory['accessory_id'] },
      accessoryData,
    );

    if (
      convertedData['accessory_items'] &&
      Array.isArray(convertedData['accessory_items']) &&
      convertedData['accessory_items'].length
    ) {
      await this.promoAccessoryDetailRepo.delete({
        accessory_id: accessory['accessory_id'],
      });
      for (let accessoryItem of convertedData['accessory_items']) {
        let product = await this.productRepo.findOne({
          select: '*',
          join: productLeftJoiner,
          where: { product_appcore_id: accessoryItem['product_appcore_id'] },
        });
        // Tạm thời ignore SP chưa tồn tại
        if (product) {
          let newAccessoryItemData = {
            ...new PromotionAccessoryDetailEntity(),
            ...this.promoAccessoryDetailRepo.setData(accessoryItem),
            accessory_id: accessory['accessory_id'],
            product_id: product['product_id'] || 0,
            sale_price: product['price'] || 0,
          };

          await this.promoAccessoryDetailRepo.create(
            newAccessoryItemData,
            false,
          );
        }
      }
    }

    if (
      convertedData['accessory_applied_products'] &&
      Array.isArray(convertedData['accessory_applied_products']) &&
      convertedData['accessory_applied_products'].length
    ) {
      await this.productRepo.update(
        { promotion_accessory_id: accessory['accessory_id'] },
        { promotion_accessory_id: 0 },
      );
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
          let updatedData = {};
          switch (type) {
            case 1:
              updatedData = {
                promotion_accessory_id: accessory['accessory_id'],
              };
              break;
            case 2:
              updatedData = { free_accessory_id: accessory['accessory_id'] };
              break;

            case 3:
              updatedData = {
                warranty_package_id: accessory['accessory_id'],
              };
              break;
          }

          await this.productRepo.update(
            { product_appcore_id: appliedProductItem['product_appcore_id'] },
            updatedData,
          );
        }
      }
    }
  }

  async itgCheckConstraint(convertedData) {
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

        if (!product) {
          throw new HttpException(
            `Không tìm thấy sp trong items có id ${accessoryItem['product_appcore_id']}`,
            404,
          );
        }
      }
    }
  }

  async updateProductAccessory(
    accessory_id: number,
    data: UpdateProductPromotionAccessoryDto,
  ) {
    let accessory = await this.promoAccessoryRepo.findOne({ accessory_id });
    if (!accessory) {
      throw new HttpException('Không tìm thấy bộ Phụ kiện', 404);
    }
    let typeNameOfAccessory;
    switch (+accessory.accessory_type) {
      case 1:
        typeNameOfAccessory = 'promotion_accessory_id';
        break;
      case 2:
        typeNameOfAccessory = 'free_accessory_id';
        break;
      case 3:
        typeNameOfAccessory = 'warranty_package_id';
        break;
    }
    if (data.removed_products && data.removed_products.length) {
      for (let productId of data.removed_products) {
        await this.productRepo.update(
          { product_id: productId },
          { [typeNameOfAccessory]: 0 },
        );
      }
    }
    if (data.inserted_products && data.inserted_products.length) {
      for (let productId of data.inserted_products) {
        await this.productRepo.update(
          { product_id: productId },
          { [typeNameOfAccessory]: accessory_id },
        );
      }
    }
  }
}
