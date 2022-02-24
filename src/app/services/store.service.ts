import { Injectable, HttpException } from '@nestjs/common';

import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
import { StoreLocationDescriptionsRepository } from '../repositories/storeLocationDescriptions.repository';
import { StoreLocationDescriptionEntity } from '../entities/storeLocationDescription.entity';
import { storesData } from 'src/database/constant/stores';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { Table } from '../../database/enums/tables.enum';

@Injectable()
export class StoreService {
  constructor(
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
    private storeLocationDescRepo: StoreLocationDescriptionsRepository<StoreLocationDescriptionEntity>,
  ) {}

  async getList() {
    return this.storeLocationRepo.find({
      select: ['*'],
      join: {
        [JoinTable.innerJoin]: {
          [Table.STORE_LOCATION_DESCRIPTIONS]: {
            fieldJoin: 'store_location_id',
            rootJoin: 'store_location_id',
          },
        },
      },
    });
  }
}
