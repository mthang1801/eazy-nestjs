export interface ICategory {
  category_id: number;
  parant_id: number;
  id_path: string;
  level: number;
  company_id: number;
  usergroup_ids: string;
  status: string;
  product_count: number;
  position: number;
  timestampt: Date;
  is_op: string;
  localization: string;
  age_verification: string;
  age_limit: number;
  parent_age_verification: string;
  parent_age_limit: number;
  selected_views: string;
  default_view: string;
  product_details_view: string;
  product_columns: number;
  is_trash: string;
  category_type: string;
}
