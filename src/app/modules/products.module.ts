import { Module } from '@nestjs/common';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductService } from '../services/products.service';
import { ProductDescriptionsRepository } from '../repositories/productDescriptions.respository';
import { ProductPointPriceRepository } from '../repositories/productPointPrice.repository';
import { ProductOptionsInventoryRepository } from '../repositories/productOptionsInventory.repository';
import { ProductFeatureValueRepository } from '../repositories/productFeaturesValues.repository';
import { ProductOptionsRepository } from '../repositories/productOptions.repository';
import { ProductOptionDescriptionRepository } from '../repositories/productOptionsDescriptions.repository';
import { ProductOptionVariantsRepository } from '../repositories/productOptionVariants.repository';
import { ProductOptionVariantDescriptionRepository } from '../repositories/productOptionsVariantsDescriptions.respository';

@Module({
  providers: [
    ProductService,
    ProductsRepository,
    ProductDescriptionsRepository,
    ProductPointPriceRepository,
    ProductOptionsInventoryRepository,
    ProductFeatureValueRepository,
    ProductOptionsRepository,
    ProductOptionDescriptionRepository,
    ProductOptionVariantsRepository,
    ProductOptionVariantDescriptionRepository,
  ],
  exports: [
    ProductService,
    ProductsRepository,
    ProductDescriptionsRepository,
    ProductPointPriceRepository,
    ProductOptionsInventoryRepository,
    ProductFeatureValueRepository,
    ProductOptionsRepository,
    ProductOptionDescriptionRepository,
    ProductOptionVariantsRepository,
    ProductOptionVariantDescriptionRepository,
  ],
})
export class ProductsModule {}
