export const sqlReportTotalProductAmountFromStores =
  'SELECT product_id, SUM(amount) as total FROM ddv_product_stores GROUP BY product_id';
