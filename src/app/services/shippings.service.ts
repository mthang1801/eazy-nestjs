import { Injectable } from '@nestjs/common';
import { ShippingsEntity } from '../entities/shippings.entity';
import { ShippingRepository } from '../repositories/shippings.repository';
import { Table, JoinTable } from '../../database/enums/index';

import { ShippingServiceRepository } from '../repositories/shippingsService.repository';
import { ShippingsServiceEntity } from '../entities/shippingsService.entity';
import { ShippingCreateDTO } from '../dto/shipping/create-shipping.dto';
import { IShippingService } from '../interfaces/shipping.interface';
@Injectable()
export class ShippingService {
  private table = Table.SHIPPINGS;
  constructor(
    private shippingRepository: ShippingRepository<ShippingsEntity>,

    private shippingServiceRepo: ShippingServiceRepository<ShippingsServiceEntity>,
  ) {}

  async create(data: ShippingCreateDTO) {
    // in progress
    return;
  }
  async getAll(): Promise<IShippingService[]> {
    const shipping = this.shippingRepository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_shipping_descriptions: {
            fieldJoin: `${Table.SHIPPINGS_DESCRIPTION}.shipping_id`,
            rootJoin: `${Table.SHIPPINGS}.shipping_id`,
          },
        },
      },

      skip: 0,
      limit: 30,
    });
    const service = this.shippingServiceRepo.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_shipping_service_descriptions: {
            fieldJoin: `${Table.SHIPPING_SERVICE_DESCRIPTION}.service_id`,
            rootJoin: `${Table.SHIPPING_SERVICE}.service_id`,
          },
        },
      },

      skip: 0,
      limit: 30,
    });
    const result = await Promise.all([shipping, service]);
    let _result = [];
    result[0].forEach((ele) => {
      _result.push({
        ...ele,
        service: result[1].filter(
          (service) => service.shipping_id == ele.shipping_id,
        ),
      });
    });
    return _result;
  }
  async getById(id): Promise<any> {
    const string = `${this.table}.shipping_id`;
    const string1 = `${Table.SHIPPING_SERVICE}.shipping_id`;
    const shipping = this.shippingRepository.find({
      select: ['*'],
      where: { [string]: id },
      join: {
        [JoinTable.join]: {
          ddv_shipping_descriptions: {
            fieldJoin: `${Table.SHIPPINGS_DESCRIPTION}.shipping_id`,
            rootJoin: `${Table.SHIPPINGS}.shipping_id`,
          },
        },
      },

      skip: 0,
      limit: 30,
    });
    const service = this.shippingServiceRepo.find({
      select: ['*'],
      where: { [string1]: id },

      join: {
        [JoinTable.join]: {
          ddv_shipping_service_descriptions: {
            fieldJoin: `${Table.SHIPPING_SERVICE_DESCRIPTION}.service_id`,
            rootJoin: `${Table.SHIPPING_SERVICE}.service_id`,
          },
        },
      },

      skip: 0,
      limit: 30,
    });
    const result = await Promise.all([shipping, service]);
    return { ...result[0], service: result[1] };
  }
}
