import { Injectable, InternalServerErrorException } from '@nestjs/common';

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
import { OrderUpdateDTO } from '../dto/orders/update-order.dto';
import { CreateOrderDto } from '../dto/orders/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private orderRepo: OrdersRepository<OrderEntity>,
    private orderDetailRepo: OrderDetailsRepository<OrderDetailsEntity>,
    private productRepo: ProductsRepository<ProductsEntity>,
    private userProfileRepository: UserProfileRepository<UserProfileEntity>,
  ) {}
  async getList(params) {
    //=====Filter param

    const orders = this.orderRepo.find({
      select: ['*'],

      skip: 0,
      limit: 9999,
    });

    const products = this.orderDetailRepo.find({
      select: [`${Table.PRODUCT_DESCRIPTION}.*`, `${Table.ORDER_DETAILS}.*`],
      join: {
        [JoinTable.join]: {
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
        },
      },
      skip: 0,
      limit: 9999,
    });
    const result = await Promise.all([products, orders]);
    let _result = [];
    result[1].forEach((ele) => {
      _result.push({
        ...ele,
        products: result[0].filter(
          (product) => product.order_id == ele.order_id,
        ),
      });
    });
    return _result;
  }
  async getById(id) {
    const string = `${Table.ORDERS}.order_id`;
    const string1 = `${Table.ORDER_DETAILS}.order_id`;
    const orders = this.orderRepo.findOne({
      select: ['*'],

      skip: 0,
      limit: 9999,
      where: { [string]: id },
    });
    const products = this.orderDetailRepo.find({
      select: [`${Table.PRODUCT_DESCRIPTION}.*`, `${Table.ORDER_DETAILS}.*`],
      join: {
        [JoinTable.join]: {
          [Table.PRODUCTS]: {
            fieldJoin: `${Table.PRODUCTS}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
          [Table.PRODUCT_DESCRIPTION]: {
            fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
            rootJoin: `${Table.ORDER_DETAILS}.product_id`,
          },
        },
      },
      where: { [string1]: id },

      skip: 0,
      limit: 9999,
    });
    const result = await Promise.all([products, orders]);
    return { ...result[1], products: result[0] };
  }
  async update(id, data: OrderUpdateDTO) {
    let total = 0;

    if (data.products.length) {
      const products = await this.productRepo.find({
        select: [
          `${Table.PRODUCTS}.product_id`,
          `${Table.PRODUCTS}.product_code`,
          `${Table.PRODUCTS}.list_price`,
          `${Table.PRODUCTS}.amount`,
        ],
        where: data.products.map((ele) => {
          return { product_id: ele.product_id };
        }),

        skip: 0,
        limit: 9999,
      });
      data.products.map((ele) => {
        products.map((item) => {
          if (ele.product_id === item.product_id) {
            total += ele.amount * item.list_price;
            ele['price'] = item.list_price;
            ele['product_code'] = item.product_code;
          }
        });
      });
      //=========|Delete all the previuos products|============
      const product_detail = await this.orderDetailRepo.find({
        select: [`item_id`],
        where: { order_id: id },

        skip: 0,
        limit: 9999,
      });
      let arrPromise = [];
      product_detail.forEach((ele) => {
        arrPromise.push(this.orderDetailRepo.delete(ele.item_id));
      });
      await Promise.all(arrPromise);
      //====re Create Product====///
      let _orderdetail = [];
      data.products.forEach((ele) => {
        _orderdetail.push(
          this.orderDetailRepo.create({ ...ele, order_id: id }),
        );
      });
      await Promise.all(_orderdetail);
    }

    //=== update Order Tabe
    const order = await this.orderRepo.findOne({
      select: [
        `${Table.ORDERS}.discount`,
        `${Table.ORDERS}.total`,
        `${Table.ORDERS}.subtotal`,
      ],
      where: { order_id: id },

      skip: 0,
      limit: 9999,
    });

    const orderData = {
      ...this.orderRepo.setData(data),
      total: data.products.length ? total : order.total,
      subtotal: data.products.length ? total - order.discount : order.subtotal,
    };

    let _orderData = await this.orderRepo.update(id, orderData);
    return _orderData;
  }

  async create(data: CreateOrderDto) {
    const orderData = this.orderRepo.setData(data);
    console.log(orderData);
  }
}
