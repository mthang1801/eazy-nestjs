import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { TestEntity } from '../entities/test.entity';

@Injectable()
export class TestRepository<
  TestEntity,
> extends BaseRepositorty<TestEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.TEST;
    this.tableProps = Object.getOwnPropertyNames(new TestEntity());
  }
}
