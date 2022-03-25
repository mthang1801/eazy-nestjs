import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/database.service';
import { BaseRepositorty } from '../../base/base.repository';

import { Table } from '../../database/enums/index';
import { StickerEntity } from '../entities/sticker.entity';

@Injectable()
export class StickerRepository<
  StickerEntity,
> extends BaseRepositorty<StickerEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.STICKER;
    this.tableProps = Object.getOwnPropertyNames(new StickerEntity());
  }
}
