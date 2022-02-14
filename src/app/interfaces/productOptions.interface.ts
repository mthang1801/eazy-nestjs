export interface IProductOptions {
  option_id: number;
  product_id: number;
  company_id: number;
  option_type: string;
  inventory: string;
  regexp: string;
  required: string;
  multiupload: string;
  allowed_extensions: string;
  max_file_size: number;
  missing_variants_handling: string;
  status: string;
  position: number;
  value: string;
}
