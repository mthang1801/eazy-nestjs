import { formatStandardTimeStamp } from '../../utils/helper';
export class FunctEntity {
  funct_id: number = 0;
  parent_id: number = 0;
  funct_code: string = '';
  funct_name: string = '';
  route: string = '';
  be_route: string = '';
  icon: string = '';
  level: number = 0;
  position: number = 0;
  is_required_access: string = 'Y';
  is_role_display: string = 'Y';
  created_at: string = formatStandardTimeStamp();
  created_by: number = 0;
  updated_at: string = formatStandardTimeStamp();
  updated_by: number = 0;
}
