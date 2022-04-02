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
  [Table.CATEGORIES]: {
    fieldJoin: `${Table.CATEGORIES}.category_id`,
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

export const productsSearchOnOrderJoiner = {
  [JoinTable.leftJoin]: {
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
  },
};

export const productSearchJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
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

export const productJoiner = (params = {}) => {
  let isLeftJoin = true;
  let result = {
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
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  };

  if (params['sticker_id']) {
    isLeftJoin = false;
    result[Table.PRODUCT_STICKER] = {
      fieldJoin: `${Table.PRODUCT_STICKER}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    };
  }

  if (params['store_location_id']) {
    isLeftJoin = false;
    result[Table.PRODUCT_STORES] = {
      fieldJoin: `${Table.PRODUCT_STORES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    };
  }

  return { [JoinTable.innerJoin]: result };
};

export const productLeftJoiner = {
  [JoinTable.leftJoin]: {
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
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};
export const productByCategoryIdJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    },
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};

export const productStickersJoiner = {
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
  [Table.CATEGORIES]: {
    fieldJoin: `${Table.CATEGORIES}.category_id`,
    rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
  },
  [Table.PRODUCT_STICKER]: {
    fieldJoin: `${Table.PRODUCTS}.product_id`,
    rootJoin: `${Table.STICKER}.product_id`,
  },
};

export const userGroupJoiner = {
  [JoinTable.innerJoin]: {
    [Table.USER_GROUP_DESCRIPTIONS]: {
      fieldJoin: 'usergroup_id',
      rootJoin: 'usergroup_id',
    },
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

export const productCategoryJoiner = {
  [JoinTable.innerJoin]: {
    [Table.CATEGORIES]: {
      fieldJoin: 'category_id',
      rootJoin: 'category_id',
    },
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
      fieldJoin: `${Table.USER_PROFILES}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
    [Table.USER_LOYALTY]: {
      fieldJoin: `${Table.USER_LOYALTY}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
    [Table.USER_DATA]: {
      fieldJoin: `${Table.USER_DATA}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
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

export const categoryJoiner = {
  [JoinTable.innerJoin]: {
    [Table.CATEGORY_DESCRIPTIONS]: {
      fieldJoin: 'category_id',
      rootJoin: 'category_id',
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

export const orderDetailsJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.ORDER_DETAILS}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.ORDER_DETAILS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.ORDER_DETAILS}.product_id`,
    },
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

export const bannerJoiner = {
  [JoinTable.leftJoin]: {
    [Table.BANNER_DESCRIPTIONS]: {
      fieldJoin: `${Table.BANNER_DESCRIPTIONS}.banner_id`,
      rootJoin: `${Table.BANNER}.banner_id`,
    },
  },
};

export const bannerItemsJoiner = {
  [JoinTable.leftJoin]: {
    [Table.BANNER_LOCATION_DESCRIPTION]: {
      fieldJoin: `${Table.BANNER_LOCATION_DESCRIPTION}.location_id`,
      rootJoin: `${Table.BANNER_ITEM}.location_id`,
    },
  },
};

export const shippingJoiner = {
  [JoinTable.innerJoin]: {
    [Table.SHIPPINGS_DESCRIPTION]: {
      fieldJoin: 'shipping_id',
      rootJoin: 'shipping_id',
    },
  },
};

export const shippingServiceJoiner = {
  [JoinTable.innerJoin]: {
    [Table.SHIPPING_SERVICE_DESCRIPTION]: {
      fieldJoin: 'service_id',
      rootJoin: 'service_id',
    },
  },
};

export const cartJoiner = {
  [JoinTable.innerJoin]: {
    [Table.CART_ITEMS]: {
      fieldJoin: `${Table.CART_ITEMS}.cart_id`,
      rootJoin: `${Table.CART}.cart_id`,
    },
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.CART_ITEMS}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};

export const catalogCategoryJoiner = {
  [JoinTable.innerJoin]: {
    [Table.CATALOG_CATEGORY_DESCRIPTIONS]: {
      fieldJoin: 'catalog_id',
      rootJoin: 'catalog_id',
    },
  },
};

export const productFeatureJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
      fieldJoin: 'feature_id',
      rootJoin: 'feature_id',
    },
  },
};

export const productFeatureVariantJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
      fieldJoin: 'variant_id',
      rootJoin: 'variant_id',
    },
  },
};

export const storesLocationJoiner = {
  [JoinTable.innerJoin]: {
    [Table.STORE_LOCATION_DESCRIPTIONS]: {
      fieldJoin: 'store_location_id',
      rootJoin: 'store_location_id',
    },
  },
};

export const productStickerJoiner = {
  [JoinTable.innerJoin]: {
    [Table.STICKER]: {
      fieldJoin: `${Table.STICKER}.sticker_id`,
      rootJoin: `${Table.PRODUCT_STICKER}.sticker_id`,
    },
  },
};

export const storeLocationJoiner = {
  [JoinTable.innerJoin]: {
    [Table.STORE_LOCATION_DESCRIPTIONS]: {
      fieldJoin: 'store_location_id',
      rootJoin: 'store_location_id',
    },
  },
};

export const productPromotionAccessoriesJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PROMOTION_ACCESSORY]: {
      fieldJoin: `${Table.PRODUCT_PROMOTION_ACCESSORY}.accessory_id`,
      rootJoin: `${Table.PROMOTION_ACCESSORY}.accessory_id`,
    },
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
  },
};
