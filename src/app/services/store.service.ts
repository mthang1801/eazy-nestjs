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
import { storesLocationJoiner } from 'src/utils/joinTable';
import { storeLocationSearchFilter } from 'src/utils/tableConditioner';
import { DatabaseService } from '../../database/database.service';
import { ProductStoreRepository } from '../repositories/productStore.repository';
import { ProductStoreEntity } from '../entities/productStore.entity';
import * as storesData from 'src/database/constant/stores.json';
import {
  convertToMySQLDateTime,
  convertNullDatetimeData,
} from '../../utils/helper';
@Injectable()
export class StoreService {
  constructor(
    private storeLocationRepo: StoreLocationRepository<StoreLocationEntity>,
    private storeLocationDescRepo: StoreLocationDescriptionsRepository<StoreLocationDescriptionEntity>,
    private districtRepo: DistrictRepository<DistrictEntity>,
    private cityRepo: CityRepository<CityEntity>,
    private wardRepo: WardRepository<WardEntity>,
    private databaseService: DatabaseService,
    private productStoreRepo: ProductStoreRepository<ProductStoreEntity>,
  ) {}

  async getAll() {
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

  async getList(params) {
    let { page, limit, search, status } = params;
    page = +page || 1;
    limit = +limit || 20;
    let skip = (page - 1) * limit;
    let filterConditions = {};
    if (status) {
      filterConditions[`${Table.STORE_LOCATIONS}.status`] = status;
    }

    const storesList = await this.storeLocationRepo.find({
      select: '*',
      join: storesLocationJoiner,
      where: storeLocationSearchFilter(search, filterConditions),
      skip,
      limit,
    });

    let count = await this.storeLocationRepo.find({
      select: `COUNT(DISTINCT(${Table.STORE_LOCATIONS}.store_location_id)) as total`,
      join: storesLocationJoiner,
      where: storeLocationSearchFilter(search, filterConditions),
    });

    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      stores: storesList,
    };
  }

  async getProductCount() {
    const storesList = await this.storeLocationDescRepo.find();
    if (storesList.length) {
      for (let storeItem of storesList) {
        let totalAmount = 0;
        const productsStore = await this.productStoreRepo.find({
          select: 'amount',
          where: { store_location_id: storeItem.store_location_id },
        });
        if (productsStore) {
          for (let { amount } of productsStore) {
            totalAmount += amount;
          }
          await this.storeLocationRepo.update(
            { store_location_id: storeItem.store_location_id },
            { product_count: totalAmount },
          );
        }
      }
    }
  }

  async clearAll() {
    await this.storeLocationDescRepo.writeExec(
      `TRUNCATE TABLE ${Table.STORE_LOCATION_DESCRIPTIONS}`,
    );
    await this.storeLocationRepo.writeExec(
      `TRUNCATE TABLE ${Table.STORE_LOCATIONS}`,
    );
  }

  async importStores() {
    await this.clearAll();
    const storesAppcore = storesData;

    const mappingData = new Map([
      ['id', 'store_location_id'],
      ['name', 'store_name'],
      ['address', 'pickup_address'],
      ['district', 'district_id'],
      ['city', 'city_id'],
      ['isActive', 'status'],
      ['createdAt', 'created_at'],
      ['updatedAt', 'updated_at'],
      ['shortName', 'short_name'],
      ['companyId', 'company_id'],
      ['position', 'position'],
      ['latitude', 'latitude'],
      ['longitude', 'longitude'],
      ['cityName', 'city_name'],
      ['districtName', 'district_name'],
      ['districtId', 'district_id'],
      ['cityId', 'city_id'],
      ['companyName', 'company_name'],
      ['areaName', 'arena_name'],
      ['areaId', 'area_id'],
      ['storeTypeName', 'type_name'],
    ]);

    for (let storeAppcore of storesAppcore) {
      let cmsData = {};
      for (let [core, cms] of mappingData) {
        cmsData[cms] = storeAppcore[core];
      }
      const storeLocationData = {
        ...new StoreLocationEntity(),
        ...this.storeLocationRepo.setData(cmsData),
        created_at: convertNullDatetimeData(cmsData['created_at']),
        updated_at: convertNullDatetimeData(cmsData['updated_at']),
      };

      await this.storeLocationRepo.createSync(storeLocationData);

      const storeLocationDataDesc = {
        ...new StoreLocationDescriptionEntity(),
        ...this.storeLocationDescRepo.setData(cmsData),
        store_location_id: cmsData['store_location_id'],
      };

      await this.storeLocationDescRepo.createSync(storeLocationDataDesc);
    }
  }
}
