import { Injectable } from '@nestjs/common';

import { BaseRepositorty } from '../../base/base.repository';
import { DatabaseService } from '../../database/database.service';
import { Table } from '../../database/enums/tables.enum';

@Injectable()
export class CategoryDescriptionRepository<
  CategoryDescriptionEntity,
> extends BaseRepositorty<CategoryDescriptionEntity> {
  constructor(databaseService: DatabaseService, table: Table) {
    super(databaseService, table);
    this.table = Table.CATEGORY_DESCRIPTIONS;
  }
  categoryDescriptionProps = [
    'lang_code',
    'category',
    'description',
    'meta_keywords',
    'meta_description',
    'page_title',
    'age_warning_message',
  ];
  setData(data) {
    const categoryDescriptionObject = {};
    for (let [key, val] of Object.entries(data)) {
      if (this.categoryDescriptionProps.includes(key)) {
        categoryDescriptionObject[key] = val;
      }
    }
    return categoryDescriptionObject;
  }
}
