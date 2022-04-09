import { Module, forwardRef, HttpModule } from '@nestjs/common';
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
import { ProductsController as ProductsControllerBE } from '../controllers/be/v1/products.controller';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductSalesRepository } from '../repositories/productSales.repository';
import { ProductVariationGroupsRepository } from '../repositories/productVariationGroups.repository';
import { ProductVariationGroupProductsRepository } from '../repositories/productVariationGroupProducts.entity';
import { ProductVariationGroupFeaturesRepository } from '../repositories/productVariationGroupFeatures.repository';
import { ProductsCategoriesRepository } from '../repositories/productsCategories.repository';
import { ProductsController as ProductsControllerFE } from '../controllers/fe/v1/product.controller';
import { CategoryModule } from './category.module';
import { ProductFeaturesRepository } from '../repositories/productFeature.repository';
import { ProductFeatureDescriptionsRepository } from '../repositories/productFeatureDescription.repository';
import { ProductFeatureVariantsRepository } from '../repositories/productFeatureVariants.repository';
import { ProductFeatureVariantDescriptionRepository } from '../repositories/productFeatureVariantDescriptions.repository';
import { ProductIntegrationController } from '../controllers/integration/products.controller';
import { StoreModule } from './store.module';
import { ProductStoreRepository } from '../repositories/productStore.repository';
import { ProductStoreHistoryRepository } from '../repositories/productStoreHistory.repository';
import { ProductSyncController } from '../controllers/sync/v1/product.controller';
import { StickerModule } from './sticker.module';
import { ProductTesterController } from '../controllers/tester/product.controller';
import { ProductVariationGroupIndexRepository } from '../repositories/productVariationGroupIndex.respository';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { ProductsReportController } from '../controllers/report/v1/product.controller';

@Module({
  imports: [forwardRef(() => CategoryModule), forwardRef(() => StickerModule)],
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
    ProductVariationGroupIndexRepository,
    ProductVariationGroupFeaturesRepository,
    ProductsCategoriesRepository,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
    ProductStoreRepository,
    ProductStoreHistoryRepository,
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
    ProductVariationGroupIndexRepository,
    ProductsCategoriesRepository,
    ProductFeaturesRepository,
    ProductFeatureDescriptionsRepository,
    ProductFeatureVariantsRepository,
    ProductFeatureVariantDescriptionRepository,
    ProductStoreRepository,
    ProductStoreHistoryRepository,
  ],
  controllers: [
    ProductsControllerBE,
    ProductsControllerFE,
    ProductIntegrationController,
    ProductSyncController,
    ProductTesterController,
    ProductsReportController,
  ],
})
export class ProductsModule {}
