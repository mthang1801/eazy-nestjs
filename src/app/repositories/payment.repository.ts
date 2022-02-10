import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { PaymentEntity } from '../entities/payment.entity';
export class PaymentRepository<PaymentEntity> extends BaseRepositorty<PaymentEntity> {
    constructor(databaseService: DatabaseService, table: Table) {
        super(databaseService, table);
        this.table = Table.PAYMENT;
        this.tableProps = Object.getOwnPropertyNames(new PaymentEntity());

    }
}

