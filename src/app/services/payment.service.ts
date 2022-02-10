import { Injectable } from '@nestjs/common';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { PaymentDescriptionsRepository } from '../repositories/paymentDescription.repository';
import { paymentDescriptionsEntity } from '../entities/paymentDescription.entity';

import { IPayment } from '../interfaces/payment.interface';
import { Like } from 'src/database/find-options/operators';

@Injectable()
export class PaymentService {
  constructor(
    private paymentRepository: PaymentRepository<PaymentEntity>,
    private paymentDescriptionRepo: PaymentDescriptionsRepository<paymentDescriptionsEntity>,
  ) {}

  async getAll(params): Promise<IPayment[]> {
    //=====Filter param
    let { page, limit, ...others } = params;
    page = +page || 1;
    limit = +limit || 9999;
    let skip = (page - 1) * limit;

    let filterCondition = {};
    if (others && typeof others === 'object' && Object.entries(others).length) {
      for (let [key, val] of Object.entries(others)) {
        if (this.paymentRepository.tableProps.includes(key)) {
          filterCondition[`${Table.PAYMENT}.${key}`] = Like(val);
        } else {
          filterCondition[`${Table.PAYMENT_DESCRIPTION}.${key}`] = Like(val);
        }
      }
    }
    //===
    const payments = await this.paymentRepository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_payment_descriptions: {
            fieldJoin: 'payment_id',
            rootJoin: 'payment_id',
          },
        },
      },

      skip: skip,
      limit: limit,
    });
    return payments;
  }

  async getById(id): Promise<IPayment[]> {
    const string = `${Table.PAYMENT}.payment_id`;

    const payments = await this.paymentRepository.find({
      select: ['*'],
      join: {
        [JoinTable.join]: {
          ddv_payment_descriptions: {
            fieldJoin: 'payment_id',
            rootJoin: 'payment_id',
          },
        },
      },
      where: { [string]: id },
      skip: 0,
      limit: 30,
    });
    return payments;
  }

  async create(data): Promise<IPayment> {
    const PaymentData = {
      ...this.paymentRepository.setData(data),
    };

    let _payment = await this.paymentRepository.create(PaymentData);

    ///===========================================
    const PaymentDesData = {
      payment_id: _payment.payment_id,
      ...this.paymentDescriptionRepo.setData(data),
    };

    let _paymentDes = await this.paymentDescriptionRepo.create(PaymentDesData);
    return { ..._payment, ..._paymentDes };
  }

  async update(id, data): Promise<IPayment> {
    const PaymentData = {
      ...this.paymentRepository.setData(data),
    };

    let _payment = await this.paymentRepository.update(id, PaymentData);

    ///===========================================
    const PaymentDesData = {
      payment_id: _payment.payment_id,
      ...this.paymentDescriptionRepo.setData(data),
    };

    let _paymentDes = await this.paymentDescriptionRepo.update(
      id,
      PaymentDesData,
    );
    return { ..._payment, ..._paymentDes };
  }
}
