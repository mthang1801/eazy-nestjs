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
import { Table } from 'src/database/enums';
import { Equal, Like, Not } from 'src/database/find-options/operators';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { type } from 'os';
import { CreateProductDto } from '../dto/product/create-product.dto';

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
  ) {}

  async create(data: CreateProductDto): Promise<any> {
    // check unique key
    let { code, product_code, group_id } = data;
    if (!group_id) {
      const checkProductGroupExists =
        await this.productVariationGroupRepo.findOne({
          code: code.toUpperCase(),
        });

      if (checkProductGroupExists) {
        throw new HttpException(
          'Code nhóm sản phẩm đã tồn tại, không thể tạo nhóm',
          409,
        );
      }
    } else {
      const checkGroupIdExists = await this.productVariationGroupRepo.findOne({
        group_id,
      });
      if (!checkGroupIdExists) {
        throw new HttpException('Nhóm sản phẩm không tồn tại.', 404);
      }
    }

    const checkProductCodeExists = await this.productRepo.findOne({
      product_code,
    });
    if (checkProductCodeExists) {
      throw new HttpException(
        'Product code đã tồn tại, không thể tạo nhóm',
        409,
      );
    }

    const productData = this.productRepo.setData(data);
    const newProductItem: ProductsEntity = await this.productRepo.create({
      ...productData,
      created_at: convertToMySQLDateTime(),
    });

    // Mô tả sp
    const productDescriptionData = this.productDescriptionsRepo.setData(data);
    const newProductDescription = await this.productDescriptionsRepo.create({
      product_id: newProductItem.product_id,
      ...productDescriptionData,
    });

    // Price
    const productPriceData = this.productPriceRepo.setData(data);
    const newProductPrice: ProductPricesEntity =
      await this.productPriceRepo.create({
        product_id: newProductItem.product_id,
        ...productPriceData,
      });

    // Sale
    const productSaleData = this.productSaleRepo.setData(data);
    const newProductSale: ProductSalesEntity =
      await this.productSaleRepo.create({
        product_id: newProductItem.product_id,
        ...productSaleData,
      });

    // ----- Product category -----
    const { category_id } = data;
    const newProductCategory = await this.productCategoryRepo.create({
      category_id,
      product_id: newProductItem.product_id,
    });

    // ----- Product groups -----

    // If group_id exists, add product to group
    let productGroupProductData =
      this.productVariationGroupProductsRepo.setData(data);

    if (group_id) {
      await this.productVariationGroupProductsRepo.create({
        product_id: newProductItem.product_id,
        ...productGroupProductData,
      });
    } else {
      if (!code) {
        code = Date.now().toString();
      }

      const newProductGroup: ProductVariationGroupsEntity =
        await this.productVariationGroupRepo.create({
          code: code.toUpperCase(),
          created_at: convertToMySQLDateTime(),
          updated_at: convertToMySQLDateTime(),
        });

      group_id = newProductGroup.group_id;

      await this.productVariationGroupProductsRepo.create({
        ...productGroupProductData,
        product_id: newProductItem.product_id,
        group_id: newProductGroup.group_id,
      });
    }

    // Product features values and product group Features
    const { product_features, purpose } = data;

    if (product_features.length) {
      for (let { feature_id, variant_id } of product_features) {
        let featureValue = await this.productFeatureValueRepo.findOne({
          feature_id,
          variant_id,
          product_id: newProductItem.product_id,
        });
        if (!featureValue) {
          featureValue = await this.productFeatureValueRepo.create({
            feature_id,
            variant_id,
            product_id: newProductItem.product_id,
          });
        }

        // Check group feature by feature_id and group_id, if not exists, create new record
        let checkProductGroupFeatureExist =
          await this.productVariationGroupFeatureRepo.findOne({
            feature_id,
            group_id,
          });

        if (!checkProductGroupFeatureExist) {
          await this.productVariationGroupFeatureRepo.create({
            feature_id,
            group_id,
            purpose,
          });
        }
      }
    }

    const result = {
      ...newProductItem,
      ...newProductDescription,
      ...newProductPrice,
      ...newProductSale,
      ...newProductCategory,
    };
    return result;
  }

  async getList(params: any): Promise<any> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
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
          continue;
        }
        if (this.productVariationGroupFeatureRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCT_VARIATION_GROUP_FEATURES}.${key}`] =
            Like(val);
          continue;
        }
        if (this.productCategoryRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCTS_CATEGORIES}.${key}`] = Like(val);
          continue;
        }
      }
    }

    let productLists = await this.productRepo.find({
      select: ['*', `${Table.PRODUCTS}.*`, `${Table.PRODUCT_DESCRIPTION}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCTS_CATEGORIES]: {
            fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
            fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_VARIATION_GROUPS]: {
            fieldJoin: `${Table.PRODUCT_VARIATION_GROUPS}.group_id`,
            rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`,
          },
          [Table.PRODUCT_PRICES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
          },
          [Table.PRODUCT_SALES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_SALES}.product_id`,
          },
          [Table.PRODUCTS_CATEGORIES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
          },
        },
      },
      where: filterCondition,
      skip,
      limit,
    });

    let filterConditionFeatures = {};
    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productFeatureValueRepo.tableProps.includes(key)) {
          filterConditionFeatures[`${Table.PRODUCT_FEATURE_VALUES}.${key}`] =
            val;
          continue;
        }
      }
    }

    // get product features
    let productByFilterFeatures = [];
    for (let productItem of productLists) {
      let productFeatures = await this.productFeatureValueRepo.find({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
              fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
              rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
            },
            [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
              fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
              rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
            },
          },
        },
        where: {
          product_id: productItem.product_id,
          ...filterConditionFeatures,
        },
      });
      productItem['features'] = productFeatures;
      productByFilterFeatures.push(productItem);
    }

    return productByFilterFeatures;
  }

  async get(productId: number): Promise<any> {
    // get Product item
    let product = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCTS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.parent_product_id`,
      ],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCTS_CATEGORIES]: {
            fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
            fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_VARIATION_GROUPS]: {
            fieldJoin: `${Table.PRODUCT_VARIATION_GROUPS}.group_id`,
            rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`,
          },
          [Table.PRODUCT_PRICES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
          },
          [Table.PRODUCT_SALES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_SALES}.product_id`,
          },
          [Table.PRODUCTS_CATEGORIES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
          },
        },
      },
      where: { [`${Table.PRODUCTS}.product_id`]: productId },
    });

    // get features of product
    const productFeatures = await this.productFeatureValueRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
            fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
            rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
          },
          [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
            fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
            rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
          },
        },
      },
      where: {
        [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: product.product_id,
      },
    });

    product['features'] = productFeatures;

    // filter condition base on family
    const productsFamilyFilterCondition =
      product.parent_product_id === 0
        ? {
            [`${Table.PRODUCTS}.parent_product_id`]: product.product_id,
          }
        : [
            {
              [`${Table.PRODUCTS}.parent_product_id`]:
                product.parent_product_id,
            },
            {
              [`${Table.PRODUCTS}.product_id`]: product.parent_product_id,
            },
          ];

    const productsFamily = await this.productRepo.find({
      select: ['*', `${Table.PRODUCTS}.*`],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCTS_CATEGORIES]: {
            fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
            rootJoin: `${Table.PRODUCTS}.product_id`,
          },
          [Table.PRODUCT_PRICES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
          },
          [Table.PRODUCT_SALES]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.PRODUCT_SALES}.product_id`,
          },
        },
      },
      where: productsFamilyFilterCondition,
    });

    product['products_family'] = productsFamily.filter(
      (productsFamilyItem) =>
        productsFamilyItem.product_id !== product.product_id,
    );

    if (product.group_id) {
      const productsGroup = await this.productRepo.find({
        select: ['*', `${Table.PRODUCTS}.*`],
        join: {
          [JoinTable.leftJoin]: {
            [Table.PRODUCT_DESCRIPTION]: {
              fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
            [Table.PRODUCTS_CATEGORIES]: {
              fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
            [Table.PRODUCT_PRICES]: {
              fieldJoin: `${Table.PRODUCTS}.product_id`,
              rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
            },
            [Table.PRODUCT_SALES]: {
              fieldJoin: `${Table.PRODUCTS}.product_id`,
              rootJoin: `${Table.PRODUCT_SALES}.product_id`,
            },
            [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
              fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
          },
        },
        where:
          product.parent_product_id === 0
            ? {
                [`${Table.PRODUCTS}.parent_product_id`]: Not(
                  Equal(product.product_id),
                ),
                [`${Table.PRODUCTS}.product_id`]: Not(
                  Equal(product.product_id),
                ),
                [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`]:
                  product.group_id,
              }
            : {
                [`${Table.PRODUCTS}.parent_product_id`]: Not(
                  Equal(product.parent_product_id),
                ),
                [`${Table.PRODUCTS}.product_id`]: Not(
                  Equal(product.parent_product_id),
                ),
                [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`]:
                  product.group_id,
              },
      });

      product['products_group'] = productsGroup;
    }

    return product;
  }
}
