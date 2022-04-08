import { formatStandardTimeStamp } from 'src/utils/helper';

export class ProductStoreHistoryEntity {
  history_id: number = 0;
  store_location_id: number = 0;
  product_id: string = '';
  amount: number = 0;
  created_at: string = formatStandardTimeStamp();
  updated_at: string = formatStandardTimeStamp();
}
