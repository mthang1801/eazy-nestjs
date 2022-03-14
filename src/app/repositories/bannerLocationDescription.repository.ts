import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { BannerLocationDescriptionEntity } from '../entities/bannerLocationDescription.entity';

export class BannerLocationDescriptionRepository<
  BannerLocationDescriptionEntity,
> extends BaseRepositorty<BannerLocationDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER_LOCATION_DESCRIPTION;
    this.tableProps = Object.getOwnPropertyNames(
      new BannerLocationDescriptionEntity(),
    );
  }
}
