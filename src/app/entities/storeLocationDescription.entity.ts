import { convertToMySQLDateTime } from 'src/utils/helper';

export class StoreLocationDescriptionEntity {
  store_location_id: number = 0;
  lang_code: string = 'vi';
  store_name: string = '';
  short_name: string = '';
  pickup_address: string = '';
  pickup_phone: string = '';
  pickup_time: string = convertToMySQLDateTime();
}
