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

export const getProductsAmountInStores = (
  sortBy,
) => `SELECT * FROM ddv_products_categories AS a LEFT JOIN ddv_product_stores AS b ON a.product_id = b.product_id 
LEFT JOIN ddv_product_descriptions AS d ON a.product_id = d.product_id
LEFT JOIN ddv_store_locations AS c ON b.store_location_id = c.store_location_id 
WHERE a.category_id = 77 AND amount > 0
ORDER BY amount ${(sortBy = 0 ? 'ASC' : 'DESC')}
LIMIT 10
OFFSET 0;`;
