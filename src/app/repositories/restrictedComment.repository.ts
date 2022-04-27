import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { RestrictedCommentEntity } from '../entities/restrictedComment.entity';

export class RestrictedCommentRepository<
  RestrictedCommentEntity,
> extends BaseRepositorty<RestrictedCommentEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.RESTRICTED_COMMENTS;
    this.tableProps = Object.getOwnPropertyNames(new RestrictedCommentEntity());
  }
}
