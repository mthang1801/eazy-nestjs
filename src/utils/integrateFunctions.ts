import {
  checkValidTimestamp,
  convertNullDatetimeData,
  convertToSlug,
  formatStandardTimeStamp,
  removeVietnameseTones,
  validateEmail,
} from './helper';

import { UserRepository } from '../app/repositories/user.repository';
import { saltHashPassword } from './cipherHelper';
import { defaultPassword } from '../constants/defaultPassword';
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
        data[app] = formatStandardTimeStamp(new Date(cData[core]));
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
      data[app] = formatStandardTimeStamp(new Date(cData[core]));
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
    ['address', 'b_address'],
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
    if (core === 'firstname') {
      cmsData['b_firstname'] = coreData[core];
      cmsData['s_firstname'] = coreData[core];
    }
    if (core === 'lastname') {
      cmsData['b_lastname'] = coreData[core];
      cmsData['s_lastname'] = coreData[core];
    }

    if (core === 'b_city') {
      cmsData['s_city'] = coreData[core];
    }
    if (core === 'b_district') {
      cmsData['s_district'] = coreData[core];
    }
    if (core === 'b_ward') {
      cmsData['s_ward'] = coreData[core];
    }
    if (core === 'b_address' && coreData[core]) {
      cmsData['s_address'] = coreData[core];
    }

    if (core === 'address' && coreData[core]) {
      cmsData['s_address'] = coreData[core];
      cmsData['b_address'] = coreData[core];
    }

    if (core === 'phone') {
      cmsData['b_phone'] = coreData[core];
      cmsData['s_phone'] = coreData[core];
    }
    cmsData[cms] = coreData[core];
  }

  cmsData['profile_name'] = `${cmsData['firstname'] || ''} ${
    cmsData['lastname'] || ''
  }`;

  return cmsData;
};

export const itgUpdateCustomerFromAppcore = (coreData) => {
  const dataMapping = new Map([
    ['firstname', 'firstname'],
    ['lastname', 'lastname'],
    ['gender', 'gender'],
    ['email', 'email'],
    ['birthday', 'birthday'],
    ['b_city', 'b_city'],
    ['b_district', 'b_district'],
    ['b_ward', 'b_ward'],
    ['b_address', 'b_address'],
    ['created_at', 'created_at'],
    ['updated_at', 'updated_at'],
    ['address', 'b_address'],
    ['type', 'type'],
  ]);
  let cmsData = {};
  for (let [core, cms] of dataMapping) {
    if (core === 'created_at' || core === 'updated_at' || core === 'birthday') {
      cmsData[cms] = convertNullDatetimeData(coreData[core]);
      continue;
    }

    if (core === 'firstname' && coreData[core]) {
      cmsData['b_firstname'] = coreData[core];
      cmsData['s_firstname'] = coreData[core];
    }
    if (core === 'lastname' && coreData[core]) {
      cmsData['b_lastname'] = coreData[core];
      cmsData['s_lastname'] = coreData[core];
    }

    if (core === 'b_city' && coreData[core]) {
      cmsData['s_city'] = coreData[core];
    }
    if (core === 'b_district' && coreData[core]) {
      cmsData['s_district'] = coreData[core];
    }
    if (core === 'b_ward' && coreData[core]) {
      cmsData['s_ward'] = coreData[core];
    }
    if (core === 'b_address' && coreData[core]) {
      cmsData['s_address'] = coreData[core];
    }

    if (core === 'address' && coreData[core]) {
      cmsData['s_address'] = coreData[core];
      cmsData['b_address'] = coreData[core];
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
    ['note', 'note'],
  ]);

  let cData = {};

  for (let [app, core] of dataMapping) {
    if (app === 'fullName') {
      cData[core] = data['b_lastname'];
      continue;
    }
    if (app === 'status') {
      cData[core] = false;
      continue;
    }
    if (app === 'b_city') {
      cData[core] = +data[app] || 255;
      continue;
    }
    if (app === 'b_district') {
      cData[core] = +data[app] || 329;
      continue;
    }
    if (app === 'b_ward') {
      cData[core] = +data[app] || 10266;
      continue;
    }
    if (app === 'email') {
      if (validateEmail(data[app])) {
        cData[core] = data[app];
      }
      continue;
    }
    if (app === 'birthday') {
      if (checkValidTimestamp(data[app])) {
        cData[core] = moment(data[app]).format('YYYY-MM-DD');
      }
      continue;
    }
    cData[core] = data[app];
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
      cmsData[cms] = formatStandardTimeStamp(coreData[core]);
      continue;
    }
    cmsData[cms] = coreData[core];
  }
  return cmsData;
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

