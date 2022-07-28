import { OrderEntity } from '../entities/order.entity';
import { BaseRepositorty } from '../base/base.repository';
import { Table } from '../database/enums/tables.enum';
import { DatabaseService } from '../database/database.service';
import { ErrorLogEntity } from '../entities/errorLog.entity';
export class ErrorLogRepository extends BaseRepositorty {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
    this.table = Table.ERROR_LOG;
    this.tableProps = Object.getOwnPropertyNames(new ErrorLogEntity());
    this.defaultValues = new ErrorLogEntity();
  }
}
