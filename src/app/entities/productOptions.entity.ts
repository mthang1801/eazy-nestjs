export class ProductOptionsEntity {
  option_id: number = 0;
  product_id: number = 0;
  company_id: number = 0;
  option_type: string = 'S';
  inventory: string = 'Y';
  regexp: string = '';
  required: string = 'N';
  multiupload: string = 'N';
  allowed_extensions: string = '';
  max_file_size: number = 0;
  missing_variants_handling: string = 'M';
  status: string = 'A';
  position: number = 0;
  value: string = '';
}
