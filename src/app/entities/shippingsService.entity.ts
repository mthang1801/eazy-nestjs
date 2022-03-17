import { convertToMySQLDateTime } from 'src/utils/helper';

export class ShippingsServiceEntity {
  service_id: number;
  status: string = '';
  shipping_id: number = 0;
  service_code: string = '';
  created_at: string = convertToMySQLDateTime();
  updated_at: string = convertToMySQLDateTime();
}
