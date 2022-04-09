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
import { Like } from 'src/database/operators/operators';
import { UpdateProductFeatureDto } from '../dto/productFeatures/update-productFeatures.dto';
import { IProductFeaturesResponse } from '../interfaces/productFeaturesResponse.interface';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductFeatureValueEntity } from '../entities/productFeaturesValues.entity';
import { ProductOptionVariantDescriptionRepository } from '../repositories/productOptionsVariantsDescriptions.respository';
import { ProductOptionVariantDescriptionEntity } from '../entities/productOptionsVariantsDescriptions.entity';
import * as _ from 'lodash';
import {
  productFeatures as productFeaturesData,
  productFeatures,
} from '../../database/constant/productFeatures';
import { SyncProductFeatureDto } from '../dto/productFeatures/sync-productFeature.dto';
import {
  formatStandardTimeStamp,
  removeVietnameseTones,
} from 'src/utils/helper';
import { convertToSlug, hasWhiteSpace } from '../../utils/helper';
import { SortBy } from '../../database/enums/sortBy.enum';
import {
  productFeatureSearchFilter,
  productFeatureVariantSearchFilter,
} from 'src/utils/tableConditioner';
import { DatabaseService } from 'src/database/database.service';
import { Equal, Not } from '../../database/operators/operators';
import { UpdateProductFeatureAppcoreDto } from '../dto/productFeatures/update-productFeature.appcore.dto';

import {
  covertProductFeaturesFromMagento,
  sqlGetFeatureValues,
} from 'src/utils/scriptSyncFromMagentor/productFeature.sync';
import {
  productFeatureJoiner,
  productFeatureVariantJoiner,
} from 'src/utils/joinTable';

@Injectable()
export class ProductFeatureService {
  constructor(
    private productFeaturesRepo: ProductFeaturesRepository<ProductFeatureEntity>,
    private productFeatureDescriptionRepo: ProductFeatureDescriptionsRepository<ProductFeatureDescriptionEntity>,
    private productFeatureVariantsRepo: ProductFeatureVariantsRepository<ProductFeatureVariantEntity>,
    private productFeatureVariantDescriptionRepo: ProductFeatureVariantDescriptionRepository<ProductFeatureVariantDescriptionEntity>,
    private productFeatureValuesRepo: ProductFeatureValueRepository<ProductFeatureValueEntity>,
    private ProductOptionVariantDescriptionRepository: ProductOptionVariantDescriptionRepository<ProductOptionVariantDescriptionEntity>,
    private magentoDatabaseService: DatabaseService,
  ) {}

  async create(
    data: CreateProductFeatureDto,
  ): Promise<IProductFeaturesResponse> {
    const checkFeatureCodeExist = await this.productFeaturesRepo.findOne({
      feature_code: data.feature_code,
    });
    if (checkFeatureCodeExist) {
      throw new HttpException('Feature code đã tồn tại', 409);
    }

    // create a new record on feature and feature_description
    const productFeatureData = this.productFeaturesRepo.setData(data);

    const newFeature = await this.productFeaturesRepo.create({
      ...productFeatureData,
      created_at: formatStandardTimeStamp(),
      updated_at: formatStandardTimeStamp(),
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
            variant_id: newFeatureVariant['variant_id'],
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
    let { page, limit, search, ...others } = params;
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
      join: productFeatureJoiner,
      orderBy: [
        { field: `${Table.PRODUCT_FEATURES}.updated_at`, sortBy: SortBy.DESC },
      ],
      where: productFeatureSearchFilter(search, filterCondition),
      skip,
      limit,
    });

    if (productFeatures.length) {
      for (let productFeatureItem of productFeatures) {
        let productFeatureVariants = await this.productFeatureVariantsRepo.find(
          {
            select: ['*'],
            join: productFeatureVariantJoiner,
            where: {
              [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]:
                productFeatureItem.feature_id,
            },
          },
        );

        productFeatureItem['feature_variants'] = productFeatureVariants;
      }
    } else {
      productFeatures = await this.findProductFeaturesByProductVariants(params);
    }

    return productFeatures;
  }

