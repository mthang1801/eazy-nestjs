import * as moment from 'moment';
export const payooRefer =
  process.env.PAYOO_REFER || 'https://ddv-fe-ecom.vercel.app';
export const payooChecksum =
  process.env.PAYOO_CHECKSUM || 'NGE5ZGU0ZDdkY2ViNTMxNjU5ZWJhNTE5ZDc2N2JhNjA=';
export const payooAPIUserName =
  process.env.PAYOO_APIUsername || 'SB_DiDongViet_BizAPI';
export const payooAPIPassword =
  process.env.PAYOO_APIPassword || '500x0R6z05+uChQE';
export const payooAPISignature =
  process.env.PAYOO_APISignature ||
  'T9zlnsBKxceTZQdgswOAaLQTVwjFJ4l+7OhFT6sAODUrQcoUm5lKlKkIW8DbmW0g';
export const payooShopTitle = process.env.PAYOO_ShopTitle || 'DiDongViet';
export const payooShopId = process.env.PAYOO_ShopID || 11689;
export const payooBusinessName =
  process.env.PAYOO_BusinessUsername || 'SB_DiDongViet';

export const webDomain =
  process.env.WEB_DOMAIN || 'https://ddv-fe-ecom.vercel.app';
export const payooPaynowURL =
  process.env.PAYOO_PAYNOW_URL ||
  'https://newsandbox.payoo.com.vn/v2/paynow/order/create';

export const payooInstallmentURL =
  process.env.PAYOO_PAYNOW_URL ||
  'https://newsandbox.payoo.com.vn/v2/installment/order/create';

export const payooPaymentNotifyURL =
  process.env.PAYOO_NOTIFY_URL ||
  'https://ddvwsdev.ntlogistics.vn/be/v1/payment/payoo/payment-result';

export const shippingDate = 3 * 60 * 60 * 24 * 1000;
export const validTime = moment(
  new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
).format('YYYYMMDDHHmmss');