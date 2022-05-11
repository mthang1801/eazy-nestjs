import { formatStandardTimeStamp } from '../../utils/helper';
export class RoleEntity {
  usergroup_id: number = 0;
  status: string = 'A';
  company_id: number = 0;
  description: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
