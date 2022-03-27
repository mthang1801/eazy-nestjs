import { convertToMySQLDateTime } from '../../utils/helper';
export class StoreLocationEntity {
  store_location_id: number = 0;
  company_id: number = 0;
  company_name: string = '';
  position: number = 0;
  city_id: number = 0;
  city_name: string = '';
  district_id: number = 0;
  district_name: string = '';
  ward_id: number = 0;
  ward_name: string = '';
  latitude: number = 0;
  longitude: number = 0;
  localization: string = '';
  status: string = 'A';
  main_destination_id: number = 0;
  pickup_destinations_ids: string = '';
  product_count: number = 0;
  employee_id: number = 0;
  area_id: number = 0;
  area_name: string = '';
  open_at: string = '';
  close_at: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
