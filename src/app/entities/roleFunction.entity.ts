import { formatStandardTimeStamp } from '../../utils/helper';
export class RoleFunctionEntity {
  id: number = 0;
  role_id: number = 0;
  funct_id: number = 0;
  permission: number = 1;
  created_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_at: string = formatStandardTimeStamp();
  updated_by: number = 0;
}
