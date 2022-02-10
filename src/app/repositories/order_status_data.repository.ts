import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { OrderStatusDataEntity } from '../entities/orderStatus-data.entity';

export class OrderStatusDataRepository<orderStatusDataEntity> extends BaseRepositorty<orderStatusDataEntity> {
    constructor(databaseService: DatabaseService, table: Table) {
        super(databaseService, table);
        this.table = Table.ORDER_STATUS_DATA;
        this.tableProps = Object.getOwnPropertyNames(new OrderStatusDataEntity());

    }
}