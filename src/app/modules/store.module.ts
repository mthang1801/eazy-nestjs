import { Module, Global } from '@nestjs/common';
import { StoreController } from '../controllers/be/v1/store.controller';
import { StoreControllerFE } from '../controllers/fe/v1/store.controller';
import { StoreSyncController } from '../controllers/sync/v1/store.controller';
import { ProductStoreRepository } from '../repositories/productStore.repository';
import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationDescriptionsRepository } from '../repositories/storeLocationDescriptions.repository';
import { StoreService } from '../services/store.service';

@Global()
@Module({
  providers: [
    StoreService,
    StoreLocationRepository,
    StoreLocationDescriptionsRepository,
    ProductStoreRepository,
  ],
  exports: [
    StoreService,
    StoreLocationRepository,
    StoreLocationDescriptionsRepository,
    ProductStoreRepository,
  ],
  controllers: [StoreController, StoreSyncController, StoreControllerFE],
})
export class StoreModule {}