export const mappingStatusOrder = (coreStatus) => {
  console.log('mapping status', coreStatus);
  let result;
  switch (+coreStatus) {
    case 2:
      result = '3';
      break;
    case 12:
      result = '3';
      break;
    case 13:
      result = '3';
      break;
    case 14:
      result = '3';
      break;
    case 15:
      result = '3';
      break;
    case 11:
      result = '8';
      break;
    default:
      result = coreStatus;
  }
  return result;
};

export const convertOrderDataFromAppcore = (coreData) => {
  // let mappingData = new Map([
  //   ['b_lastname', 'b_lastname'],
  //   ['b_phone', 'b_phone'],
  //   ['b_city', 'b_city'],
  //   ['b_district', 'b_district'],
  //   ['b_ward', 'b_ward'],
  //   ['b_address', 'b_address'],
  // ]);
  // let cmsData = { ...coreData };
  // for (let [core, cms] of mappingData) {
  //   if (core === 'b_firstname' && coreData[core] && !cmsData['s_firstname']) {
  //     cmsData['s_firstname'] = coreData[core];
  //   }
  //   if (core === 'b_lastname' && coreData[core] && !cmsData['s_lastname']) {
  //     cmsData['s_lastname'] = coreData[core];
  //   }
  //   if (core === 'b_phone' && coreData[core] && !cmsData['s_phone']) {
  //     cmsData['s_phone'] = coreData[core];
  //   }
  //   if (core === 'b_city' && coreData[core] && !cmsData['s_city']) {
  //     cmsData['s_city'] = coreData[core];
  //   }
  //   if (core === 'b_district' && coreData[core] && !cmsData['s_district']) {
  //     cmsData['s_district'] = coreData[core];
  //   }
  //   if (core === 'b_ward' && coreData[core] && !cmsData['s_ward']) {
  //     cmsData['s_ward'] = coreData[core];
  //   }
  //   if (core === 'b_address' && coreData[core] && !cmsData['s_address']) {
  //     cmsData['s_address'] = coreData[core];
  //   }
  // }

  return coreData;
};

export const importCustomersFromAppcore = (coreData) => {
  const mappingData = new Map([
    ['address', 'b_address'],
    ['city', 'b_city'],
    ['createdAt', 'created_at'],
    ['dateOfBirth', 'birthday'],
    ['district', 'b_district'],
    ['email', 'email'],
    ['fullName', 'lastname'],
    ['gender', 'gender'],
    ['id', 'user_appcore_id'],
    ['note', 'note'],
    ['phoneNo', 'phone'],
    ['totalPoint', 'loyalty_point'],
    ['type', 'type'],
    ['updatedAt', 'updated_at'],
    ['ward', 'b_ward'],
    ['totalBuyedNo', 'total_purchase'],
    ['totalBuyedAmount', 'total_purchase_amount'],
    ['indentifyNo', 'indentify_number'],
    ['lastedBuyedAt', 'last_buy_at'],
  ]);
  let cmsData = {};
  for (let [core, cms] of mappingData) {
    if (core === 'phoneNo' && coreData[core]) {
      cmsData[cms] = coreData[core];
    }
    if (
      (core === 'address' ||
        core === 'city' ||
        core === 'district' ||
        core === 'ward') &&
      coreData[core]
    ) {
      cmsData[`b_${core}`] = coreData[core];
      cmsData[`s_${core}`] = coreData[core];
      continue;
    }

    if (core == 'fullName' && coreData[core]) {
      cmsData['b_lastname'] = coreData[core];
      cmsData['s_lastname'] = coreData[core];
      cmsData['profile_name'] = coreData[core];
    }

    if (core == 'lastname' && coreData[core]) {
      cmsData['b_lastname'] = coreData[core];
      cmsData['s_lastname'] = coreData[core];
    }

    if (core === 'phoneNo' && coreData[core]) {
      cmsData[`b_phone`] = coreData[core];
      cmsData[`s_phone`] = coreData[core];
    }

    if (['createdAt', 'updatedAt', 'dateOfBirth'].includes(core)) {
      if (checkValidTimestamp(coreData[core])) {
        cmsData[cms] = formatStandardTimeStamp(coreData[core]);
      }

      continue;
    }

    cmsData[cms] = coreData[core];
  }

  const { passwordHash, salt } = saltHashPassword(defaultPassword);
  cmsData['password'] = passwordHash;
  cmsData['salt'] = salt;
  return cmsData;
};

