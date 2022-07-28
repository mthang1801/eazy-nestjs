import { Injectable } from '@nestjs/common';

import { Table } from '../database/enums/tables.enum';
import { UserEntity } from '../entities/user.entity';
import { DatabaseService } from '../database/database.service';
import { BaseRepositorty } from '../base/base.repository';

@Injectable()
export class UserRepository extends BaseRepositorty {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
    this.table = Table.USER;
    this.tableProps = Object.getOwnPropertyNames(new UserEntity());
    this.defaultValues = new UserEntity();
  }
}
