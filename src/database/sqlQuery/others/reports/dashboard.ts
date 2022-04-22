import { sortBy } from 'lodash';
import { Table } from 'src/database/enums';

export const getOrderRevenueInDaySQL = `
 SELECT CAST(${Table.ORDERS}.created_date AS DATE) as date, SUM(total) as totalRevenue FROM ${Table.ORDERS}  GROUP BY CAST(${Table.ORDERS}.created_date AS DATE);
`;
export const getNumberOfOrdersInDaySQL = `
 SELECT CAST(${Table.ORDERS}.created_date AS DATE) as date, COUNT(order_id) as numberOfOrders FROM ${Table.ORDERS}  GROUP BY CAST(${Table.ORDERS}.created_date AS DATE);
`;
export const getCustomerInDaySQL = `
 SELECT CAST(${Table.USERS}.created_at AS DATE) as date, COUNT(user_id) as totalUsers FROM ${Table.USERS} GROUP BY CAST(${Table.USERS}.created_at AS DATE);
`;

export const getNumberOrderMonthlyByYear = (year = new Date().getFullYear()) =>
  `SELECT created_year as year, created_month as month, total FROM ( SELECT created_year, created_month, COUNT(order_id) as total FROM (SELECT *, MONTH(created_date) AS created_month , YEAR(created_date) AS created_year	FROM ddv_orders) AS report GROUP BY created_year, created_month HAVING created_year = ${year} ) AS result `;

export const getNumberCustomersMonthlyByYear = (
  year = new Date().getFullYear(),
) =>
  `SELECT created_year AS year, created_month AS month, total FROM ( SELECT created_year, created_month, COUNT(user_id) AS total FROM (SELECT *, MONTH(created_at) AS created_month , YEAR(created_at) AS created_year FROM ddv_users) AS report GROUP BY created_year, created_month HAVING created_year = ${year} ) AS result `;

export const getProductsAmountInStores = (sortBy) =>
  `SELECT * FROM ddv_products_categories AS a LEFT JOIN ddv_product_stores AS b ON a.product_id = b.product_id LEFT JOIN ddv_product_descriptions AS d ON a.product_id = d.product_id LEFT JOIN ddv_store_locations AS c ON b.store_location_id = c.store_location_id  WHERE a.category_id = 77 AND amount > 0 ORDER BY amount ${(sortBy =
    0 ? 'ASC' : 'DESC')} LIMIT 10 OFFSET 0;`;

export const getProductsBestSeller = (start_at, end_at, type = 1, sortBy = 1) =>
  `SELECT a.product_id , a.created_at, c.product, ${
    type == 1
      ? 'SUM(a.amount * a.price) AS result'
      : 'COUNT(a.product_id) as result'
  } FROM ddv_order_details AS a  LEFT JOIN ddv_product_descriptions AS b ON a.product_id = b.product_id LEFT JOIN ddv_product_descriptions AS c ON a.product_id = c.product_id  GROUP BY a.product_id  HAVING a.created_at BETWEEN '${start_at}' AND '${end_at}' AND result > 0 ORDER BY result  ${
    sortBy == 1 ? 'DESC' : 'ASC'
  } LIMIT 10  OFFSET 0; `;
