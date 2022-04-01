import { convertToMySQLDateTime } from '../../utils/helper';
export class UserLoyaltyHistoryEntity {
  user_id: number = 0;
  point: number = 0;
  type: number = 1;
  by_type: string = 'A';
  ref_id: string = '';
  created_at: string = '';
}
