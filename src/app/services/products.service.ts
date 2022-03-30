import { Injectable, HttpException, HttpService, Inject } from '@nestjs/common';
import { ProductDescriptionsEntity } from '../entities/productDescriptions.entity';
import { ProductOptionsInventoryEntity } from '../entities/productOptionsInventory.entity';
import { ProductPointPriceEntity } from '../entities/productPointPrices.entity';
import { ProductsEntity } from '../entities/products.entity';
import { ProductDescriptionsRepository } from '../repositories/productDescriptions.respository';
import { ProductOptionsInventoryRepository } from '../repositories/productOptionsInventory.repository';
import { ProductPointPriceRepository } from '../repositories/productPointPrice.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductFeatureValueEntity } from '../entities/productFeaturesValues.entity';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductOptionsRepository } from '../repositories/productOptions.repository';
import { ProductOptionsEntity } from '../entities/productOptions.entity';
import { ProductOptionDescriptionRepository } from '../repositories/productOptionsDescriptions.repository';
import { ProductOptionDescriptionEntity } from '../entities/productOptionDescriptions.entity';
import { ProductOptionVariantsRepository } from '../repositories/productOptionVariants.repository';
import { ProductOptionVariantsEntity } from '../entities/productOptionVariants.entity';
import { ProductOptionVariantDescriptionRepository } from '../repositories/productOptionsVariantsDescriptions.respository';
import { ProductOptionVariantDescriptionEntity } from '../entities/productOptionsVariantsDescriptions.entity';
import {
  convertToMySQLDateTime,
  generateRandomString,
  preprocessAddTextDataToMysql,
} from 'src/utils/helper';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { ProductsCategoriesEntity } from '../entities/productsCategories.entity';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupFeaturesEntity } from '../entities/productVariationGroupFeatures.entity';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { ProductVariationGroupsEntity } from '../entities/productVariationGroups.entity';
import { ProductVariationGroupFeaturesRepository } from '../repositories/productVariationGroupFeatures.repository';
import { ProductSalesRepository } from '../repositories/productSales.repository';
import { ProductSalesEntity } from '../entities/productSales.entity';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductPricesEntity } from '../entities/productPrices.entity';
import { JoinTable, SortBy, Table } from 'src/database/enums';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';
import {
  productFamilyJoiner,
  productFeaturesByCategory,
  productFeaturesJoiner,
  productFullJoiner,
  productJoiner,
  productGroupJoiner,
  productGroupProductsJoiner,
  productInfoJoiner,
  productSearchJoiner,
  productsSearchOnOrderJoiner,
  productByCategoryJoiner,
} from 'src/utils/joinTable';
import {
  productSearch,
  productSearchFilterOnOrder,
  productsFamilyFilterConditioner,
  productsGroupFilterConditioner,
  productsListCategorySearchFilter,
} from 'src/utils/tableConditioner';
import { In, Like, MoreThan, Not } from 'src/database/find-options/operators';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { ProductFeatureEntity } from '../entities/productFeature.entity';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureDescriptionEntity } from '../entities/productFeatureDescription.entity';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductFeatureVariantDescriptionEntity } from '../entities/productFeatureVariantDescription.entity';
import * as _ from 'lodash';
import { ImagesRepository } from '../repositories/image.repository';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksRepository } from '../repositories/imageLink.repository';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
import {
  ImageObjectType,
  ImageType,
} from 'src/database/enums/tableFieldEnum/imageTypes.enum';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { Equal, IsNull, LessThan } from '../../database/find-options/operators';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import {
  convertToSlug,
  MaxLimit,
  removeVietnameseTones,
} from '../../utils/helper';
import { UpdateImageDto } from '../dto/product/update-productImage.dto';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import { productsListsSearchFilter } from '../../utils/tableConditioner';
import axios from 'axios';
import * as FormData from 'form-data';
import { data } from '../../database/constant/category';
import { DeleteProductImageDto } from '../dto/product/delete-productImage.dto';

import {
  categorySelector,
  getProductsListSelector,
  productFeatureValuesSelector,
} from 'src/utils/tableSelector';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationDescriptionEntity } from '../entities/storeLocationDescription.entity';
import { StoreLocationDescriptionsRepository } from '../repositories/storeLocationDescriptions.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
import { GroupProductStatusEnum } from 'src/database/enums/tableFieldTypeStatus.enum';
import { ProductGroupTypeEnum } from 'src/database/enums/tableFieldEnum/productGroupType.enum';
import { ProductStoreRepository } from '../repositories/productStore.repository';
import { ProductStoreEntity } from '../entities/productStore.entity';
import { ProductStoreHistoryRepository } from '../repositories/productStoreHistory.repository';
import { ProductStoreHistoryEntity } from '../entities/productStoreHistory.entity';
import { CreateProductStoreDto } from '../dto/product/create-productStore.dto';
import {
  GET_PRODUCTS_APPCORE_LIST,
  GET_PRODUCTS_COMBO_STORES_API,
  GET_PRODUCTS_LIST_APPCORE_BY_PAGE_API,
  GET_PRODUCTS_STORES_API,
  GET_PRODUCT_APPCORE_DETAIL,
  UPLOAD_IMAGE_API,
} from 'src/database/constant/api.appcore';
import { CreateProductAppcoreDto } from '../dto/product/create-product.appcore.dto';
import {
  convertGetProductsFromAppcore,
  convertProductDataFromAppcore,
  itgConvertProductsFromAppcore,
} from '../../utils/integrateFunctions';
// import { productsData } from 'src/database/constant/product';
// import * as mockProductsData from 'src/database/constant/_productsData.json';

import { DatabaseService } from '../../database/database.service';
import { ProductVariationGroupIndexRepository } from '../repositories/productVariationGroupIndex.respository';
import { ProductVariationGroupIndexEntity } from '../entities/productVariationGroupIndex.entity';
import { processGetTextDataFromMysql } from '../../utils/helper';
import { join } from 'path';
import { ProductStickerRepository } from '../repositories/productSticker.repository';
import { ProductStickerEntity } from '../entities/productSticker.entity';
import { StickerRepository } from '../repositories/sticker.repository';
import { StickerEntity } from '../entities/sticker.entity';
import * as moment from 'moment';

@Injectable()
export class ProductService {
  constructor(
    private productRepo: ProductsRepository<ProductsEntity>,
    private productDescriptionsRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    private productVariationGroupProductsRepo: ProductVariationGroupProductsRepository<ProductVariationGroupFeaturesEntity>,
    private productVariationGroupRepo: ProductVariationGroupsRepository<ProductVariationGroupsEntity>,
    private productVariationGroupFeatureRepo: ProductVariationGroupFeaturesRepository<ProductVariationGroupFeaturesEntity>,
    private productSaleRepo: ProductSalesRepository<ProductSalesEntity>,
    private productCategoryRepo: ProductsCategoriesRepository<ProductsCategoriesEntity>,
    private productPointPriceRepo: ProductPointPriceRepository<ProductPointPriceEntity>,
    private productPriceRepo: ProductPricesRepository<ProductPricesEntity>,
    private productOptionsInventoryRepo: ProductOptionsInventoryRepository<ProductOptionsInventoryEntity>,
    private productFeatureValueRepo: ProductFeatureValueRepository<ProductFeatureValueEntity>,
    private productOptionsRepo: ProductOptionsRepository<ProductOptionsEntity>,
    private productOptionDescriptionRepo: ProductOptionDescriptionRepository<ProductOptionDescriptionEntity>,
    private productOptionVariantsRepo: ProductOptionVariantsRepository<ProductOptionVariantsEntity>,
    private productOptionVariantDescriptionRepo: ProductOptionVariantDescriptionRepository<ProductOptionVariantDescriptionEntity>,
    private categoryRepo: CategoryRepository<CategoryEntity>,
    private productFeaturesRepo: ProductFeaturesRepository<ProductFeatureEntity>,
    private productFeatureDescriptionRepo: ProductFeatureDescriptionsRepository<ProductFeatureDescriptionEntity>,
    private productFeatureVariantDescriptionRepo: ProductFeatureVariantDescriptionRepository<ProductFeatureVariantDescriptionEntity>,
    private productFeatureVariantRepo: ProductFeatureVariantsRepository<ProductFeatureVariantEntity>,
    private productGroupIndexRepo: ProductVariationGroupIndexRepository<ProductVariationGroupIndexEntity>,
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
    private storeRepo: StoreLocationRepository<StoreLocationDescriptionEntity>,
    private storeDescRepo: StoreLocationDescriptionsRepository<StoreLocationDescriptionEntity>,
    private productStoreRepo: ProductStoreRepository<ProductStoreEntity>,
    private productStoreHistoryRepo: ProductStoreHistoryRepository<ProductStoreHistoryEntity>,
    private productStickerRepo: ProductStickerRepository<ProductStickerEntity>,
    private stickerRepo: StickerRepository<StickerEntity>,
    private databaseService: DatabaseService,
  ) {}

