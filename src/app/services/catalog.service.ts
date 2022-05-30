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
import { getPageSkipLimit } from '../../utils/helper';
import { catalogsListSearchFilter } from '../../utils/tableConditioner';
import { Table } from 'src/database/enums';
import { sortBy } from 'lodash';
import { SortBy } from '../../database/enums/sortBy.enum';

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

    const checkExistCatalog = await this.catalogRepo.findOne({
      catalog_name: data.catalog_name,
    });

    if (checkExistCatalog) {
      throw new HttpException('Ngành hàng đã tồn tại trong hệ thống.', 409);
    }

    const catalog = await this.catalogRepo.create(catalogData);
    if (data.catalog_features && data.catalog_features.length) {
      for (let feature of data.catalog_features) {
        const catalogFeatureData = {
          ...new CatalogFeatureEntity(),
          ...this.catalogFeatureRepo.setData(feature),
          catalog_id: catalog.catalog_id,
        };
        const catalogFeature = await this.catalogFeatureRepo.create(
          catalogFeatureData,
        );
        if (
          feature.catalog_feature_details &&
          feature.catalog_feature_details.length
        ) {
          for (let featureDetail of feature.catalog_feature_details) {
            //console.log(featureDetail);
            const catalogFeatureDetailData = {
              ...new CatalogFeatureDetailEntity(),
              ...this.catalogFeatureDetailRepo.setData(featureDetail),
              catalog_feature_id: catalogFeature.catalog_feature_id,
            };
            await this.catalogFeatureDetailRepo.create(
              catalogFeatureDetailData,
            );
          }
        }
      }
    }

    return data;
  }

  async getList(params: any = {}) {
    let { page, skip, limit } = getPageSkipLimit(params);
    let { search } = params;

    let filterConditions = {};

    const catalogList = await this.catalogRepo.find({
      select: '*',
      where: catalogsListSearchFilter(search, filterConditions),
      orderBy: [{ field: `${Table.CATALOG}.updated_at`, sortBy: SortBy.DESC }],
      skip,
      limit,
    });

    let count = await this.catalogRepo.find({
      select: `COUNT(${Table.CATALOG}.catalog_id) as total`,
      where: catalogsListSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      data: catalogList,
    };
  }

  async getCatalogRestrict(catalog_id) {
    const catalog = await this.catalogRepo.findOne({ catalog_id, status: 'A' });

    const catalogFeatures = await this.catalogFeatureRepo.find({
      catalog_id: catalog.catalog_id,
      status: 'A',
    });

    let catalog_features = [];

    for (let catalogFeature of catalogFeatures) {
      //let catalog_feature_details = [];
      let catalog_feature_details = await this.catalogFeatureDetailRepo.find({
        catalog_feature_id: catalogFeature.catalog_feature_id,
        status: 'A',
      });
      let catalog_feature = {
        ...catalogFeature,
        catalog_feature_details: catalog_feature_details,
      };
      catalog_features.push(catalog_feature);
    }

    const result = {
      ...catalog,
      catalog_features: catalog_features,
    };
    return result;
  }

  async getById(catalog_id) {
    const catalog = await this.catalogRepo.findOne({ catalog_id });

    const catalogFeatures = await this.catalogFeatureRepo.find({
      catalog_id: catalog.catalog_id,
    });

    let catalog_features = [];

    for (let catalogFeature of catalogFeatures) {
      //let catalog_feature_details = [];
      let catalog_feature_details = await this.catalogFeatureDetailRepo.find({
        catalog_feature_id: catalogFeature.catalog_feature_id,
      });
      let catalog_feature = {
        ...catalogFeature,
        catalog_feature_details: catalog_feature_details,
      };
      catalog_features.push(catalog_feature);
    }

    const result = {
      ...catalog,
      catalog_features: catalog_features,
    };
    return result;
  }

  async update(catalog_id, data: UpdateCatalogDto) {
    const catalog = await this.catalogRepo.findOne({ catalog_id });
    console.log(catalog);

    const catalogInfo = {
      ...this.catalogRepo.setData(data),
    };
    await this.catalogRepo.update({ catalog_id }, catalogInfo);
    if (data.catalog_features && data.catalog_features.length) {
      for (let feature of data.catalog_features) {
        // Nếu có truyền vào id của catalog_feature thì tiến hành cập nhật
        if (feature.catalog_feature_id) {
          //const featureInfo = await this.catalogFeatureRepo.findOne({catalog_feature_id: feature.catalog_feature_id});
          const featureData = {
            ...this.catalogFeatureRepo.setData(feature),
          };
          await this.catalogFeatureRepo.update(
            { catalog_feature_id: feature.catalog_feature_id },
            featureData,
          );

          if (
            feature.catalog_feature_details &&
            feature.catalog_feature_details.length
          ) {
            for (let featureDetail of feature.catalog_feature_details) {
              if (featureDetail.detail_id) {
                //const featureDetailInfo = await this.catalogFeatureDetailRepo.findOne({detail_id: featureDetail.detail_id});
                const featureDetailData = {
                  ...this.catalogFeatureDetailRepo.setData(featureDetail),
                };
                await this.catalogFeatureDetailRepo.update(
                  { detail_id: featureDetail.detail_id },
                  featureDetailData,
                );
              } else {
                console.log('Cần tạo mới feature detail.');
                const featureDetailData = {
                  ...new CatalogFeatureDetailEntity(),
                  ...this.catalogFeatureDetailRepo.setData(featureDetail),
                  catalog_feature_id: feature.catalog_feature_id,
                };
                await this.catalogFeatureDetailRepo.create(featureDetailData);
              }
            }
          }
        }
        // Nếu không truyền vào id của catalog_feature thì tiến hành tạo mới
        else {
          console.log('Cần tạo mới catalog_feature.');
          const catalogFeatureData = {
            ...new CatalogFeatureEntity(),
            ...this.catalogFeatureRepo.setData(feature),
            catalog_id: catalog.catalog_id,
          };
          const catalogFeature = await this.catalogFeatureRepo.create(
            catalogFeatureData,
          );
          if (
            feature.catalog_feature_details &&
            feature.catalog_feature_details.length
          ) {
            for (let featureDetail of feature.catalog_feature_details) {
              //console.log(featureDetail);
              const catalogFeatureDetailData = {
                ...new CatalogFeatureDetailEntity(),
                ...this.catalogFeatureDetailRepo.setData(featureDetail),
                catalog_feature_id: catalogFeature.catalog_feature_id,
              };
              await this.catalogFeatureDetailRepo.create(
                catalogFeatureDetailData,
              );
            }
          }
        }
      }
    }

    return this.getById(catalog_id);
  }
}
