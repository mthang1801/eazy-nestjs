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
// import * as storesData from 'src/database/constant/stores.json';
import {
  convertToMySQLDateTime,
  convertNullDatetimeData,
} from '../../utils/helper';
import { CreateStoreDto } from '../dto/stores/create-store.dto';
import { LocatorService } from './locator.service';
import { UpdateStoreDto } from 'src/app/dto/stores/update-store.dto';
import * as moment from 'moment';
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
    private locatorService: LocatorService,
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

  async CMScreate(data: CreateStoreDto) {
    if (data.city_id) {
      const city = await this.locatorService.getCitiesList(data.city_id);
      if (city.length) {
        data['city_name'] = city[0].city_name;
      }
    }
    if (data.city_id && data.district_id) {
      const district = await this.locatorService.getDistrictsList(
        data.city_id,
        data.district_id,
      );
      if (district.length) {
        data['district_name'] = district[0].district_name;
      }
    }

    if (data.ward_id && data.city_id && data.district_id) {
      const ward = await this.locatorService.getWardsList(
        data.district_id,
        data.ward_id,
      );

      if (ward.length) {
        data['ward_name'] = ward[0].ward_name;
      }
    }

    const storeLocationData = {
      ...new StoreLocationEntity(),
      ...this.storeLocationRepo.setData(data),
    };

    const newStoreLocation = await this.storeLocationRepo.create(
      storeLocationData,
    );

    const storeLocationDesData = {
      ...new StoreLocationDescriptionEntity(),
      ...this.storeLocationDescRepo.setData(data),
      store_location_id: newStoreLocation.store_location_id,
    };

    await this.storeLocationDescRepo.createSync(storeLocationDesData);
  }

  async CMSupdate(store_location_id: number, data: UpdateStoreDto) {
    const store = await this.storeLocationRepo.findOne({ store_location_id });
    if (!store) {
      throw new HttpException('Không tìm thấy cửa hàng.', 404);
    }

    if (data.city_id) {
      const city = await this.locatorService.getCitiesList(data.city_id);
      if (city.length) {
        data['city_name'] = city[0].city_name;
      }
    }
    if (data.city_id && data.district_id) {
      const district = await this.locatorService.getDistrictsList(
        data.city_id,
        data.district_id,
      );
      if (district.length) {
        data['district_name'] = district[0].district_name;
      }
    }

    if (data.ward_id && data.city_id && data.district_id) {
      const ward = await this.locatorService.getWardsList(
        data.district_id,
        data.ward_id,
      );

      if (ward.length) {
        data['ward_name'] = ward[0].ward_name;
      }
    }

    let storeLocationData = this.storeLocationRepo.setData(data);
    if (Object.entries(storeLocationData).length) {
      await this.storeLocationRepo.update(
        { store_location_id },
        storeLocationData,
      );
    }

    let storeLocationDesc = await this.storeLocationDescRepo.findOne({
      store_location_id,
    });
    if (storeLocationDesc) {
      let storeLocationDescData = this.storeLocationDescRepo.setData(data);
      if (Object.entries(storeLocationDescData).length) {
        await this.storeLocationDescRepo.update(
          { store_location_id },
          storeLocationDescData,
        );
      }
    } else {
      let newStoreLocationData = {
        ...new StoreLocationDescriptionEntity(),
        ...this.storeLocationDescRepo.setData(data),
        store_location_id,
      };
      await this.storeLocationDescRepo.createSync(newStoreLocationData);
    }
  }

  async importStores() {
    // await this.clearAll();
    // const storesAppcore = storesData;
    // const mappingData = new Map([
    //   ['id', 'store_location_id'],
    //   ['name', 'store_name'],
    //   ['address', 'pickup_address'],
    //   ['district', 'district_id'],
    //   ['city', 'city_id'],
    //   ['isActive', 'status'],
    //   ['createdAt', 'created_at'],
    //   ['updatedAt', 'updated_at'],
    //   ['shortName', 'short_name'],
    //   ['companyId', 'company_id'],
    //   ['position', 'position'],
    //   ['latitude', 'latitude'],
    //   ['longitude', 'longitude'],
    //   ['cityName', 'city_name'],
    //   ['districtName', 'district_name'],
    //   ['districtId', 'district_id'],
    //   ['cityId', 'city_id'],
    //   ['companyName', 'company_name'],
    //   ['areaName', 'arena_name'],
    //   ['areaId', 'area_id'],
    //   ['storeTypeName', 'type_name'],
    //   ['isActive', 'status'],
    // ]);
    // for (let storeAppcore of storesAppcore) {
    //   let cmsData = {};
    //   for (let [core, cms] of mappingData) {
    //     if (core === 'isActive') {
    //       cmsData[cms] = storeAppcore[core] == 1 ? 'A' : 'D';
    //       continue;
    //     }
    //     cmsData[cms] = storeAppcore[core];
    //   }
    //   const storeLocationData = {
    //     ...new StoreLocationEntity(),
    //     ...this.storeLocationRepo.setData(cmsData),
    //     created_at: convertNullDatetimeData(cmsData['created_at']),
    //     updated_at: convertNullDatetimeData(cmsData['updated_at']),
    //   };
    //   await this.storeLocationRepo.createSync(storeLocationData);
    //   const storeLocationDataDesc = {
    //     ...new StoreLocationDescriptionEntity(),
    //     ...this.storeLocationDescRepo.setData(cmsData),
    //     store_location_id: cmsData['store_location_id'],
    //   };
    //   await this.storeLocationDescRepo.createSync(storeLocationDataDesc);
    // }
  }
}
