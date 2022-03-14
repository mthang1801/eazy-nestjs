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
  localization: string = '';
  age_verification: string = 'N';
  age_limit: number = 0;
  parent_age_verification: string = 'N';
  parent_age_limit: number = 0;
  selected_views: string = '';
  slug: string = '';
  product_details_view: string = '';
  product_columns: number = 0;
  is_trash: string = '';
  category_type: string = 'C';
  created_at: string = convertToMySQLDateTime();
  display_at: string = convertToMySQLDateTime();
}
