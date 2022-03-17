import { convertToMySQLDateTime } from 'src/utils/helper';

export class ShippingsServiceDescriptionEntity {
  service_id: number = 0;
  service_name: string = '';
  service_description: string = '';
  lang_code: string = '';
}
