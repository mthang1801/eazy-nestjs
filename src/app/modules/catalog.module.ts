import { Module } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { CatalogFeatureRepository } from '../repositories/catalogFeature.repository';
import { CatalogRepository } from '../repositories/catalog.repository';
import { CatalogFeatureValueProductRepository } from '../repositories/catalogFetureValueProduct.repository';
import { CatalogController } from '../controllers/be/v1/catalog.controller';
import { CatalogFeatureDetailRepository } from '../repositories/catalogFeatureDetail.repository';

@Module({
  providers: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogRepository,
    CatalogFeatureValueProductRepository,
    CatalogFeatureDetailRepository,
  ],
  exports: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogRepository,
    CatalogFeatureValueProductRepository,
    CatalogFeatureDetailRepository,
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
