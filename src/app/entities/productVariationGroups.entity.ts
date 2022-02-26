import { convertToMySQLDateTime } from 'src/utils/helper';

export class ProductVariationGroupsEntity {
  group_id: number = 0;
  code: string = '';
  product_root_id: number = 0;
  status: string = 'A';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
