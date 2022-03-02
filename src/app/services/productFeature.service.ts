import { Injectable, HttpException } from '@nestjs/common';
import { ProductFeatureEntity } from '../entities/productFeature.entity';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { CreateProductFeatureDto } from '../dto/productFeatures/create-productFeatures.dto';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureDescriptionEntity } from '../entities/productFeatureDescription.entity';
import { ProductFeatureVariantEntity } from '../entities/productFeatureVariant.entity';
import { ProductFeatureVariantDescriptionEntity } from '../entities/productFeatureVariantDescription.entity';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureDisplayStatus } from 'src/database/enums/tableFieldEnum/productFeature.enum';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { Table } from 'src/database/enums';
import { Like } from 'src/database/find-options/operators';
import { UpdateProductFeatureDto } from '../dto/productFeatures/update-productFeatures.dto';
import { IProductFeaturesResponse } from '../interfaces/productFeaturesResponse.interface';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductFeatureValueEntity } from '../entities/productFeaturesValues.entity';
import { ProductOptionVariantDescriptionRepository } from '../repositories/productOptionsVariantsDescriptions.respository';
import { ProductOptionVariantDescriptionEntity } from '../entities/productOptionsVariantsDescriptions.entity';
import * as _ from 'lodash';
import { productFeatures as productFeaturesData } from '../../database/constant/productFeatures';
import { SyncProductFeatureDto } from '../dto/productFeatures/sync-productFeature.dto';
import { removeVietnameseTones } from 'src/utils/helper';
import { convertToSlug } from '../../utils/helper';
import { SortBy } from '../../database/enums/sortBy.enum';
@Injectable()
export class ProductFeatureService {
  constructor(
    private productFeaturesRepo: ProductFeaturesRepository<ProductFeatureEntity>,
    private productFeatureDescriptionRepo: ProductFeatureDescriptionsRepository<ProductFeatureDescriptionEntity>,
    private productFeatureVariantsRepo: ProductFeatureVariantsRepository<ProductFeatureVariantEntity>,
    private productFeatureVariantDescriptionRepo: ProductFeatureVariantDescriptionRepository<ProductFeatureVariantDescriptionEntity>,
    private productFeatureValuesRepo: ProductFeatureValueRepository<ProductFeatureValueEntity>,
    private ProductOptionVariantDescriptionRepository: ProductOptionVariantDescriptionRepository<ProductOptionVariantDescriptionEntity>,
  ) {}

  async create(
    data: CreateProductFeatureDto,
  ): Promise<IProductFeaturesResponse> {
    // create a new record on feature and feature_description
    const productFeatureData = this.productFeaturesRepo.setData(data);

    const newFeature = await this.productFeaturesRepo.create({
      ...productFeatureData,
    });

    let result = { ...newFeature };

    const featureDescriptionData =
      this.productFeatureDescriptionRepo.setData(data);

    const newFeatureDesription =
      await this.productFeatureDescriptionRepo.create({
        ...featureDescriptionData,
        feature_id: result.feature_id,
      });

    result = { ...result, ...newFeatureDesription };

    let feature_variants = [];
    // create record item on feature_variant and feature_variant_description from feature_values
    if (data.feature_values.length) {
      for (let feature_value of data.feature_values) {
        const featureVariantData =
          this.productFeatureVariantsRepo.setData(feature_value);

        const newFeatureVariant: ProductFeatureVariantEntity =
          await this.productFeatureVariantsRepo.create({
            ...featureVariantData,
            variant_code: featureVariantData['variant_code']
              ? featureVariantData['variant_code']
              : convertToSlug(removeVietnameseTones(feature_value.variant)),
            feature_id: newFeature.feature_id,
          });

        const featureVariantDescription =
          this.productFeatureVariantDescriptionRepo.setData(feature_value);

        const newFeatureVariantDescription: ProductFeatureVariantDescriptionEntity =
          await this.productFeatureVariantDescriptionRepo.create({
            ...featureVariantDescription,
            variant_id: newFeatureVariant.variant_id,
          });

        feature_variants.push({
          ...newFeatureVariant,
          ...newFeatureVariantDescription,
        });
      }

      result = { ...result, feature_variants: [...feature_variants] };
    }

    return result;
  }

