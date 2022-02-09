export class CategoryEntity {
  category_id: number = 0;
  parent_id: number = 0;
  id_path: string = '';
  level: number = 1;
  company_id: number = 0;
  usergroup_ids: string = '';
  status: string = '';
  product_count: number = 0;
  position: number = 0;
  is_op: string = '';
  localization: string = '';
  age_verification: string = '';
  age_limit: number = 0;
  parent_age_verification: string = '';
  parent_age_limit: number = 0;
  selected_views: string = '';
  default_view: number = 0;
  product_details_view: string = '';
  product_columns: number = 0;
  is_trash: string = '';
  category_type: string = '';
  created_at: Date = new Date();
  updated_at: Date = new Date();
}
