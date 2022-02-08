import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { Banner } from '../entities/banner.entity';
export class BannerRepository<Banner> extends BaseRepositorty<Banner> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER;
  }

}
<<<<<<< HEAD
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
=======
>>>>>>> b2897f184b46e5cc7003a90a94ef0c76f09baa01
