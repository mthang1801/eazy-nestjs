import { BaseRepositorty } from '../base/base.repository';
import { Table } from '../database/enums/tables.enum';
import { DatabaseService } from '../database/database.service';
import { CacheEntity } from '../entities/cache.entity';
export class CacheRepository extends BaseRepositorty {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
    this.table = Table.CACHE;
    this.tableProps = Object.getOwnPropertyNames(new CacheEntity());
    this.defaultValues = new CacheEntity();
  }
}
