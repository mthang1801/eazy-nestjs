export const sqlReportTotalProductAmountFromStores =
  'SELECT product_id, SUM(amount) as total FROM ddv_product_stores GROUP BY product_id';

export const sqlReportTotalProductsInCategories = (
  category_ids,
) => `SELECT COUNT(product_id) AS total
  FROM ddv_products_categories
  WHERE category_id IN (${category_ids.join(',')})`;
