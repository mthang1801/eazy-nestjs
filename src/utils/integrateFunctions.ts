import { convertNullDatetimeData, convertToMySQLDateTime } from './helper';

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
    ['codeShip', 'shipping_id'],
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
        data[app] = 11;
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

export const itgCreateCustomerFromAppcore = (coreData) => {
  const dataMapping = new Map([
    ['firstname', 'firstname'],
    ['lastname', 'lastname'],
    ['phone', 'phone'],
    ['user_appcore_id', 'user_appcore_id'],
    ['gender', 'gender'],
    ['email', 'email'],
    ['birthday', 'birthday'],
    ['b_city', 'b_city'],
    ['b_district', 'b_district'],
    ['b_ward', 'b_ward'],
    ['b_address', 'b_address'],
    ['b_city', 's_city'],
    ['b_district', 's_district'],
    ['b_ward', 's_ward'],
    ['b_address', 's_address'],
    ['created_at', 'created_at'],
    ['updated_at', 'updated_at'],
    ['type', 'type'],
  ]);
  let cmsData = {};
  for (let [core, cms] of dataMapping) {
    if (core === 'created_at' || core === 'updated_at' || core === 'birthday') {
      cmsData[cms] = convertNullDatetimeData(coreData[core]);
      continue;
    }
    if (core === 'b_phone') {
      cmsData[cms] = coreData[core] || coreData['phone'];
      continue;
    }
    if (core === 'gender') {
      cmsData[cms] = coreData[core] == true ? 1 : 0;
      continue;
    }
    cmsData[cms] = coreData[core];
  }
  return cmsData;
};

export const itgUpdateCustomerFromAppcore = (coreData) => {
  const dataMapping = new Map([
    ['firstname', 'firstname'],
    ['lastname', 'lastname'],
    ['gender', 'gender'],
    ['email', 'email'],
    ['birthday', 'birthday'],
    ['b_phone', 'b_phone'],
    ['b_city', 'b_city'],
    ['b_district', 'b_district'],
    ['b_ward', 'b_ward'],
    ['b_address', 'b_address'],
    ['b_phone', 's_phone'],
    ['b_city', 's_city'],
    ['b_district', 's_district'],
    ['b_ward', 's_ward'],
    ['b_address', 's_address'],
    ['created_at', 'created_at'],
    ['updated_at', 'updated_at'],
    ['type', 'type'],
  ]);
  let cmsData = {};
  for (let [core, cms] of dataMapping) {
    if (core === 'created_at' || core === 'updated_at' || core === 'birthday') {
      cmsData[cms] = convertNullDatetimeData(coreData[core]);
      continue;
    }
    if (core === 'gender') {
      cmsData[cms] = coreData[core] == true ? 1 : 0;
      continue;
    }

    cmsData[cms] = coreData[core];
  }
  return cmsData;
};

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

export const itgCreateCategoryFromAppcore = (coreData) => {
  const mappingData = new Map([
    ['category_id', 'category_magento_id'],
    ['parent_id', 'parent_magento_id'],
    ['display_at', 'display_at'],
  ]);
  let cmsData = { ...coreData };
  delete cmsData['category_id'];
  delete cmsData['parent_id'];

  for (let [core, cms] of mappingData) {
    if (core === 'display_at') {
      cmsData[cms] = convertToMySQLDateTime(coreData[core]);
      continue;
    }
    cmsData[cms] = coreData[core];
  }
  return cmsData;
};

export const itgConvertProductsFromAppcore = (data) => {
  const mappingData = new Map([
    ['product_id', 'product_appcore_id'],
    ['parent_product_id', 'parent_product_appcore_id'],
    ['category_id', 'category_id'],
  ]);
  let convertedData = { ...data };
  for (let [fromData, toData] of mappingData) {
    if (fromData === 'category_id') {
      convertedData[toData] = !convertedData[fromData]
        ? 0
        : convertedData[fromData];
      continue;
    }
    convertedData[toData] = convertedData[fromData];
    delete convertedData[fromData];
  }

  const mappingComboData = new Map([
    ['product_id', 'product_appcore_id'],
    ['product_combo_id', 'parent_product_appcore_id'],
    ['id', 'other_appcore_id'],
    ['quantity', 'amount'],
  ]);

  if (convertedData['combo_items'] && convertedData['combo_items'].length) {
    for (let convertedDataItem of convertedData['combo_items']) {
      for (let [fromData, toData] of mappingComboData) {
        convertedDataItem[toData] = convertedDataItem[fromData];
        delete convertedDataItem[fromData];
      }
    }
  }

  return convertedData;
};

export const convertGetProductsFromAppcore = (appCoreData) => {
  const mappingData = new Map([
    ['id', 'product_appcore_id'],
    ['categoryId', 'category_id'],
    ['parentId', 'parent_product_appcore_id'],
    ['barCode', 'barcode'],
    ['code', 'product_code'],
    ['name', 'product'],
    ['otherName', 'shortname'],
    ['importPrice', 'buy_price'],
    ['oldPrice', 'list_price'],
    ['price', 'price'],
    ['wholesalePrice', 'whole_price'],
    ['images', 'images'],
    ['status', 'status'],
    ['description', 'full_description'],
    ['content', 'promo_text'],
    ['width', 'width'],
    ['height', 'height'],
    ['length', 'length'],
    ['createdDateTime', 'created_at'],
    ['typeId', 'product_type'],
  ]);

  let cmsData = {};
  for (let [appcore, cms] of mappingData) {
    if (appcore === 'status') {
      cmsData[cms] = appCoreData[appcore] === 1 ? 'A' : 'D';
      continue;
    }
    if (appCoreData[appcore] === null) {
      cmsData['cms'] = '';
      continue;
    }
    cmsData[cms] = appCoreData[appcore];
  }

  return cmsData;
};