export const convertCategoryFromAppcore = (coreData) => {
  const mappingData = new Map([
    ['category_id', 'category_appcore_id'],
    ['category', 'category'],
    ['parent_id', 'parent_appcore_id'],
    ['display_at', 'display_at'],
  ]);

  let cmsData = { ...coreData };
  for (let [core, cms] of mappingData) {
    if (core === 'category' && coreData[core]) {
      cmsData['category_appcore'] = coreData[core];
    }
    if (core === 'display_at' && coreData[core]) {
      if (checkValidTimestamp(coreData[core])) {
        cmsData[cms] = formatStandardTimeStamp(coreData[core]);
      }
      continue;
    }
    if (coreData[core]) {
      cmsData[cms] = coreData[core];
    }
  }

  delete cmsData['category_id'];
  delete cmsData['parent_id'];
  return cmsData;
};

export const convertProductDataFromAppcore = (coreProduct) => {
  const mappingData = new Map([
    ['barCode', 'barcode'],
    ['productCode', 'product_code'],
    ['id', 'product_id'],
    ['parentProductId', 'parent_product_id'],
    ['productCategory', 'category_id'],
    ['productCodeVat', 'tax_ids'],
    ['productName', 'product'],
    ['productNameVat', 'tax_name'],
    ['productType', 'product_type'],
    ['originPrice', 'list_price'],
    ['returnSellingPrice', 'collect_price'],
    ['sellingPrice', 'price'],
    ['wholesalePrice', 'whole_price'],
    ['status', 'status'],
    ['totalQuantityInStock', 'amount'],
    ['typeOfProduct', 'type'],
    ['listColor', 'color'],
    ['listSize', 'size'],
    ['note', 'note'],
    ['width', 'width'],
    ['height', 'height'],
    ['length', 'length'],
    ['weight', 'weight'],
  ]);

  let cmsProduct = {};
  for (let [core, cms] of mappingData) {
    if (core === 'status') {
      cmsProduct[cms] = coreProduct[core] == 1 ? 'A' : 'D';
      continue;
    }
    if (['listSize', 'listColor'].includes(core)) {
      if (coreProduct[core] && coreProduct[core].length) {
        cmsProduct[cms] = coreProduct[core][0]['name'];
        cmsProduct['product_features'] = cmsProduct['product_features']
          ? [...cmsProduct['product_features'], coreProduct[core][0]]
          : [coreProduct[core][0]];
      } else {
        cmsProduct[cms] = null;
        cmsProduct['product_features'] = [];
      }
      continue;
    }
    if (core === 'productName') {
      cmsProduct['product_core_name'] = coreProduct[core];
    }
    if (
      [
        'width',
        'height',
        'length',
        'totalQuantityInStock',
        'weight',
        'productCategoryId',
        'originPrice',
        'returnSellingPrice',
        'sellingPrice',
        'wholesalePrice',
      ].includes(core)
    ) {
      cmsProduct[cms] = +coreProduct[core] || 0;
      continue;
    }

    if (core === 'typeOfProduct') {
      cmsProduct[cms] = +coreProduct[core] || 1;
      continue;
    }

    if (core === 'productCategory' && coreProduct['productCategory']) {
      cmsProduct[cms] = coreProduct['productCategory'];
      continue;
    }

    cmsProduct[cms] = coreProduct[core];
  }

  const mappdingComboItems = new Map([
    ['id', 'appcore_combo_setting_id'],
    ['productCode', 'product_code'],
    ['productComboId', 'product_combo_id'],
    ['productId', 'product_id'],
    ['productName', 'product'],
    ['quantity', 'quantity'],
  ]);
  if (
    coreProduct['listProductInCombo'] &&
    coreProduct['listProductInCombo'].length
  ) {
    for (let productCoreItem of coreProduct['listProductInCombo']) {
      let productCMSItem = {};
      for (let [core, cms] of mappdingComboItems) {
        if (core === 'productName') {
          productCMSItem['product_core_name'] = productCoreItem[core];
        }
        productCMSItem[cms] = productCoreItem[core];
      }
      cmsProduct['combo_items'] = cmsProduct['combo_items']
        ? [...cmsProduct['combo_items'], productCMSItem]
        : [productCMSItem];
    }
  }

  return cmsProduct;
};

