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

export const productVariationGroupJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_VARIATION_GROUPS}.product_root_id`,
    },
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

export const categoryFeaturesSetJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_FEATURE_DESCRIPTIONS]: {
      fieldJoin: `${Table.PRODUCT_FEATURE_DESCRIPTIONS}.feature_id`,
      rootJoin: `${Table.CATEGORY_FEATURES}.feature_id`,
    },
  },
};

export const featureVariantJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS]: {
      fieldJoin: `${Table.PRODUCT_FEATURES_VARIANTS}.variant_id`,
      rootJoin: `${Table.PRODUCT_FEATURES_VARIANT_DESCRIPTIONS}.variant_id`,
    },
  },
};

export const productPriceJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
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
  let result = {};
  let rootJoiner = `${Table.PRODUCTS}.product_id`;
  //Thứ tự Ưu tien category_id, store, sticker
  if (params['store_location_id']) {
    rootJoiner = `${Table.PRODUCT_STORES}.product_id`;
    result[Table.PRODUCTS] = {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: rootJoiner,
    };
  }

  if (params['category_id']) {
    if (params['store_location_id']) {
      result[Table.PRODUCTS_CATEGORIES] = {
        fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
        rootJoin: rootJoiner,
      };
    } else {
      rootJoiner = `${Table.PRODUCTS_CATEGORIES}.product_id`;

      result[Table.PRODUCTS] = {
        fieldJoin: `${Table.PRODUCTS}.product_id`,
        rootJoin: rootJoiner,
      };
    }
  }

  if (params['sticker_id']) {
    if (params['store_location_id'] || params['category_id']) {
      result[Table.PRODUCT_STICKER] = {
        fieldJoin: `${Table.PRODUCT_STICKER}.product_id`,
        rootJoin: rootJoiner,
      };
    } else {
      rootJoiner = `${Table.PRODUCT_STICKER}.product_id`;
      result[Table.PRODUCTS] = {
        fieldJoin: `${Table.PRODUCTS}.product_id`,
        rootJoin: rootJoiner,
      };
    }
  }

  if (params['catalog_category_id']) {
    if (
      params['store_location_id'] ||
      params['category_id'] ||
      params['sticker_id']
    ) {
      result[Table.CATALOG_CATEGORIES] = {
        fieldJoin: `${Table.CATALOG_CATEGORIES}.catalog_id`,
        rootJoin: `${Table.PRODUCTS}.catalog_category_id`,
      };
    } else {
      result[Table.PRODUCTS] = {
        fieldJoin: `${Table.PRODUCTS}.catalog_category_id`,
        rootJoin: `${Table.CATALOG_CATEGORIES}.catalog_id`,
      };
    }
  }

  if (params['variant_id']) {
    if (
      params['store_location_id'] ||
      params['category_id'] ||
      params['sticker_id'] ||
      params['catalog_category_id']
    ) {
      result[Table.PRODUCT_FEATURE_VALUES] = {
        fieldJoin: `${Table.PRODUCT_FEATURE_VALUES}.product_id`,
        rootJoin: `${Table.PRODUCTS}.product_id`,
      };
    } else {
      rootJoiner = `${Table.PRODUCT_FEATURE_VALUES}.product_id`;
      result[Table.PRODUCTS] = {
        fieldJoin: `${Table.PRODUCTS}.product_id`,
        rootJoin: rootJoiner,
      };
    }
  }

  result = {
    ...result,
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: rootJoiner,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: rootJoiner,
    },
  };

  return { [JoinTable.join]: result };
};

export const productsListByCategoryJoiner = (params = {}) => {
  let rootJoiner = `${Table.PRODUCTS_CATEGORIES}.product_id`;
  let result = {};

  result = {
    ...result,
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: rootJoiner,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: rootJoiner,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: rootJoiner,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
  };

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

export const tradeinDetailLeftJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.TRADEIN_PROGRAM_DETAIL}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.TRADEIN_PROGRAM_DETAIL}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.TRADEIN_PROGRAM_DETAIL}.product_id`,
    },
    [Table.PRODUCTS_CATEGORIES]: {
      fieldJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
      rootJoin: `${Table.TRADEIN_PROGRAM_DETAIL}.product_id`,
    },
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};

