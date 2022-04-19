import { formatStandardTimeStamp } from '../../utils/helper';
export class CommentEntity {
  comment_id: number = 0;
  product_id: number = 0;
  user_id: number = 0;
  parent_comment_id: number = 0;
  phone: string = '';
  email: string = '';
  fullname: string = '';
  status: string = 'A';
  comment: string = '';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
