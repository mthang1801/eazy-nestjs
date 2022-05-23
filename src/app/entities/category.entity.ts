import { formatStandardTimeStamp } from 'src/utils/helper';

export class CategoryEntity {
  category_appcore_id: number = 0;
  parent_id: number = 0;
  parent_appcore_id: number = 0;
  id_path: string = '';
  level: number = 0;
  company_id: number = 0;
  is_show_homepage: string = 'N';
  usergroup_ids: string = '';
  status: string = 'A';
  product_count: number = 0;
  position: number = 9999;
  is_op: string = 'N';
  selected_views: string = '';
  slug: string = '';
  category_type: string = 'C';
  category_magento_id: number = 0;
  id_magento_path: string = '';
  parent_magento_id: number = 0;
  feature_id: number = 0;
  icon: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  display_at: string = formatStandardTimeStamp();
}
