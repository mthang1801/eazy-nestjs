export const MOMO_PARTNER_CODE = 'MOMOIOLQ20220512';
export const MOMO_PARTNER_NAME = 'CÔNG TY TNHH CÔNG NGHỆ VÀ TRUYỀN THÔNG VMG';
export const MOMO_ACCESS_KEY = 'PPA5Umco5oxEW1b4';
export const MOMO_SECRET_KEY = 'HqD7D0lYGxmL7NPSeQWDzemcAlgp69jA';
export const MOMO_API_ENPOINT =
  'https://test-payment.momo.vn/gw_payment/transactionProcessor';
export const MOMO_PAYMENT =
  'https://test-payment.momo.vn/v2/gateway/api/create';
export const momoRequestId = MOMO_PARTNER_CODE + Date.now();
export const momoOrderId = momoRequestId;
export const momoOrderInfo = 'pay with MoMo';
export const momoRedirectUrl = (callbackUrl) =>
  `https://ddv-fe-ecom.vercel.app/${callbackUrl}`;
export const momoIpnUrl =
  'https://ddvwsdev.ntlogistics.vn/be/v1/payment/momo/payment-result';
export const momoRequestType = 'captureWallet';
export const momoExtraData = ''; //pass empty value if your merchant does not have stores
