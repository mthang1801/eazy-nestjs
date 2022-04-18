import { Table } from 'src/database/enums';

export const getOrderRevenueInDaySQL = `
 SELECT CAST(${Table.ORDERS}.created_date AS DATE) as date, SUM(total) as totalRevenue FROM ${Table.ORDERS}  GROUP BY CAST(${Table.ORDERS}.created_date AS DATE);
`;
export const getNumberOfOrdersInDaySQL = `
 SELECT CAST(${Table.ORDERS}.created_date AS DATE) as date, COUNT(order_id) as numberOfOrders FROM ${Table.ORDERS}  GROUP BY CAST(${Table.ORDERS}.created_date AS DATE);
`;
export const getCustomerInDaySQL = `
 SELECT CAST(${Table.USERS}.created_at AS DATE) as date, COUNT(user_id) as totalUser FROM ${Table.USERS} GROUP BY CAST(${Table.USERS}.created_at AS DATE);
`;
