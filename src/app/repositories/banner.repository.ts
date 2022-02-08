import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
export class BannerRepository<Banner> extends BaseRepositorty<Banner> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER;
  }
}
export class BannerImageRepository<
  BannerImages,
> extends BaseRepositorty<BannerImages> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_IMAGE;
  }
}
export class BannerDescriptionsRepository<
  BannerDescriptions,
> extends BaseRepositorty<BannerDescriptions> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_DESCRIPTIONS;
  }
}
