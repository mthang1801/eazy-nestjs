import { convertToMySQLDateTime } from './helper';
import { OrderStatusEnum } from '../database/enums/status.enum';
import * as moment from 'moment';

export const itgOrderFromAppcore = (cData) => {
  const dataMapping = new Map([
    ['id', 'order_code'],
    ['storeId', 'store_id'],
    ['orderSourceId', 'ref_order_id'],
    ['saleId', 'employee_id'],
    ['saleNote', 'internal_note'],
    ['status', 'status'],
    ['orderType', 'order_type'],
    ['customerId', 'user_appcore_id'],
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
    ['installMoneyAccountId', 'installed_money_account_id'],
    ['installMoneyCode', 'installed_money_code'],
    ['payCreditFeeType', 'pay_credit_type'],
    ['otherFees', 'other_fees'],
    ['creditFeeAcountId', 'credit_account_id'],
    ['totalAmount', 'total'],
    ['codeShip', 'shipping_ids'],
    ['deleted', 'status'],
    ['createdAt', 'created_date'],
    ['updatedAt', 'updated_date'],
    ['companyId', 'company_id'],
    ['customerTransferNo', 'transfer_no'],
    ['customerBankName', 'transfer_bank'],
    ['customerIndentifyNo', 'id_card'],
    ['couponCode', 'coupon_code'],
    ['partnerPaymentStatus', 'payment_status'],
    ['promotionId', 'promotion_id'],
  ]);
  let data = {};
  for (let [core, app] of dataMapping) {
    if (core === 'deleted') {
      if (cData[core]) {
        data[app] = OrderStatusEnum.Failed;
        continue;
      }
    }
    if (core === 'created_at' || core === 'updated_at') {
      if (cData[core]) {
        data[app] = convertToMySQLDateTime(new Date(cData[core]));
        continue;
      }
    }
    data[app] = cData[core];
  }
  return data;
};

export const itgOrderItemFromAppCore = (cData) => {
  const dataMapping = new Map([
    ['id', 'order_item_appcore_id'],
    ['orderId', 'order_id'],
    ['productId', 'product_id'],
    ['productPrice', 'price'],
    ['quantity', 'amount'],
    ['totalAmount', 'amount'],
    ['belongOrderDetailId', 'belong_order_detail_id'],
    ['note', 'note'],
    ['isGiftTaken', 'is_gift_taken'],
    ['deleted', 'status'],
  ]);
  let data = {};
  for (let [core, app] of dataMapping) {
    if (core === 'deleted') {
      data[app] = cData[core] ? 'D' : 'A';
      continue;
    }
    data[app] = cData[core];
  }
  return data;
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
    ['cityName', 's_city'],
    ['districtName', 's_district'],
    ['address', 's_address'],
    ['createdAt', 'created_at'],
    ['updatedAt', 'updated_at'],
    ['id', 'user_appcore_id'],
    ['type', 'type'],
    ['', 'data'],
    ['avatar', 'image_path'],
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
    if (app === 'data') {
      data[app] = JSON.stringify({
        note: cData['note'],
        totalBuyedAmount: cData['totalBuyedAmount'],
        totalBuyedNo: cData['totalBuyedNo'],
        lastedBuyedAt: cData['lastedBuyedAt'],
        indentifyCardFrontUrl: cData['indentifyCardFrontUrl'],
        indentifyCardBackUrl: cData['indentifyCardBackUrl'],
        indentifyNo: cData['indentifyNo'],
      });
      continue;
    }

    data[app] = cData[core];
  }

  return data;
};

export const itgCreateCustomerFromAppcore = () => {};

export const itgCustomerToAppcore = (data) => {
  const dataMapping = new Map([
    ['fullName', 'fullName'],
    ['phone', 'phoneNo'],
    ['gender', 'gender'],
    ['email', 'email'],
    ['birthday', 'dateOfBirth'],
    ['b_city', 'cityId'],
    ['b_district', 'districtId'],
    ['b_ward', 'wardId'],
    ['b_address', 'address'],
  ]);

  let cData = {};
  for (let [app, core] of dataMapping) {
    if (app === 'fullName') {
      cData[core] = data['firstname'] + ' ' + data['lastname'];
      continue;
    }
    if (app === 'status') {
      cData[core] = false;
      continue;
    }
    if (app === 'b_city' || app === 'b_district' || app === 'b_ward') {
      cData[core] = +data[app];
      continue;
    }
    if (app === 'email' && !data[app]) {
      delete data[app];
      continue;
    }
    if (app === 'birthday' && data[app]) {
      cData[core] = moment(data[app]).format('YYYY-MM-DD');
      continue;
    }
    cData[core] = data[app] ?? null;
  }
  return cData;
};

export const itgProductsFromAppcore = () => {
  const dataMapping = new Map([
    ['id', 'product_id'],
    ['categoryId', 'category_id'],
    ['parentId', 'parent_product_id'],
    ['barCode', 'barcode'],
    ['code', 'product_code'],
    ['name', 'product'],
    ['price', 'price'],
    ['wholesalePrice', 'whole_price'],
    ['images', 'images'],
    ['status', 'status'],
    ['width', 'width'],
    ['height', 'height'],
  ]);
};
