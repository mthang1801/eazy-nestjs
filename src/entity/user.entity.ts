import { formatStandardTimeStamp } from 'src/utils/helper';

export class UserEntity {
  status: string = 'A';
  user_type: string = 'C';
  user_login: string = 'SYSTEM';
  user_appcore_id: number = null;
  account_type: number = 2;
  company_id: number = 0;
  store_id: number = 0;
  last_login: string = formatStandardTimeStamp();
  password: string = '';
  salt: string = '';
  firstname: string = '';
  lastname: string = '';
  company: string = '';
  email: string = '';
  gender: string = '0';
  phone: string = '';
  fax: string = '';
  url: string = '';
  tax_exempt: string = '';
  lang_code: string = 'vi';
  type: number = 1;
  birthday: string = null;
  purchase_timestamp_from: null | string;
  purchase_timestamp_to: null | string;
  responsible_email: string = '';
  last_passwords: string = '';
  password_change_timestamp: number = 0;
  avatar: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
  lasted_buy_at: null | string = null;
  created_by: number = 0;
  is_sync: string = 'N';
}
