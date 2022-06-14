import { formatStandardTimeStamp } from 'src/utils/helper';

export class BannerEntity {
  banner_id: number;
  banner: string = '';
  background: string = '';
  banner_title: string = '';
  page_target_id: number = null;
  page_location_id: number = null;
  status: string = 'A';
  device_type: string = 'D';
  auto_slide: string = 'N';
  slide_per_page: number = 1;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
