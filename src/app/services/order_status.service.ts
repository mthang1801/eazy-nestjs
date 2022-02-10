import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { orderStatusEntity } from '../entities/orderStatus.entity';
import { OrderStatusRepository } from '../repositories/order_status.repository';
import { orderStatusCreateDTO, } from '../dto/orderStatus/orderStatus.dto';

import { Table, JoinTable } from '../../database/enums/index';
import { OrderStatusDescriptionRepository } from '../repositories/order_status_description.repository';
import { OrderStatusDataRepository } from '../repositories/order_status_data.repository';
import { orderStatusDescriptionEntity } from '../entities/orderStatus-description.entity';
import { orderStatusDataEntity } from '../entities/orderStatus-data.entity';

@Injectable()
export class OrderStatusService extends BaseService<
orderStatusEntity,
OrderStatusRepository<orderStatusEntity>
> {
    constructor(repository: OrderStatusRepository<orderStatusEntity>,
        table: Table,
        private orderStatusDescriptionRepo: OrderStatusDescriptionRepository<orderStatusDescriptionEntity>,
        private orderStatusDataRepo: OrderStatusDataRepository<orderStatusDataEntity>,
       ) {
        super(repository, table);
        this.table = Table.ORDER_STATUS;
    }
    async GetAllOrderStatus() {
        const orders = this.repository.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_status_descriptions: { fieldJoin: 'status_id', rootJoin: 'status_id' },

                },
            },

            skip: 0,
            limit: 30,
        });
        const orderData = this.orderStatusDataRepo.find({
            select: ['*'],
            skip: 0,
            limit: 30,
        })
        const result = await Promise.all([orderData, orders]);
        let _order = [];
        result[1].forEach((ele) => {
            _order.push({
                ...ele,
                data: result[0].filter((img) => img.status_id == ele.status_id),
            });
        });
        return _order;
    }
    async getOrderStatusById(id) {
        const string = `${this.table}.status_id`;
        const string1 = `${Table.ORDER_STATUS_DATA}.status_id`;

        const orders = this.repository.findOne({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_status_descriptions: { fieldJoin: 'status_id', rootJoin: 'status_id' },


                },
            },
            where: { [string]: id },
            skip: 0,
            limit: 30,
        });
        const orderData = this.orderStatusDataRepo.find({
            select: ['*'],
            where: { [string1]: id },

            skip: 0,
            limit: 30,

        })
        const result = await Promise.all([orderData, orders]);
        console.log(result[1], result[0]);
        return { ...result[1], data: result[0] };
    }
    async createOrderStatus(data: orderStatusCreateDTO) {

        //====Check if exist

        const check = await this.repository.findOne({ where: { status: data.status, type: data.type } })

        if (check && typeof check === 'object' && Object.keys(check).length != 0) {

            throw new HttpException("Status and Type bị trùng", 422)
        }
        ///==========================|Add to ddv_statuses table|==============
        const orderStatusData = {
            ...this.repository.setData(data),

        };

        let _orderStatus = await this.repository.create(orderStatusData);
        ///==========================|Add to ddv_status_data table|==============

        const orderStatusDataData = {
            status_id: _orderStatus.status_id,
            ...this.orderStatusDataRepo.setData(data)

        };

        let _orderStatusData = await this.orderStatusDataRepo.create(orderStatusDataData);
        ///==========================|Add to ddv_status_data table|==============

        const orderStatusDataDes = {
            status_id: _orderStatus.status_id,
            ...this.orderStatusDescriptionRepo.setData(data)


        };

        let _orderStatusDes = await this.orderStatusDescriptionRepo.create(orderStatusDataDes)
        return _orderStatus

    }
    async UpdateOrderStatus(id, data) {

       
        //=== check if data changes ?====
        const changed = await this.repository.findOne({ where: { status_id: id } })
        if (!(changed.status === data.status && changed.type === data.type)) {
            //====Check if exist
            const check = await this.repository.findOne({ where: { status: data.status, type: data.type } })
            if (check && typeof check === 'object' && Object.keys(check).length != 0) {

                throw new HttpException("Status and Type bị trùng", 422)
            }
        }



        ///==========================|Add to ddv_statuses table|==============

        const orderStatusData = {
            ...this.repository.setData(data),

        };
        let _orderStatus = await this.repository.update(id, orderStatusData);

        ///==========================|Add to ddv_status_data table|==============

        const orderStatusDataData = {
            status_id: id,
            ...this.orderStatusDataRepo.setData(data)

        };
        

        let _orderStatusData = await this.orderStatusDataRepo.update(id, orderStatusDataData);
        ///==========================|Add to ddv_status_data table|==============

        const orderStatusDataDes = {
            status_id: id,
            ...this.orderStatusDescriptionRepo.setData(data)


        };
      
        let _orderStatusDes = await this.orderStatusDescriptionRepo.update(id, orderStatusDataDes)
        return orderStatusData

    }

}
