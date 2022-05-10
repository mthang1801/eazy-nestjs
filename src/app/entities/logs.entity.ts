import { formatStandardTimeStamp } from '../../utils/helper';
export class LogEntity {
  log_id: number = 0;
  status: number = 1;
  module_name: string = '';
  ref_id: string = '';
  detail: string = '';
  error_detail: string = '';
  error_source: string = '';
  created_at: string = formatStandardTimeStamp();
  method: string = '';
  source_url: string = '';
}
