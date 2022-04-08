import { formatStandardTimeStamp } from 'src/utils/helper';

export class ProductVariationGroupIndexEntity {
  group_ids: string = '';
  type: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
