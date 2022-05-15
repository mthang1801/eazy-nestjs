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
import { formatStandardTimeStamp } from 'src/utils/helper';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { ProductsCategoriesEntity } from '../entities/productsCategories.entity';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupFeaturesEntity } from '../entities/productVariationGroupFeatures.entity';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { ProductVariationGroupsEntity } from '../entities/productVariationGroups.entity';
import { ProductVariationGroupFeaturesRepository } from '../repositories/productVariationGroupFeatures.repository';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductPricesEntity } from '../entities/productPrices.entity';
import { JoinTable, SortBy, Table } from 'src/database/enums';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';
import {
  productFeaturesJoiner,
  productFullJoiner,
  productJoiner,
  productGroupProductsJoiner,
  productInfoJoiner,
  productSearchJoiner,
  productPromotionAccessoriesJoiner,
  productLeftJoiner,
  productsListByCategoryJoiner,
} from 'src/utils/joinTable';
import { productSearch } from 'src/utils/tableConditioner';
import { In, Like, MoreThan, Not } from 'src/database/operators/operators';
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
import {
  UpdateProductDto,
  JoinedProduct,
} from '../dto/product/update-product.dto';
import {
  Equal,
  IsNull,
  LessThan,
  MoreThanOrEqual,
} from '../../database/operators/operators';

import { convertToSlug, getPageSkipLimit } from '../../utils/helper';

import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';

import * as fs from 'fs';
import * as fsExtra from 'fs-extra';
import {
  getProductsListByCategoryIdSearchFilter,
  reviewCommentItemsSearchFilter,
} from '../../utils/tableConditioner';
import axios from 'axios';
import * as FormData from 'form-data';

import { DeleteProductImageDto } from '../dto/product/delete-productImage.dto';

import {
  categorySelector,
  getProductByIdentifierSelector,
  getProductsListSelector,
  getProductsListSelectorBE,
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
  APPCORE_TOKEN,
  GET_PRODUCTS_APPCORE_LIST,
  GET_PRODUCTS_COMBO_STORES_API,
  GET_PRODUCTS_LIST_APPCORE_BY_PAGE_API,
  GET_PRODUCTS_STORES_API,
  GET_PRODUCT_APPCORE_DETAIL,
  UPLOAD_IMAGE_API,
} from 'src/constants/api.appcore';
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
import { join } from 'path';
import { ProductStickerRepository } from '../repositories/productSticker.repository';
import { ProductStickerEntity } from '../entities/productSticker.entity';
import { StickerRepository } from '../repositories/sticker.repository';
import { StickerEntity } from '../entities/sticker.entity';
import * as moment from 'moment';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { PromotionAccessoryEntity } from '../entities/promotionAccessory.entity';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { ProductPromotionAccessoryEntity } from '../entities/productPromotionAccessory.entity';
import {
  productCategoryJoiner,
  productByCategoryIdJoiner,
} from '../../utils/joinTable';
import { UpdateProductsInCategory } from '../dto/product/update-productInCategory';
import { CatalogCategoryRepository } from '../repositories/catalogCategory.repository';
import { CatalogCategoryEntity } from '../entities/catalogCategory.entity';
import { sqlFindRelevantProductsInSameCategory } from '../../database/sqlQuery/others/stringQuery/products.sql';
import {
  productDetailSelector,
  getDetailProductsListSelectorFE,
} from '../../utils/tableSelector';
import { LessThanOrEqual, Between } from '../../database/operators/operators';
import {
  sqlReportTotalProductAmountFromStores,
  sqlReportTotalProductAmountInStores,
  sqlReportTotalProductsInCategories,
} from 'src/database/sqlQuery/others/reports/sqlProductAmount';
import { PromotionAccessoryService } from './promotionAccessory.service';

import { CategoryService } from './category.service';
import {
  countDistinctProduct,
  countDistinctProductCategory,
} from '../../database/sqlQuery/select/product.select';
import {
  parentProductCondition,
  countProduct,
} from '../../database/sqlQuery/select/product.select';
import {
  productPriceJoiner,
  productDescriptionJoiner,
} from '../../utils/joinTable';
import {
  getParentProductsSearchFilter,
  getProductBySlugCondition,
  productsListCategorySearchFilter,
} from 'src/database/sqlQuery/where/product.where';
import {
  getProductByIdentifierCondition,
  productsListsSearchFilter,
} from '../../database/sqlQuery/where/product.where';
import { categoryJoiner } from 'src/database/sqlQuery/join/category.join';
import { categoryJoinProduct } from '../../database/sqlQuery/join/category.join';
import {
  isNumeric,
  checkRestrictedCommentsListIntoRegularExpress,
} from '../../utils/helper';
import { productVariantJoiner } from 'src/database/sqlQuery/join/productFeature.join';
import {
  getProductsByCategoryListSelectorBE,
  getTradeinDetailProductsListSelectorBE,
} from '../../utils/tableSelector';
import { CreateReviewDto } from '../dto/reviewComment/create-review.dto';

import { ReviewRepository } from '../repositories/review.repository';
import { ReviewEntity } from '../entities/review.entity';
import { ReviewCommentItemsEntity } from '../entities/reviewCommentItems.entity';
import { ReviewCommentItemRepository } from '../repositories/reviewCommentItem.repository';
import { CreateCommentDto } from '../dto/reviewComment/create-comment.dto';
import { reviewCommentProductJoiner } from '../../database/sqlQuery/join/product.join';
import { CreateCommentReviewCMSDto } from '../dto/reviewComment/create-commentReview.cms.dto';
import { categorySearch } from '../../utils/tableConditioner';
import { ReviewsCommentService } from './reviewsComments.service';

import {
  productGroupJoiner,
  productVariationGroupJoiner,
} from '../../utils/joinTable';
import { ReviewCommentUserIPRepository } from '../repositories/reviewCommentUserIP.repository';
import { ReviewCommentUserIPEntity } from '../entities/reviewCommentUserIP.entity';
import { Cryptography } from '../../utils/cryptography';
import { Response } from 'express';
import { LogEntity } from '../entities/logs.entity';
import { LogRepository } from '../repositories/log.repository';
import { CategoryFeaturesRepository } from '../repositories/categoryFeatures.repository';
import { CategoryFeatureEntity } from '../entities/categoryFeature.entity';
import {
  categoryFeatureJoiner,
  categoryFeaturesSetJoiner,
} from '../../utils/joinTable';

@Injectable()
export class ProductService {
  constructor(
    private productRepo: ProductsRepository<ProductsEntity>,
    private productDescriptionsRepo: ProductDescriptionsRepository<ProductDescriptionsEntity>,
    private productVariationGroupProductsRepo: ProductVariationGroupProductsRepository<ProductVariationGroupFeaturesEntity>,
    private productVariationGroupRepo: ProductVariationGroupsRepository<ProductVariationGroupsEntity>,
    private productVariationGroupFeatureRepo: ProductVariationGroupFeaturesRepository<ProductVariationGroupFeaturesEntity>,
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
    private promoAccessoryRepo: PromotionAccessoryRepository<PromotionAccessoryEntity>,
    private productPromoAccessoryRepo: ProductPromotionAccessoryRepository<ProductPromotionAccessoryEntity>,
    private catalogCategoryRepo: CatalogCategoryRepository<CatalogCategoryEntity>,
    private accessoryService: PromotionAccessoryService,
    private categoryService: CategoryService,
    private reviewRepo: ReviewRepository<ReviewEntity>,
    private reviewCommentItemsRepo: ReviewCommentItemRepository<ReviewCommentItemsEntity>,
    private reviewCommentService: ReviewsCommentService,
    private revisewCommentUserIPRepo: ReviewCommentUserIPRepository<ReviewCommentUserIPEntity>,
    private logRepo: LogRepository<LogEntity>,
    private categoryFeatureRepo: CategoryFeaturesRepository<CategoryFeatureEntity>,
  ) {}

