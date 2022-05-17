import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { DiscountProgramDetailEntity } from '../entities/discountProgramDetail.entity';

export class DiscountProgramDetailRepository<
  DiscountProgramDetailEntity,
> extends BaseRepositorty<DiscountProgramDetailEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.DISCOUNT_PROGRAM_DETAIL;
    this.tableProps = Object.getOwnPropertyNames(
      new DiscountProgramDetailEntity(),
    );
  }
}
