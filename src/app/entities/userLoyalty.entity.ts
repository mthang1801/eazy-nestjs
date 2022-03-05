import { convertToMySQLDateTime } from 'src/utils/helper';

export class UserLoyaltyEntity {
  user_id: number = 0;
  loyalty_point: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
