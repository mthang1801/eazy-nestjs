import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { BannerTargetDescriptionEntity } from '../entities/bannerTargetDescription.entity';

export class BannerTargetDescriptionRepository<
  BannerTargetDescriptionEntity,
> extends BaseRepositorty<BannerTargetDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_TARGET_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new BannerTargetDescriptionEntity(),
    );
  }
}
