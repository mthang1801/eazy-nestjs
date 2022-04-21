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
import { shippingFeeLocationsJoiner } from '../../utils/joinTable';

@Injectable()
export class ShippingFeeService {
  constructor(
    private shippingFeeRepo: ShippingFeeRepository<ShippingFeeEntity>,
    private shippingFeeLocationRepo: ShippingFeeLocationRepository<ShippingFeeLocationEntity>,
    private cityService: CityService,
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
  }

  async createShippingFeeByLocation(
    data: CreateShippingFeeLocationDto,
    shipping_fee_id: number,
    user,
  ) {
    const checkExist = await this.shippingFeeLocationRepo.findOne({
      city_id: data.city_id,
      shipping_fee_id,
    });
    if (checkExist) {
      throw new HttpException(
        'Tỉnh/thành đã tồn tại trong hình thức phí vận chuyển này.',
        422,
      );
    }
    let cityName = await this.cityService.get(+data.city_id, true);
    let shippingFeeLocationData = {
      ...new ShippingFeeLocationEntity(),
      ...this.shippingFeeLocationRepo.setData(data),
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

    return result;
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
    if (data.city_id) {
      shippingFeeLocationData['city_name'] = await this.cityService.get(
        +data.city_id,
        true,
      );
    }
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

      return shippingFeesResult;
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
      shipingFees: shippingFeesList,
    };
  }
}
