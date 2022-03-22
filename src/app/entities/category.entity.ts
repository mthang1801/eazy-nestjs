import { convertToMySQLDateTime } from 'src/utils/helper';

export class CategoryEntity {
  category_id: number = 0;
  parent_id: number = 0;
  id_path: string = '';
  level: number = 0;
  company_id: number = 0;
  usergroup_ids: string = '';
  status: string = 'A';
  product_count: number = 0;
  position: number = 0;
  is_op: string = 'N';
  selected_views: string = '';
  slug: string = '';
  category_type: string = 'C';
  category_magento_id: number = 0;
  id_magento_path: string = '';
  parent_magento_id: number = 0;
  feature_id: number = 0;
  created_at: string = convertToMySQLDateTime();
  display_at: string = convertToMySQLDateTime();
}
