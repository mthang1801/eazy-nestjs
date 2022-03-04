import {
  Injectable,
  InternalServerErrorException,
  HttpException,
} from '@nestjs/common';

import { Table, JoinTable } from '../../database/enums/index';

import { Like } from 'typeorm';
import { UpdateCustomerDTO } from '../dto/customer/update-customer.dto';
import { OrdersRepository } from '../repositories/orders.repository';
import { OrderEntity } from '../entities/orders.entity';
import { OrderDetailsRepository } from '../repositories/orderDetails.repository';
import { OrderDetailsEntity } from '../entities/orderDetails.entity';
import { ProductsRepository } from '../repositories/products.repository';
import { ProductsEntity } from '../entities/products.entity';
import { UserProfileRepository } from '../repositories/userProfile.repository';
import { UserProfileEntity } from '../entities/userProfile.entity';
import { UpdateOrderDto } from '../dto/orders/update-order.dto';
import { CreateOrderDto } from '../dto/orders/create-order.dto';
import { convertDataToIntegrate } from 'src/database/constant/order';
import axios from 'axios';
@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrdersRepository<OrderEntity>,
    private orderDetailRepo: OrderDetailsRepository<OrderDetailsEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
  ) {}

  async create(data: CreateOrderDto) {
    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
      status: 0,
    };

    let result = await this.orderRepo.create(orderData);
    if (data.order_items.length) {
      for (let orderItem of data.order_items) {
        let orderDetailData = {
          ...new OrderDetailsEntity(),
          ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
        };

        const newOrderDetail = await this.orderDetailRepo.create(
          orderDetailData,
        );

        result['order_items'] = result['order_items']
          ? [...result['order_items'], newOrderDetail]
          : [newOrderDetail];
      }
    }

    const config: any = {
      method: 'POST',
      url: 'http://mb.viendidong.com/core-api/v1/orders/cms/create',
      headers: {
        'Content-Type': 'application/json',
      },
      data: convertDataToIntegrate(result),
    };

    try {
      const response = await axios(config);
      let message = 'Đã đẩy đơn hàng đến appcore thất bại';
      if (response?.data?.data) {
        const origin_order_id = response.data.data;
        let updateOriginOrderId = await this.orderRepo.update(
          { order_id: result.order_id },
          { origin_order_id, status: 1 },
        );

        result = { ...result, ...updateOriginOrderId };

        message = 'Đẩy đơn hàng đến appcore thành công';
      }
      return { result, message };
    } catch (error) {
      console.log(error);
      throw new HttpException(
        `Có lỗi xảy ra trong quá trình đưa dữ liệu lên AppCore : ${
          error?.response?.data || error?.response?.data?.error || error.message
        }`,
        400,
      );
    }
  }

  async createSync(data: CreateOrderDto) {
    const orderData = {
      ...new OrderEntity(),
      ...this.orderRepo.setData(data),
      status: 0,
    };

    let result = await this.orderRepo.create(orderData);
    if (data.order_items.length) {
      for (let orderItem of data.order_items) {
        let orderDetailData = {
          ...new OrderDetailsEntity(),

          ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
        };

        const newOrderDetail = await this.orderDetailRepo.create(
          orderDetailData,
        );

        result['order_items'] = result['order_items']
          ? [...result['order_items'], newOrderDetail]
          : [newOrderDetail];
      }
    }

    return result;
  }

  async update(id: number, data: UpdateOrderDto) {
    const order = await this.orderRepo.findById(id);

    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }
    let result = { ...order };
    const orderData = this.orderRepo.setData(data);
    if (Object.entries(orderData).length) {
      const updatedOrder = await this.orderRepo.update(
        order.order_id,
        orderData,
      );
      result = { ...result, ...updatedOrder };
    }

    if (data?.order_items?.length) {
      for (let orderItem of data.order_items) {
        const currentOrderItem = await this.orderDetailRepo.findById(
          orderItem.item_id,
        );

        if (currentOrderItem && orderItem.is_deleted) {
          result['order_items'] = result['order_items']
            ? [...result['order_items'], orderItem]
            : [orderItem];
          await this.orderDetailRepo.delete({
            item_id: orderItem.item_id,
          });
        }

        // Nếu SP đơn hàng đã tồn tại thì update, nếu chưa có thì thêm, nếu is_deleted = true thì xoá
        if (currentOrderItem) {
          let orderItemData = this.orderDetailRepo.setData(orderItem);
          const updatedOrderItem = await this.orderDetailRepo.update(
            orderItem.item_id,
            orderItemData,
          );

          result['order_items'] = result['order_items']
            ? [...result['order_items'], updatedOrderItem]
            : [updatedOrderItem];
        } else {
          let newOrderItemData = {
            ...new OrderDetailsEntity(),
            ...this.orderDetailRepo.setData({ ...result, ...orderItem }),
          };

          const newOrderItem = await this.orderDetailRepo.create(
            newOrderItemData,
          );
          result['order_items'] = result['order_items']
            ? [...result['order_items'], newOrderItem]
            : [newOrderItem];
        }
      }
    }
    return result;
  }

  async getByPhoneAndId(phone: string, order_id: number) {
    const order = await this.orderRepo.findOne({ order_id, b_phone: phone });

    if (!order) {
      throw new HttpException('Không tìm thấy đơn hàng', 404);
    }

    let orderItems = await this.orderDetailRepo.find({
      select: [
        `${Table.ORDER_DETAILS}.*`,
        `${Table.PRODUCT_DESCRIPTION}.product`,
      ],
      join: {
        [JoinTable.leftJoin]: {
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.ORDER_DETAILS}.product_id`,
            rootJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
          },
        },
      },
      where: { [`${Table.ORDER_DETAILS}.order_id`]: order.order_id },
    });

    order['order_items'] = orderItems;
    return order;
  }
}
