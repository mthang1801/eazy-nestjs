import { convertToMySQLDateTime } from 'src/utils/helper';

export class BannerEntity {
  banner_id: number;
  location_id: number = 0;
  target_id: number = 0;
  status: string = 'A';
  device_type: string = 'G';
  position: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
