import { Module } from '@nestjs/common';
import { PromotionAccessoryService } from '../services/promotionAccessory.service';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { PromotionAccessoriesController } from '../controllers/be/promotionAccessory.controller';
import { ProductsRepository } from '../repositories/products.repository';
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
  controllers: [PromotionAccessoriesController],
})
export class PromotionAccessoryModule {}
