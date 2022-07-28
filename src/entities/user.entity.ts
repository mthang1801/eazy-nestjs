import { formatStandardTimeStamp } from 'src/utils/helper';

export class UserEntity {
  user_id: number = 0;
  fullname: string = '';
  mobile_phone: string = '';
  status: number = 1;
  email: string = '';
  gender: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
