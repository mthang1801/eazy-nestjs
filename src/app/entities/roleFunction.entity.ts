import { formatStandardTimeStamp } from '../../utils/helper';
export class RoleFunctionEntity {
  funct_id: number = 0;
  created_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_at: string = formatStandardTimeStamp();
  updated_by: number = 0;
}
