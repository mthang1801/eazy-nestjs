import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { orderStatus } from '../entities/orderStatus.entity';
import { OrderStatusRepository } from '../repositories/order_status.repository';
import { orderStatusCreateDTO } from '../dto/orderStatus/orderStatus.dto';
import { OrderStatusDataService } from './order_status_data.service';
import { OrderStatusDescriptionService } from './order_status_description.service';
import { Table, JoinTable } from '../../database/enums/index';

@Injectable()
export class OrderStatusService extends BaseService<
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
}
