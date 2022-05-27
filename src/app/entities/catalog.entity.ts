import { formatStandardTimeStamp } from '../../utils/helper';
export class CatalogEntity {
  catalog_name: string = '';
  status: string = 'A';
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
