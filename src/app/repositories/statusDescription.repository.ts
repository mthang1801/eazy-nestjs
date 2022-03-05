import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { StatusDescriptionEntity } from '../entities/statusDescription';

export class StatusDescriptionRepository<
  StatusDescriptionEntity,
> extends BaseRepositorty<StatusDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STATUS_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(new StatusDescriptionEntity());
  }
}
