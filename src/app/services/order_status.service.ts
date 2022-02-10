import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { orderStatusEntity } from '../entities/orderStatus.entity';
import { OrderStatusRepository } from '../repositories/order_status.repository';
<<<<<<< HEAD
import { orderStatusCreateDTO } from '../dto/orderStatus/orderStatus.dto';
import { OrderStatusDataService } from './order_status_data.service';
import { OrderStatusDescriptionService } from './order_status_description.service';
=======
import { orderStatusCreateDTO, } from '../dto/orderStatus/orderStatus.dto';

>>>>>>> e74b50d3ff0b115f8231eea3c3989f33aef991f6
import { Table, JoinTable } from '../../database/enums/index';
import { OrderStatusDescriptionRepository } from '../repositories/order_status_description.repository';
import { OrderStatusDataRepository } from '../repositories/order_status_data.repository';
import { orderStatusDescriptionEntity } from '../entities/orderStatus-description.entity';
import { orderStatusDataEntity } from '../entities/orderStatus-data.entity';

@Injectable()
export class OrderStatusService extends BaseService<
<<<<<<< HEAD
  orderStatus,
  OrderStatusRepository<orderStatus>
> {
  constructor(
    repository: OrderStatusRepository<orderStatus>,
    table: Table,
    private orderStatusDescriptionService: OrderStatusDescriptionService,
    private orderStatusDataService: OrderStatusDataService,
  ) {
    super(repository, table);
    this.table = Table.ORDER_STATUS;
  }
  async GetAllOrderStatus() {
    const orders = await this.repository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_status_descriptions: {
            fieldJoin: 'status_id',
            rootJoin: 'status_id',
          },
          ddv_status_data: {
            fieldJoin: 'status_id',
            rootJoin: 'status_id',
          },
        },
      },

      skip: 0,
      limit: 30,
    });
    return orders;
  }
  async getOrderStatusById(id) {
    const string = `${this.table}.status_id`;
    const orders = await this.repository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_status_descriptions: {
            fieldJoin: 'status_id',
            rootJoin: 'status_id',
          },
          ddv_status_data: {
            fieldJoin: 'status_id',
            rootJoin: 'status_id',
          },
        },
      },
      where: { [string]: id },
      skip: 0,
      limit: 30,
    });
    return orders;
  }
  async createOrderStatus(data: orderStatusCreateDTO) {
    try {
      const {
        status,
        type,
        is_default,
        position,

        description,
        email_subj,
        email_header,
        lang_code,
        param,
        value,
      } = data;
      //====Check if exist
      const check = await this.repository.findOne({
        where: { status: status, type: type },
      });
      if (Object.keys(check).length != 0) {
        return '422';
      }
      ///==========================|Add to ddv_statuses table|==============

      const orderStatusData = {
        status: status,
        type: type,
        is_default: is_default,
        position: position,
      };
      Object.keys(orderStatusData).forEach(
        (key) =>
          orderStatusData[key] === undefined && delete orderStatusData[key],
      );
      let _orderStatus = await this.repository.create(orderStatusData);

      ///==========================|Add to ddv_status_data table|==============

      const orderStatusDataData = {
        status_id: _orderStatus.status_id,
        param: param,
        value: value,
      };
      Object.keys(orderStatusDataData).forEach(
        (key) =>
          orderStatusDataData[key] === undefined &&
          delete orderStatusDataData[key],
      );
      let _orderStatusData = await this.orderStatusDataService.create(
        orderStatusDataData,
      );
      ///==========================|Add to ddv_status_data table|==============

      const orderStatusDataDes = {
        status_id: _orderStatus.status_id,

        description: description,
        email_subj: email_subj,
        email_header: email_header,
        lang_code: lang_code,
      };
      Object.keys(orderStatusDataDes).forEach(
        (key) =>
          orderStatusDataDes[key] === undefined &&
          delete orderStatusDataDes[key],
      );
      let _orderStatusDes = await this.orderStatusDescriptionService.create(
        orderStatusDataDes,
      );
      return 'OrderStatus Added';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  async UpdateOrderStatus(id, data) {
    try {
      const {
        status,
        type,
        is_default,
        position,
=======
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
>>>>>>> e74b50d3ff0b115f8231eea3c3989f33aef991f6

        description,
        email_subj,
        email_header,
        lang_code,
        param,
        value,
      } = data;
      //=== check if data changes ?====
      const changed = await this.repository.findOne({
        where: { status_id: id },
      });
      if (!(changed.status === status && changed.type === type)) {
        //====Check if exist
        const check = await this.repository.findOne({
          where: { status: status, type: type },
        });
<<<<<<< HEAD
        if (Object.keys(check).length != 0) {
          return '422';
        }
      }

      ///==========================|Add to ddv_statuses table|==============

      const orderStatusData = {
        status: status,
        type: type,
        is_default: is_default,
        position: position,
      };
      Object.keys(orderStatusData).forEach(
        (key) =>
          orderStatusData[key] === undefined && delete orderStatusData[key],
      );
      let _orderStatus = await this.repository.update(id, orderStatusData);

      ///==========================|Add to ddv_status_data table|==============

      const orderStatusDataData = {
        status_id: id,
        param: param,
        value: value,
      };
      Object.keys(orderStatusDataData).forEach(
        (key) =>
          orderStatusDataData[key] === undefined &&
          delete orderStatusDataData[key],
      );
      let _orderStatusData = await this.orderStatusDataService.update(
        id,
        orderStatusDataData,
      );
      ///==========================|Add to ddv_status_data table|==============

      const orderStatusDataDes = {
        status_id: id,

        description: description,
        email_subj: email_subj,
        email_header: email_header,
        lang_code: lang_code,
      };
      Object.keys(orderStatusDataDes).forEach(
        (key) =>
          orderStatusDataDes[key] === undefined &&
          delete orderStatusDataDes[key],
      );
      let _orderStatusDes = await this.orderStatusDescriptionService.update(
        id,
        orderStatusDataDes,
      );
      return 'OrderStatus Updated';
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
=======
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

>>>>>>> e74b50d3ff0b115f8231eea3c3989f33aef991f6
}
