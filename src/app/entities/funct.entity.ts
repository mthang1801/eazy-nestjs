import { formatStandardTimeStamp } from '../../utils/helper';
export class FunctEntity {
  funct_id: number = 0;
  parent_id: number = 0;
  funct_code: string = '';
  funct_name: string = '';
  route: string = '';
  icon: string = '';
  level: number = 0;
  created_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_at: string = formatStandardTimeStamp();
  updated_by: number = 0;
}
