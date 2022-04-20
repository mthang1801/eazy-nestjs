import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ReviewEntity } from '../entities/review.entity';

export class ReviewRepository<
  ReviewEntity,
> extends BaseRepositorty<ReviewEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.REVIEWS;
    this.tableProps = Object.getOwnPropertyNames(new ReviewEntity());
  }
}
