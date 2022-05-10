import { formatStandardTimeStamp } from '../../utils/helper';
export class ReviewCommentUserIPEntity {
  id: number = 0;
  user_id: string = '';
  last_comment: string = formatStandardTimeStamp();
}
