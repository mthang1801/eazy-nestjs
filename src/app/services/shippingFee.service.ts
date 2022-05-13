import { Injectable, HttpException } from '@nestjs/common';
import { ShippingFeeEntity } from '../entities/shippingFee.entity';
import { ShippingFeeLocationEntity } from '../entities/shippingFeeLocation.entity';
import { ShippingFeeRepository } from '../repositories/shippingFee.repository';
import { ShippingFeeLocationRepository } from '../repositories/shippingFeeLocation.repository';
import { CreateShippingFeeDto } from '../dto/shippingFee/create-shippingFee.dto';
import { CreateShippingFeeLocationDto } from '../dto/shippingFee/create-shippingFeeLocation.dto';
import { CityRepository } from '../repositories/city.repository';
import { CityEntity } from '../entities/cities.entity';
import { CityService } from './city.service';
import { formatStandardTimeStamp, getPageSkipLimit } from '../../utils/helper';
import { UpdateShippingFeeLocationDto } from '../dto/shippingFee/update-shippingFeeLocation.dto';
import { Table } from 'src/database/enums';
import { Like } from '../../database/operators/operators';
import { shippingFeeLocationsJoiner, userJoiner } from '../../utils/joinTable';
import { JoinTable } from '../../database/enums/joinTable.enum';
import { SortBy } from '../../database/enums/sortBy.enum';
import { UserRepository } from '../repositories/user.repository';
import { UserEntity } from '../entities/user.entity';
import { userSelector } from '../../utils/tableSelector';

@Injectable()
export class ShippingFeeService {
  constructor(
    private shippingFeeRepo: ShippingFeeRepository<ShippingFeeEntity>,
    private shippingFeeLocationRepo: ShippingFeeLocationRepository<ShippingFeeLocationEntity>,
    private cityService: CityService,
    private userRepo: UserRepository<UserEntity>,
  ) {}
  async createShippingFee(data: CreateShippingFeeDto, user) {
    const shippingFeeData = {
      ...new ShippingFeeEntity(),
      ...this.shippingFeeRepo.setData(data),
      created_by: user.user_id,
    };
    return this.shippingFeeRepo.create(shippingFeeData);
  }

  async updateShippingFee(shipping_fee_id, data, user) {
    const updateShippingFeeData = {
      ...this.shippingFeeRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
      updated_by: user.user_id,
    };
    await this.shippingFeeRepo.update(
      { shipping_fee_id },
      updateShippingFeeData,
    );

    return this.get(shipping_fee_id);
  }

  async createShippingFeeByLocation(
    data: CreateShippingFeeLocationDto,
    shipping_fee_id: number,
    user,
  ) {
    if (data.shippingFees && data.shippingFees.length) {
      await this.shippingFeeLocationRepo.delete({ shipping_fee_id });
      for (let shippingFee of data.shippingFees) {
        const checkExist = await this.shippingFeeLocationRepo.findOne({
          city_id: shippingFee.city_id,
          shipping_fee_id,
        });
        if (checkExist) {
          await this.shippingFeeLocationRepo.update(
            { shipping_fee_location_id: checkExist.shipping_fee_location_id },
            { value_fee: shippingFee.value_fee },
          );
          continue;
        }

        let cityName = await this.cityService.get(+shippingFee.city_id, true);
        let shippingFeeLocationData = {
          ...new ShippingFeeLocationEntity(),
          ...this.shippingFeeLocationRepo.setData(shippingFee),
          city_name: cityName,
          shipping_fee_id,
        };
        const result = await this.shippingFeeLocationRepo.create(
          shippingFeeLocationData,
        );
        await this.shippingFeeRepo.update(
          { shipping_fee_id },
          { updated_at: formatStandardTimeStamp(), updated_by: user.user_id },
        );
      }
    }
    return this.get(shipping_fee_id);
  }

  async updateShippingFeeLocation(
    shipping_fee_location_id,
    data: UpdateShippingFeeLocationDto,
    user,
  ) {
    const shippingFeeLocationData = {
      ...this.shippingFeeLocationRepo.setData(data),
      updated_at: formatStandardTimeStamp(),
    };
    const shippingFeeLocation = await this.shippingFeeLocationRepo.update(
      { shipping_fee_location_id },
      shippingFeeLocationData,
    );
    if (shippingFeeLocation) {
      await this.shippingFeeRepo.update(
        { shipping_fee_id: shippingFeeLocation.shipping_fee_id },
        { updated_at: formatStandardTimeStamp(), updated_by: user.user_id },
      );
    }
    return shippingFeeLocation;
  }

