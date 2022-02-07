import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';

@Injectable()
export class CategoryVendorProductCountRepository<
  CategoryVendorProductCountEntity,
> extends BaseRepositorty<CategoryVendorProductCountEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORY_VENDOR_PRODUCT_COUNT;
  }
}
