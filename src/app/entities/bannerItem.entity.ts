import { formatStandardTimeStamp } from 'src/utils/helper';

export class BannerItemEntity {
  banner_item_id: number = 0;
  banner_id: number = 0;
  status: string = 'A';
  title: string = '';
  image_url: string = '';
  background: string = '';
  position: number = null;
  link_target_url: string = null;
  start_at: string = null;
  end_at: string = null;
  created_at: string = null;
  updated_at: string = null;
}
