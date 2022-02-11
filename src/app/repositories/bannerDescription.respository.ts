import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { bannerDescriptionsEntity } from '../entities/bannerDescriptions.entity';
export class bannerDescriptionsRepository<
  BannerDescriptions,
> extends BaseRepositorty<BannerDescriptions> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_DESCRIPTIONS;
    this.tableProps = Object.getOwnPropertyNames(
      new bannerDescriptionsEntity(),
    );
  }
}
