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
