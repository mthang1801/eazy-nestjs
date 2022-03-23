import { Injectable, HttpException } from '@nestjs/common';

import { StoreLocationRepository } from '../repositories/storeLocation.repository';
import { StoreLocationEntity } from '../entities/storeLocation.entity';
import { StoreLocationDescriptionsRepository } from '../repositories/storeLocationDescriptions.repository';
import { StoreLocationDescriptionEntity } from '../entities/storeLocationDescription.entity';

import { JoinTable } from '../../database/enums/joinTable.enum';
import { Table } from '../../database/enums/tables.enum';
import axios from 'axios';
import { GET_STORES_API } from 'src/database/constant/api.appcore';
import { DistrictRepository } from '../repositories/district.repository';
import { DistrictEntity } from '../entities/districts.entity';
import { CityRepository } from '../repositories/city.repository';
import { CityEntity } from '../entities/cities.entity';
import { WardRepository } from '../repositories/ward.repository';
import { WardEntity } from '../entities/wards.entity';

@Injectable()
export class StoreService {
  constructor(
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
    private storeLocationDescRepo: StoreLocationDescriptionsRepository<StoreLocationDescriptionEntity>,
    private districtRepo: DistrictRepository<DistrictEntity>,
    private cityRepo: CityRepository<CityEntity>,
    private wardRepo: WardRepository<WardEntity>,
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

  async syncGet() {}
}
