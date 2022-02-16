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
    // create a new record on feature and feature_description
    const productFeatureData = this.productFeaturesRepo.setData(data);
    const newFeature: ProductFeatureEntity =
      await this.productFeaturesRepo.create(productFeatureData);

    const featureDescriptionData =
      this.productFeatureDescriptionRepo.setData(data);
    const newFeatureDesription: ProductFeatureDescriptionEntity =
      await this.productFeatureDescriptionRepo.create({
        ...featureDescriptionData,
        feature_id: newFeature.feature_id,
      });

    let feature_variants = [];
    // create record item on feature_variant and feature_variant_description from feature_values
    for (let feature_value of data.feature_values) {
      const featureVariantData =
        this.productFeatureVariantsRepo.setData(feature_value);

      const newFeatureVariant: ProductFeatureVariantEntity =
        await this.productFeatureVariantsRepo.create({
          ...featureVariantData,
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
    const updatedFeature = await this.productFeaturesRepo.update(
      { feature_id: id },
      productFeatureData,
    );

    const featureDescriptionData =
      this.productFeatureDescriptionRepo.setData(data);
    const udpatedFeatureDescription =
      await this.productFeatureDescriptionRepo.update(
        { feature_id: id },
        featureDescriptionData,
      );

    let feature_variants = [];
    for (let feature_value of data.feature_values) {
      const featureVariantData =
        this.productFeatureVariantsRepo.setData(feature_value);

      const featureVariantDescriptionData =
        this.productFeatureVariantDescriptionRepo.setData(feature_value);
      // if has variant_id -> update
      if (feature_value.variant_id) {
        const updatedFeatureVariant =
          await this.productFeatureVariantsRepo.update(
            { variant_id: feature_value.variant_id },
            featureVariantData,
          );
        const updatedFeatureVariantDescription =
          await this.productFeatureVariantDescriptionRepo.update(
            { variant_id: feature_value.variant_id },
            featureVariantDescriptionData,
          );
        feature_variants.push({
          ...updatedFeatureVariant,
          ...updatedFeatureVariantDescription,
        });
        continue;
      }
      // if has no variant_id -> create new
      const newFeatureVariant: ProductFeatureVariantEntity =
        await this.productFeatureVariantsRepo.create({
          ...featureVariantData,
          feature_id: id,
        });
      const featureVariantDescription: ProductFeatureVariantDescriptionEntity =
        await this.productFeatureVariantDescriptionRepo.create({
          ...featureVariantDescriptionData,
          variant_id: newFeatureVariant.variant_id,
        });
      feature_variants.push({
        ...newFeatureVariant,
        ...featureVariantDescription,
      });
    }
    return {
      ...updatedFeature,
      ...udpatedFeatureDescription,
      feature_values: [...feature_variants],
    };
  }

  async delete(id: number): Promise<void> {
    // delete product feature
    let result = await this.productFeaturesRepo.delete(id);
    if (!result) {
      throw new HttpException('Không tìm thấy thuộc tính sản phẩm.', 404);
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
