import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { DiscountProgramEntity } from '../entities/discountProgram.entity';

export class DiscountProgramRepository<
DiscountProgramEntity,
> extends BaseRepositorty<DiscountProgramEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.DISCOUNT_PROGRAM;
    this.tableProps = Object.getOwnPropertyNames(
      new DiscountProgramEntity(),
    );
  }
}