export const itgConvertProductsFromAppcore = (data) => {
  const mappingData = new Map([
    ['product_id', 'product_appcore_id'],
    ['parent_product_id', 'parent_product_appcore_id'],
    ['category_id', 'category_appcore_id'],
    ['product', 'product'],
    ['tax_name', 'tax_name'],
  ]);
  let convertedData = { ...data };
  for (let [fromData, toData] of mappingData) {
    if (fromData === 'category_id') {
      if (!convertedData[fromData]) {
        convertedData['category_id'] = 0;
        convertedData[toData] = 0;
      } else {
        convertedData[toData] = convertedData[fromData];
      }

      continue;
    }

    if (fromData === 'product' && convertedData[fromData]) {
      convertedData['product_core_name'] = convertedData[fromData];
      convertedData['shortname'] = convertedData[fromData];
      convertedData['short_description'] = convertedData[fromData];
      convertedData['page_title'] = convertedData[fromData];
      convertedData['promo_text'] = convertedData[fromData];
    }

    convertedData[toData] = convertedData[fromData];
  }

  const mappingComboData = new Map([
    ['product_id', 'product_appcore_id'],

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

  if (convertedData['product']) {
    convertedData['slug'] = convertToSlug(convertedData['product']);
  }

  delete convertedData['product_id'];
  delete convertedData['parent_product_id'];

  convertedData['product_function'] =
    convertedData['product_type'] < 3
      ? !convertedData['parent_product_appcore_id']
        ? 4
        : 2
      : convertedData['product_type'];

  return convertedData;
};

export const itgConvertGiftAccessoriesFromAppcore = (coreData, type) => {
  let mappdingData = new Map([
    ['app_core_id', 'app_core_id'],
    ['name', 'accessory_name'],
    ['code', 'accessory_code'],
    ['description', 'description'],
    ['is_active', 'accessory_status'],
    ['start_date', 'display_at'],
    ['end_date', 'end_at'],
  ]);

  let cmsData = {};
  for (let [core, cms] of mappdingData) {
    if (core == 'is_active') {
      cmsData[cms] = coreData[core] == 1 ? 'A' : 'D';
      continue;
    }
    if (['start_date', 'end_date'].includes(core)) {
      if (checkValidTimestamp(coreData[core])) {
        cmsData[cms] = formatStandardTimeStamp(coreData[core]);
      }
      continue;
    }
    cmsData[cms] = coreData[core];
  }

  cmsData['accessory_type'] = type;

  if (
    coreData['accessory_items'] &&
    Array.isArray(coreData['accessory_items']) &&
    coreData['accessory_items'].length
  ) {
    let mappingAccessoryItems = new Map([
      ['product_id', 'product_appcore_id'],
      ['repurchase_price', 'collect_price'],
      ['is_active', 'status'],
      ['app_core_id', 'app_core_id'],
    ]);
    let cmsAccessoryItems = [];
    for (let accessoryItem of coreData['accessory_items']) {
      let cmsAccessoryItem = {};
      for (let [core, cms] of mappingAccessoryItems) {
        if (core == 'is_active') {
          cmsAccessoryItem[cms] = accessoryItem[core] == 1 ? 'A' : 'D';
          continue;
        }
        cmsAccessoryItem[cms] = accessoryItem[core];
      }
      cmsAccessoryItems = [...cmsAccessoryItems, cmsAccessoryItem];
    }
    cmsData['accessory_items'] = cmsAccessoryItems;
  }

  if (
    coreData['accessory_applied_products'] &&
    Array.isArray(coreData['accessory_applied_products']) &&
    coreData['accessory_applied_products'].length
  ) {
    let cmsAccessoryAppliedItems = [];
    for (let productItem of coreData['accessory_applied_products']) {
      let cmsAccessoryAppliedItem = {
        product_appcore_id: productItem['product_id'],
      };
      cmsAccessoryAppliedItems = [
        ...cmsAccessoryAppliedItems,
        cmsAccessoryAppliedItem,
      ];
    }

    cmsData['accessory_applied_products'] = cmsAccessoryAppliedItems;
  }
  return cmsData;
};

export const convertTradeinProgramFromAppcore = (coreData) => {
  let cmsData = {};
  cmsData['tradein_appcore_id'] = coreData['id'];
  cmsData['name'] = coreData['name'];
  cmsData['description'] = coreData['description'];
  cmsData['status'] = coreData['isActive'] ? 'A' : 'D';
  if (coreData['startDate']) {
    cmsData['start_at'] = formatStandardTimeStamp(coreData['startDate']);
  }

  if (coreData['endDate']) {
    cmsData['end_at'] = formatStandardTimeStamp(coreData['endDate']);
  }
  cmsData['discount_rate'] = coreData['amortizationExpense'];
  cmsData['applied_products'] = [];
  if (coreData['listProduct'] && coreData['listProduct'].length) {
    for (let productItem of coreData['listProduct']) {
      let appliedProductItem = {};
      appliedProductItem['detail_appcore_id'] = productItem['id'];
      appliedProductItem['product_appcore_id'] = productItem['productId'];
      appliedProductItem['product'] = productItem['productName'];
      appliedProductItem['product_code'] = productItem['productCode'];
      appliedProductItem['collect_price'] = productItem['buyingPrice'];
      appliedProductItem['price'] = productItem['sellingPrice'];
      appliedProductItem['product_type'] = productItem['type'];
      cmsData['applied_products'].push(appliedProductItem);
    }
  }
  cmsData['applied_criteria'] = [];
  if (coreData['listCreteriaGroup'] && coreData['listCreteriaGroup'].length) {
    for (let criteriaItem of coreData['listCreteriaGroup']) {
      let appliedCriteriaItem = {};
      appliedCriteriaItem['criteria_appcore_id'] = criteriaItem['id'];
      appliedCriteriaItem['position'] = criteriaItem['priority'];
      appliedCriteriaItem['criteria_name'] = criteriaItem['criterialName'];
      appliedCriteriaItem['criteria_style'] = criteriaItem['type'];
      appliedCriteriaItem['criteria_status'] = criteriaItem['isDisplayOnWeb']
        ? 'A'
        : 'D';
      appliedCriteriaItem['applied_criteria_detail'] = [];
      if (criteriaItem['listItem'] && criteriaItem['listItem'].length) {
        for (let criteriaDetailItem of criteriaItem['listItem']) {
          let appliedCriteriaDetailItem = {};
          appliedCriteriaDetailItem['criteria_detail_name'] =
            criteriaDetailItem['name'];
          appliedCriteriaDetailItem['criteria_detail_appcore_id'] =
            criteriaDetailItem['id'];
          appliedCriteriaDetailItem['operator_type'] =
            criteriaDetailItem['operatorType'] == 1 ? 'A' : 'S';
          appliedCriteriaDetailItem['amount_type'] =
            criteriaDetailItem['amountType'];
          appliedCriteriaDetailItem['value'] = criteriaDetailItem['amount'];
          appliedCriteriaDetailItem['criteria_detail_description'] =
            criteriaDetailItem['description'];
          appliedCriteriaDetailItem['accessory_category_appcore_id'] =
            criteriaDetailItem['productComponentCategoryId'];
          appliedCriteriaDetailItem['accessory_category_appcore_name'] =
            criteriaDetailItem['cateName'];

          appliedCriteriaItem['applied_criteria_detail'].push(
            appliedCriteriaDetailItem,
          );
        }
      }
      cmsData['applied_criteria'].push(appliedCriteriaItem);
    }
  }

  console.log(cmsData);

  return cmsData;
};

export const convertTradeinProgramOldReceiptFromAppcore = (coreData) => {
  let cmsData = {};
  cmsData['old_receipt_appcore_id'] = coreData['id'];
  cmsData['code'] = coreData['code'];
  cmsData['store_id'] = coreData['storeId'];
  cmsData['user_appcore_id'] = coreData['providerId'];
  cmsData['user_name'] = coreData['providerName'];
  cmsData['description'] = coreData['description'];
  cmsData['status'] = coreData['status'];
  cmsData['amount'] = coreData['totalAmount'];
  cmsData['description'] = coreData['description'];
  cmsData['created_by'] = coreData['createdBy'];
  if (coreData['createdAt'] && moment(coreData['createdAt']).isValid()) {
    cmsData['created_at'] = formatStandardTimeStamp(coreData['createdAt']);
  }
  cmsData['cash_amount'] = coreData['cashAmount'];
  cmsData['cash_account_code'] = coreData['cashAccountCode'];
  cmsData['cash_account_name'] = coreData['cashAccName'];
  cmsData['transfer_account_code'] = coreData['transferAccountCode'];
  cmsData['transfer_account_name'] = coreData['transferAccName'];

  if (coreData['payDate'] && moment(coreData['payDate']).isValid()) {
    cmsData['paid_at'] = formatStandardTimeStamp(coreData['payDate']);
  }

  if (coreData['importDate'] && moment(coreData['importDate']).isValid()) {
    cmsData['imported_at'] = formatStandardTimeStamp(coreData['importDate']);
  }

  cmsData['ref_id'] = coreData['idNhanh'];
  cmsData['type'] = coreData['type'];
  cmsData['phone'] = coreData['customerPhone'];
  cmsData['address'] = coreData['address'];
  cmsData['vat_amount'] = coreData['vatAmount'];
  cmsData['vat_type'] = coreData['vatType'];
  cmsData['vat_code'] = coreData['vatCode'];
  cmsData['vat_at'] = coreData['vatDate'];
  cmsData['discount_type'] = coreData['discountType'];
  cmsData['is_auto'] = coreData['isAuto'];
  cmsData['related_store_code'] = coreData['relatedStockCode'];
  cmsData['order_code'] = coreData['purchaseOrderCode'];

  cmsData['detail_items'] = [];
  if (coreData['listDetail'] && coreData['listDetail'].length) {
    for (let detailItem of coreData['listDetail']) {
      let detailItemData = {};
      detailItemData['detail_appcore_id'] = detailItem['id'];
      detailItemData['product_appcore_id'] = detailItem['productId'];
      detailItemData['product_imei'] = detailItem['productImei'];
      detailItemData['product'] = detailItem['productName'];
      detailItemData['price'] = detailItem['unitPrice'];
      detailItemData['quantity'] = detailItem['quantity'];
      detailItemData['total'] = detailItem['totalAmount'];
      detailItemData['product_type'] = detailItem['productType'];
      detailItemData['stock_quantity'] = detailItem['totalQuantityInStock'];
      detailItemData['discount'] = detailItem['discount'];
      detailItemData['product_code'] = detailItem['productCode'];
      detailItemData['barcode'] = detailItem['barCode'];
      cmsData['detail_items'].push(detailItemData);
    }
  }
  return cmsData;
};
