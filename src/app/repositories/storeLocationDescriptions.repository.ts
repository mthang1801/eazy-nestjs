import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { StoreLocationDescriptionEntity } from '../entities/storeLocationDescription.entity';

@Injectable()
export class StoreLocationDescriptionsRepository<
  StoreLocationDescriptionEntity,
> extends BaseRepositorty<StoreLocationDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STORE_LOCATION_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new StoreLocationDescriptionEntity(),
    );
  }
}
