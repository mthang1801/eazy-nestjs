import { convertToMySQLDateTime } from 'src/utils/helper';
import { UserMenuEntity } from './userMenu.entity';
export class UserEntity {
  status: string = 'A';
  user_type: string = 'C';
  user_login: string = 'SYSTEM';
  user_appcore_id: number = 0;
  is_root: string = '';
  company_id: number = 0;
  store_id: number = 0;
  last_login: number = 0;
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
  birthday: string = convertToMySQLDateTime();
  purchase_timestamp_from: null | string;
  purchase_timestamp_to: null | string;
  responsible_email: string = '';
  last_passwords: string = '';
  password_change_timestamp: number = 0;
  api_key: string = '';
  janrain_identifier: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  lasted_buy_at: string = convertToMySQLDateTime();
}
