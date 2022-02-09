import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { paymentDescriptionsEntity } from '../entities/payment-description.entity';
import { PaymentDescriptionsRepository } from '../repositories/payment-description.repository';
import { Table } from '../../database/enums/index';
import { LoggerService } from '../../logger/custom.logger';

@Injectable()
export class PaymentDescriptionService extends BaseService<
paymentDescriptionsEntity,
PaymentDescriptionsRepository<paymentDescriptionsEntity>
> {
    constructor(repository: PaymentDescriptionsRepository<paymentDescriptionsEntity>, table: Table) {
        super(repository, table);
        this.table = Table.PAYMENT_DESCRIPTION;
    }

}
