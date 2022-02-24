import { Module } from '@nestjs/common';
import { StoreController } from '../controllers/be/store.controller';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationDescriptionsRepository } from '../repositories/storeLocationDescriptions.repository';
import { StoreService } from '../services/store.service';

@Module({
  providers: [
    StoreService,
    StoreLocationRepository,
    StoreLocationDescriptionsRepository,
  ],
  exports: [
    StoreService,
    StoreLocationRepository,
    StoreLocationDescriptionsRepository,
  ],
  controllers: [StoreController],
})
export class StoreModule {}
