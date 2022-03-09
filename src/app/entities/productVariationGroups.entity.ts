import { convertToMySQLDateTime } from 'src/utils/helper';

export class ProductVariationGroupsEntity {
  group_id: number = 0;
  code: string = '';
  product_root_id: number = 0;
  status: string = 'A';
  group_type: number = 1; //1 : Nhóm SP thường, IMEI. 2: Nhóm SP combo
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
