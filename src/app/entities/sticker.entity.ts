import { convertToMySQLDateTime } from '../../utils/helper';
export class StickerEntity {
  sticker_id: number = 0;
  sticker_code: string = '';
  sticker_name: string = '';
  description: string = '';
  sticker_status: string = 'A';
  url_image: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
  created_by: number = 0;
  updated_by: number = 0;
}
