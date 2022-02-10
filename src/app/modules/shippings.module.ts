import { Module } from '@nestjs/common';
import { ShippingDescriptionRepository } from '../repositories/shipping_description.repository';
import { ShippingRepository } from '../repositories/shippings.repository';
import { ShippingServiceDescriptionRepository } from '../repositories/shipping_service_description.repository';
import { ShippingServiceRepository } from '../repositories/shippings_service.repository';
import { ShippingController } from '../controllers/be/shippings.controller';

import { ShippingService } from '../services/shippings.service';


@Module({
    controllers: [ShippingController],
    providers: [
        ShippingService, ShippingRepository,
         ShippingDescriptionRepository,
         ShippingServiceDescriptionRepository,
     ShippingServiceRepository, String],
    exports: [ShippingService],
    imports: [],

})
export class ShippingModule { }