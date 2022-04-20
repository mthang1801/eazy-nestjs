import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ReviewCommentItemsEntity } from '../entities/reviewCommentItems.entity';

export class ReviewCommentItemRepository<
  ReviewCommentItemsEntity,
> extends BaseRepositorty<ReviewCommentItemsEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.REVIEW_COMMENT_ITEMS;
    this.tableProps = Object.getOwnPropertyNames(
      new ReviewCommentItemsEntity(),
    );
  }
}
