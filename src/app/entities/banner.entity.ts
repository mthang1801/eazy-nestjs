import { convertToMySQLDateTime } from 'src/utils/helper';

export class BannerEntity {
  banner_id: number;
  status: string = 'A';
  type: string = 'G';
  target: string = 'B';
  location_id: string = '';
  position: number = 0;
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
