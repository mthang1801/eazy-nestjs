import { formatStandardTimeStamp } from 'src/utils/helper';

export class BannerEntity {
  banner_id: number;
  status: string = 'A';
  device_type: string = 'D';
  position: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
