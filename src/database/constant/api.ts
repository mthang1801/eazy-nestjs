export const UPLOAD_IMAGE_API =
  'http://mb.viendidong.com/core-api/v1/files/website';
export const CREATE_CUSTOMER_API =
  'http://mb.viendidong.com/core-api/v1/customers/cms';
export const GET_CUSTOMERS_API =
  'http://mb.viendidong.com/core-api/v1/customers';
export const PUSH_ORDER_TO_APPCORE_API =
  'http://mb.viendidong.com/core-api/v1/orders/cms/create';
export const GET_ORDERS_FROM_APPCORE_API =
  'http://mb.viendidong.com/core-api/v1/orders';

export const GET_PRODUCTS_STORES_API = (product_id) =>
  `http://mb.viendidong.com/core-api/v1/product-stocks/product/${product_id}`;
