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


@Injectable()
export class OrdersService {
    constructor(
        private orderRepo: OrdersRepository<OrderEntity>,
        private orderDetailRepo: OrderDetailsRepository<OrderDetailsEntity>,
        private productRepo: ProductsRepository<ProductsEntity>,

    ) { }
    async getList(params) {
        //=====Filter param

    }
    async getById(id) {

    }
    async update(id, data: UpdateCustomerDTO) {

    }
    async create(data) {
        //get the product prize
        const discount = 0;
        const products = await this.productRepo.find({
            select: [`${Table.PRODUCTS}.product_id`,
            `${Table.PRODUCTS}.product_code`,
            `${Table.PRODUCTS}.list_price`,
            `${Table.PRODUCTS}.amount`,

            ],
            where: data.products.map(ele => { return { product_id: ele.product_id } }),

            skip: 0,
            limit: 9999,
        })
        let total = 0;
        data.products.map(ele=>{
            products.map(item=>{
                if (ele.product_id === item.product_id){
                    total += ele.amount * item.list_price;
                    ele['price'] = item.list_price
                    ele['product_code'] = item.product_code;
                }
            })
        })
        const orderData = {
            ...this.orderRepo.setData(data),
            total: total,
            discount: discount,
            subtotal: total - discount,
        };

        let _orderData = await this.orderRepo.create(
            orderData,
        );
        let _orderdetail = []
        data.products.forEach(ele=>{
            _orderdetail.push(this.orderDetailRepo.create({...ele,order_id:_orderData.order_id}))
        })    
        await Promise.all(_orderdetail);
        return _orderData
    }
}
