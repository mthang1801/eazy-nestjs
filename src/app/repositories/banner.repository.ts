import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { BannerEntity } from '../entities/banner.entity';
export class BannerRepository<
  BannerEntity,
> extends BaseRepositorty<BannerEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.BANNER;
    this.tableProps = Object.getOwnPropertyNames(new BannerEntity());
  }
}
