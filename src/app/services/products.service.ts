import { Injectable, HttpException, HttpService } from '@nestjs/common';
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
  productGroupJoiner,
  productGroupProductsJoiner,
  productInfoJoiner,
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
import {
  ImageObjectType,
  ImageType,
} from 'src/database/enums/tableFieldEnum/imageTypes.enum';
import { UpdateProductDto } from '../dto/product/update-product.dto';
import { Equal, IsNull } from '../../database/find-options/operators';
import { v4 as uuid } from 'uuid';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import { convertToSlug, MaxLimit } from '../../utils/helper';
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
  productFeatureValuesSelector,
} from 'src/utils/tableSelector';

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
        parent_product_id: IsNull(),
        product_type: [1, 2],
      },
    });

    return products;
  }

  async getProductDetails(product) {
    let status = product['status'];
    product['images'] = [];
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
        where: { product_id: product.product_id },
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

            // Lấy các SP con
            if (product.product_id === productInfoDetail.parent_product_id) {
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

              product['children_products'] = product['children_products']
                ? [
                    ...product['children_products'],
                    {
                      ...productInfoDetail,
                      product: productInfoDetail.product?.split('-')[1]?.trim(),
                    },
                  ]
                : [
                    {
                      ...productInfoDetail,
                      product: productInfoDetail.product?.split('-')[1]?.trim(),
                    },
                  ];
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

    const currentCategory = await this.categoryRepo.findOne({
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

    const categoriesList = await this.parentCategories(currentCategory);
    const parentCategories = categoriesList.slice(1);

    product['status'] = status;
    return {
      currentCategory: categoriesList[0],
      parentCategories,
      product,
    };
  }

  async get(identifier: number | string): Promise<any> {
    // get Product item
    let product = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCTS}.status`,
      ],
      join: {
        [JoinTable.leftJoin]: productFullJoiner,
      },
      where: [
        { [`${Table.PRODUCTS}.product_id`]: identifier },
        { [`${Table.PRODUCTS}.product_code`]: identifier },
      ],
    });

    if (!product) {
      throw new HttpException('Không tìm thấy sp', 404);
    }
    return this.getProductDetails(product);
  }

  async getBySlug(slug: string): Promise<any> {
    let product = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCTS}.status`,
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
    let { page, limit, search, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;

    let filterCondition = {};

    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCTS}.${key}`] = Like(val);
          continue;
        }
        if (this.productDescriptionsRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCT_DESCRIPTION}.${key}`] = Like(val);
        }
      }
    }

    let count = await this.productRepo.find({
      select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
      join: {
        [JoinTable.innerJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: 'product_id',
            rootJoin: 'product_id',
          },
        },
      },
      where: productsListsSearchFilter(search, filterCondition),
    });

    let productLists = await this.productRepo.find({
      select: ['*'],
      join: {
        [JoinTable.innerJoin]: productJoiner,
      },
      orderBy: [{ field: `${Table.PRODUCTS}.created_at`, sortBy: SortBy.DESC }],
      where: productsListsSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    // determine product type and  get Image
    for (let productItem of productLists) {
      if (
        !productItem.parent_product_id &&
        (productItem.product_type == 1 || productItem.product_type == 2)
      ) {
        productItem['productType'] = 1; //Sản phẩm cha
      } else if (
        !productItem.parent_product_id &&
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
      products: productLists,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count.length ? count[0].total : 0,
      },
    };
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
            `${Table.PRODUCT_PRICES}.*`,
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
          `${Table.PRODUCT_PRICES}.*`,
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
      currentCategory: category,
      childrenCategories: categoriesListByLevel,
      products: productsList,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0]?.total,
      },
    };
  }

  async update(sku: string, data) {
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
        product_id: Not(Equal(result.product_id)),
      });
      if (product) {
        throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
      }
    }

    if (data.slug && data.slug !== result.slug) {
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
    const productData = this.productRepo.setData(data);

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
        productDescData,
      );
      result = { ...result, ...updatedProductDesc };
    }

    // Update product price
    const productPriceData = this.productPriceRepo.setData(data);
    if (Object.entries(productPriceData).length) {
      const updatedProductPrice = await this.productPriceRepo.update(
        { product_id: result.product_id },
        productPriceData,
      );
      result = { ...result, ...updatedProductPrice };
    }

    // Update product sale
    const productSaleData = this.productSaleRepo.setData(data);
    if (Object.entries(productSaleData).length) {
      const updatedProductSale = await this.productSaleRepo.update(
        { product_id: result.product_id },
        productSaleData,
      );
      result = { ...result, ...updatedProductSale };
    }

    // Update product category
    const productCategoryData = this.productCategoryRepo.setData(data);
    if (Object.entries(productCategoryData).length) {
      const updatedProductCategory = await this.productCategoryRepo.update(
        { product_id: result.product_id },
        productCategoryData,
      );
      result = { ...result, ...updatedProductCategory };
    }

    if (data?.product_features?.length) {
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

    if (data?.images?.length) {
      for (let [i, imagePath] of data.images.entries()) {
        const newImage = await this.imageRepo.create({ image_path: imagePath });
        const newImageLink = await this.imageLinkRepo.create({
          object_id: result.product_id,
          object_type: ImageObjectType.PRODUCT,
          image_id: newImage.image_id,
          position: i,
        });
      }
    }

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
    // await this.clearAll();

    // for (let productItem of productsData) {
    //   await this.createSync(productItem);
    // }
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

  async uploadImages(images, sku) {
    const product = await this.productRepo.findOne({ product_code: sku });

    if (!product) {
      throw new HttpException('Không tìm thấy SP', 404);
    }

    let data = new FormData();
    for (let image of images) {
      data.append('files', fs.createReadStream(image.path));
    }
    var config: any = {
      method: 'post',
      url: 'http://mb.viendidong.com/core-api/v1/files/website',
      headers: {
        'Content-Type': 'multipart/form-data',
        ...data.getHeaders(),
      },
      data: data,
    };

    try {
      const response = await axios(config);
      const results = response.data.data;
      let { position: lastPositionImage } = await this.imageLinkRepo.findOne({
        select: ['position'],
        orderBy: [{ field: 'position', sortBy: SortBy.DESC }],
        where: {
          object_id: product.product_id,
          object_type: ImageObjectType.PRODUCT,
        },
      });
      let currentPosition = lastPositionImage ? lastPositionImage + 1 : 0;
      if (Array.isArray(results) && results?.length) {
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

  async deleteProductImage(
    sku: string,
    data: DeleteProductImageDto,
  ): Promise<string> {
    const product = await this.productRepo.findOne({ product_code: sku });
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
}
