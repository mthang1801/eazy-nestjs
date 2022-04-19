import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ReviewsEntity } from '../entities/reviews.entity';
export class ReviewRepository<
  ReviewsEntity,
> extends BaseRepositorty<ReviewsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.REVIEWS;
    this.tableProps = Object.getOwnPropertyNames(new ReviewsEntity());
  }
}
