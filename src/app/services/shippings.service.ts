import { Injectable } from '@nestjs/common';
import { ShippingsEntity } from '../entities/shippings.entity';
import { ShippingRepository } from '../repositories/shippings.repository';
import { Table, JoinTable } from '../../database/enums/index';

import { ShippingServiceRepository } from '../repositories/shippingsService.repository';
import { ShippingsServiceEntity } from '../entities/shippingsService.entity';
import { ShippingCreateDTO } from '../dto/shipping/create-shipping.dto';
import { IShippingService } from '../interfaces/shipping.interface';
import { ShippingServiceDescriptionRepository } from '../repositories/shippingServiceDescription.repository';
import { ShippingsDescriptionEntity } from '../entities/shippingDescription.entity';
import { ShippingDescriptionRepository } from '../repositories/shippingDescription.repository';
import { ShippingsServiceDescriptionEntity } from '../entities/shippingServiceDescription.entity';
import { convertToMySQLDateTime } from 'src/utils/helper';
@Injectable()
export class ShippingService {
  private table = Table.SHIPPINGS;
  constructor(
    private shippingRepository: ShippingRepository<ShippingsEntity>,
    private shippingDescriptionRepo: ShippingDescriptionRepository<ShippingsDescriptionEntity>,

    private shippingServiceDescriptionRepo:ShippingServiceDescriptionRepository<ShippingsServiceDescriptionEntity>,
    private shippingServiceRepo: ShippingServiceRepository<ShippingsServiceEntity>,
  ) {}

  async create(data: ShippingCreateDTO) {
    const shipping = {
      ...this.shippingRepository.setData(data),
    };
    let _shipping = await this.shippingRepository.create(shipping);
    const shippingDescription =  {
      ...this.shippingDescriptionRepo.setData(data),
      shipping_id:_shipping.shipping_id
    };
    let _shippingDes = await this.shippingDescriptionRepo.create(shippingDescription);
    const shippingService ={
      ...this.shippingServiceRepo.setData(data),
      shipping_id:_shipping.shipping_id,
      created_at: convertToMySQLDateTime(),
      updated_at:convertToMySQLDateTime(),


    }
    let _shippingService =  await this.shippingServiceRepo.create(shippingService);
    const shippingServiceDescription ={
      ...this.shippingServiceDescriptionRepo.setData({...data,description: data.descriptionService,}),
      service_id:_shippingService.service_id,
      
    } 
    let _shippingServiceDescription =  await this.shippingServiceDescriptionRepo.create(shippingServiceDescription);
    const result = await this.getById(_shipping.shipping_id);
    return result;
  }
  async getList(): Promise<IShippingService[]> {
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
    const shipping = this.shippingRepository.findOne({
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
  async update(id,data: ShippingCreateDTO) {
    const shipping = {
      ...this.shippingRepository.setData(data),
    };
    let _shipping = await this.shippingRepository.update(id,shipping);
    const shippingDescription =  {
      ...this.shippingDescriptionRepo.setData(data),
      shipping_id:id
    };
  
    let _shippingDes = await this.shippingDescriptionRepo.update(id,shippingDescription);
    const serviceid = await this.shippingServiceRepo.findOne({ select: ['*'],
    where: { shipping_id: id },})

    if (!serviceid){
      return _shipping;
    }
    const shippingService ={
      ...this.shippingServiceRepo.setData(data),
      updated_at:convertToMySQLDateTime(),


    }
    
    let _shippingService =  await this.shippingServiceRepo.update(serviceid.service_id,shippingService);
    const shippingServiceDescription ={
      ...this.shippingServiceDescriptionRepo.setData({...data,description: data.descriptionService,}),
      service_id:_shippingService.service_id,
      
    } 
    let _shippingServiceDescription =  await this.shippingServiceDescriptionRepo.update(serviceid.service_id,shippingServiceDescription);
    const result = await this.getById(id);
    return result
  }
}
