const CORE_API = 'http://mb.viendidong.com/core-api/v1';

export const UPLOAD_IMAGE_API = `${CORE_API}/files/website`;

export const CREATE_CUSTOMER_API = `${CORE_API}/customers/cms`;

export const GET_CUSTOMERS_API = `${CORE_API}/customers`;

export const PUSH_ORDER_TO_APPCORE_API = `${CORE_API}/orders/cms/create`;

export const GET_ORDERS_FROM_APPCORE_API = `${CORE_API}/orders`;

export const GET_ORDER_BY_ID_FROM_APPCORE_API = (order_id) =>
  `${CORE_API}/orders?id=${order_id}`;

export const GET_PRODUCTS_STORES_API = (product_id) =>
  `${CORE_API}/product-stocks/product/${product_id}`;

export const GET_PRODUCTS_COMBO_STORES_API = (product_id) =>
  `${CORE_API}/product-stocks/product-combo/${product_id}`;

export const GET_PRODUCTS_LIST_APPCORE_BY_PAGE_API = (pageNumber) =>
  `${CORE_API}/products?page=${pageNumber}`;

export const GET_STORES_API = `${CORE_API}/depots`;

export const IMPORT_CUSTOMERS_API = (page = 1, size = 20) =>
  `http://mb.viendidong.com/web-tester/v1/api/customer?page=${page}&size=${size}`;

export const GET_PRODUCTS_APPCORE_LIST = (page = 1, limit = 30) =>
  `http://mb.viendidong.com/web-tester/v1/api/product?page=${page}&limit=${limit}`;

export const GET_PRODUCT_APPCORE_DETAIL = (product_appcore_id) =>
  `http://mb.viendidong.com/web-tester/v1/api/product/${product_appcore_id}`;
