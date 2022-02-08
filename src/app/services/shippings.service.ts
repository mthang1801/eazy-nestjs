import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { Shippings } from '../entities/shippings.entity';
import { ShippingRepository } from '../repositories/shippings.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { ShippingDescriptionService } from './shipping_description.service';
import { ShippingServiceDescriptionService } from './shipping_service_description.service';
import { ShippingServiceService } from './shippings_service.service';
@Injectable()
export class ShippingService extends BaseService<
Shippings,
ShippingRepository<Shippings>
> {
    constructor(repository: ShippingRepository<Shippings>, table: Table,
        private shippingDescription: ShippingDescriptionService,
        private shippingService: ShippingServiceService,
        private shippingServiceDescription: ShippingServiceDescriptionService,) {
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
        const service = this.shippingService.find({
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
        const service = this.shippingService.find({
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
