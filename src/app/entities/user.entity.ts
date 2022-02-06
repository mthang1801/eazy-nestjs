export class UserEntity {
  user_id: number;
  status: string;
  user_type: string;
  user_login: string;
  referer: string;
  is_root: string;
  company_id: number;
  last_login: number;
  created_at: Date;
  password: string;
  salt: string;
  firstname: string;
  lastname: string;
  company: string;
  email: string;
  phone: string;
  fax: string;
  url: string;
  tax_exempt: string;
  lang_code: string;
  birthday: Date;
  purchase_timestamp_from: Date;
  purchase_timestamp_to: Date;
  responsible_email: string;
  last_passwords: string;
  password_change_timestamp: number;
  api_key: string;
  janrain_identifier: string;
  verify_token: string;
  verify_token_exp: Date;
  otp: number;
  otp_incorrect_times: number;
}

export class UserProfileEntity {
  profile_id: number; //primary key
  user_id: number; //primary key
  profile_type: string;
  b_firstname: string;
  b_lastname: string;
  b_address: string;
  b_address_2: string;
  b_city: string;
  b_county: string;
  b_state: string;
  b_country: string;
  b_zipcode: string;
  b_phone: string;
  s_firstname: string;
  s_lastname: string;
  s_address: string;
  s_address_2: string;
  s_city: string;
  s_county: string;
  s_state: string;
  s_country: string;
  s_zipcode: string;
  s_phone: string;
  s_address_type: string;
  profile_name: string;
}

export class UserDataEntity {
  user_id: number;
  type: string;
  data: string;
}
