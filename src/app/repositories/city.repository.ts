import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { CityEntity } from '../entities/cities.entity';
export class CityRepository<CityEntity> extends BaseRepositorty<CityEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CITIES;
    this.tableProps = Object.getOwnPropertyNames(new CityEntity());
  }
}
