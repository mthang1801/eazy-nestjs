import { formatStandardTimeStamp } from '../../utils/helper';
export class ReviewCommentItemsEntity {
  item_id: number = 0;
  product_id: number = 0;
  user_id: number = null;
  parent_item_id: number = null;
  point: number = 0;
  phone: string = '';
  email: string = '';
  fullname: string = '';
  status: string = 'A';
  comment: string = '';
  type: number = 1;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