  async syncProductsIntoGroup(): Promise<void> {
    //===========Product group, product group product =============

    // Lấy danh sách các sản phẩm cha (bao gồm SP cấu hình, ngoài trự sản phẩm service product_code =4)
    let parentProductsList = await this.productRepo.find({
      select: ['*'],
      where: { [`${Table.PRODUCTS}.parent_product_id`]: 0 },
    });

    parentProductsList = parentProductsList.filter(
      ({ product_type }) => product_type != 4 && product_type !== 3,
    );

    // Kiểm tra xem các parent này đã tạo group hay chưa, nếu đã tạo rồi thì bỏ qua, nếu chưa thì sẽ tạo mới
    for (let parentProductItem of parentProductsList) {
      const productGroup = await this.productVariationGroupRepo.findOne({
        product_root_id: parentProductItem.product_id,
      });
      if (!productGroup) {
        const newProductGroup = await this.productVariationGroupRepo.create({
          product_root_id: parentProductItem.product_id,
          created_at: convertToMySQLDateTime(),
          updated_at: convertToMySQLDateTime(),
        });
        await this.productVariationGroupProductsRepo.createSync({
          product_id: parentProductItem.product_id,
          parent_product_id: parentProductItem.parent_product_id,
          group_id: newProductGroup.group_id,
        });

        // Tìm ds các SP con, sau đó tim group chứa SP cha, kiểm tra SP con đã chứa trong đó hay chưa, nếu chưa thì thêm vào
        const childrenProductsList = await this.productRepo.find({
          select: '*',
          where: {
            [`${Table.PRODUCTS}.parent_product_id`]:
              parentProductItem.product_id,
          },
        });

        if (childrenProductsList.length) {
          for (let childProduct of childrenProductsList) {
            await this.productVariationGroupProductsRepo.create({
              group_id: newProductGroup.group_id,
              product_id: childProduct.product_id,
              parent_product_id: childProduct.parent_product_id,
            });
          }
        }
      }
    }

    //============ Product group features =============
    // Đồng bộ thuộc tính SP
    // Lấy Danh sách các group -> group products -> lấy danh sách các SP trong group -> Lấy danh sách các feature trong product feature values
    let groupLists = await this.productVariationGroupRepo.find({
      select: 'group_id',
    });

    for (let { group_id } of groupLists) {
      const productMembersList =
        await this.productVariationGroupProductsRepo.find({
          select: ['product_id'],
          where: { group_id },
        });
      for (let { product_id } of productMembersList) {
        // Kiểm tra features theo product_id trong product_feature_values
        const featuresList = await this.productFeatureValueRepo.find({
          select: ['feature_id', 'variant_id'],
          where: { product_id },
        });

        // Đưa vào product group features
        if (featuresList.length) {
          // Kiểm tra xem trong product_group_features với group_id đã tồn tại feature_id này hay chưa

          for (let { feature_id, variant_id } of featuresList) {
            if (!feature_id || !variant_id) {
              continue;
            }
            let featureValueInGroup =
              await this.productVariationGroupFeatureRepo.findOne({
                feature_id,
                variant_id,
                group_id,
              });
            // Nếu trong group features không tìm thấy thì sẽ thêm feature này vào group, ngược lại bỏ qua
            if (!featureValueInGroup) {
              await this.productVariationGroupFeatureRepo.createSync({
                feature_id,
                variant_id,
                group_id,
              });
            }
          }
        }
      }
    }
  }

  async createProductFeatures(
    productFeatures,
    productId,
    groupId,
    purpose = '',
  ): Promise<void> {
    if (productFeatures.length) {
      for (let { feature_id, variant_id } of productFeatures) {
        const productFeatureVariant =
          await this.productFeatureVariantDescriptionRepo.findOne({
            variant_id,
          });

        let featureValue = await this.productFeatureValueRepo.findOne({
          feature_id,
          variant_id,
          product_id: productId,
        });
        if (!featureValue) {
          featureValue = await this.productFeatureValueRepo.create({
            feature_id,
            variant_id,
            product_id: productId,
            value: isNaN(+productFeatureVariant.variant * 1)
              ? productFeatureVariant.variant
              : '',
            value_int: !isNaN(+productFeatureVariant.variant * 1)
              ? +productFeatureVariant.variant
              : 0,
          });
        }

        // Check group feature by feature_id and group_id, if not exists, create new record
        let checkProductGroupFeatureExist =
          await this.productVariationGroupFeatureRepo.findOne({
            feature_id,
            group_id: groupId,
          });

        if (!checkProductGroupFeatureExist) {
          const feature: ProductFeatureDescriptionEntity =
            await this.productFeatureDescriptionRepo.findOne({ feature_id });
          await this.productVariationGroupFeatureRepo.create({
            feature_id,
            group_id: groupId,
            purpose: purpose || feature.description,
          });
        }
      }
    }
  }

