const CORE_API = 'http://mb.viendidong.com/core-api/v1';
const TESTER_API = 'http://mb.viendidong.com/web-tester/v1/api';

export const UPLOAD_IMAGE_API = `${CORE_API}/files/website`;

export const CREATE_CUSTOMER_API = `${CORE_API}/customers/cms`;

export const GET_CUSTOMERS_API = `${CORE_API}/customers`;

export const PUSH_ORDER_TO_APPCORE_API = `${CORE_API}/orders/cms/create`;

export const GET_ORDERS_FROM_APPCORE_API = `${CORE_API}/orders`;

export const UPDATE_ORDER_PAYMENT = (order_appcore_id) =>
  `${CORE_API}/orders/cms/${order_appcore_id}/update-payment`;

export const CANCEL_ORDER = (order_appcore_id) =>
  `${CORE_API}/orders/cms/${order_appcore_id}/cancel`;

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
  `${TESTER_API}/customer?page=${page}&size=${size}`;

export const GET_PRODUCTS_APPCORE_LIST = (page = 1, limit = 30) =>
  `${TESTER_API}/product?page=${page}&limit=${limit}`;

export const GET_PRODUCT_APPCORE_DETAIL = (product_appcore_id) =>
  `${TESTER_API}/product/${product_appcore_id}`;

export const CHECK_COUPON_API = `${CORE_API}/promotions/coupon/check`;

export const IMPORT_CATEGORIES_APPCORE = `${TESTER_API}/category`;

export const APPCORE_TOKEN =
  'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7Il9pZCI6MzAwMDA3OCwidXNlcm5hbWUiOiJuaGF0dGluX3ZpZXciLCJpc0FjdGl2ZSI6dHJ1ZSwibGlzdEZlYXR1cmUiOlsiUE9JTlRfVklFVyIsIk9SREVSX1ZJRVciLCJQUk9EVUNUX0FUVEFDSF9WSUVXIiwiVFJBREVfSU5fVklFVyIsIlBST0RVQ1RfUFJPTU9USU9OX1ZJRVciLCJESVNDT1VOVF9WSUVXIiwiVFJBREVfSU5fUFJPR1JBTV9WSUVXIiwiQ09VUE9OX1ZJRVciLCJWSVJUVUFMX1NUT0NLX1ZJRVciLCJPUkRFUl9JTlNFUlQiLCJUUkFERV9JTl9JTlNFUlQiLCJESVNDT1VOVF9JTlNFUlQiLCJDT1VQT05fSU5TRVJUIiwiUFJPRFVDVF9QUk9NT1RJT05fSU5TRVJUIiwiVFJBREVfSU5fUFJPR1JBTV9JTlNFUlQiLCJQUk9EVUNUX0FUVEFDSF9JTlNFUlQiLCJBUkVBX1ZJRVciLCJSRUdJT05fVklFVyIsIkNVU1RPTUVSX0NBUkVfVklFVyIsIkNVU1RPTUVSX0NBUkVfSU5TRVJUIiwiUE9JTlRfSU5TRVJUIiwiT1JERVJfVVBEQVRFIiwiVFJBREVfSU5fVVBEQVRFIiwiSU5TVEFMTE1FTlRfVklFVyIsIklOU1RBTExNRU5UX0lOU0VSVCIsIlZJUlRVQUxfU1RPQ0tfSU5TRVJUIiwiV0FSUkFOVFlfSU5TRVJUIiwiV0FSUkFOVFlfVklFVyIsIlNUT1JFX1ZJRVciLCJDVVNUT01FUl9WSUVXIiwiQ0FURV9WSUVXIiwiQ0FURV9JTlNFUlQiLCJCUkFORF9WSUVXIiwiQlJBTkRfSU5TRVJUIiwiUFJPVklERVJfVklFVyIsIlBST1ZJREVSX0lOU0VSVCIsIlBST1BFUlRZX1ZJRVciLCJQUk9EVUNUX1ZJRVciLCJQUk9QRVJUWV9JTlNFUlQiLCJCSUxMX1ZJRVciLCJQUk9EVUNUX0lOU0VSVCIsIkJJTExfSU5TRVJUIiwiQklMTF9VUERBVEUiXSwiZW1wbG95ZWVJZCI6MzAwMDE3NSwiam9iVGl0bGVJZCI6bnVsbH0sImlhdCI6MTY1MTU0MTIxMywiZXhwIjoxNjUyMTQ2MDEzfQ.hG95XM4l_BqHE6nB7AGLqA-7-0AbfBk624UVEL0fWF0';

export const IMPORT_ACCESSORY_CATEGORIES_API = `${TESTER_API}/productComponentCategory`;

export const FIND_TRADEIN_PROGRAM = (product_appcore_id) =>
  `${CORE_API}/trade-in/find-program-cms?productId=${product_appcore_id}`;
