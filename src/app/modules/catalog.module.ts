import { Module } from '@nestjs/common';
import { CatalogService } from '../services/catalog.service';
import { CatalogFeatureRepository } from '../repositories/catalogFeature.repository';
import { CatalogRepository } from '../repositories/catalog.repository';
import { CatalogFeatureValueProductRepository } from '../repositories/catalogFetureValueProduct.repository';
import { CatalogController } from '../controllers/be/v1/catalog.controller';

@Module({
  providers: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogRepository,
    CatalogFeatureValueProductRepository,
  ],
  exports: [
    CatalogService,
    CatalogFeatureRepository,
    CatalogRepository,
    CatalogFeatureValueProductRepository,
  ],
  controllers: [CatalogController],
})
export class CatalogModule {}
