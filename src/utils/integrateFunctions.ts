import { convertToMySQLDateTime } from './helper';
export const itgOrderFromAppcore = (cData) => {
  const ctpMap = new Map([
    ['id', 'origin_order_id'],
    ['store_id', 'storeId'],
  ]);
};

export const itgCustomerFromAppcore = (cData) => {
  const dataMap = new Map([
    ['fullName', 'lastname'],
    ['phoneNo', 'phone'],
    ['gender', 'gender'],
    ['email', 'email'],
    ['dateOfBirth', 'birthday'],
    ['cityName', 'b_city'],
    ['districtName', 'b_district'],
    ['address', 'b_address'],
    ['deleted', 'status'],
    ['createdAt', 'created_at'],
    ['updatedAt', 'updated_at'],
    ['id', 'referer'],
  ]);
  let data = {};
  for (let [core, prop] of dataMap) {
    if (
      core === 'createdAt' ||
      core === 'updatedAt' ||
      core === 'dateOfBirth'
    ) {
      data[prop] = convertToMySQLDateTime(new Date(cData[core]));

      continue;
    }
    if (core === 'deleted') {
      data[prop] = cData[core] === true ? 'D' : 'B';
      continue;
    }

    data[prop] = cData[core];
  }

  return data;
};
