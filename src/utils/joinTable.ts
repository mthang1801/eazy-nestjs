import { JoinTable, Table } from 'src/database/enums';

export const productJoiner = {
  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCTS_CATEGORIES]: {
    fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
    fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_VARIATION_GROUPS]: {
    fieldJoin: `${Table.PRODUCT_VARIATION_GROUPS}.group_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
  },
  [Table.PRODUCT_SALES]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCT_SALES}.product_id`,
  },
  [Table.PRODUCTS_CATEGORIES]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
  },
  [Table.CATEGORY_DESCRIPTIONS]: {
    fieldJoin: `${Table.CATEGORY_DESCRIPTIONS}.category_id`,
    rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
  },
};

export const productFeaturesJoiner = {
  [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
    fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
  },

  [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
    fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
  },
};

export const productFamilyJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_PRICES}.product_id`,
    },
    [Table.PRODUCT_SALES]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_SALES}.product_id`,
    },
  },
};

export const productFeaturesByCategory = {
  ...productJoiner,
  [Table.PRODUCT_FEATURE_VALUES]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.product_id`,
  },
  [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
    fieldJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
  },
  [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
    fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
  },
  [Table.PRODUCT_FEATURES]: {
    fieldJoin: `${Table.PRODUCT_FEATURES}.feature_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.feature_id`,
  },
  [Table.PRODUCT_FEATURES_VARIANTS]: {
    fieldJoin: `${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`,
    rootJoin: `${Table.PRODUCT_FEATURE_VALUES}.variant_id`,
  },
};
