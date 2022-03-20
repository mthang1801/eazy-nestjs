import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { BannerPageDescriptionEntity } from '../entities/bannerPageDescription.entity';

export class BannerPageDescriptionRepository<
  BannerPageDescriptionEntity,
> extends BaseRepositorty<BannerPageDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_PAGE_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new BannerPageDescriptionEntity(),
    );
  }
}
