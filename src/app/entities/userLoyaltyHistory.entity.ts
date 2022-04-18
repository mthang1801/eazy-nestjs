import { formatStandardTimeStamp } from '../../utils/helper';
export class UserLoyaltyHistoryEntity {
  user_id: number = 0;
  point: number = 0;
  type: number = 1;
  by_type: string = 'A';
  order_appcore_id: number = 0;
  ref_id: string = '';
  created_at: string = '';
}
