import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { LoggerService } from '../../logger/custom.logger';
import { PaymentDescriptionsRepository } from '../repositories/payment-description.repository';
import { paymentDescriptionsEntity } from '../entities/payment-description.entity';
import { Like } from 'typeorm';

@Injectable()
export class PaymentService extends BaseService<
PaymentEntity,
PaymentRepository<PaymentEntity>
> {
    constructor(repository: PaymentRepository<PaymentEntity>, table: Table, 
      
        private paymentDescriptionRepo: PaymentDescriptionsRepository<paymentDescriptionsEntity>,
        ) {
        super(repository, table);
        this.table = Table.PAYMENT;
    }
async getAllPayment(params) {
         //=====Filter param
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.repository.tableProps.includes(key)) {
          filterCondition[`${Table.PAYMENT}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.PAYMENT_DESCRIPTION}.${key}`] =
            Like(val);
        }
      }
    }
    //===
        const payments = await this.repository.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_payment_descriptions: { fieldJoin: 'payment_id', rootJoin: 'payment_id' },

                },
            },

            skip: skip,
            limit: limit,
        });
        return payments;
    }
    async getPaymentById(id) {
        const string = `${this.table}.payment_id`;

        const payments = await this.repository.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_payment_descriptions: { fieldJoin: 'payment_id', rootJoin: 'payment_id' },

                },
            },
            where: { [string]: id },
            skip: 0,
            limit: 30,

        });
        return payments;
    }
    async createPayment(data) {

        
        const PaymentData = {
            ...this.repository.setData(data),


        };
   
        let _payment = await this.repository.create(PaymentData);


        ///===========================================
        const PaymentDesData = {
            payment_id: _payment.payment_id,
            ...this.paymentDescriptionRepo.setData(data),


        };

        let _paymentDes = await this.paymentDescriptionRepo.create(PaymentDesData);
        return {..._payment,..._paymentDes}


    }
    async updatePayment(id, data) {

        const PaymentData = {
            ...this.repository.setData(data),


        };
      
        let _payment = await this.repository.update(id, PaymentData);


        ///===========================================
        const PaymentDesData = {
            payment_id: _payment.payment_id,
            ...this.paymentDescriptionRepo.setData(data),


        };
       
        let _paymentDes = await this.paymentDescriptionRepo.update(id, PaymentDesData);
        return {..._payment,..._paymentDes}

    }
}