  async getParentsList() {
    const products = await this.productRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: 'product_id',
            rootJoin: 'product_id',
          },
        },
      },
      where: {
        parent_product_id: 0,
        product_type: [1, 2],
      },
    });

    return products;
  }

  async searchOnOrder(params) {
    let { page, limit, search, category_ids } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterConditions = {
      [`${Table.PRODUCTS}.amount`]: MoreThan(0),
    };

    if (category_ids) {
      filterConditions['category_id'] = category_ids.split(',');
    }

    let productsList = await this.productRepo.find({
      select: '*',
      join: productsSearchOnOrderJoiner,
      where: productSearchFilterOnOrder(search, filterConditions),
      skip,
      limit,
    });
    let count = await this.productRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productsSearchOnOrderJoiner,
      where: productSearchFilterOnOrder(search, filterConditions),
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

  async get(identifier: number | string): Promise<any> {
    // get Product item

    let product = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCTS}.status`,
        `${Table.PRODUCTS}.parent_product_id`,
      ],
      join: {
        [JoinTable.leftJoin]: productFullJoiner,
      },
      where: [
        { [`${Table.PRODUCTS}.product_id`]: identifier },
        { [`${Table.PRODUCTS}.product_code`]: identifier },
        { [`${Table.PRODUCTS}.product_appcore_id`]: identifier },
      ],
    });

    if (!product) {
      throw new HttpException('Không tìm thấy sp', 404);
    }
    return this.getProductDetails(product, true);
  }

  async getBySlug(slug: string): Promise<any> {
    let product = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCTS}.status`,
        `${Table.PRODUCTS}.slug as slug`,
        `${Table.CATEGORIES}.slug as categorySlug`,
      ],
      join: {
        [JoinTable.leftJoin]: productFullJoiner,
      },
      where: { [`${Table.PRODUCTS}.slug`]: slug },
    });

    if (!product) {
      throw new HttpException('Không tìm thấy sản phẩm.', 404);
    }

    // Get product Image
    return this.getProductDetails(product);
  }

  async parentCategories(category, categoriesList = [{ ...category }]) {
    if (!category.parent_id) {
      return categoriesList;
    } else {
      let parentCategory = await this.categoryRepo.findOne({
        select: [
          `${Table.CATEGORIES}.category_id`,
          'level',
          'slug',
          'category',
          'parent_id',
        ],
        join: {
          [JoinTable.leftJoin]: {
            [Table.CATEGORY_DESCRIPTIONS]: {
              fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
          },
        },
        where: {
          [`${Table.CATEGORIES}.category_id`]: category.parent_id,
        },
      });
      categoriesList = [...categoriesList, { ...parentCategory }];

      return this.parentCategories(parentCategory, categoriesList);
    }
  }

  async getList(params: any): Promise<any> {
    let {
      page,
      limit,
      search,
      status,
      category_id,
      product_status,
      product_type,
      productType,
      status_type,
      catalog_category_id,
      type,
    } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (status) {
      filterCondition[`${Table.PRODUCTS}.status`] = status;
    }
    if (product_status) {
      filterCondition[`${Table.PRODUCTS}.product_status`] = product_status;
    }
    if (product_type) {
      filterCondition[`${Table.PRODUCTS}.product_type`] = product_type;
    }
    if (productType) {
      if (productType == 1) {
        filterCondition[`${Table.PRODUCTS}.product_type`] = LessThan(3);
        filterCondition[`${Table.PRODUCTS}.parent_product_id`] = 0;
      }
      if (productType == 2) {
        filterCondition[`${Table.PRODUCTS}.product_type`] = LessThan(3);
        filterCondition[`${Table.PRODUCTS}.parent_product_id`] = MoreThan(0);
      }
      if (productType == 3) {
        filterCondition[`${Table.PRODUCTS}.product_type`] = 3;
      }
      if (productType == 4) {
        filterCondition[`${Table.PRODUCTS}.product_type`] = MoreThan(3);
      }
    }

    if (catalog_category_id) {
      filterCondition[`${Table.PRODUCTS}.catalog_category_id`] =
        catalog_category_id;
    }

    if (status_type) {
      filterCondition[`${Table.PRODUCTS}.status_type`] = status_type;
    }

    if (type) {
      filterCondition[`${Table.PRODUCTS}.type`] = type;
    }

    let categoriesList = [];
    if (category_id) {
      categoriesList = await this.childrenCategories(category_id);
      categoriesList = [
        +category_id,
        ...categoriesList.map(({ category_id }) => category_id),
      ];
    }

    const productLists = await this.productRepo.find({
      select: getProductsListSelector,
      join: {
        [JoinTable.innerJoin]: productJoiner,
      },
      orderBy: [
        { field: `${Table.PRODUCTS}.updated_at`, sortBy: SortBy.DESC },
        { field: `${Table.PRODUCTS}.created_at`, sortBy: SortBy.DESC },
      ],
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    let count = await this.productRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: {
        [JoinTable.innerJoin]: productJoiner,
      },
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    // determine product type and  get Image
    for (let productItem of productLists) {
      if (
        (productItem.parent_product_id == 0 ||
          !productItem['parent_product_id']) &&
        (productItem.product_type == 1 || productItem.product_type == 2)
      ) {
        productItem['productType'] = 1; //Sản phẩm cha
      } else if (
        productItem.parent_product_id != 0 &&
        (productItem.product_type == 1 || productItem.product_type == 2)
      ) {
        productItem['productType'] = 2; // Sản phẩm con
      } else if (productItem.product_type == 3) {
        productItem['productType'] = 3; //SP combo
      } else {
        productItem['productType'] = 4; // SP độc lập
      }

      productItem['image'] = null;

      const productImage = await this.imageLinkRepo.findOne({
        object_id: productItem.product_id,
        object_type: ImageObjectType.PRODUCT,
      });

      if (productImage) {
        const image = await this.imageRepo.findOne({
          image_id: productImage.image_id,
        });
        productItem['image'] = image;
      }
    }

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      products: productLists,
    };
  }

  async groupingProducts(start_product_id: number, dest_product_id: number) {
    const product = await this.productRepo.findOne({
      product_id: start_product_id,
    });
    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }
    if (product.product_type == 3) {
      throw new HttpException(
        'Sản phẩm combo không thể dời đến nhóm SP khác',
        403,
      );
    }

    const destProduct = await this.productRepo.findOne({
      product_id: dest_product_id,
    });
    if (!destProduct) {
      throw new HttpException('Không tìm thấy SP đích', 404);
    }

    if (destProduct.product_type == 3) {
      throw new HttpException(
        'Sản phẩm combo không thể dời đến nhóm SP khác',
        403,
      );
    }

    if (
      (product.product_type == 2 || product.product_type == 1) &&
      (destProduct.product_type == 2 || destProduct.product_type == 1)
    ) {
      // Xác định SP là cha hay SP con

      let startGroup;
      if (!product.parent_product_id) {
        startGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: product.product_id,
        });
      } else {
        startGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: product.parent_product_id,
        });
      }

      if (!startGroup) return;

      let destGroup;
      if (!destProduct.parent_product_id) {
        destGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: destProduct.product_id,
        });
      } else {
        destGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: destProduct.parent_product_id,
        });
      }

      if (!destProduct) return;

      const startProductsList =
        await this.productVariationGroupProductsRepo.find({
          group_id: startGroup.group_id,
        });
      const destProductsList =
        await this.productVariationGroupProductsRepo.find({
          group_id: destGroup.group_id,
        });

      let willAddProductsInStartGroup = destProductsList.filter(
        ({ product_id }) =>
          !startProductsList.some(
            ({ product_id: startProductId }) => startProductId == product_id,
          ),
      );

      let willAddProductsInDestGroup = startProductsList.filter(
        ({ product_id }) =>
          !destProductsList.some(
            ({ product_id: destProductId }) => destProductId == product_id,
          ),
      );

      for (let [i, productItem] of willAddProductsInStartGroup.entries()) {
        if (
          productItem.parent_product_id == 0 ||
          !productItem.parent_product_id
        ) {
          if (!productItem.product_group_name) {
            productItem.product_group_name = `Loại - ${i + 1}`;
          }
          await this.productVariationGroupProductsRepo.create({
            ...productItem,
            group_id: startGroup.group_id,
          });
        }
      }
      for (let [i, productItem] of willAddProductsInDestGroup.entries()) {
        if (
          productItem.parent_product_id == 0 ||
          !productItem.parent_product_id
        ) {
          if (!productItem.product_group_name) {
            productItem.product_group_name = `Loại - ${i + 1}`;
          }
          await this.productVariationGroupProductsRepo.create({
            ...productItem,
            group_id: destGroup.group_id,
          });
        }
      }
    }
  }

  async childrenCategories(categoryId, categoriesList = []) {
    let categories = await this.categoryRepo.find({
      select: categorySelector,
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
          },
        },
      },
      where: { [`${Table.CATEGORIES}.parent_id`]: categoryId },
    });
    if (categories.length) {
      for (let categoryItem of categories) {
        categoriesList = [...categoriesList, categoryItem];
      }
    } else {
      return categoriesList;
    }

    for (let { category_id } of categories) {
      categoriesList = await this.childrenCategories(
        category_id,
        categoriesList,
      );
    }

    return categoriesList;
  }

  async getProductsListByCategoryId(
    categoryId: number,
    params: any,
  ): Promise<any> {
    // Kiểm tra sự tồn tại của category
    const category = await this.categoryRepo.findOne({
      select: categorySelector,
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
          },
        },
      },
      where: { [`${Table.CATEGORIES}.category_id`]: categoryId },
    });

    if (!category) {
      throw new HttpException('Không tìm thấy danh mục sản phẩm.', 404);
    }

    return this.getProductListByCategory(category, params);
  }

  async getProductsListByCategorySlug(slug: string, params) {
    const category = await this.categoryRepo.findOne({
      select: categorySelector,
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
          },
        },
      },
      where: { [`${Table.CATEGORIES}.slug`]: slug },
    });

    if (!category) {
      throw new HttpException('Không tìm thấy danh mục SP.', 404);
    }

    return this.getProductListByCategory(category, params);
  }

  async getProductListByCategory(category, params) {
    let categoryId = category.category_id;
    let categoriesListByLevel = await this.childrenCategories(categoryId);

    categoriesListByLevel = _.orderBy(
      categoriesListByLevel,
      ['level'],
      ['asc'],
    );

    let categoriesList = [
      +categoryId,
      ..._.map(categoriesListByLevel, 'category_id'),
    ];

    let { page, limit, search, ...others } = params;

    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    const productsList = await this.productRepo.find({
      select: `*, ${Table.PRODUCTS}.*`,
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: {
        [`${Table.PRODUCTS_CATEGORIES}.category_id `]: categoriesList.map(
          (categoryId) => categoryId,
        ),
        [`${Table.PRODUCTS}.parent_product_id`]: 0,
      },
      skip,
      limit,
    });

    for (let productItem of productsList) {
      // get images
      const productImageLink = await this.imageLinkRepo.findOne({
        object_id: productItem.product_id,
        object_type: ImageObjectType.PRODUCT,
      });
      if (productImageLink) {
        const productImage = await this.imageRepo.findOne({
          image_id: productImageLink.image_id,
        });
        productItem['image'] = { ...productImageLink, ...productImage };
      }

      //find product Stickers
      productItem['stickers'] = await this.getProductStickers(productItem);
    }

    const count = await this.productRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: {
        [`${Table.PRODUCTS_CATEGORIES}.category_id `]: categoriesList.map(
          (categoryId) => categoryId,
        ),
        [`${Table.PRODUCTS}.parent_product_id`]: 0,
      },
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0]?.total,
      },
      currentCategory: category,
      childrenCategories: categoriesListByLevel,
      products: productsList,
    };
  }

  async update(identifier: string | number, data: UpdateProductDto) {
    // Filter Exception
    const currentProduct = await this.productRepo.findOne({
      select: '*',
      where: [{ product_code: identifier }, { product_id: identifier }],
    });

    if (!currentProduct) {
      throw new HttpException(
        `Không tìm thấy SP có identifier ${identifier}`,
        404,
      );
    }

    // //Kiểm tra product features hợp lệ
    // if (data?.product_features?.length) {
    //   for (let productFeature of data.product_features) {
    //     const productFeatureItem = await this.productFeaturesRepo.findOne({
    //       feature_id: productFeature.feature_id,
    //     });
    //     if (
    //       productFeatureItem &&
    //       productFeatureItem['is_singly_choosen'] === 'Y' &&
    //       data.product_features.reduce(
    //         (acc, ele) =>
    //           ele.feature_id === productFeatureItem.feature_id ? acc + 1 : acc,
    //         0,
    //       ) > 1
    //     ) {
    //       throw new HttpException(
    //         `Thuộc tính SP có id ${productFeatureItem.feature_id} chỉ được chọn 1, không thể chọn nhiều`,
    //         422,
    //       );
    //     }
    //   }
    // }

    let result = { ...currentProduct };

    // Kiểm tra tính sku đã tồn tại hay chưa
    if (data.product_code) {
      const product = await this.productRepo.findOne({
        product_code: data.product_code,
        product_id: Not(Equal(result.product_id)),
      });
      if (product) {
        throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
      }
    }

    // Kiểm tra slug đã tồn tại hay chưa
    if (data.slug) {
      const product = await this.productRepo.findOne({
        slug: data.slug,
        product_id: Not(Equal(result.product_id)),
      });

      if (product) {
        throw new HttpException('Slug đã tồn tại', 409);
      }
    }

    // Update thông tin cơ bản của SP

    // Update product
    const productData = this.productRepo.setData({
      ...data,
      updated_at: convertToMySQLDateTime(),
    });
    if (Object.entries(productData).length) {
      const updatedProduct = await this.productRepo.update(
        { product_id: result.product_id },
        productData,
      );

      result = { ...result, ...updatedProduct };
    }

    // Update product description
    const productDesc = await this.productDescriptionsRepo.findOne({
      product_id: result.product_id,
    });
    if (productDesc) {
      const productDescData = this.productDescriptionsRepo.setData(data);
      if (Object.entries(productDescData).length) {
        const updatedProductDesc = await this.productDescriptionsRepo.update(
          { product_id: result.product_id },
          productDescData,
        );
        result = { ...result, ...updatedProductDesc };
      }
    } else {
      const newProductDescData = {
        ...new ProductDescriptionsEntity(),
        ...this.productDescriptionsRepo.setData(data),
        product_id: result.product_id,
      };
      const newProductDesc = await this.productDescriptionsRepo.create(
        newProductDescData,
      );
      result = { ...result, ...newProductDesc };
    }

    // Update product price
    const productrPrice = await this.productPriceRepo.findOne({
      product_id: result.product_id,
    });
    if (productrPrice) {
      const productPriceData = this.productPriceRepo.setData(data);
      if (Object.entries(productPriceData).length) {
        const updatedProductPrice = await this.productPriceRepo.update(
          { product_id: result.product_id },
          productPriceData,
        );
        result = { ...result, ...updatedProductPrice };
      }
    } else {
      const newProductPriceData = {
        ...new ProductPricesEntity(),
        ...this.productPriceRepo.setData(data),
        product_id: result.product_id,
      };
      const newProductPrice = await this.productPriceRepo.create(
        newProductPriceData,
      );
      result = { ...result, ...newProductPrice };
    }

    // Update product sale
    const productSale = await this.productSaleRepo.findOne({
      product_id: result.product_id,
    });
    if (productSale) {
      const productSaleData = this.productSaleRepo.setData(data);

      if (Object.entries(productSaleData).length) {
        const updatedProductSale = await this.productSaleRepo.update(
          { product_id: result.product_id },
          productSaleData,
        );
        result = { ...result, ...updatedProductSale };
      }
    } else {
      const newProductSaleData = {
        ...new ProductSalesEntity(),
        ...this.productSaleRepo.setData(data),
        product_id: result.product_id,
      };
      const newProductSale = await this.productSaleRepo.create(
        newProductSaleData,
      );
      result = { ...result, ...newProductSale };
    }

    // Update product category
    if (data?.category_id?.length) {
      //delete all old product categories
      await this.productCategoryRepo.delete({ product_id: result.product_id });
      for (let categoryId of data.category_id) {
        const newProductCategoryData = {
          ...new ProductsCategoriesEntity(),
          category_id: categoryId,
          product_id: result.product_id,
        };
        await this.productCategoryRepo.create(newProductCategoryData);
      }
    }

    if (data?.product_features?.length) {
      // Remove all old product features
      const oldFeatrures = await this.productFeatureValueRepo.find({
        where: { product_id: result.product_id },
      });
      if (oldFeatrures.length) {
        for (let oldFeatureItem of oldFeatrures) {
          await this.productFeatureValueRepo.delete({
            feature_value_id: oldFeatureItem.feature_value_id,
          });
        }
      }

      for (let { feature_id, variant_id } of data.product_features) {
        const productFeature = await this.productFeaturesRepo.findOne({
          feature_id,
        });

        const productFeatureVariant =
          await this.productFeatureVariantRepo.findOne({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: {
                [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
                  fieldJoin: 'variant_id',
                  rootJoin: 'variant_id',
                },
              },
            },
            where: {
              [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`]: variant_id,
            },
          });

        const productFeatureValueData = {
          feature_id: productFeature ? productFeature.feature_id : null,
          variant_id: productFeatureVariant
            ? productFeatureVariant?.variant_id
            : null,
          feature_code: productFeature ? productFeature.feature_code : null,
          variant_code: productFeatureVariant
            ? productFeatureVariant.variant_code
            : null,
          product_id: result.product_id,
          value: isNaN(+productFeatureVariant?.variant * 1)
            ? productFeatureVariant?.variant
            : '',
          value_int: !isNaN(+productFeatureVariant?.variant * 1)
            ? +productFeatureVariant?.variant
            : 0,
        };

        const newFeatureValue = await this.productFeatureValueRepo.create(
          productFeatureValueData,
        );

        result['features'] = result['features']
          ? [...result['features'], newFeatureValue]
          : [newFeatureValue];
      }
    }

    return result;
  }

  async requestIntegrateParentProduct() {
    console.log('request');
    const childrenProductsList = await this.productRepo.find({
      where: {
        parent_product_appcore_id: [Not(IsNull()), Equal('')],
        parent_product_id: 0,
      },
    });

    if (childrenProductsList) {
      for (let childProduct of childrenProductsList) {
        const parentProduct = await this.productRepo.findOne({
          product_appcore_id: childProduct['parent_product_appcore_id'],
        });
        if (parentProduct) {
          await this.productRepo.update(
            { product_id: childProduct.product_id },
            { parent_product_id: parentProduct.product_id },
          );
        }
      }
    }
  }

  async itgCreate(data): Promise<any> {
    console.log('Create Product Itg');

    const convertedData = itgConvertProductsFromAppcore(data);

    if (convertedData['product_appcore_id']) {
      let product = await this.productRepo.findOne({
        product_appcore_id: convertedData['product_appcore_id'],
      });

      if (product) {
        return this.itgUpdate(product['product_id'], convertedData, true);
      }
    }

    // set product
    const productData = {
      ...new ProductsEntity(),
      ...this.productRepo.setData(convertedData),
    };

    let result = await this.productRepo.create(productData);

    // set product description
    const productDescData = {
      ...new ProductDescriptionsEntity(),
      ...this.productDescriptionsRepo.setData(convertedData),
      product_id: result['product_id'],
    };

    await this.productDescriptionsRepo.createSync(productDescData);

    //price
    const productPriceData = {
      ...new ProductPricesEntity(),
      ...this.productPriceRepo.setData(convertedData),
      product_id: result.product_id,
    };

    await this.productPriceRepo.createSync(productPriceData);

    //sale
    const productSaleData = {
      ...new ProductSalesEntity(),
      ...this.productSaleRepo.setData(convertedData),
      product_id: result.product_id,
    };

    await this.productSaleRepo.createSync(productSaleData);

    // category

    if (convertedData['category_appcore_id']) {
      let category = await this.categoryRepo.findOne({
        category_appcore_id: convertedData['category_appcore_id'],
      });
      if (category) {
        convertedData['category_id'] = category['category_id'];
      }
    }
    const productCategoryData = {
      ...new ProductsCategoriesEntity(),
      ...this.productCategoryRepo.setData(convertedData),
      product_id: result.product_id,
    };

    await this.productCategoryRepo.createSync(productCategoryData);

    if (
      convertedData['product_features'] &&
      convertedData['product_features'].length
    ) {
      for (let {
        feature_code,
        variant_code,
      } of convertedData.product_features) {
        const productFeature = await this.productFeaturesRepo.findOne({
          feature_code,
        });

        const productFeatureVariant =
          await this.productFeatureVariantRepo.findOne({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: {
                [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
                  fieldJoin: 'variant_id',
                  rootJoin: 'variant_id',
                },
              },
            },
            where: {
              [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_code`]: variant_code,
            },
          });

        const productFeatureValueData = {
          feature_id: productFeature ? productFeature.feature_id : null,
          variant_id: productFeatureVariant
            ? productFeatureVariant?.variant_id
            : null,
          feature_code: productFeature ? feature_code : null,
          variant_code: productFeatureVariant ? variant_code : null,
          product_id: result.product_id,
          value: isNaN(+productFeatureVariant?.variant * 1)
            ? productFeatureVariant?.variant
            : '',
          value_int: !isNaN(+productFeatureVariant?.variant * 1)
            ? +productFeatureVariant?.variant
            : 0,
        };

        await this.productFeatureValueRepo.createSync(productFeatureValueData);
      }
    }

    if (convertedData['combo_items'] && convertedData['combo_items'].length) {
      // Nếu là SP combo, tạo group
      let productGroup = await this.productVariationGroupRepo.create({
        product_root_id: result.product_id,
        group_type: 2,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });

      await this.productVariationGroupProductsRepo.create({
        product_id: result.product_id,
        parent_product_id: null,
        group_id: productGroup.group_id,
        quantity: 0,
        note: '',
      });

      result['combo_items'] = [];
      for (let [i, productItem] of convertedData['combo_items'].entries()) {
        let productComboItem = await this.productRepo.findOne({
          product_appcore_id: productItem.product_appcore_id,
        });
        if (!productComboItem) {
          const productComboItemData = {
            ...new ProductsEntity(),
            ...this.productRepo.setData(productItem),
          };

          productComboItem = await this.productRepo.create(
            productComboItemData,
          );

          // description
          const productComboItemDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescriptionsRepo.setData(productItem),
            product_core_name: productItem.product || '',
            product_id: productComboItem.product_id,
          };
          await this.productDescriptionsRepo.createSync(
            productComboItemDescData,
          );

          // price
          const productComboItemPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(productItem),
            product_id: productComboItem.product_id,
          };
          await this.productPriceRepo.createSync(productComboItemPriceData);

          // sales
          const productComboSaleItemData = {
            ...new ProductSalesEntity(),
            ...this.productSaleRepo.setData(productItem),
            product_id: productComboItem.product_id,
          };
          await this.productSaleRepo.createSync(productComboSaleItemData);

          // category
          const productCategoryItemData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(productItem),
            category_id: productItem['category_id']
              ? productItem['category_id']
              : 0,
            product_id: productComboItem.product_id,
          };
          await this.productCategoryRepo.createSync(productCategoryItemData);
        }

        const newGroupProductItem =
          await this.productVariationGroupProductsRepo.create({
            product_id: productComboItem['product_id'],
            parent_product_id: result['product_id'],
            group_id: productGroup.group_id,
            quantity: productComboItem.quantity || 1,
          });
        result['combo_items'].push(newGroupProductItem);
      }
    }

    await this.requestIntegrateParentProduct();
  }

  async callSync(): Promise<void> {
    // //========== create =============
    // await this.clearAll();
    // for (let productItem of mockProductsData) {
    //   await this.itgCreate(productItem);
    // }
    await this.syncProductsIntoGroup();
    // await this.itgGenerateSlug();
    //=========== update ===========
    // for (let productItem of mockProductsData) {
    //   let productItemInfo = await this.productRepo.findOne({
    //     product_appcore_id: productItem.product_id,
    //   });
    //   if (productItemInfo) {
    //     await this.itgUpdate(productItemInfo.product_id, productItem);
    //   }
    // }
  }

  async getFromAppcore() {
    const totalPage = 500;
    await this.clearAll();
    for (let currentPage = 1; currentPage <= totalPage; currentPage++) {
      try {
        const response = await axios.get(
          GET_PRODUCTS_LIST_APPCORE_BY_PAGE_API(currentPage),
        );
        const productsAppcoreList = response.data.data.products;

        for (let productAppcoreItem of productsAppcoreList) {
          await this.itgCreate(
            convertGetProductsFromAppcore(productAppcoreItem),
          );
        }
      } catch (error) {
        throw new HttpException(
          error.response.data.message,
          error.response.status,
        );
      }
    }
    await this.syncProductsIntoGroup();
    await this.itgGenerateSlug();
  }

  async itgUpdate(identifier, data, isConverted = false): Promise<any> {
    console.log('Update Product Itg');
    let convertedData = { ...data };
    if (!isConverted) {
      convertedData = itgConvertProductsFromAppcore(data);
    }

    const product = await this.productRepo.findOne({
      select: '*',
      join: productJoiner,
      where: [
        { product_code: identifier },
        { product_id: identifier },
        { product_appcore_id: identifier },
      ],
    });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let result = { ...product };

    const productData = this.productRepo.setData(convertedData);

    if (Object.entries(productData).length) {
      await this.productRepo.update(
        { product_id: result.product_id },
        productData,
      );
    }

    // set product description
    let productDesc = await this.productDescriptionsRepo.findOne({
      product_id: result.product_id,
    });
    if (productDesc) {
      const productDescData =
        this.productDescriptionsRepo.setData(convertedData);

      if (Object.entries(productDescData).length) {
        await this.productDescriptionsRepo.update(
          { product_id: result.product_id },
          productDescData,
        );
      }
    } else {
      const newProductDescData = {
        ...new ProductDescriptionsEntity(),
        ...this.productDescriptionsRepo.setData(convertedData),
        product_id: result.product_id,
      };
      await this.productDescriptionsRepo.createSync(newProductDescData);
    }

    //price
    let productPrice = await this.productPriceRepo.findOne({
      product_id: result.product_id,
    });
    if (productPrice) {
      const productPriceData = this.productPriceRepo.setData(convertedData);

      if (Object.entries(productPriceData).length) {
        await this.productPriceRepo.update(
          { product_id: result.product_id },
          productPriceData,
        );
      }
    } else {
      const newProductPriceData = {
        ...new ProductPricesEntity(),
        ...this.productPriceRepo.setData(convertedData),
        product_id: result.product_id,
      };
      await this.productPriceRepo.createSync(newProductPriceData);
    }

    //sale
    const productSale = await this.productSaleRepo.findOne({
      product_id: result.product_id,
    });

    if (productSale) {
      const productSale = this.productSaleRepo.setData(convertedData);

      if (Object.entries(productSale).length) {
        await this.productSaleRepo.update(
          { product_id: result.product_id },
          productSale,
        );
      }
    } else {
      const newProductSaleData = {
        ...new ProductSalesEntity(),
        ...this.productSaleRepo.setData(convertedData),
        product_id: result.product_id,
      };
      await this.productSaleRepo.create(newProductSaleData);
    }

    await this.productCategoryRepo.delete({ product_id: result['product_id'] });

    let productCategory = await this.productCategoryRepo.findOne({
      product_id: result['product_id'],
      category_appcore_id: convertedData['category_appcore_id'],
    });

    if (productCategory) {
      const productCategoryData =
        this.productCategoryRepo.setData(convertedData);
      if (Object.entries(productCategoryData).length) {
        await this.productCategoryRepo.update(
          {
            category_appcore_id: convertedData['category_appcore_id'],
            product_id: result['product_id'],
          },
          productCategoryData,
        );
      }
    } else {
      const newProductCategoryData = {
        ...new ProductsCategoriesEntity(),
        ...this.productCategoryRepo.setData(convertedData),
        product_id: result.product_id,
        category_id: convertedData.category_id,
      };
      await this.productCategoryRepo.createSync(newProductCategoryData);
    }

    if (
      convertedData['product_features'] &&
      convertedData['product_features'].length
    ) {
      await this.productFeatureValueRepo.delete({
        product_id: result.product_id,
      });

      for (let { feature_code, variant_code } of data.product_features) {
        const productFeature = await this.productFeaturesRepo.findOne({
          feature_code,
        });

        const productFeatureVariant =
          await this.productFeatureVariantRepo.findOne({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: {
                [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
                  fieldJoin: 'variant_id',
                  rootJoin: 'variant_id',
                },
              },
            },
            where: {
              [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_code`]: variant_code,
            },
          });

        const productFeatureValueData = {
          feature_id: productFeature ? productFeature.feature_id : null,
          variant_id: productFeatureVariant
            ? productFeatureVariant?.variant_id
            : null,
          feature_code: productFeature ? feature_code : null,
          variant_code: productFeatureVariant ? variant_code : null,
          product_id: result.product_id,
          value: isNaN(+productFeatureVariant?.variant * 1)
            ? productFeatureVariant?.variant
            : '',
          value_int: !isNaN(+productFeatureVariant?.variant * 1)
            ? +productFeatureVariant?.variant
            : 0,
        };

        await this.productFeatureValueRepo.create(productFeatureValueData);
      }
    }

    if (convertedData['combo_items'] && convertedData['combo_items'].length) {
      // Delete old group
      const oldGroup = await this.productVariationGroupRepo.findOne({
        product_root_id: result.product_id,
      });
      if (oldGroup) {
        await this.productVariationGroupRepo.delete({
          group_id: oldGroup.group_id,
        });
        await this.productVariationGroupProductsRepo.delete({
          group_id: oldGroup.group_id,
        });
        await this.productVariationGroupFeatureRepo.delete({
          group_id: oldGroup.group_id,
        });
      }

      // Nếu là SP combo, tạo group
      let productGroup = await this.productVariationGroupRepo.create({
        product_root_id: result['product_id'],
        group_type: 2,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });

      await this.productVariationGroupProductsRepo.create({
        product_id: result.product_id,
        parent_product_id: null,
        group_id: productGroup.group_id,
        quantity: 0,
      });

      result['combo_items'] = [];

      for (let [i, productItem] of convertedData.combo_items.entries()) {
        let productComboItem = await this.productRepo.findOne({
          product_appcore_id: productItem.product_appcore_id,
        });
        if (!productComboItem) {
          const productComboItemData = {
            ...new ProductsEntity(),
            ...productItem,
            product_type: 3,
          };

          productComboItem = await this.productRepo.create(
            productComboItemData,
          );

          const productComboItemDesc = {
            ...new ProductDescriptionsEntity(),
            product: `${result.product ?? ''} combo ${i}`,
            product_id: productComboItem.product_id,
          };
          await this.productDescriptionsRepo.create(productComboItemDesc);
        }

        const newGroupProductItem =
          await this.productVariationGroupProductsRepo.create({
            product_id: productComboItem.product_id,
            parent_product_id: result.product_id,
            group_id: productGroup.group_id,
            quantity: productComboItem.quantity || 1,
          });
        result['combo_items'].push(newGroupProductItem);
      }
    }

    await this.requestIntegrateParentProduct();
  }

  async clearAll() {
    await this.productRepo.writeExec(`TRUNCATE TABLE ${Table.PRODUCTS}`);
    await this.productCategoryRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCTS_CATEGORIES}`,
    );
    await this.productDescriptionsRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_DESCRIPTION}`,
    );
    await this.productSaleRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_SALES}`,
    );
    await this.productPriceRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_PRICES}`,
    );
    await this.productFeatureValueRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_FEATURE_VALUES}`,
    );
    await this.productVariationGroupRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_VARIATION_GROUPS}`,
    );
    await this.productVariationGroupProductsRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}`,
    );
    await this.productVariationGroupFeatureRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_VARIATION_GROUP_FEATURES}`,
    );
    await this.productVariationGroupFeatureRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_VARIATION_GROUP_INDEX}`,
    );
  }

  async uploadImages(images, sku) {
    const product = await this.productRepo.findOne({
      where: [{ product_code: sku }, { product_id: sku }],
    });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let data = new FormData();
    for (let image of images) {
      data.append('files', fs.createReadStream(image.path));
    }
    var config: any = {
      method: 'post',
      url: UPLOAD_IMAGE_API,
      headers: {
        'Content-Type': 'multipart/form-data',
        ...data.getHeaders(),
      },
      data: data,
    };

    try {
      const response = await axios(config);
      const results = response?.data?.data;

      if (Array.isArray(results) && results?.length) {
        let imageLink = await this.imageLinkRepo.findOne({
          select: ['position'],
          orderBy: [{ field: 'position', sortBy: SortBy.DESC }],
          where: {
            object_id: product.product_id,
            object_type: ImageObjectType.PRODUCT,
          },
        });

        let currentPosition = imageLink ? imageLink.position + 1 : 0;

        for (let [i, dataItem] of results.entries()) {
          let newImage = await this.imageRepo.create({ image_path: dataItem });
          await this.imageLinkRepo.create({
            object_id: product.product_id,
            object_type: ImageObjectType.PRODUCT,
            image_id: newImage.image_id,
            position: currentPosition + i,
          });
        }
      }

      // delete files
      for (let image of images) {
        await fsExtra.unlink(image.path);
      }
      return results;
    } catch (error) {
      console.log(error);
      // delete files
      for (let image of images) {
        await fsExtra.unlink(image.path);
      }

      throw new HttpException(
        `Có lỗi xảy ra : ${
          error?.response?.data?.message ||
          error?.response?.data ||
          error.message
        }`,
        error.response.status,
      );
    }
  }

  async uploadMetaImage(file, product_id) {
    const product = await this.productRepo.findById(product_id);
    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }
    const productDesc = await this.productDescriptionsRepo.findOne({
      product_id,
    });
    if (!productDesc) {
      const newProductDescData = {
        ...new ProductDescriptionsEntity(),
        product_id,
      };
      await this.productDescriptionsRepo.createSync(newProductDescData);
    }

    try {
      let data = new FormData();
      data.append('files', fs.createReadStream(file.path));
      let config: any = {
        method: 'post',
        url: UPLOAD_IMAGE_API,
        headers: {
          'Content-Type': 'multipart/form-data',
          ...data.getHeaders(),
        },
        data,
      };
      const response = await axios(config);
      const imageUrl = response.data.data;
      if (imageUrl && imageUrl.length) {
        await this.productDescriptionsRepo.update(
          { product_id },
          { meta_image: imageUrl[0] },
        );
      }
      await fsExtra.unlink(file.path);
    } catch (error) {
      console.log(error);
      await fsExtra.unlink(file.path);
      throw new HttpException(
        `Có lỗi xảy ra : ${
          error?.response?.data?.message ||
          error?.response?.data ||
          error.message
        }`,
        error.response.status,
      );
    }
  }

  async deleteMetaImage(product_id) {
    await this.productDescriptionsRepo.update(
      { product_id },
      { meta_image: '' },
    );
  }

  async deleteProductImage(
    identifier: string | number,
    data: DeleteProductImageDto,
  ): Promise<string> {
    console.log(identifier);
    const product = await this.productRepo.findOne({
      select: '*',
      where: [{ product_code: identifier }, { product_id: identifier }],
    });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let response: any = [];
    for (let imageId of data.images_id) {
      let result = true;
      result = await this.imageLinkRepo.delete({
        object_id: product.product_id,
        object_type: ImageObjectType.PRODUCT,
        image_id: imageId,
      });

      result = (await this.imageRepo.delete({ image_id: imageId })) && result;

      if (!result) {
        response.push(imageId);
      }
    }

    if (response.length) {
      return `[Warning]: Xoá không thành công những ảnh có id : ${response.join(
        ', ',
      )}`;
    }
    return 'Xoá ảnh thành công.';
  }

  async getProductDetails(product, showListCategories = false) {
    let status = product['status'];

    const productImages = await this.imageLinkRepo.find({
      select: ['image_id'],
      where: {
        object_id: product.product_id,
        object_type: ImageObjectType.PRODUCT,
      },
    });

    if (productImages.length) {
      for (let productImage of productImages) {
        const image = await this.imageRepo.findOne({
          image_id: productImage.image_id,
        });
        product['images'] = product['images']
          ? [...product['images'], image]
          : [image];
      }
    }

    let features = await this.productFeatureValueRepo.find({
      select: productFeatureValuesSelector,
      join: {
        [JoinTable.rightJoin]: productFeaturesJoiner,
      },
      where: {
        [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: product.product_id,
      },
    });

    // Chèn features vào product
    if (features.length) {
      product['features'] = features;
    }

    // Tìm nhóm chứa SP
    // SP combo
    if (product.product_type == 3) {
      const comboGroup = await this.productVariationGroupRepo.findOne({
        product_root_id: product.product_id,
      });

      if (comboGroup) {
        let comboProductsList =
          await this.productVariationGroupProductsRepo.find({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: productGroupProductsJoiner,
            },
            where: {
              [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`]:
                comboGroup.group_id,
            },
          });
        product['comboItems'] = comboProductsList;
      }
    } else if (product.product_type == 1 || product.product_type == 2) {
      // Đối với SP là phụ kiện và IMEI
      let group = await this.productVariationGroupProductsRepo.findOne({
        select: ['*'],
        where: {
          product_id: product.product_id,
          group_product_type: ProductGroupTypeEnum.Normal,
        },
      });

      if (group) {
        let productsInGroup = await this.productVariationGroupProductsRepo.find(
          {
            select: ['*'],
            where: { group_id: group.group_id },
          },
        );

        if (productsInGroup.length) {
          for (let productItem of productsInGroup) {
            let productInfoDetail = await this.productRepo.findOne({
              select: ['*'],
              join: {
                [JoinTable.innerJoin]: productInfoJoiner,
              },
              where: {
                [`${Table.PRODUCTS}.product_id`]: productItem.product_id,
              },
            });

            // Truyền thêm table product group vào product Detail
            productInfoDetail = { ...productItem, ...productInfoDetail };
            // Tìm SP cha
            if (product.parent_product_id) {
              let parentProduct = await this.productRepo.findOne({
                select: '*',
                join: {
                  [JoinTable.innerJoin]: {
                    [Table.PRODUCT_DESCRIPTION]: {
                      fieldJoin: 'product_id',
                      rootJoin: 'product_id',
                    },
                  },
                },
                where: {
                  [`${Table.PRODUCTS}.product_id`]: product.parent_product_id,
                },
              });
              product['parentProduct'] = parentProduct;
            }
            // Lấy các SP con
            if (product.product_id == productInfoDetail.parent_product_id) {
              // Lấy thuộc tính SP
              let features = await this.productFeatureValueRepo.find({
                select: productFeatureValuesSelector,
                join: {
                  [JoinTable.rightJoin]: productFeaturesJoiner,
                },
                where: {
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]:
                    productInfoDetail.product_id,
                },
              });
              productInfoDetail['features'] = features;

              // Lấy hình ảnh đính kèm
              const productImages = await this.imageLinkRepo.find({
                select: ['image_id'],
                where: {
                  object_id: productInfoDetail.product_id,
                  object_type: ImageObjectType.PRODUCT,
                },
              });
              if (productImages.length) {
                for (let productImageItem of productImages) {
                  const image = await this.imageRepo.findById(
                    productImageItem.image_id,
                  );
                  productInfoDetail['images'] = productInfoDetail['images']
                    ? [...productInfoDetail['images'], image]
                    : [image];
                }
              }

              // Lấy các kho hàng hiện tại
              const productsStores = await this.getProductsStores(
                productInfoDetail.product_id,
              );

              productInfoDetail['inventories'] = productsStores.length
                ? productsStores
                : null;

              product['children_products'] = product['children_products']
                ? [...product['children_products'], productInfoDetail]
                : [productInfoDetail];
            }
            // Lấy các SP liên quan
            if (
              !productInfoDetail.parent_product_id &&
              productInfoDetail.product_type != 1
            ) {
              product['relevant_products'] = product['relevant_products']
                ? [...product['relevant_products'], productInfoDetail]
                : [productInfoDetail];
            }
            // Lấy SP hoặc Phụ kiện đi kèm
            if (
              productInfoDetail.product_id !== product.product_id &&
              !productInfoDetail.parent_product_id &&
              productInfoDetail.product_type == 1
            ) {
              productInfoDetail['image'] = null;
              const productImage = await this.imageLinkRepo.findOne({
                object_id: product.product_id,
                object_type: ImageObjectType.PRODUCT,
                position: 0,
              });
              if (productImage) {
                const image = await this.imageRepo.findOne({
                  image_id: productImage.image_id,
                });
                productInfoDetail['image'] = image;
              }
              product['accessory_products'] = product['accessory_products']
                ? [...product['accessory_products'], productInfoDetail]
                : [productInfoDetail];
            }
          }
        }
      }
    }

    let currentCategory;

    if (showListCategories) {
      currentCategory = await this.categoryRepo.find({
        select: [
          `${Table.CATEGORIES}.category_id`,
          'level',
          'slug',
          'category',
          'parent_id',
        ],
        join: {
          [JoinTable.leftJoin]: {
            [Table.CATEGORY_DESCRIPTIONS]: {
              fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
            [Table.PRODUCTS_CATEGORIES]: {
              fieldJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
          },
        },
        where: {
          [`${Table.PRODUCTS_CATEGORIES}.product_id`]: product.product_id,
        },
      });
    } else {
      currentCategory = await this.categoryRepo.findOne({
        select: [
          `${Table.CATEGORIES}.category_id`,
          'level',
          'slug',
          'category',
          'parent_id',
        ],
        join: {
          [JoinTable.leftJoin]: {
            [Table.CATEGORY_DESCRIPTIONS]: {
              fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
              rootJoin: `${Table.CATEGORIES}.category_id`,
            },
          },
        },
        where: { [`${Table.CATEGORIES}.category_id`]: product.category_id },
      });
    }

    //determine type of product

    product['productType'] = this.determineProductType(product);

    const categoriesList = await this.parentCategories(currentCategory);
    const parentCategories = categoriesList.slice(1);

    product['status'] = status;

    const productsStores = await this.getProductsStores(product.product_id);
    product['stores'] = productsStores || [];

    //find product Stickers
    product['stickers'] = await this.getProductStickers(product);

    return {
      currentCategory: showListCategories ? currentCategory : categoriesList[0],
      parentCategories,
      product,
    };
  }

  async getProductStickers(product) {
    //find product Stickers
    const productStickers = await this.productStickerRepo.find({
      where: {
        product_id: product.product_id,
        end_at: MoreThan(moment(new Date()).format('YYYY-MM-DD HH:mm:ss')),
      },
    });

    let stickers = [];

    if (productStickers.length) {
      for (let productStickerItem of productStickers) {
        const sticker = await this.stickerRepo.findOne({
          sticker_id: productStickerItem.sticker_id,
        });
        if (sticker) {
          stickers = stickers
            ? [...stickers, { ...productStickerItem, ...sticker }]
            : [{ ...productStickerItem, ...sticker }];
        }
      }
    }
    return stickers;
  }

  determineProductType(product) {
    console.log(product.product_type, product.parent_product_id);
    if (
      product.parent_product_id == 0 &&
      (product.product_type == 1 || product.product_type == 2)
    ) {
      return 1; //Sản phẩm cha
    } else if (
      product.parent_product_id != 0 &&
      (product.product_type == 1 || product.product_type == 2)
    ) {
      return 2; // Sản phẩm con
    } else if (product.product_type == 3) {
      return 3; //SP combo
    } else {
      return 4; // SP độc lập
    }
  }

  async moveParentChildenProductsIntoAnotherGroup(
    productId,
    groupId,
    productGroupName = '',
  ) {
    // Kiểm tra SP hiện tại có phải SP loại 1,2 và là SP cha hay ko
    const product = await this.productRepo.findById(productId);
    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', 404);
    }

    if (product.product_type == 3) {
      throw new HttpException(
        'Sản phẩm combo không thể dời đến nhóm SP khác',
        403,
      );
    }

    // Tìm nhóm SP đích
    const group = await this.productVariationGroupRepo.findOne({
      group_id: groupId,
    });

    if (!group) {
      throw new HttpException('Không tìm thấy nhóm SP', 404);
    }

    if (group.group_type == 2) {
      throw new HttpException('Không thể thêm vào nhóm SP combo', 403);
    }

    if (group.product_root_id == product['product_id']) {
      throw new HttpException('Không thành công', 403);
    }
  }

  async itgGenerateSlug() {
    const productsList = await this.productRepo.find({
      select: '*',
      join: {
        [JoinTable.innerJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `product_id`,
            rootJoin: `product_id`,
          },
        },
      },
    });
    if (productsList.length) {
      for (let product of productsList) {
        let slug = convertToSlug(removeVietnameseTones(product['product']));
        const checkSlugExist = await this.productRepo.findOne({
          slug,
        });

        if (checkSlugExist) {
          slug = `${slug}-${Date.now().toString(36)}`;
        }
        await this.productRepo.update(
          { product_id: product.product_id },
          { slug },
        );
      }
    }
  }

  async itgGetProductsStores() {
    await this.clearStore();
    const productsList = await this.productRepo.find();

    if (productsList.length) {
      for (let product of productsList) {
        if (!product.product_appcore_id) {
          continue;
        }
        let response;
        if (product.product_type == 3) {
          response = await axios({
            url: GET_PRODUCTS_COMBO_STORES_API(product.product_appcore_id),
          });
        } else {
          response = await axios({
            url: GET_PRODUCTS_STORES_API(product.product_appcore_id),
          });
        }

        const { data } = response.data;

        if (data && Object.entries(data).length) {
          for (let dataItem of Object.values(data)) {
            await this.productStoreRepo.create({
              store_location_id: dataItem['storeId'],
              product_id: product.product_id,
              amount: dataItem['inStockQuantity'],
              created_at: convertToMySQLDateTime(),
              updated_at: convertToMySQLDateTime(),
            });
            await this.productStoreHistoryRepo.create({
              store_location_id: dataItem['storeId'],
              product_id: product.product_id,
              amount: dataItem['inStockQuantity'],
              created_at: convertToMySQLDateTime(),
              updated_at: convertToMySQLDateTime(),
            });
          }
        }
      }
    }
  }

  async itgCreateProductStores(data: CreateProductStoreDto) {
    const { product_id, store_location_id, amount } = data;
    let product = await this.productRepo.findOne({
      product_appcore_id: product_id,
    });
    if (!product) {
      const newProductData = {
        ...new ProductsEntity(),
        product_appcore_id: product_id,
      };
      product = await this.productRepo.create(newProductData);
    }

    const productStore = await this.productStoreRepo.findOne({
      product_id: product.product_id,
      store_location_id,
    });

    if (productStore) {
      // Update product store
      await this.productStoreRepo.update(
        { product_id, store_location_id },
        {
          amount,
          updated_at: convertToMySQLDateTime(),
        },
      );
    } else {
      // Create new product store
      await this.productStoreRepo.create({
        product_id,
        store_location_id,
        amount,
        created_at: convertToMySQLDateTime(),
        updated_at: convertToMySQLDateTime(),
      });
    }
    // Create new product store history
    await this.productStoreHistoryRepo.create({
      product_id,
      store_location_id,
      amount,
      created_at: convertToMySQLDateTime(),
      updated_at: convertToMySQLDateTime(),
    });
  }

  async clearStore() {
    await this.productStoreRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_STORES}`,
    );
    await this.productStoreHistoryRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_STORE_HISTORIES}`,
    );
  }

  async searchList(params) {
    let { page, limit, q } = params;

    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;
    const productLists = await this.productRepo.find({
      select: `*, ${Table.PRODUCTS}.slug as productSlug, ${Table.CATEGORIES}.slug as categorySlug`,
      join: productSearchJoiner,
      where: productSearch(q),
      skip,
      limit,
    });

    return productLists;
  }

  async getProductsAmountFromStores() {
    const productsList = await this.productRepo.find();
    for (let productItem of productsList) {
      let response;

      if (productItem.product_type === 3) {
        response = await axios({
          url: GET_PRODUCTS_COMBO_STORES_API(productItem.product_appcore_id),
        });
      } else {
        response = await axios({
          url: GET_PRODUCTS_STORES_API(productItem.product_appcore_id),
        });
      }
      const data = response.data.data;
      if (Object.entries(data)) {
        let totalProduct = 0;
        for (let [key, val] of Object.entries(data)) {
          totalProduct += val['inStockQuantity'];
        }
        await this.productRepo.update(
          { product_id: productItem.product_id },
          {
            amount: productItem.product_type !== 3 ? totalProduct : 0,
            combo_amount: productItem.product_type === 3 ? totalProduct : 0,
          },
        );
      }
    }
  }

  async countProductByCategory() {
    const categories = await this.categoryRepo.find();

    if (categories.length) {
      for (let categoryItem of categories) {
        await this.categoryRepo.update(
          { category_id: categoryItem.category_id },
          { product_count: 0 },
        );
        let childrensCategories = await this.childrenCategories(
          categoryItem.category_id,
        );
        let categoriesFamily = [
          categoryItem.category_id,
          ...childrensCategories.map(({ category_id }) => category_id),
        ];
        let totalProducts = 0;
        console.log(categoriesFamily);
        for (let categoryId of categoriesFamily) {
          const productsList = await this.productCategoryRepo.find({
            select: '*',
            join: {
              [JoinTable.innerJoin]: {
                [Table.PRODUCTS]: {
                  fieldJoin: 'product_id',
                  rootJoin: 'product_id',
                },
              },
            },
            where: { category_id: categoryId },
          });
          totalProducts += productsList.length;
        }
        await this.categoryRepo.update(
          { category_id: categoryItem.category_id },
          { product_count: totalProducts },
        );
      }
    }
  }

  async utilFunctions() {
    await this.productCategoryRepo.update(
      { category_id: 68961 },
      { category_id: 480184 },
    );
    await this.productCategoryRepo.update(
      { category_id: 68979 },
      { category_id: 480186 },
    );
  }

  async grouping(group_ids: number[]) {
    let groups = group_ids.join(',');
    const checkGroups = await this.productGroupIndexRepo.findOne({ group_ids });
    if (checkGroups) {
      throw new HttpException('Nhóm SP đã tồn tại', 409);
    }
    const newGroupIndex = await this.productGroupIndexRepo.create({
      group_ids: groups,
      created_at: convertToMySQLDateTime(),
      updated_at: convertToMySQLDateTime(),
    });
    for (let groupId of group_ids) {
      await this.productVariationGroupRepo.update(
        { group_id: groupId },
        { index_id: newGroupIndex.index_id },
      );
    }
  }

  async upateGrouping(index_id: number, group_ids: number[]) {
    if (!group_ids.length) {
      return;
    }
    const currentGroupIndex = await this.productGroupIndexRepo.findById(
      index_id,
    );
    if (currentGroupIndex) {
      throw new HttpException('Không tìm thấy nhóm SP', 404);
    }
    await this.productGroupIndexRepo.update(
      {
        index_id,
      },
      {
        group_ids: group_ids.join(','),
        updated_at: convertToMySQLDateTime(),
      },
    );

    await this.productVariationGroupRepo.update(
      { index_id },
      { index_id: null },
    );
    for (let groupId of group_ids) {
      await this.productVariationGroupRepo.update(
        { group_id: groupId },
        { index_id: index_id },
      );
    }
  }

  async getListGroupingIndex(params) {
    let { page, limit } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    const groupsList = await this.productGroupIndexRepo.find({
      select: '*',
      skip,
      limit,
    });

    let count = await this.productGroupIndexRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCT_VARIATION_GROUP_INDEX}.index_id)) as total`,
    });

    return {
      total: count[0].total,
      groups: groupsList,
    };
  }

  async testGetBySlug(slug) {
    let product = await this.productRepo.findOne({ slug });
    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let result: any = {};

    if (product.product_type >= 4) {
      result = await this.productRepo.findOne({
        select: `*,${Table.PRODUCTS}.*, ${Table.CATEGORIES}.slug as categorySlug`,
        join: { [JoinTable.leftJoin]: productFullJoiner },
        where: { [`${Table.PRODUCTS}.product_id`]: product.product_id },
      });

      // get Image
      result['image'] = await this.getProductImage(result.product_id);
      result['productFeatures'] = await this.getProductFeatures(
        result.product_id,
      );
      result['productType'] = 4;
      result['prodyctTypeName'] = 'Sản phẩm độc lập';
    }

    if (product.product_type == 3) {
      let group = await this.productVariationGroupRepo.findOne({
        product_root_id: product.product_id,
      });
      if (!group) {
        let groupProducts =
          await this.productVariationGroupProductsRepo.findOne({
            product_id: product.product_id,
          });
        group = await this.productVariationGroupRepo.findOne({
          group_id: groupProducts.group_id,
        });
        if (!group) {
          throw new HttpException('Không tìm thấy SP combo', 404);
        }
      }
      let productsComboList = await this.productVariationGroupProductsRepo.find(
        {
          where: { group_id: group.group_id },
        },
      );

      if (productsComboList.length) {
        for (let productComboItem of productsComboList) {
          let productCombo = await this.productRepo.findOne({
            select: `*,${Table.PRODUCTS}.*, ${Table.CATEGORIES}.slug as categorySlug`,
            join: { [JoinTable.leftJoin]: productFullJoiner },
            where: {
              [`${Table.PRODUCTS}.product_id`]: productComboItem.product_id,
            },
          });

          if (productComboItem.product_id == group.product_root_id) {
            result['configurableProduct'] = productCombo;
          } else {
            // get image
            productCombo['image'] = await this.getProductImage(
              productCombo.product_id,
            );

            result['comboItems'] = result['comboItems']
              ? [...result['comboItems'], productCombo]
              : [productCombo];
          }
        }
      }

      result['productType'] = 3;
      result['prodyctTypeName'] = 'Sản phẩm combo';
    }

    if (product.product_type == 1 || product.product_type == 2) {
      if (product.parent_product_id > 0) {
        let parentProduct = await this.productRepo.findOne({
          product_id: product.parent_product_id,
        });
        if (parentProduct) {
          product = parentProduct;
        }
      }

      product['stores'] = await this.getProductsStores(product.product_id);

      let group = await this.productVariationGroupRepo.findOne({
        product_root_id: product.product_id,
      });
      if (!group) {
        throw new HttpException('Không tìm thấy SP', 404);
      }

      let productsInGroup = await this.productVariationGroupProductsRepo.find({
        where: { group_id: group.group_id },
      });
      if (productsInGroup.length) {
        for (let productItem of productsInGroup) {
          let productInfo = await this.productRepo.findOne({
            select: `*,${Table.PRODUCTS}.*,  ${Table.CATEGORIES}.slug as categorySlug`,
            join: { [JoinTable.leftJoin]: productFullJoiner },
            where: {
              [`${Table.PRODUCTS}.product_id`]: productItem.product_id,
            },
          });

          // Get Image
          productInfo['image'] = await this.getProductImage(
            productInfo.product_id,
          );
          // Get Features
          productInfo['productFeatures'] = await this.getProductFeatures(
            productInfo.product_id,
          );

          productInfo['stores'] = await this.getProductsStores(
            productInfo.product_id,
          );

          // Get children and accessory products
          if (productInfo.product_id == group.product_root_id) {
            product = { ...productInfo };
          } else if (
            productInfo.product_id != group.product_root_id &&
            productItem.group_product_type == 1
          ) {
            product['childrenProducts'] = product['childrenProducts']
              ? [...product['childrenProducts'], productInfo]
              : [productInfo];
          } else if (
            productInfo.product_id != group.product_root_id &&
            productItem.group_product_type == 2
          ) {
            product['accessory_products'] = product['accessory_products']
              ? [...product['accessory_products'], productInfo]
              : [productInfo];
          }
        }
      }

      // Find relevant products
      if (group.index_id) {
        let relevantGroups = await this.productVariationGroupRepo.find({
          select: '*',
          where: {
            index_id: group.index_id,
          },
        });
        relevantGroups = [
          group,
          ...relevantGroups.filter(
            ({ group_id }) => group_id !== group.group_id,
          ),
        ];

        if (relevantGroups.length) {
          for (let relevantGroupItem of relevantGroups) {
            if (relevantGroupItem.product_root_id) {
              let productRoot = await this.productRepo.findOne({
                select: '*',
                join: { [JoinTable.innerJoin]: productFullJoiner },
                where: {
                  [`${Table.PRODUCTS}.product_id`]:
                    relevantGroupItem.product_root_id,
                },
              });
              if (productRoot) {
                productRoot['image'] = await this.getProductImage(
                  productRoot.product_id,
                );
              }
              product['relevantProducts'] = product['relevantProducts']
                ? [...product['relevantProducts'], productRoot]
                : [productRoot];
            }
          }
        }
      }

      result = { ...product };
    }

    return result;
  }

  async getProductImage(product_id) {
    let result = null;
    const imageLink = await this.imageLinkRepo.findOne({
      object_id: product_id,
      object_type: ImageObjectType.PRODUCT,
    });
    if (imageLink) {
      let image = await this.imageRepo.findOne({
        image_id: imageLink.image_id,
      });
      result = { ...imageLink, ...image };
    }

    return result;
  }

  async getProductFeatures(product_id) {
    const productFeatures = await this.productFeatureValueRepo.find({
      select: '*',
      join: { [JoinTable.leftJoin]: productFeaturesJoiner },
      where: { [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: product_id },
    });

    return productFeatures;
  }

  async getProductsStores(id: string) {
    const product = await this.productRepo.findOne({ product_id: id });
    if (!product) {
      throw new HttpException(`Không tìm thấy SP có id : ${id}`, 404);
    }

    let response;

    if (product.product_type === 3) {
      response = await axios({
        url: GET_PRODUCTS_COMBO_STORES_API(product.product_appcore_id),
      });
    } else {
      response = await axios({
        url: GET_PRODUCTS_STORES_API(product.product_appcore_id),
      });
    }

    const productsStocks = response?.data?.data;

    let result = [];

    if (
      productsStocks &&
      typeof productsStocks === 'object' &&
      Object.entries(productsStocks).length
    ) {
      for (let [key, val] of Object.entries(productsStocks)) {
        let resVal: any = val;
        result = [...result, { ...resVal, productId: id }];
      }
      return result;
    } else {
      const productsStores = await this.productStoreRepo.find({
        select: '*',
        orderBy: [{ field: 'amount', sortBy: SortBy.DESC }],
        where: { product_id: id, amount: MoreThan(0) },
      });

      if (productsStores.length) {
        for (let productStoreItem of productsStores) {
          const store = await this.storeRepo.findOne({
            select: '*',
            join: {
              [JoinTable.leftJoin]: {
                [Table.STORE_LOCATION_DESCRIPTIONS]: {
                  fieldJoin: 'store_location_id',
                  rootJoin: 'store_location_id',
                },
              },
            },
            where: {
              [`${Table.STORE_LOCATIONS}.store_location_id`]:
                productStoreItem.store_location_id,
            },
          });
          let storeObj = {
            productId: product.product_id,
            storeId: store['store_location_id'],
            storeName: store['store_name'],
            storeAddress: store['pickup_address'],
            storeLatitude: store['latitude'],
            storeLongitude: store['longitude'],
          };
          result = [...result, { ...productStoreItem, ...storeObj }];
        }
      }
    }

    return result;
  }

  async importProducts() {
    // this.clearAll();
    // const totalProducts = 17643;
    // const limit = 30;
    // let currentPage = 50;
    // let destPage = currentPage + 40;
    // let headers = {
    //   Authorization:
    //     'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6MzAwMDA3OCwidXNlcm5hbWUiOiJuaGF0dGluX3ZpZXciLCJpc0FjdGl2ZSI6dHJ1ZSwibGlzdEZlYXR1cmUiOlsiUE9JTlRfVklFVyIsIk9SREVSX1ZJRVciLCJQUk9EVUNUX0FUVEFDSF9WSUVXIiwiVFJBREVfSU5fVklFVyIsIlBST0RVQ1RfUFJPTU9USU9OX1ZJRVciLCJESVNDT1VOVF9WSUVXIiwiVFJBREVfSU5fUFJPR1JBTV9WSUVXIiwiQ09VUE9OX1ZJRVciLCJWSVJUVUFMX1NUT0NLX1ZJRVciLCJPUkRFUl9JTlNFUlQiLCJUUkFERV9JTl9JTlNFUlQiLCJESVNDT1VOVF9JTlNFUlQiLCJDT1VQT05fSU5TRVJUIiwiUFJPRFVDVF9QUk9NT1RJT05fSU5TRVJUIiwiVFJBREVfSU5fUFJPR1JBTV9JTlNFUlQiLCJQUk9EVUNUX0FUVEFDSF9JTlNFUlQiLCJBUkVBX1ZJRVciLCJSRUdJT05fVklFVyIsIkNVU1RPTUVSX0NBUkVfVklFVyIsIkNVU1RPTUVSX0NBUkVfSU5TRVJUIiwiUE9JTlRfSU5TRVJUIiwiT1JERVJfVVBEQVRFIiwiVFJBREVfSU5fVVBEQVRFIiwiSU5TVEFMTE1FTlRfVklFVyIsIklOU1RBTExNRU5UX0lOU0VSVCIsIlZJUlRVQUxfU1RPQ0tfSU5TRVJUIiwiV0FSUkFOVFlfSU5TRVJUIiwiV0FSUkFOVFlfVklFVyIsIlNUT1JFX1ZJRVciLCJDVVNUT01FUl9WSUVXIiwiQ0FURV9WSUVXIiwiQ0FURV9JTlNFUlQiLCJCUkFORF9WSUVXIiwiQlJBTkRfSU5TRVJUIiwiUFJPVklERVJfVklFVyIsIlBST1ZJREVSX0lOU0VSVCIsIlBST1BFUlRZX1ZJRVciLCJQUk9EVUNUX1ZJRVciLCJQUk9QRVJUWV9JTlNFUlQiLCJCSUxMX1ZJRVciLCJQUk9EVUNUX0lOU0VSVCIsIkJJTExfSU5TRVJUIiwiQklMTF9VUERBVEUiXSwiZW1wbG95ZWVJZCI6MzAwMDE3NSwiam9iVGl0bGVJZCI6bnVsbH0sImlhdCI6MTY0ODMxMzExOSwiZXhwIjoxNjQ4OTE3OTE5fQ.j0oPSscd79UJfJYpnDqoShBUzAJcY2X3m3iM1RI0fsE',
    // };
    // for (let page = currentPage; page <= destPage; page++) {
    //   const res = await axios({
    //     url: GET_PRODUCTS_APPCORE_LIST(page, limit),
    //     headers,
    //   });

    //   let listAppcoreProducts = res.data.data.list_product;

    //   if (listAppcoreProducts && listAppcoreProducts.length) {
    //     for (let productAppcoreItem of listAppcoreProducts) {
    //       let res = await axios({
    //         url: GET_PRODUCT_APPCORE_DETAIL(productAppcoreItem.id),
    //         headers,
    //       });
    //       let listAppcoreProductDetail = res.data.data;

    //       let cmsProductDetail = convertProductDataFromAppcore(
    //         listAppcoreProductDetail,
    //       );

    //       await this.itgCreate(cmsProductDetail);
    //     }
    //   }
    // }
    this.syncProductsIntoGroup();
  }
}
