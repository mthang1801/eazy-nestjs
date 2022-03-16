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
