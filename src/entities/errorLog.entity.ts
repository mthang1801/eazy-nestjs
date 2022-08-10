import { formatStandardTimeStamp } from '../utils/functions.utils';

export class ErrorLogEntity {
  log_id: number = 0;
  headers: string = '';
  path_name: string = '';
  original_url: string = '';
  method: string = '';
  params: string = '';
  query: string = '';
  body: string = '';
  error_details: string = '';
  source: string = '';
  status_code: number = null;
  created_at: string = formatStandardTimeStamp();
}
