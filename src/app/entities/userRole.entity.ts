import { formatStandardTimeStamp } from '../../utils/helper';
export class UserRoleEntity {
  user_role_id: number = 0;
  partner_id: number = 0;
  user_id: number = 0;
  role_id: number = 0;
  status: string = 'A';
  created_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_at: string = formatStandardTimeStamp();
  updated_by: number = 0;
}
