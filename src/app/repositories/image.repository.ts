import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { ImagesEntity } from '../entities/image.entity';
import { ImagesLinksEntity } from '../entities/image_link_entity';
export class ImagesRepository<
  ImagesEntity,
> extends BaseRepositorty<ImagesEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.IMAGE;
  }
  ImageDataProps = Object.getOwnPropertyNames(new ImagesEntity());

}
export class ImagesLinksRepository<
  ImagesLinksEntity,
> extends BaseRepositorty<ImagesLinksEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.IMAGE_LINK;
  }
  ImageLinkDataProps = Object.getOwnPropertyNames(new ImagesLinksEntity());

}
