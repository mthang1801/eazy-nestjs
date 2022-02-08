import { Module } from '@nestjs/common';
import { ShippingDescriptionRepository } from '../repositories/shipping_description.repository';
import { ShippingRepository } from '../repositories/shippings.repository';
import { ShippingServiceDescriptionRepository } from '../repositories/shipping_service_description.repository';
import { ShippingServiceRepository } from '../repositories/shippings_service.repository';
import { ShippingController } from '../controllers/be/shippings.controller';

import { ShippingService } from '../services/shippings.service';
import { ShippingDescriptionService } from '../services/shipping_description.service';
import { ShippingServiceService } from '../services/shippings_service.service';
import { ShippingServiceDescriptionService } from '../services/shipping_service_description.service';

@Module({
    controllers: [ShippingController],
    providers: [
        ShippingService, ShippingRepository,
        ShippingDescriptionService, ShippingDescriptionRepository,
        ShippingServiceDescriptionService, ShippingServiceDescriptionRepository,
        ShippingServiceService, ShippingServiceRepository, String],
    exports: [ShippingService,ShippingDescriptionService,ShippingServiceDescriptionService,ShippingServiceService],
    imports: [],

})
export class ShippingModule { }