  async getList(params) {
    let { search } = params;
    let { page, skip, limit } = getPageSkipLimit(params);

    if (search) {
      let shippingFeeLocations = await this.shippingFeeLocationRepo.find({
        select: '*',
        where: {
          [`${Table.SHIPPING_FEE_LOCATION}.city_name`]: Like(search.trim()),
        },
      });
      let shippingFees = [
        ...new Set(
          shippingFeeLocations.map(({ shipping_fee_id }) => shipping_fee_id),
        ),
      ];

      let shippingFeesResult = [];
      for (let shippingFeeItemId of shippingFees) {
        let shippingFeeItem = await this.shippingFeeRepo.findOne({
          shipping_fee_id: shippingFeeItemId,
        });
        for (let shippingFeeLocationItem of shippingFeeLocations) {
          if (
            shippingFeeLocationItem.shipping_fee_id ==
            shippingFeeItem.shipping_fee_id
          ) {
            shippingFeeItem['locationFees'] = shippingFeeItem['locationFees']
              ? [...shippingFeeItem['locationFees'], shippingFeeLocationItem]
              : [shippingFeeLocationItem];
          }
        }
        shippingFeesResult.push(shippingFeeItem);
      }

      return { shippingFees: shippingFeesResult };
    }

    let shippingFeesList = await this.shippingFeeRepo.find({
      select: '*',
      skip,
      limit,
    });
    let count = await this.shippingFeeRepo.find({
      select: 'COUNT(shipping_fee_id) as total',
    });

    if (shippingFeesList.length) {
      for (let shippingFeeItem of shippingFeesList) {
        let shippingFeeLocations = await this.shippingFeeLocationRepo.find({
          select: '*',
          where: {
            [`${Table.SHIPPING_FEE_LOCATION}.shipping_fee_id`]:
              shippingFeeItem.shipping_fee_id,
          },
        });
        shippingFeeItem['locationFees'] = shippingFeeLocations;
      }
    }
    return {
      paging: {
        currentPage: page,
        pageSize: limit,
        total: count[0].total,
      },
      shippingFees: shippingFeesList,
    };
  }

  async get(shipping_fee_id, params: any = {}) {
    let shippingFee = await this.shippingFeeRepo.findOne({ shipping_fee_id });
    if (!shippingFee) {
      throw new HttpException('Không tìm thấy phí vận chuyển', 404);
    }

    if (shippingFee.updated_by) {
      let updater = await this.userRepo.findOne({
        select: userSelector,
        join: userJoiner,
        where: { [`${Table.USERS}.user_id`]: shippingFee.updated_by },
      });
      shippingFee['handler'] = updater;
    }

    let shippingFeeLocations = await this.shippingFeeLocationRepo.find({
      select: '*',
      where: {
        [`${Table.SHIPPING_FEE_LOCATION}.shipping_fee_id`]: shipping_fee_id,
      },
    });

    shippingFee['locationFees'] = shippingFeeLocations;
    return shippingFee;
  }

  async calcShippingFee(dest_city_id: number) {
    let shippingFeeByCity = await this.shippingFeeLocationRepo.findOne({
      select: '*',
      join: {
        [JoinTable.leftJoin]: {
          [Table.SHIPPING_FEE]: {
            fieldJoin: `${Table.SHIPPING_FEE}.shipping_fee_id`,
            rootJoin: `${Table.SHIPPING_FEE_LOCATION}.shipping_fee_id`,
          },
        },
      },
      where: {
        [`${Table.SHIPPING_FEE_LOCATION}.city_id`]: dest_city_id,
        [`${Table.SHIPPING_FEE_LOCATION}.fee_location_status`]: 'A',
        [`${Table.SHIPPING_FEE}.status`]: 'A',
      },
      orderBy: [
        { field: `${Table.SHIPPING_FEE}.updated_at`, sortBy: SortBy.DESC },
      ],
    });
    if (shippingFeeByCity) {
      return shippingFeeByCity;
    }
    throw new HttpException(
      'Thành phố hiện tại chưa áp dụng phí vận chuyển hoặc không còn hiệu lực.',
      409,
    );
  }
}
