import { Module } from '@nestjs/common';
import { FlashSalesController } from '../controllers/be/flashSale.controller';
import { FlashSaleRepository } from '../repositories/flashSale.repository';
import { FlashSaleDetailRepository } from '../repositories/flashSaleDetail.repository';
import { FlashSaleProductRepository } from '../repositories/flashSaleProduct.repository';
import { FlashSalesService } from '../services/flashSale.service';
import { ProductsModule } from './products.module';
@Module({
  controllers: [FlashSalesController],
  providers: [
    FlashSaleProductRepository,
    FlashSaleRepository,
    FlashSaleDetailRepository,
    FlashSalesService,
  ],
  exports: [
    FlashSaleProductRepository,
    FlashSaleRepository,
    FlashSaleDetailRepository,
    FlashSalesService,
  ],
  imports: [ProductsModule],
})
export class FlashSaleModule {}
