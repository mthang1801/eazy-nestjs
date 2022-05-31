import { Module, Global } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { CatalogFeatureRepository } from '../repositories/catalogFeature.repository';
import { CatalogRepository } from '../repositories/catalog.repository';
import { CatalogFeatureValueProductRepository } from '../repositories/catalogFetureValueProduct.repository';
import { CatalogController } from '../controllers/be/v1/catalog.controller';
import { CatalogFeatureDetailRepository } from '../repositories/catalogFeatureDetail.repository';

@Global()
@Module({
  providers: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogRepository,
    CatalogFeatureDetailRepository,
    CatalogFeatureValueProductRepository,
    CatalogFeatureDetailRepository,
  ],
  exports: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogFeatureDetailRepository,
    CatalogRepository,
    CatalogFeatureValueProductRepository,
    CatalogFeatureDetailRepository,
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
