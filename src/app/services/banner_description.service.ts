import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { BannerDescriptions } from '../entities/banner_descriptions.entity';
import { BannerDescriptionsRepository } from '../repositories/banner.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class BannerDescriptionsService extends BaseService<
  BannerDescriptions,
  BannerDescriptionsRepository<BannerDescriptions>
> {
  constructor(
    repository: BannerDescriptionsRepository<BannerDescriptions>,
    table: Table,
  ) {
    super(repository, table);
    this.table = Table.BANNER_DESCRIPTIONS;
  }

  async Create(data) {
    return this.repository.create(data);
  }
}
