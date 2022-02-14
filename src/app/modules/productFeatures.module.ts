import { Module } from '@nestjs/common';
import { ProductFeatureController } from '../controllers/be/productFeature.controller';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';

import { ProductFeatureService } from '../services/productFeature.service';

@Module({
  providers: [
    ProductFeatureService,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
  ],
  exports: [
    ProductFeatureService,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
  ],
  controllers: [ProductFeatureController],
})
export class ProductFeaturesModule {}