export const productGroupJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_VARIATION_GROUPS]: {
      fieldJoin: `${Table.PRODUCT_VARIATION_GROUPS}.product_root_id`,
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

export const productPromotionAccessorytLeftJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id`,
    },
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

export const productPromotionAccessoryJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_PROMOTION_ACCESSORY]: {
      fieldJoin: `${Table.PRODUCT_PROMOTION_ACCESSORY}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
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
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
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

export const productGroupProductsJoiner = {
  [JoinTable.leftJoin]: {
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
  },
};

export const productCategoryJoiner = {
  [JoinTable.innerJoin]: {
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
  },
};

export const productListInCategoryJoiner = {
  [JoinTable.leftJoin]: {
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORIES}.category_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.category_id`,
    },
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS_CATEGORIES}.product_id`,
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
export const productDescriptionJoiner = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
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

export const userPaymentJoiner = {
  [JoinTable.leftJoin]: {
    [Table.USER_PROFILES]: {
      fieldJoin: `${Table.USER_PROFILES}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
  },
};

export const creatorJoiner = {
  [JoinTable.innerJoin]: {
    [Table.USER_PROFILES]: {
      fieldJoin: `${Table.USER_PROFILES}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
    },
  },
};

export const userLoyaltyJoiner = {
  [JoinTable.leftJoin]: {
    [Table.USERS]: {
      fieldJoin: `${Table.USERS}.user_id`,
      rootJoin: `${Table.USER_LOYALTY}.user_id`,
    },
    [Table.USER_PROFILES]: {
      fieldJoin: `${Table.USER_PROFILES}.user_id`,
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
    [Table.USER_ROLES]: {
      fieldJoin: `${Table.USER_ROLES}.user_id`,
      rootJoin: `${Table.USERS}.user_id`,
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

export const orderDetailsJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_appcore_id`,
      rootJoin: `${Table.ORDER_DETAILS}.product_appcore_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
  },
};

export const orderJoiner = {
  [JoinTable.leftJoin]: {
    [Table.ORDER_PAYMENTS]: {
      fieldJoin: `${Table.ORDER_PAYMENTS}.order_id`,
      rootJoin: `${Table.ORDERS}.order_id`,
    },
  },
};

export const bannerJoiner = {
  [JoinTable.leftJoin]: {
    [Table.BANNER_LOCATION_DESCRIPTION]: {
      fieldJoin: `${Table.BANNER_LOCATION_DESCRIPTION}.location_id`,
      rootJoin: `${Table.BANNER}.page_location_id`,
    },
    [Table.BANNER_TARGET_DESCRIPTION]: {
      fieldJoin: `${Table.BANNER_TARGET_DESCRIPTION}.target_id`,
      rootJoin: `${Table.BANNER}.page_target_id`,
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

export const cartPaymentJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.cart_id`,
      rootJoin: `${Table.CART_ITEMS}.cart_id`,
    },
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.CART_ITEMS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
  },
};

export const cartItemPriceJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
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

export const flashSaleProductJoiner = {
  [JoinTable.leftJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.FLASH_SALE_PRODUCTS}.product_id`,
    },
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

export const flashSaleProductJoinerFE = {
  [JoinTable.innerJoin]: {
    [Table.PRODUCTS]: {
      fieldJoin: `${Table.PRODUCTS}.product_id`,
      rootJoin: `${Table.FLASH_SALE_PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_DESCRIPTION]: {
      fieldJoin: `${Table.PRODUCT_DESCRIPTION}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
    [Table.PRODUCT_PRICES]: {
      fieldJoin: `${Table.PRODUCT_PRICES}.product_id`,
      rootJoin: `${Table.PRODUCTS}.product_id`,
    },
  },
};

export const shippingFeeLocationsJoiner = {
  [JoinTable.innerJoin]: {
    [Table.SHIPPING_FEE]: {
      fieldJoin: `${Table.SHIPPING_FEE}.shipping_fee_id`,
      rootJoin: `${Table.SHIPPING_FEE_LOCATION}.shipping_fee_id`,
    },
  },
};

export const logJoiner = {
  [JoinTable.innerJoin]: {
    [Table.LOG_MODULE]: {
      fieldJoin: `${Table.LOG_MODULE}.module_id`,
      rootJoin: `${Table.LOG}.module_id`,
    },
    [Table.LOG_SOURCE]: {
      fieldJoin: `${Table.LOG_SOURCE}.source_id`,
      rootJoin: `${Table.LOG}.source_id`,
    },
  },
};

export const tradeinOldReceiptJoiner = {
  [JoinTable.rightJoin]: {
    [Table.TRADEIN_OLD_RECEIPT_DETAIL]: {
      fieldJoin: `${Table.TRADEIN_OLD_RECEIPT_DETAIL}.old_receipt_id`,
      rootJoin: `${Table.TRADEIN_OLD_RECEIPT}.old_receipt_id`,
    },
  },
};

export const userRoleJoiner = {
  [JoinTable.innerJoin]: {
    [Table.ROLE_FUNC]: {
      fieldJoin: `${Table.ROLE_FUNC}.role_funct_id`,
      rootJoin: `${Table.USER_ROLES}.role_funct_id`,
    },
  },
};

export const categoryFeatureJoiner = {
  [JoinTable.leftJoin]: {
    [Table.CATEGORIES]: {
      fieldJoin: `${Table.CATEGORY_FEATURES}.category_id`,
      rootJoin: `${Table.CATEGORIES}.category_id`,
    },
    [Table.PRODUCT_FEATURES]: {
      fieldJoin: `${Table.PRODUCT_FEATURES}.feature_id`,
      rootJoin: `${Table.CATEGORY_FEATURES}.feature_id`,
    },
  },
};

export const roleFunctJoiner = {
  [JoinTable.leftJoin]: {
    [Table.FUNC]: {
      fieldJoin: `${Table.FUNC}.funct_id`,
      rootJoin: `${Table.ROLE_FUNC}.funct_id`,
    },
  },
};
export const userRoleFunctJoiner = {
  [JoinTable.leftJoin]: {
    [Table.USER_ROLES]: {
      fieldJoin: `${Table.USER_ROLES}.role_id`,
      rootJoin: `${Table.ROLE_FUNC}.role_id`,
    },
    [Table.FUNC]: {
      fieldJoin: `${Table.FUNC}.funct_id`,
      rootJoin: `${Table.ROLE_FUNC}.funct_id`,
    },
  },
};

export const tradeinCriteriaJoiner = {
  [JoinTable.innerJoin]: {
    [Table.TRADEIN_PROGRAM_CRITERIA_DETAIL]: {
      fieldJoin: `${Table.TRADEIN_PROGRAM_CRITERIA_DETAIL}.criteria_id`,
      rootJoin: `${Table.TRADEIN_PROGRAM_CRITERIA}.criteria_id`,
    },
  },
};
