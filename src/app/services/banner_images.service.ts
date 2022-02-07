import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { BannerImages } from '../entities/banner_images.entity';
import { BannerImageRepository } from '../repositories/banner.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class BannerImagesService extends BaseService<
  BannerImages,
  BannerImageRepository<BannerImages>
> {
  constructor(repository: BannerImageRepository<BannerImages>, table: Table) {
    super(repository, table);
    this.table = Table.BANNER_IMAGE;
  }
  async Create(data) {
    return this.repository.create(data);
  }
  async findById(id: number): Promise<BannerImages> {
    return this.repository.findById(id);
  }
}