  async findProductFeaturesByProductVariants(params) {
    let { page, limit, search, ...others } = params;
    let filterConditions = {};
    if (others && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.productFeatureVariantsRepo.tableProps.includes(key)) {
          filterConditions[`${Table.PRODUCT_FEATURES_VARIANTS}.${key}`] =
            Like(val);
        } else {
          filterConditions[
            `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.${key}`
          ] = Like(val);
        }
      }
    }

    const featureVariants = await this.productFeatureVariantsRepo.find({
      select: '*',
      join: {
        [JoinTable.innerJoin]: {
          [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
            fieldJoin: 'variant_id',
            rootJoin: 'variant_id',
          },
        },
      },
      where: productFeatureVariantSearchFilter(search, filterConditions),
    });

    let productFeatures = [];
    if (featureVariants.length) {
      for (let featureVariant of featureVariants) {
        const productFeature = await this.productFeaturesRepo.findOne({
          select: '*',
          join: productFeatureJoiner,
          where: {
            [`${Table.PRODUCT_FEATURES}.feature_id`]: featureVariant.feature_id,
          },
        });

        if (productFeature) {
          let productFeatureVariants =
            await this.productFeatureVariantsRepo.find({
              select: ['*'],
              join: productFeatureVariantJoiner,
              where: {
                [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]:
                  featureVariant.feature_id,
              },
            });
          productFeature['feature_variants'] = productFeatureVariants;
          productFeatures = [...productFeatures, productFeature];
        }
      }
    }
    return productFeatures;
  }

  async itgCreate(productFeature: SyncProductFeatureDto) {
    console.log('itg Create');
    if (hasWhiteSpace(productFeature.feature_code)) {
      throw new HttpException('feature_code không thể có khoảng trắng', 400);
    }

    const checkProductFeature = await this.productFeaturesRepo.findOne({
      feature_code: productFeature.feature_code,
    });

    if ([0, 1].includes(+productFeature.status)) {
      productFeature.status = +productFeature.status == 0 ? 'A' : 'D';
    }

    if (checkProductFeature) {
      return this.itgUpdate(
        checkProductFeature['feature_code'],
        productFeature,
      );
    }

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
        if ([0, 1].includes(+featureVariant.status)) {
          featureVariant.status = +featureVariant.status == 0 ? 'A' : 'D';
        }

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

  async itgUpdate(feature_code, data: UpdateProductFeatureAppcoreDto) {
    console.log('itg Update');
    const checkProductFeature = await this.productFeaturesRepo.findOne({
      feature_code,
    });
    if (!checkProductFeature) {
      await this.itgCreate({ feature_code, ...data });
    }

    if ([0, 1].includes(+data.status)) {
      data.status = +data.status == 0 ? 'A' : 'D';
    }

    const productFeatureData = {
      ...this.productFeaturesRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };

    await this.productFeaturesRepo.update(
      { feature_id: checkProductFeature.feature_id },
      productFeatureData,
    );

    const productFeatureDesc = await this.productFeatureDescriptionRepo.findOne(
      { feature_id: checkProductFeature.feature_id },
    );
    if (productFeatureDesc) {
      const updateProductFeatureData =
        this.productFeatureDescriptionRepo.setData(data);
      if (Object.entries(updateProductFeatureData).length) {
        await this.productFeatureDescriptionRepo.update(
          { feature_id: checkProductFeature.feature_id },
          updateProductFeatureData,
        );
      }
    } else {
      const newProductFeatureData = {
        ...new ProductFeatureDescriptionEntity(),
        ...this.productFeatureDescriptionRepo.setData(data),
        feature_id: checkProductFeature.feature_id,
      };
      await this.productFeatureDescriptionRepo.createSync(
        newProductFeatureData,
      );
    }

    if (data['feature_values'] && data['feature_values'].length) {
      for (let featureVariant of data['feature_values']) {
        let checkFeatureVariant = await this.productFeatureVariantsRepo.findOne(
          {
            select: '*',
            join: productFeatureVariantJoiner,
            where: {
              [`${Table.PRODUCT_FEATURES_VARIANTS}.variant_code`]:
                featureVariant['variant_code'],
              [`${Table.PRODUCT_FEATURES_VARIANTS}.feature_id`]:
                checkProductFeature.feature_id,
            },
          },
        );

        if ([0, 1].includes(+featureVariant.status)) {
          featureVariant.status = +featureVariant.status == 0 ? 'A' : 'D';
        }

        if (checkFeatureVariant) {
          const productFeatureVariantData =
            this.productFeatureVariantsRepo.setData(featureVariant);
          if (Object.entries(productFeatureVariantData).length) {
            const udpateVariant = await this.productFeatureVariantsRepo.update(
              { variant_id: checkFeatureVariant['variant_id'] },
              {
                ...productFeatureVariantData,
                feature_id: checkProductFeature.feature_id,
              },
            );
          }

          const productFeatureVariantDescData = {
            ...this.productFeatureVariantDescriptionRepo.setData(
              featureVariant,
            ),
            variant_id: checkFeatureVariant['variant_id'],
          };

          if (Object.entries(productFeatureVariantDescData).length) {
            await this.productFeatureVariantDescriptionRepo.update(
              { variant_id: checkFeatureVariant['variant_id'] },
              productFeatureVariantDescData,
            );
          }
        } else {
          const productFeatureVariantData = {
            ...new ProductFeatureVariantEntity(),
            ...this.productFeatureVariantsRepo.setData(featureVariant),
          };
          const newVariant = await this.productFeatureVariantsRepo.create({
            ...productFeatureVariantData,
            feature_id: checkProductFeature.feature_id,
          });

          const productFeatureVariantDescData = {
            ...new ProductFeatureVariantDescriptionEntity(),
            ...this.productFeatureVariantDescriptionRepo.setData(
              featureVariant,
            ),
            variant_id: newVariant.variant_id,
          };

          await this.productFeatureVariantDescriptionRepo.createSync(
            productFeatureVariantDescData,
          );
        }
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

    if (data.feature_code) {
      const checkFeatureCode = await this.productFeaturesRepo.findOne({
        feature_id: Not(Equal(id)),
        feature_code: data.feature_code,
      });
      if (checkFeatureCode) {
        throw new HttpException('Feature code đã tồn tại', 409);
      }
    }

    const productFeatureData = {
      ...this.productFeaturesRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };
    let updatedFeature = {};
    if (Object.entries(productFeatureData).length) {
      updatedFeature = await this.productFeaturesRepo.update(
        { feature_id: id },
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
    // let willDeleteVariants = [];

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
    // willDeleteVariants = currentVariantLists.filter(
    //   (variantId) =>
    //     !willUpdateVariants.some(({ variant_id }) => variantId === variant_id),
    // );

    // Kiểm tra các variant này có tồn tại trong bảng ddv_product_features_values hay chưa, nếu có thì không được xoá
    // for (let variantId of willDeleteVariants) {
    //   let checkVariantExists = await this.productFeatureValuesRepo.findOne({
    //     select: ['*'],
    //     join: {
    //       [JoinTable.leftJoin]: {
    //         [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
    //           fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
    //           rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
    //         },
    //       },
    //     },
    //     where: { [`${Table.PRODUCT_FEATURE_VALUES}.variant_id`]: variantId },
    //   });

    //   if (checkVariantExists) {
    //     logErrorsDelete =
    //       logErrorsDelete === '' ? `Không thể xoá variant : ` : logErrorsDelete;
    //     logErrorsDelete += `${checkVariantExists.value} (${checkVariantExists.variant_id}), `;
    //     continue;
    //   }
    //   await this.productFeatureVariantsRepo.delete({ variant_id: variantId });
    //   await this.productFeatureVariantDescriptionRepo.delete({
    //     variant_id: variantId,
    //   });
    // }

    const setVarianItem = async (
      variantItem,
      type = 'create',
    ): Promise<void> => {
      let updatedResult = {};

      const productFeatureVariantData =
        this.productFeatureVariantsRepo.setData(variantItem);

      const productFeatureDescriptionData =
        this.productFeatureVariantDescriptionRepo.setData(variantItem);

      if (type === 'create') {
        let checkVariantNameExist =
          await this.productFeatureVariantsRepo.findOne({
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
          });

        if (checkVariantNameExist) {
          logErrorsCreateUpdate =
            logErrorsCreateUpdate === ''
              ? `Lỗi trùng lặp, không thể cập nhật hoặc thêm mới variant có tên: ${checkVariantNameExist.variant}`
              : logErrorsCreateUpdate + `, ${checkVariantNameExist.variant}`;

          variantsList = [...variantsList, { ...checkVariantNameExist }];

          return;
        }
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
            variant_code:
              productFeatureVariantData['variant_code'] ??
              convertToSlug(removeVietnameseTones(variantItem['variant'])),
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
    // await this.clearAll();
    // for (let dataItem of productFeaturesData) {
    //   await this.itgCreate(dataItem);
    // }
  }

  async syncImports() {
    await this.clearAll();
    const featuresValues = await this.magentoDatabaseService.executeMagentoPool(
      sqlGetFeatureValues,
    );
    if (featuresValues[0].length) {
      for (let featureValue of featuresValues[0]) {
        const convertedData = covertProductFeaturesFromMagento(featureValue);

        const productFeatureData = {
          ...new ProductFeatureEntity(),
          ...this.productFeaturesRepo.setData(convertedData),
        };

        let productFeature = await this.productFeaturesRepo.findOne({
          feature_code: convertedData['feature_code'],
        });
        if (!productFeature) {
          productFeature = await this.productFeaturesRepo.create(
            productFeatureData,
          );
        }

        let productFeatureDesc =
          await this.productFeatureDescriptionRepo.findOne({
            feature_id: productFeature.feature_id,
          });
        if (!productFeatureDesc) {
          const productFeatureDescData = {
            ...new ProductFeatureDescriptionEntity(),
            ...this.productFeatureDescriptionRepo.setData(convertedData),
            feature_id: productFeature.feature_id,
          };
          productFeatureDesc = await this.productFeatureDescriptionRepo.create(
            productFeatureDescData,
          );
        }

        let productFeatureVariant =
          await this.productFeatureVariantsRepo.findOne({
            feature_id: productFeature.feature_id,
            variant_code: convertedData['variant_code'],
          });
        if (!productFeatureVariant) {
          const productFeatureValueData = {
            ...new ProductFeatureVariantEntity(),
            ...this.productFeatureVariantsRepo.setData(convertedData),
            feature_id: productFeature.feature_id,
          };
          productFeatureVariant = await this.productFeatureVariantsRepo.create(
            productFeatureValueData,
          );
        }

        let productFeatureVariantDesc =
          await this.productFeatureVariantDescriptionRepo.findOne({
            variant_id: productFeatureVariant.variant_id,
          });
        if (!productFeatureVariantDesc) {
          const productFeatureVariantDescData = {
            ...new ProductFeatureVariantDescriptionEntity(),
            ...this.productFeatureVariantDescriptionRepo.setData(convertedData),
            variant_id: productFeatureVariant.variant_id,
          };
          await this.productFeatureVariantDescriptionRepo.create(
            productFeatureVariantDescData,
          );
        }
      }
    }
  }
}
