export interface IErrorLog {
  headers: string;
  path_name: string;
  original_url: string;
  params?: any;
  query?: any;
  method: string;
  body?: string | null;
  error_details: string;
  status_code: number;
}
