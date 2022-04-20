import { Module } from '@nestjs/common';
import { ShippingFeeRepository } from '../repositories/shippingFee.repository';
import { ShippingFeeLocationRepository } from '../repositories/shippingFeeLocation.repository';
import { ShippingFeeService } from '../services/shippingFee.service';
import { ShippingFeesController } from '../controllers/be/v1/shippingFee.controller';

@Module({
  providers: [
    ShippingFeeService,
    ShippingFeeRepository,
    ShippingFeeLocationRepository,
  ],
  exports: [
    ShippingFeeService,
    ShippingFeeRepository,
    ShippingFeeLocationRepository,
  ],
  controllers: [ShippingFeesController],
})
export class ShippingFeeModule {}
