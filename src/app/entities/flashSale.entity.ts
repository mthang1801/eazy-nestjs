import { convertToMySQLDateTime } from 'src/utils/helper';
export class FlashSaleEntity {
  code: string = '';
  name: string = '';
  status: string = 'A';
  url: string = '';
  description: string = '';
  flash_type: number = 0;
  start_at: string = convertToMySQLDateTime();
  end_at: string = '';
  logo_img: string = '';
  background_img: string = '';
  show_countdown: string = 'N';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
