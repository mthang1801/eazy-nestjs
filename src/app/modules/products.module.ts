import { Module, forwardRef } from '@nestjs/common';
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
import { ProductsController as ProductsControllerBE } from '../controllers/be/products.controller';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductSalesRepository } from '../repositories/productSales.repository';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupFeaturesRepository } from '../repositories/productVariationGroupFeatures.repository';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { ProductsController as ProductsControllerFE } from '../controllers/fe/product.controller';
import { CategoryModule } from './category.module';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductIntegrationController } from '../controllers/integration/products.controller';

@Module({
  imports: [forwardRef(() => CategoryModule)],
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
    ProductPricesRepository,
    ProductSalesRepository,
    ProductVariationGroupsRepository,
    ProductVariationGroupProductsRepository,
    ProductVariationGroupFeaturesRepository,
    ProductsCategoriesRepository,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
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
    ProductPricesRepository,
    ProductSalesRepository,
    ProductVariationGroupsRepository,
    ProductVariationGroupProductsRepository,
    ProductVariationGroupFeaturesRepository,
    ProductsCategoriesRepository,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
  ],
  controllers: [
    ProductsControllerBE,
    ProductsControllerFE,
    ProductIntegrationController,
  ],
})
export class ProductsModule {}
