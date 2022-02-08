import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';
import { CategoryEntity } from '../entities/category.entity';

@Injectable()
export class CategoryRepository<
  CategoryEntity,
> extends BaseRepositorty<CategoryEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORIES;
  }

  getCategoryDataProps() {
    const categoryData = new CategoryEntity();

    return Object.getOwnPropertyNames(categoryData);
  }
  categoryDataProps = [
    'parent_id',
    'id_path',
    'level',
    'company_id',
    'usergroup_ids',
    'status',
    'product_count',
    'position',
    'is_op',
    'localization',
    'age_verification',
    'age_limit',
    'parent_age_verification',
    'parent_age_limit',
    'selected_views',
    'default_view',
    'product_details_view',
    'product_columns',
    'is_trash',
    'category_type',
  ];
  setData(data) {
    let categoryDataObject = {};
    for (let [key, val] of Object.entries(data)) {
      if (this.categoryDataProps.includes(key)) {
        categoryDataObject[key] = val;
      }
    }
    return categoryDataObject;
  }
}
