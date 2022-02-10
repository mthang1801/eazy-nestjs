import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderStatusEntity } from '../entities/orderStatus.entity';
export class OrderStatusRepository<orderStatusEntity> extends BaseRepositorty<orderStatusEntity> {
    constructor(databaseService: DatabaseService, table: Table) {
        super(databaseService, table);
        this.table = Table.ORDER_STATUS;
        this.tableProps = Object.getOwnPropertyNames(new OrderStatusEntity());

    }
}
