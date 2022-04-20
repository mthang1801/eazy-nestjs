import { Table } from 'src/database/enums';
import { IsNull } from 'src/database/operators/operators';

export const parentProductCondition = [
  { [`${Table.PRODUCTS}.parent_product_appcore_id`]: 0 },
  { [`${Table.PRODUCTS}.parent_product_appcore_id`]: IsNull() },
];

export const countProduct = `COUNT(${Table.PRODUCTS}.product_id) as total`;
export const countDistinctProduct = `COUNT(DISTINCT(${Table.PRODUCTS}.product_id)) as total`;
export const countDistinctProductCategory = `COUNT(DISTINCT(${Table.PRODUCTS_CATEGORIES}.product_id)) as total`;
