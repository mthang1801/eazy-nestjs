import { formatStandardTimeStamp } from 'src/utils/helper';

export class ProductVariationGroupsEntity {
  group_id: number = 0;
  product_root_id: number = 0;
  status: string = 'A';
  group_type: number = 1; //1 : Nhóm SP thường, IMEI. 2: Nhóm SP combo
  group_name: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
