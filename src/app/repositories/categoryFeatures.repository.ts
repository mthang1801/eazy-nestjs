import { Injectable } from '@nestjs/common';
import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CategoryFeatureEntity } from '../entities/categoryFeature.entity';

@Injectable()
export class CategoryFeaturesRepository<
  CategoryFeatureEntity,
> extends BaseRepositorty<CategoryFeatureEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORY_FEATURES;
    this.tableProps = Object.getOwnPropertyNames(new CategoryFeatureEntity());
  }
}
