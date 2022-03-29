import { convertToMySQLDateTime } from 'src/utils/helper';
export class CatalogCategoryEntity {
  catalog_appcore_id: number = 0;
  attribute_set_id: number = 0;
  parent_id: number = 0;
  parent_appcore_id: number = 0;
  path: string = '';
  position: number = 0;
  level: number = 0;
  children_count: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
