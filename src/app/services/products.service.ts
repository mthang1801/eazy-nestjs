import { Injectable, HttpException } from '@nestjs/common';
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
import { convertToMySQLDateTime } from 'src/utils/helper';
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
  productByCategoryJoiner,
  productFamilyJoiner,
  productFeaturesByCategory,
  productFeaturesJoiner,
  productFullJoiner,
  productJoiner,
} from 'src/utils/joinTable';
import {
  productsFamilyFilterConditioner,
  productsGroupFilterConditioner,
} from 'src/utils/tableConditioner';
import { In, Like, Not } from 'src/database/find-options/operators';
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
import { ImageObjectType } from 'src/database/enums/tableFieldEnum/imageTypes.enum';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { Equal, IsNull } from '../../database/find-options/operators';
import { v4 as uuid } from 'uuid';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import { convertToSlug, MaxLimit } from '../../utils/helper';
import { UpdateImageDto } from '../dto/product/update-productImage.dto';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';
import { productsData } from 'src/database/constant/product';
import { comboData } from 'src/database/constant/combo';
import * as fs from 'fs/promises';
import { productGroupJoiner } from '../../utils/joinTable';

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
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
  ) {}

  async syncProductsIntoGroup(): Promise<void> {
    //===========Product group, product group product =============

    // Lấy danh sách các sản phẩm cha (bao gồm SP cấu hình, ngoài trự sản phẩm service product_code =4)
    let parentProductsList = await this.productRepo.find({
      select: ['*'],
      where: { [`${Table.PRODUCTS}.parent_product_id`]: IsNull() },
    });

    parentProductsList = parentProductsList.filter(
      ({ product_type }) => product_type != 4,
    );

    // Kiểm tra xem các parent này đã tạo group hay chưa, nếu đã tạo rồi thì bỏ qua, nếu chưa thì sẽ tạo mới
    for (let parentProductItem of parentProductsList) {
      const productGroup = await this.productVariationGroupRepo.findOne({
        product_root_id: parentProductItem.product_id,
      });
      if (!productGroup) {
        const newProductGroup = await this.productVariationGroupRepo.create({
          code: uuid().replace(/-/g, ''),
          product_root_id: parentProductItem.product_id,
          created_at: convertToMySQLDateTime(),
          updated_at: convertToMySQLDateTime(),
        });
        await this.productVariationGroupProductsRepo.createSync({
          product_id: parentProductItem.product_id,
          parent_product_id: parentProductItem.parent_product_id,
          group_id: newProductGroup.group_id,
        });
      }
    }

    // Tìm ds các SP con, sau đó tim group chứa SP cha, kiểm tra SP con đã chứa trong đó hay chưa, nếu chưa thì thêm vào
    const childrenProductsList = await this.productRepo.find({
      select: ['*'],
      where: { [`${Table.PRODUCTS}.parent_product_id`]: Not(IsNull()) },
    });
    for (let childProduct of childrenProductsList) {
      // Kiểm tra nhóm của parent product đã tồn tại hay chưa, nếu tồn tại rồi thì đưa vào trong, nếu chưa thì bỏ qua
      const parentProductGroup = await this.productVariationGroupRepo.findOne({
        product_root_id: childProduct.parent_product_id,
      });
      if (parentProductGroup) {
        // Kiểm tra SP con đã nằm trong group product của SP cha hay chưa, nếu chưa thì thêm, nếu có bỏ qua
        const childProductGroupProduct =
          await this.productVariationGroupProductsRepo.findOne({
            group_id: parentProductGroup.group_id,
            product_id: childProduct.product_id,
          });
        if (!childProductGroupProduct) {
          await this.productVariationGroupProductsRepo.createSync({
            group_id: parentProductGroup.group_id,
            parent_product_id: childProduct.parent_product_id,
            product_id: childProduct.product_id,
          });
        }
      }
    }

    //============ Product group features =============
    // Đồng bộ thuộc tính SP
    // Lấy Danh sách các group -> group products -> lấy danh sách các SP trong group -> Lấy danh sách các feature trong product feature values
    let groupLists = await this.productVariationGroupRepo.find({
      select: ['group_id'],
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

  async get(identifier: number | string): Promise<any> {
    // get Product item
    let product = await this.productRepo.findOne({
      select: [
        `DISTINCT(${Table.PRODUCTS}.product_id)`,
        `${Table.PRODUCTS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.parent_product_id`,
        `${Table.PRODUCT_PRICES}.*`,
        `${Table.PRODUCTS_CATEGORIES}.category_id`,
      ],
      join: { [JoinTable.leftJoin]: productFullJoiner },
      where: [
        { [`${Table.PRODUCTS}.product_id`]: identifier },
        { [`${Table.PRODUCTS}.product_code`]: identifier },
      ],
    });

    if (!product) {
      throw new HttpException('Sản phẩm không tồn tại', 404);
    }
    // get features of product
    const productFeatures = await this.productFeatureValueRepo.find({
      select: ['*'],
      join: { [JoinTable.leftJoin]: productFeaturesJoiner },
      where: {
        [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: product.product_id,
      },
    });

    product['features'] = productFeatures;

    // filter condition base on family

    const productsFamily = await this.productRepo.find({
      select: [`DISTINCT(${Table.PRODUCTS}.product_id)`, `${Table.PRODUCTS}.*`],
      join: productFullJoiner,
      where: productsFamilyFilterConditioner(product),
    });

    if (productsFamily.length) {
      for (let productItem of productsFamily) {
        const productFeatures = await this.productFeatureValueRepo.find({
          select: ['*'],
          join: { [JoinTable.leftJoin]: productFeaturesJoiner },
          where: {
            [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]:
              productItem.product_id,
          },
        });
        productItem['features'] = productFeatures;
      }
    }

    product['products_family'] = productsFamily.filter(
      (productsFamilyItem) =>
        productsFamilyItem.product_id !== product.product_id,
    );

    if (product.group_id) {
      const productsGroup = await this.productRepo.find({
        select: [
          `DISTINCT(${Table.PRODUCTS}.product_id)`,
          `${Table.PRODUCTS}.*`,
        ],
        join: { [JoinTable.leftJoin]: productFullJoiner },
        where: productsGroupFilterConditioner(product),
      });

      product['products_group'] = productsGroup;
    }

    // get images
    const productImages = await this.imageLinkRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.IMAGE]: {
            fieldJoin: `${Table.IMAGE}.image_id`,
            rootJoin: `${Table.IMAGE_LINK}.image_id`,
          },
        },
      },
      where: {
        object_id: product.product_id,
        object_type: ImageObjectType.PRODUCT,
      },
    });

    product['images'] = productImages;

    let listBreadCrums = [];
    // Get categories breadcrum
    const categoryByProduct = await this.categoryRepo.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.CATEGORY_DESCRIPTIONS]: {
            fieldJoin: 'category_id',
            rootJoin: 'category_id',
          },
        },
      },
      where: { [`${Table.CATEGORIES}.category_id`]: product.category_id },
    });

    if (categoryByProduct) {
      if (categoryByProduct.id_path) {
        for (let categoryId of categoryByProduct.id_path.split('/').reverse()) {
          const _categoryByProduct = await this.categoryRepo.findOne({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: {
                [Table.CATEGORY_DESCRIPTIONS]: {
                  fieldJoin: 'category_id',
                  rootJoin: 'category_id',
                },
              },
            },
            where: { [`${Table.CATEGORIES}.category_id`]: categoryId },
          });
          listBreadCrums = [_categoryByProduct, ...listBreadCrums];
        }
      }
    }
    listBreadCrums = [...listBreadCrums, categoryByProduct];

    return { ...product, breadCrum: listBreadCrums };
  }

  async getList(params: any): Promise<any> {
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let products = [];
    let count;
    let filterCondition = {};
    let isContinued = true;

    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productDescriptionsRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCT_DESCRIPTION}.${key}`] = Like(val);
        }
        if (this.productRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCTS}.${key}`] = Like(val);
        }
      }

      for (let [key, val] of Object.entries(others)) {
        const getFeatureByKey = await this.productFeaturesRepo.findOne({
          feature_code: key,
        });

        const getVariantByVal = await this.productFeatureValueRepo.findOne({
          value: val,
        });

        if (!getFeatureByKey || !getVariantByVal) continue;

        isContinued = false;

        count = await this.productRepo.find({
          select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: search
            ? [
                {
                  ...filterCondition,
                  [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                    getFeatureByKey.feature_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                    getVariantByVal.variant_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                    (productItem) => productItem.product_id,
                  ),
                  [`${Table.PRODUCTS}.parent_product_id`]: 0,
                  [`${Table.PRODUCTS}.product_code`]: Like(search),
                },
                {
                  ...filterCondition,
                  [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                    getFeatureByKey.feature_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                    getVariantByVal.variant_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                    (productItem) => productItem.product_id,
                  ),
                  [`${Table.PRODUCTS}.parent_product_id`]: 0,
                  [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search),
                },
              ]
            : {
                ...filterCondition,
                [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                  getFeatureByKey.feature_id,
                [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                  getVariantByVal.variant_id,
                [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                  (productItem) => productItem.product_id,
                ),
                [`${Table.PRODUCTS}.parent_product_id`]: 0,
              },
        });

        products = await this.productRepo.find({
          select: [
            `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
          ],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: search
            ? [
                {
                  ...filterCondition,
                  [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                    getFeatureByKey.feature_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                    getVariantByVal.variant_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                    (productItem) => productItem.product_id,
                  ),
                  [`${Table.PRODUCTS}.parent_product_id`]: 0,
                  [`${Table.PRODUCTS}.product_code`]: Like(search),
                },
                {
                  ...filterCondition,
                  [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                    getFeatureByKey.feature_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                    getVariantByVal.variant_id,
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                    (productItem) => productItem.product_id,
                  ),
                  [`${Table.PRODUCTS}.parent_product_id`]: 0,
                  [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search),
                },
              ]
            : {
                ...filterCondition,
                [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
                  getFeatureByKey.feature_id,
                [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
                  getVariantByVal.variant_id,
                [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
                  (productItem) => productItem.product_id,
                ),
                [`${Table.PRODUCTS}.parent_product_id`]: 0,
              },
          orderBy: [
            { field: `${Table.PRODUCTS}.created_at`, sortBy: SortBy.DESC },
          ],
          skip,
          limit,
        });
      }

      if (!isContinued) {
        // get a representative image
        for (let productItem of products) {
          const image = await this.imageLinkRepo.findOne({
            select: ['*'],
            join: {
              [JoinTable.leftJoin]: {
                [Table.IMAGE]: {
                  fieldJoin: `${Table.IMAGE}.image_id`,
                  rootJoin: `${Table.IMAGE_LINK}.image_id`,
                },
              },
            },
            where: {
              object_id: productItem.product_id,
              object_type: ImageObjectType.PRODUCT,
              position: 0,
            },
          });
          productItem['image'] = image;
        }

        return {
          products,
          paging: {
            currentPage: page,
            pageSize: limit,
            total: count ? count[0].total : 0,
          },
        };
      }
    }

    count = await this.productRepo.find({
      select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
      join: {
        [JoinTable.leftJoin]: productJoiner,
      },
      where: search
        ? [
            {
              ...filterCondition,
              [`${Table.PRODUCTS}.parent_product_id`]: 0,
              [`${Table.PRODUCTS}.product_code`]: Like(search),
            },
            {
              ...filterCondition,
              [`${Table.PRODUCTS}.parent_product_id`]: 0,
              [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search),
            },
          ]
        : {
            ...filterCondition,
            [`${Table.PRODUCTS}.parent_product_id`]: 0,
          },
    });

    products = await this.productRepo.find({
      select: [
        `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
      ],
      join: {
        [JoinTable.leftJoin]: productJoiner,
      },
      orderBy: [{ field: `${Table.PRODUCTS}.created_at`, sortBy: SortBy.DESC }],
      where: search
        ? [
            {
              ...filterCondition,
              [`${Table.PRODUCTS}.parent_product_id`]: 0,
              [`${Table.PRODUCTS}.product_code`]: Like(search),
            },
            {
              ...filterCondition,
              [`${Table.PRODUCTS}.parent_product_id`]: 0,
              [`${Table.PRODUCT_DESCRIPTION}.product`]: Like(search),
            },
          ]
        : {
            ...filterCondition,
            [`${Table.PRODUCTS}.parent_product_id`]: 0,
          },
      skip,
      limit,
    });

    for (let productItem of products) {
      // get a representative image
      const image = await this.imageLinkRepo.findOne({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.IMAGE]: {
              fieldJoin: `${Table.IMAGE}.image_id`,
              rootJoin: `${Table.IMAGE_LINK}.image_id`,
            },
          },
        },
        where: {
          object_id: productItem.product_id,
          object_type: ImageObjectType.PRODUCT,
          position: 0,
        },
      });
      productItem['image'] = image;
    }

    return {
      products,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count ? count[0].total : 0,
      },
    };
  }

  async childrenCategories(categoryId, categoriesList = []) {
    let categories = await this.categoryRepo.find({
      select: [`${Table.CATEGORIES}.category_id`, 'level', 'category', 'slug'],
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
      select: ['*'],
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
    limit = +limit || 5;
    let skip = (page - 1) * limit;

    let filterConditions = {};
    if (Object.entries(others).length) {
      // Tạo filter, ứng với others, với mỗi key tương ứng product feature, val tương ứng feature variant
      for (let [key, val] of Object.entries(others)) {
        let productFeature = await this.productFeaturesRepo.findOne({
          feature_code: key,
        });
        if (!productFeature) continue;
        let productFeatureVariant =
          await this.productFeatureVariantRepo.findOne({
            feature_id: productFeature.feature_id,
            variant_code: val,
          });
        if (!productFeatureVariant) continue;

        filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`] =
          filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`]
            ? [
                ...filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`],
                productFeature.feature_id,
              ]
            : [productFeature.feature_id];
        filterConditions[`${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`] =
          filterConditions[`${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`]
            ? [
                ...filterConditions[
                  `${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`
                ],
                productFeatureVariant.variant_id,
              ]
            : [productFeatureVariant.variant_id];
      }
    }

    let productsList = [];
    let count;
    console.log(filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`]);
    if (
      filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`] &&
      filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`].length
    ) {
      for (
        let i = 0;
        i < filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`].length;
        i++
      ) {
        let featureId =
          filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`][i];
        let variantId =
          filterConditions[`${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`][i];

        count = await this.productVariationGroupRepo.find({
          select: [
            `COUNT(DISTINCT(${Table.PRODUCT_VARIATION_GROUPS}.product_root_id)) as total`,
          ],
          join: {
            [JoinTable.rightJoin]: productGroupJoiner,
          },
          where: {
            [`${Table.PRODUCT_VARIATION_GROUP_FEATURES}.feature_id`]: featureId,
            [`${Table.PRODUCT_VARIATION_GROUP_FEATURES}.variant_id`]: variantId,
            [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesList.map(
              (categoryId) => categoryId,
            ),
            [`${Table.PRODUCTS}.product_id`]: productsList.map(
              ({ product_id }) => product_id,
            ),
            [`${Table.PRODUCT_VARIATION_GROUPS}.status`]: 'A',
          },
        });

        productsList = await this.productVariationGroupRepo.find({
          select: [
            `DISTINCT(${Table.PRODUCT_VARIATION_GROUPS}.product_root_id)`,
            `${Table.PRODUCTS}.*`,
            `${Table.PRODUCT_DESCRIPTION}.*`,
          ],
          join: {
            [JoinTable.rightJoin]: productGroupJoiner,
          },
          where: {
            [`${Table.PRODUCT_VARIATION_GROUP_FEATURES}.feature_id`]: featureId,
            [`${Table.PRODUCT_VARIATION_GROUP_FEATURES}.variant_id`]: variantId,
            [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesList.map(
              (categoryId) => categoryId,
            ),
            [`${Table.PRODUCTS}.product_id`]: productsList.map(
              ({ product_id }) => product_id,
            ),
            [`${Table.PRODUCT_VARIATION_GROUPS}.status`]: 'A',
          },
          skip:
            i ===
            filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`].length - 1
              ? skip
              : 0,
          limit:
            i ===
            filterConditions[`${Table.PRODUCT_FEATURES}.feature_id`].length - 1
              ? limit
              : MaxLimit,
        });
        if (!productsList.length) {
          break;
        }
      }
    } else {
      count = await this.productVariationGroupRepo.find({
        select: [
          `COUNT(DISTINCT(${Table.PRODUCT_VARIATION_GROUPS}.product_root_id)) as total`,
        ],
        join: {
          [JoinTable.rightJoin]: productGroupJoiner,
        },
        where: {
          [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesList.map(
            (categoryId) => categoryId,
          ),
        },
        [`${Table.PRODUCTS}.product_id`]: productsList.map(
          ({ product_id }) => product_id,
        ),
        [`${Table.PRODUCT_VARIATION_GROUPS}.status`]: 'A',
      });

      productsList = await this.productVariationGroupRepo.find({
        select: [
          `DISTINCT(${Table.PRODUCT_VARIATION_GROUPS}.product_root_id)`,
          `${Table.PRODUCTS}.*`,
          `${Table.PRODUCT_DESCRIPTION}.*`,
        ],
        join: {
          [JoinTable.rightJoin]: productGroupJoiner,
        },
        where: {
          [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesList.map(
            (categoryId) => categoryId,
          ),
          [`${Table.PRODUCT_VARIATION_GROUPS}.status`]: 'A',
        },
        [`${Table.PRODUCTS}.product_id`]: productsList.map(
          ({ product_id }) => product_id,
        ),
        [`${Table.PRODUCT_VARIATION_GROUPS}.status`]: 'A',
        skip,
        limit,
      });
    }
    // get images
    for (let productItem of productsList) {
      productItem['image'] = null;
      const productImage = await this.imageLinkRepo.findOne({
        object_id: productItem.product_id,
        object_type: ImageObjectType.PRODUCT,
      });

      if (productImage) {
        let image = await this.imageRepo.findOne({
          image_id: productImage.image_id,
        });
        productItem['image'] = image;
      }
    }
    return {
      products: productsList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0]?.total,
      },
      childrenCategories: categoriesListByLevel,
    };
  }

  async getCategoriesListLevel2(categoryId: number): Promise<any> {
    return this.categoryRepo.find({
      select: ['category_id'],
      where: { parent_id: categoryId, level: 2 },
    });
  }

  async update(sku: string, data: UpdateProductDto) {
    // Filter Exception
    const currentProduct = await this.productRepo.findOne({
      product_code: sku,
    });

    if (!currentProduct) {
      throw new HttpException(`Không tìm thấy SP có sku ${sku}`, 404);
    }

    let result = { ...currentProduct };

    // Kiểm tra tính unique của SP : slug, sku
    if (data.product_code) {
      const product = await this.productRepo.findOne({
        product_code: data.product_code,
      });
      if (product) {
        throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
      }
    }

    if (data.slug && data.slug !== currentProduct.slug) {
      const product = await this.productRepo.findOne({
        slug: data.slug,
      });
      if (product.product_id !== currentProduct.slug) {
        throw new HttpException('Slug đã tồn tại', 409);
      }
    }

    // Update product
    // Nếu có parent_product_id, cần kiểm tra xem SP này là SP cha hay SP khác, nếu SP cha thì ko thể thêm parent_product_id
    let productData: any = this.productRepo.setData(data);

    if (data?.parent_product_id) {
      if (!result.parent_product_id) {
        const productGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: result.product_id,
        });

        if (productGroup) {
          // Kiểm tra xem SP hiện tại có phải là SP cha hay không, nếu là SP cha thì trong group products sẽ có ít nhất 1 SP con
          const productGroupProduct =
            await this.productVariationGroupProductsRepo.find({
              where: { group_id: productGroup.group_id },
            });

          if (productGroupProduct.length > 1) {
            delete productData['parent_product_id'];
          }
        }
      }
    }

    if (Object.entries(productData).length) {
      const updatedProduct = await this.productRepo.update(
        { product_id: result.product_id },
        productData,
      );
      result = { ...result, ...updatedProduct };
    }

    // Update product description
    const productDescData = this.productDescriptionsRepo.setData(data);
    if (Object.entries(productDescData).length) {
      const updatedProductDesc = await this.productDescriptionsRepo.update(
        { product_id: result.product_id },
        productData,
      );
      result = { ...result, ...updatedProductDesc };
    }

    // Update product price
    const productPriceData = this.productPriceRepo.setData(data);
    if (Object.entries(productPriceData).length) {
      const updatedProductPrice = await this.productPriceRepo.update(
        {
          product_id: result.product_id,
        },
        productPriceData,
      );
      result = { ...result, ...updatedProductPrice };
    }

    // Update product Sale
    const productSaleData = this.productSaleRepo.setData(data);
    if (Object.entries(productSaleData).length) {
      const updatedProductSale = await this.productSaleRepo.update(
        {
          product_id: result.product_id,
        },
        productSaleData,
      );
      result = { ...result, ...updatedProductSale };
    }

    // Update product category
    const productCategoryData = this.productCategoryRepo.setData(data);
    if (Object.entries(productCategoryData).length) {
      const updatedProductCategory = await this.productCategoryRepo.update(
        {
          product_id: result.product_id,
        },
        productCategoryData,
      );
      result = { ...result, ...updatedProductCategory };
    }

    // Kiểm tra SP này có phải là SP cha hay không, nếu là SP cha, kiểm tra tiếp SP con bên trong nó
    if (!result.parent_product_id) {
      if (data?.children_products?.length) {
        for (let productChildItem of data.children_products) {
          // Kiểm tra sự tồn tại của SP
          let productChild = await this.productRepo.findOne({
            product_code: productChildItem.product_code,
          });
          // Nếu SP chưa tồn tại, tạo mới SP này
          if (!productChild) {
            let productChildData = {
              ...new ProductsEntity(),
              ...this.productRepo.setData({ ...result, ...productChildItem }),
            };
            delete productChildData.product_id;
            const newProductChild = await this.productRepo.create({
              ...productChildData,
              created_at: convertToMySQLDateTime(),
              updated_at: convertToMySQLDateTime(),
            });

            productChild = { ...newProductChild };

            let productChilDescData = {
              ...new ProductDescriptionsEntity(),
              ...this.productDescriptionsRepo.setData({
                ...result,
                ...productChildItem,
              }),
            };
            const newProductChildDesc =
              await this.productDescriptionsRepo.create({
                ...productChilDescData,
                product_id: productChild.product_id,
              });

            productChild = { ...productChild, ...newProductChildDesc };

            let productChildPriceData = {
              ...new ProductPricesEntity(),
              ...this.productPriceRepo.setData({
                ...result,
                ...productChildItem,
              }),
            };

            const newProductChildPrice = await this.productPriceRepo.create({
              ...productChildPriceData,
              product_id: productChild.product_id,
            });

            productChild = { ...productChild, ...newProductChildPrice };

            let productChildSaleData = {
              ...new ProductSalesEntity(),
              ...this.productSaleRepo.setData({
                ...result,
                ...productChildItem,
              }),
            };

            const newProductSale = await this.productSaleRepo.create({
              ...productChildSaleData,
              product_id: productChild.product_id,
            });

            productChild = { ...productChild, ...newProductSale };

            let productChildCategoryData = {
              ...new ProductsCategoriesEntity(),
              ...this.productCategoryRepo.setData({
                ...result,
                ...productChildItem,
              }),
            };

            const newProductCategory = await this.productCategoryRepo.create({
              ...productChildCategoryData,
              product_id: productChild.product_id,
            });

            productChild = { ...productChild, ...newProductCategory };

            if (productChildItem?.product_features?.length) {
              for (let {
                feature_code,
                variant_code,
              } of productChildItem.product_features) {
                const productFeature = await this.productFeaturesRepo.findOne({
                  feature_code,
                });

                if (!productFeature) continue;

                const productFeatureVariant =
                  await this.productFeatureVariantRepo.findOne({
                    select: ['*'],
                    join: {
                      [JoinTable.innerJoin]: {
                        [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
                          fieldJoin: 'variant_id',
                          rootJoin: 'variant_id',
                        },
                      },
                    },
                    where: { variant_code },
                  });
                if (!productFeatureVariant) continue;

                await this.productFeatureValueRepo.createSync({
                  feature_code,
                  variant_code,
                  feature_id: productFeature.feature_id,
                  variant_id: productFeatureVariant.variant_id,
                  product_id: productChild.product_id,
                  value: isNaN(+productFeatureVariant?.variant * 1)
                    ? productFeatureVariant?.variant
                    : '',
                  value_int: !isNaN(+productFeatureVariant?.variant * 1)
                    ? +productFeatureVariant?.variant
                    : 0,
                });
              }
            }
          }

          // Kiểm tra group xem SP này đã ở trong đó hay chưa
          const productGroup = await this.productVariationGroupRepo.findOne({
            product_root_id: result.product_id,
          });
          if (productGroup) {
            const productChildExist =
              await this.productVariationGroupProductsRepo.findOne({
                group_id: productGroup.group_id,
                product_id: productChild.product_id,
              });
            if (!productChildExist) {
              await this.productVariationGroupProductsRepo.createSync({
                product_id: productChild.product_id,
                group_id: productGroup.group_id,
                parent_product_id: result.product_id,
              });

              const featuresList = await this.productFeatureValueRepo.find({
                select: ['feature_id'],
                where: { product_id: productChild.product_id },
              });
              if (featuresList.length) {
                for (let { feature_id } of featuresList) {
                  let productGroupFeatureExist =
                    await this.productVariationGroupFeatureRepo.findOne({
                      feature_id,
                      group_id: productGroup.group_id,
                    });
                  if (!productGroupFeatureExist) {
                    await this.productVariationGroupFeatureRepo.createSync({
                      feature_id,
                      group_id: productGroup.group_id,
                    });
                  }
                }
              }
            }
          }
        }
      }
    }

    // Khi update một SP, / Ngoại trừ SP service có product_type = 4, các SP khác đều có thể có SP con nên sẽ có 2 tình huống xảy ra.
    // 1: SP được update là SP cha -> có thể tạo thêm SP con (bao gồm SP phụ kiện), cập nhật SP con,
    // 2: SP được update là SP con -> chỉ có thể thay đổi tên,giá, thuộc tính của nó

    // TH xảy ra:
    //1: SP chưa có cha (parent_product_id == null ) -> đưa vào SP cha
    //2: SP đã có cha -> thay SP cha khác
    //3: SP là SP cha (parent_product_id == null ) -> ref đến SP cha khác để đưa tất cả SP gồm con của nó vào group của SP cha mới, có thể update các SP con

    if (data.parent_product_id) {
      // Nếu SP cha thì sẽ ko có parent product_id, ngược lại nếu SP là SP con hoặc SP độc lập thì cần thêm vào SP cha
      if (result.parent_product_id) {
        // Nếu là SP độc lập thì ban đầu sẽ ko có cha
        if (!currentProduct.parent_product_id) {
          // Thêm SP này vào group
          const productGroup = await this.productVariationGroupRepo.findOne({
            product_root_id: result.parent_product_id,
          });
          // Tìm thấy group_id nơi SP cha host, đưa id của SP này vào group product
          if (productGroup) {
            await this.productVariationGroupProductsRepo.createSync({
              group_id: productGroup.group_id,
              product_id: result.product_id,
              quantity: data.quantity || 1,
              parent_product_id: result.parent_product_id,
            });

            // Tìm feature của product và đưa vào group feature
            const featuresList = await this.productFeatureValueRepo.find({
              select: ['feature_id'],
              where: { product_id: result.product_id },
            });

            if (featuresList.length) {
              // Tìm features list đã có sẵn trong group, sau đó so sánh và lấy những features trong group chưa có
              let featuresListGroup =
                await this.productVariationGroupFeatureRepo.find({
                  select: ['feature_id'],
                  where: { group_id: productGroup.group_id },
                });

              for (let { feature_id } of featuresList) {
                const productFeatureGroupExist =
                  await this.productVariationGroupFeatureRepo.findOne({
                    feature_id,
                    group_id: productGroup.group_id,
                  });
                if (!productFeatureGroupExist) {
                  await this.productVariationGroupFeatureRepo.createSync({
                    feature_id,
                    group_id: productGroup.group_id,
                  });
                }
              }
            }
          }
        } else {
          // Nếu SP đã có cha, muốn chuyển sang SP cha khác cần update SP cha cũ

          // ==== Thay đổi group SP cũ ====
          // Remove sản phẩm con ra khỏi group, firstly, tìm nhóm mà SP cha đang host
          const oldGroup = await this.productVariationGroupRepo.findOne({
            product_root_id: currentProduct.parent_product_id,
          });
          if (oldGroup) {
            // Remove SP con ra khỏi group
            await this.productVariationGroupProductsRepo.delete({
              product_id: result.product_id,
            });
            // Remove thuộc tính của SP con
            const featuresList = await this.productFeatureValueRepo.find({
              select: ['feature_id'],
              where: { product_id: result.product_id },
            });

            for (let { feature_id } of featuresList) {
              const productFeatureGroupExist =
                await this.productVariationGroupFeatureRepo.findOne({
                  feature_id,
                  group_id: oldGroup.group_id,
                });
              if (productFeatureGroupExist) {
                await this.productVariationGroupFeatureRepo.delete({
                  group_id: oldGroup.group_id,
                  feature_id,
                });
              }
            }

            // Sau khi remove các feature_id của product con, cần phải duyệt lại các feature_id của các product còn lại trong group
            const productsListInGroup =
              await this.productVariationGroupProductsRepo.find({
                select: ['product_id'],
                where: { group_id: oldGroup.group_id },
              });
            for (let { product_id } of productsListInGroup) {
              const featuresList = await this.productFeatureValueRepo.find({
                select: ['feature_id'],
                where: { product_id },
              });
              for (let { feature_id } of featuresList) {
                let productFeatureInGroup =
                  await this.productVariationGroupFeatureRepo.findOne({
                    feature_id,
                    group_id: oldGroup.group_id,
                  });

                if (!productFeatureInGroup) {
                  await this.productVariationGroupFeatureRepo.createSync({
                    group_id: oldGroup.group_id,
                    feature_id,
                  });
                }
              }
            }
          }

          // ==== Thay đổi group SP mới ====
          const newGroup = await this.productVariationGroupRepo.findOne({
            product_root_id: result.parent_product_id,
          });
          if (newGroup) {
            // Thêm sp vào group SP cha
            // Trước tiên cần kiểm tra sự tồn tại của SP trong group
            let productGroup =
              await this.productVariationGroupProductsRepo.findOne({
                parent_product_id: result.parent_product_id,
                product_id: result.product_id,
                group_id: newGroup.group_id,
              });

            if (!productGroup) {
              await this.productVariationGroupProductsRepo.createSync({
                parent_product_id: result.parent_product_id,
                product_id: result.product_id,
                group_id: newGroup.group_id,
              });

              // Kiểm tra features group xem feature_id của SP hiện tại đã có chưa
              const featuresList = await this.productFeatureValueRepo.find({
                select: ['feature_id'],
                product_id: result.product_id,
              });

              for (let { feature_id } of featuresList) {
                const productFeatureGroupExist =
                  await this.productVariationGroupFeatureRepo.findOne({
                    feature_id,
                    group_id: newGroup.group_id,
                  });
                if (!productFeatureGroupExist) {
                  await this.productVariationGroupFeatureRepo.createSync({
                    feature_id,
                    group_id: newGroup.group_id,
                  });
                }
              }
            }
          }
        }
      } else {
        // TH Sp cha muốn join vào group của SP cha khác
        const currentGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: result.product_id,
        });
        const newGroup = await this.productVariationGroupRepo.findOne({
          product_root_id: data.parent_product_id,
        });
        if (currentGroup && newGroup) {
          // Lấy tất cả các SP trong group
          const currentProductsList =
            await this.productVariationGroupProductsRepo.find({
              select: ['product_id'],
              where: { group_id: currentGroup.group_id },
            });
          // Move tất cả các SP trên vào group mới
          if (currentProductsList.length) {
            for (let { product_id } of currentProductsList) {
              const checkGroupProductExist =
                await this.productVariationGroupProductsRepo.findOne({
                  product_id,
                  group_id: newGroup.group_id,
                });
              if (!checkGroupProductExist) {
                await this.productVariationGroupProductsRepo.createSync({
                  product_id,
                  group_id: newGroup.group_id,
                  parent_product_id: data.parent_product_id,
                });
              }
            }
          }
          // Update lại thuộc group tính SP
          const newProductsList =
            await this.productVariationGroupProductsRepo.find({
              select: ['product_id'],
              where: { group_id: newGroup.group_id },
            });
          if (newProductsList.length) {
            let featuresList = await this.productFeatureValueRepo.find({
              select: ['feature_id'],
              where: [
                newProductsList.map(({ product_id }) => ({
                  [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: product_id,
                })),
              ],
            });

            for (let { feature_id } of featuresList) {
              const featureGroupExist =
                await this.productVariationGroupFeatureRepo.findOne({
                  feature_id,
                  group_id: newGroup.group_id,
                });
              if (!featureGroupExist) {
                await this.productVariationGroupFeatureRepo.createSync({
                  feature_id,
                  group_id: newGroup.group_id,
                });
              }
            }
          }
        }
      }
    }

    return result;
  }

  async updateImage(sku: string, data: UpdateImageDto): Promise<any> {
    const currentProduct = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCTS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.CATEGORY_DESCRIPTIONS}.* `,
      ],
      join: { [JoinTable.leftJoin]: productFullJoiner },
      where: {
        [`${Table.PRODUCTS}.product_code`]: sku,
      },
    });

    if (!currentProduct) {
      throw new HttpException('Sản phẩm không tồn tại.', 404);
    }

    // Delete current image
    const currentImages = await this.imageLinkRepo.find({
      where: {
        object_id: currentProduct.product_id,
        object_type: ImageObjectType.PRODUCT,
      },
    });

    if (currentImages.length) {
      for (let currentImageItem of currentImages) {
        await this.imageLinkRepo.delete({
          image_id: currentImageItem.image_id,
        });

        await this.imageRepo.delete({ image_id: currentImageItem.image_id });
      }
    }

    let result = { ...currentProduct, images: [] };

    // Create new images

    for (let [i, imageItem] of data.images.entries()) {
      const imageData = this.imageRepo.setData(imageItem);

      const newImage = await this.imageRepo.create(imageData);

      const newImageLink = await this.imageLinkRepo.create({
        object_id: result['product_id'],
        object_type: ImageObjectType.PRODUCT,
        image_id: newImage.image_id,
        position: i,
      });

      result = {
        ...result,
        images: [...result.images, { ...newImage, ...newImageLink }],
      };
    }
    return result;
  }

  async createSync(data): Promise<any> {
    if (data.product_id) {
      let product = await this.productRepo.findById(data.product_id);

      if (product) {
        return this.syncUpdate(product.product_code, data);
      }
    }
    // set product
    const productData = {
      ...new ProductsEntity(),
      ...this.productRepo.setData(data),
    };

    let result =
      (await this.productRepo.createSync({ ...productData })) || productData;

    // set product description
    const productDescData = {
      ...new ProductDescriptionsEntity(),
      ...this.productDescriptionsRepo.setData(data),
    };

    const newProductsDesc = await this.productDescriptionsRepo.createSync({
      ...productDescData,
      product_id: result.product_id,
    });

    result = { ...result, ...productDescData };

    //price
    const productPriceData = {
      ...new ProductPricesEntity(),
      ...this.productPriceRepo.setData(data),
    };

    await this.productPriceRepo.createSync({
      ...productPriceData,
      product_id: result.product_id,
    });

    result = { ...result, ...productPriceData };

    //sale
    const productSale = {
      ...new ProductSalesEntity(),
      ...this.productSaleRepo.setData(data),
    };

    await this.productSaleRepo.createSync({
      ...productSale,
      product_id: result.product_id,
    });

    result = { ...result, ...productSale };

    // category
    const productCategoryData = {
      ...new ProductsCategoriesEntity(),
      ...this.productCategoryRepo.setData(data),
    };

    await this.productCategoryRepo.createSync({
      ...productCategoryData,
      product_id: result.product_id,
    });

    result = { ...result, ...productCategoryData };

    if (data?.product_features?.length) {
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

        await this.productFeatureValueRepo.createSync(productFeatureValueData);
      }
    }

    if (data?.combo_items?.length) {
      // Nếu là SP combo, tạo group
      let productGroup = await this.productVariationGroupRepo.create({
        code: uuid().replace(/-/g, ''),
        product_root_id: result.product_id,
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

      for (let productItem of data.combo_items) {
        const newGroupProductItem =
          await this.productVariationGroupProductsRepo.create({
            product_id: productItem?.product_id,
            parent_product_id: productItem.product_combo_id,
            group_id: productGroup.group_id,
            quantity: productItem.quantity || 1,
            note: productItem.id,
          });
        result['combo_items'].push(newGroupProductItem);
      }
    }
    return result;
  }

  async callSync(): Promise<void> {
    await this.clearAll();
    const productsList = _.shuffle([...productsData, ...comboData]);
    for (let productItem of productsList) {
      await this.createSync(productItem);
    }
    await this.syncProductsIntoGroup();
  }

  async syncUpdate(sku, data): Promise<any> {
    const product = await this.productRepo.findOne({ product_code: sku });
    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    const productData = this.productRepo.setData(data);

    let result = { ...product };

    if (Object.entries(productData).length) {
      const updatedProduct = await this.productRepo.update(
        { product_id: result.product_id },
        productData,
      );

      result = { ...result, ...updatedProduct };
    }

    // set product description
    const productDescData = this.productDescriptionsRepo.setData(data);

    if (Object.entries(productDescData).length) {
      const updatedProductsDesc = await this.productDescriptionsRepo.update(
        { product_id: result.product_id },
        productDescData,
      );
      result = { ...result, ...updatedProductsDesc };
    }

    //price
    const productPriceData = this.productPriceRepo.setData(data);

    if (Object.entries(productPriceData).length) {
      const newProductPrice = await this.productPriceRepo.update(
        { product_id: result.product_id },
        productPriceData,
      );

      result = { ...result, ...newProductPrice };
    }

    //sale
    const productSale = this.productSaleRepo.setData(data);

    if (Object.entries(productSale).length) {
      const newProductSale = await this.productSaleRepo.update(
        { product_id: result.product_id },
        productSale,
      );
      result = { ...result, ...newProductSale };
    }

    if (data?.product_features?.length) {
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

    return result;
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
  }
}
