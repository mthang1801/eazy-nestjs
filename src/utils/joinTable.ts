import { JoinTable, Table } from 'src/database/enums';

export const productFullJoiner = {
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
  ...productFullJoiner,
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

export const productByCategoryJoiner = {
  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCTS_CATEGORIES]: {
    fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_FEATURE_VALUES]: {
    fieldJoin: `${Table.PRODUCT_FEATURE_VALUES}.product_id`,
    rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
  },
};

export const productJoiner = {
  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
};

export const productGroupProductsJoiner = {
  [Table.PRODUCTS]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
};

export const productGroupJoiner = {
  [Table.PRODUCT_VARIATION_GROUP_FEATURES]: {
    fieldJoin: `${Table.PRODUCT_VARIATION_GROUP_FEATURES}.group_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUPS}.group_id`,
  },
  [Table.PRODUCT_VARIATION_GROUP_PRODUCTS]: {
    fieldJoin: `${Table.PRODUCT_VARIATION_GROUPS}.group_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.group_id`,
  },
  [Table.PRODUCTS_CATEGORIES]: {
    fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUP_PRODUCTS}.product_id`,
  },
  [Table.PRODUCTS]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.PRODUCT_VARIATION_GROUPS}.product_root_id`,
  },

  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
};

export const productInfoJoiner = {
  [Table.PRODUCT_DESCRIPTION]: {
    fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
  [Table.PRODUCT_PRICES]: {
    fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
    rootJoin: `${Table.PRODUCTS}.product_id`,
  },
};

export const userJoiner = {
  [JoinTable.leftJoin]: {
    [Table.USER_PROFILES]: {
      fieldJoin: 'user_id',
      rootJoin: 'user_id',
    },
  },
};

export const userSystemStoreJoiner = {
  [JoinTable.leftJoin]: {
    [Table.USER_PROFILES]: {
      fieldJoin: `${Table.USER_PROFILES}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
    [Table.USER_GROUP_LINKS]: {
      fieldJoin: `${Table.USER_GROUP_LINKS}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
    [Table.USER_GROUP_DESCRIPTIONS]: {
      fieldJoin: `${Table.USER_GROUP_DESCRIPTIONS}.usergroup_id`,
      rootJoin: `${Table.USER_GROUP_LINKS}.usergroup_id`,
    },
    [Table.STORE_LOCATIONS]: {
      fieldJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
      rootJoin: `${Table.USERS}.store_id`,
    },
    [Table.STORE_LOCATION_DESCRIPTIONS]: {
      fieldJoin: `${Table.STORE_LOCATION_DESCRIPTIONS}.store_location_id`,
      rootJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
    },
  },
};

export const statusJoiner = {
  [Table.STATUS_DESCRIPTION]: {
    fieldJoin: `${Table.STATUS_DESCRIPTION}.status_id`,
    rootJoin: `${Table.STATUS}.status_id`,
  },
  [Table.STATUS_DATA]: {
    fieldJoin: `${Table.STATUS_DATA}.status_id`,
    rootJoin: `${Table.STATUS}.status_id`,
  },
};

export const orderJoiner = {
  [JoinTable.leftJoin]: {
    [Table.STORE_LOCATIONS]: {
      fieldJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
      rootJoin: `${Table.ORDERS}.store_id`,
    },
    [Table.STORE_LOCATION_DESCRIPTIONS]: {
      fieldJoin: `${Table.STORE_LOCATIONS}.store_location_id`,
      rootJoin: `${Table.ORDERS}.store_id`,
    },
  },
};
