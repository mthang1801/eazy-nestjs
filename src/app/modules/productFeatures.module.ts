import { forwardRef, Module } from '@nestjs/common';
import { ProductFeatureController } from '../controllers/be/productFeature.controller';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';

import { ProductFeatureService } from '../services/productFeature.service';
import { ProductsModule } from './products.module';
import { ProductFeatureController as ProductFeatureIntegrationController } from '../controllers/integration/productFeature.controller';
import { ProductFeatureSyncController } from '../controllers/sync/productFeatures.controller';

@Module({
  imports: [forwardRef(() => ProductsModule)],
  providers: [
    ProductFeatureService,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
    ProductFeatureValueRepository,
  ],
  exports: [
    ProductFeatureService,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
    ProductFeatureValueRepository,
  ],
  controllers: [
    ProductFeatureController,
    ProductFeatureIntegrationController,
    ProductFeatureSyncController,
  ],
})
export class ProductFeaturesModule {}
