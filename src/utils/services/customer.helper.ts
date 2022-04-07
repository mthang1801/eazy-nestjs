import { formatStandardTimeStamp } from '../helper';

export const formatCustomerTimestamp = (customer) => {
  customer['created_at'] = customer['created_at']
    ? formatStandardTimeStamp(customer['created_at'])
    : customer['created_at'];
  customer['updated_at'] = customer['updated_at']
    ? formatStandardTimeStamp(customer['updated_at'])
    : customer['updated_at'];
  customer['birthday'] = customer['birthday']
    ? formatStandardTimeStamp(customer['birthday'])
    : customer['birthday'];
  return customer;
};
