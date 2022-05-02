import { formatStandardTimeStamp } from '../../utils/helper';
export class ReviewEntity {
  review_id: number = 0;
  product_id: number = 0;
  ratings: string = '';
  avg_point: number = 0;
  count: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
