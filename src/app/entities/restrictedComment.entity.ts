import { formatStandardTimeStamp } from '../../utils/helper';
export class RestrictedCommentEntity {
  id: number = 0;
  keywords: string = '';
  status: string = 'A';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
