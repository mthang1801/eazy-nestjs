import {
  Module,
  forwardRef,
  HttpModule,
  NestModule,
  MiddlewareConsumer,
} from '@nestjs/common';
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
import { ProductIntegrationController } from '../controllers/integration/v1/products.controller';
import { StoreModule } from './store.module';
import { ProductStoreRepository } from '../repositories/productStore.repository';
import { ProductStoreHistoryRepository } from '../repositories/productStoreHistory.repository';
import { ProductSyncController } from '../controllers/sync/v1/product.controller';
import { StickerModule } from './sticker.module';
import { ProductTesterController } from '../controllers/tester/product.controller';
import { ProductVariationGroupIndexRepository } from '../repositories/productVariationGroupIndex.respository';
import { ProductsReportController } from '../controllers/report/v1/product.controller';

import { getUserFromToken } from '../../middlewares/getUserFromToken';

import { ReviewRepository } from '../repositories/review.repository';
import { ReviewCommentItemRepository } from '../repositories/reviewCommentItem.repository';
import { ReviewsCommentsModule } from './reviewsComment.module';
import { LogRepository } from '../repositories/log.repository';
import { CategoryFeaturesRepository } from '../repositories/categoryFeatures.repository';
import { TradeinProgramService } from '../services/tradeinProgram.service';
import { TradeinProgramRepository } from '../repositories/tradeinProgram.repository';
import { TradeinProgramDetailRepository } from '../repositories/tradeinProgramDetail.repository';
import { TradeinProgramCriteriaDetailEntity } from '../entities/tradeinProgramCriteriaDetail.entity';
import { TradeinProgramCriteriaRepository } from '../repositories/tradeinProgramCriteria.repository';
import { TradeinProgramCriteriaDetailRepository } from '../repositories/tradeinProgramCriteriaDetail.repository';
import { ValuationBillRepository } from '../repositories/valuationBill.repository';
import { ValuationBillCriteriaDetailEntity } from '../entities/valuationBillCriteriaDetail.entity';
import { ValuationBillCriteriaDetailRepository } from '../repositories/valuationBillCriteriaDetail.repository';
import { TradeinProgramModule } from './tradeinProgram.module';
import { CatalogModule } from './catalog.module';
import { CatalogFeatureValueProductRepository } from '../repositories/catalogFetureValueProduct.repository';
import { MessageProducerService } from '../microservices/queue/producers/message.producer';
import { QueueModule } from './queue.module';
import { CatalogRepository } from '../repositories/catalog.repository';
import { AudioProducerService } from '../microservices/queue/producers/audio.producer';
import { BannerItemRepository } from '../repositories/bannerItemDescription.repository';

@Module({
  imports: [
    forwardRef(() => CategoryModule),
    forwardRef(() => StickerModule),
    ReviewsCommentsModule,
    CatalogModule,
    QueueModule,
  ],
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
    ReviewRepository,
    ReviewCommentItemRepository,
    LogRepository,
    CategoryFeaturesRepository,
    CatalogFeatureValueProductRepository,
    BannerItemRepository,
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
    ReviewRepository,
    ReviewCommentItemRepository,
    CatalogFeatureValueProductRepository,
    CategoryFeaturesRepository,
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
