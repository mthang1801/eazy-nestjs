import { formatStandardTimeStamp } from '../../utils/helper';
export class PageEntity {
  page_id: number = 0;
  page_name: string = '';
  page_type: string = '';
  device_type: string = 'D';
  status: string = 'A';
  link_url: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
