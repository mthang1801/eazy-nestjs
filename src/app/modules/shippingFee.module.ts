import { Module } from '@nestjs/common';
import { ShippingFeeRepository } from '../repositories/shippingFee.repository';
import { ShippingFeeLocationRepository } from '../repositories/shippingFeeLocation.repository';
import { ShippingFeeService } from '../services/shippingFee.service';
import { ShippingFeesController as ShippingFeesControllerBE } from '../controllers/be/v1/shippingFee.controller';
import { ShippingFeesController as ShippingFeesControllerFE } from '../controllers/fe/v1/shippingFee.controller';
import { UserRepository } from '../repositories/user.repository';

@Module({
  providers: [
    ShippingFeeService,
    ShippingFeeRepository,
    ShippingFeeLocationRepository,
    UserRepository,
  ],
  exports: [
    ShippingFeeService,
    ShippingFeeRepository,
    ShippingFeeLocationRepository,
    UserRepository,
  ],
  controllers: [ShippingFeesControllerBE, ShippingFeesControllerFE],
})
export class ShippingFeeModule {}
