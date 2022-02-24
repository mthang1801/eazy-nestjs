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
import { convertToSlug } from '../../utils/helper';
import { UpdateImageDto } from '../dto/product/update-productImage.dto';
import { CreateProductV2Dto } from '../dto/product/create-product.v2.dto';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';
import { productsData } from 'src/database/constant/product';
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

  async create(data: CreateProductDto): Promise<any> {
    // check unique key
    let { code, product_code, group_id, parent_product_id } = data;
    // if (!group_id) {
    //   if (code) {
    //     const checkProductGroupExists =
    //       await this.productVariationGroupRepo.findOne({
    //         code: code.toUpperCase(),
    //       });

    //     if (checkProductGroupExists) {
    //       throw new HttpException(
    //         'Code nhóm sản phẩm đã tồn tại, không thể tạo nhóm',
    //         409,
    //       );
    //     }
    //   }
    // } else {
    //   const checkGroupIdExists = await this.productVariationGroupRepo.findOne({
    //     group_id,
    //   });
    //   if (!checkGroupIdExists) {
    //     throw new HttpException('Nhóm sản phẩm không tồn tại.', 404);
    //   }
    // }

    const checkSlugExists = await this.productRepo.findOne({
      slug: convertToSlug(data.slug),
    });
    if (checkSlugExists) {
      throw new HttpException('Slug đã tồn tại, không thể tạo sp mới', 409);
    }

    if (data.children_products.length) {
      for (let productItem of data.children_products) {
        if (productItem.product_code) {
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

    // Check parent product
    if (data.parent_product_id) {
      const checkParentProductIsParent =
        await this.productVariationGroupProductsRepo.findOne({
          product_id: data.parent_product_id,
        });
      if (checkParentProductIsParent.parent_product_id !== 0) {
        throw new HttpException('Sản phẩm cha không phù hợp.', 400);
      }
    }

    const productData = this.productRepo.setData(data);
    const newProductItem: ProductsEntity = await this.productRepo.create({
      ...productData,
      slug: convertToSlug(data.slug),
      product_code: productCode.toUpperCase(),
      created_at: convertToMySQLDateTime(),
    });

    let result = { ...newProductItem };

    // Mô tả sp
    const productDescriptionData = this.productDescriptionsRepo.setData(data);
    const newProductDescription = await this.productDescriptionsRepo.create({
      product_id: newProductItem.product_id,
      ...productDescriptionData,
    });

    result = { ...result, ...newProductDescription };

    // Price
    const productPriceData = this.productPriceRepo.setData(data);
    const newProductPrice: ProductPricesEntity =
      await this.productPriceRepo.create({
        product_id: newProductItem.product_id,
        ...productPriceData,
      });

    result = { ...result, ...newProductPrice };

    // Sale
    const productSaleData = this.productSaleRepo.setData(data);
    const newProductSale: ProductSalesEntity =
      await this.productSaleRepo.create({
        product_id: newProductItem.product_id,
        ...productSaleData,
      });

    result = { ...result, ...newProductSale };

    // ----- Product category -----

    const productCategoryData = this.productCategoryRepo.setData(data);
    const newProductCategory = await this.productCategoryRepo.create({
      ...productCategoryData,
      product_id: newProductItem.product_id,
    });

    result = { ...result, ...newProductCategory };

    // ----- Product groups -----

    // If group_id exists, add product to group
    let productGroupProductData =
      this.productVariationGroupProductsRepo.setData(data);

    let groupProduct;
    if (parent_product_id) {
      groupProduct = await this.productVariationGroupProductsRepo.findOne({
        product_id: parent_product_id,
      });

      group_id = groupProduct.group_id;

      const newGroupProduct =
        await this.productVariationGroupProductsRepo.create({
          product_id: result.product_id,
          group_id: groupProduct.group_id,
          parent_product_id: result.parent_product_id,
        });

      result = { ...result, ...newGroupProduct };
    }

    if (!groupProduct) {
      if (group_id) {
        const productVariationGroupProduct =
          await this.productVariationGroupProductsRepo.create({
            product_id: newProductItem.product_id,
            ...productGroupProductData,
          });

        result = { ...result, ...productVariationGroupProduct };
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

        const productVariationGroupProduct =
          await this.productVariationGroupProductsRepo.create({
            ...productGroupProductData,
            product_id: newProductItem.product_id,
            group_id: newProductGroup.group_id,
          });

        result = {
          ...result,
          ...newProductGroup,
          ...productVariationGroupProduct,
        };
      }
    }

    // Product features values and product group Features
    const { product_features, purpose } = data;

    if (product_features.length) {
      await this.createProductFeatures(
        product_features,
        newProductItem.product_id,
        result['group_id'],
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

        const checkProductCode = await this.productRepo.findOne({
          product_code: childProductCode,
        });

        if (checkProductCode) {
          childProductCode =
            prefixCode + uuid().replace(/-/g, '').toUpperCase();
        }

        // product for child
        const childProductData = this.productRepo.setData({
          ...result,
          ...productItem,
        });
        delete childProductData['product_id'];

        const newChildProductItem = await this.productRepo.create({
          ...childProductData,
          product_code: childProductCode,
          parent_product_id: result.parent_product_id
            ? result.parent_product_id
            : result.product_id,
          created_at: convertToMySQLDateTime(),
          display_at: data.display_at
            ? convertToMySQLDateTime(new Date(data.display_at))
            : convertToMySQLDateTime(),
        });

        // product description for child
        const childProductDescription = this.productDescriptionsRepo.setData({
          ...result,
          ...productItem,
        });
        const newChildProductDescription =
          await this.productDescriptionsRepo.create({
            ...childProductDescription,
            product_id: newChildProductItem.product_id,
          });

        // product price for child
        const childProductPriceData = this.productPriceRepo.setData({
          ...result,
          ...productItem,
        });
        const newChildProductPrice = await this.productPriceRepo.create({
          ...childProductPriceData,
          product_id: newChildProductItem.product_id,
        });

        // price Sale for child
        const childProductSaleData = this.productSaleRepo.setData({
          ...result,
          ...productItem,
        });
        const newChildProductSale: ProductSalesEntity =
          await this.productSaleRepo.create({
            ...childProductSaleData,
            product_id: newChildProductItem.product_id,
          });

        // product category
        const childCategoryData = this.productCategoryRepo.setData({
          ...result,
          ...productItem,
        });
        const newChildProductCategory = await this.productCategoryRepo.create({
          ...childCategoryData,
          product_id: newChildProductItem.product_id,
        });

        // insert product into group
        const childVairationProductGroup =
          await this.productVariationGroupProductsRepo.create({
            ...productGroupProductData,
            product_id: newChildProductItem.product_id,
            group_id: result['group_id'],
            parent_product_id: result.parent_product_id
              ? result.parent_product_id
              : result.product_id,
          });

        if (productItem.product_features) {
          await this.createProductFeatures(
            productItem.product_features,
            newChildProductItem.product_id,
            result['group_id'],
            productItem.purpose,
          );
        }
        childrenProductsList.push({
          ...newChildProductItem,
          ...newChildProductDescription,
          ...newChildProductPrice,
          ...newChildProductSale,
          ...newChildProductCategory,
          ...childVairationProductGroup,
        });
      }

      result['children_products'] = childrenProductsList;
    }

    return result;
  }

  async createV2(data: CreateProductV2Dto): Promise<any> {
    // Tạo mới sản phẩm :
    // 1. Mỗi sản phẩm sẽ có nhiều màu sắc -> sản phẩm con sẽ có màu sắc tương tự
    // a. Nếu không có sản phẩm cha
    //   - Sản phẩm gốc sẽ làm sản phẩm cha, và tạo nhóm sản phẩm
    // b. Nếu không có sản phẩm cha và không có sản phẩm con -> sản phẩm này là độc lập (group_id = 0 )
    // c. Nếu có sản phẩm cha -> Thêm sản phẩm mới, kèm theo sản phẩm con ( nếu có ) vào trong nhóm chứa sản phẩm cha
    // Kiểm tra product_code tồn tại
    const productCodeExist = await this.productRepo.findOne({
      product_code: data.product_code,
    });
    if (productCodeExist) {
      throw new HttpException('Mã sản phẩm đã tồn tại.', 409);
    }

    if (data.children_products.length) {
      for (let childProduct of data.children_products) {
        if (childProduct.product_code) {
          const productChildCodeExist = await this;
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
            { field: `${Table.PRODUCTS}.created_at`, sort_by: SortBy.DESC },
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
      orderBy: [
        { field: `${Table.PRODUCTS}.created_at`, sort_by: SortBy.DESC },
      ],
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

  async getProductsListByCategoryId(
    categoryId: number,
    params: any,
  ): Promise<any> {
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

    let categoriesList: { category_id: number }[] = [
      { category_id: category.category_id },
    ];

    let homeChildrenCategoryId = [];
    let homeChildrenCategory = [];

    switch (category.level) {
      case 0:
        const categoriesListLevel1 = await this.getCategoriesListLevel1(
          categoryId,
        );
        categoriesList = [...categoriesList, ...categoriesListLevel1];
        homeChildrenCategoryId = [...categoriesListLevel1];
        break;
      case 1:
        categoriesList = [
          ...categoriesList,
          ...(await this.getCategoriesListLevel2(categoryId)),
        ];
        break;
    }

    if (homeChildrenCategoryId.length) {
      for (let { category_id } of homeChildrenCategoryId) {
        const categoryItem = await this.categoryRepo.findOne({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.CATEGORY_DESCRIPTIONS]: {
                fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
                rootJoin: `${Table.CATEGORIES}.category_id`,
              },
            },
          },
          where: { [`${Table.CATEGORIES}.category_id`]: category_id },
        });
        if (categoryItem) {
          homeChildrenCategory = [
            ...homeChildrenCategory,
            { ...categoryItem, slug: `${category.slug}/${categoryItem.slug}` },
          ];
        }
      }
    }

    let categoriesListFlatten: number[] = categoriesList.map(
      ({ category_id }) => category_id,
    );

    let { page, limit, ...others } = params;

    page = +page || 1;
    limit = +limit || 20;
    const skip = (page - 1) * limit;

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

      for (let [i, [key, val]] of Object.entries(others).entries()) {
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
          orderBy: [
            { field: `${Table.PRODUCTS}.created_at`, sort_by: SortBy.DESC },
          ],
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
            [`${Table.PRODUCTS}.parent_product_id`]: 0,
          },
          skip,
          limit,
        });
      }
      if (!isContinued) {
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
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },

      where: categoriesListFlatten.map((categoryId) => ({
        ...filterCondition,
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId,

        [`${Table.PRODUCTS}.parent_product_id`]: 0,
      })),
    });

    products = await this.productRepo.find({
      select: [
        `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCTS}.*, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCT_PRICES}.*`,
      ],
      join: {
        [JoinTable.leftJoin]: productByCategoryJoiner,
      },
      orderBy: [
        { field: `${Table.PRODUCTS}.created_at`, sort_by: SortBy.DESC },
      ],
      where: categoriesListFlatten.map((categoryId) => ({
        ...filterCondition,
        [`${Table.PRODUCTS_CATEGORIES}.category_id`]: categoryId,

        [`${Table.PRODUCTS}.parent_product_id`]: 0,
      })),

      skip,
      limit,
    });

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
      childrenCategory: homeChildrenCategory,
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count ? count[0].total : 0,
      },
    };
  }

  async getCategoriesListLevel1(categoryId: number): Promise<any> {
    let categoriesListLevel2 = await this.categoryRepo.find({
      select: ['category_id'],
      where: { parent_id: categoryId, level: 1 },
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
        categoriesListLevel2['children'] = categoriesListLevel3;
      }
    }

    return [...categoriesListLevel2, ...categoriesListLevel3];
  }

  async getCategoriesListLevel2(categoryId: number): Promise<any> {
    return this.categoryRepo.find({
      select: ['category_id'],
      where: { parent_id: categoryId, level: 2 },
    });
  }

  async update(sku: string, data: UpdateProductDto): Promise<any> {
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

    if (data.group_id) {
      const checkGroupIdExist = await this.productVariationGroupRepo.findById(
        data.group_id,
      );

      if (!checkGroupIdExist)
        throw new HttpException('Group id không tồn tại', 404);
    }

    if (data.product_code === '') {
      throw new HttpException('Mã sản phẩm không được để trống', 400);
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

    // Check product parent id
    if (
      data.parent_product_id &&
      currentProduct['parent_product_id'] &&
      data.parent_product_id
    ) {
      throw new HttpException(
        'Sản phẩm này là root, không thể trở thành sản phẩm con.',
        400,
      );
    }

    // Check parent product id is root product

    if (
      data?.parent_product_id &&
      currentProduct.parent_product_id !== data.parent_product_id &&
      data.parent_product_id &&
      currentProduct.parent_product_id
    ) {
      const checkParentProductIdIsParent = await this.productRepo.findById(
        data.parent_product_id,
      );

      if (checkParentProductIdIsParent.parent_product_id) {
        throw new HttpException(
          `Sản phẩm có mã ${checkParentProductIdIsParent.product_code} không phải là sản phẩm root`,
          400,
        );
      }
    }

    if (
      data.children_products &&
      currentProduct.parent_product_id !== 0 &&
      data.children_products.length
    ) {
      throw new HttpException('Sản phẩm này không thể chứa sản phẩm con', 400);
    }

    // //update product
    const productData = this.productRepo.setData(data);
    let updatedProduct;

    if (Object.entries(productData).length) {
      updatedProduct = await this.productRepo.update(
        {
          product_id: currentProduct.product_id,
        },
        {
          ...productData,
          slug: data.slug ? convertToSlug(data.slug) : currentProduct.slug,
        },
      );
    }

    let result = updatedProduct
      ? { ...currentProduct, ...updatedProduct }
      : { ...currentProduct };

    // product descriptions
    const productDescriptionData = this.productDescriptionsRepo.setData(data);

    let updatedProductDescription = {};
    if (Object.entries(productDescriptionData).length) {
      updatedProductDescription = await this.productDescriptionsRepo.update(
        { product_id: currentProduct.product_id },
        productDescriptionData,
      );
    }

    result = { ...result, ...updatedProductDescription };

    // Price
    const productPriceData = this.productPriceRepo.setData(data);
    let updatedProductPrice = {};
    if (Object.entries(productPriceData).length) {
      updatedProductPrice = await this.productPriceRepo.update(
        { product_id: currentProduct.product_id },
        productPriceData,
      );
    }

    result = { ...result, ...updatedProductPrice };

    // Sale
    const productSaleData = this.productSaleRepo.setData(data);
    let updatedProductSale = {};
    if (Object.entries(productSaleData).length) {
      updatedProductSale = await this.productSaleRepo.update(
        { product_id: currentProduct.product_id },
        productSaleData,
      );
    }
    result = { ...result, ...updatedProductSale };

    // Product features values and product group Features

    if (data.product_features && data.product_features.length) {
      // delete all old product feature values by product id
      await this.productFeatureValueRepo.delete({
        product_id: result.product_id,
      });

      for (let { feature_id, variant_id } of data.product_features) {
        const productFeatureVariant =
          await this.productFeatureVariantDescriptionRepo.findOne({
            variant_id,
          });

        await this.productFeatureValueRepo.create({
          feature_id,
          variant_id,
          product_id: result['product_id'],
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
            group_id: result.group_id,
          });

        if (!checkProductGroupFeatureExist) {
          const feature: ProductFeatureDescriptionEntity =
            await this.productFeatureDescriptionRepo.findOne({ feature_id });
          await this.productVariationGroupFeatureRepo.create({
            feature_id,
            group_id: result.group_id,
            purpose: feature.description,
          });
        }
      }
    }

    //TH1 :  Nếu sản phẩm cha, có thể thay đổi danh mục, group và có thể add thêm sản phẩm con
    if (result.parent_product_id === 0) {
      // ----- Product category -----
      const productCategoryData = this.productCategoryRepo.setData(data);
      let updatedProductCategory = {};
      if (Object.entries(productCategoryData).length) {
        updatedProductCategory = await this.productCategoryRepo.update(
          { product_id: currentProduct.product_id },
          productCategoryData,
        );
      }

      result = { ...result, ...updatedProductCategory };

      let childrenProductsList = [];
      // Cập nhật lại tất cả các sản phẩm con theo group_id, và category_id
      if (Object.entries(updatedProductCategory).length) {
        let _childrenProductsList = await this.productRepo.find({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.PRODUCTS_CATEGORIES]: {
                fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
                rootJoin: `${Table.PRODUCTS}.product_id`,
              },
            },
          },
          where: { [`${Table.PRODUCTS}.parent_product_id`]: result.product_id },
        });

        if (_childrenProductsList.length) {
          for (let childProduct of _childrenProductsList) {
            let childCategory = await this.productCategoryRepo.update(
              { product_id: childProduct.product_id },
              {
                category_id: result['category_id'],
              },
            );

            childProduct = { ...childProduct, ...childCategory };

            childrenProductsList = _childrenProductsList.map(
              (childProductItem) => {
                if (
                  childProductItem.product_id === childProduct['product_id']
                ) {
                  return { ...childProductItem, ...childProduct };
                }
                return childProductItem;
              },
            );
          }
        }
      }

      // ----- Product groups -----
      let productGroupProductData =
        this.productVariationGroupProductsRepo.setData(data);
      let updatedProductGroup = {};
      if (Object.entries(productGroupProductData).length) {
        updatedProductGroup =
          await this.productVariationGroupProductsRepo.update(
            { product_id: result.product_id },
            productGroupProductData,
          );
      }

      result = { ...result, ...updatedProductGroup };

      if (Object.entries(updatedProductGroup).length) {
        let _childrenProductsList = await this.productRepo.find({
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
                fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
                rootJoin: `${Table.PRODUCTS}.product_id`,
              },
            },
          },
          where: {
            [`${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.parent_product_id`]:
              result.product_id,
          },
        });

        if (_childrenProductsList.length) {
          for (let childProduct of _childrenProductsList) {
            let childGroup =
              await this.productVariationGroupProductsRepo.update(
                { product_id: childProduct.product_id },
                {
                  group_id: result['group_id'],
                },
              );

            childProduct = { ...childProduct, ...childGroup };

            childrenProductsList = _childrenProductsList.map(
              (childProductItem) => {
                if (
                  childProductItem.product_id === childProduct['product_id']
                ) {
                  return { ...childProductItem, ...childProduct };
                }
                return childProductItem;
              },
            );
          }
        }
      }

      if (data.children_products && data.children_products.length) {
        const prefixCode = result.product_code
          .replace(/[0-9]+/g, '')
          .toUpperCase();
        const subfixCode = result.product_code.replace(/[a-zA-Z]+/g, '');

        for (let [i, productItem] of data.children_products.entries()) {
          let childProductDigitCode = +subfixCode + i + 1;
          let childProductCode =
            productItem.product_code || prefixCode + childProductDigitCode;

          const checkProductExist = await this.productRepo.findOne({
            product_code: childProductCode,
          });

          if (checkProductExist) {
            childProductCode =
              prefixCode + uuid().replace(/-/g, '').toUpperCase();
          }

          // product for child

          const childProductData = this.productRepo.setData({
            ...result,
            productItem,
          });

          delete childProductData['product_id'];
          const newChildProductItem = await this.productRepo.create({
            ...childProductData,
            product_code: childProductCode,
            parent_product_id: result.product_id,
            created_at: convertToMySQLDateTime(),
            display_at: productItem.display_at
              ? convertToMySQLDateTime(new Date(productItem.display_at))
              : convertToMySQLDateTime(),
          });

          // product description for child
          const childProductDescriptionData =
            this.productDescriptionsRepo.setData({
              ...result,
              ...productItem,
            });
          delete childProductDescriptionData['product_description_id'];
          const newChildProductDescription =
            await this.productDescriptionsRepo.create({
              ...childProductDescriptionData,
              product_id: newChildProductItem.product_id,
            });

          // product price for child
          const childProductPriceData = this.productPriceRepo.setData({
            ...result,
            ...productItem,
          });
          delete childProductPriceData['product_price_id'];
          const newChildProductPrice = await this.productPriceRepo.create({
            ...childProductPriceData,
            product_id: newChildProductItem.product_id,
          });

          // price Sale for child
          const childProductSaleData = this.productSaleRepo.setData({
            ...result,
            ...productItem,
          });
          delete childProductData['product_sale_id'];
          const newChildProductSale: ProductSalesEntity =
            await this.productSaleRepo.create({
              ...childProductSaleData,
              product_id: newChildProductItem.product_id,
            });

          // product category

          const newChildProductCategory = await this.productCategoryRepo.create(
            {
              category_id: result['category_id'],
              product_id: newChildProductItem.product_id,
            },
          );

          // insert product into group
          await this.productVariationGroupProductsRepo.create({
            product_id: newChildProductItem.product_id,
            group_id: result.group_id,
            parent_product_id: result.product_id,
          });

          if (productItem.product_features) {
            await this.createProductFeatures(
              productItem.product_features,
              newChildProductItem.product_id,
              result.group_id,
            );
          }
          childrenProductsList = [
            ...childrenProductsList,
            {
              ...newChildProductItem,
              ...newChildProductDescription,
              ...newChildProductPrice,
              ...newChildProductSale,
              ...newChildProductCategory,
            },
          ];
        }

        result['children_products'] = childrenProductsList;
        return result;
      }
    }

    //TH2 : Nếu là sản phẩm con, có thể thay đổi sản phẩm cha
    if (currentProduct.parent_product_id !== result.parent_product_id) {
      // update category
      const parentProductCategory = await this.productCategoryRepo.findOne({
        product_id: result.parent_product_id,
      });

      let updatedProductCategory = await this.productCategoryRepo.update(
        { product_id: result.product_id },
        { category_id: parentProductCategory['category_id'] },
      );

      result = { ...result, ...updatedProductCategory };

      const parentProductGroupProduct =
        await this.productVariationGroupProductsRepo.findOne({
          product_id: result.parent_product_id,
        });

      let updatedProductGroupsProduct =
        await this.productVariationGroupProductsRepo.update(
          { product_id: result.product_id },
          {
            parent_product_id: result.parent_product_id,
            group_id: parentProductGroupProduct.group_id,
          },
        );

      result = { ...result, ...updatedProductGroupsProduct };

      if (data.product_features.length) {
        // delete all old product feature values by product id
        await this.productFeatureValueRepo.delete({
          product_id: result.product_id,
        });

        for (let { feature_id, variant_id } of data.product_features) {
          const productFeatureVariant =
            await this.productFeatureVariantDescriptionRepo.findOne({
              variant_id,
            });

          await this.productFeatureValueRepo.create({
            feature_id,
            variant_id,
            product_id: result['product_id'],
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
              group_id: result.group_id,
            });

          if (!checkProductGroupFeatureExist) {
            const feature: ProductFeatureDescriptionEntity =
              await this.productFeatureDescriptionRepo.findOne({ feature_id });
            await this.productVariationGroupFeatureRepo.create({
              feature_id,
              group_id: result.group_id,
              purpose: feature.description,
            });
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

  async syncData(data): Promise<any> {
    // set product
    const productData = {
      ...new ProductsEntity(),
      ...this.productRepo.setData(data),
    };

    let result = await this.productRepo.create({ ...productData });

    // set product description
    const productDescData = {
      ...new ProductDescriptionsEntity(),
      ...this.productDescriptionsRepo.setData(data),
    };

    const newProductsDesc = await this.productDescriptionsRepo.create({
      ...productDescData,
      product_id: result.product_id,
    });

    result = { ...result, ...newProductsDesc };

    //price
    const productPriceData = {
      ...new ProductPricesEntity(),
      ...this.productPriceRepo.setData(data),
    };
    const newProductPrice = await this.productPriceRepo.create({
      ...productPriceData,
      product_id: result.product_id,
    });

    result = { ...result, ...newProductPrice };

    //sale
    const productSale = {
      ...new ProductSalesEntity(),
      ...this.productSaleRepo.setData(data),
    };
    const newProductSale = await this.productSaleRepo.create({
      ...productSale,
      product_id: result.product_id,
    });

    result = { ...result, ...newProductSale };

    if (data.product_features.length) {
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

  async callSync(): Promise<void> {
    const productsList = productsData;

    for (let productItem of productsList) {
      await this.syncData(productItem);
    }
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

    if (Object.entries(productData).length) {
      const newProductsDesc = await this.productDescriptionsRepo.update(
        { product_id: result.product_id },
        productDescData,
      );
      result = { ...result, ...newProductsDesc };
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

    if (data.product_features.length) {
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
}
