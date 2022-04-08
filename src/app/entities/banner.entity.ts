import { formatStandardTimeStamp } from 'src/utils/helper';

export class BannerEntity {
  banner_id: number;
  status: string = 'A';
  device_type: string = 'G';
  position: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
