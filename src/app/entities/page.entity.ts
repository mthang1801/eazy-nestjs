import { formatStandardTimeStamp } from '../../utils/helper';
export class PageEntity {
  page_id: number = 0;
  page_name: string = '';
  page_data: string = '';
  page_type: number = 1;
  status: string = 'A';
  link_url: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
