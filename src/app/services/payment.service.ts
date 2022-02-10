import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { PaymentEntity } from '../entities/payment.entity';
import { PaymentRepository } from '../repositories/payment.repository';
import { Table, JoinTable } from '../../database/enums/index';
import { LoggerService } from '../../logger/custom.logger';
import { PaymentDescriptionService } from './payment_description.service';

@Injectable()
export class PaymentService extends BaseService<
PaymentEntity,
PaymentRepository<PaymentEntity>
> {
    constructor(repository: PaymentRepository<PaymentEntity>, table: Table, private paymentDescriptionService: PaymentDescriptionService) {
        super(repository, table);
        this.table = Table.PAYMENT;
    }
    async getAllPayment() {
        const payments = await this.repository.find({
            select: ['*'],
            join: {
                [JoinTable.join]: {
                    ddv_payment_descriptions: { fieldJoin: 'payment_id', rootJoin: 'payment_id' },

                },
            },

            skip: 0,
            limit: 30,
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

        const {
            company_id,
            usergroup_ids,
            position,
            status,
            template,
            processor_id,
            processor_params,
            a_surcharge,
            p_surcharge,
            tax_ids,
            localization,
            payment_category,
            description,
            payment,
            instructions,
            surcharge_title,

            lang_code,
        } = data;
        const PaymentData = {
            company_id: company_id,
            usergroup_ids: usergroup_ids,
            position: position,
            status: status,
            template: template,
            processor_id: processor_id,
            processor_params: processor_params,
            a_surcharge: a_surcharge,
            p_surcharge: p_surcharge,
            tax_ids: tax_ids,
            localization: localization,
            payment_category: payment_category,

        };
        Object.keys(PaymentData).forEach(
            (key) =>
                PaymentData[key] === undefined && delete PaymentData[key],
        );
        let _payment = await this.repository.create(PaymentData);


        ///===========================================
        const PaymentDesData = {
            payment_id: _payment.payment_id,
            description: description,
            payment: payment,
            instructions: instructions,
            surcharge_title: surcharge_title,

            lang_code: lang_code,

        };
        Object.keys(PaymentDesData).forEach(
            (key) =>
                PaymentDesData[key] === undefined && delete PaymentDesData[key],
        );
        let _paymentDes = await this.paymentDescriptionService.create(PaymentDesData);
        return "Payment Added"


    }
    async updatePayment(id, data) {

        const {
            company_id,
            usergroup_ids,
            position,
            status,
            template,
            processor_id,
            processor_params,
            a_surcharge,
            p_surcharge,
            tax_ids,
            localization,
            payment_category,
            description,
            payment,
            instructions,
            surcharge_title,

            lang_code,
        } = data;
        const PaymentData = {
            company_id: company_id,
            usergroup_ids: usergroup_ids,
            position: position,
            status: status,
            template: template,
            processor_id: processor_id,
            processor_params: processor_params,
            a_surcharge: a_surcharge,
            p_surcharge: p_surcharge,
            tax_ids: tax_ids,
            localization: localization,
            payment_category: payment_category,

        };
        Object.keys(PaymentData).forEach(
            (key) =>
                PaymentData[key] === undefined && delete PaymentData[key],
        );
        let _payment = await this.repository.update(id, PaymentData);


        ///===========================================
        const PaymentDesData = {
            description: description,
            payment: payment,
            instructions: instructions,
            surcharge_title: surcharge_title,

            lang_code: lang_code,

        };
        Object.keys(PaymentDesData).forEach(
            (key) =>
                PaymentDesData[key] === undefined && delete PaymentDesData[key],
        );
        let _paymentDes = await this.paymentDescriptionService.update(id, PaymentDesData);
        return "Payment Updated"

    }
}
