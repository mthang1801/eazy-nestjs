import { Module, Global } from '@nestjs/common';
import { DiscountProgramRepository } from '../repositories/discountProgram.repository';
import { DiscountProgramDetailRepository } from '../repositories/discountProgramDetail.repository';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductPricesRepository } from '../repositories/productPrices.repository';
import { ProductDescriptionsRepository } from '../repositories/productDescriptions.respository';
import { DiscountProgramItgController } from '../controllers/integration/v1/discountProgram.controller';
import { DiscountProgramService } from '../services/discountProgram.service';
@Global()
@Module({
  providers: [
    DiscountProgramService,
    DiscountProgramRepository,
    DiscountProgramDetailRepository,
    ProductsRepository,
    ProductPricesRepository,
    ProductDescriptionsRepository,
  ],
  exports: [
    DiscountProgramService,
    DiscountProgramRepository,
    DiscountProgramDetailRepository,
  ],
  controllers: [DiscountProgramItgController],
})
export class DiscountProgramModule {}
