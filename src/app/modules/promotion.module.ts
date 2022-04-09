import { Module } from '@nestjs/common';
import { PromotionController as PromotionControllerFE } from '../controllers/fe/v1/promotion.controller';
import { PromotionController as PromotionControllerBE } from '../controllers/be/v1/promotion.controller';
import { PromotionService } from '../services/promotion.service';
import { ProductsModule } from './products.module';

@Module({
  imports: [ProductsModule],
  controllers: [PromotionControllerFE, PromotionControllerBE],
  providers: [PromotionService],
  exports: [PromotionService],
})
export class PromotionModule {}
