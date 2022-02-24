export class StoreLocationEntity {
  store_location_id: number = 0;
  company_id: number = 0;
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
}
