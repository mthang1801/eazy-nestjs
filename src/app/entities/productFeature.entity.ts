export class ProductFeatureEntity {
  feature_id: number = 0;
  feature_code: string = '';
  company_id: number = 0;
  purpose: string = '';
  feature_style: string = '';
  filter_style: string = '';
  feature_type: string = 'T';
  categories_path: string = '';
  parent_id: number = 0;
  display_on_product: string = 'Y';
  display_on_catalog: string = 'Y';
  display_on_header: string = 'N';
  status: string = 'A';
  position: number = 0;
  comparison: string = 'N';
}
