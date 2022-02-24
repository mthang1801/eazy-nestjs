import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { StoreLocationEntity } from '../entities/storeLocation.entity';

@Injectable()
export class StoreLocationRepository<
  StoreLocationEntity,
> extends BaseRepositorty<StoreLocationEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STORE_LOCATIONS;
    this.tableProps = Object.getOwnPropertyNames(new StoreLocationEntity());
  }
}
