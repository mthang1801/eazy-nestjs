import { ExampleEntity } from '../entities/example.entity';
import { BaseRepositorty } from '../base/base.repository';
import { Table } from '../database/enums/tables.enum';
import { DatabaseService } from '../database/database.service';
export class OrderRepository extends BaseRepositorty {
  constructor(databaseService: DatabaseService) {
    super(databaseService);
    this.table = Table.EXAMPLE;
    this.tableProps = Object.getOwnPropertyNames(new ExampleEntity());
    this.defaultValues = new ExampleEntity();
  }
}
