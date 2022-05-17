import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { CacheEntity } from '../entities/cache.entity';

export class CacheRepository<CacheEntity> extends BaseRepositorty<CacheEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CACHE;
    this.tableProps = Object.getOwnPropertyNames(new CacheEntity());
  }
}
