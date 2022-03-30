import { Module } from '@nestjs/common';
import { PromotionAccessoryService } from '../services/promotionAccessory.service';
import { PromotionAccessoryRepository } from '../repositories/promotionAccessory.repository';
import { ProductPromotionAccessoryRepository } from '../repositories/productPromotionAccessory.repository';
import { PromotionAccessoriesController } from '../controllers/be/promotionAccessory.controller';
@Module({
  providers: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    ProductPromotionAccessoryRepository,
  ],
  exports: [
    PromotionAccessoryService,
    PromotionAccessoryRepository,
    ProductPromotionAccessoryRepository,
  ],
  controllers: [PromotionAccessoriesController],
})
export class PromotionAccessoryModule {}
