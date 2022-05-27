import { Injectable, HttpException } from '@nestjs/common';
import { CreateCatalogDto } from '../dto/catalog/create-catalog.dto';
import { CatalogEntity } from '../entities/catalog.entity';
import { CatalogFeatureEntity } from '../entities/catalogFeature.entity';
import { CatalogRepository } from '../repositories/catalog.repository';
import { CatalogFeatureRepository } from '../repositories/catalogFeature.repository';
import { CatalogFeatureValueProductRepository } from '../repositories/catalogFetureValueProduct.repository';
import { CatalogFeatureValueProductEntity } from '../entities/catalogFeatureValueProduct.entity';
import { CatalogFeatureDetailEntity } from '../entities/catalogFeatureDetail.entity';
import { CatalogFeatureDetailRepository } from '../repositories/catalogFeatureDetail.repository';
import { UpdateCatalogDto } from '../dto/catalog/update-catalog.dto';

@Injectable()
export class CatalogService {
  constructor(
    private catalogRepo: CatalogRepository<CatalogEntity>,
    private catalogFeatureRepo: CatalogFeatureRepository<CatalogFeatureEntity>,
    private catalogFeatureDetailRepo: CatalogFeatureDetailRepository<CatalogFeatureDetailEntity>,
  ) {}
  async create(data: CreateCatalogDto) {
    const catalogData = {
      ...new CatalogEntity(),
      ...this.catalogRepo.setData(data),
    };
    console.log(data);
    const checkExistCatalog = await this.catalogRepo.findOne({catalog_name: data.catalog_name});
    console.log(checkExistCatalog);
    if (checkExistCatalog){
      throw new HttpException("Ngành hàng đã tồn tại trong hệ thống.", 409);
    }

    const catalog = await this.catalogRepo.create(catalogData);
    if (data.features && data.features.length) {
      for (let feature of data.features){
        const catalogFeatureData = {
          ...new CatalogFeatureEntity(),
          ...this.catalogFeatureRepo.setData(feature),
          catalog_id: catalog.catalog_id,
        }
        const catalogFeature = await this.catalogFeatureRepo.create(catalogFeatureData);
        if (feature.featureDetails && feature.featureDetails.length) {
          for (let featureDetail of feature.featureDetails){
            //console.log(featureDetail);
            const catalogFeatureDetailData = {
              ...new CatalogFeatureDetailEntity(),
              ...this.catalogFeatureDetailRepo.setData(featureDetail),
              catalog_feature_id: catalogFeature.catalog_feature_id,
            }
            await this.catalogFeatureDetailRepo.create(catalogFeatureDetailData);
          }
        }
      }
    }

    return data;
  }

  async get() {
    const catalogList = await this.catalogRepo.find();

    for (let catalog of catalogList){

    }

    return catalogList;
  }

  async getById(catalog_id) {
    const catalog = await this.catalogRepo.findOne({catalog_id});

    const catalogFeatures = await this.catalogFeatureRepo.find({catalog_id: catalog.catalog_id});

    let catalog_features = [];

    for (let catalogFeature of catalogFeatures) {
      //let catalog_feature_details = [];
      let catalog_feature_details = await this.catalogFeatureDetailRepo.find({catalog_feature_id: catalogFeature.catalog_feature_id});
      let catalog_feature = {
        ...catalogFeature,
        catalog_feature_details: catalog_feature_details
      }
      catalog_features.push(catalog_feature);
    }

    const result = {
      ...catalog,
      catalog_features: catalog_features,
    }
    return result;
  }

  async update(catalog_id, data: UpdateCatalogDto) {
    const catalog = await this.catalogRepo.findOne({catalog_id});
    console.log(catalog);

    const catalogInfo = {
      ...this.catalogRepo.setData(data),
    }
    await this.catalogRepo.update(
      {catalog_id},
      catalogInfo,
    )
    if(data.features && data.features.length) {
      for (let feature of data.features) {
        // Nếu có truyền vào id của catalog_feature thì tiến hành cập nhật
        if (feature.catalog_feature_id) {
          //const featureInfo = await this.catalogFeatureRepo.findOne({catalog_feature_id: feature.catalog_feature_id});
          const featureInfo = {
            ...this.catalogFeatureRepo.setData(feature),
          }
          await this.catalogFeatureRepo.update(
            {catalog_feature_id: feature.catalog_feature_id},
            featureInfo,
          )

          if (feature.featureDetails && feature.featureDetails.length) {
            for (let featureDetail of feature.featureDetails) {
              if (featureDetail.detail_id) {
                //const featureDetailInfo = await this.catalogFeatureDetailRepo.findOne({detail_id: featureDetail.detail_id});
                const featureDetailInfo = {
                  ...this.catalogFeatureDetailRepo.setData(featureDetail),
                }
                await this.catalogFeatureDetailRepo.update(
                  {detail_id: featureDetail.detail_id},
                  featureDetailInfo,
                )
              }
              else {
                console.log("Cần tạo mới feature detail.");
              }
            }
          }
        }
        // Nếu không truyền vào id của catalog_feature thì tiến hành tạo mới
        else {
          console.log("Cần tạo mới catalog_feature.");
        }
      }
    }

    return this.getById(catalog_id);
  }
}
