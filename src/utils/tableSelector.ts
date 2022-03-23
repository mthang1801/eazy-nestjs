import { Table } from 'src/database/enums';

export const productFeatureValuesSelector = [
  `${Table.PRODUCT_FEATURE_VALUES}.feature_code`,
  `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
  `${Table.PRODUCT_FEATURE_VALUES}.variant_code`,
  `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
  `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.description`,
  'variant',
];

export const categorySelector = [
  `${Table.CATEGORIES}.category_id`,
  'level',
  'category',
  'slug',
];

export const getUserSystemByIdSelector = `*, ${Table.USERS}.*`;

export const getProductsListSelector = `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCT_PRICES}.price, ${Table.PRODUCTS}.product_type,${Table.PRODUCTS}.barcode, ${Table.PRODUCTS}.amount, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCTS}.product_code,  ${Table.PRODUCTS}.slug as productSlug, ${Table.PRODUCTS}.status, ${Table.PRODUCTS}.parent_product_id,  ${Table.PRODUCTS}.parent_product_appcore_id, ${Table.PRODUCTS}.product_appcore_id `;