  async syncProductsIntoGroup(): Promise<void> {
    //===========Product group, product group product =============

    // Lấy danh sách các sản phẩm cha (bao gồm SP cấu hình, ngoài trự sản phẩm service product_code =4)
    let parentProductsList = await this.productRepo.find({
      select: ['*'],
      where: parentProductCondition,
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
          created_at: formatStandardTimeStamp(),
          updated_at: formatStandardTimeStamp(),
        });
        await this.productVariationGroupProductsRepo.create(
          {
            product_id: parentProductItem.product_id,
            parent_product_id: parentProductItem.parent_product_id,
            group_id: newProductGroup.group_id,
          },
          false,
        );

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
              await this.productVariationGroupFeatureRepo.create(
                {
                  feature_id,
                  variant_id,
                  group_id,
                },
                false,
              );
            }
          }
        }
      }
    }
  }

  async standardizeProducts() {
    let childrenProducts = await this.productRepo.find({
      parent_product_id: '0',
      parent_product_appcore_id: Not(IsNull()),
    });

    for (let childProduct of childrenProducts) {
      let parentProduct = await this.productRepo.update(
        { product_appcore_id: childProduct.parent_product_appcore_id },
        { product_function: 1 },
        true,
      );
      if (parentProduct) {
        await this.productRepo.update(
          { product_id: childProduct.product_id },
          {
            parent_product_id: parentProduct['product_id'],
            product_function: 2,
          },
        );
      }
    }

    let parentProducts = await this.productRepo.find({
      parent_product_appcore_id: IsNull(),
      product_function: 1,
    });

    if (parentProducts.length) {
      for (let parentProduct of parentProducts) {
        let childProduct = await this.productRepo.findOne({
          select: '*',
          join: productPriceJoiner,
          orderBy: [
            { field: `${Table.PRODUCT_PRICES}.price`, sortBy: SortBy.ASC },
          ],
          where: {
            [`${Table.PRODUCTS}.parent_product_appcore_id`]:
              parentProduct.product_appcore_id,
            [`${Table.PRODUCT_PRICES}.price`]: MoreThan(0),
          },
        });
        if (childProduct) {
          let productPriceData = {
            price: childProduct.price,
            list_price: childProduct.list_price,
            buy_price: childProduct.buy_price,
            collect_price: childProduct.collect_price,
            whole_price: childProduct.whole_price,
            percentage_discount: childProduct.percentage_discount,
            price_program: childProduct.price_program,
            price_discount: childProduct.price_discount,
            program_start_at: childProduct.program_start_at,
            program_end_at: childProduct.program_start_at,
          };
          await this.productPriceRepo.update(
            { product_id: parentProduct.product_id },
            productPriceData,
          );
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

  async getParentsList(params) {
    let { search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    let filterConditions = { [`${Table.PRODUCTS}.product_function`]: 1 };
    let productsList = await this.productRepo.find({
      select: '*',
      join: productDescriptionJoiner,
      where: getParentProductsSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.productRepo.find({
      select: countProduct,
      join: productDescriptionJoiner,
      where: getParentProductsSearchFilter(search, filterConditions),
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
      select: getProductByIdentifierSelector,
      join: {
        [JoinTable.leftJoin]: productFullJoiner,
      },
      where: getProductByIdentifierCondition(identifier),
    });

    if (!product) {
      throw new HttpException('Không tìm thấy sp', 404);
    }
    return this.getProductDetails(product);
  }

  async getListFE(params) {
    let {
      search,
      status, // Trạng thái hiển thị
      category_id, //  Danh mục SP
    } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    let filterCondition = {};
    let filterOrders = [
      { field: `${Table.PRODUCTS}.updated_at`, sortBy: SortBy.DESC },
    ];

    let categoriesList = [];
    if (category_id) {
      categoriesList = await this.categoryService.childrenCategories(
        category_id,
      );
      categoriesList = [
        +category_id,
        ...categoriesList.map(({ category_id }) => category_id),
      ];
    }

    let productLists = await this.productRepo.find({
      select: getProductsListSelector,
      join: productLeftJoiner,
      orderBy: filterOrders,
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
      select: countDistinctProduct,
      join: productLeftJoiner,
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      products: productLists,
    };
  }

  async getListBE(params: any) {
    let {
      search,
      status, // Trạng thái hiển thị
      category_id, //  Danh mục SP
      product_status, // Tình trạng SP Demo, mới
      product_type, // Loai SP
      status_type, // Trạng thái SP Like, Demo
      catalog_category_id, // danh mục ngành hàng
      type, // Loại hàng cty, xách tay
      promotion_accessory_id, // Tên bộ phụ kiện đi kèm
      created_at_start, // Ngày tạo
      created_at_end,
      sticker_id,
      store_location_id, // kho,
      amount_start, // Tồn kho
      amount_end,
      variant_ids,
      product_function,
      order_amount,
    } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    let filterCondition = {};
    let filterOrders: any[] = [
      { field: `${Table.PRODUCTS}.updated_at`, sortBy: SortBy.DESC },
    ];
    let filterJoiner = {};
    //  Filter trạng thái hiển thị
    if (status) {
      filterCondition[`${Table.PRODUCTS}.status`] = status;
    }
    // Filter trạng thái SP
    if (product_status) {
      filterCondition[`${Table.PRODUCTS}.product_status`] = product_status;
    }
    // Filter loại SP
    if (product_type) {
      filterCondition[`${Table.PRODUCTS}.product_type`] = product_type;
    }

    // Filter Sản phẩm thuộc về Sp cha hay SP con, combo hay độc lập
    if (product_function) {
      filterCondition[`${Table.PRODUCTS}.product_function`] =
        product_function.split(',').length <= 1
          ? product_function
          : In(product_function.split(','));
    }

    // Filter danh mục ngành hàng
    if (catalog_category_id) {
      filterCondition[`${Table.PRODUCTS}.catalog_category_id`] =
        catalog_category_id;
      filterJoiner['catalog_category_id'] = 1;
    }

    // Filter tinhf trang Demo, Like
    if (status_type) {
      filterCondition[`${Table.PRODUCTS}.status_type`] = status_type;
    }

    // Loại hàng cty, xách tay
    if (type) {
      filterCondition[`${Table.PRODUCTS}.type`] = type;
    }

    // Phụ kiện đi kèm
    if (promotion_accessory_id) {
      filterCondition[`${Table.PRODUCTS}.promotion_accessory_id`] =
        promotion_accessory_id;
    }

    // Ngay tạo
    if (created_at_start && created_at_end) {
      filterCondition[`${Table.PRODUCTS}.created_at`] = Between(
        created_at_start,
        created_at_end,
      );
    } else if (created_at_start) {
      filterCondition[`${Table.PRODUCTS}.created_at`] =
        MoreThanOrEqual(created_at_start);
    } else if (created_at_end) {
      filterCondition[`${Table.PRODUCTS}.created_at`] =
        LessThanOrEqual(created_at_end);
    }

    // Variant_id
    if (variant_ids) {
      filterCondition[`${Table.PRODUCT_FEATURE_VALUES}.variant_id`] = In(
        variant_ids.split(','),
      );
      filterJoiner['variant_id'] = 1;
    }

    // Theo sticker
    if (sticker_id) {
      filterCondition[`${Table.PRODUCT_STICKER}.sticker_id`] = sticker_id;
      filterJoiner['sticker_id'] = 1;
    }

    //Theo kho
    if (store_location_id) {
      filterCondition[`${Table.PRODUCT_STORES}.store_location_id`] =
        store_location_id;

      filterJoiner['store_location_id'] = 1;
    }

    //Tồn kho
    if (amount_start && amount_end) {
      filterCondition[`${Table.PRODUCTS}.amount`] = Between(
        amount_start,
        amount_end,
      );
    } else if (amount_start) {
      filterCondition[`${Table.PRODUCTS}.amount`] =
        MoreThanOrEqual(amount_start);
    } else if (amount_end) {
      filterCondition[`${Table.PRODUCTS}.amount`] = LessThanOrEqual(amount_end);
    }

    let categoriesList = [];

    if (category_id) {
      let arrCategories = category_id.split(',');
      filterJoiner['category_id'] = 1;
      // Theo danh mục
      categoriesList = arrCategories.map((category_id) => category_id);
      filterOrders = [
        {
          field: `CASE WHEN ${Table.PRODUCTS_CATEGORIES}.position`,
          sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.PRODUCTS_CATEGORIES}.position`,
        },
      ];
    }

    let productsList: any[] = [];
    let count = 0;
    let isContinued = true;
    let productSearchFilterParams = {
      filterCondition,
      filterJoiner,
      filterOrders,
      categoriesList,
      search,
      skip,
      limit,
    };
    if (store_location_id && isContinued) {
      ({ productsList, count } = await this.findProductsListAndCountFromStore(
        productSearchFilterParams,
      ));

      isContinued = false;
    }
    if (category_id && isContinued) {
      ({ productsList, count } =
        await this.findProductsListAndCountFromCategory(
          productSearchFilterParams,
        ));
      isContinued = false;
    }
    if (sticker_id && isContinued) {
      ({ productsList, count } = await this.findProductsListAndCountFromSticker(
        productSearchFilterParams,
      ));
      isContinued = false;
    }

    if (catalog_category_id && isContinued) {
      ({ productsList, count } = await this.findProductsListAndCountFromCatalog(
        productSearchFilterParams,
      ));
      isContinued = false;
    }
    if (variant_ids && isContinued) {
      ({ productsList, count } =
        await this.findProductsListAndCountFromFeatureValue(
          productSearchFilterParams,
        ));
      isContinued = false;
    }
    if (isContinued) {
      ({ productsList, count } = await this.findProductsListAndCount(
        productSearchFilterParams,
      ));
      isContinued = false;
    }

    // determine product type and  get Image
    for (let productItem of productsList) {
      let currentCategory = await this.productCategoryRepo.findOne({
        select: '*',
        join: productCategoryJoiner,
        where: {
          [`${Table.PRODUCTS_CATEGORIES}.product_id`]:
            productItem['product_id'],
        },
      });
      productItem['currentCategory'] = currentCategory;
    }

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count,
      },
      products: productsList,
    };
  }

  async findProductsListAndCountFromStore(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;
    let productsList = await this.productStoreRepo.find({
      select: `DISTINCT(${Table.PRODUCTS}.product_id)`,
      join: productJoiner(filterJoiner),
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.productStoreRepo.find({
        select: getTradeinDetailProductsListSelectorBE,
        join: productJoiner(filterJoiner),
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.productStoreRepo.find({
      select: countDistinctProduct,
      join: productJoiner(filterJoiner),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
  }

  async findProductsListAndCountFromCategory(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;

    let productsList = await this.productCategoryRepo.find({
      select: `DISTINCT(${Table.PRODUCTS_CATEGORIES}.product_id)`,
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id AND ${
              Table.PRODUCTS_CATEGORIES
            }.category_id IN (${categoriesList.join(',')}) `,
          },
          [Table.CATEGORIES]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
          },
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_PRICES]: {
            fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
        },
      },
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.productRepo.find({
        select: '*',
        join: {
          [JoinTable.leftJoin]: {
            [Table.PRODUCT_DESCRIPTION]: {
              fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
            [Table.PRODUCT_PRICES]: {
              fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
            [Table.PRODUCTS_CATEGORIES]: {
              fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id AND ${
                Table.PRODUCTS_CATEGORIES
              }.category_id IN (${categoriesList.join(',')})`,
            },
            [Table.CATEGORIES]: {
              fieldJoin: `${Table.CATEGORIES}.category_id`,
              rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
            },
          },
        },
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.productCategoryRepo.find({
      select: countDistinctProductCategory,
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id AND ${
              Table.PRODUCTS_CATEGORIES
            }.category_id IN (${categoriesList.join(',')}) `,
          },
          [Table.CATEGORIES]: {
            fieldJoin: `${Table.CATEGORIES}.category_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
          },
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_PRICES]: {
            fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
        },
      },
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
  }

  async findProductsListAndCountFromSticker(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;
    let productsList = await this.productStickerRepo.find({
      select: `DISTINCT(${Table.PRODUCTS}.product_id)`,
      join: productJoiner(filterJoiner),
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.productStickerRepo.find({
        select: getProductsListSelectorBE,
        join: productJoiner(filterJoiner),
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.productStickerRepo.find({
      select: countDistinctProduct,
      join: productJoiner(filterJoiner),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
  }

  async findProductsListAndCountFromCatalog(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;
    let productsList = await this.catalogCategoryRepo.find({
      select: `DISTINCT(${Table.PRODUCTS}.product_id)`,
      join: productJoiner(filterJoiner),
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.catalogCategoryRepo.find({
        select: getProductsListSelectorBE,
        join: productJoiner(filterJoiner),
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.catalogCategoryRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productJoiner(filterJoiner),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
  }

  async findProductsListAndCountFromFeatureValue(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;
    let productsList = await this.productFeatureValueRepo.find({
      select: `DISTINCT(${Table.PRODUCTS}.product_id)`,
      join: productJoiner(filterJoiner),
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.productFeatureValueRepo.find({
        select: getProductsListSelectorBE,
        join: productJoiner(filterJoiner),
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.productFeatureValueRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productJoiner(filterJoiner),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
  }

  async findProductsListAndCount(params) {
    let {
      filterOrders,
      categoriesList,
      search,
      filterCondition,
      filterJoiner,
      skip,
      limit,
    } = params;
    let productsList = await this.productRepo.find({
      select: `DISTINCT(${Table.PRODUCTS}.product_id)`,
      join: productJoiner(filterJoiner),
      orderBy: filterOrders,
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

    if (productsList.length) {
      productsList = await this.productRepo.find({
        select: getProductsListSelectorBE,
        join: productJoiner(filterJoiner),
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }
    let count = await this.productRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productJoiner(filterJoiner),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
    });

    return { productsList, count: count[0].total };
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

  async joinParentProducts(joined_products: JoinedProduct[]) {
    if (joined_products.length < 2) return;

    let groupsList = [];

    for (let { product_id, name } of joined_products) {
      let group = await this.productVariationGroupRepo.findOne({
        product_root_id: product_id,
      });
      if (group) {
        group['group_name'] = name;
        groupsList = [...groupsList, group];
      }
    }

    if (groupsList.length != joined_products.length) return;

    let groupIndexData = {
      ...new ProductVariationGroupIndexEntity(),
      group_ids: groupsList.map(({ group_id }) => group_id).join(','),
    };
    const groupIndex = await this.productGroupIndexRepo.create(groupIndexData);
    for (let group of groupsList) {
      await this.productVariationGroupRepo.update(
        { group_id: group['group_id'] },
        {
          index_id: groupIndex.index_id,
          group_name: group['group_name'],
        },
      );
    }
  }

  async getProductsListByCategoryId(
    categoryId: number,
    params: any,
  ): Promise<any> {
    let { page, limit, find_reverse, search } = params;

    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;

    let filterCondition = {
      [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId,
    };

    let productsList = await this.productCategoryRepo.find({
      select: '*',
      // join: productByCategoryIdJoiner,
      orderBy: [
        { field: `${Table.PRODUCTS_CATEGORIES}.position`, sortBy: SortBy.ASC },
      ],
      where: getProductsListByCategoryIdSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    if (productsList.length) {
      productsList = await this.productRepo.find({
        select: getProductsListSelectorBE,
        join: productLeftJoiner,
        where: {
          [`${Table.PRODUCTS}.product_id`]: In(
            productsList.map(({ product_id }) => product_id),
          ),
        },
      });
    }

    let count = await this.productCategoryRepo.find({
      select: `COUNT(${Table.PRODUCTS_CATEGORIES}.product_id) as total`,

      where: getProductsListByCategoryIdSearchFilter(search, filterCondition),
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

    let categoryId = category.category_id;
    let categoriesListByLevel = await this.categoryService.childrenCategories(
      categoryId,
    );

    let filterCondition = {
      [`${Table.PRODUCTS}.product_function`]: Not(Equal(2)),
      [`${Table.PRODUCTS}.status`]: 'A',
    };

    categoriesListByLevel = _.orderBy(
      categoriesListByLevel,
      ['level'],
      ['asc'],
    );

    let categoriesList = [
      +categoryId,
      ..._.map(categoriesListByLevel, 'category_id'),
    ];

    let { search } = params;

    let { page, skip, limit } = getPageSkipLimit(params);

    let filterOrder = [
      {
        field: `CASE WHEN ${Table.PRODUCTS_CATEGORIES}.position`,
        sortBy: ` IS NULL THEN 1 ELSE 0 END, ${Table.PRODUCTS_CATEGORIES}.position`,
      },
    ];

    const productsList = await this.productCategoryRepo.find({
      select: [
        ...getDetailProductsListSelectorFE,
        `${Table.PRODUCTS_CATEGORIES}.position as position`,
      ],
      join: productsListByCategoryJoiner(),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
      orderBy: filterOrder,
      skip,
      limit,
    });

    const count = await this.productCategoryRepo.find({
      select: `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`,
      join: productsListByCategoryJoiner(),
      where: categoriesList.length
        ? productsListCategorySearchFilter(
            categoriesList,
            search,
            filterCondition,
          )
        : productsListsSearchFilter(search, filterCondition),
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

      productItem['ratings'] = await this.reviewRepo.findOne({
        product_id: productItem['product_id'],
      });
    }

    let features = await this.getFeaturesSetByCategoryId(
      category['category_id'],
    );

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0]?.total,
      },
      currentCategory: category,
      childrenCategories: categoriesListByLevel,
      products: productsList,
      features,
    };
  }

  async getFeaturesSetByCategoryId(category_id) {
    const featuresSet = await this.categoryFeatureRepo.find({
      select: '*',
      join: categoryFeaturesSetJoiner,
      where: { [`${Table.CATEGORY_FEATURES}.category_id`]: category_id },
    });

    if (featuresSet.length) {
      for (let featureItem of featuresSet) {
        const variants = await this.productFeatureVariantRepo.find({
          feature_id: featureItem.feature_id,
        });
        featureItem['variants_set'] = variants;
      }
    }

    return featuresSet;
  }

  async updateProductIntoCategory(
    categoryId: number,
    data: UpdateProductsInCategory,
  ) {
    let category = await this.categoryRepo.findOne({ category_id: categoryId });
    if (!category) {
      throw new HttpException(`Không tìm thấy danh mục`, 404);
    }
    if (data.removed_products && data.removed_products.length) {
      for (let productId of data.removed_products) {
        await this.productCategoryRepo.delete({
          product_id: productId,
          category_id: categoryId,
        });
      }
    }

    if (data.inserted_products && data.inserted_products.length) {
      for (let productId of data.inserted_products) {
        await this.productCategoryRepo.delete({
          product_id: productId,
          category_id: categoryId,
        });
        await this.productCategoryRepo.create(
          {
            product_id: productId,
            category_id: categoryId,
            category_appcore_id: category['category_appcore_id'],
          },
          false,
        );
      }
    }
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

    if (data.joined_products && data.joined_products.length) {
      if (!data.joined_products.some(({ product_id }) => product_id)) {
        throw new HttpException('Tạo nhóm SP không thành công', 400);
      }
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
    // if (data.product_code) {
    //   const product = await this.productRepo.findOne({
    //     product_code: data.product_code,
    //     product_id: Not(Equal(result.product_id)),
    //   });
    //   console.log(product);
    //   if (product) {
    //     throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
    //   }
    // }

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
      updated_at: formatStandardTimeStamp(),
    });

    if (Object.entries(productData).length) {
      const updatedProduct = await this.productRepo.update(
        { product_id: result.product_id },
        productData,
        true,
      );

      result = { ...result, ...updatedProduct };
    }

    if (data.status && Object.entries(data).length == 1) {
      return;
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
          true,
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
          true,
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

    //decrese the number of product of old category
    let oldCategories = await this.productCategoryRepo.find({
      product_id: result.product_id,
    });

    if (oldCategories.length) {
      for (let oldCategoryItem of oldCategories) {
        let category = await this.categoryRepo.findOne({
          category_id: oldCategoryItem.category_id,
        });
        if (category) {
          await this.categoryRepo.update(
            { category_id: category.category_id },
            { product_count: category.product_count - 1 },
          );
        }
      }
    }
    //delete all old product categories
    await this.productCategoryRepo.delete({ product_id: result.product_id });

    // Update product category
    if (data?.category_id?.length) {
      for (let categoryId of data.category_id) {
        const newProductCategoryData = {
          ...new ProductsCategoriesEntity(),
          category_id: categoryId,
          product_id: result.product_id,
        };
        await this.productCategoryRepo.create(newProductCategoryData);
        let currentCategory = await this.categoryRepo.findOne({
          category_id: categoryId,
        });
        await this.categoryRepo.update(
          { category_id: categoryId },
          { product_count: currentCategory.product_count + 1 },
        );
      }
    }

    // Remove all old product features
    await this.productFeatureValueRepo.delete({
      product_id: result['product_id'],
    });
    //create new product features
    if (data?.product_features?.length) {
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

    if (data.joined_products && data.joined_products.length) {
      await this.joinParentProducts(data.joined_products);
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
        return this.itgUpdate(
          convertedData['product_appcore_id'],
          convertedData,
          true,
        );
      }
    }

    if (convertedData['parent_product_appcore_id']) {
      let parentProduct = await this.productRepo.findOne({
        product_appcore_id: convertedData['parent_product_appcore_id'],
      });
      if (parentProduct) {
        await this.productRepo.update(
          { product_id: parentProduct.product_id },
          { product_function: 1 },
        );

        convertedData['parent_product_id'] = parentProduct['product_id'];
      }
    }

    if (convertedData['color'] && isNumeric(convertedData['color'])) {
      let variant = await this.productFeatureVariantRepo.findOne({
        select: '*',
        join: productVariantJoiner,
        where: {
          [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_code`]:
            convertedData['color'],
        },
      });
      if (variant) {
        convertedData['color'] = variant['variant'];
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

    await this.productDescriptionsRepo.create(productDescData);

    //price
    const productPriceData = {
      ...new ProductPricesEntity(),
      ...this.productPriceRepo.setData(convertedData),
      product_id: result.product_id,
    };

    await this.productPriceRepo.create(productPriceData);

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

    await this.productCategoryRepo.create(productCategoryData);

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

        await this.productFeatureValueRepo.create(productFeatureValueData);
      }
    }

    if (convertedData['combo_items'] && convertedData['combo_items'].length) {
      // Nếu là SP combo, tạo group
      let productGroup = await this.productVariationGroupRepo.create({
        product_root_id: result.product_id,
        group_type: 2,
        created_at: formatStandardTimeStamp(),
        updated_at: formatStandardTimeStamp(),
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
          await this.productDescriptionsRepo.create(
            productComboItemDescData,
            false,
          );

          // price
          const productComboItemPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(productItem),
            product_id: productComboItem.product_id,
          };
          await this.productPriceRepo.create(productComboItemPriceData, false);

          // category
          const productCategoryItemData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(productItem),
            category_id: productItem['category_id']
              ? productItem['category_id']
              : 0,
            product_id: productComboItem.product_id,
          };
          await this.productCategoryRepo.create(productCategoryItemData, false);
        } else {
          const updatedProductData = this.productRepo.setData(productItem);

          await this.productRepo.update(
            { product_appcore_id: productItem.product_appcore_id },
            updatedProductData,
          );
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
    await this.checkProductGroupAndPrice(convertedData);
  }

  async checkProductGroupAndPrice(data) {
    if (+data['product_function'] == 2) {
      let parentProduct = await this.productRepo.findOne({
        product_appcore_id: data['parent_product_appcore_id'],
      });

      if (parentProduct) {
        await this.supplyPriceToParentProduct(parentProduct['product_id']);
        let group = await this.productVariationGroupRepo.findOne({
          product_root_id: parentProduct.product_id,
        });
        if (!group) {
          const newGroupData = {
            ...new ProductVariationGroupsEntity(),
            product_root_id: parentProduct.product_id,
          };
          group = await this.productVariationGroupRepo.create(newGroupData);
        }
        let childrenProducts = await this.productRepo.find({
          select: '*',
          where: {
            parent_product_appcore_id: parentProduct.product_appcore_id,
          },
        });

        if (childrenProducts.length) {
          for (let childProduct of childrenProducts) {
            let checkProductInGroup =
              await this.productVariationGroupProductsRepo.findOne({
                product_id: childProduct['product_id'],
                group_id: group['group_id'],
              });
            if (!checkProductInGroup) {
              await this.productVariationGroupProductsRepo.create(
                {
                  product_id: childProduct['product_id'],
                  parent_product_id: parentProduct.product_id,
                  group_id: group['group_id'],
                },
                false,
              );
            }
          }
        }
      }
      return;
    }
    if (+data['product_function'] == 4) {
      let childrenProducts = await this.productRepo.find({
        parent_product_appcore_id: data['product_appcore_id'],
      });

      if (childrenProducts.length) {
        const currentProduct = await this.productRepo.update(
          { product_appcore_id: data['product_appcore_id'] },
          { product_function: 1 },
          true,
        );
        await this.supplyPriceToParentProduct(currentProduct['product_id']);
        let group = await this.productVariationGroupRepo.findOne({
          product_root_id: currentProduct['product_id'],
        });
        if (!group) {
          const newGroupData = {
            ...new ProductVariationGroupsEntity(),
            product_root_id: currentProduct['product_id'],
          };
          group = await this.productVariationGroupRepo.create(newGroupData);
        }
        for (let childProduct of childrenProducts) {
          await this.productRepo.update(
            { product_id: childProduct['product_id'] },
            { parent_product_id: currentProduct['product_id'] },
          );

          let checkProductInGroup =
            await this.productVariationGroupProductsRepo.findOne({
              product_id: childProduct['product_id'],
              group_id: group['group_id'],
            });

          if (!checkProductInGroup) {
            await this.productVariationGroupProductsRepo.create(
              {
                product_id: childProduct['product_id'],
                parent_product_id: currentProduct['product_id'],
                group_id: group['group_id'],
              },
              false,
            );
          }
        }
      }
      return;
    }
  }

  async callSync(): Promise<void> {
    // //========== create =============
    // await this.clearAll();
    // for (let productItem of mockProductsData) {
    //   await this.itgCreate(productItem);
    // }
    // await this.syncProductsIntoGroup();
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

  async supplyPriceToParentProduct(product_id) {
    const parentProduct = await this.productRepo.findOne({
      select: '*',
      join: productPriceJoiner,
      where: { [`${Table.PRODUCTS}.product_id`]: product_id },
    });

    let childrenProducts = await this.productRepo.find({
      select: `price,  list_price, buy_price, collect_price, whole_price, percentage_discount`,
      join: productPriceJoiner,
      where: {
        [`${Table.PRODUCTS}.parent_product_appcore_id`]:
          parentProduct['product_appcore_id'],
      },
    });

    if (childrenProducts.length) {
      let sortProductsByPrice = _.sortBy(childrenProducts, [
        function (o) {
          return o.price;
        },
      ]);
      if (sortProductsByPrice.length) {
        let firstChild = sortProductsByPrice[0];
        await this.productPriceRepo.update(
          { product_id: parentProduct.product_id },
          { ...firstChild },
        );
      }
    }
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
    const product = await this.productRepo.findOne({
      select: '*',
      join: productLeftJoiner,
      where: { product_appcore_id: identifier },
    });

    if (!product) {
      return this.itgCreate({ product_id: identifier, ...data });
    }

    let convertedData = { ...data };
    if (!isConverted) {
      convertedData = itgConvertProductsFromAppcore(data);
    }
    delete convertedData['product_appcore_id'];

    if (convertedData.combo_items && convertedData.combo_items.length) {
      for (let comboItem of convertedData.combo_items) {
        if (comboItem['product_combo_id'] != product['product_appcore_id']) {
          throw new HttpException(
            `Sản phẩm combo không đúng ${comboItem['product_combo_id']}, ${product['product_appcore_id']}`,
            400,
          );
        }
      }
    }

    if (convertedData['color'] && isNumeric(convertedData['color'])) {
      let variant = await this.productFeatureVariantRepo.findOne({
        select: '*',
        join: productVariantJoiner,
        where: {
          [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_code`]:
            convertedData['color'],
        },
      });
      if (variant) {
        convertedData['color'] = variant['variant'];
      }
    }

    let result = { ...product };

    if (convertedData['parent_product_appcore_id']) {
      let parentProduct = await this.productRepo.findOne({
        product_appcore_id: convertedData['parent_product_appcore_id'],
      });
      if (parentProduct) {
        await this.productRepo.update(
          { product_id: parentProduct.product_id },
          { product_function: 1 },
        );
        convertedData['parent_product_id'] = parentProduct['product_id'];
      }
    }

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
      await this.productDescriptionsRepo.create(newProductDescData, false);
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
      await this.productPriceRepo.create(newProductPriceData, false);
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
      await this.productCategoryRepo.create(newProductCategoryData, false);
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
        created_at: formatStandardTimeStamp(),
        updated_at: formatStandardTimeStamp(),
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
            ...this.productRepo.setData(productItem),
            product_type: 3,
          };

          productComboItem = await this.productRepo.create(
            productComboItemData,
          );

          const productComboItemDesc = {
            ...new ProductDescriptionsEntity(),
            product: `${result.product ? result.product : ''} combo ${i + 1}`,
            product_id: productComboItem.product_id,
          };

          // description
          const productComboItemDescData = {
            ...new ProductDescriptionsEntity(),
            ...this.productDescriptionsRepo.setData(productItem),
            product_core_name: productItem.product || '',
            product_id: productComboItem.product_id,
          };
          await this.productDescriptionsRepo.create(
            productComboItemDescData,
            false,
          );

          // price
          const productComboItemPriceData = {
            ...new ProductPricesEntity(),
            ...this.productPriceRepo.setData(productItem),
            product_id: productComboItem.product_id,
          };
          await this.productPriceRepo.create(productComboItemPriceData, false);

          // category
          const productCategoryItemData = {
            ...new ProductsCategoriesEntity(),
            ...this.productCategoryRepo.setData(productItem),
            category_id: productItem['category_id']
              ? productItem['category_id']
              : 0,
            product_id: productComboItem.product_id,
          };
          await this.productCategoryRepo.create(productCategoryItemData, false);
        } else {
          const updatedProductData = this.productRepo.setData(productItem);

          await this.productRepo.update(
            { product_appcore_id: productItem.product_appcore_id },
            updatedProductData,
          );
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

    await this.checkProductGroupAndPrice(convertedData);
    // await this.requestIntegrateParentProduct();
  }

  async clearAll() {
    await this.productRepo.writeExec(`TRUNCATE TABLE ${Table.PRODUCTS}`);
    await this.productCategoryRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCTS_CATEGORIES}`,
    );
    await this.productDescriptionsRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_DESCRIPTION}`,
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
      await this.productDescriptionsRepo.create(newProductDescData, false);
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

  async uploadThumbnail(file, product_id) {
    const product = await this.productRepo.findById(product_id);
    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
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
        await this.productRepo.update(
          { product_id },
          { thumbnail: imageUrl[0] },
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
  async deleteThumbnail(product_id) {
    await this.productRepo.update({ product_id }, { thumbnail: '' });
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
    console.log(27, product);
    try {
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
          let productsInGroup =
            await this.productVariationGroupProductsRepo.find({
              select: ['*'],
              where: { group_id: group.group_id },
            });

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

                // Lấy phụ kiện KM, đi kèm
                if (productInfoDetail['promotion_accessory_id']) {
                  productInfoDetail['accessory_products'] =
                    await this.getAccessoriesByProductId(
                      productInfoDetail['promotion_accessory_id'],
                    );
                }

                // Lấy các kho hàng hiện tại
                productInfoDetail['inventories'] = await this.getProductsStores(
                  productInfoDetail.product_id,
                );

                product['children_products'] = product['children_products']
                  ? [...product['children_products'], productInfoDetail]
                  : [productInfoDetail];
              }
            }
          }
        }
      }

      let currentCategory;

      if (showListCategories) {
        currentCategory = await this.categoryRepo.find({
          select: categorySelector,
          join: categoryJoinProduct,
          where: {
            [`${Table.PRODUCTS_CATEGORIES}.product_id`]: product.product_id,
          },
        });
      } else {
        currentCategory = await this.categoryRepo.findOne({
          select: categorySelector,
          join: categoryJoiner,
          where: { [`${Table.CATEGORIES}.category_id`]: product.category_id },
        });
      }

      // get promotion accessories

      if (product['promotion_accessory_id']) {
        let promotionRes = await this.promoAccessoryRepo.findOne({
          select: '*',
          where: { accessory_id: product['promotion_accessory_id'] },
        });
        product['promotion_accessory_name'] = promotionRes['accessory_name'];
      }
      if (product['free_accessory_id']) {
        let promotionRes = await this.promoAccessoryRepo.findOne({
          select: '*',
          where: { accessory_id: product['free_accessory_id'] },
        });
        product['free_accessory_name'] = promotionRes['accessory_name'];
      }
      if (product['warranty_package_id']) {
        let promotionRes = await this.promoAccessoryRepo.findOne({
          select: '*',
          where: { accessory_id: product['warranty_package_id'] },
        });
        product['warranty_package_name'] = promotionRes['accessory_name'];
      }

      //determine type of product
      product['productType'] = this.determineProductType(product);

      const categoriesList = await this.categoryService.parentCategories(
        currentCategory,
      );
      const parentCategories = categoriesList.slice(1);

      product['status'] = status;

      product['inventories'] = await this.getProductsStores(product.product_id);

      //find product Stickers
      product['stickers'] = await this.getProductStickers(product);

      return {
        currentCategory: showListCategories
          ? currentCategory
          : categoriesList[0],
        parentCategories,
        product,
      };
    } catch (error) {
      console.log(error);
    }
  }

  async testGetProductDetails(product_id) {
    let product = await this.productRepo.findOne({
      select: productDetailSelector,
      join: { [JoinTable.leftJoin]: productFullJoiner },
      where: { [`${Table.PRODUCTS}.product_id`]: product_id },
    });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let result: any = { ...product };

    if (result['product_function'] >= 4) {
      result['productType'] = 4;
      result['prodyctTypeName'] = 'Sản phẩm độc lập';
    }

    if (result['product_function'] == 3) {
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
            select: productDetailSelector,
            join: { [JoinTable.leftJoin]: productFullJoiner },
            where: {
              [`${Table.PRODUCTS}.product_id`]: productComboItem.product_id,
            },
          });

          if (productComboItem.product_id == group.product_root_id) {
            result['configurableProduct'] = productCombo;
          } else {
            result['comboItems'] = result['comboItems']
              ? [...result['comboItems'], productCombo]
              : [productCombo];
          }
        }
      }

      result['productType'] = 3;
      result['prodyctTypeName'] = 'Sản phẩm combo';
    }

    if (result['product_function'] == 1) {
      let group = await this.productVariationGroupRepo.findOne({
        product_root_id: result.product_id,
      });

      if (group) {
        let childrenProducts = await this.getChildrenProducts(
          result['product_appcore_id'],
          1,
        );
        result['children_products'] = childrenProducts;
        result['relevantProducts'] = [];
        // Find relevant products
        if (group.index_id) {
          let relevantGroups = await this.productVariationGroupRepo.find({
            select: '*',
            where: {
              index_id: group.index_id,
            },
          });

          if (relevantGroups.length) {
            for (let relevantGroupItem of relevantGroups) {
              if (relevantGroupItem.product_root_id) {
                console.log(relevantGroupItem);
                let productRoot = await this.productVariationGroupRepo.findOne({
                  select: [
                    ...getDetailProductsListSelectorFE,
                    `${Table.PRODUCT_VARIATION_GROUPS}.*`,
                  ],
                  join: productVariationGroupJoiner,
                  where: {
                    [`${Table.PRODUCT_VARIATION_GROUPS}.product_root_id`]:
                      relevantGroupItem.product_root_id,
                  },
                });

                result['relevantProducts'] = result['relevantProducts']
                  ? [...result['relevantProducts'], productRoot]
                  : [productRoot];
              }
            }
          }
        }
      }
    }

    // Get stores
    result['stores'] = await this.getProductsStores(result.product_id);

    // get Image
    result['images'] = await this.getProductImages(result.product_id);

    //Get Features
    result['product_features'] = await this.getProductFeatures(
      result.product_id,
    );

    // Get accessory
    if (result['promotion_accessory_id']) {
      result['promotion_accessory_products'] =
        await this.getAccessoriesByProductId(
          result['promotion_accessory_id'],
          1,
        );
    }

    if (result['free_accessory_id']) {
      result['free_accessory_products'] = await this.getAccessoriesByProductId(
        result['free_accessory_id'],
        1,
      );
    }

    if (result['warranty_package_id']) {
      result['warranty_package_products'] =
        await this.getAccessoriesByProductId(result['warranty_package_id'], 1);
    }

    result['currentCategories'] = [];
    result['relative_prouducts'] = [];
    // Get Current category info
    if (result['category_id']) {
      result['currentCategories'] = await this.productCategoryRepo.find({
        select: '*',
        join: productCategoryJoiner,
        where: {
          [`${Table.PRODUCTS_CATEGORIES}.product_id`]: result['product_id'],
        },
      });

      // Get relative products
      result['relative_prouducts'] = await this.getRelativeProductsByCategory(
        result,
      );
    }

    return result;
  }

  async getRelativeProductsByCategory(product, exclusive_lists = []) {
    let { minPrice, maxPrice } = this.setMinMaxPriceRelevantProducts(
      product.price,
    );

    let categories = await this.productCategoryRepo.find({
      select: '*',
      join: productCategoryJoiner,
      where: {
        [`${Table.PRODUCTS_CATEGORIES}.product_id`]: product['product_id'],
      },
    });

    let listCategoriesId = categories.map(({ category_id }) => category_id);
    let productsList = await this.productCategoryRepo.find({
      select: `*, ${Table.PRODUCTS}.slug as productSlug`,
      join: productByCategoryIdJoiner,
      where: listCategoriesId.map((categoryId) => ({
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId,
        [`${Table.PRODUCT_PRICES}.price`]: Between(minPrice, maxPrice),
        [`${Table.PRODUCTS}.product_function`]: product['product_function'],
        [`${Table.PRODUCTS}.product_id`]: Not(Equal(product['product_id'])),
      })),
      skip: 0,
      limt: 10,
    });

    return productsList;
  }

  setMinMaxPriceRelevantProducts(price) {
    let minPrice = price / 2;
    let maxPrice = price * 2;

    if (price <= 100000) {
      minPrice = 0;
      maxPrice = 200000;
    } else if (500000 <= price && price <= 10000000) {
      minPrice = price / 1.5;
      maxPrice = price * 1.5;
    } else if (price <= 50000000) {
      minPrice = price / 1.4;
      maxPrice = price * 1.4;
    } else {
      minPrice = price / 1.3;
      maxPrice = price * 1.3;
    }
    return { minPrice, maxPrice };
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
    if (
      (product['parent_product_appcore_id'] == null ||
        !product['parent_product_appcore_id']) &&
      (product.product_type == 1 || product.product_type == 2)
    ) {
      return 1; //Sản phẩm cha
    } else if (
      (product['parent_product_appcore_id'] > 0 ||
        product['parent_product_appcore_id'] != null) &&
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
        let slug = convertToSlug(product['product']);
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
        try {
          if (product.product_type == 3) {
            response = await axios({
              url: GET_PRODUCTS_COMBO_STORES_API(product.product_appcore_id),
            });
          } else {
            response = await axios({
              url: GET_PRODUCTS_STORES_API(product.product_appcore_id),
            });
          }

          if (!response?.data?.data) {
            continue;
          }
          const data = response.data.data;

          if (data && Object.entries(data).length) {
            for (let dataItem of Object.values(data)) {
              await this.productStoreRepo.create({
                store_location_id: dataItem['storeId'],
                product_id: product.product_id,
                amount: dataItem['inStockQuantity'],
                created_at: formatStandardTimeStamp(),
                updated_at: formatStandardTimeStamp(),
              });
              await this.productStoreHistoryRepo.create({
                store_location_id: dataItem['storeId'],
                product_id: product.product_id,
                amount: dataItem['inStockQuantity'],
                created_at: formatStandardTimeStamp(),
                updated_at: formatStandardTimeStamp(),
              });
            }
          }
        } catch (error) {
          console.log(error);
        }
      }
    }
  }

  async itgCreateProductStores(data: CreateProductStoreDto) {
    console.log('stocks');
    console.log(data);
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
          updated_at: formatStandardTimeStamp(),
        },
      );
    } else {
      // Create new product store
      await this.productStoreRepo.create({
        product_id,
        store_location_id,
        amount,
        created_at: formatStandardTimeStamp(),
        updated_at: formatStandardTimeStamp(),
      });
    }
    // Create new product store history
    await this.productStoreHistoryRepo.create({
      product_id,
      store_location_id,
      amount,
      created_at: formatStandardTimeStamp(),
      updated_at: formatStandardTimeStamp(),
    });

    const productsInStocks = await this.productStoreRepo.find({
      product_id: product.product_id,
    });

    if (productsInStocks.length) {
      let currentProduct = await this.productRepo.findOne({
        product_id: product.product_id,
      });
      if (!currentProduct) {
        return;
      }
      let totalAmount = 0;
      for (let productStockItem of productsInStocks) {
        totalAmount += productStockItem.amount;
      }
      await this.productRepo.update(
        { product_id: product.product_id },
        { amount: totalAmount },
      );
    }
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
    let { page, limit, category_ids, q } = params;

    page = +page || 1;
    limit = +limit || 10;
    let skip = (page - 1) * limit;
    let filterConditions = {};
    if (category_ids) {
      filterConditions = {
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: category_ids
          ?.split(',')
          ?.map((categoryId) => categoryId),
      };
    }

    const productsList = await this.productRepo.find({
      select: `*, ${Table.PRODUCTS}.slug as productSlug, ${Table.CATEGORIES}.slug as categorySlug, ${Table.PRODUCT_PRICES}.*`,
      join: productSearchJoiner,
      where: productSearch(q, filterConditions),
      skip,
      limit,
    });

    let categoriesList = await this.categoryRepo.find({
      select: '*',
      join: categoryJoiner,
      where: categorySearch(q),
      skip,
      limit,
    });

    return { categoriesList, productsList };
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
        let childrensCategories = await this.categoryService.childrenCategories(
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
      created_at: formatStandardTimeStamp(),
      updated_at: formatStandardTimeStamp(),
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
        updated_at: formatStandardTimeStamp(),
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

  async importProductStocksAmount() {
    const products = await this.productRepo.find();

    for (let product of products) {
      if (!product.product_id || !product.product_appcore_id) {
        continue;
      }
      let response: any;
      if (product.product_type == 3) {
        response = await axios({
          url: GET_PRODUCTS_COMBO_STORES_API(product.product_appcore_id),
        });
      } else {
        response = await axios({
          url: GET_PRODUCTS_STORES_API(product.product_appcore_id),
        });
      }

      const data = response.data.data;

      // if (Object.entries(data).length) {
      //   for (let dataItem of Object.values(data)) {
      //     if (dataItem['inStockQuantity'] < 0 || !dataItem['storeId']) {
      //       continue;
      //     }
      //     await this.productStoreRepo.create({
      //       store_location_id: dataItem['storeId'],
      //       product_id: product.product_id,
      //       amount: dataItem['inStockQuantity'],
      //     });
      //   }
      // }
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

  async getBySlug(slug) {
    let product = await this.productRepo.findOne({
      select: productDetailSelector,
      join: { [JoinTable.leftJoin]: productFullJoiner },
      where: { [`${Table.PRODUCTS}.slug`]: slug.trim() },
    });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    this.productRepo.update(
      { product_id: product.product_id },
      { view_count: product.view_count + 1 },
    );

    if (product['product_function'] == 2) {
      let parentProduct = await this.productRepo.findOne({
        select: productDetailSelector,
        join: { [JoinTable.leftJoin]: productFullJoiner },
        where: {
          [`${Table.PRODUCTS}.product_appcore_id`]:
            product['parent_product_appcore_id'],
        },
      });
      if (parentProduct) {
        product = parentProduct;
      }
    }

    let result: any = { ...product };

    if (result['product_function'] >= 4) {
      result['productType'] = 4;
      result['prodyctTypeName'] = 'Sản phẩm độc lập';
    }

    if (result['product_function'] == 3) {
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
            select: productDetailSelector,
            join: { [JoinTable.leftJoin]: productFullJoiner },
            where: {
              [`${Table.PRODUCTS}.product_id`]: productComboItem.product_id,
            },
          });

          if (productComboItem.product_id == group.product_root_id) {
            result['configurableProduct'] = productCombo;
          } else {
            result['comboItems'] = result['comboItems']
              ? [...result['comboItems'], productCombo]
              : [productCombo];
          }
        }
      }

      result['productType'] = 3;
      result['prodyctTypeName'] = 'Sản phẩm combo';
    }

    if (result['product_function'] == 1) {
      result['children_products'] = await this.getChildrenProducts(
        result['product_appcore_id'],
        1,
      );

      let group = await this.productVariationGroupRepo.findOne({
        product_root_id: result.product_id,
      });

      result['relevantProducts'] = [];

      if (group) {
        // Find relevant products
        if (group.index_id) {
          let relevantGroups = await this.productVariationGroupRepo.find({
            select: '*',
            where: {
              index_id: group.index_id,
            },
          });

          if (relevantGroups.length) {
            for (let relevantGroupItem of relevantGroups) {
              if (relevantGroupItem.product_root_id) {
                let productRoot = await this.productRepo.findOne({
                  select: [
                    ...getDetailProductsListSelectorFE,
                    `${Table.PRODUCT_VARIATION_GROUPS}.index_id`,
                    `${Table.PRODUCT_VARIATION_GROUPS}.group_name`,
                  ],
                  join: productGroupJoiner,
                  where: {
                    [`${Table.PRODUCTS}.product_id`]:
                      relevantGroupItem.product_root_id,
                  },
                });

                if (productRoot) {
                  result['relevantProducts'] = [
                    ...result['relevantProducts'],
                    productRoot,
                  ];
                }
              }
            }
          }
        }
      }
    }

    // Get stores
    result['stores'] = await this.getProductsStores(result.product_id);

    // get Image
    result['images'] = await this.getProductImages(result.product_id);

    //Get Features
    result['productFeatures'] = await this.getProductFeatures(
      result.product_id,
    );

    // Get accessory
    result['promotion_accessory_products'] = [];
    if (result['promotion_accessory_id']) {
      result['promotion_accessory_products'] =
        await this.getAccessoriesByProductId(
          result['promotion_accessory_id'],
          1,
        );
    }

    result['free_accessory_products'] = [];
    if (result['free_accessory_id']) {
      result['free_accessory_products'] = await this.getAccessoriesByProductId(
        result['free_accessory_id'],
        1,
      );
    }

    result['warranty_package_products'] = [];
    if (result['warranty_package_id']) {
      result['warranty_package_products'] =
        await this.getAccessoriesByProductId(result['warranty_package_id'], 1);
    }

    //Get ratings
    result['ratings'] = await this.reviewRepo.findOne({
      product_id: result.product_id,
    });

    // Get Current category info
    if (product['category_id']) {
      result['currentCategory'] = await this.categoryRepo.findOne({
        select: '*',
        join: categoryJoiner,
        where: { [`${Table.CATEGORIES}.category_id`]: product['category_id'] },
      });
      // Get parent categories info
      result['parentCategories'] = await this.categoryService.parentCategories(
        result['currentCategory'],
      );
      result['parentCategories'] = _.sortBy(result['parentCategories'], [
        (o) => o.level,
      ]);

      // Get relative products
      result['relative_prouducts'] = await this.getRelativeProductsByCategory(
        product,
      );
    }

    return result;
  }

  async getChildrenProducts(product_appcore_id, role = 0) {
    const childrenProducts = await this.productRepo.find({
      select: productDetailSelector,
      join: { [JoinTable.leftJoin]: productFullJoiner },
      where: {
        [`${Table.PRODUCTS}.parent_product_appcore_id`]: product_appcore_id,
      },
    });

    if (childrenProducts.length) {
      for (let childProduct of childrenProducts) {
        // Get Features
        childProduct['productFeatures'] = await this.getProductFeatures(
          childProduct.product_id,
        );
        // Get stores
        childProduct['stores'] = await this.getProductsStores(
          childProduct.product_id,
        );
        // Get accessory
        childProduct['promotion_accessory_products'];
        if (childProduct['promotion_accessory_id']) {
          childProduct['promotion_accessory_products'] =
            await this.getAccessoriesByProductId(
              childProduct['promotion_accessory_id'],
              role,
            );
        }

        childProduct['free_accessory_products'] = [];
        if (childProduct['free_accessory_id']) {
          childProduct['free_accessory_products'] =
            await this.getAccessoriesByProductId(
              childProduct['free_accessory_id'],
              role,
            );
        }

        childProduct['warranty_package_products'] = [];
        if (childProduct['warranty_package_id']) {
          childProduct['warranty_package_products'] =
            await this.getAccessoriesByProductId(
              childProduct['warranty_package_id'],
              role,
            );
        }
      }
    }

    return childrenProducts;
  }

  async getProductImages(product_id) {
    let result = [];
    const imageLinks = await this.imageLinkRepo.find({
      where: { object_id: product_id, object_type: ImageObjectType.PRODUCT },
    });
    if (imageLinks.length) {
      for (let imageLinkItem of imageLinks) {
        let image = await this.imageRepo.findOne({
          image_id: imageLinkItem.image_id,
        });
        result = [...result, { ...imageLinkItem, ...image }];
      }
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
    const productsStores = await this.productStoreRepo.find({
      select: '*',
      orderBy: [{ field: 'amount', sortBy: SortBy.DESC }],
      where: { product_id: id, amount: MoreThan(0) },
    });
    let result = [];
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
              productStoreItem['store_location_id'],
          },
        });
        let storeObj = {
          productId: id,
          storeId: store['store_location_id'],
          storeName: store['store_name'],
          storeAddress: store['pickup_address'],
          storeLatitude: store['latitude'],
          storeLongitude: store['longitude'],
        };
        result = [...result, { ...productStoreItem, ...storeObj }];
      }
    }
    return result;
  }

  async checkProductsStores(id: string) {
    const product = await this.productRepo.findOne({ product_id: id });
    if (!product) {
      throw new HttpException(`Không tìm thấy SP có id : ${id}`, 404);
    }

    try {
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

      if (!response?.data?.data) {
        return [];
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
                  productStoreItem['store_location_id'],
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
    } catch (error) {
      return [];
    }
  }

  async getAccessoriesByProductId(accessory_id: number, source = 0) {
    // source = 0 : CMS, 1 : FE
    let condition: any = {
      [`${Table.PRODUCT_PROMOTION_ACCESSORY}.accessory_id`]: accessory_id,
    };
    console.log();
    if (source == 1) {
      condition = {
        ...condition,
        [`${Table.PROMOTION_ACCESSORY}.display_at`]: LessThan(
          formatStandardTimeStamp(new Date()),
        ),
        [`${Table.PROMOTION_ACCESSORY}.end_at`]: MoreThan(
          formatStandardTimeStamp(new Date()),
        ),
        [`${Table.PROMOTION_ACCESSORY}.accessory_status`]: 'A',
        [`${Table.PRODUCT_PROMOTION_ACCESSORY}.status`]: 'A',
      };
    }
    return this.productPromoAccessoryRepo.find({
      select: '*',
      join: productPromotionAccessoriesJoiner,
      where: condition,
    });
  }

  async getFirstChildProduct(product_id) {
    return this.productRepo.findOne({
      select: '*',
      join: productLeftJoiner,
      where: { parent_product_id: product_id },
    });
  }

  async importProducts() {
    this.clearAll();
    const totalProducts = 17643;
    const limit = 30;
    let currentPage = 30;
    let destPage = Math.ceil(totalProducts / limit - currentPage) + 200;

    let headers = {
      Authorization: APPCORE_TOKEN,
    };

    try {
      for (let page = currentPage; page <= 1200; page++) {
        const res = await axios({
          url: GET_PRODUCTS_APPCORE_LIST(page, limit),
          headers,
        });

        if (!res?.data?.data?.list_product) {
          continue;
        }

        let listAppcoreProducts = res.data.data.list_product;
        if (listAppcoreProducts && listAppcoreProducts.length) {
          for (let productAppcoreItem of listAppcoreProducts) {
            let res = await axios({
              url: GET_PRODUCT_APPCORE_DETAIL(productAppcoreItem.id),
              headers,
            });
            let listAppcoreProductDetail = res.data.data;

            let cmsProductDetail = convertProductDataFromAppcore(
              listAppcoreProductDetail,
            );

            await this.itgCreate(cmsProductDetail);
          }
        }
      }
      this.syncProductsIntoGroup();
    } catch (error) {
      await fs.writeFile(
        'logs.txt',
        error.message || error?.response?.data?.message,
        (err) => {
          if (err) console.log(err);
          else {
            console.log('File written successfully\n');
            console.log('The written has the following contents:');
            console.log(fs.readFileSync('logs.txt', 'utf8'));
          }
        },
      );
    }
  }

  async reportCountTotalFromStores() {
    try {
      const response: any = await this.databaseService.executeQueryReadPool(
        sqlReportTotalProductAmountFromStores,
      );
      if (!response[0]) {
        return;
      }

      let result = response[0];
      for (let { product_id, total } of result) {
        await this.productRepo.update({ product_id }, { amount: total });
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }

  async reportTotalProductsInStores() {
    try {
      const response: any = await this.databaseService.executeQueryReadPool(
        sqlReportTotalProductAmountInStores,
      );
      if (!response[0]) {
        return [];
      }

      for (let storeItem of response[0]) {
        if (storeItem['store_location_id']) {
          await this.storeRepo.update(
            { store_location_id: storeItem['store_location_id'] },
            { product_count: storeItem['total'] },
          );
        }
      }
    } catch (error) {
      console.log(error);
      throw new HttpException(
        error.response.data.message,
        error.response.status,
      );
    }
  }

  async reportCountTotalFromCategories() {
    const categoriesList = await this.categoryRepo.find();
    for (let { category_id } of categoriesList) {
      let childrenCategories = await this.categoryService.childrenCategories(
        category_id,
      );

      let categories = [
        ...new Set([
          category_id,
          ...childrenCategories.map(({ category_id }) => category_id),
        ]),
      ];
      if (!categories.length) {
        continue;
      }

      const response = await this.databaseService.executeQueryReadPool(
        sqlReportTotalProductsInCategories(categories),
      );
      const total = await response[0][0].total;
      await this.categoryRepo.update({ category_id }, { product_count: total });
    }
  }

  async testGetById(product_id) {
    return this.testGetProductDetails(product_id);
  }

  async testSql(files) {
    // let config: any = {
    //   method: 'get',
    //   url: "https://ddvcmsdev.ntlogistics.vn/products",
    // };

    // try {
    //   const response = await axios(config);
    //   const data = { error_code: response.status, method: response.config.method, source_url: response.config.url }
    //   const logData = {
    //     ...new LogEntity(),
    //     ...this.logRepo.setData(data),
    //   };
    //   console.log(logData);
    //   const newLog = await this.logRepo.create(logData);
    // } catch (error) {
    //   console.log(error);
    // }
    let cryptography = new Cryptography();
    const encryptedData = cryptography.encrypt('This is a secret message');
    console.log(encryptedData);
    let c1 = new Cryptography();
    let decryptedData = c1.decrypt(encryptedData);
    console.log(decryptedData);
    // var hw = cryptography.encrypt('30512');
    // console.log(hw);
    // let cryptography1 = new Cryptography();

    // console.log(cryptography1.decrypt(hw));
    // const slug = convertToSlug('Lynk Lee - Ngày ấy bạn và tôi (Official MV)');
    // await this.productRepo.findOne({
    //   select: '*',
    //   join: productLeftJoiner,
    //   where: [
    //     {
    //       $or: [
    //         { [`${Table.PRODUCT_PRICES}.price`]: MoreThan(0) },
    //         { [`${Table.PRODUCT_PRICES}.barcode`]: 'JKJLS782136HK' },
    //         { [`${Table.PRODUCTS}.amount`]: MoreThan(0) },
    //         {
    //           [`${Table.PRODUCTS_CATEGORIES}.category_id`]: In([
    //             1, 2, 3, 4, 5, 6, 7,
    //           ]),
    //         },
    //       ],
    //     },
    //     {
    //       $and: [
    //         {
    //           $or: {
    //             [`${Table.PRODUCT_PRICES}.price`]: MoreThan(0),
    //             [`${Table.PRODUCTS}.amount`]: MoreThan(0),
    //           },
    //           [`${Table.PRODUCTS_CATEGORIES}.category_id`]: In([
    //             1, 2, 3, 4, 5, 6, 7,
    //           ]),
    //         },
    //         { [`${Table.PRODUCT_PRICES}.price`]: MoreThan(0) },
    //       ],
    //     },
    //   ],
    // });
  }

  async autoFillPriceIntoConfigurableProducts() {
    const configurableProductsList = await this.productRepo.find({
      select: '*',
      join: productPriceJoiner,
      where: { [`${Table.PRODUCTS}.product_function`]: 1 },
    });
    if (configurableProductsList.length) {
      for (let configProductItem of configurableProductsList) {
        if (configProductItem['price'] == 0 || !configProductItem['price']) {
          let childProduct = await this.getFirstChildProduct(
            configProductItem['product_id'],
          );
          let childProductPrice = this.productPriceRepo.setData(childProduct);
          await this.productPriceRepo.update(
            { product_id: configProductItem['product_id'] },
            childProductPrice,
          );
        }
      }
    }
  }

  async determineProductFunction() {
    let productsList = await this.productRepo.find();
    for (let productItem of productsList) {
      let productFunction = this.determineProductType(productItem);

      await this.productRepo.update(
        { product_id: productItem.product_id },
        { product_function: productFunction },
      );
    }
  }

  async updateProductPrices() {
    let productsPrice = await this.productPriceRepo.find();
    for (let productItem of productsPrice) {
      if (
        +productItem.price > 0 &&
        +productItem.list_price > 0 &&
        +productItem.list_price > +productItem.price
      ) {
        await this.productPriceRepo.update(
          { product_id: productItem['product_id'] },
          {
            percentage_discount:
              (1 - +productItem.price / +productItem.list_price) * 100,
          },
        );
      }
    }
  }

  async createReviewComment(data, product_id: number, type, userIp) {
    return this.reviewCommentService.createReviewComment(
      data,
      product_id,
      type,
      userIp,
    );
  }

  async getReviewsCommentsListWebsite(product_id: number, params, type) {
    return this.reviewCommentService.getReviewsCommentsListWebsite(
      product_id,
      params,
      type,
    );
  }

  async getReviewsListCMS(params, type) {
    let { product_id, search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);
    let filterConditions: object = {};

    if (type) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.type`] = type;
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.parent_item_id`] =
        IsNull();
    }

    if (product_id) {
      filterConditions[`${Table.REVIEW_COMMENT_ITEMS}.product_id`] = product_id;
    }

    const reviews = await this.reviewCommentItemsRepo.find({
      select: '*',
      where: reviewCommentItemsSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.reviewCommentItemsRepo.find({
      select: `COUNT(product_id) as total`,
      where: reviewCommentItemsSearchFilter(search, filterConditions),
    });

    if (reviews.length) {
      for (let reviewItem of reviews) {
        reviewItem['images'] = [];
        const images = await this.imageLinkRepo.find({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: reviewItem.item_id,
        });
        if (images.length) {
          for (let imageItem of images) {
            const imageLink = await this.imageRepo.findOne({
              image_id: imageItem.image_id,
            });
            reviewItem['images'].push(imageLink);
          }
        }
      }
    }

    if (type == 1) {
      const reviewSummary = reviews.length
        ? await this.reviewRepo.find({
            product_id: In(reviews.map(({ product_id }) => product_id)),
          })
        : null;
      return {
        paging: {
          currentPage: page,
          pageSize: limit,
          total: count[0].total,
        },
        items: reviews,
        summary: reviewSummary,
      };
    }
    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      items: reviews,
    };
  }

  async getCommentReviewResponse(item_id: number) {
    let responseReviews = await this.reviewCommentItemsRepo.find({
      parent_item_id: item_id,
    });
    if (responseReviews.length) {
      for (let responseReview of responseReviews) {
        responseReview['images'] = [];
        const images = await this.imageLinkRepo.find({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: responseReview.item_id,
        });

        if (images.length) {
          for (let imageItem of images) {
            const imageLink = await this.imageRepo.findOne({
              image_id: imageItem.image_id,
            });
            responseReview['images'].push(imageLink);
          }
        }
      }
    }

    return responseReviews;
  }

  async getCommentsReviewsList(params) {
    return this.reviewCommentService.getCommentsReviewsList(params);
  }

  async updateReviewComment(item_id, data) {
    const reviewCommentItem = await this.reviewCommentItemsRepo.findOne({
      item_id,
    });
    if (!reviewCommentItem) {
      throw new HttpException(`Không tìm thấy đánh giá/ bình luận`, 404);
    }
    const updateReviewComment = {
      ...this.reviewCommentItemsRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };
    if (Object.entries(updateReviewComment).length) {
      await this.reviewCommentItemsRepo.update(
        { item_id },
        updateReviewComment,
      );
    }

    if (data.images && data.images.length) {
      let oldImages = await this.imageLinkRepo.find({
        object_type: ImageObjectType.COMMENT_REVIEWS,
        object_id: item_id,
      });
      if (oldImages.length) {
        await this.imageLinkRepo.delete({
          object_type: ImageObjectType.COMMENT_REVIEWS,
          object_id: item_id,
        });
        for (let oldImage of oldImages) {
          if (oldImage.image_id) {
            await this.imageRepo.delete({ image_id: oldImage.image_id });
          }
        }
      }

      for (let image of data.images) {
        let newImage = await this.imageRepo.create({ image_path: image });
        if (newImage) {
          await this.imageLinkRepo.create({
            object_id: item_id,
            object_type: ImageObjectType.COMMENT_REVIEWS,
            image_id: newImage.image_id,
          });
        }
      }
    }
  }

  async createReviewCommentCMS(
    data: CreateCommentReviewCMSDto,
    product_id,
    user,
  ) {
    let email = user.email;
    let phone = user.phone;
    let fullname = `${user?.firstname || ''} ${user?.lastname || ''}`.trim();

    let reviewItemData = {
      ...new ReviewCommentItemsEntity(),
      ...this.reviewCommentItemsRepo.setData(data),
      product_id,
      email: email || null,
      phone,
      fullname,
      user_id: user.user_id,
      type: data.type,
    };

    const reviewComment = await this.reviewCommentItemsRepo.create(
      reviewItemData,
    );

    if (data?.images && data?.images?.length) {
      for (let imageItem of data.images) {
        const image = await this.imageRepo.create({ image_path: imageItem });
        if (image) {
          await this.imageLinkRepo.create({
            object_type: ImageObjectType.COMMENT_REVIEWS,
            object_id: reviewComment.item_id,
            image_id: image.image_id,
          });
        }
      }
    }
  }
}
