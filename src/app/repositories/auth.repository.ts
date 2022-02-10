import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/index';
import { AuthProviderEntity } from '../entities/authProvider.entity';
export class AuthProviderRepository<
  AuthProviderEntity,
> extends BaseRepositorty<AuthProviderEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.USERS_AUTH;
  }
}
