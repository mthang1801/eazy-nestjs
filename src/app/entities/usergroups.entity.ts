import { formatStandardTimeStamp } from '../../utils/helper';
export class UserGroupEntity {
  usergroup_id: number = 0;
  status: string = 'A';
  company_id: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
