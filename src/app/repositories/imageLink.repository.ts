import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/imageLinkEntity';
export class ImagesLinksRepository<
  ImagesLinksEntity,
> extends BaseRepositorty<ImagesLinksEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.IMAGE_LINK;
    this.tableProps = Object.getOwnPropertyNames(new ImagesLinksEntity());
  }
}
