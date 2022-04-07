import { convertToMySQLDateTime } from 'src/utils/helper';

export class ProductVariationGroupIndexEntity {
  group_ids: string = '';
  type: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
