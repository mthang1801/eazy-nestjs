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

export const getProductsListSelector = `DISTINCT(${Table.PRODUCTS}.product_id), ${Table.PRODUCT_PRICES}.price, ${Table.PRODUCTS}.product_type,${Table.PRODUCTS}.barcode, ${Table.PRODUCTS}.amount, ${Table.PRODUCT_DESCRIPTION}.*, ${Table.PRODUCTS}.product_code,  ${Table.PRODUCTS}.slug as productSlug, ${Table.PRODUCTS}.status, ${Table.PRODUCTS}.parent_product_id,  ${Table.PRODUCTS}.parent_product_appcore_id, ${Table.PRODUCTS}.product_appcore_id, ${Table.CATEGORIES}.slug as categorySlug, ${Table.PRODUCTS}.product_status `;

export const getProductsListSelectorBE = [
  `DISTINCT(${Table.PRODUCTS}.product_id)`,
  `${Table.PRODUCT_PRICES}.price`,
  `${Table.PRODUCTS}.product_type`,
  `${Table.PRODUCTS}.barcode`,
  `${Table.PRODUCTS}.amount`,
  `${Table.PRODUCTS}.thumbnail`,
  `${Table.PRODUCTS}.product_function`,
  `${Table.PRODUCT_DESCRIPTION}.*`,
  `${Table.PRODUCT_PRICES}.*`,
  `${Table.PRODUCTS}.product_code`,
  `${Table.PRODUCTS}.slug as productSlug`,
  `${Table.PRODUCTS}.status`,
  `${Table.PRODUCTS}.parent_product_id`,
  `${Table.PRODUCTS}.parent_product_appcore_id`,
  `${Table.PRODUCTS}.product_appcore_id`,
  `${Table.PRODUCTS}.product_status`,
];

export const getDetailProductsListSelectorFE = [
  ...getProductsListSelectorBE,
  `${Table.CATEGORIES}.slug`,
];

export const getProductByIdentifierSelector = [
  '*',
  `${Table.PRODUCT_DESCRIPTION}.*`,
  `${Table.PRODUCTS}.status`,
  `${Table.PRODUCTS}.slug as productSlug`,
  `${Table.PRODUCT_DESCRIPTION}.url_media as productUrlMedia`,
  `${Table.CATEGORIES}.slug as categorySlug`,
  `${Table.PRODUCT_DESCRIPTION}.meta_keywords as productMetaKeywords`,
  `${Table.PRODUCT_DESCRIPTION}.meta_image as productMetaImage`,
  `${Table.PRODUCT_DESCRIPTION}.meta_description as productMetaDescription`,
  `${Table.PRODUCT_DESCRIPTION}.page_title as productPageTitle`,
  `${Table.PRODUCTS}.redirect_url as productRedirectUrl`,
];

export const getProductAccessorySelector = [
  `DISTINCT(${Table.PRODUCTS}.product_id)`,
  `${Table.PRODUCT_DESCRIPTION}.*`,
  `${Table.PRODUCTS}.product_code`,
  `${Table.PRODUCT_PRICES}.*`,
  `${Table.PRODUCTS}.amount`,
  `${Table.PRODUCTS}.thumbnail`,
];

export const productDetailSelector = [
  `*`,
  `${Table.PRODUCTS}.*`,
  `${Table.PRODUCT_DESCRIPTION}.*`,
  `${Table.CATEGORIES}.slug as categorySlug`,
];
