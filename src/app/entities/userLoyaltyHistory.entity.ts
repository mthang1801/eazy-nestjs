import { convertToMySQLDateTime } from '../../utils/helper';
export class UserLoyaltyHistoryEntity {
  user_id: number = 0;
  point: number = 0;
  type: string = 'A';
  by_type: string = '';
  ref_id: number = 0;
  created_at: string = '';
}
