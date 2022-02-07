import { Injectable } from '@nestjs/common';
import { BaseService } from '../../base/base.service';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesRepository } from '../repositories/image.repository';
import { Table } from '../../database/enums/index';

@Injectable()
export class ImagesService extends BaseService<
  ImagesEntity,
  ImagesRepository<ImagesEntity>
> {
  constructor(repository: ImagesRepository<ImagesEntity>, table: Table) {
    super(repository, table);
    this.table = Table.IMAGE;
  }
  async Create(data) {
    return this.repository.create(data);
  }
  
}
