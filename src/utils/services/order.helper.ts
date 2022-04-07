import { formatStandardTimeStamp } from '../helper';

export const formatOrderTimestamp = (order) => {
  order['created_date'] = order['created_date']
    ? formatStandardTimeStamp(order['created_date'])
    : order['created_date'];
  order['updated_date'] = order['updated_date']
    ? formatStandardTimeStamp(order['updated_date'])
    : order['updated_date'];
  return order;
};
