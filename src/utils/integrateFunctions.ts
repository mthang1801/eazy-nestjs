import { convertToMySQLDateTime } from './helper';
export const itgOrderFromAppcore = (cData) => {
  const dataMap = new Map([
    ['id', 'origin_order_id'],
    ['storeId', 'store_id'],
    ['orderSourceId', 'ref_order_id'],
    ['saleId', 'employee_id'],
    ['saleNote', 'internal_note'],
    ['status', 'status'],
    ['orderType', 'order_type'],
    ['customerId', 'user_id'],
    ['customerName', 'b_lastname'],
    ['customerName', 's_lastname'],
    ['customerMobile', 'b_phone'],
    ['customerMobile', 's_phone'],
    ['customerAddress', 'b_address'],
    ['customerAddress', 's_address'],
    ['customerNote', 'note'],
    ['discountType', 'discount_type'],
    ['discountAmount', 'discount_amount'],
    ['customerShipFee', 'shipping_cost'],
    ['shipFee', 'shipping_fee'],
    ['transferAmount', 'transfer_amount'],
    ['transferAccountId', 'transfer_account_id'],
    ['transferCode', 'transfer_code'],
    ['transferReferenceCode', 'transfer_ref_code'],
    ['depositAmount', 'disposit_amount'],
    ['cashAccountId', 'cash_account_id'],
    ['creditAmount', 'credit_amount'],
    ['creditAccountId', 'credit_account_id'],
    ['creditCode', 'credit_code'],
    ['creditCardNo', 'credit_card_no'],
    ['installedMoneyAmount', 'installed_money_amount'],
  ]);

  for (let [core, app] of dataMap) {
  }
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
    ['id', 'user_id'],
  ]);
  let data = {};
  for (let [core, app] of dataMap) {
    if (
      core === 'createdAt' ||
      core === 'updatedAt' ||
      core === 'dateOfBirth'
    ) {
      data[app] = convertToMySQLDateTime(new Date(cData[core]));
      continue;
    }
    if (core === 'deleted') {
      data[app] = cData[core] === true ? 'D' : 'B';
      continue;
    }

    data[app] = cData[core];
  }

  return data;
};
