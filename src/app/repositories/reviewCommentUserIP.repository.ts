import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ReviewCommentItemsEntity } from '../entities/reviewCommentItems.entity';
import { ReviewCommentUserIPEntity } from '../entities/reviewCommentUserIP.entity';

export class ReviewCommentUserIPRepository<
  ReviewCommentUserIPEntity,
> extends BaseRepositorty<ReviewCommentUserIPEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.REVIEW_COMMENT_USER_IP;
    this.tableProps = Object.getOwnPropertyNames(
      new ReviewCommentUserIPEntity(),
    );
  }
}
