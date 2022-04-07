import { convertToMySQLDateTime } from 'src/utils/helper';
export class FlashSaleEntity {
  code: string = '';
  name: string = '';
  status: string = 'A';
  url: string = '';
  description: string = '';
  flash_type: number = 0;
  start_at: null | string = null;
  end_at: null | string = null;
  logo_img: string = '';
  background_img: string = '';
  show_countdown: string = 'N';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
