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
@Injectable()
export class ProductFeatureService {
  constructor(
    private productFeaturesRepo: ProductFeaturesRepository<ProductFeatureEntity>,
    private productFeatureDescriptionRepo: ProductFeatureDescriptionsRepository<ProductFeatureDescriptionEntity>,
    private productFeatureVariantsRepo: ProductFeatureVariantsRepository<ProductFeatureVariantEntity>,
    private productFeatureVariantDescriptionRepo: ProductFeatureVariantDescriptionRepository<ProductFeatureVariantDescriptionEntity>,
  ) {}

  async create(
    data: CreateProductFeatureDto,
  ): Promise<IProductFeaturesResponse> {
    const { feature_name, feature_values, display_status } = data;
    // create a new record on feature and feature_description
    const newFeature: ProductFeatureEntity =
      await this.productFeaturesRepo.create({
        display_on_catalog: display_status
          ? ProductFeatureDisplayStatus.Yes
          : ProductFeatureDisplayStatus.No,
      });

    const newFeatureDesription: ProductFeatureDescriptionEntity =
      await this.productFeatureDescriptionRepo.create({
        feature_id: newFeature.feature_id,
        description: feature_name,
      });

    let feature_variants = [];
    // create record item on feature_variant and feature_variant_description from feature_values
    for (let feature_value of feature_values) {
      const newFeatureVariant: ProductFeatureVariantEntity =
        await this.productFeatureVariantsRepo.create({
          feature_id: newFeature.feature_id,
        });
      const newFeatureVariantDescription: ProductFeatureVariantDescriptionEntity =
        await this.productFeatureVariantDescriptionRepo.create({
          variant_id: newFeatureVariant.variant_id,
          variant: feature_value,
        });
      feature_variants.push({
        ...newFeatureVariant,
        ...newFeatureVariantDescription,
      });
    }

    return { ...newFeature, ...newFeatureDesription, feature_variants };
  }

  async getList(params): Promise<IProductFeaturesResponse[]> {
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
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

  async update(
    id: number,
    data: UpdateProductFeatureDto,
  ): Promise<IProductFeaturesResponse> {
    const checkProductFeatureExist = await this.productFeaturesRepo.findById(
      id,
    );
    if (!checkProductFeatureExist) {
      throw new HttpException('Không tìm thấy thuộc tính sản phẩm.', 404);
    }

    const productFeaturesData = this.productFeaturesRepo.setData(data);
    const updatedFeaturesData = await this.productFeaturesRepo.update(
      checkProductFeatureExist.feature_id,
      productFeaturesData,
    );

    let productFeatureDescription =
      await this.productFeatureDescriptionRepo.findOne({
        feature_id: checkProductFeatureExist.feature_id,
      });

    const productFeatureDescriptionsData =
      this.productFeatureDescriptionRepo.setData(data);

    if (
      productFeatureDescription &&
      Object.entries(productFeatureDescriptionsData).length
    ) {
      productFeatureDescription =
        await this.productFeatureDescriptionRepo.update(
          productFeatureDescription.feature_description_id,
          productFeatureDescriptionsData,
        );
    }

    return { ...updatedFeaturesData, ...productFeatureDescription };
  }

  async delete(id: number): Promise<void> {
    // delete product feature
    let result = await this.productFeaturesRepo.delete(id);
    if (!result) {
      throw new HttpException('Không tìm thấy dữ liệu để xoá', 404);
    }
    // delete product feature description
    await this.productFeatureDescriptionRepo.delete({ feature_id: id });

    let feature_variants = await this.productFeatureVariantsRepo.find({
      where: { feature_id: id },
    });
    // delete product feature vairants and description
    for (let feature_variant of feature_variants) {
      await this.productFeatureVariantsRepo.delete(feature_variant.variant_id);
      await this.productFeatureVariantDescriptionRepo.delete({
        variant_id: feature_variant.variant_id,
      });
    }
  }
}
