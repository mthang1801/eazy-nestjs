import { convertToMySQLDateTime } from 'src/utils/helper';

export class BannerItemEntity {
  banner_item_id: number = 0;
  banner_id: number = 0;
  location_id: number = 0;
  page_type: number = 1;
  page_url: string = '';
  page_description: string = '';
}