  async getList(params): Promise<IProductFeaturesResponse[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 20;
    const skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productFeaturesRepo.tableProps.includes(key)) {
          filterCondition[`${Table.PRODUCT_FEATURES}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.PRODUCT_FEATURE_DESCRIPTIONS}.${key}`] =
            Like(val);
        }
      }
    }

    let productFeatures = await this.productFeaturesRepo.find({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
            fieldJoin: 'feature_id',
            rootJoin: 'feature_id',
          },
        },
      },
      orderBy: [
        { field: `${Table.PRODUCT_FEATURES}.feature_id`, sortBy: SortBy.DESC },
      ],
      where: filterCondition,
      skip,
      limit,
    });

    if (productFeatures.length) {
      for (let productFeatureItem of productFeatures) {
        let productFeatureVariant = await this.productFeatureVariantsRepo.find({
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
            [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]:
              productFeatureItem.feature_id,
          },
        });

        productFeatureItem['feature_variants'] = productFeatureVariant;
      }
    }

    return productFeatures;
  }

  async createSync(productFeature: SyncProductFeatureDto) {
    const productFeatureData = {
      ...new ProductFeatureEntity(),
      ...this.productFeaturesRepo.setData(productFeature),
    };
    if (!productFeatureData.feature_id) {
      delete productFeatureData.feature_id;
    }
    const newProductFeature = await this.productFeaturesRepo.create(
      productFeatureData,
    );

    let result = { ...newProductFeature };

    const productFeatureDescData = {
      ...new ProductFeatureDescriptionEntity(),
      ...this.productFeatureDescriptionRepo.setData(productFeature),
    };

    await this.productFeatureDescriptionRepo.create({
      ...productFeatureDescData,
      feature_id: result.feature_id,
    });

    if (productFeature?.feature_values?.length) {
      for (let featureVariant of productFeature.feature_values) {
        const productFeatureVariantData = {
          ...new ProductFeatureVariantEntity(),
          ...this.productFeatureVariantsRepo.setData(featureVariant),
        };
        const newVariant = await this.productFeatureVariantsRepo.create({
          ...productFeatureVariantData,
          feature_id: result.feature_id,
        });

        const productFeatureVariantDescData = {
          ...new ProductFeatureVariantDescriptionEntity(),
          ...this.productFeatureVariantDescriptionRepo.setData(featureVariant),
        };

        await this.productFeatureVariantDescriptionRepo.create({
          ...productFeatureVariantDescData,
          variant_id: newVariant.variant_id,
        });
      }
    }
  }

  async getById(id: number): Promise<IProductFeaturesResponse> {
    let result = await this.productFeaturesRepo.findOne({
      select: ['*'],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
            fieldJoin: 'feature_id',
            rootJoin: 'feature_id',
          },
        },
      },
      where: { [`${Table.PRODUCT_FEATURES}.feature_id`]: id },
    });

    if (!result) {
      throw new HttpException('Không tìm thấy thuộc tính sản phẩm.', 404);
    }

    // If product feature has existed, find product variants from it
    if (result) {
      let productVariants = await this.productFeatureVariantsRepo.find({
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
          [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]: result.feature_id,
        },
      });

      result['feature_variants'] = productVariants;
    }
    return result;
  }

  async update(id: number, data: UpdateProductFeatureDto): Promise<any> {
    const checkProductFeatureExist = await this.productFeaturesRepo.findById(
      id,
    );
    if (!checkProductFeatureExist) {
      throw new HttpException('Không tìm thấy thuộc tính sản phẩm.', 404);
    }

    const productFeatureData = this.productFeaturesRepo.setData(data);
    let updatedFeature = {};
    if (Object.entries(productFeatureData).length) {
      updatedFeature = await this.productFeaturesRepo.update(
        id,
        productFeatureData,
      );
    }

    let result = { ...checkProductFeatureExist, ...updatedFeature };

    const productFeatureDescriptionData =
      this.productFeatureDescriptionRepo.setData(data);
    let updatedFeatureDescription = {};
    if (Object.entries(productFeatureDescriptionData).length) {
      updatedFeatureDescription =
        await this.productFeatureDescriptionRepo.update(
          { feature_id: id },
          productFeatureDescriptionData,
        );
    }

    result = { ...result, ...updatedFeatureDescription };

    // find all variant_id contained in feature
    let currentVariantLists = await this.productFeatureVariantsRepo.find({
      select: [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`],
      where: { feature_id: id },
    });
    // Nếu trong danh sách cập nhật không có variant_id, sẽ được liệt kê vào danh sách sẽ xoá
    let willDeleteVariants = [];

    currentVariantLists = currentVariantLists.map(
      ({ variant_id }) => variant_id,
    );

    let variantsList = [];
    let logErrorsDelete = '';
    let logErrorsCreateUpdate = '';

    let willCreateNewVariants = [];
    let willUpdateVariants = [];

    if (data.feature_values.length) {
      for (let variantItem of data.feature_values) {
        if (variantItem.variant_id) {
          willUpdateVariants = [...willUpdateVariants, { ...variantItem }];
        } else {
          willCreateNewVariants = [
            ...willCreateNewVariants,
            { ...variantItem },
          ];
        }
      }
    }

    // Xoá các variants không nằm trong variant update
    willDeleteVariants = currentVariantLists.filter(
      (variantId) =>
        !willUpdateVariants.some(({ variant_id }) => variantId === variant_id),
    );

    // Kiểm tra các variant này có tồn tại trong bảng ddv_product_features_values hay chưa, nếu có thì không được xoá
    for (let variantId of willDeleteVariants) {
      let checkVariantExists = await this.productFeatureValuesRepo.findOne({
        select: ['*'],
        join: {
          [JoinTable.leftJoin]: {
            [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
              fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
              rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
            },
          },
        },
        where: { [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]: variantId },
      });

      if (checkVariantExists) {
        logErrorsDelete =
          logErrorsDelete === '' ? `Không thể xoá variant : ` : logErrorsDelete;
        logErrorsDelete += `${checkVariantExists.value} (${checkVariantExists.variant_id}), `;
        continue;
      }
      await this.productFeatureVariantsRepo.delete({ variant_id: variantId });
      await this.productFeatureVariantDescriptionRepo.delete({
        variant_id: variantId,
      });
    }

    const setVarianItem = async (
      variantItem,
      type = 'create',
    ): Promise<void> => {
      let updatedResult = {};

      const productFeatureVariantData =
        this.productFeatureVariantsRepo.setData(variantItem);

      const productFeatureDescriptionData =
        this.productFeatureVariantDescriptionRepo.setData(variantItem);

      let checkVariantNameExist = await this.productFeatureVariantsRepo.findOne(
        {
          select: ['*'],
          join: {
            [JoinTable.leftJoin]: {
              [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
                fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
                rootJoin: `${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`,
              },
            },
          },
          where: {
            [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]: id,
            [`${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant`]:
              variantItem.variant,
          },
        },
      );

      if (checkVariantNameExist) {
        logErrorsCreateUpdate =
          logErrorsCreateUpdate === ''
            ? `Lỗi trùng lặp, không thể cập nhật hoặc thêm mới variant có tên: ${checkVariantNameExist.variant}`
            : logErrorsCreateUpdate + `, ${checkVariantNameExist.variant}`;

        variantsList = [...variantsList, { ...checkVariantNameExist }];

        return;
      }

      if (type === 'update') {
        if (Object.entries(productFeatureVariantData).length) {
          const updatedProductFeatureVariant =
            await this.productFeatureVariantsRepo.update(
              { variant_id: variantItem['variant_id'] },
              productFeatureVariantData,
            );
          updatedResult = {
            ...updatedResult,
            ...updatedProductFeatureVariant,
          };
        }

        if (Object.entries(productFeatureDescriptionData).length) {
          const updatedProductFeatureVariantDesc =
            await this.productFeatureVariantDescriptionRepo.update(
              { variant_id: variantItem.variant_id },
              productFeatureDescriptionData,
            );
          updatedResult = {
            ...updatedResult,
            ...updatedProductFeatureVariantDesc,
          };
        }
      } else {
        const newProductFeatureVariant =
          await this.productFeatureVariantsRepo.create({
            ...productFeatureVariantData,
            feature_id: result['feature_id'],
          });

        updatedResult = { ...newProductFeatureVariant };

        const newProductFeatureDescription =
          await this.productFeatureVariantDescriptionRepo.create({
            ...productFeatureDescriptionData,
            variant_id: updatedResult['variant_id'],
          });
        updatedResult = { ...updatedResult, ...newProductFeatureDescription };
      }
      variantsList = [...variantsList, { ...updatedResult }];

      return;
    };

    // Ưu tiên update trước, tạo mới sau
    if (willUpdateVariants.length) {
      for (let variantItem of willUpdateVariants) {
        await setVarianItem(variantItem, 'update');
      }
    }

    if (willCreateNewVariants.length) {
      for (let variantItem of willCreateNewVariants) {
        await setVarianItem(variantItem, 'create');
      }
    }

    result['feature_variants'] = _.uniqBy(variantsList, 'variant_id');

    return {
      result,
      message: `${logErrorsCreateUpdate} 
      ${logErrorsDelete}
      `,
    };
  }

  async clearAll() {
    await this.productFeaturesRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_FEATURES}`,
    );
    await this.productFeatureDescriptionRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_FEATURE_DESCRIPTIONS}`,
    );
    await this.productFeatureVariantsRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_FEATURES_VARIANTS}`,
    );
    await this.productFeatureVariantDescriptionRepo.writeExec(
      `TRUNCATE TABLE ${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}`,
    );
  }

  async callSync() {
    for (let dataItem of productFeaturesData) {
      await this.createSync(dataItem);
    }
  }
}
