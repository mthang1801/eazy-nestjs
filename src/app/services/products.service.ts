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
import { JoinTable, Table } from 'src/database/enums';
import { CreateProductDto } from '../dto/product/create-product.dto';
import { CategoryRepository } from '../repositories/category.repository';
import { CategoryEntity } from '../entities/category.entity';
import {
  productByCategoryJoiner,
  productFamilyJoiner,
  productFeaturesByCategory,
  productFeaturesJoiner,
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
import { Equal } from '../../database/find-options/operators';
import { v4 as uuid } from 'uuid';
import { group } from 'console';
import { ProductVariationGroupProductsEntity } from '../entities/productVariationGroupProducts.entity';
import { convertToSlug } from '../../utils/helper';
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
    private imageRepo: ImagesRepository<ImagesEntity>,
    private imageLinkRepo: ImagesLinksRepository<ImagesLinksEntity>,
  ) {}

  async create(data: CreateProductDto): Promise<any> {
    // check unique key
    let { code, product_code, group_id, parent_product_id } = data;
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

    const checkSlugExists = await this.productRepo.findOne({
      slug: convertToSlug(data.slug),
    });
    if (checkSlugExists) {
      throw new HttpException('Slug đã tồn tại, không thể tạo sp mới', 409);
    }

    const findWhiteSpace = /\s/g;
    if (findWhiteSpace.test(data.product_code)) {
      throw new HttpException('Mã sản phẩm không được chứa khoảng trắng', 400);
    }

    if (data.children_products.length) {
      for (let productItem of data.children_products) {
        if (productItem.product_code) {
          if (findWhiteSpace.test(productItem.product_code)) {
            throw new HttpException(
              'Mã sản phẩm không được chứa khoảng trắng',
              400,
            );
          }
          const checkProductCodeExists = await this.productRepo.findOne({
            product_code: productItem.product_code.toUpperCase(),
          });
          if (checkProductCodeExists) {
            throw new HttpException(
              `Mã sản phẩm ${productItem.product_code} đã tồn tại`,
              409,
            );
          }
        }
      }
    }

    // product code
    const productCode = data.product_code;

    const prefixCode = productCode.replace(/[0-9]+/g, '').toUpperCase();
    const subfixCode = productCode.replace(/[a-zA-Z]+/g, '');

    const checkProductCodeExists = await this.productRepo.findOne({
      product_code: data.product_code.toUpperCase(),
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
      slug: convertToSlug(data.slug),
      product_code: productCode.toUpperCase(),
      created_at: convertToMySQLDateTime(),
    });

    // // Mô tả sp
    const productDescriptionData = this.productDescriptionsRepo.setData(data);
    const newProductDescription = await this.productDescriptionsRepo.create({
      product_id: newProductItem.product_id,
      ...productDescriptionData,
    });

    // // Price
    const productPriceData = this.productPriceRepo.setData(data);
    const newProductPrice: ProductPricesEntity =
      await this.productPriceRepo.create({
        product_id: newProductItem.product_id,
        ...productPriceData,
      });

    // // Sale
    const productSaleData = this.productSaleRepo.setData(data);
    const newProductSale: ProductSalesEntity =
      await this.productSaleRepo.create({
        product_id: newProductItem.product_id,
        ...productSaleData,
      });

    // // ----- Product category -----

    const productCategoryData = this.productCategoryRepo.setData(data);
    const newProductCategory = await this.productCategoryRepo.create({
      ...productCategoryData,
      product_id: newProductItem.product_id,
    });

    // // ----- Product groups -----

    // If group_id exists, add product to group
    let productGroupProductData =
      this.productVariationGroupProductsRepo.setData(data);

    let groupProduct;
    if (parent_product_id) {
      groupProduct = await this.productVariationGroupProductsRepo.findOne({
        product_id: parent_product_id,
      });

      group_id = groupProduct.group_id;
    }

    if (!groupProduct) {
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
    }
    console.log(238, group_id);

    // Product features values and product group Features
    const { product_features, purpose } = data;

    if (product_features.length) {
      await this.createProductFeatures(
        product_features,
        newProductItem.product_id,
        group_id,
        purpose,
      );
    }

    // Create children products with auto ge
    let childrenProductsList = [];
    if (data.children_products.length) {
      for (let [i, productItem] of data.children_products.entries()) {
        let childProductDigitCode = +subfixCode + i + 1;
        let childProductCode =
          productItem.product_code || prefixCode + childProductDigitCode;
        console.log(childProductCode);
        const checkProductCode = await this.productRepo.findOne({
          product_code: childProductCode,
        });
        if (checkProductCode) {
          childProductCode = prefixCode + uuid().split('-')[0].toUpperCase();
        }

        // product for child
        const childProductData = this.productRepo.setData(productItem);
        const newChildProductItem = await this.productRepo.create({
          ...childProductData,
          product_code: childProductCode,
          parent_product_id: parent_product_id || newProductItem.product_id,
          created_at: convertToMySQLDateTime(),
          display_at: convertToMySQLDateTime(),
        });

        // product description for child
        const newChildProductDescription =
          await this.productDescriptionsRepo.create({
            ...productDescriptionData,
            product_id: newChildProductItem.product_id,
          });

        // product price for child
        const childProductPriceData =
          this.productPriceRepo.setData(productItem);
        const newChildProductPrice = await this.productPriceRepo.create({
          ...childProductPriceData,
          product_id: newChildProductItem.product_id,
        });

        // price Sale for child
        const childProductSaleData = this.productSaleRepo.setData(data);
        const newChildProductSale: ProductSalesEntity =
          await this.productSaleRepo.create({
            product_id: newChildProductItem.product_id,
            ...childProductSaleData,
          });

        // product category
        const newChildProductCategory = await this.productCategoryRepo.create({
          ...productCategoryData,
          product_id: newChildProductItem.product_id,
        });

        // insert product into group
        await this.productVariationGroupProductsRepo.create({
          ...productGroupProductData,
          product_id: newChildProductItem.product_id,
          group_id,
          parent_product_id: parent_product_id || newProductItem.product_id,
        });

        if (productItem.product_features) {
          await this.createProductFeatures(
            productItem.product_features,
            newChildProductItem.product_id,
            group_id,
            productItem.purpose,
          );
        }
        childrenProductsList.push({
          ...newChildProductItem,
          ...newChildProductDescription,
          ...newChildProductPrice,
          ...newChildProductSale,
          ...newChildProductCategory,
        });
      }
    }

    const result = {
      ...newProductItem,
      ...newProductDescription,
      ...newProductPrice,
      ...newProductSale,
      ...newProductCategory,
      children_products: childrenProductsList,
    };

    return result;
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
        '*',
        `${Table.PRODUCTS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.parent_product_id`,
      ],
      join: { [JoinTable.leftJoin]: productJoiner },
      where: [
        { [`${Table.PRODUCTS}.product_id`]: identifier },
        { [`${Table.PRODUCTS}.product_code`]: identifier },
      ],
    });

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
      select: ['*', `${Table.PRODUCTS}.*`],
      join: productFamilyJoiner,
      where: productsFamilyFilterConditioner(product),
    });

    product['products_family'] = productsFamily.filter(
      (productsFamilyItem) =>
        productsFamilyItem.product_id !== product.product_id,
    );

    if (product.group_id) {
      const productsGroup = await this.productRepo.find({
        select: ['*', `${Table.PRODUCTS}.*`],
        join: { [JoinTable.leftJoin]: productJoiner },
        where: productsGroupFilterConditioner(product),
      });

      product['products_group'] = productsGroup;
    }

    return product;
  }

  async getList(params: any): Promise<any> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;

    let products = [];
    let count;
    let filterCondition = {};
    let isContinue = true;

    if (Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productDescriptionsRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCT_DESCRIPTION}.${key}`] = Like(val);
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

        isContinue = false;

        count = await this.productRepo.find({
          select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: {
            [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
              getFeatureByKey.feature_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
              getVariantByVal.variant_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
              (productItem) => productItem.product_id,
            ),
          },
        });

        products = await this.productRepo.find({
          select: [
            `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
          ],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: {
            [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
              getFeatureByKey.feature_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
              getVariantByVal.variant_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
              (productItem) => productItem.product_id,
            ),
          },
          skip,
          limit,
        });
      }

      if (!isContinue) {
        return { totalProducts: count ? count[0].total : 0, products };
      }
    }

    count = await this.productRepo.find({
      select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: filterCondition,
    });

    products = await this.productRepo.find({
      select: [
        `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
      ],
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: filterCondition,
      skip,
      limit,
    });

    console.log(products);
    for (let productItem of products) {
      const listFeatureValues = await this.productRepo.find({
        select: ['*'],
        join: {
          [JoinTable.rightJoin]: {
            [Table.PRODUCT_FEATURE_VALUES]: {
              fieldJoin: `${Table.PRODUCT_FEATURE_VALUES}.product_id`,
              rootJoin: `${Table.PRODUCTS}.product_id`,
            },
            [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
              fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
              rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
            },

            [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
              fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
              rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
            },
          },
        },
        where: { [`${Table.PRODUCTS}.product_id`]: productItem.product_id },
      });
      productItem.features = listFeatureValues;
    }

    return { totalProducts: count ? count[0].total : 0, products };
  }

  async getProductsListByCategoryId(
    categoryId: number,
    params: any,
  ): Promise<any> {
    const category = await this.categoryRepo.findById(categoryId);

    let categoriesList: { category_id: number }[] = [
      { category_id: category.category_id },
    ];

    switch (category.level) {
      case 1:
        categoriesList = [
          ...categoriesList,
          ...(await this.getCategoriesListLevel1(categoryId)),
        ];
        break;
      case 2:
        categoriesList = [
          ...categoriesList,
          ...(await this.getCategoriesListLevel2(categoryId)),
        ];
        break;
    }

    let categoriesListFlatten: number[] = categoriesList.map(
      ({ category_id }) => category_id,
    );

    let { page, limit, ...others } = params;

    page = +page || 1;
    limit = +limit || 9999;
    const skip = (page - 1) * limit;

    let products = [];
    let count;
    if (Object.entries(others).length) {
      for (let [i, [key, val]] of Object.entries(others).entries()) {
        const getFeatureByKey = await this.productFeaturesRepo.findOne({
          feature_code: key,
        });

        const getVariantByVal = await this.productFeatureValueRepo.findOne({
          value: val,
        });

        if (!getFeatureByKey || !getVariantByVal) continue;

        count = await this.productRepo.find({
          select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: {
            [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
              getFeatureByKey.feature_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
              getVariantByVal.variant_id,
            [`${Table.PRODUCTS_CATEGORIES}.category_id`]:
              categoriesListFlatten.map((categoryId) => categoryId),
            [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
              (productItem) => productItem.product_id,
            ),
          },
        });

        products = await this.productRepo.find({
          select: [
            `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
          ],
          join: {
            [JoinTable.leftJoin]: productByCategoryJoiner,
          },
          where: {
            [`${Table.PRODUCT_FEATURE_VALUES}.feature_id`]:
              getFeatureByKey.feature_id,
            [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]:
              getVariantByVal.variant_id,
            [`${Table.PRODUCTS_CATEGORIES}.category_id`]:
              categoriesListFlatten.map((categoryId) => categoryId),
            [`${Table.PRODUCT_FEATURE_VALUES}.product_id`]: products.map(
              (productItem) => productItem.product_id,
            ),
          },
          skip,
          limit,
        });
      }
      return { total: count ? count[0]?.total : 0, products };
    }

    count = await this.productRepo.find({
      select: [`COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`],
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: {
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesListFlatten.map(
          (categoryId) => categoryId,
        ),
      },
    });

    products = await this.productRepo.find({
      select: [
        `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
      ],
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      where: {
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoriesListFlatten.map(
          (categoryId) => categoryId,
        ),
      },
      skip,
      limit,
    });

    return { total: count ? count[0]?.total : 0, products };
  }

  async getCategoriesListLevel1(categoryId: number): Promise<any> {
    let categoriesListLevel2 = await this.categoryRepo.find({
      select: ['category_id'],
      where: { parent_id: categoryId, level: 2 },
    });

    let categoriesListLevel3 = [];
    for (let categoryItem of categoriesListLevel2) {
      let categoriesListLevel3ByLevel2 = await this.getCategoriesListLevel2(
        categoryItem.category_id,
      );

      if (categoriesListLevel3ByLevel2.length) {
        categoriesListLevel3 = [
          ...categoriesListLevel3,
          ...categoriesListLevel3ByLevel2,
        ];
      }
    }

    return [...categoriesListLevel2, ...categoriesListLevel3];
  }

  async getCategoriesListLevel2(categoryId: number): Promise<any> {
    return this.categoryRepo.find({
      select: ['category_id'],
      where: { parent_id: categoryId, level: 3 },
    });
  }

  async update(
    identifier: number | string,
    data: UpdateProductDto,
  ): Promise<any> {
    const currentProduct = await this.productRepo.findOne({
      select: [
        '*',
        `${Table.PRODUCTS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.*`,
        `${Table.CATEGORY_DESCRIPTIONS}.* `,
      ],
      join: { [JoinTable.leftJoin]: productJoiner },
      where: [
        { [`${Table.PRODUCTS}.product_id`]: identifier },
        { product_code: identifier },
      ],
    });

    if (!currentProduct) {
      throw new HttpException('Sản phẩm không tồn tại.', 404);
    }

    if (data.group_id) {
      const checkGroupIdExist = await this.productVariationGroupRepo.findById(
        data.group_id,
      );
      if (!checkGroupIdExist)
        throw new HttpException('Group id không tồn tại', 404);
    }

    if (
      data.product_code &&
      data.product_code !== currentProduct.product_code
    ) {
      const findWhiteSpace = /\s/g;
      if (findWhiteSpace.test(data.product_code)) {
        throw new HttpException(
          'Mã sản phẩm không được chứa khoảng trắng',
          400,
        );
      }
      const productCodeExists = await this.productRepo.findOne({
        product_code: data.product_code,
      });
      if (productCodeExists) {
        throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
      }
    }

    // check slug
    if (data.slug && convertToSlug(data.slug) !== currentProduct.slug) {
      const checkSlugExists = await this.productRepo.findOne({
        slug: convertToSlug(data.slug),
      });
      if (checkSlugExists) {
        throw new HttpException(
          'Slug đã tồn tại, không thể cập nhật sản phẩm',
          409,
        );
      }
    }

    if (data.parent_product_id !== 0 && data.children_products.length) {
      throw new HttpException('Sản phẩm này không thể chứa sản phẩm con', 400);
    }

    //update product
    const productData = this.productRepo.setData(data);
    const updatedProduct = await this.productRepo.update(
      {
        product_id: currentProduct.product_id,
      },
      { ...productData, slug: convertToSlug(data.slug) || currentProduct.slug },
    );

    // product descriptions
    const productDescriptionData = this.productDescriptionsRepo.setData(data);
    const updatedProductDescription = await this.productDescriptionsRepo.update(
      { product_id: currentProduct.product_id },
      productDescriptionData,
    );

    // Price
    const productPriceData = this.productPriceRepo.setData(data);
    const updatedProductPrice: ProductPricesEntity =
      await this.productPriceRepo.update(
        { product_id: currentProduct.product_id },
        productPriceData,
      );

    // Sale
    const productSaleData = this.productSaleRepo.setData(data);
    const updatedProductSale: ProductSalesEntity =
      await this.productSaleRepo.update(
        { product_id: currentProduct.product_id },
        productSaleData,
      );

    // ----- Product category -----
    const productCategoryData = this.productCategoryRepo.setData(data);
    const updatedProductCategory = await this.productCategoryRepo.update(
      { product_id: currentProduct.product_id },
      productCategoryData,
    );

    // ----- Product groups -----
    let productGroupProductData =
      this.productVariationGroupProductsRepo.setData(data);
    const updatedProductGroup =
      await this.productVariationGroupProductsRepo.update(
        { product_id: currentProduct.product_id },
        productGroupProductData,
      );

    // Product features values and product group Features

    if (data.product_features.length) {
      // delete all old product feature values by product id

      await this.productFeatureValueRepo.delete({
        product_id: currentProduct.product_id,
      });

      for (let { feature_id, variant_id } of data.product_features) {
        const productFeatureVariant =
          await this.productFeatureVariantDescriptionRepo.findOne({
            variant_id,
          });

        const featureValue = await this.productFeatureValueRepo.create({
          feature_id,
          variant_id,
          product_id: currentProduct.product_id,
          value: isNaN(+productFeatureVariant.variant * 1)
            ? productFeatureVariant.variant
            : '',
          value_int: !isNaN(+productFeatureVariant.variant * 1)
            ? +productFeatureVariant.variant
            : 0,
        });

        // Check group feature by feature_id and group_id, if not exists, create new record
        let checkProductGroupFeatureExist =
          await this.productVariationGroupFeatureRepo.findOne({
            feature_id,
            group_id: currentProduct.product_id,
          });

        if (!checkProductGroupFeatureExist) {
          const feature: ProductFeatureDescriptionEntity =
            await this.productFeatureDescriptionRepo.findOne({ feature_id });
          await this.productVariationGroupFeatureRepo.create({
            feature_id,
            group_id: currentProduct.product_id,
            purpose: feature.description,
          });
        }
      }
    }

    // const prefixCode = updatedProduct.product_code
    //   .replace(/[0-9]+/g, '')
    //   .toUpperCase();
    // const subfixCode = updatedProduct.product_code.replace(/[a-zA-Z]+/g, '');

    // let childrenProductsList = [];
    // if (data.children_products.length) {
    //   for (let [i, productItem] of data.children_products.entries()) {
    //     let childProductDigitCode = +subfixCode + i + 1;
    //     let childProductCode =
    //       productItem.product_code || prefixCode + childProductDigitCode;

    //     const checkProductCode = await this.productRepo.findOne({
    //       product_code: childProductCode,
    //     });

    //     if (checkProductCode) {
    //       childProductCode = prefixCode + uuid().split('-')[0].toUpperCase();
    //     }

    //     // product for child
    //     const childProductData = this.productRepo.setData(productItem);
    //     const newChildProductItem = await this.productRepo.create({
    //       ...childProductData,
    //       product_code: childProductCode,
    //       parent_product_id: updatedProduct.product_id,
    //       created_at: convertToMySQLDateTime(),
    //       display_at: convertToMySQLDateTime(),
    //     });

    //     // product description for child
    //     const newChildProductDescription =
    //       await this.productDescriptionsRepo.create({
    //         ...productDescriptionData,
    //         product_id: newChildProductItem.product_id,
    //       });

    //     // product price for child
    //     const childProductPriceData =
    //       this.productPriceRepo.setData(productItem);
    //     const newChildProductPrice = await this.productPriceRepo.create({
    //       ...childProductPriceData,
    //       product_id: newChildProductItem.product_id,
    //     });

    //     // price Sale for child
    //     const childProductSaleData = this.productSaleRepo.setData(data);
    //     const newChildProductSale: ProductSalesEntity =
    //       await this.productSaleRepo.create({
    //         product_id: newChildProductItem.product_id,
    //         ...childProductSaleData,
    //       });

    //     // product category
    //     const newChildProductCategory = await this.productCategoryRepo.create({
    //       ...productCategoryData,
    //       product_id: newChildProductItem.product_id,
    //     });

    //     // insert product into group
    //     await this.productVariationGroupProductsRepo.create({
    //       ...productGroupProductData,
    //       product_id: newChildProductItem.product_id,
    //       group_id: updatedProductGroup.group_id,
    //       parent_product_id: updatedProduct.product_id,
    //     });

    //     if (productItem.product_features) {
    //       await this.createProductFeatures(
    //         productItem.product_features,
    //         newChildProductItem.product_id,
    //         updatedProductGroup.group_id,
    //       );
    //     }
    //     childrenProductsList.push({
    //       ...newChildProductItem,
    //       ...newChildProductDescription,
    //       ...newChildProductPrice,
    //       ...newChildProductSale,
    //       ...newChildProductCategory,
    //     });
    //   }
    // }

    const result = {
      ...updatedProduct,
      ...updatedProductDescription,
      ...updatedProductPrice,
      ...updatedProductSale,
      ...updatedProductCategory,
    };

    return result;
  }
}
