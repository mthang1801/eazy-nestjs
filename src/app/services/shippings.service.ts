import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { ShippingsEntity } from '../entities/shippings.entity';
import { ShippingRepository } from '../repositories/shippings.repository';
import { Table, JoinTable } from '../../database/enums/index';

import { ShippingDescriptionRepository } from '../repositories/shipping_description.repository';
import { ShippingsDescriptionEntity } from '../entities/shipping_description.entity';
import { ShippingServiceRepository } from '../repositories/shippings_service.repository';
import { ShippingsServiceEntity } from '../entities/shippings_service.entity';
import { ShippingServiceDescriptionRepository } from '../repositories/shipping_service_description.repository';
import { ShippingsServiceDescriptionEntity } from '../entities/shipping_service_description.entity';
@Injectable()
export class ShippingService extends BaseService<
ShippingsEntity,
ShippingRepository<ShippingsEntity>
> {
    constructor(repository: ShippingRepository<ShippingsEntity>, table: Table,
        private shippingDescriptionRepo: ShippingDescriptionRepository<ShippingsDescriptionEntity>,
        private shippingServiceRepo: ShippingServiceRepository<ShippingsServiceEntity>,
        private shippingServiceDescriptionRepo: ShippingServiceDescriptionRepository<ShippingsServiceDescriptionEntity>,) {
        super(repository, table);
        this.table = Table.SHIPPINGS;
    }
    async Create(data) {
        return `hehe`
    }
    async GetAll() {
        const shipping = this.repository.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_shipping_descriptions: { fieldJoin: `${Table.SHIPPINGS_DESCRIPTION}.shipping_id`, rootJoin: `${Table.SHIPPINGS}.shipping_id` },

                },
            },

            skip: 0,
            limit: 30,
        });
        const service = this.shippingServiceRepo.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_shipping_service_descriptions:
                    {
                        fieldJoin: `${Table.SHIPPING_SERVICE_DESCRIPTION}.service_id`,
                        rootJoin: `${Table.SHIPPING_SERVICE}.service_id`
                    },

                },
            },

            skip: 0,
            limit: 30,
        });
        const result = await Promise.all([shipping, service]);
        let _result = [];
        result[0].forEach(ele => {

            _result.push({ ...ele, service: result[1].filter(service => service.shipping_id == ele.shipping_id) })

        })
        return _result;

    }
    async GetById(id) {
        const string = `${this.table}.shipping_id`;
        const string1 =`${Table.SHIPPING_SERVICE}.shipping_id`
        const shipping = this.repository.find({
            select: ['*'],
            where :{[string]:id},
            join: {
                [JoinTable.join]: {
                    ddv_shipping_descriptions: { fieldJoin: `${Table.SHIPPINGS_DESCRIPTION}.shipping_id`, rootJoin: `${Table.SHIPPINGS}.shipping_id` },

                },
            },

            skip: 0,
            limit: 30,
        });
        const service = this.shippingServiceRepo.find({
            select: ['*'],
            where :{[string1]:id},

            join: {
                [JoinTable.join]: {
                    ddv_shipping_service_descriptions:
                    {
                        fieldJoin: `${Table.SHIPPING_SERVICE_DESCRIPTION}.service_id`,
                        rootJoin: `${Table.SHIPPING_SERVICE}.service_id`
                    },

                },
            },

            skip: 0,
            limit: 30,
        });
        const result = await Promise.all([shipping, service]);
        return {...result[0],service:result[1]}
    }

}
