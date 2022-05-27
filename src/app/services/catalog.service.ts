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
import { getPageSkipLimit } from '../../utils/helper';
import { catalogsListSearchFilter } from '../../utils/tableConditioner';
import { Table } from 'src/database/enums';

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

    const checkExistCatalog = await this.catalogRepo.find({
      catalog_name: data.catalog_name,
    });
    if (checkExistCatalog) {
      throw new HttpException('Ngành hàng đã tồn tại trong hệ thống.', 409);
    }

    const catalog = await this.catalogRepo.create(catalogData);
    for (let feature of data.features) {
      const catalogFeatureData = {
        ...new CatalogFeatureEntity(),
        ...this.catalogFeatureRepo.setData(feature),
        catalog_id: catalog.catalog_id,
      };
      const catalogFeature = await this.catalogFeatureRepo.create(
        catalogFeatureData,
      );
      for (let featureDetail of feature.featureDetails) {
        //console.log(featureDetail);
        const catalogFeatureDetailData = {
          ...new CatalogFeatureDetailEntity(),
          ...this.catalogFeatureDetailRepo.setData(featureDetail),
          catalog_feature_id: catalogFeature.catalog_feature_id,
        };
        await this.catalogFeatureDetailRepo.create(catalogFeatureDetailData);
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
}
