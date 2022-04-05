import { Module, Global } from '@nestjs/common';
import { PromotionAccessoryService } from '../services/promotionAccessory.service';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { PromotionAccessoriesController } from '../controllers/be/promotionAccessory.controller';
import { ProductsRepository } from '../repositories/products.repository';
import { PromotionAccessoryItgController } from '../controllers/integration/promotionAccessory.controller';
@Global()
@Module({
  providers: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    ProductPromotionAccessoryRepository,
    ProductsRepository,
  ],
  exports: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    ProductPromotionAccessoryRepository,
  ],
  controllers: [
    PromotionAccessoriesController,
    PromotionAccessoryItgController,
  ],
})
export class PromotionAccessoryModule {}
