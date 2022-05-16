import { Module, Global } from '@nestjs/common';
import { PromotionAccessoryService } from '../services/promotionAccessory.service';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { PromotionAccessoryDetailRepository } from '../repositories/promotionAccessoryDetail.repository';
import { PromotionAccessoriesController } from '../controllers/be/v1/promotionAccessory.controller';
import { ProductsRepository } from '../repositories/products.repository';
import { PromotionAccessoryItgController } from '../controllers/integration/v1/promotionAccessory.controller';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
@Global()
@Module({
  providers: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    PromotionAccessoryDetailRepository,
    ProductsRepository,
    ProductPricesRepository,
  ],
  exports: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    PromotionAccessoryDetailRepository,
  ],
  controllers: [
    PromotionAccessoriesController,
    PromotionAccessoryItgController,
  ],
})
export class PromotionAccessoryModule {}
